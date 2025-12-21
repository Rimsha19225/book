# Tasks: Integrated RAG Chatbot for Digital Publications

## Feature Overview
Develop a modular RAG chatbot system that enables interactive querying of book content using Cohere AI, with a FastAPI backend, Neon Postgres for metadata, and Qdrant for vector embeddings. The system supports two query modes: full-book semantic search and selected-text context generation, with embeddable HTML/JS components for digital publications.

## Dependencies
- User Story 2 (Integration) depends on User Story 1 (Core functionality) being completed first
- User Story 3 (Large Books) depends on User Story 1 (Core functionality) being completed first

## Parallel Execution Examples
- [P] Tasks in Setup Phase can be executed in parallel: dependency installation, config setup, etc.
- [P] Model creation tasks can be executed in parallel: Book, BookChunk, ChatSession, ChatMessage models
- [P] API endpoint implementations can be developed in parallel after foundational services exist
- [P] Test tasks can be executed in parallel with implementation tasks for different components

## Implementation Strategy
- MVP Scope: Focus on User Story 1 (Core RAG functionality) with basic ingestion and chat capabilities
- Incremental Delivery: Complete User Story 1 first, then add embedding capabilities (US2), then optimize for large books (US3)

---

## Phase 1: Setup Tasks

- [ ] T001 Create project directory structure per implementation plan
- [ ] T002 Create requirements.txt with specified dependencies (FastAPI 0.115+, cohere>=5, qdrant-client>=1.10, sqlalchemy[asyncio], alembic, pydantic, uvicorn, pytest)
- [ ] T003 Create .env.example with all required environment variables
- [ ] T004 [P] Create app/main.py with basic FastAPI app initialization
- [ ] T005 [P] Create app/core/config.py for configuration management using pydantic-settings
- [ ] T006 [P] Create app/core/dependencies.py for dependency injection (CohereClient, QdrantClient, DBSession)
- [ ] T007 Create docker-compose.yml for local development with Postgres/Qdrant if needed
- [ ] T008 Create README.md with project overview and setup instructions

---

## Phase 2: Foundational Tasks

- [ ] T009 Create app/db/base.py with SQLAlchemy base class
- [ ] T010 Create app/db/session.py with async database session management
- [ ] T011 Create app/db/models.py with database model definitions (Book, BookChunk, ChatSession, ChatMessage)
- [ ] T012 Create Alembic migrations setup in app/db/migrations/
- [ ] T013 Create app/core/security.py with API key authentication middleware
- [ ] T014 Create app/core/clients.py with Cohere, Qdrant, and Neon client initialization
- [ ] T015 Create app/models/schemas.py with Pydantic schemas for API requests/responses
- [ ] T016 Create app/core/constants.py with system constants (chunk size, overlap, etc.)

---

## Phase 3: [US1] Query Book Content with RAG Chatbot

### Story Goal
Implement core RAG functionality that allows users to ask questions about book content and receive accurate, contextually relevant responses within 5 seconds.

### Independent Test Criteria
Can be fully tested by loading book content into the system, asking specific questions about the content, and verifying that responses are accurate and contextually relevant within 5 seconds.

### Implementation Tasks

- [ ] T017 [P] [US1] Create app/rag/chunker.py with text chunking functionality (500 chars + 50 overlap)
- [ ] T018 [P] [US1] Create app/rag/embedder.py with Cohere embedding functionality
- [ ] T019 [P] [US1] Create app/rag/retriever.py with Qdrant-based retrieval functionality
- [ ] T020 [P] [US1] Create app/rag/generator.py with Cohere generation functionality
- [ ] T021 [US1] Create app/rag/pipeline.py with CohereRAGPipeline class orchestrating the RAG flow
- [ ] T022 [P] [US1] Create app/services/book_service.py with book ingestion and management
- [ ] T023 [P] [US1] Create app/services/chat_service.py with chat session and message management
- [ ] T024 [US1] Create app/api/v1/endpoints/health.py with health check endpoint
- [ ] T025 [US1] Create app/api/v1/endpoints/ingest.py with book ingestion endpoint
- [ ] T026 [US1] Create app/api/v1/endpoints/chat.py with chat query endpoint supporting both modes
- [ ] T027 [US1] Create app/api/v1/router.py to register all API routes
- [ ] T028 [US1] Integrate API endpoints with main FastAPI app
- [ ] T029 [US1] Implement full-book query flow: embed query → Qdrant retrieval → Cohere rerank → context fetch → Cohere generation
- [ ] T030 [US1] Implement selected-text query flow: use provided text as context → Cohere generation
- [ ] T031 [US1] Add response time measurement and logging
- [ ] T032 [US1] Add source citations to responses with chunk references

