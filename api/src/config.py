"""Application configuration utilities."""
from __future__ import annotations

import os
from dataclasses import dataclass, field


@dataclass
class Settings:
    """Technical settings for the application."""

    database_url: str = field(
        default_factory=lambda: os.getenv(
            "DATABASE_URL", "postgresql+psycopg://postgres:postgres@db:5432/postgres"
        )
    )
    secret_key: str = field(default_factory=lambda: os.getenv("SECRET_KEY", "dev-secret-key"))
    allowed_origins: list[str] = field(
        default_factory=lambda: [
            origin.strip()
            for origin in os.getenv(
                "ALLOWED_ORIGINS",
                "http://localhost:3000,http://web:80,http://localhost:5173,http://127.0.0.1:5173,http://data-generator",
            ).split(",")
            if origin.strip()
        ]
    )
    service_token: str = field(
        default_factory=lambda: os.getenv("GENERATOR_SERVICE_TOKEN", "service-token-xyz")
    )
    smtp_host: str = field(default_factory=lambda: os.getenv("SMTP_HOST", ""))
    smtp_port: int = field(default_factory=lambda: int(os.getenv("SMTP_PORT", "587")))
    smtp_username: str = field(default_factory=lambda: os.getenv("SMTP_USERNAME", ""))
    smtp_password: str = field(default_factory=lambda: os.getenv("SMTP_PASSWORD", ""))
    smtp_use_tls: bool = field(default_factory=lambda: os.getenv("SMTP_USE_TLS", "true").lower() == "true")
    email_from: str = field(default_factory=lambda: os.getenv("EMAIL_FROM", "alerts@chiller.local"))


def get_settings() -> Settings:
    """Return an instance of :class:`Settings` with current environment values."""
    return Settings()


settings = get_settings()
