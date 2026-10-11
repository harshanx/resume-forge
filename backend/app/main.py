from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import resume, auth, resume_version

app = FastAPI(
    title="ResumeForge API",
    description="ATS-Friendly One-Page Resume Builder",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(resume.router)
app.include_router(auth.router)
app.include_router(resume_version.router)


@app.get("/")
async def root():
    return {
        "message": "ResumeForge API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
