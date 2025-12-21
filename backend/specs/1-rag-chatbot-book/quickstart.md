# Quickstart Guide: RAG Chatbot for Digital Publications

## Prerequisites

- Python 3.12+
- pip package manager
- Git
- Cohere API key
- Access to Neon Postgres and Qdrant Cloud

## Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd rag-book-chatbot
```

### 2. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables

Create a `.env` file based on `.env.example`:

```env
NEON_DB_URL=postgresql://neondb_owner:npg_52OMckEruNGo@ep-lucky-feather-a4zvf3ip-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
QDRANT_CLUSTER_ID=affc3c00-6e6a-49dc-821a-e89dc4173150
QDRANT_URL=https://affc3c00-6e6a-49dc-821a-e89dc4173150.us-east4-0.gcp.cloud.qdrant.io
QDRANT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.vCjcP4SfwdED-4nui4TjOpKaIMdWnq_015P7S9BLO1c
COHERE_API_KEY=Cr4ge45csKQcVHB0s5g8FFbYcSYs6gK2xbRwTqrF
API_KEY=your-secret-api-key-for-authentication
```

## Running the Application

### 1. Initialize Database

```bash
alembic upgrade head
```

### 2. Start the Server

```bash
uvicorn app.main:app --reload --port 8000
```

## Ingesting Book Content

### 1. Upload a Book

```bash
curl -X POST "http://localhost:8000/v1/ingest" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@path/to/your/book.pdf" \
  -F "title=Your Book Title" \
  -F "author=Author Name"
```

### 2. Verify Ingestion

Check that the book has been processed by listing available books:

```bash
curl -X GET "http://localhost:8000/v1/books" \
  -H "Authorization: Bearer your-api-key"
```

## Querying the Chatbot

### 1. Full-Book Query

```bash
curl -X POST "http://localhost:8000/v1/chat" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the main theme of this book?",
    "mode": "full",
    "book_id": "your-book-uuid"
  }'
```

### 2. Selected-Text Query

```bash
curl -X POST "http://localhost:8000/v1/chat" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Explain this concept in simpler terms",
    "mode": "selected",
    "selected_text": "The complex concept is described in this text block...",
    "book_id": "your-book-uuid"
  }'
```

## Embedding in Digital Books

### 1. HTML Integration

Include the chatbot in your digital book HTML:

```html
<div id="rag-chatbot-container"></div>
<script src="/embed/chatbot.js"></script>
<script>
  initRagChatbot({
    backendUrl: 'http://your-backend-url',
    apiKey: 'your-api-key',
    bookId: 'your-book-uuid'
  });
</script>
```

### 2. Text Selection Feature

The embedded chatbot will automatically detect text selection and provide a context menu for selected-text queries.

## Development

### Running Tests

```bash
# Unit tests
pytest tests/unit/

# Integration tests
pytest tests/integration/

# All tests
pytest
```

### Linting

```bash
ruff check
ruff format
```

## API Endpoints

- `GET /v1/health` - Health check
- `POST /v1/ingest` - Upload and process book content
- `GET /v1/books` - List available books
- `POST /v1/chat` - Query the RAG chatbot
- `GET /v1/chat/sessions` - List chat sessions
- `GET /v1/chat/session/{session_id}` - Get specific chat session

## Troubleshooting

### Common Issues

1. **API Key Authentication**: Ensure your API key is correct and included in requests
2. **Database Connection**: Verify NEON_DB_URL is correctly configured
3. **Vector Store**: Confirm QDRANT credentials are valid and accessible
4. **Cohere API**: Check that COHERE_API_KEY is valid and has sufficient quota

### Performance

- Large books may take several minutes to fully ingest
- Response times may vary based on query complexity and vector search performance
- Monitor your Cohere API usage to avoid rate limits