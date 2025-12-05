from __future__ import annotations

from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user
from src.db import get_db_session
from src.models import AlertEvent, AlertSeverity, Building, ChillerUnit, Organization, User
from src.schemas.alert_event import AlertEventResponse, AlertFeedResponse, AlertSummaryResponse

router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("", response_model=AlertFeedResponse)
def list_alerts(
    severity: Optional[AlertSeverity] = Query(None),
    start: Optional[datetime] = Query(None),
    end: Optional[datetime] = Query(None),
    chiller_unit_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    base_query = (
        db.query(AlertEvent)
        .join(ChillerUnit, isouter=True)
        .join(Building, isouter=True)
        .join(Organization, Organization.id == Building.organization_id, isouter=True)
        .filter(
            or_(
                Building.organization_id == current_user.organization_id,
                Organization.id == current_user.organization_id,
                AlertEvent.chiller_unit_id.is_(None),
            )
        )
    )

    filters = []
    if severity:
        filters.append(AlertEvent.severity == severity)
    if start:
        filters.append(AlertEvent.triggered_at >= start)
    if end:
        filters.append(AlertEvent.triggered_at <= end)
    if chiller_unit_id:
        filters.append(AlertEvent.chiller_unit_id == chiller_unit_id)

    filtered_query = base_query
    if filters:
        filtered_query = base_query.filter(and_(*filters))

    alerts = filtered_query.order_by(AlertEvent.triggered_at.desc()).all()

    summary_rows = (
        filtered_query.with_entities(AlertEvent.severity, func.count(AlertEvent.id))
        .group_by(AlertEvent.severity)
        .all()
    )
    summary = AlertSummaryResponse(
        total=sum(row[1] for row in summary_rows),
        by_severity={row[0]: row[1] for row in summary_rows},
    )

    return {
        "summary": summary,
        "alerts": [AlertEventResponse.model_validate(alert) for alert in alerts],
    }
