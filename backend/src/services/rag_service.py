"""RAG (Retrieval Augmented Generation) service for the Physical AI & Humanoid Robotics Textbook application."""
from typing import List, Dict, Any
from ..database.vector_connection import get_qdrant_client, get_collection_name
from ..utils.openai_client import get_embeddings
from qdrant_client.http import models


def query_content(query: str, selected_text: str, module_id: str, chapter_id: str) -> str:
    """Query content-specific information using RAG."""
    try:
        # Generate embedding for the query
        query_embedding = get_embeddings(query)

        # Initialize Qdrant client
        client = get_qdrant_client()
        collection_name = get_collection_name()

        # Search for relevant content in the vector database
        search_results = client.search(
            collection_name=collection_name,
            query_vector=query_embedding,
            query_filter=models.Filter(
                must=[
                    models.FieldCondition(
                        key="module_id",
                        match=models.MatchValue(value=module_id),
                    ),
                    models.FieldCondition(
                        key="chapter_id",
                        match=models.MatchValue(value=chapter_id),
                    )
                ]
            ) if module_id and chapter_id else None,
            limit=5  # Return top 5 results
        )

        # Format the results for the AI model
        context_parts = []
        for result in search_results:
            context_parts.append(result.payload.get("content", ""))

        # Combine the context
        context = "\n\n".join(context_parts)

        # If there's selected text, include it as well
        if selected_text:
            context = f"Selected text: {selected_text}\n\nRelevant context: {context}"

        # Generate a response using the context
        if context:
            prompt = f"Based on the following context, answer the question: {query}\n\nContext: {context}"
        else:
            prompt = f"Answer the question based on your knowledge of Physical AI & Humanoid Robotics: {query}"

        # In a real implementation, this would call the OpenAI API
        # For now, we'll return a placeholder response
        return f"RAG response to query: {query}. Context found: {len(context_parts)} relevant pieces of information."

    except Exception as e:
        return f"Error in RAG service: {str(e)}"


def add_content_to_vector_db(content_id: str, module_id: str, chapter_id: str, content_text: str):
    """Add content to the vector database for RAG retrieval."""
    try:
        # Generate embedding for the content
        embedding = get_embeddings(content_text)

        # Initialize Qdrant client
        client = get_qdrant_client()
        collection_name = get_collection_name()

        # Prepare the point to be stored in Qdrant
        points = [
            models.PointStruct(
                id=content_id,
                vector=embedding,
                payload={
                    "content_id": content_id,
                    "module_id": module_id,
                    "chapter_id": chapter_id,
                    "content": content_text
                }
            )
        ]

        # Upload to Qdrant
        client.upsert(
            collection_name=collection_name,
            points=points
        )

        return True
    except Exception as e:
        print(f"Error adding content to vector DB: {str(e)}")
        return False