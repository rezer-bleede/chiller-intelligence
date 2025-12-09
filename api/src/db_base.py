"""Base classes for SQLAlchemy models."""
from __future__ import annotations

from sqlalchemy.orm import declarative_base

Base = declarative_base()
TelemetryBase = declarative_base()
