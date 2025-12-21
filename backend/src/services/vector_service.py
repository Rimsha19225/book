"""Vector service for the Physical AI & Humanoid Robotics Textbook application."""
from typing import List
import uuid
from ..database.vector_connection import get_qdrant_client, get_collection_name
from ..utils.cohere_client import get_embeddings
from qdrant_client.http import models


def store_embeddings(content_id: str, module_id: str, chapter_id: str, content_chunks: List[str]):
    """Store embeddings for content chunks in the vector database."""
    try:
        client = get_qdrant_client()
        collection_name = get_collection_name()

        points = []
        for idx, chunk in enumerate(content_chunks):
            # Generate embedding for the chunk
            embedding = get_embeddings(chunk)

            # Create a unique ID for this chunk
            chunk_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{content_id}_{idx}"))

            # Create the point to store
            point = models.PointStruct(
                id=chunk_id,
                vector=embedding,
                payload={
                    "content_id": content_id,
                    "module_id": module_id,
                    "chapter_id": chapter_id,
                    "chunk_index": idx,
                    "content": chunk
                }
            )
            points.append(point)

        # Upload all points to Qdrant
        client.upsert(
            collection_name=collection_name,
            points=points
        )

        return True
    except Exception as e:
        print(f"Error storing embeddings: {str(e)}")
        return False


def search_similar_content(query: str, module_id: str = None, chapter_id: str = None, limit: int = 5):
    """Search for similar content in the vector database."""
    try:
        # Generate embedding for the query
        query_embedding = get_embeddings(query)

        client = get_qdrant_client()
        collection_name = get_collection_name()

        # Prepare filters if module_id or chapter_id are provided
        filters = None
        if module_id or chapter_id:
            filter_conditions = []
            if module_id:
                filter_conditions.append(
                    models.FieldCondition(
                        key="module_id",
                        match=models.MatchValue(value=module_id)
                    )
                )
            if chapter_id:
                filter_conditions.append(
                    models.FieldCondition(
                        key="chapter_id",
                        match=models.MatchValue(value=chapter_id)
                    )
                )
            filters = models.Filter(must=filter_conditions)

        # Search for similar content
        search_results = client.query_points(
            collection_name=collection_name,
            query=query_embedding,
            query_filter=filters,
            limit=limit
        ).points

        # Extract the relevant information from results
        results = []
        for result in search_results:
            results.append({
                "content_id": result.payload.get("content_id"),
                "module_id": result.payload.get("module_id"),
                "chapter_id": result.payload.get("chapter_id"),
                "content": result.payload.get("content"),
                "relevance_score": result.score
            })

        return results
    except Exception as e:
        print(f"Error searching similar content: {str(e)}")
        return []


def delete_content_embeddings(content_id: str):
    """Delete embeddings associated with a specific content ID."""
    try:
        client = get_qdrant_client()
        collection_name = get_collection_name()

        # Find and delete all points with this content_id
        client.delete(
            collection_name=collection_name,
            points_selector=models.FilterSelector(
                filter=models.Filter(
                    must=[
                        models.FieldCondition(
                            key="content_id",
                            match=models.MatchValue(value=content_id)
                        )
                    ]
                )
            )
        )

        return True
    except Exception as e:
        print(f"Error deleting content embeddings: {str(e)}")
        return False


def initialize_vector_store():
    """Initialize the vector store with required collections."""
    try:
        from ..database.vector_connection import initialize_collection
        initialize_collection()
        return True
    except Exception as e:
        print(f"Error initializing vector store: {str(e)}")
        return False