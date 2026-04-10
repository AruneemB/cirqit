from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import execution, export

app = FastAPI(title="Cirqit Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(execution.router)
app.include_router(export.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "0.1.0"}
