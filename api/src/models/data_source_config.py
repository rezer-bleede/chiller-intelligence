from __future__ import annotations

from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as SQLEnum, ForeignKey, Integer, JSON, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db_base import Base
from .chiller_unit import ChillerUnit


class DataSourceType(str, Enum):
    MQTT = "MQTT"
    HTTP = "HTTP"
    FILE_UPLOAD = "FILE_UPLOAD"
    EXTERNAL_DB = "EXTERNAL_DB"


class DataSourceConfig(Base):
    """Configuration for ingesting data into a chiller unit."""

    __tablename__ = "data_source_configs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    chiller_unit_id: Mapped[int] = mapped_column(
        ForeignKey("chiller_units.id", ondelete="CASCADE"), nullable=False, index=True
    )
    type: Mapped[DataSourceType] = mapped_column(
        SQLEnum(DataSourceType, name="data_source_type"), nullable=False
    )
    connection_params: Mapped[dict] = mapped_column(
        JSONB().with_variant(JSON, "sqlite"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    chiller_unit: Mapped[ChillerUnit] = relationship("ChillerUnit", back_populates="data_source_configs")
