from __future__ import annotations

from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session

from src.db import get_db_session, get_telemetry_session
from src.models import Building, ChillerTelemetry, ChillerUnit
from src.models.user import User

router = APIRouter(prefix="/analytics", tags=["analytics"])

Granularity = Literal["minute", "hour", "day", "month"]


def _get_org_id(request: Request) -> int:
    current_user: User | None = getattr(request.state, "user", None)
    if current_user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated",
        )
    return current_user.organization_id


def _ensure_scope(
    db: Session,
    org_id: int,
    building_id: int | None,
    chiller_id: int | None,
):
    if building_id is not None:
        building = (
            db.query(Building)
            .filter(Building.id == building_id, Building.organization_id == org_id)
            .first()
        )
        if building is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Building not found")

    if chiller_id is not None:
        chiller = (
            db.query(ChillerUnit)
            .join(Building)
            .filter(
                ChillerUnit.id == chiller_id,
                Building.organization_id == org_id,
                or_(building_id is None, ChillerUnit.building_id == building_id),
            )
            .first()
        )
        if chiller is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chiller not found")


def _apply_filters(
    org_id: int,
    start: datetime | None,
    end: datetime | None,
    building_id: int | None,
    chiller_id: int | None,
):
    filters = [ChillerTelemetry.organization_id == org_id]

    if start is not None:
        filters.append(ChillerTelemetry.timestamp >= start)
    if end is not None:
        filters.append(ChillerTelemetry.timestamp <= end)
    if building_id is not None:
        filters.append(ChillerTelemetry.building_id == building_id)
    if chiller_id is not None:
        filters.append(ChillerTelemetry.chiller_unit_id == chiller_id)

    return and_(*filters)


def _bucket(granularity: Granularity, db: Session):
    dialect = db.get_bind().dialect.name if db.get_bind() is not None else "sqlite"
    if dialect == "sqlite":
        fmt = {
            "minute": "%Y-%m-%dT%H:%M:00",
            "hour": "%Y-%m-%dT%H:00:00",
            "day": "%Y-%m-%d 00:00:00",
            "month": "%Y-%m-01 00:00:00",
        }[granularity]
        return func.strftime(fmt, ChillerTelemetry.timestamp).label("bucket")

    mapping = {
        "minute": "minute",
        "hour": "hour",
        "day": "day",
        "month": "month",
    }
    return func.date_trunc(mapping[granularity], ChillerTelemetry.timestamp).label("bucket")


def _base_query(org_id: int, db: Session):
    return db.query(ChillerTelemetry).filter(ChillerTelemetry.organization_id == org_id)


def _cooling_load_expr():
    # Basic approximation using flow rate (gpm) * delta T * 500 to BTU/hr then convert to refrigeration tons
    delta_t = func.nullif(ChillerTelemetry.inlet_temp - ChillerTelemetry.outlet_temp, 0)
    return (ChillerTelemetry.flow_rate * delta_t * 500 / 12000).label("cooling_load")


@router.get("/plant-overview")
def plant_overview(
    request: Request,
    db: Session = Depends(get_db_session),
    telemetry_db: Session = Depends(get_telemetry_session),
    start: datetime | None = Query(None),
    end: datetime | None = Query(None),
    building_id: int | None = Query(None),
    chiller_unit_id: int | None = Query(None),
):
    org_id = _get_org_id(request)
    _ensure_scope(db, org_id, building_id, chiller_unit_id)
    filters = _apply_filters(org_id, start, end, building_id, chiller_unit_id)

    base = _base_query(org_id, telemetry_db).filter(filters)

    cooling_load_expr = _cooling_load_expr()
    totals = base.with_entities(
        func.coalesce(func.sum(cooling_load_expr), 0).label("cooling_load_rth"),
        func.coalesce(func.sum(ChillerTelemetry.power_kw), 0).label("power_kw"),
        func.coalesce(func.avg(ChillerTelemetry.cop), 0).label("avg_cop"),
    ).first()

    if totals is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No telemetry found")

    # Derived values (simple placeholders powered by recorded data)
    efficiency_gain = max(totals.avg_cop - 2.5, 0) / 2.5 * 100 if totals.avg_cop else 0
    monthly_savings = totals.cooling_load_rth * 0.12
    co2_saved = totals.power_kw * 0.42

    return {
        "cooling_load_rth": round(totals.cooling_load_rth, 2),
        "power_consumption_kw": round(totals.power_kw, 2),
        "avg_cop": round(totals.avg_cop, 2) if totals.avg_cop else 0,
        "efficiency_gain_percent": round(efficiency_gain, 2),
        "monthly_savings": round(monthly_savings, 2),
        "co2_saved": round(co2_saved, 2),
    }


