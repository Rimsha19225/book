# Configuration Guide

## Backend API Configuration

This project uses a multi-tier approach to configure the backend API URL:

1. **Global Variable**: The Docusaurus build process injects the API URL as `window.API_BASE_URL`
2. **Environment Variable**: `REACT_APP_API_BASE_URL` (fallback)
3. **GitHub Pages Detection**: Automatically detects GitHub Pages domains and uses the Hugging Face backend
4. **Local Development**: Defaults to `http://127.0.0.1:8000/api`

## Deployment

### Frontend (GitHub Pages)
- The Docusaurus plugin `docusaurus-plugin-inject-env` ensures the correct backend URL is injected during the build process
- Set the `REACT_APP_API_BASE_URL` environment variable during build to specify the backend URL

### Backend (Hugging Face Space)
- The backend is configured with permissive CORS settings to allow requests from GitHub Pages
- Uses Cohere API for AI responses with proper fallback responses when API key is unavailable
- Database and vector store connections are configured via environment variables

## Environment Variables

### Frontend
- `REACT_APP_API_BASE_URL`: The base URL for the backend API (e.g., `https://rimsha19225-physicalchatbot.hf.space/api`)

### Backend
- `COHERE_API_KEY`: Cohere API key for AI responses
- `QDRANT_CLUSTER_ID`, `QDRANT_URL`, `QDRANT_API_KEY`: Vector database configuration
- `DATABASE_URL`: PostgreSQL database connection string
- `API_KEY`: Authentication key for protected endpoints