"""Main entrypoint for the FastAPI application."""
from __future__ import annotations

from fastapi import FastAPI

app = FastAPI(title="Chiller Intelligence API")


@app.get("/health")
def read_health():
    """Health check endpoint."""
    return {"status": "ok"}
