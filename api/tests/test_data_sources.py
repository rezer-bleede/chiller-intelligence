from __future__ import annotations

from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from src.models import ChillerUnit, User


def test_create_external_db_data_source_with_invalid_params(
    client: TestClient,
    db_session: Session,
    default_user: User,
    default_building,
    default_chiller_unit,
):
    building = default_building(default_user.organization_id)
    chiller_unit = default_chiller_unit(building.id)
    response = client.post(
        "/auth/login",
        json={"email": default_user.email, "password": "password"},
    )
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(
        "/data-sources",
        json={
            "chiller_unit_id": chiller_unit.id,
            "type": "EXTERNAL_DB",
            "connection_params": {
                "host": "localhost",
                "port": 5432,
                "database": "test",
            },
        },
        headers=headers,
    )
    assert response.status_code == 400
    assert "must include host, port, database, username, and password" in response.text


def test_create_external_db_data_source_with_valid_params(
    client: TestClient,
    db_session: Session,
    default_user: User,
    default_building,
    default_chiller_unit,
):
    building = default_building(default_user.organization_id)
    chiller_unit = default_chiller_unit(building.id)
    response = client.post(
        "/auth/login",
        json={"email": default_user.email, "password": "password"},
    )
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post(
        "/data-sources",
        json={
            "chiller_unit_id": chiller_unit.id,
            "type": "EXTERNAL_DB",
            "connection_params": {
                "host": "localhost",
                "port": 5432,
                "database": "test",
                "username": "user",
                "password": "password",
            },
        },
        headers=headers,
    )
    assert response.status_code == 201


def test_historical_db_config_endpoints(
    client: TestClient,
    default_user: User,
    default_building,
    default_chiller_unit,
):
    building = default_building(default_user.organization_id)
    default_chiller_unit(building.id)

    login = client.post(
        "/auth/login",
        json={"email": default_user.email, "password": "password"},
    )
    token = login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    initial = client.get("/data-sources/historical-db", headers=headers)
    assert initial.status_code == 200
    assert initial.json()["connection_params"]["driver"]

    update = client.put(
        "/data-sources/historical-db",
        headers=headers,
        json={
            "driver": "sqlite+pysqlite",
            "host": "localhost",
            "port": 0,
            "database": "memory",
            "username": "",  # not required for sqlite
            "password": "",  # not stored in response
        },
    )

    assert update.status_code == 200
    payload = update.json()
    assert payload["source"] == "database"
    assert "sqlite+pysqlite" in payload["connection_url"]
