"""Chatbot service for the Physical AI & Humanoid Robotics Textbook application."""
from datetime import datetime
from typing import Optional
import uuid
from ..utils.openai_client import get_completion
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

        # Generate response using AI
        # For now, using a simple placeholder - in a real implementation,
        # this would call the RAG service with context from the textbook
        if context_selection:
            prompt = f"Based on this context: '{context_selection}', answer this question: {message}"
        else:
            prompt = f"Regarding the textbook content, {message}"

        # This would be replaced with actual AI call in a real implementation
        ai_response = get_completion(prompt, session.context_chapter)

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
        return f"Error processing message: {str(e)}"
    finally:
        db.close()