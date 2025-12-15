"""Student model for the Physical AI & Humanoid Robotics Textbook application."""
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from ..database.connection import Base


class Student(Base):
    __tablename__ = "students"

    student_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    last_accessed = Column(DateTime, default=func.now(), onupdate=func.now())
    preferences = Column(JSON, nullable=True)

    # Relationships
    chat_sessions = relationship("ChatSession", order_by="ChatSession.created_at", back_populates="student")
    learning_sessions = relationship("LearningSession", order_by="LearningSession.started_at", back_populates="student")

    def __repr__(self):
        return f"<Student(id={self.student_id}, email='{self.email}', name='{self.name}')>"