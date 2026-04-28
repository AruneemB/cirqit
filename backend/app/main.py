import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import execution, export, llm

app = FastAPI(title="Cirqit Backend", version="0.1.0")

_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
allowed_origins = [o.strip() for o in _origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(execution.router)
app.include_router(export.router)
app.include_router(llm.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}
