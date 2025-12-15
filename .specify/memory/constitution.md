<!-- SYNC IMPACT REPORT:
Version change: N/A (initial creation) → 1.0.0
Added sections: All principles and sections as specified for Physical AI & Humanoid Robotics textbook
Removed sections: N/A
Templates requiring updates: ⚠ pending (plan-template.md, spec-template.md, tasks-template.md, command files)
Follow-up TODOs: None
-->
# Physical AI & Humanoid Robotics Textbook Constitution

## Core Principles

### Technical Accuracy and Educational Clarity
All content must maintain the highest level of technical accuracy for robotics and AI concepts while remaining accessible to beginners. Every explanation must include practical examples and code snippets that are tested and functional. Rationale: Ensures learners gain genuine understanding of complex robotics concepts without confusion.

### Interactive Learning Experience
The textbook must provide interactive elements including the integrated RAG chatbot for immediate Q&A support. The UI shall feature a modern blue-themed floating chat assistant positioned at bottom-right for seamless access. Rationale: Enhances learning through immediate feedback and contextual assistance.

### Modular Architecture (NON-NEGOTIABLE)
The textbook is organized into 4 main modules (ROS 2, Gazebo/Unity, NVIDIA Isaac, VLA) that can be consumed independently while maintaining coherence. Each module follows the same structural patterns and quality standards. Rationale: Enables flexible learning paths and targeted content updates.

### Cross-Technology Integration
All components must work seamlessly together: Docusaurus frontend, FastAPI backend, Neon Postgres database, and Qdrant vector store. Each technology choice serves a specific purpose in the overall architecture. Rationale: Creates a cohesive learning experience with robust backend support.

### Responsive Design and Accessibility
All content and interfaces must be responsive across mobile and desktop devices. Typography uses clean, readable fonts (Inter or similar) with appropriate contrast ratios. Rationale: Ensures accessibility for diverse learners regardless of device or viewing conditions.

### Security-First Development
Environment variables and sensitive configurations must be handled securely with no hardcoded credentials. All API endpoints implement proper authentication and authorization where applicable. Rationale: Establishes secure development practices from the foundation.

## Quality Standards and Technical Requirements

All code snippets must be tested and validated before inclusion. Proper citations must be provided for all technical references and external sources. TypeScript is mandatory for all Docusaurus components with strict typing. The backend follows RESTful API design principles with comprehensive error handling.

Color theme specifications: Primary color #2563eb (modern blue), clean white/light gray backgrounds, soft shadows and rounded corners for modern aesthetics.

## Development Workflow and Standards

Development follows Git best practices with descriptive commit messages. TypeScript is used for all Docusaurus components with React best practices. The backend uses FastAPI with Python following RESTful design. Database operations use Neon Serverless Postgres with secure connection handling. Vector storage utilizes Qdrant Cloud with proper indexing strategies.

All pull requests require code review with focus on technical accuracy, clarity, and adherence to architectural principles. Automated testing covers both frontend and backend components where applicable.

## Governance

This constitution governs all aspects of the Physical AI & Humanoid Robotics textbook development. All code, content, and architectural decisions must comply with these principles. Amendments require documentation of the change, approval from the core team, and a migration plan if needed. All contributions must reference this constitution during review.

Quality gates include technical accuracy verification, code snippet validation, responsive design testing, and accessibility compliance checks.

**Version**: 1.0.0 | **Ratified**: 2025-12-15 | **Last Amended**: 2025-12-15