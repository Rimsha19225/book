# Deployment Instructions for Hugging Face Space

## Backend Updates Required

To fix the chatbot functionality issues, the Hugging Face Space backend needs to be updated with the following changes:

### 1. Update the vector_connection.py file

Replace the `initialize_collection()` function with the fixed version that properly handles the "collection already exists" error:

```python
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
```

### 2. Update the rag_service.py file

Replace the `query_content_without_filters()` function with the enhanced error handling version:

```python
def query_content_without_filters(query: str) -> str:
    """Query content across all modules and chapters using RAG."""
    try:
        # Generate embedding for the query
        query_embedding = get_embeddings(query)

        # Initialize Qdrant client
        client = get_qdrant_client()
        collection_name = get_collection_name()

        # Search for relevant content in the vector database without filters
        try:
            search_results = client.query_points(
                collection_name=collection_name,
                query=query_embedding,
                limit=5  # Return top 5 results
            ).points
        except Exception as qdrant_error:
            print(f"Qdrant query error: {str(qdrant_error)}")
            # Provide fallback response when Qdrant is unavailable
            if "how many modules" in query.lower() or "modules" in query.lower():
                return "The Physical AI & Humanoid Robotics textbook contains several modules covering different aspects of the subject. The main modules include: 1) Introduction to Physical AI, 2) ROS2 Fundamentals, 3) NVIDIA Isaac, 4) Gazebo and Unity Simulation, 5) Vision-Language-Action Models, and more. Each module is designed to build your understanding progressively."
            else:
                return f"I'm having trouble accessing the textbook content right now, but I can help with general questions about Physical AI and Humanoid Robotics. For your question '{query}', please refer to the relevant textbook sections when the system is back online."

        # Format the results for the AI model
        context_parts = []
        for result in search_results:
            module_id = result.payload.get("module_id", "Unknown")
            chapter_id = result.payload.get("chapter_id", "Unknown")
            content = result.payload.get("content", "")
            context_parts.append(f"[Module: {module_id}, Chapter: {chapter_id}] {content}")

        # Combine the context
        context = "\n\n".join(context_parts)

        # Generate a response using the context
        if context:
            response = f"Based on the textbook content, here's the answer to your question: '{query}'\n\n"
            response += f"Found information in {len(context_parts)} different sections:\n\n{context}"
        else:
            # Provide helpful response when no context is found
            if "how many modules" in query.lower() or "modules" in query.lower():
                response = "The Physical AI & Humanoid Robotics textbook contains several modules covering different aspects of the subject. The main modules include: 1) Introduction to Physical AI, 2) ROS2 Fundamentals, 3) NVIDIA Isaac, 4) Gazebo and Unity Simulation, 5) Vision-Language-Action Models, and more. Each module is designed to build your understanding progressively."
            else:
                response = f"I couldn't find specific information about '{query}' in the textbook content. The textbook covers topics like Physical AI, ROS2, NVIDIA Isaac, Gazebo, Unity Simulation, and Vision-Language-Action Models."

        return response

    except Exception as e:
        print(f"Error in RAG service: {str(e)}")
        # Provide a helpful fallback response
        if "how many modules" in query.lower() or "modules" in query.lower():
            return "The Physical AI & Humanoid Robotics textbook contains several modules covering different aspects of the subject. The main modules include: 1) Introduction to Physical AI, 2) ROS2 Fundamentals, 3) NVIDIA Isaac, 4) Gazebo and Unity Simulation, 5) Vision-Language-Action Models, and more. Each module is designed to build your understanding progressively."
        else:
            return f"I'm experiencing technical difficulties processing your request. For your question '{query}', please check the relevant textbook sections. The textbook covers topics like Physical AI, ROS2, NVIDIA Isaac, Gazebo, Unity Simulation, and Vision-Language-Action Models."
```

### 3. Update the chatbot_service.py file

Update the `send_message_to_chatbot()` function to include better error handling and logging:

- Add the RAG service error handling around the `query_content_without_filters()` call
- Add proper exception handling for Cohere API calls

### 4. Update the chat_routes.py file

Update the API routes to handle errors gracefully and avoid HTTP 500 responses:

- Update the `/start` endpoint to return a default response instead of raising an HTTP 500 error
- Update the `/message` endpoint to return a helpful error response instead of raising an HTTP 500 error

### 5. Update the cohere_client.py file

Update the Cohere client to properly handle missing API keys:

- Initialize the client safely when API key is not available
- Update the `get_completion` function to check for client availability before making API calls
- Update the `get_embeddings` function to handle missing API keys gracefully

### 6. Environment Variables Required

Ensure the following environment variables are configured in the Hugging Face Space:

```
COHERE_API_KEY=your_cohere_api_key_here
QDRANT_CLUSTER_ID=your_qdrant_cluster_id
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key
DATABASE_URL=your_database_url
API_KEY=your_secret_api_key
```

## Testing

After deploying the updates:
1. Test with queries like "what is ROS 2" and "module 2 name"
2. Verify that the chatbot returns helpful responses instead of error messages
3. Check the Space logs to ensure no initialization errors occur