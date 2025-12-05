"""Utility functions for evaluating alert rules and notifying recipients."""
from __future__ import annotations

import logging
from typing import Iterable

from sqlalchemy.orm import Session

from src.models import AlertEvent, AlertRule, ConditionOperator
from src.schemas.telemetry import TelemetryIngestRequest
from .email import send_email

logger = logging.getLogger(__name__)


def _metric_value(payload: TelemetryIngestRequest, metric_key: str) -> float | None:
    delta_t = payload.inlet_temp - payload.outlet_temp
    mapping = {
        "power_kw": payload.power_kw,
        "delta_t": delta_t,
        "cop": payload.cop,
        "flow_rate": payload.flow_rate,
    }
    return mapping.get(metric_key)


def _condition_met(operator: ConditionOperator, actual: float, threshold: float) -> bool:
    if operator == ConditionOperator.GT:
        return actual > threshold
    if operator == ConditionOperator.GTE:
        return actual >= threshold
    if operator == ConditionOperator.LT:
        return actual < threshold
    if operator == ConditionOperator.LTE:
        return actual <= threshold
    return False


def _render_message(rule: AlertRule, metric_value: float) -> str:
    return (
        f"{rule.name}: {rule.metric_key} {metric_value:.2f} "
        f"{rule.condition_operator.value} {rule.threshold_value:.2f}"
    )


def evaluate_alerts_for_payload(
    db: Session,
    chiller_unit_id: int,
    payload: TelemetryIngestRequest,
    rules: Iterable[AlertRule],
) -> list[AlertEvent]:
    """Evaluate telemetry payload against alert rules and record events.

    Email notifications are attempted but will not raise if email delivery fails.
    """

    events: list[AlertEvent] = []
    for rule in rules:
        metric_value = _metric_value(payload, rule.metric_key)
        if metric_value is None:
            continue
        if not _condition_met(rule.condition_operator, metric_value, rule.threshold_value):
            continue

        message = _render_message(rule, metric_value)
        event = AlertEvent(
            alert_rule_id=rule.id,
            chiller_unit_id=chiller_unit_id,
            severity=rule.severity,
            metric_key=rule.metric_key,
            metric_value=metric_value,
            message=message,
        )
        db.add(event)
        events.append(event)

        if rule.recipient_emails:
            try:
                send_email(
                    to_addresses=rule.recipient_emails,
                    subject=f"Chiller Alert: {rule.name}",
                    body=message,
                )
            except Exception as exc:  # pragma: no cover - defensive logging
                logger.warning("Failed to send alert email for rule %s: %s", rule.id, exc)

    if events:
        db.flush()
    return events
