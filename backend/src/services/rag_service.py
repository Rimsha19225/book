"""RAG (Retrieval Augmented Generation) service for the Physical AI & Humanoid Robotics Textbook application."""
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from ..database.vector_connection import get_qdrant_client, get_collection_name
from ..utils.cohere_client import get_embeddings
from qdrant_client.http import models
from ..models.content import TextbookContent


def query_content(query: str, selected_text: str = "", module_id: str = None, chapter_id: str = None) -> str:
    """Query content-specific information using RAG."""
    try:
        # Generate embedding for the query
        query_embedding = get_embeddings(query)

        # Initialize Qdrant client
        client = get_qdrant_client()
        collection_name = get_collection_name()

        # Search for relevant content in the vector database using the correct method for Qdrant 1.7.0
        search_results = client.query_points(
            collection_name=collection_name,
            query=query_embedding,
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
        ).points

        # Format the results for the AI model
        context_parts = []
        for result in search_results:
            module_id_result = result.payload.get("module_id", "Unknown")
            chapter_id_result = result.payload.get("chapter_id", "Unknown")
            content = result.payload.get("content", "")
            context_parts.append(f"[Module: {module_id_result}, Chapter: {chapter_id_result}] {content}")

        # Combine the context
        context = "\n\n".join(context_parts)

        # If there's selected text, include it as well
        if selected_text:
            context = f"Selected text: {selected_text}\n\nRelevant context: {context}"

        # Generate a response using the context
        if context:
            # In a real implementation, this would call the Cohere or OpenAI API for generation
            # For now, we'll return a response based on the context we found
            response = f"Based on the textbook content, here's the answer to your question: '{query}'\n\n"
            response += f"Context found: {len(context_parts)} relevant pieces of information.\n\n"
            response += f"Relevant information:\n{context}"
        else:
            # If no context found in vector DB, provide a helpful response
            if module_id and chapter_id:
                response = f"I couldn't find specific information about '{query}' in Module: {module_id}, Chapter: {chapter_id}."
            else:
                response = f"I couldn't find information about '{query}' in the textbook content."

        return response

    except Exception as e:
        return f"Error in RAG service: {str(e)}"


def query_content_without_filters(query: str) -> str:
    """Query content across all modules and chapters using RAG."""
    try:
        # Generate embedding for the query
        query_embedding = get_embeddings(query)

        # Initialize Qdrant client
        client = get_qdrant_client()
        collection_name = get_collection_name()

        # Search for relevant content in the vector database without filters
        search_results = client.query_points(
            collection_name=collection_name,
            query=query_embedding,
            limit=5  # Return top 5 results
        ).points

        # Format the results for the AI model
        context_parts = []
        for result in search_results:
            module_id = result.payload.get("module_id", "Unknown")
            chapter_id = result.payload.get("chapter_id", "Unknown")
            content = result.payload.get("content", "")
            context_parts.append(f"[Module: {module_id}, Chapter: {chapter_id}] {content}")

        # Combine the context
        context = "\n\n".join(context_parts)

        # Generate a response using the context
        if context:
            response = f"Based on the textbook content, here's the answer to your question: '{query}'\n\n"
            response += f"Found information in {len(context_parts)} different sections:\n\n{context}"
        else:
            response = f"I couldn't find information about '{query}' in the textbook content."

        return response

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


def add_chapter_to_vector_db(db: Session, module_id: str, chapter_id: str) -> bool:
    """Add an entire chapter's content to the vector database."""
    try:
        # Get the chapter content from the database
        chapter_content = db.query(TextbookContent).filter(
            TextbookContent.module_id == module_id,
            TextbookContent.chapter_id == chapter_id
        ).first()

        if not chapter_content:
            print(f"Chapter not found: {module_id}/{chapter_id}")
            return False

        # Generate content ID based on the content
        import uuid
        content_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{module_id}_{chapter_id}"))

        # Add the content to vector DB
        success = add_content_to_vector_db(content_id, module_id, chapter_id, chapter_content.content_body)
        return success

    except Exception as e:
        print(f"Error adding chapter to vector DB: {str(e)}")
        return False