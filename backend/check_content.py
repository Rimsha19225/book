#!/usr/bin/env python3
"""Script to check if content has been loaded into the database."""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.database.connection import SessionLocal
from src.models.module import Module
from src.models.content import TextbookContent

def check_content():
    """Check if content exists in the database."""
    db = SessionLocal()
    try:
        # Check modules
        modules = db.query(Module).all()
        print(f"Found {len(modules)} modules in database:")
        for module in modules:
            print(f"  - {module.module_id}: {module.title}")

        # Check textbook content
        contents = db.query(TextbookContent).all()
        print(f"\nFound {len(contents)} content items in database:")
        for content in contents:
            print(f"  - {content.module_id}/{content.chapter_id}: {content.title}")

        if not modules and not contents:
            print("\nNo modules or content found in the database.")
            print("You need to load the content using the /api/content/load-content endpoint.")

    finally:
        db.close()

if __name__ == "__main__":
    check_content()