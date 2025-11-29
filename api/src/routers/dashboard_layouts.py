from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user
from src.db import get_db_session
from src.models import DashboardLayout, User
from src.schemas.dashboard_layout import DashboardLayoutResponse, DashboardLayoutUpsert, WidgetLayout

router = APIRouter(prefix="/dashboard-layouts", tags=["dashboard_layouts"])

DashboardPageKey = str

DEFAULT_LAYOUTS: dict[DashboardPageKey, list[WidgetLayout]] = {
    "dashboard_overview": [
        WidgetLayout(widgetId="kpi-cooling-load", x=0, y=0, w=3, h=3),
        WidgetLayout(widgetId="kpi-power", x=3, y=0, w=3, h=3),
        WidgetLayout(widgetId="kpi-efficiency-gain", x=6, y=0, w=3, h=3),
        WidgetLayout(widgetId="kpi-monthly-savings", x=9, y=0, w=3, h=3),
        WidgetLayout(widgetId="kpi-co2", x=0, y=3, w=3, h=3),
        WidgetLayout(widgetId="kpi-assets", x=3, y=3, w=3, h=3),
        WidgetLayout(widgetId="plant-efficiency", x=6, y=3, w=6, h=5),
        WidgetLayout(widgetId="cooling-consumption", x=0, y=8, w=12, h=5),
    ],
    "dashboard_equipment": [
        WidgetLayout(widgetId="equipment-efficiency", x=0, y=0, w=6, h=5),
        WidgetLayout(widgetId="power-vs-cooling", x=6, y=0, w=6, h=5),
        WidgetLayout(widgetId="chiller-health", x=0, y=5, w=12, h=8),
        WidgetLayout(widgetId="cooling-production", x=0, y=13, w=7, h=5),
        WidgetLayout(widgetId="equipment-ratio", x=7, y=13, w=5, h=5),
    ],
    "dashboard_telemetry": [
        WidgetLayout(widgetId="trend-ewt", x=0, y=0, w=4, h=4),
        WidgetLayout(widgetId="trend-lwt", x=4, y=0, w=4, h=4),
        WidgetLayout(widgetId="trend-power", x=8, y=0, w=4, h=4),
        WidgetLayout(widgetId="circuit-telemetry", x=0, y=4, w=12, h=10),
    ],
}


def _get_default_layout(page_key: DashboardPageKey) -> list[WidgetLayout]:
    return DEFAULT_LAYOUTS.get(page_key, [])


def _get_layout_record(db: Session, page_key: str, user: User) -> DashboardLayout | None:
    return (
        db.query(DashboardLayout)
        .filter(
            DashboardLayout.user_id == user.id,
            DashboardLayout.organization_id == user.organization_id,
            DashboardLayout.page_key == page_key,
        )
        .first()
    )


@router.get("/{page_key}", response_model=DashboardLayoutResponse)
def get_dashboard_layout(
    page_key: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    layout_record = _get_layout_record(db, page_key, current_user)
    if layout_record:
        layout_data = layout_record.layout_json
    else:
        layout_data = [item.model_dump() for item in _get_default_layout(page_key)]
    return DashboardLayoutResponse(page_key=page_key, layout=layout_data)


@router.put("/{page_key}", response_model=DashboardLayoutResponse)
def upsert_dashboard_layout(
    page_key: str,
    payload: DashboardLayoutUpsert,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    if len(payload.layout) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Layout cannot be empty",
        )

    layout_record = _get_layout_record(db, page_key, current_user)
    if layout_record is None:
        layout_record = DashboardLayout(
            user_id=current_user.id,
            organization_id=current_user.organization_id,
            page_key=page_key,
            layout_json=[item.model_dump() for item in payload.layout],
        )
    else:
        layout_record.layout_json = [item.model_dump() for item in payload.layout]

    db.add(layout_record)
    db.commit()
    db.refresh(layout_record)

    return DashboardLayoutResponse(page_key=page_key, layout=layout_record.layout_json)
