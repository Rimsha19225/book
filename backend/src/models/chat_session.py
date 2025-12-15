"""ChatSession model for the Physical AI & Humanoid Robotics Textbook application."""
from sqlalchemy import Column, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from ..database.connection import Base


class ChatSession(Base):
    __tablename__ = "chat_sessions"

    chat_session_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    student_id = Column(UUID(as_uuid=True), ForeignKey("students.student_id"), nullable=True)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    last_interaction = Column(DateTime, default=func.now(), onupdate=func.now())
    context_chapter = Column(String, nullable=True)

    # Relationships
    student = relationship("Student", back_populates="chat_sessions")
    messages = relationship("ChatMessage", order_by="ChatMessage.timestamp", back_populates="chat_session")

    def __repr__(self):
        return f"<ChatSession(id={self.chat_session_id}, student_id={self.student_id})>"