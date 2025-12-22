"""Chatbot service for the Physical AI & Humanoid Robotics Textbook application."""
from datetime import datetime
from typing import Optional
import uuid
from ..utils.cohere_client import get_completion
from ..database.connection import SessionLocal
from ..models.chat_session import ChatSession
from ..models.chat_message import ChatMessage, SenderType


def start_chat_session(student_id: Optional[str], context_chapter: Optional[str]) -> dict:
    """Start a new chat session."""
    db = SessionLocal()
    try:
        chat_session = ChatSession(
            student_id=uuid.UUID(student_id) if student_id else None,
            context_chapter=context_chapter
        )
        db.add(chat_session)
        db.commit()
        db.refresh(chat_session)

        return {
            "chat_session_id": str(chat_session.chat_session_id),
            "created_at": chat_session.created_at,
            "context_chapter": chat_session.context_chapter
        }
    finally:
        db.close()


def send_message_to_chatbot(chat_session_id: str, message: str, context_selection: str = "") -> str:
    """Send a message to the chatbot and get a response."""
    db = SessionLocal()
    try:
        # Get the chat session
        session = db.query(ChatSession).filter(
            ChatSession.chat_session_id == uuid.UUID(chat_session_id)
        ).first()

        if not session:
            return "Error: Chat session not found."

        # Create a new chat message for the student
        student_message = ChatMessage(
            chat_session_id=uuid.UUID(chat_session_id),
            sender_type=SenderType.STUDENT,
            message_content=message,
            context_snippet=context_selection if context_selection else None,
            is_context_aware=bool(context_selection)
        )
        db.add(student_message)
        db.commit()

        # Generate response using RAG system
        from .rag_service import query_content_without_filters

        # Query the RAG system for relevant textbook content
        try:
            rag_response = query_content_without_filters(message)
            print(f"RAG response: {rag_response[:100]}...")  # Log first 100 chars for debugging
        except Exception as rag_error:
            print(f"RAG service error: {str(rag_error)}")
            rag_response = f"Based on the textbook content, I can help with questions about Physical AI and Humanoid Robotics. For your question: '{message}', please refer to the relevant textbook sections."

        # Create a prompt that includes the RAG context
        if context_selection:
            # If there's a specific context selection, prioritize it
            prompt = f"Based on this selected text: '{context_selection}', and the following textbook content: '{rag_response}', answer this question: {message}"
        else:
            # Use the RAG response as context
            prompt = f"Based on the textbook content: '{rag_response}', answer this question: {message}"

        print(f"Final prompt: {prompt[:100]}...")  # Log first 100 chars for debugging

        # Get the AI response using the context-enhanced prompt
        # Use Cohere for AI responses
        try:
            from ..utils.cohere_client import get_completion as cohere_get_completion
            ai_response = cohere_get_completion(prompt, session.context_chapter)
            print(f"Cohere response: {ai_response[:100]}...")  # Log first 100 chars for debugging
        except Exception as e:
            print(f"Cohere API error: {str(e)}")
            # If Cohere fails, return a helpful message
            ai_response = f"Thank you for your question. There was an issue processing your request. In a full implementation, I would provide a detailed answer to your question: '{message}'. Please check the relevant textbook sections for comprehensive information."

        # Create a new chat message for the AI response
        ai_message = ChatMessage(
            chat_session_id=uuid.UUID(chat_session_id),
            sender_type=SenderType.AI,
            message_content=ai_response,
            context_snippet=context_selection if context_selection else None,
            is_context_aware=bool(context_selection)
        )
        db.add(ai_message)
        db.commit()

        return ai_response
    except Exception as e:
        print(f"Error in send_message_to_chatbot: {str(e)}")
        return f"Error processing message: {str(e)}"
    finally:
        db.close()