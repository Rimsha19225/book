"""Chat API routes for the Physical AI & Humanoid Robotics Textbook application."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database.connection import get_db
from ..api.models.response_models import ChatSessionResponse, ChatMessageResponse, ChatHistoryResponse
from ..services.chatbot_service import start_chat_session, send_message_to_chatbot
from datetime import datetime
import uuid

router = APIRouter()


@router.post("/start", response_model=ChatSessionResponse)
def start_chat(student_data: dict, db: Session = Depends(get_db)):
    """Start a new chat session."""
    try:
        student_id = student_data.get("student_id")
        context_chapter = student_data.get("context_chapter")

        chat_session = start_chat_session(student_id, context_chapter)

        return ChatSessionResponse(
            chat_session_id=chat_session["chat_session_id"],
            created_at=chat_session["created_at"],
            welcome_message="Hello! I'm your AI-powered textbook assistant. How can I help you with this chapter?"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting chat session: {str(e)}")


@router.post("/{chat_session_id}/message", response_model=ChatMessageResponse)
def send_chat_message(chat_session_id: str, message_data: dict):
    """Send a message to the chatbot."""
    try:
        message = message_data.get("message", "")
        context_selection = message_data.get("context_selection", "")

        response = send_message_to_chatbot(chat_session_id, message, context_selection)

        return ChatMessageResponse(
            message_id=str(uuid.uuid4()),
            response=response,
            timestamp=datetime.now(),
            context_used=context_selection if context_selection else None
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}")


@router.get("/{chat_session_id}/history", response_model=ChatHistoryResponse)
def get_chat_history(chat_session_id: str):
    """Get chat history for a session."""
    try:
        # Placeholder - implement actual history retrieval
        messages = []
        return ChatHistoryResponse(messages=messages)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat history: {str(e)}")