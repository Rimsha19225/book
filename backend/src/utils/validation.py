"""Validation utilities for the Physical AI & Humanoid Robotics Textbook application."""
import re
from typing import Optional
from pydantic import BaseModel, validator


def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


def validate_name(name: str) -> bool:
    """Validate name length (2-50 characters)."""
    return 2 <= len(name) <= 50


def validate_progress_percentage(percentage: float) -> bool:
    """Validate progress percentage (0-100)."""
    return 0 <= percentage <= 100


def validate_module_id(module_id: str) -> bool:
    """Validate module ID format."""
    # Module IDs should be lowercase with underscores or hyphens
    pattern = r'^[a-z0-9_-]+$'
    return re.match(pattern, module_id) is not None


def validate_content_type(content_type: str) -> bool:
    """Validate content type."""
    valid_types = ["welcome", "introductory", "module", "assessment"]
    return content_type in valid_types


class StudentCreateRequest(BaseModel):
    email: str
    name: str

    @validator('email')
    def validate_email_format(cls, v):
        if not validate_email(v):
            raise ValueError('Invalid email format')
        return v

    @validator('name')
    def validate_name_length(cls, v):
        if not validate_name(v):
            raise ValueError('Name must be between 2 and 50 characters')
        return v


class ChatMessageRequest(BaseModel):
    message: str
    context_selection: Optional[str] = None

    @validator('message')
    def validate_message_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Message cannot be empty')
        return v.strip()


class ContentQueryRequest(BaseModel):
    query: str
    selected_text: Optional[str] = None

    @validator('query')
    def validate_query_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError('Query cannot be empty')
        return v.strip()


def validate_student_data(email: str, name: str) -> dict:
    """Validate student data and return errors if any."""
    errors = {}

    if not validate_email(email):
        errors['email'] = 'Invalid email format'

    if not validate_name(name):
        errors['name'] = 'Name must be between 2 and 50 characters'

    return errors


def validate_learning_session_data(progress_percentage: float, current_module: str = None, current_chapter: str = None) -> dict:
    """Validate learning session data and return errors if any."""
    errors = {}

    if not validate_progress_percentage(progress_percentage):
        errors['progress_percentage'] = 'Progress percentage must be between 0 and 100'

    if current_module and not validate_module_id(current_module):
        errors['current_module'] = 'Invalid module ID format'

    return errors