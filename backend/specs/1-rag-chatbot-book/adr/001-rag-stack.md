# ADR-001: RAG Stack Technology Selection

## Status
Accepted

## Context
We need to implement a RAG (Retrieval-Augmented Generation) system for digital publications that allows users to ask questions about book content and receive contextually relevant answers. The system must support both full-book queries and selected-text queries, with response times under 5 seconds and 95% accuracy on test queries.

## Decision
We will use the following technology stack for the RAG system:

- **Backend Framework**: FastAPI for its async capabilities, automatic OpenAPI documentation, and performance
- **AI Provider**: Cohere exclusively (no OpenAI) for embeddings (embed-english-v3.0), reranking (rerank-english-v3.0), and generation (command-r-plus)
- **Vector Database**: Qdrant Cloud for vector storage and similarity search
- **Metadata Storage**: Neon Serverless Postgres for document metadata and chat history
- **Frontend Embedding**: HTML/JS lightweight component for book integration
- **Development Tools**: Python 3.12, Pydantic for data validation, SQLAlchemy for async database operations

## Alternatives Considered

### AI Provider Alternatives
1. **OpenAI**: Rejected due to requirement for Cohere-only integration
2. **Anthropic Claude**: Rejected due to requirement for Cohere-only integration
3. **Self-hosted models (e.g., BGE, SentenceTransformers)**: Rejected for complexity and performance reasons

### Vector Database Alternatives
1. **Pinecone**: Rejected due to requirement to use Qdrant Cloud
2. **Weaviate**: Rejected due to requirement to use Qdrant Cloud
3. **Milvus**: Rejected due to requirement to use Qdrant Cloud
4. **Local vector storage**: Rejected due to scalability requirements

### Backend Framework Alternatives
1. **Flask**: Rejected due to lack of async support and performance limitations
2. **Django**: Rejected as overkill for API-focused application
3. **Node.js/Express**: Rejected due to team's Python expertise and Cohere SDK availability

### Database Alternatives
1. **MongoDB**: Rejected due to preference for SQL for structured metadata
2. **Redis**: Rejected as not suitable for complex relationships and persistent storage

## Consequences

### Positive
- Cohere provides state-of-the-art models optimized for RAG applications
- Qdrant Cloud offers managed vector database with good performance
- FastAPI provides excellent developer experience and performance
- Neon Postgres offers serverless scalability and PostgreSQL compatibility
- Python ecosystem has strong support for AI/ML applications

### Negative
- Vendor lock-in to specific services (Cohere, Qdrant, Neon)
- Potential cost implications if free tier limits are exceeded
- Additional complexity of managing multiple services

## Technical Approach

### RAG Flow
1. **Ingestion**: Parse book content (PDF/TXT) → chunk text (500 chars + 50 overlap) → embed with Cohere → store vectors in Qdrant → store metadata in Neon Postgres
2. **Full-book Query**: Embed query → Qdrant similarity search (top-k=5) → Cohere rerank → fetch relevant chunks from Postgres → generate response with Cohere
3. **Selected-text Query**: Use provided text directly as context → generate response with Cohere

### Architecture
- FastAPI async endpoints for ingestion and chat
- CohereRAGPipeline class to orchestrate the RAG flow
- SQLAlchemy async models for database operations
- Qdrant client for vector operations
- HTML/JS embed component for book integration

## Assumptions
- Cohere API will remain available and stable
- Qdrant Cloud free tier will meet performance requirements
- Book content can be effectively chunked using character-based splitting
- 5-second response time is achievable with the selected stack