from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from src.models.alert_rule import AlertSeverity, ConditionOperator


class AlertRuleBase(BaseModel):
    chiller_unit_id: Optional[int] = None
    name: str
    metric_key: str
    condition_operator: ConditionOperator
    threshold_value: float
    severity: AlertSeverity
    is_active: bool = True
    recipient_emails: list[str] = Field(default_factory=list)


class AlertRuleCreate(AlertRuleBase):
    chiller_unit_id: int


class AlertRuleUpdate(BaseModel):
    name: Optional[str] = None
    metric_key: Optional[str] = None
    condition_operator: Optional[ConditionOperator] = None
    threshold_value: Optional[float] = None
    severity: Optional[AlertSeverity] = None
    is_active: Optional[bool] = None
    recipient_emails: Optional[list[str]] = None


class AlertRuleResponse(AlertRuleBase):
    id: int
    chiller_unit_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
