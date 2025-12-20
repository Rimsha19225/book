"""Translation service for the Physical AI & Humanoid Robotics Textbook application."""
import os
from typing import Optional
from ..utils.openai_client import get_openai_client
import openai
from ..models.student import Student
from sqlalchemy.orm import Session


def translate_content(content: str, target_language: str = "ur", module_id: Optional[str] = None, chapter_id: Optional[str] = None) -> str:
    """
    Translate content to the specified language while preserving formatting.

    Args:
        content: The content to translate
        target_language: The target language code (default: "ur" for Urdu)
        module_id: Optional module ID for context
        chapter_id: Optional chapter ID for context

    Returns:
        The translated content
    """
    # Initialize OpenAI client
    client = get_openai_client()

    # Prepare the translation prompt
    # We need to preserve formatting, headings, code blocks, lists, and technical terms
    prompt = f"""
    Translate the following content to {target_language}. Please follow these rules:

    1. Preserve all markdown formatting including headings (#, ##, ###), code blocks (```), lists (-, *), bold (**), and italics (*)
    2. Keep technical terms in English but add their meaning in brackets in {target_language} when appropriate
    3. Maintain the same structure and formatting as the original
    4. Preserve any references to diagrams, images, or figures
    5. If there are mathematical expressions in LaTeX format, keep them as is
    6. Ensure the translation is clear and natural in {target_language}

    Content to translate:
    {content}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": f"You are a professional translator specializing in technical content. Translate the user's content to {target_language} while preserving formatting and keeping technical terms in English with translations in brackets."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,  # Lower temperature for more consistent translations
            max_tokens=len(content) * 2  # Allow more tokens for the response
        )

        translated_content = response.choices[0].message.content
        return translated_content

    except Exception as e:
        print(f"Error in translation: {str(e)}")
        # If translation fails, return the original content
        return content


def is_user_authenticated(db: Session, student_id: str) -> bool:
    """
    Check if the user is authenticated by verifying their student ID.

    Args:
        db: Database session
        student_id: The student ID to verify

    Returns:
        True if the user is authenticated, False otherwise
    """
    try:
        student = db.query(Student).filter(Student.id == student_id).first()
        return student is not None
    except Exception:
        return False