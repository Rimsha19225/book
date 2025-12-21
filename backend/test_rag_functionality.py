"""Test script to verify the updated RAG functionality."""
import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.database.connection import get_db
from src.services.content_loader_service import load_textbook_content_from_docs
from src.services.rag_service import query_content, query_content_without_filters
from src.models.content import TextbookContent

def test_content_loading():
    """Test loading content from markdown files."""
    print("Testing content loading...")

    # Get database session
    db = next(get_db())

    try:
        # Load textbook content from docs
        success = load_textbook_content_from_docs(db, "../../../frontend/docs")
        if success:
            print("+ Content loaded successfully")

            # Count how many content entries we have
            content_count = db.query(TextbookContent).count()
            print(f"+ Total content entries in database: {content_count}")

            # Get some sample content to verify
            sample_content = db.query(TextbookContent).limit(5).all()
            print("Sample content loaded:")
            for content in sample_content:
                print(f"  - Module: {content.module_id}, Chapter: {content.chapter_id}, Title: {content.title}")

        else:
            print("- Failed to load content")
            return False

    except Exception as e:
        print(f"- Error during content loading: {str(e)}")
        return False
    finally:
        db.close()

    return True


def test_rag_query():
    """Test RAG query functionality."""
    print("\nTesting RAG query functionality...")

    try:
        # Test a query without filters first
        response = query_content_without_filters("What is ROS 2?")
        print(f"Query response for 'What is ROS 2?': {response[:200]}...")

        # Test a specific module/chapter query
        response = query_content("What is ROS 2?", "", "module-1-ros2", "introduction-to-ros2")
        print(f"Module-specific query response: {response[:200]}...")

        print("+ RAG queries completed successfully")
        return True

    except Exception as e:
        print(f"- Error during RAG query: {str(e)}")
        return False


def main():
    """Main test function."""
    print("Starting RAG functionality tests...\n")

    # Test content loading
    content_loaded = test_content_loading()

    if content_loaded:
        # Test RAG queries
        rag_working = test_rag_query()

        if rag_working:
            print("\n+ All tests passed! RAG functionality is working correctly.")
            return True
        else:
            print("\n- RAG query tests failed.")
            return False
    else:
        print("\n- Content loading tests failed.")
        return False


if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)