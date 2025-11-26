"""Database configuration and session management."""
from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool

from .config import settings


def create_engine_from_settings(current_settings):
    """Build a SQLAlchemy engine configured for the provided settings."""

    is_sqlite = current_settings.database_url.startswith("sqlite")
    connect_args = {"check_same_thread": False} if is_sqlite else {}
    engine_kwargs = {"future": True, "connect_args": connect_args}
    if is_sqlite:
        engine_kwargs["poolclass"] = StaticPool

    return create_engine(current_settings.database_url, **engine_kwargs)


engine = create_engine_from_settings(settings)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)
Base = declarative_base()


def get_db_session():
    """Provide a SQLAlchemy session for dependency injection."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
