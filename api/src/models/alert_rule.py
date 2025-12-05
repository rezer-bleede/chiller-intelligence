from __future__ import annotations

from datetime import datetime
from enum import Enum

from sqlalchemy import (
    Boolean,
    DateTime,
    Enum as SQLEnum,
    Float,
    ForeignKey,
    Integer,
    String,
    func,
    true,
    JSON,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db import Base
from .chiller_unit import ChillerUnit


class ConditionOperator(str, Enum):
    GT = "GT"
    LT = "LT"
    GTE = "GTE"
    LTE = "LTE"


class AlertSeverity(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"


class AlertRule(Base):
    """Defines an alert condition for a chiller unit metric."""

    __tablename__ = "alert_rules"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    chiller_unit_id: Mapped[int] = mapped_column(
        ForeignKey("chiller_units.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    metric_key: Mapped[str] = mapped_column(String(255), nullable=False)
    condition_operator: Mapped[ConditionOperator] = mapped_column(
        SQLEnum(ConditionOperator, name="condition_operator"), nullable=False
    )
    threshold_value: Mapped[float] = mapped_column(Float, nullable=False)
    severity: Mapped[AlertSeverity] = mapped_column(
        SQLEnum(AlertSeverity, name="alert_severity"), nullable=False
    )
    recipient_emails: Mapped[list[str]] = mapped_column(
        JSON().with_variant(JSON, "sqlite"), nullable=False, default=list
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean, nullable=False, server_default=true(), default=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    chiller_unit: Mapped[ChillerUnit] = relationship("ChillerUnit", back_populates="alert_rules")
