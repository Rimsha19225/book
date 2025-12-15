"""Learning Path Service for the Physical AI & Humanoid Robotics Textbook application."""
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from ..models.learning_session import LearningSession
from ..models.student import Student
from ..models.module import Module
from ..models.content import TextbookContent
from uuid import UUID
import json


def create_learning_session(db: Session, student_id: str, modules_count: int = 6) -> LearningSession:
    """Create a new learning session for a student."""
    learning_session = LearningSession(
        student_id=UUID(student_id),
        total_modules=modules_count,
        completed_modules=0,
        completed_chapters=json.dumps([]),  # Start with empty list of completed chapters
        time_spent_seconds=0
    )
    db.add(learning_session)
    db.commit()
    db.refresh(learning_session)
    return learning_session


def get_learning_session(db: Session, session_id: str) -> Optional[LearningSession]:
    """Get a learning session by its ID."""
    return db.query(LearningSession).filter(LearningSession.session_id == UUID(session_id)).first()


def get_student_learning_sessions(db: Session, student_id: str) -> List[LearningSession]:
    """Get all learning sessions for a student."""
    return db.query(LearningSession).filter(LearningSession.student_id == UUID(student_id)).all()


def update_learning_progress(
    db: Session,
    session_id: str,
    current_module: Optional[str] = None,
    current_chapter: Optional[str] = None,
    progress_percentage: Optional[float] = None,
    completed_chapters: Optional[List[str]] = None
) -> Optional[LearningSession]:
    """Update the learning progress for a session."""
    session = db.query(LearningSession).filter(LearningSession.session_id == UUID(session_id)).first()
    if not session:
        return None

    if current_module is not None:
        session.current_module = current_module
    if current_chapter is not None:
        session.current_chapter = current_chapter
    if progress_percentage is not None:
        session.progress_percentage = progress_percentage
    if completed_chapters is not None:
        session.completed_chapters = json.dumps(completed_chapters)

    # Calculate completed modules based on progress
    if progress_percentage is not None:
        # Estimate completed modules based on progress (this is a simple calculation)
        estimated_completed = int((progress_percentage / 100) * session.total_modules)
        session.completed_modules = min(estimated_completed, session.total_modules)

    db.commit()
    db.refresh(session)
    return session


def get_student_progress(db: Session, student_id: str) -> Dict[str, Any]:
    """Get the overall progress for a student."""
    sessions = get_student_learning_sessions(db, student_id)

    if not sessions:
        return {
            'student_id': student_id,
            'total_sessions': 0,
            'current_module': None,
            'current_chapter': None,
            'overall_progress': 0.0,
            'completed_modules': 0,
            'total_modules': 0,
            'time_spent_seconds': 0
        }

    # Get the most recent active session
    active_session = sessions[-1]  # Most recent session

    # Calculate overall progress based on all sessions
    total_progress = sum(session.progress_percentage for session in sessions)
    avg_progress = total_progress / len(sessions) if sessions else 0.0

    completed_chapters = []
    if active_session.completed_chapters:
        try:
            completed_chapters = json.loads(active_session.completed_chapters)
        except json.JSONDecodeError:
            completed_chapters = []

    return {
        'student_id': student_id,
        'total_sessions': len(sessions),
        'current_module': active_session.current_module,
        'current_chapter': active_session.current_chapter,
        'overall_progress': round(avg_progress, 2),
        'completed_modules': active_session.completed_modules,
        'total_modules': active_session.total_modules,
        'completed_chapters': completed_chapters,
        'time_spent_seconds': active_session.time_spent_seconds
    }


def mark_chapter_completed(db: Session, session_id: str, module_id: str, chapter_id: str) -> bool:
    """Mark a chapter as completed."""
    session = db.query(LearningSession).filter(LearningSession.session_id == UUID(session_id)).first()
    if not session:
        return False

    # Get current completed chapters
    completed_chapters = []
    if session.completed_chapters:
        try:
            completed_chapters = json.loads(session.completed_chapters)
        except json.JSONDecodeError:
            completed_chapters = []

    # Add the new chapter if not already in the list
    chapter_key = f"{module_id}:{chapter_id}"
    if chapter_key not in completed_chapters:
        completed_chapters.append(chapter_key)

    # Update the session with the new list
    session.completed_chapters = json.dumps(completed_chapters)

    # Update progress based on completed chapters
    # This is a simplified calculation - in a real app, you'd have more complex logic
    total_chapters = _get_total_chapters_count(db)
    if total_chapters > 0:
        progress = min(100.0, (len(completed_chapters) / total_chapters) * 100)
        session.progress_percentage = progress

    db.commit()
    return True


def _get_total_chapters_count(db: Session) -> int:
    """Helper function to get the total number of chapters in the system."""
    # This would typically come from a configuration or be calculated based on modules
    # For now, we'll return a reasonable estimate
    return 24  # Assuming about 4 chapters per module * 6 modules (welcome, intro, 4 main modules)


def get_learning_path(db: Session, student_id: str) -> Dict[str, Any]:
    """Get the complete learning path for a student."""
    student_progress = get_student_progress(db, student_id)

    # Get all modules to build the learning path
    modules = db.query(Module).order_by(Module.order_index).all()
    modules_info = []

    for module in modules:
        # Get chapters for this module
        chapters = db.query(TextbookContent).filter(
            TextbookContent.module_id == module.module_id
        ).all()

        module_chapters = []
        for chapter in chapters:
            chapter_completed = f"{module.module_id}:{chapter.chapter_id}" in student_progress.get('completed_chapters', [])
            module_chapters.append({
                'chapter_id': chapter.chapter_id,
                'title': chapter.title,
                'content_type': chapter.content_type,
                'completed': chapter_completed
            })

        module_completed = all(chapter['completed'] for chapter in module_chapters)
        modules_info.append({
            'module_id': module.module_id,
            'title': module.title,
            'description': module.description,
            'order_index': module.order_index,
            'estimated_duration_hours': module.estimated_duration_hours,
            'chapters': module_chapters,
            'completed': module_completed
        })

    return {
        'student_id': student_id,
        'overall_progress': student_progress['overall_progress'],
        'current_module': student_progress['current_module'],
        'current_chapter': student_progress['current_chapter'],
        'modules': modules_info
    }