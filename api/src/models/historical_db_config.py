from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, DateTime, Integer, String, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from src.db_base import Base


class HistoricalDBConfig(Base):
    """Stores the connection information for the historical telemetry database."""

    __tablename__ = "historical_db_configs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    connection_url: Mapped[str] = mapped_column(String(1024), nullable=False)
    connection_params: Mapped[dict] = mapped_column(
        JSONB(astext_type=String()).with_variant(JSON, "sqlite"), default={}
    )
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
