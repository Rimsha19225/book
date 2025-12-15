"""ChatMessage model for the Physical AI & Humanoid Robotics Textbook application."""
from sqlalchemy import Column, String, DateTime, Text, Boolean, Enum as SQLEnum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
import uuid
from ..database.connection import Base


class SenderType:
    STUDENT = "student"
    AI = "ai"


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    message_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_session_id = Column(UUID(as_uuid=True), ForeignKey("chat_sessions.chat_session_id"), nullable=False)
    sender_type = Column(SQLEnum(SenderType.STUDENT, SenderType.AI), nullable=False)
    message_content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=func.now(), nullable=False)
    context_snippet = Column(Text, nullable=True)
    is_context_aware = Column(Boolean, default=False, nullable=False)

    # Relationship
    chat_session = relationship("ChatSession", back_populates="messages")

    def __repr__(self):
        return f"<ChatMessage(id={self.message_id}, session_id={self.chat_session_id}, sender='{self.sender_type}')>"