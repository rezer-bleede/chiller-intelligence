from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db import Base


class ChillerTelemetry(Base):
    """Stores telemetry records for a chiller unit."""

    __tablename__ = "chiller_telemetry"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    chiller_unit_id: Mapped[int] = mapped_column(
        ForeignKey("chiller_units.id", ondelete="CASCADE"), nullable=False, index=True
    )
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    inlet_temp: Mapped[float] = mapped_column(Float, nullable=False)
    outlet_temp: Mapped[float] = mapped_column(Float, nullable=False)
    power_kw: Mapped[float] = mapped_column(Float, nullable=False)
    flow_rate: Mapped[float] = mapped_column(Float, nullable=False)
    cop: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    chiller_unit: Mapped["ChillerUnit"] = relationship(
        "ChillerUnit", back_populates="telemetry_records"
    )
