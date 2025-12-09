"""Database configuration and session management."""
from __future__ import annotations

import logging

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from .config import settings
from .db_base import TelemetryBase


logger = logging.getLogger(__name__)


def _create_engine(database_url: str):
    """Build a SQLAlchemy engine configured for the provided URL."""

    is_sqlite = database_url.startswith("sqlite")
    connect_args = {"check_same_thread": False} if is_sqlite else {}
    engine_kwargs = {"future": True, "connect_args": connect_args}
    if is_sqlite:
        engine_kwargs["poolclass"] = StaticPool

    return create_engine(database_url, **engine_kwargs)


def create_engine_from_settings(current_settings):
    """Backward-compatible helper to build an engine from a settings object."""

    return _create_engine(current_settings.database_url)


def configure_telemetry_engine(database_url: str | None = None):
    """(Re)configure the telemetry engine and session factory."""

    global telemetry_engine, TelemetrySessionLocal  # noqa: PLW0603

    url = database_url or settings.historical_database_url
    telemetry_engine = _create_engine(url)
    TelemetrySessionLocal = sessionmaker(
        bind=telemetry_engine, autoflush=False, autocommit=False, future=True
    )


engine = _create_engine(settings.database_url)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


configure_telemetry_engine()


def get_db_session():
    """Provide a SQLAlchemy session for dependency injection."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_telemetry_session():
    """Provide a SQLAlchemy session connected to the telemetry database."""

    db = TelemetrySessionLocal()
    try:
        yield db
    finally:
        db.close()


# Ensure the telemetry schema exists for environments without migrations.
# All models must be imported before create_all is called
import src.models
try:
    TelemetryBase.metadata.create_all(bind=telemetry_engine)
except Exception as exc:  # pragma: no cover - defensive startup
    logger.warning("Unable to initialize telemetry database: %s", exc)
