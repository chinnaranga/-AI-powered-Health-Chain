import os
import sys

# Ensure workspace root is in sys.path to allow fastapi_server imports in sub-processes
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_server.routes import router
import uvicorn

app = FastAPI(
    title="HealthChain AI Intelligence Platform API",
    description="Secure Google Gemma 4 Healthcare Intelligence Core API",
    version="1.0.0"
)

# CORS configuration to allow local React app communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict this to specific frontend URLs in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes
app.include_router(router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to the HealthChain AI Intelligence Platform API",
        "status": "active",
        "documentation": "/docs"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "engine": "Google Gemma 4 Core",
        "active": True
    }

if __name__ == "__main__":
    uvicorn.run("fastapi_server.main:app", host="0.0.0.0", port=8000, reload=True)
