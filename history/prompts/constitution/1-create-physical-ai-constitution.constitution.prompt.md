---
id: 1
title: Create Physical AI Constitution
stage: constitution
date: 2025-12-15
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: Claude Code
command: /sp.constitution
labels: [constitution, physical-ai, textbook]
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

Create a constitution for a Physical AI & Humanoid Robotics textbook project with the following requirements:

PROJECT OVERVIEW:
- Interactive Docusaurus-based textbook
- 4 main modules covering ROS 2, Gazebo/Unity, NVIDIA Isaac, and VLA
- Integrated RAG chatbot using OpenAI SDK, FastAPI, Neon Postgres, and Qdrant
- Modern UI with floating chat assistant (blue theme, bottom-right position)
- GitHub Pages deployment

QUALITY STANDARDS:
- Technical accuracy for robotics and AI content
- Clear, beginner-friendly explanations with practical examples
- Code snippets must be tested and functional
- Proper citations for all technical references
- Responsive design for mobile and desktop

DEVELOPMENT GUIDELINES:
- Use TypeScript for Docusaurus components
- Follow React best practices
- RESTful API design for chatbot backend
- Secure environment variable handling
- Git commit messages should be descriptive

COLOR THEME:
- Primary: Modern blue (#2563eb)
- Background: Clean white/light gray
- Accents: Soft shadows and rounded corners
- Typography: Clean, readable fonts (Inter or similar)

ARCHITECTURE:
- Frontend: Docusaurus with React components
- Backend: FastAPI (Python)
- Database: Neon Serverless Postgres
- Vector Store: Qdrant Cloud (free tier)
- Deployment: GitHub Pages + separate backend hosting

## Response snapshot

Created a comprehensive constitution for the Physical AI & Humanoid Robotics textbook project with six core principles:

1. Technical Accuracy and Educational Clarity
2. Interactive Learning Experience
3. Modular Architecture (NON-NEGOTIABLE)
4. Cross-Technology Integration
5. Responsive Design and Accessibility
6. Security-First Development

The constitution includes quality standards, technical requirements, development workflow standards, and governance procedures. It establishes the foundational principles for developing the interactive Docusaurus-based textbook with the specified architecture and design requirements.

## Outcome

- ✅ Impact: Created initial project constitution at .specify/memory/constitution.md with version 1.0.0
- 🧪 Tests: none
- 📁 Files: 1 file created (.specify/memory/constitution.md)
- 🔁 Next prompts: Project constitution established for future development
- 🧠 Reflection: Constitution captures all specified requirements including the four main modules, technology stack, UI design, and quality standards

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): PASS - All requirements from user input incorporated
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Begin developing project specifications based on this constitution