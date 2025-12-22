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
    except Exception as e:
        if "not found" in str(e).lower() or "404" in str(e):
            # Create collection if it doesn't exist
            client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=models.VectorParams(size=1024, distance=models.Distance.COSINE),  # Cohere embedding size
            )
            print(f"Created collection '{COLLECTION_NAME}'")
        else:
            # If it's a different error (like 409 - already exists), just print the message
            print(f"Collection '{COLLECTION_NAME}' already exists")

    # Create payload indexes for faster filtering
    try:
        # Create index for module_id field
        client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="module_id",
            field_schema=models.PayloadSchemaType.KEYWORD
        )
        print("Created index for module_id")
    except Exception as e:
        print(f"Index for module_id may already exist: {e}")

    try:
        # Create index for chapter_id field
        client.create_payload_index(
            collection_name=COLLECTION_NAME,
            field_name="chapter_id",
            field_schema=models.PayloadSchemaType.KEYWORD
        )
        print("Created index for chapter_id")
    except Exception as e:
        print(f"Index for chapter_id may already exist: {e}")

def get_qdrant_client():
    """Get the Qdrant client instance."""
    return client

def get_collection_name():
    """Get the collection name."""
    return COLLECTION_NAME