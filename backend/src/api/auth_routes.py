"""Authentication API routes for the Physical AI & Humanoid Robotics Textbook application."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Dict
from ..database.connection import get_db
from ..models.student import Student
from ..services.auth_service import register_student, authenticate_student, create_access_token, create_refresh_token, get_current_user
from datetime import timedelta
from pydantic import BaseModel
import uuid

router = APIRouter()

# Request models
class RegisterRequest(BaseModel):
    email: str
    name: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user_id: str
    email: str
    name: str

class UserResponse(BaseModel):
    user_id: str
    email: str
    name: str

# Response models
class RegisterResponse(BaseModel):
    message: str
    user: UserResponse

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: UserResponse

@router.post("/register", response_model=RegisterResponse)
def register(student_data: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new student."""
    try:
        # Register the student
        student = register_student(
            db=db,
            email=student_data.email,
            name=student_data.name,
            password=student_data.password
        )

        # Create tokens
        access_token = create_access_token(data={"sub": str(student.student_id)})
        refresh_token = create_refresh_token(data={"sub": str(student.student_id)})

        return RegisterResponse(
            message="Student registered successfully",
            user=UserResponse(
                user_id=str(student.student_id),
                email=student.email,
                name=student.name
            )
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_ERROR,
            detail=f"Registration failed: {str(e)}"
        )


@router.post("/login", response_model=LoginResponse)
def login(student_data: LoginRequest, db: Session = Depends(get_db)):
    """Login a student."""
    student = authenticate_student(
        db=db,
        email=student_data.email,
        password=student_data.password
    )

    if not student:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create tokens
    access_token = create_access_token(data={"sub": str(student.student_id)})
    refresh_token = create_refresh_token(data={"sub": str(student.student_id)})

    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserResponse(
            user_id=str(student.student_id),
            email=student.email,
            name=student.name
        )
    )


@router.post("/logout")
def logout():
    """Logout a student (client-side token invalidation)."""
    # In a real implementation, you might want to add tokens to a blacklist
    return {"message": "Logged out successfully"}


@router.get("/profile", response_model=UserResponse)
def get_profile(current_user: Student = Depends(get_current_user)):
    """Get current user profile."""
    return UserResponse(
        user_id=str(current_user.student_id),
        email=current_user.email,
        name=current_user.name
    )