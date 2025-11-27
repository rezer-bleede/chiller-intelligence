from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db import Base
from .building import Building


class ChillerUnit(Base):
    """Represents a chiller unit located in a building."""

    __tablename__ = "chiller_units"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    building_id: Mapped[int] = mapped_column(
        ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    manufacturer: Mapped[str] = mapped_column(String(255), nullable=False)
    model: Mapped[str] = mapped_column(String(255), nullable=False)
    capacity_tons: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    building: Mapped[Building] = relationship("Building", back_populates="chiller_units")
    data_source_configs: Mapped[list["DataSourceConfig"]] = relationship(
        "DataSourceConfig", back_populates="chiller_unit", cascade="all, delete-orphan"
    )
    alert_rules: Mapped[list["AlertRule"]] = relationship(
        "AlertRule", back_populates="chiller_unit", cascade="all, delete-orphan"
    )
    telemetry_records: Mapped[list["ChillerTelemetry"]] = relationship(
        "ChillerTelemetry", back_populates="chiller_unit", cascade="all, delete-orphan"
    )
