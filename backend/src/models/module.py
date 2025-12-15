"""Module model for the Physical AI & Humanoid Robotics Textbook application."""
from sqlalchemy import Column, String, Integer, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from ..database.connection import Base


class Module(Base):
    __tablename__ = "modules"

    module_id = Column(String, primary_key=True)  # e.g., "ros2", "gazebo_unity", "nvidia_isaac", "vla"
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    order_index = Column(Integer, nullable=False)
    estimated_duration_hours = Column(Float, nullable=True)
    prerequisites = Column(String, nullable=True)  # Store as JSON string

    def __repr__(self):
        return f"<Module(id='{self.module_id}', title='{self.title}', order={self.order_index})>"