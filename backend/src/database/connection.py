"""Database connection module for Neon Postgres."""
import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://username:password@localhost/dbname")

# Create engine with connection pooling settings
engine = create_engine(
    DATABASE_URL,
    pool_size=10,  # Number of connections to maintain in the pool
    max_overflow=20,  # Additional connections beyond pool_size
    pool_pre_ping=True,  # Validate connections before use
    pool_recycle=300,  # Recycle connections after 5 minutes
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """Dependency to get database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()