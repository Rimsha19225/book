---
id: 1
title: rag-chatbot-book-plan
stage: plan
date_iso: 2025-12-20
surface: agent
model: Claude Sonnet 4.5
feature: rag-chatbot-book
branch: 1-rag-chatbot-book
user: Claude Code User
command: /sp.plan
labels: ["rag", "chatbot", "cohere", "fastapi", "planning"]
links:
  spec: null
  ticket: null
  adr: "specs/1-rag-chatbot-book/adr/001-rag-stack.md"
  pr: null
files_yaml: |
  - specs/1-rag-chatbot-book/plan.md
  - specs/1-rag-chatbot-book/research.md
  - specs/1-rag-chatbot-book/data-model.md
  - specs/1-rag-chatbot-book/quickstart.md
  - specs/1-rag-chatbot-book/contracts/chat-api.yaml
  - specs/1-rag-chatbot-book/adr/001-rag-stack.md
tests_yaml: |
  - "N/A - Planning phase"
prompt_text: |
  Integrated RAG Chatbot Development for Embedding in a Published Book
  Reference these exactly as generated:

  Constitution: .specify/memory/constitution.md
  Specification: .specify/spec.md (or specs/default/spec.md)

  Your task: Generate a comprehensive technical implementation plan in .specify/plan.md using the template at .specify/templates/plan-template.md. Adhere strictly to the constitution and specification. Use Spec-Kit Plus and Qwen CLI for all development steps.
  Target: Modular FastAPI backend with Cohere-powered RAG (embeddings, reranking, generation), Neon Postgres for metadata/chat history, Qdrant for vectors. Frontend embedding via HTML/JS (e.g., iframe or Streamlit/Gradio demo). Two modes: full-book query, selected-text query (pass text chunk directly, skip retrieval or hybrid).
  Credentials (hardcode as env vars in code and .env.example; never expose in git):

  NEON_DB_URL=postgresql://neondb_owner:npg_52OMckEruNGo@ep-lucky-feather-a4zvf3ip-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
  QDRANT_CLUSTER_ID=affc3c00-6e6a-49dc-821a-e89dc4173150
  QDRANT_URL=https://affc3c00-6e6a-49dc-821a-e89dc4173150.us-east4-0.gcp.cloud.qdrant.io
  QDRANT_API_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.vCjcP4SfwdED-4nui4TjOpKaIMdWnq_015P7S9BLO1c
  COHERE_API_KEY=Cr4ge45csKQcVHB0s5g8FFbYcSYs6gK2xbRwTqrF

  Step-by-step planning process:

  Research & Validation: Use tools (web_search, browse_page) to confirm latest docs/best practices (as of Dec 2025):
  Cohere SDK: embeddings (embed-english-v3.0), rerank (rerank-english-v3.0), generate (command-r-plus), RAG examples.
  Qdrant Python client: free tier limits (~1GB vectors), collections, upsert/query with metadata.
  Neon Postgres: asyncpg or SQLAlchemy, tables for documents (id, book_id, chunk_id, text, metadata), chats (session_id, query, response, timestamp).
  FastAPI: /ingest (upload book PDF/TXT, chunk/ embed/ store), /chat (query: str, mode: "full"|"selected", selected_text?: str), /embed-book.
  Chunking: recursive char 500/50 overlap, metadata {chapter, page}.
  No OpenAI; Cohere only. Free tiers: Qdrant/Neon.

  Architecture Decision Record (ADR): Create .specify/adr/001-rag-stack.md
  Stack: FastAPI (ASGI), Cohere (all AI), Pydantic (models), LangChain/ LlamaIndex? (minimal, prefer native for Cohere), sentence-transformers? No—Cohere embeddings.
  DB Schema: Neon - documents (id UUID, book_uuid UUID, chunk_id int, content text, metadata jsonb, vector_id uuid), sessions (id UUID, book_uuid, history jsonb).
  Qdrant: collection "book_vectors" (dim=1024 for Cohere embed-v3), payload {doc_id, chunk_id, book_uuid}.
  RAG Flow:
  Ingest: parse book (PyMuPDF/TXT), chunk, embed (Cohere), upsert Qdrant + metadata Neon.
  Query full: embed query → Qdrant top-k=5 → Cohere rerank → fetch chunks Neon → prompt Cohere generate (context + query, cite sources).
  Selected: embed selected_text → hybrid (similarity + keyword?) or direct context → generate.

  Embedding: JS client (cohere-js lite) for book-side selection.
  Security: API key auth (FastAPI Depends), CORS for book domain, rate-limit (slowapi).
  Project structure (single repo, FastAPI + static embed):textrag-book-chatbot/
  ├── app/
  │   ├── core/          # config, deps (CohereClient, QdrantClient, DBSession)
  │   ├── models/         # Pydantic: BookChunk, QueryReq, ChatResp (with citations)
  │   ├── api/            # v1/ingest, v1/chat, v1/health
  │   ├── rag/            # chunker, retriever, generator (CohereRAGPipeline)
  │   ├── db/             # schema, migrations (Alembic)
  │   └── main.py         # FastAPI app, lifespan (init clients)
  ├── tests/              # pytest: unit (rag_pipeline), integration (ingest→query), e2e (95% accuracy on sample book)
  ├── embed/              # static HTML/JS chatbot (fetch /chat, highlight text JS)
  ├── docker-compose.yml  # Neon proxy? Local dev Postgres/Qdrant if needed
  ├── requirements.txt    # fastapi==0.115, cohere>=5, qdrant-client>=1.10, sqlalchemy[asyncio], alembic, pydantic, uvicorn, pytest
  ├── .env.example
  └── README.md          # deploy (Render/Vercel free? Uvicorn), ingest sample book, embed demo
  Risks: Free tier limits (Qdrant 1GB=~500k chunks for 500k words), Cohere rate (free 1000rpm?), latency <5s (async).
  Tradeoffs: No LangChain (bloat, Cohere native better), hybrid search Qdrant.

  Tech Stack & Dependencies:
  Backend: Python 3.12, FastAPI 0.115+, Uvicorn.
  AI: cohere (embed, rerank-multilingual? english-v3, command-r).
  Vector: qdrant-client (cloud).
  DB: sqlalchemy 2.0 async, psycopg (neon compat), alembic.
  Utils: pydantic-settings (config), python-dotenv, httpx (async), PyMuPDF (pdf ingest).
  Embed: vanilla JS + Cohere JS SDK? Or fetch backend.
  Dev: ruff (lint), pytest (90% cov), pre-commit.
  No extras: free tiers, no paid.

  Implementation Phases (high-level, detail in /sp.tasks):
  Phase 1: Setup (project init, clients, DB schema/migrations).
  Phase 2: Ingest pipeline (parse/chunk/embed/upsert).
  Phase 3: RAG core (retrieve/rerank/generate, two modes).
  Phase 4: API endpoints + auth/rate-limit.
  Phase 5: Tests (mock Cohere, sample book "Alice in Wonderland" TXT).
  Phase 6: Embed UI (HTML chat, text select → query).
  Phase 7: Docs/deploy (Docker, README w/ curl ingest/chat).

  Quality Gates (checklists):
   Constitution compliance: Cohere only, 90% retrieval acc (RAGAS? simple cosine), <5s resp (locust test).
   Spec alignment: 95% test queries (20 full + 20 selected), ground truth from sample book.
   Risks: [NEEDS RESEARCH] Cohere dim? Free limits? Neon conn pooling.
   Dependencies: No OpenAI, handle 500k words (~5k chunks).
   Embed: <10KB JS, no backend dep for chat UI.

  Research Tasks:
  Confirm Cohere RAG tutorial (browse https://cohere.com/blog/rag-with-cohere).
  Qdrant+Cohere example (search "qdrant cohere rag python").
  FastAPI+Neon deploy free (Render.com free tier).


  Output ONLY the filled plan.md content. Flag [NEEDS CLARIFICATION] for gaps
response_text: |
  Successfully created the implementation plan for the Integrated RAG Chatbot for Digital Publications. The following artifacts were created:

  1. Implementation Plan: specs/1-rag-chatbot-book/plan.md
  2. Research Summary: specs/1-rag-chatbot-book/research.md
  3. Data Model: specs/1-rag-chatbot-book/data-model.md
  4. Quickstart Guide: specs/1-rag-chatbot-book/quickstart.md
  5. API Contract: specs/1-rag-chatbot-book/contracts/chat-api.yaml
  6. Architecture Decision Record: specs/1-rag-chatbot-book/adr/001-rag-stack.md

  The plan includes:
  - Technical context with Python 3.12, FastAPI, Cohere SDK, Qdrant, and Neon Postgres
  - Project structure for a web application with backend API and frontend embedding
  - Research findings on Cohere models, Qdrant, Neon, chunking strategies, and deployment options
  - Data models for books, chunks, chat sessions, and messages
  - API contracts for the main endpoints
  - An ADR documenting the technology stack selection
  - Quickstart guide for setting up and using the system
outcome: |
  Plan successfully created with all required components. The implementation approach follows the specified requirements including Cohere-only AI integration, FastAPI backend, Neon Postgres for metadata, Qdrant for vectors, and HTML/JS embedding capability.
evaluation: |
  All required artifacts were created successfully. The plan adheres to the constitution and specification requirements. The chosen technology stack supports the required functionality including both full-book and selected-text query modes.
---