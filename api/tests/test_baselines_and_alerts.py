from datetime import datetime, timezone

from fastapi import status

from src.config import settings
from src.db import SessionLocal
from src.models import AlertEvent, ChillerUnit
from src.seeder.demo_data import seed_demo_data


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def register_user(client, email: str = "baseline@example.com") -> str:
    response = client.post(
        "/auth/register",
        json={
            "organization_name": "Baseline Org",
            "organization_type": "ENERGY_MGMT",
            "admin_email": email,
            "admin_password": "password123",
            "admin_name": "Admin",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    return response.json()["access_token"]


def test_baseline_imports_csv(client):
    token = register_user(client)
    csv_content = "name,metric_key,value\nCOP Target,cop,3.5"

    response = client.post(
        "/baseline-values/import",
        headers=auth_header(token),
        files={"file": ("baselines.csv", csv_content, "text/csv")},
    )

    assert response.status_code == status.HTTP_200_OK
    assert response.json()["created"] == 1

    list_response = client.get("/baseline-values", headers=auth_header(token))
    assert list_response.status_code == status.HTTP_200_OK
    payload = list_response.json()
    assert len(payload) == 1
    assert payload[0]["name"] == "COP Target"
    assert payload[0]["metric_key"] == "cop"


def test_alert_events_and_email_notification(monkeypatch, client):
    seed_demo_data()
    session = SessionLocal()
    try:
        unit_id = session.query(ChillerUnit.id).first()[0]
    finally:
        session.close()

    sent_emails: list[tuple] = []

    def _capture_email(to_addresses, subject, body):
        sent_emails.append((tuple(to_addresses), subject, body))
        return True

    monkeypatch.setattr("src.services.alert_engine.send_email", _capture_email)

    payload = {
        "unit_id": unit_id,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "inlet_temp": 12.0,
        "outlet_temp": 7.0,
        "power_kw": 99.0,
        "flow_rate": 10.0,
        "cop": 3.0,
    }

    response = client.post(
        "/telemetry/ingest",
        json=payload,
        headers={"X-Service-Token": settings.service_token},
    )

    assert response.status_code == status.HTTP_201_CREATED

    session = SessionLocal()
    try:
        events = session.query(AlertEvent).all()
        assert len(events) >= 1
        assert any(event.metric_key == "power_kw" for event in events)
    finally:
        session.close()

    assert sent_emails, "Expected alert emails to be sent"
