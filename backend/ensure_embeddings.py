#!/usr/bin/env python3
"""Script to ensure embeddings are properly loaded for all content."""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from src.database.connection import SessionLocal
from src.models.content import TextbookContent
from src.services.vector_service import store_embeddings
from src.utils.embeddings import chunk_content_for_embeddings

def ensure_embeddings():
    """Ensure all content has embeddings stored in the vector database."""
    db = SessionLocal()
    try:
        # Get all content
        contents = db.query(TextbookContent).all()
        print(f"Found {len(contents)} content items to process...")

        for content in contents:
            print(f"Processing: {content.module_id}/{content.chapter_id}")

            # Split content into chunks for embedding
            content_chunks = chunk_content_for_embeddings(content.content_body)

            # Generate content ID based on the content
            import uuid
            content_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{content.module_id}_{content.chapter_id}"))

            # Store embeddings for the content
            success = store_embeddings(content_id, content.module_id, content.chapter_id, content_chunks)
            if success:
                print(f"  [SUCCESS] Stored embeddings for: {content.module_id}/{content.chapter_id}")
            else:
                print(f"  [FAILED] Failed to store embeddings for: {content.module_id}/{content.chapter_id}")

        print("\nEmbedding storage process completed!")

    except Exception as e:
        print(f"Error ensuring embeddings: {str(e)}")
    finally:
        db.close()

if __name__ == "__main__":
    ensure_embeddings()