### Test Tasks (if requested)
- [ ] T033 [P] [US1] Create tests/unit/test_chunker.py for chunking functionality
- [ ] T034 [P] [US1] Create tests/unit/test_rag_pipeline.py for RAG pipeline
- [ ] T035 [P] [US1] Create tests/integration/test_ingest_flow.py for book ingestion
- [ ] T036 [P] [US1] Create tests/integration/test_chat_flow.py for chat functionality

---

## Phase 4: [US2] Integrate Chatbot into Digital Book

### Story Goal
Implement embeddable HTML/JS component that can be seamlessly integrated into digital book formats without disrupting the reading experience.

### Independent Test Criteria
Can be tested by embedding the chatbot in a sample digital book and verifying that users can interact with it without disrupting the reading experience.

### Implementation Tasks

- [ ] T037 [P] [US2] Create embed/chatbot.js with JavaScript chatbot component
- [ ] T038 [P] [US2] Create embed/chatbot.css with styling for the chatbot component
- [ ] T039 [P] [US2] Create embed/index.html with demo page for the chatbot
- [ ] T040 [US2] Implement text selection detection and context menu in embed/chatbot.js
- [ ] T041 [US2] Add API communication functionality to fetch chat responses
- [ ] T042 [US2] Create app/api/v1/endpoints/embed.py with embedding support endpoints
- [ ] T043 [US2] Implement secure communication between embed component and backend
- [ ] T044 [US2] Add configuration options for embed component (backend URL, book ID, etc.)
- [ ] T045 [US2] Optimize embed component size to be under 10KB
- [ ] T046 [US2] Add error handling and fallback behavior for embed component

### Test Tasks (if requested)
- [ ] T047 [US2] Create tests/unit/test_embed_component.js for embed functionality

---

## Phase 5: [US3] Handle Large Book Content

### Story Goal
Optimize the system to handle books up to 500,000 words without performance degradation, maintaining response times under 5 seconds.

### Independent Test Criteria
Can be tested by indexing a large book (up to 500,000 words) and verifying that query response times remain under 5 seconds with maintained accuracy.

### Implementation Tasks

- [ ] T048 [P] [US3] Create app/rag/optimizer.py with performance optimization utilities
- [ ] T049 [US3] Implement batch processing for large book ingestion
- [ ] T050 [US3] Add memory management for processing large documents
- [ ] T051 [US3] Implement chunk caching to improve retrieval performance
- [ ] T052 [US3] Add performance monitoring and metrics collection
- [ ] T053 [US3] Optimize database queries for large datasets
- [ ] T054 [US3] Implement efficient vector storage and retrieval for large books
- [ ] T055 [US3] Add progress tracking for large book ingestion
- [ ] T056 [US3] Implement rate limiting and resource management

### Test Tasks (if requested)
- [ ] T057 [US3] Create tests/performance/test_large_books.py for performance testing

---

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T058 Add comprehensive error handling and validation across all endpoints
- [ ] T059 Add structured logging throughout the application
- [ ] T060 Implement proper exception handling with appropriate HTTP status codes
- [ ] T061 Add request/response validation using Pydantic
- [ ] T062 Implement rate limiting with slowapi
- [ ] T063 Add CORS configuration for book domain integration
- [ ] T064 Create comprehensive API documentation
- [ ] T065 Add input sanitization and security measures
- [ ] T066 Implement graceful shutdown and cleanup procedures
- [ ] T067 Add comprehensive unit and integration tests to achieve 90%+ coverage
- [ ] T068 Create sample book ingestion script for testing
- [ ] T069 Update README.md with complete documentation
- [ ] T070 Perform end-to-end testing with sample book to verify 95% accuracy
- [ ] T071 Optimize for deployment on Render.com free tier
- [ ] T072 Conduct final performance testing to ensure <5s response times