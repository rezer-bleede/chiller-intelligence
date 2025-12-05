from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from src.models.alert_rule import AlertSeverity


class AlertEventResponse(BaseModel):
    id: int
    alert_rule_id: Optional[int]
    chiller_unit_id: Optional[int]
    severity: AlertSeverity
    metric_key: str
    metric_value: float
    message: str
    triggered_at: datetime
    acknowledged: bool

    class Config:
        from_attributes = True


class AlertSummaryResponse(BaseModel):
    total: int
    by_severity: dict[str, int]


class AlertFeedResponse(BaseModel):
    summary: AlertSummaryResponse
    alerts: list[AlertEventResponse]
