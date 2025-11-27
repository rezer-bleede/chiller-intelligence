from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from src.config import settings
from src.constants import DEMO_ORG_NAME
from src.db import get_db_session
from src.models import Building, ChillerTelemetry, ChillerUnit, Organization, User
from src.schemas.telemetry import TelemetryIngestRequest, TelemetryResponse

router = APIRouter(prefix="/telemetry", tags=["telemetry"])


def _get_chiller_for_request(
    payload: TelemetryIngestRequest,
    db: Session,
    current_user: User | None,
    service_authenticated: bool,
) -> ChillerUnit:
    query = db.query(ChillerUnit).join(Building)

    if service_authenticated:
        chiller = (
            query.join(Organization)
            .filter(
                ChillerUnit.id == payload.unit_id,
                Organization.name == DEMO_ORG_NAME,
            )
            .first()
        )
    else:
        if current_user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated"
            )

        chiller = (
            query.filter(
                ChillerUnit.id == payload.unit_id,
                Building.organization_id == current_user.organization_id,
            )
            .first()
        )

    if chiller is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chiller not found")

    return chiller


@router.post("/ingest", response_model=TelemetryResponse, status_code=status.HTTP_201_CREATED)
def ingest_telemetry(
    payload: TelemetryIngestRequest,
    request: Request,
    db: Session = Depends(get_db_session),
):
    service_authenticated = request.headers.get("X-Service-Token") == settings.service_token
    current_user: User | None = getattr(request.state, "user", None)

    chiller = _get_chiller_for_request(payload, db, current_user, service_authenticated)

    telemetry = ChillerTelemetry(
        chiller_unit_id=chiller.id,
        timestamp=payload.timestamp,
        inlet_temp=payload.inlet_temp,
        outlet_temp=payload.outlet_temp,
        power_kw=payload.power_kw,
        flow_rate=payload.flow_rate,
        cop=payload.cop,
    )
    db.add(telemetry)
    db.commit()
    db.refresh(telemetry)

    return TelemetryResponse(
        id=telemetry.id,
        unit_id=telemetry.chiller_unit_id,
        timestamp=telemetry.timestamp,
        inlet_temp=telemetry.inlet_temp,
        outlet_temp=telemetry.outlet_temp,
        power_kw=telemetry.power_kw,
        flow_rate=telemetry.flow_rate,
        cop=telemetry.cop,
    )
