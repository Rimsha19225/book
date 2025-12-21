#!/usr/bin/env python3
"""Script to check and create modules from content."""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.database.connection import SessionLocal
from src.models.module import Module
from src.models.content import TextbookContent

def check_and_create_modules():
    """Check if modules exist and create them from content if needed."""
    db = SessionLocal()
    try:
        # Get unique module IDs from content
        contents = db.query(TextbookContent).all()
        unique_modules = {}

        for content in contents:
            module_id = content.module_id
            if module_id not in unique_modules:
                # Create a basic module structure based on the module ID
                title_mapping = {
                    'welcome': 'Welcome to the Textbook',
                    'introductory': 'Introduction to Physical AI & Humanoid Robotics',
                    'module-1-ros2': 'Module 1: ROS 2 Fundamentals',
                    'module-2-gazebo-unity': 'Module 2: Gazebo & Unity Simulation',
                    'module-3-nvidia-isaac': 'Module 3: NVIDIA Isaac Robotics',
                    'module-4-vla': 'Module 4: Vision-Language-Action Models'
                }

                description_mapping = {
                    'welcome': 'Welcome materials and textbook overview',
                    'introductory': 'Introduction to the core concepts of Physical AI and Humanoid Robotics',
                    'module-1-ros2': 'Learn ROS 2 fundamentals for robotics development',
                    'module-2-gazebo-unity': 'Simulation environments and physics engines for robotics',
                    'module-3-nvidia-isaac': 'NVIDIA Isaac platform and AI workflows for robotics',
                    'module-4-vla': 'Vision-Language-Action models for embodied AI'
                }

                unique_modules[module_id] = {
                    'title': title_mapping.get(module_id, f'Module: {module_id}'),
                    'description': description_mapping.get(module_id, f'Content for {module_id}'),
                    'order_index': get_module_order(module_id)
                }

        print(f"Found {len(unique_modules)} unique modules from content:")
        for module_id, info in unique_modules.items():
            print(f"  - {module_id}: {info['title']}")

        # Check existing modules in database
        existing_modules = db.query(Module).all()
        print(f"\nExisting modules in database: {len(existing_modules)}")
        for module in existing_modules:
            print(f"  - {module.module_id}: {module.title}")

        # Create missing modules
        for module_id, info in unique_modules.items():
            existing = db.query(Module).filter(Module.module_id == module_id).first()
            if not existing:
                new_module = Module(
                    module_id=module_id,
                    title=info['title'],
                    description=info['description'],
                    order_index=info['order_index']
                )
                db.add(new_module)
                print(f"Created module: {module_id}")

        db.commit()
        print("\nModules check and creation completed!")

    finally:
        db.close()

def get_module_order(module_id):
    """Get the order index for a module."""
    order_mapping = {
        'welcome': 0,
        'introductory': 1,
        'module-1-ros2': 2,
        'module-2-gazebo-unity': 3,
        'module-3-nvidia-isaac': 4,
        'module-4-vla': 5
    }
    return order_mapping.get(module_id, 99)

if __name__ == "__main__":
    check_and_create_modules()