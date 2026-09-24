"""
Point d'entrée FastAPI du Parser Service.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import parser_router

app = FastAPI(
    title="HandStats Parser Service",
    description="Microservice d'extraction de données depuis les FDME (PDF)",
    version="0.1.0",
)

# ─── CORS (optionnel, le Core API est le principal consommateur) ───
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routes ───
app.include_router(parser_router, prefix="/api")


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "UP", "service": "handstats-parser-service"}
