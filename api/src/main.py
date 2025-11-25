"""Main entrypoint for the FastAPI application."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.auth.router import router as auth_router
from src.config import settings
from src.middleware.tenant import TenantMiddleware
from src.routers.alert_rules import router as alert_rules_router
from src.routers.buildings import router as buildings_router
from src.routers.chiller_units import router as chiller_units_router
from src.routers.data_sources import router as data_sources_router
from src.routers.organizations import router as organizations_router

app = FastAPI(title="Chiller Intelligence API")

app.add_middleware(TenantMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def read_health():
    """Health check endpoint."""
    return {"status": "ok"}


app.include_router(auth_router)
app.include_router(organizations_router)
app.include_router(buildings_router)
app.include_router(chiller_units_router)
app.include_router(data_sources_router)
app.include_router(alert_rules_router)
