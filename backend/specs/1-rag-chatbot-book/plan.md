# Implementation Plan: Integrated RAG Chatbot for Digital Publications

**Branch**: `1-rag-chatbot-book` | **Date**: 2025-12-20 | **Spec**: [specs/1-rag-chatbot-book/spec.md](specs/1-rag-chatbot-book/spec.md)
**Input**: Feature specification from `/specs/1-rag-chatbot-book/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Develop a modular RAG chatbot system that enables interactive querying of book content using Cohere AI, with a FastAPI backend, Neon Postgres for metadata, and Qdrant for vector embeddings. The system supports two query modes: full-book semantic search and selected-text context generation, with embeddable HTML/JS components for digital publications.

## Technical Context

**Language/Version**: Python 3.12
**Primary Dependencies**: FastAPI 0.115+, Cohere SDK 5+, Qdrant Client 1.10+, SQLAlchemy 2.0 async, Pydantic, PyMuPDF
**Storage**: Neon Serverless Postgres (metadata/chat history), Qdrant Cloud (vector embeddings)
**Testing**: pytest with 90%+ coverage, unit tests for RAG pipeline, integration tests for ingest→query flow, e2e tests for 95% accuracy on sample book
**Target Platform**: Linux server (deployable on Render/Vercel free tier), embeddable in web-based books via HTML/JS
**Project Type**: Web application with backend API and frontend embedding components
**Performance Goals**: <5 seconds response time for 95% of queries, handle books up to 500,000 words
**Constraints**: Cohere-only AI integration (no OpenAI), free tier limits (Qdrant 1GB, Neon connection pooling), <10KB JS embed size
**Scale/Scope**: Single book focus, handle ~5k chunks for 500k words, concurrent user queries

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Test-First (NON-NEGOTIABLE)**: All components will follow TDD approach with tests written before implementation
- **Integration Testing**: Focus on contract tests between Cohere API, Qdrant vector store, and Neon database
- **Observability**: Structured logging for RAG pipeline, performance metrics for response times
- **Simplicity**: Minimal dependencies, native Cohere integration instead of heavy frameworks like LangChain

## Project Structure

### Documentation (this feature)

```text
specs/1-rag-chatbot-book/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
rag-book-chatbot/
├── app/
│   ├── core/          # config, deps (CohereClient, QdrantClient, DBSession)
│   ├── models/        # Pydantic: BookChunk, QueryReq, ChatResp (with citations)
│   ├── api/           # v1/ingest, v1/chat, v1/health
│   ├── rag/           # chunker, retriever, generator (CohereRAGPipeline)
│   ├── db/            # schema, migrations (Alembic)
│   └── main.py        # FastAPI app, lifespan (init clients)
├── tests/             # pytest: unit (rag_pipeline), integration (ingest→query), e2e (95% accuracy on sample book)
├── embed/             # static HTML/JS chatbot (fetch /chat, highlight text JS)
├── docker-compose.yml # Local dev Postgres/Qdrant if needed
├── requirements.txt   # fastapi==0.115, cohere>=5, qdrant-client>=1.10, sqlalchemy[asyncio], alembic, pydantic, uvicorn, pytest
├── .env.example
└── README.md          # deploy (Render/Vercel free? Uvicorn), ingest sample book, embed demo
```

**Structure Decision**: Web application structure chosen to support backend API for RAG operations and frontend embedding components for digital book integration. The single repository approach allows cohesive development while separating concerns between API and embedding components.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Multiple storage systems (Postgres + Qdrant) | Vector databases optimized for similarity search, relational DBs for metadata | Single system would compromise either vector search performance or relational query capabilities |
| Two query modes (full-book & selected-text) | Required by specification for different user interaction patterns | Single mode would not fulfill the requirement for both general book queries and selected text queries |