---
id: 1
title: Update RAG Chatbot Constitution
stage: constitution
date: 2025-12-20
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: Claude
command: sp.constitution
labels: [constitution,rag,chatbot,project-setup]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

Project: Integrated RAG Chatbot Development for Embedding in a Published Book
Core principles:

Functionality focused on accurate retrieval and generation based on book content, including user-selected text
Modularity and scalability using specified tools for backend, database, vector storage, and AI integrations
User-centric design ensuring seamless embedding into digital book formats (e.g., interactive web or app interfaces)
Privacy and security in handling book content and user queries
Estimated at 2-4 weeks

Success criteria:

Chatbot accurately answers 95% of test queries based on full book or selected text, validated against ground truth
Successful embedding demonstration in a sample digital book format without errors
Zero security vulnerabilities detected in code review or scans
Full project reproducibility: Anyone with Cohere API key can deploy via provided instructions
Positive user feedback simulation: High satisfaction in clarity, relevance, and usability of responses
Efficiency in resource usage, leveraging free tiers and open-source tools where possible

Key standards:

AI integration: Use Cohere API exclusively for embeddings, reranking, and generation; no OpenAI dependencies
Development tools: Incorporate Spec-Kit Plus for specification-driven development and Qwen CLI for agentic coding assistance to ensure high-quality, structured implementation
Retrieval accuracy: RAG pipeline must achieve at least 90% relevance in retrieved chunks, verified through testing with sample queries
Database and storage: Neon Serverless Postgres for metadata and structured data; Qdrant Cloud Free Tier for vector embeddings
Backend framework: FastAPI for API endpoints, with proper error handling and authentication
Testing rigor: Unit tests for each component, integration tests for the full pipeline, and user simulation tests for selected-text queries
Code quality: Follow PEP 8 standards, include comprehensive documentation, and ensure reproducibility via version control

## Response snapshot

Updated the project constitution to reflect the Integrated RAG Chatbot Development project instead of the previous Physical AI & Humanoid Robotics textbook project. The new constitution includes core principles focused on accurate retrieval and generation, modularity with specified tools, user-centric design for digital book integration, privacy and security, efficient resource usage, and Cohere API exclusivity. Quality standards and development workflows were also updated to match the new project requirements.

## Outcome

- ✅ Impact: Updated constitution to match new project goals and requirements
- 🧪 Tests: none
- 📁 Files: Updated .specify/memory/constitution.md
- 🔁 Next prompts: Continue with project implementation based on new constitution
- 🧠 Reflection: Constitution now properly reflects the RAG chatbot project instead of the previous robotics textbook project

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): initial constitution update
- Next experiment (smallest change to try): proceed with project planning based on updated constitution