"""Content API routes for the Physical AI & Humanoid Robotics Textbook application."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database.connection import get_db
from ..api.models.response_models import GetModulesResponse, GetChaptersResponse, QueryResponse
from ..services.content_service import get_all_modules, get_chapters_for_module
from ..services.rag_service import query_content
from ..services.learning_path_service import get_student_progress, get_learning_path
from ..services.translation_service import translate_content

router = APIRouter()


@router.get("/modules", response_model=GetModulesResponse)
def get_modules(db: Session = Depends(get_db)):
    """Get list of available modules."""
    try:
        modules = get_all_modules(db)
        return GetModulesResponse(modules=modules)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving modules: {str(e)}")


@router.get("/modules/{module_id}/chapters", response_model=GetChaptersResponse)
def get_chapters(module_id: str, db: Session = Depends(get_db)):
    """Get chapters for a specific module."""
    try:
        chapters = get_chapters_for_module(db, module_id)
        return GetChaptersResponse(chapters=chapters)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chapters: {str(e)}")


@router.post("/chapter/{module_id}/{chapter_id}/query", response_model=QueryResponse)
def query_chapter_content(module_id: str, chapter_id: str, query_data: dict):
    """Query content-specific information."""
    try:
        query = query_data.get("query", "")
        selected_text = query_data.get("selected_text", "")

        response = query_content(query, selected_text, module_id, chapter_id)
        return QueryResponse(response=response, sources=[])
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error querying content: {str(e)}")


@router.get("/learning/progress")
def get_learning_progress(student_id: str, db: Session = Depends(get_db)):
    """Get learning progress for a student."""
    try:
        progress = get_student_progress(db, student_id)
        return progress
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving learning progress: {str(e)}")


@router.get("/learning/path")
def get_learning_path_for_student(student_id: str, db: Session = Depends(get_db)):
    """Get the complete learning path for a student."""
    try:
        path = get_learning_path(db, student_id)
        return path
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving learning path: {str(e)}")


@router.post("/translate")
def translate_content_endpoint(translation_data: dict):
    """Translate content to the specified language."""
    try:
        content = translation_data.get("content", "")
        target_language = translation_data.get("targetLanguage", "ur")
        module_id = translation_data.get("moduleId")
        chapter_id = translation_data.get("chapterId")

        translated_content = translate_content(content, target_language, module_id, chapter_id)

        return {
            "translatedContent": translated_content,
            "sourceLanguage": "en",
            "targetLanguage": target_language,
            "timestamp": __import__('datetime').datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error translating content: {str(e)}")


@router.post("/learning/progress")
def update_learning_progress(student_id: str, progress_data: dict, db: Session = Depends(get_db)):
    """Update learning progress for a student."""
    try:
        # Extract progress data
        session_id = progress_data.get("session_id")
        current_module = progress_data.get("current_module")
        current_chapter = progress_data.get("current_chapter")
        progress_percentage = progress_data.get("progress_percentage")
        completed_chapters = progress_data.get("completed_chapters")

        from ..services.learning_path_service import update_learning_progress as service_update_progress
        result = service_update_progress(
            db,
            session_id,
            current_module,
            current_chapter,
            progress_percentage,
            completed_chapters
        )

        if result is None:
            raise HTTPException(status_code=404, detail="Learning session not found")

        return {"status": "success", "session_id": result.session_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating learning progress: {str(e)}")