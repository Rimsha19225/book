# Data Model: RAG Chatbot System

## Entity: Book Content
- **Attributes**:
  - id: UUID (primary key)
  - title: string (book title)
  - author: string (book author)
  - created_at: datetime (timestamp)
  - updated_at: datetime (timestamp)
- **Relationships**: Contains many BookChunks
- **Validation**: Title and author are required

## Entity: BookChunk
- **Attributes**:
  - id: UUID (primary key)
  - book_id: UUID (foreign key to Book Content)
  - chunk_id: integer (sequence number within book)
  - content: text (the actual text content of the chunk)
  - metadata: JSON (additional info like chapter, page, section)
  - vector_id: UUID (reference to Qdrant vector ID)
  - created_at: datetime (timestamp)
- **Relationships**: Belongs to Book Content
- **Validation**: Content is required, chunk_id must be unique per book

## Entity: ChatSession
- **Attributes**:
  - id: UUID (primary key)
  - book_id: UUID (foreign key to Book Content)
  - created_at: datetime (timestamp)
  - updated_at: datetime (timestamp)
- **Relationships**: Contains many ChatMessages
- **Validation**: Must be associated with a valid book

## Entity: ChatMessage
- **Attributes**:
  - id: UUID (primary key)
  - session_id: UUID (foreign key to ChatSession)
  - role: string (either 'user' or 'assistant')
  - content: text (the message content)
  - timestamp: datetime (when the message was created)
  - sources: JSON (citations to book chunks used in response)
- **Relationships**: Belongs to ChatSession
- **Validation**: Role must be 'user' or 'assistant', content is required

## Entity: VectorMetadata
- **Attributes** (stored in Qdrant payload):
  - doc_id: UUID (reference to BookChunk)
  - chunk_id: integer (sequence number)
  - book_id: UUID (reference to Book Content)
  - metadata: JSON (additional context like chapter, page)
- **Relationships**: Maps to BookChunk in Postgres
- **Validation**: All references must be valid

## State Transitions

### Book Content
- Created → Ingested (when content is processed and chunks created)
- Ingested → Available (when vectors are stored in Qdrant)
- Available → Ready (when full RAG pipeline is tested)

### Chat Session
- Created → Active (when first message is exchanged)
- Active → Inactive (after period of inactivity)
- Inactive → Archived (after retention period)

## Constraints

1. **Referential Integrity**: All foreign key relationships must reference existing records
2. **Size Limits**: Individual chunks should not exceed 1000 tokens (approximately 500-800 characters)
3. **Uniqueness**: Vector IDs must be unique across the Qdrant collection
4. **Cascading Deletes**: When a book is deleted, all related chunks and chat history should be removed
5. **Data Retention**: Chat sessions may be cleaned up after a configurable period (e.g., 30 days)