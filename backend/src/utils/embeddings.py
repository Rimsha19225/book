"""Embeddings utility for the Physical AI & Humanoid Robotics Textbook application."""
from typing import List, Dict, Any
import numpy as np
from .openai_client import get_embeddings as openai_get_embeddings
from .openai_client import get_completion


def get_text_embedding(text: str) -> List[float]:
    """
    Get embedding for a single text using OpenAI API.

    Args:
        text: Input text to embed

    Returns:
        List of floats representing the embedding vector
    """
    return openai_get_embeddings(text)


def get_embeddings_batch(texts: List[str]) -> List[List[float]]:
    """
    Get embeddings for a batch of texts.

    Args:
        texts: List of input texts to embed

    Returns:
        List of embedding vectors
    """
    embeddings = []
    for text in texts:
        embedding = get_text_embedding(text)
        embeddings.append(embedding)

    return embeddings


def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculate cosine similarity between two embedding vectors.

    Args:
        vec1: First embedding vector
        vec2: Second embedding vector

    Returns:
        Cosine similarity score between -1 and 1
    """
    # Convert to numpy arrays for calculation
    v1 = np.array(vec1)
    v2 = np.array(vec2)

    # Calculate cosine similarity
    dot_product = np.dot(v1, v2)
    norm_v1 = np.linalg.norm(v1)
    norm_v2 = np.linalg.norm(v2)

    if norm_v1 == 0 or norm_v2 == 0:
        return 0.0

    similarity = dot_product / (norm_v1 * norm_v2)
    return float(similarity)


def find_most_similar_texts(query_embedding: List[float],
                           text_embeddings: List[List[float]],
                           texts: List[str],
                           top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Find the most similar texts to a query embedding.

    Args:
        query_embedding: Embedding vector for the query
        text_embeddings: List of embedding vectors for candidate texts
        texts: List of candidate texts
        top_k: Number of most similar texts to return

    Returns:
        List of dictionaries containing the text and similarity score
    """
    similarities = []

    for i, text_embedding in enumerate(text_embeddings):
        similarity = cosine_similarity(query_embedding, text_embedding)
        similarities.append({
            'text': texts[i],
            'similarity': similarity,
            'index': i
        })

    # Sort by similarity in descending order
    similarities.sort(key=lambda x: x['similarity'], reverse=True)

    # Return top_k results
    return similarities[:top_k]


def chunk_text(text: str, chunk_size: int = 512, overlap: int = 50) -> List[str]:
    """
    Split text into overlapping chunks suitable for embedding.

    Args:
        text: Input text to chunk
        chunk_size: Maximum size of each chunk (in tokens - approximate)
        overlap: Number of tokens to overlap between chunks

    Returns:
        List of text chunks
    """
    # This is a simple word-based chunking for demonstration
    # In a real implementation, you'd want to use a proper tokenization method
    words = text.split()
    chunks = []

    start_idx = 0
    while start_idx < len(words):
        end_idx = start_idx + chunk_size
        chunk = ' '.join(words[start_idx:end_idx])
        chunks.append(chunk)

        # Move start index by chunk_size minus overlap
        start_idx = end_idx - overlap

        # If the last chunk is too small, just take the remainder
        if end_idx >= len(words):
            break

    return chunks


def get_content_embeddings(content: str, chunk_size: int = 512, overlap: int = 50) -> List[Dict[str, Any]]:
    """
    Generate embeddings for content chunks.

    Args:
        content: Text content to embed
        chunk_size: Size of text chunks
        overlap: Overlap between chunks

    Returns:
        List of dictionaries containing chunk text and its embedding
    """
    chunks = chunk_text(content, chunk_size, overlap)
    embeddings = get_embeddings_batch(chunks)

    result = []
    for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        result.append({
            'chunk_index': i,
            'chunk_text': chunk,
            'embedding': embedding
        })

    return result


def create_embedding_for_rag(query: str, context: str = None) -> Dict[str, Any]:
    """
    Create an embedding suitable for RAG (Retrieval-Augmented Generation).

    Args:
        query: The query text
        context: Optional additional context

    Returns:
        Dictionary containing the embedding and related information
    """
    full_text = query
    if context:
        full_text = f"{context}\n\nQuery: {query}"

    embedding = get_text_embedding(full_text)

    return {
        'query': query,
        'context': context,
        'embedding': embedding,
        'text': full_text
    }


def compare_texts_similarity(text1: str, text2: str) -> float:
    """
    Compare similarity between two texts using embeddings.

    Args:
        text1: First text to compare
        text2: Second text to compare

    Returns:
        Similarity score between -1 and 1
    """
    emb1 = get_text_embedding(text1)
    emb2 = get_text_embedding(text2)

    return cosine_similarity(emb1, emb2)