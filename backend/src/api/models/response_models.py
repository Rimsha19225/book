"""API response models for the Physical AI & Humanoid Robotics Textbook application."""
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid


class SenderType(str, Enum):
    student = "student"
    ai = "ai"


class ChatSessionResponse(BaseModel):
    chat_session_id: str
    created_at: datetime
    welcome_message: str


class ChatMessageResponse(BaseModel):
    message_id: str
    response: str
    timestamp: datetime
    context_used: Optional[str] = None


class ChatHistoryResponse(BaseModel):
    messages: List[Dict[str, Any]]


class QueryResponse(BaseModel):
    response: str
    sources: List[Dict[str, Any]]


class ModuleResponse(BaseModel):
    module_id: str
    title: str
    description: str
    order_index: int
    estimated_duration_hours: Optional[float] = None


class ChapterResponse(BaseModel):
    chapter_id: str
    title: str
    content_type: str


class GetModulesResponse(BaseModel):
    modules: List[ModuleResponse]


class GetChaptersResponse(BaseModel):
    chapters: List[ChapterResponse]


class ErrorResponse(BaseModel):
    error: str
    error_code: str
    details: Optional[Dict[str, Any]] = None


class SuccessResponse(BaseModel):
    message: str