"""Content service for the Physical AI & Humanoid Robotics Textbook application."""
from sqlalchemy.orm import Session
from typing import List
from ..models.module import Module
from ..models.content import TextbookContent
from ..api.models.response_models import ModuleResponse, ChapterResponse


def get_all_modules(db: Session) -> List[ModuleResponse]:
    """Get all available modules."""
    modules = db.query(Module).order_by(Module.order_index).all()

    result = []
    for module in modules:
        result.append(ModuleResponse(
            module_id=module.module_id,
            title=module.title,
            description=module.description,
            order_index=module.order_index,
            estimated_duration_hours=module.estimated_duration_hours
        ))

    return result


def get_chapters_for_module(db: Session, module_id: str) -> List[ChapterResponse]:
    """Get chapters for a specific module."""
    contents = db.query(TextbookContent).filter(TextbookContent.module_id == module_id).all()

    result = []
    for content in contents:
        result.append(ChapterResponse(
            chapter_id=content.chapter_id,
            title=content.title,
            content_type=content.content_type
        ))

    return result