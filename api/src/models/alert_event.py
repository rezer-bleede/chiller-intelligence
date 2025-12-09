from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db_base import Base
from .alert_rule import AlertRule, AlertSeverity
from .chiller_unit import ChillerUnit


class AlertEvent(Base):
    """Represents a single alert occurrence evaluated from telemetry."""

    __tablename__ = "alert_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    alert_rule_id: Mapped[int] = mapped_column(
        ForeignKey("alert_rules.id", ondelete="SET NULL"), nullable=True, index=True
    )
    chiller_unit_id: Mapped[int] = mapped_column(
        ForeignKey("chiller_units.id", ondelete="SET NULL"), nullable=True, index=True
    )
    severity: Mapped[AlertSeverity] = mapped_column(nullable=False)
    metric_key: Mapped[str] = mapped_column(String(255), nullable=False)
    metric_value: Mapped[float] = mapped_column(Float, nullable=False)
    message: Mapped[str] = mapped_column(String(500), nullable=False)
    triggered_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    acknowledged: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    alert_rule: Mapped[AlertRule | None] = relationship("AlertRule")
    chiller_unit: Mapped[ChillerUnit | None] = relationship("ChillerUnit")
