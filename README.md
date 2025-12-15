# Physical AI & Humanoid Robotics Textbook

An interactive Docusaurus-based textbook for Physical AI & Humanoid Robotics with integrated AI chatbot functionality.

## Overview

This project implements an interactive textbook covering:
- Welcome and introductory content
- Module 1: The Robotic Nervous System (ROS 2)
- Module 2: The Digital Twin (Gazebo & Unity)
- Module 3: The AI-Robot Brain (NVIDIA Isaac)
- Module 4: Vision-Language-Action (VLA)

The textbook features an integrated RAG chatbot using OpenAI embeddings, Qdrant vector search, and FastAPI backend services to provide context-aware responses based on current chapter content.

## Architecture

The solution follows a web application architecture with:
- **Frontend**: Docusaurus/React for interactive textbook interface
- **Backend**: FastAPI services for content management and AI integration
- **Database**: Neon Postgres for relational data
- **Vector Store**: Qdrant Cloud for embedding storage
- **Deployment**: GitHub Pages for frontend, separate hosting for backend

## Setup

### Backend
1. Navigate to the `backend` directory
2. Create a virtual environment: `python -m venv venv`
3. Activate it: `source venv/bin/activate` (Linux/Mac) or `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and configure your environment variables
6. Start the server: `uvicorn src.api.main:app --reload`

### Frontend
1. Navigate to the `frontend` directory
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure your environment variables
4. Start development server: `npm start`

## Technologies Used

- **Backend**: Python 3.11+, FastAPI, SQLAlchemy, OpenAI SDK
- **Frontend**: TypeScript 5.3+, Docusaurus, React
- **Database**: Neon Postgres, Qdrant Cloud
- **AI/ML**: OpenAI API, Vector embeddings, RAG pipeline