@router.get("/consumption-efficiency")
def consumption_efficiency(
    request: Request,
    db: Session = Depends(get_db_session),
    telemetry_db: Session = Depends(get_telemetry_session),
    granularity: Granularity = Query("day"),
    start: datetime | None = Query(None),
    end: datetime | None = Query(None),
    building_id: int | None = Query(None),
    chiller_unit_id: int | None = Query(None),
):
    org_id = _get_org_id(request)
    _ensure_scope(db, org_id, building_id, chiller_unit_id)
    bucket = _bucket(granularity, telemetry_db)
    filters = _apply_filters(org_id, start, end, building_id, chiller_unit_id)

    rows = (
        _base_query(org_id, telemetry_db)
        .filter(filters)
        .with_entities(
            bucket,
            func.sum(_cooling_load_expr()).label("cooling_rth"),
            func.sum(ChillerTelemetry.power_kw).label("power_kw"),
            func.avg(ChillerTelemetry.cop).label("avg_cop"),
        )
        .group_by(bucket)
        .order_by(bucket)
        .all()
    )

    def to_dict(row):
        efficiency = (row.power_kw / row.cooling_rth) if row.cooling_rth else None
        return {
            "timestamp": row.bucket,
            "cooling_rth": round(row.cooling_rth or 0, 3),
            "power_kw": round(row.power_kw or 0, 3),
            "efficiency_kwh_per_tr": round(efficiency, 4) if efficiency else None,
            "avg_cop": round(row.avg_cop or 0, 3),
        }

    return {"series": [to_dict(r) for r in rows]}


@router.get("/equipment-metrics")
def equipment_metrics(
    request: Request,
    db: Session = Depends(get_db_session),
    telemetry_db: Session = Depends(get_telemetry_session),
    start: datetime | None = Query(None),
    end: datetime | None = Query(None),
    building_id: int | None = Query(None),
):
    org_id = _get_org_id(request)
    _ensure_scope(db, org_id, building_id, None)
    filters = _apply_filters(org_id, start, end, building_id, None)

    rows = (
        _base_query(org_id, telemetry_db)
        .filter(filters)
        .with_entities(
            ChillerTelemetry.chiller_unit_id.label("unit_id"),
            func.sum(_cooling_load_expr()).label("cooling_rth"),
            func.sum(ChillerTelemetry.power_kw).label("power_kw"),
            func.avg(ChillerTelemetry.cop).label("avg_cop"),
        )
        .group_by(ChillerTelemetry.chiller_unit_id)
        .order_by(ChillerTelemetry.chiller_unit_id)
        .all()
    )

    if not rows:
        return {"units": []}

    unit_names = {
        row.id: row.name
        for row in db.query(ChillerUnit.id, ChillerUnit.name)
        .join(Building)
        .filter(Building.organization_id == org_id)
        .all()
    }

    total_cooling = sum(r.cooling_rth or 0 for r in rows) or 1
    total_power = sum(r.power_kw or 0 for r in rows) or 1

    return {
        "units": [
            {
                "id": r.unit_id,
                "name": unit_names.get(r.unit_id, f"Chiller {r.unit_id}"),
                "cooling_share": round((r.cooling_rth or 0) / total_cooling * 100, 2),
                "power_share": round((r.power_kw or 0) / total_power * 100, 2),
                "efficiency_kwh_per_tr": round((r.power_kw or 0) / (r.cooling_rth or 1), 4),
                "avg_cop": round(r.avg_cop or 0, 3),
            }
            for r in rows
        ]
    }


@router.get("/chiller-trends")
def chiller_trends(
    request: Request,
    db: Session = Depends(get_db_session),
    telemetry_db: Session = Depends(get_telemetry_session),
    granularity: Granularity = Query("hour"),
    start: datetime | None = Query(None),
    end: datetime | None = Query(None),
    chiller_unit_id: int | None = Query(None),
):
    org_id = _get_org_id(request)
    _ensure_scope(db, org_id, None, chiller_unit_id)
    bucket = _bucket(granularity, telemetry_db)
    filters = _apply_filters(org_id, start, end, None, chiller_unit_id)

    rows = (
        _base_query(org_id, telemetry_db)
        .filter(filters)
        .with_entities(
            bucket,
            ChillerTelemetry.chiller_unit_id.label("unit_id"),
            func.avg(ChillerTelemetry.inlet_temp).label("ewt"),
            func.avg(ChillerTelemetry.outlet_temp).label("lwt"),
            func.avg(ChillerTelemetry.power_kw).label("power_kw"),
            func.avg(_cooling_load_expr()).label("cooling_rth"),
        )
        .group_by(bucket, ChillerTelemetry.chiller_unit_id)
        .order_by(bucket)
        .all()
    )

    chiller_names = {
        row.id: row.name
        for row in db.query(ChillerUnit.id, ChillerUnit.name)
        .join(Building)
        .filter(Building.organization_id == org_id)
        .all()
    }

    data = {}
    for row in rows:
        if row.unit_id not in data:
            data[row.unit_id] = {
                "unit_id": row.unit_id,
                "unit_name": chiller_names.get(row.unit_id, f"Chiller {row.unit_id}"),
                "points": [],
            }
        data[row.unit_id]["points"].append(
            {
                "timestamp": row.bucket,
                "ewt": round(row.ewt or 0, 3),
                "lwt": round(row.lwt or 0, 3),
                "power_kw": round(row.power_kw or 0, 3),
                "cooling_rth": round(row.cooling_rth or 0, 3),
                "capacity_pct": round((row.cooling_rth or 0) / 100 * 10, 3),
            }
        )

    return {"chillers": list(data.values())}

