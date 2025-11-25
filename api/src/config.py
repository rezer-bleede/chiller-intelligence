"""Application configuration utilities."""
from __future__ import annotations

import os
from dataclasses import dataclass, field


@dataclass
class Settings:
    """Technical settings for the application."""

    database_url: str = field(
        default_factory=lambda: os.getenv(
            "DATABASE_URL", "postgresql+psycopg2://postgres:postgres@db:5432/postgres"
        )
    )
    secret_key: str = field(default_factory=lambda: os.getenv("SECRET_KEY", "dev-secret-key"))


def get_settings() -> Settings:
    """Return an instance of :class:`Settings` with current environment values."""
    return Settings()


settings = get_settings()
