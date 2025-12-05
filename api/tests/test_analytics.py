from datetime import datetime, timedelta, timezone

from fastapi import status


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def setup_org_with_telemetry(client):
    register_response = client.post(
        "/auth/register",
        json={
            "organization_name": "Analytics Org",
            "organization_type": "ESCO",
            "admin_email": "analytics@example.com",
            "admin_password": "password123",
            "admin_name": "Analyst",
        },
    )
    token = register_response.json()["access_token"]

    building = client.post(
        "/buildings",
        json={"name": "HQ", "location": "DXB", "latitude": None, "longitude": None},
        headers=auth_header(token),
    ).json()

    chiller = client.post(
        "/chiller_units",
        json={
            "building_id": building["id"],
            "name": "Chiller A",
            "manufacturer": "ACME",
            "model": "X1",
            "capacity_tons": 120,
        },
        headers=auth_header(token),
    ).json()

    now = datetime.now(timezone.utc)
    for offset in range(3):
        payload = {
            "unit_id": chiller["id"],
            "timestamp": (now - timedelta(hours=offset)).isoformat(),
            "inlet_temp": 12.0 + offset,
            "outlet_temp": 7.0 + offset * 0.1,
            "power_kw": 30 + offset,
            "flow_rate": 10 + offset,
            "cop": 3.5 + offset * 0.1,
        }
        resp = client.post(
            "/telemetry/ingest",
            json=payload,
            headers=auth_header(token),
        )
        assert resp.status_code == status.HTTP_201_CREATED

    return token, building["id"], chiller["id"]


def test_plant_overview_respects_org(client):
    token, building_id, _ = setup_org_with_telemetry(client)

    response = client.get(
        "/analytics/plant-overview",
        headers=auth_header(token),
        params={"building_id": building_id},
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["cooling_load_rth"] >= 0
    assert data["power_consumption_kw"] > 0
    assert "efficiency_gain_percent" in data


def test_consumption_efficiency_returns_series(client):
    token, _, chiller_id = setup_org_with_telemetry(client)
    start = datetime.now(timezone.utc) - timedelta(days=1)

    response = client.get(
        "/analytics/consumption-efficiency",
        headers=auth_header(token),
        params={"start": start.isoformat(), "chiller_unit_id": chiller_id, "granularity": "hour"},
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data["series"], list)
    assert data["series"][0]["timestamp"] is not None


def test_equipment_metrics_per_chiller(client):
    token, _, _ = setup_org_with_telemetry(client)

    response = client.get("/analytics/equipment-metrics", headers=auth_header(token))
    assert response.status_code == status.HTTP_200_OK
    payload = response.json()
    assert payload["units"]
    assert "efficiency_kwh_per_tr" in payload["units"][0]
