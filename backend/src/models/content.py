"""TextbookContent model for the Physical AI & Humanoid Robotics Textbook application."""
from sqlalchemy import Column, String, DateTime, Text, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from ..database.connection import Base


class ContentType:
    WELCOME = "welcome"
    INTRODUCTORY = "introductory"
    MODULE = "module"
    ASSESSMENT = "assessment"


class TextbookContent(Base):
    __tablename__ = "textbook_content"

    content_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    module_id = Column(String, nullable=False, index=True)
    chapter_id = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    content_type = Column(SQLEnum(ContentType.WELCOME, ContentType.INTRODUCTORY,
                                 ContentType.MODULE, ContentType.ASSESSMENT), nullable=False)
    content_body = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)
    version = Column(String, default="1.0")

    def __repr__(self):
        return f"<TextbookContent(id={self.content_id}, module='{self.module_id}', chapter='{self.chapter_id}', title='{self.title}')>"