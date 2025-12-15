"""Vector database connection module for Qdrant Cloud."""
import os
from qdrant_client import QdrantClient
from qdrant_client.http import models
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Qdrant configuration from environment
QDRANT_URL = os.getenv("QDRANT_URL")
QDRANT_API_KEY = os.getenv("QDRANT_API_KEY")

# Initialize Qdrant client
if QDRANT_URL and QDRANT_API_KEY:
    client = QdrantClient(
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY,
        timeout=10  # 10 second timeout
    )
else:
    # For local development
    client = QdrantClient(host="localhost", port=6333)

# Collection name for embeddings
COLLECTION_NAME = "textbook_embeddings"

def initialize_collection():
    """Initialize the Qdrant collection for storing embeddings."""
    try:
        # Check if collection exists
        client.get_collection(COLLECTION_NAME)
        print(f"Collection '{COLLECTION_NAME}' already exists")
    except:
        # Create collection if it doesn't exist
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=models.VectorParams(size=1536, distance=models.Distance.COSINE),  # OpenAI embedding size
        )
        print(f"Created collection '{COLLECTION_NAME}'")

def get_qdrant_client():
    """Get the Qdrant client instance."""
    return client

def get_collection_name():
    """Get the collection name."""
    return COLLECTION_NAME