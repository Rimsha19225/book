"""Chat API routes for the Physical AI & Humanoid Robotics Textbook application."""
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database.connection import get_db
from ..api.models.response_models import ChatSessionResponse, ChatMessageResponse, ChatHistoryResponse
from ..services.chatbot_service import start_chat_session, send_message_to_chatbot
from ..services.auth_service import get_current_user as get_authenticated_user, security
from ..models.student import Student
from datetime import datetime
import uuid


def get_current_user_optional(request: Request, db: Session = Depends(get_db)):
    """Get current user if authenticated, otherwise return None."""
    try:
        # Get the authorization header
        auth_header = request.headers.get("authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return None

        # Extract token
        token = auth_header.split(" ")[1]

        # Verify token and get user
        from ..services.auth_service import verify_token
        token_data = verify_token(token)
        student_id = token_data.get("sub")

        if student_id:
            student = db.query(Student).filter(Student.student_id == student_id).first()
            return student

        return None
    except:
        # If token is invalid, return None
        return None

router = APIRouter()


@router.post("/start", response_model=ChatSessionResponse)
def start_chat(student_data: dict, current_user: Optional[Student] = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """Start a new chat session."""
    try:
        # Check if user is authenticated, otherwise use provided student_id or None
        student_id = None
        if current_user:
            student_id = str(current_user.student_id)
        else:
            # For anonymous users, use the student_id if provided in the request
            student_id = student_data.get("student_id")

        context_chapter = student_data.get("context_chapter")

        chat_session = start_chat_session(student_id, context_chapter)

        return ChatSessionResponse(
            chat_session_id=chat_session["chat_session_id"],
            created_at=chat_session["created_at"],
            welcome_message="Hello! I'm your AI-powered textbook assistant. How can I help you with this book?"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting chat session: {str(e)}")


@router.post("/{chat_session_id}/message", response_model=ChatMessageResponse)
def send_chat_message(chat_session_id: str, message_data: dict, current_user: Optional[Student] = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """Send a message to the chatbot."""
    try:
        from ..models.chat_session import ChatSession

        # Get the chat session
        chat_session = db.query(ChatSession).filter(ChatSession.chat_session_id == chat_session_id).first()

        if not chat_session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        # Check if user has permission to access this session
        if chat_session.student_id and current_user:
            # If session belongs to a user, only allow access if it's the same user
            if str(chat_session.student_id) != str(current_user.student_id):
                raise HTTPException(status_code=403, detail="Not authorized to access this chat session")
        elif chat_session.student_id and not current_user:
            # If session belongs to a user but no user is authenticated
            raise HTTPException(status_code=403, detail="Not authorized to access this chat session")

        message = message_data.get("message", "")
        context_selection = message_data.get("context_selection", "")

        response = send_message_to_chatbot(chat_session_id, message, context_selection)

        return ChatMessageResponse(
            message_id=str(uuid.uuid4()),
            response=response,
            timestamp=datetime.now(),
            context_used=context_selection if context_selection else None
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error sending message: {str(e)}")


@router.get("/{chat_session_id}/history", response_model=ChatHistoryResponse)
def get_chat_history(chat_session_id: str, current_user: Optional[Student] = Depends(get_current_user_optional), db: Session = Depends(get_db)):
    """Get chat history for a session."""
    try:
        from ..models.chat_session import ChatSession
        from ..models.chat_message import ChatMessage

        # Get the chat session
        chat_session = db.query(ChatSession).filter(ChatSession.chat_session_id == chat_session_id).first()

        if not chat_session:
            raise HTTPException(status_code=404, detail="Chat session not found")

        # Check if user has permission to access this session
        if chat_session.student_id and current_user:
            # If session belongs to a user, only allow access if it's the same user
            if str(chat_session.student_id) != str(current_user.student_id):
                raise HTTPException(status_code=403, detail="Not authorized to access this chat session")
        elif chat_session.student_id and not current_user:
            # If session belongs to a user but no user is authenticated
            raise HTTPException(status_code=403, detail="Not authorized to access this chat session")

        # Get messages for this session
        messages = db.query(ChatMessage).filter(ChatMessage.chat_session_id == chat_session_id).all()

        # Convert to response format (simplified - you may need to adjust based on your response model)
        response_messages = []
        for msg in messages:
            response_messages.append({
                "id": str(msg.message_id),
                "sender": msg.sender,
                "content": msg.content,
                "timestamp": msg.timestamp.isoformat() if msg.timestamp else None,
                "context": msg.context_used
            })

        return ChatHistoryResponse(messages=response_messages)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving chat history: {str(e)}")