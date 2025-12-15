"""Database initialization script for the Physical AI & Humanoid Robotics Textbook application."""
import sys
import os

# Add the src directory to the path so we can import our modules
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from ..database.connection import engine, Base
from ..models.student import Student
from ..models.content import TextbookContent
from ..models.chat_session import ChatSession
from ..models.chat_message import ChatMessage
from ..models.module import Module
from ..models.vector_embedding import VectorEmbedding
from ..models.learning_session import LearningSession


def init_db():
    """Initialize the database with all tables."""
    print("Creating database tables...")

    # Create all tables
    Base.metadata.create_all(bind=engine)

    print("Database tables created successfully!")


if __name__ == "__main__":
    init_db()