from __future__ import annotations

from sqlalchemy.pool import StaticPool

from src.config import Settings
from src.db import create_engine_from_settings


def test_create_engine_uses_psycopg_driver_for_postgres():
    settings = Settings(database_url="postgresql+psycopg://user:pass@localhost:5432/testdb")

    engine = create_engine_from_settings(settings)

    try:
        assert engine.url.drivername == "postgresql+psycopg"
    finally:
        engine.dispose()


def test_create_engine_uses_static_pool_for_sqlite_memory():
    settings = Settings(database_url="sqlite+pysqlite:///:memory:")

    engine = create_engine_from_settings(settings)

    try:
        assert isinstance(engine.pool, StaticPool)
        assert engine.url.get_backend_name() == "sqlite"
    finally:
        engine.dispose()
