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
        "/data_sources",
        json={
            "chiller_unit_id": chiller_unit.id,
            "type": "EXTERNAL_DB",
            "connection_params": {
                "live": {"host": "mqtt://localhost"},
                "historical_storage": {
                    "backend": "POSTGRES",
                    "host": "localhost",
                    "port": 5432,
                    "database": "test",
                    "username": "user",
                },
            },
        },
        headers=headers,
    )
    assert response.status_code == 422
    assert "password" in response.text


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
        "/data_sources",
        json={
            "chiller_unit_id": chiller_unit.id,
            "type": "EXTERNAL_DB",
            "connection_params": {
                "live": {"host": "localhost", "port": 1883},
                "historical_storage": {
                    "backend": "POSTGRES",
                    "host": "localhost",
                    "port": 5432,
                    "database": "test",
                    "username": "user",
                    "password": "password",
                    "preload_years": 2,
                },
            },
        },
        headers=headers,
    )
    assert response.status_code == 201
