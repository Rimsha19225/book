"""Cohere client utility for the Physical AI & Humanoid Robotics Textbook application."""
import cohere
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Cohere client
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
client = cohere.Client(COHERE_API_KEY)


def get_embeddings(texts):
    """
    Get embeddings for text(s) using Cohere API.

    Args:
        texts: A single string or list of strings to embed

    Returns:
        A list of embedding vectors (for single text) or list of lists (for multiple texts)
    """
    try:
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
        if isinstance(texts, list) and len(texts) == 1:
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
        return f"Error getting AI response: {str(e)}"


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