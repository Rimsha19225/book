<!-- SYNC IMPACT REPORT:
Version change: 1.0.0 → 1.1.0
Added sections: Updated all principles and sections for Integrated RAG Chatbot Development project
Removed sections: Physical AI & Humanoid Robotics specific principles
Templates requiring updates: ⚠ pending (plan-template.md, spec-template.md, tasks-template.md, command files)
Follow-up TODOs: None
-->
# Integrated RAG Chatbot Development Constitution

## Core Principles

### Accurate Retrieval and Generation Based on Book Content
The chatbot must provide accurate answers based on the full book content or user-selected text segments. The RAG pipeline must achieve at least 90% relevance in retrieved chunks, verified through testing with sample queries. Rationale: Ensures learners receive precise and relevant information from the book content.

### Modularity and Scalability with Specified Tools
The system must utilize specified tools for backend (FastAPI), database (Neon Serverless Postgres), vector storage (Qdrant Cloud Free Tier), and AI integration (Cohere API exclusively). The architecture should be modular to allow for easy scaling and maintenance. Rationale: Enables efficient development, testing, and deployment while maintaining flexibility.

### User-Centric Design for Digital Book Integration
The chatbot interface must seamlessly embed into digital book formats (interactive web or app interfaces) with intuitive user experience. The UI shall provide clear feedback during query processing and maintain consistent styling with the book's presentation. Rationale: Enhances learning through immediate, contextual assistance without disrupting the reading experience.

### Privacy and Security in Content Handling
All book content and user queries must be handled with strict privacy controls and without external data leakage. Environment variables and sensitive configurations must be handled securely with no hardcoded credentials. Rationale: Protects intellectual property and user privacy.

### Efficient Resource Usage with Free Tiers
The implementation must leverage free tiers and open-source tools where possible to minimize costs while maintaining performance. The system should be designed for optimal resource utilization. Rationale: Makes the solution accessible to a wider audience while maintaining sustainability.

### Cohere API Exclusivity (NON-NEGOTIABLE)
The system must use Cohere API exclusively for embeddings, reranking, and generation; no OpenAI dependencies or other AI service providers are allowed. This ensures consistency and avoids vendor fragmentation. Rationale: Maintains architectural simplicity and predictable performance characteristics.

## Quality Standards and Technical Requirements

All components must be thoroughly tested with unit tests for each component, integration tests for the full pipeline, and user simulation tests for selected-text queries. The backend follows RESTful API design principles with proper error handling and authentication. Code quality must follow PEP 8 standards with comprehensive documentation.

The chatbot must accurately answer 95% of test queries based on full book or selected text, validated against ground truth. Zero security vulnerabilities should be detected in code review or scans.

## Development Workflow and Standards

Development follows Git best practices with descriptive commit messages. The backend uses FastAPI with Python following RESTful design. Database operations use Neon Serverless Postgres with secure connection handling. Vector storage utilizes Qdrant Cloud with proper indexing strategies. Development tools incorporate Spec-Kit Plus for specification-driven development and Claude Code for agentic coding assistance.

All pull requests require code review with focus on technical accuracy, clarity, and adherence to architectural principles. Testing rigor includes unit tests, integration tests, and user simulation tests.

## Governance

This constitution governs all aspects of the Integrated RAG Chatbot Development project. All code, content, and architectural decisions must comply with these principles. Amendments require documentation of the change, approval from the core team, and a migration plan if needed. All contributions must reference this constitution during review.

Quality gates include retrieval accuracy verification (90% relevance), response accuracy validation (95% correct answers), security vulnerability scanning, and performance benchmarking.

**Version**: 1.1.0 | **Ratified**: 2025-12-15 | **Last Amended**: 2025-12-20