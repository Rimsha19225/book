"""VectorEmbedding model for the Physical AI & Humanoid Robotics Textbook application."""
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from ..database.connection import Base


class VectorEmbedding(Base):
    __tablename__ = "vector_embeddings"

    embedding_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    content_id = Column(UUID(as_uuid=True), ForeignKey("textbook_content.content_id"), nullable=False)
    chunk_text = Column(String, nullable=False)
    chunk_index = Column(Integer, nullable=False)
    # Note: The actual embedding vector will be stored in Qdrant, not in Postgres
    # This model tracks the relationship between content and its vector chunks
    created_at = Column(DateTime, default=func.now(), nullable=False)

    def __repr__(self):
        return f"<VectorEmbedding(id={self.embedding_id}, content_id={self.content_id}, chunk={self.chunk_index})>"