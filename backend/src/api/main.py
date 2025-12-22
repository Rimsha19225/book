"""Main FastAPI application for the Physical AI & Humanoid Robotics Textbook."""
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from . import content_routes, chat_routes, auth_routes
from ..database.connection import engine, Base
from ..database.vector_connection import initialize_collection
import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create the FastAPI app
app = FastAPI(
    title="Physical AI & Humanoid Robotics Textbook API",
    description="API for the interactive textbook with AI-powered assistance",
    version="0.1.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(content_routes.router, prefix="/api/content", tags=["content"])
app.include_router(chat_routes.router, prefix="/api/chat", tags=["chat"])
app.include_router(auth_routes.router, prefix="/api/auth", tags=["auth"])

# Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "textbook-api"}


# Initialize database on startup
@app.on_event("startup")
async def on_startup():
    try:
        # Initialize Postgres tables
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")
        print("Make sure PostgreSQL is running and accessible")
    try:
        # Initialize Qdrant collection
        initialize_collection()
        print("Qdrant collection initialized successfully")
    except Exception as e:
        print(f"Error initializing Qdrant: {e}")


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)