"""OpenAI client utility for the Physical AI & Humanoid Robotics Textbook application."""
import openai
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Set OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")


def get_openai_client():
    """Get OpenAI client instance."""
    # For backward compatibility, return the openai module itself
    # In a real implementation with newer OpenAI versions, this would return openai.OpenAI()
    return openai


def get_completion(prompt: str, context_chapter: str = None) -> str:
    """Get a completion from OpenAI API."""
    try:
        # For now, return a placeholder response
        # In a real implementation, this would call the OpenAI API
        if not openai.api_key:
            return f"This is a simulated response to: {prompt}. Please configure your OpenAI API key to get real responses."

        # Prepare the messages for the chat completion
        messages = [
            {
                "role": "system",
                "content": "You are an AI assistant for a Physical AI & Humanoid Robotics textbook. Provide helpful, accurate responses based on the textbook content. Be concise but informative."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]

        # Call the OpenAI API
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # You can change this to gpt-4 if preferred
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )

        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error getting AI response: {str(e)}"


def get_embeddings(text: str) -> list:
    """Get embeddings for text using OpenAI API."""
    try:
        if not openai.api_key:
            # Return a mock embedding for development
            return [0.0] * 1536  # Standard OpenAI embedding size

        response = openai.Embedding.create(
            input=text,
            model="text-embedding-ada-002"
        )

        return response.data[0].embedding
    except Exception as e:
        print(f"Error getting embeddings: {str(e)}")
        return [0.0] * 1536  # Return a default embedding on error