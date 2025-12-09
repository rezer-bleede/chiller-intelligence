from datetime import datetime, timezone

from fastapi.testclient import TestClient

from src.config import settings
from src.db import SessionLocal
from src.models import ChillerTelemetry, ChillerUnit
from src.seeder.demo_data import seed_demo_data


def test_service_token_can_ingest_telemetry(client: TestClient):
    seed_demo_data()
    session = SessionLocal()
    try:
        unit_id = session.query(ChillerUnit.id).first()[0]
    finally:
        session.close()

    payload = {
        "unit_id": unit_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "inlet_temp": 12.5,
        "outlet_temp": 7.3,
        "power_kw": 28.4,
        "flow_rate": 12.0,
        "cop": 3.8,
    }

    response = client.post(
        "/telemetry/ingest",
        json=payload,
        headers={"X-Service-Token": settings.service_token},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["unit_id"] == unit_id

    session = SessionLocal()
    try:
        db_record = (
            session.query(ChillerTelemetry)
            .order_by(ChillerTelemetry.timestamp.desc())
            .first()
        )
        assert db_record is not None
        assert db_record.chiller_unit_id == unit_id
        assert abs(db_record.inlet_temp - payload["inlet_temp"]) < 0.001
    finally:
        session.close()


def test_ingest_requires_auth_without_service_token(client: TestClient):
    seed_demo_data()
    session = SessionLocal()
    try:
        unit_id = session.query(ChillerUnit.id).first()[0]
    finally:
        session.close()

    payload = {
        "unit_id": unit_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "inlet_temp": 12.5,
        "outlet_temp": 7.3,
        "power_kw": 28.4,
        "flow_rate": 12.0,
        "cop": 3.8,
    }

    response = client.post("/telemetry/ingest", json=payload)

    assert response.status_code == 401
