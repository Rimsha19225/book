"""Cohere client utility for the Physical AI & Humanoid Robotics Textbook application."""
import cohere
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Cohere client
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
if COHERE_API_KEY:
    client = cohere.Client(COHERE_API_KEY)
else:
    print("Warning: COHERE_API_KEY not found in environment variables. Using fallback responses.")
    client = None


def get_embeddings(texts):
    """
    Get embeddings for text(s) using Cohere API.

    Args:
        texts: A single string or list of strings to embed

    Returns:
        A list of embedding vectors (for single text) or list of lists (for multiple texts)
    """
    try:
        # Check if API key is configured
        if not COHERE_API_KEY:
            print("Cohere API key not configured. Using default embeddings.")
            # Return a default embedding when API key is not available
            if isinstance(texts, str):
                return [0.0] * 1024
            elif isinstance(texts, list):
                return [[0.0] * 1024 for _ in range(len(texts))]
            else:
                return [0.0] * 1024

        # Ensure texts is always a list for the API call
        single_input = False
        if isinstance(texts, str):
            single_input = True
            texts = [texts]

        response = client.embed(
            texts=texts,
            model="embed-english-v3.0",  # Using Cohere's latest embedding model
            input_type="search_document"  # Appropriate for search documents
        )

        # Check if response.embeddings is already a list of lists (for some API versions)
        if hasattr(response.embeddings[0], 'embedding'):
            # The embeddings are in the 'embedding' attribute of each item
            embeddings = [item.embedding for item in response.embeddings]
        else:
            # The embeddings are the items themselves (list of lists)
            embeddings = response.embeddings

        # If original input was a single string, return the first (and only) embedding
        if single_input:
            return embeddings[0]

        return embeddings
    except Exception as e:
        print(f"Error getting Cohere embeddings: {str(e)}")
        # Check if it's a rate limit error
        if "429" in str(e) or "rate limit" in str(e).lower() or "trial key" in str(e).lower():
            print("Cohere API rate limit reached. Using default embeddings.")

        # Return a default embedding on error - Cohere embed-english-v3.0 produces 1024-dim vectors
        if isinstance(texts, str):
            return [0.0] * 1024
        elif isinstance(texts, list):
            return [[0.0] * 1024 for _ in range(len(texts))]
        else:
            return [0.0] * 1024


def get_completion(prompt: str, context_chapter: str = None) -> str:
    """
    Get a completion from Cohere API.

    Args:
        prompt: The input prompt
        context_chapter: Optional context chapter

    Returns:
        Generated text response
    """
    # Check if API key is configured
    if not COHERE_API_KEY or client is None:
        # Provide a more helpful fallback response
        import re
        # Extract the question from the prompt
        question_match = re.search(r'answer this question: (.+)$', prompt)
        if question_match:
            question = question_match.group(1)
        else:
            question = prompt

        # Generate a helpful response based on common textbook questions
        if "how many modules" in question.lower() or "modules" in question.lower():
            return "The Physical AI & Humanoid Robotics textbook contains several modules covering different aspects of the subject. The main modules include: 1) Introduction to Physical AI, 2) ROS2 Fundamentals, 3) NVIDIA Isaac, 4) Gazebo and Unity Simulation, 5) Vision-Language-Action Models, and more. Each module is designed to build your understanding progressively."
        elif "what is" in question.lower() or "define" in question.lower():
            return f"Based on the textbook content, I can help explain concepts related to Physical AI and Humanoid Robotics. For a detailed definition of '{question}', please refer to the relevant chapter in the textbook."
        elif "explain" in question.lower():
            return f"I can explain concepts related to Physical AI and Humanoid Robotics. For a comprehensive explanation of '{question}', please check the corresponding section in the textbook."
        else:
            return f"Thank you for your question about the textbook. This system is currently running in demo mode without an API key. In a full implementation, I would provide a detailed answer to: '{question}'. Please check the relevant textbook sections for comprehensive information."

    try:
        # Prepare the message
        message = prompt
        if context_chapter:
            message = f"Context: {context_chapter}\n\nQuestion: {prompt}"

        response = client.generate(
            model="command-r-plus",  # Using Cohere's powerful command model
            prompt=message,
            max_tokens=500,
            temperature=0.7
        )

        return response.generations[0].text.strip()
    except Exception as e:
        # Provide a fallback response when API fails
        import re
        # Extract the question from the prompt
        question_match = re.search(r'answer this question: (.+)$', prompt)
        if question_match:
            question = question_match.group(1)
        else:
            question = prompt

        # Provide a helpful response based on common textbook questions
        if "how many modules" in question.lower() or "modules" in question.lower():
            return "The Physical AI & Humanoid Robotics textbook contains several modules covering different aspects of the subject. The main modules include: 1) Introduction to Physical AI, 2) ROS2 Fundamentals, 3) NVIDIA Isaac, 4) Gazebo and Unity Simulation, 5) Vision-Language-Action Models, and more. Each module is designed to build your understanding progressively."
        elif "what is" in question.lower() or "define" in question.lower():
            return f"Based on the textbook content, I can help explain concepts related to Physical AI and Humanoid Robotics. For a detailed definition of '{question}', please refer to the relevant chapter in the textbook."
        elif "explain" in question.lower():
            return f"I can explain concepts related to Physical AI and Humanoid Robotics. For a comprehensive explanation of '{question}', please check the corresponding section in the textbook."
        else:
            return f"Thank you for your question about the textbook. There was an issue processing your request. In a full implementation, I would provide a detailed answer to: '{question}'. Please check the relevant textbook sections for comprehensive information."


def rerank(query: str, documents: list, top_n: int = 5):
    """
    Rerank documents based on relevance to query using Cohere's rerank functionality.

    Args:
        query: The search query
        documents: List of documents to rerank
        top_n: Number of top results to return

    Returns:
        List of reranked documents with relevance scores
    """
    try:
        response = client.rerank(
            model="rerank-english-v3.0",
            query=query,
            documents=documents,
            top_n=top_n
        )

        return response.results
    except Exception as e:
        print(f"Error during reranking: {str(e)}")
        # Return documents with placeholder scores if reranking fails
        return [{"document": doc, "index": i, "relevance_score": 0.0}
                for i, doc in enumerate(documents[:top_n])]