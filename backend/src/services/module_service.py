"""Module service for the Physical AI & Humanoid Robotics Textbook application."""
from sqlalchemy.orm import Session
from typing import List, Optional
from ..models.module import Module
from ..api.models.response_models import ModuleResponse


def create_module(db: Session, module_data: dict) -> ModuleResponse:
    """Create a new module."""
    module = Module(
        module_id=module_data["module_id"],
        title=module_data["title"],
        description=module_data["description"],
        order_index=module_data["order_index"],
        estimated_duration_hours=module_data.get("estimated_duration_hours"),
        prerequisites=module_data.get("prerequisites")
    )
    db.add(module)
    db.commit()
    db.refresh(module)

    return ModuleResponse(
        module_id=module.module_id,
        title=module.title,
        description=module.description,
        order_index=module.order_index,
        estimated_duration_hours=module.estimated_duration_hours
    )


def get_module_by_id(db: Session, module_id: str) -> Optional[ModuleResponse]:
    """Get a module by its ID."""
    module = db.query(Module).filter(Module.module_id == module_id).first()
    if not module:
        return None

    return ModuleResponse(
        module_id=module.module_id,
        title=module.title,
        description=module.description,
        order_index=module.order_index,
        estimated_duration_hours=module.estimated_duration_hours
    )


def get_all_modules(db: Session) -> List[ModuleResponse]:
    """Get all modules."""
    modules = db.query(Module).order_by(Module.order_index).all()
    return [
        ModuleResponse(
            module_id=module.module_id,
            title=module.title,
            description=module.description,
            order_index=module.order_index,
            estimated_duration_hours=module.estimated_duration_hours
        )
        for module in modules
    ]


def update_module(db: Session, module_id: str, update_data: dict) -> Optional[ModuleResponse]:
    """Update a module."""
    module = db.query(Module).filter(Module.module_id == module_id).first()
    if not module:
        return None

    for field, value in update_data.items():
        if hasattr(module, field):
            setattr(module, field, value)

    db.commit()
    db.refresh(module)

    return ModuleResponse(
        module_id=module.module_id,
        title=module.title,
        description=module.description,
        order_index=module.order_index,
        estimated_duration_hours=module.estimated_duration_hours
    )


def delete_module(db: Session, module_id: str) -> bool:
    """Delete a module."""
    module = db.query(Module).filter(Module.module_id == module_id).first()
    if not module:
        return False

    db.delete(module)
    db.commit()
    return True