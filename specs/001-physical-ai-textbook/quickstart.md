# Quickstart Guide: Physical AI & Humanoid Robotics Textbook

## Development Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- npm or yarn
- Docker (optional, for local services)

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install fastapi uvicorn python-dotenv openai qdrant-client psycopg2-binary

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys and connection strings
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install @docusaurus/core @docusaurus/preset-classic

# Start development server
npm start
```

## Environment Configuration

Create a `.env` file in the backend directory with:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Qdrant Configuration
QDRANT_URL=your_qdrant_url
QDRANT_API_KEY=your_qdrant_api_key

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost/dbname

# Application Configuration
APP_ENV=development
DEBUG=true
```

## Running the Application

### Backend (API Server)
```bash
# From backend directory
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (Docusaurus)
```bash
# From frontend directory
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Backend docs: http://localhost:8000/docs

## Key Features Setup

### 1. Content Management
Textbook content is stored in the `frontend/docs/` directory in Markdown format, organized by modules:
```
frontend/docs/
├── welcome/
├── introductory/
├── module-1-ros2/
├── module-2-gazebo-unity/
├── module-3-nvidia-isaac/
└── module-4-vla/
```

### 2. Chatbot Integration
The floating chat assistant is implemented as a React component that:
- Connects to the backend API at `/api/chat/`
- Maintains session context based on current chapter
- Supports text selection queries

### 3. Vector Search (RAG Pipeline)
To initialize the vector database with textbook content:
```bash
# From backend directory
python -m src.services.vector_service --init
```

This will:
- Parse all textbook content
- Generate embeddings using OpenAI
- Store in Qdrant vector database

## Testing

### Backend Tests
```bash
# Run backend tests
python -m pytest tests/
```

### Frontend Tests
```bash
# Run frontend tests
npm test
```

## Deployment

### Frontend (GitHub Pages)
```bash
# Build static files
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### Backend (Separate Hosting)
The backend API needs to be deployed to a platform that supports Python applications (e.g., Heroku, AWS, GCP, Railway).

## Troubleshooting

### Common Issues

1. **Chatbot not responding**: Check that the backend API is running and environment variables are set correctly.

2. **Content not loading**: Verify that content files are in the correct directory structure in `frontend/docs/`.

3. **Vector search errors**: Ensure Qdrant is properly configured and the initialization script has been run.

### API Endpoints
- Health check: `GET /health`
- Chat API: `POST /api/chat/{session_id}/message`
- Content API: `GET /api/content/modules`

## Development Workflow

1. Add new textbook content to the appropriate module directory
2. Update the sidebar configuration in `frontend/sidebars.js`
3. If adding new API endpoints, update the contract in `specs/001-physical-ai-textbook/contracts/`
4. Run tests before committing changes
5. Update documentation as needed