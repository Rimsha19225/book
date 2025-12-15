"""LearningSession model for the Physical AI & Humanoid Robotics Textbook application."""
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from ..database.connection import Base


class LearningSession(Base):
    __tablename__ = "learning_sessions"

    session_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.student_id"), nullable=False)
    started_at = Column(DateTime, default=func.now(), nullable=False)
    ended_at = Column(DateTime, nullable=True)
    current_module = Column(String, nullable=True)
    current_chapter = Column(String, nullable=True)
    progress_percentage = Column(Float, nullable=False, default=0.0)
    total_modules = Column(Integer, nullable=False, default=0)
    completed_modules = Column(Integer, nullable=False, default=0)
    completed_chapters = Column(JSON, nullable=True)  # Store as JSON array of completed chapter IDs
    time_spent_seconds = Column(Integer, nullable=False, default=0)  # Time spent in seconds

    # Relationship
    student = relationship("Student", back_populates="learning_sessions")

    def __repr__(self):
        return f"<LearningSession(id={self.session_id}, student_id={self.student_id}, progress={self.progress_percentage}%)>"


# Update the Student model to include the relationship to learning sessions
from .student import Student
Student.learning_sessions = relationship("LearningSession", order_by="LearningSession.started_at", back_populates="student")