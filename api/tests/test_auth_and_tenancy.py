from __future__ import annotations

from __future__ import annotations

from fastapi import status


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def test_register_login_and_me_flow(client):
    register_payload = {
        "organization_name": "Org One",
        "organization_type": "ENERGY_MGMT",
        "admin_email": "admin1@example.com",
        "admin_password": "password123",
        "admin_name": "Admin One",
    }

    register_response = client.post("/auth/register", json=register_payload)
    assert register_response.status_code == status.HTTP_201_CREATED
    token = register_response.json()["access_token"]

    login_response = client.post(
        "/auth/login",
        json={"email": register_payload["admin_email"], "password": register_payload["admin_password"]},
    )
    assert login_response.status_code == status.HTTP_200_OK
    login_token = login_response.json()["access_token"]

    me_response = client.get("/auth/me", headers=auth_header(login_token))
    assert me_response.status_code == status.HTTP_200_OK
    me_payload = me_response.json()
    assert me_payload["user"]["email"] == register_payload["admin_email"]
    assert me_payload["organization"]["name"] == register_payload["organization_name"]


def test_multi_tenancy_enforced(client):
    # Org 1
    response_org1 = client.post(
        "/auth/register",
        json={
            "organization_name": "Org A",
            "organization_type": "FM",
            "admin_email": "adminA@example.com",
            "admin_password": "password123",
            "admin_name": "Admin A",
        },
    )
    token_org1 = response_org1.json()["access_token"]

    building_response = client.post(
        "/buildings",
        json={"name": "HQ", "location": "City", "latitude": 1.0, "longitude": 2.0},
        headers=auth_header(token_org1),
    )
    assert building_response.status_code == status.HTTP_201_CREATED
    building_id = building_response.json()["id"]

    # Org 2
    response_org2 = client.post(
        "/auth/register",
        json={
            "organization_name": "Org B",
            "organization_type": "ESCO",
            "admin_email": "adminB@example.com",
            "admin_password": "password123",
            "admin_name": "Admin B",
        },
    )
    token_org2 = response_org2.json()["access_token"]

    forbidden_response = client.get(f"/buildings/{building_id}", headers=auth_header(token_org2))
    assert forbidden_response.status_code == status.HTTP_403_FORBIDDEN


def test_full_crud_for_chiller_stack(client):
    register_response = client.post(
        "/auth/register",
        json={
            "organization_name": "Cooling Corp",
            "organization_type": "ENERGY_MGMT",
            "admin_email": "adminC@example.com",
            "admin_password": "password123",
            "admin_name": "Admin C",
        },
    )
    token = register_response.json()["access_token"]

    building = client.post(
        "/buildings",
        json={"name": "Plant", "location": "Remote", "latitude": None, "longitude": None},
        headers=auth_header(token),
    ).json()

    chiller = client.post(
        "/chiller-units",
        json={
            "building_id": building["id"],
            "name": "Chiller 1",
            "manufacturer": "ACME",
            "model": "X1",
            "capacity_tons": 150.5,
        },
        headers=auth_header(token),
    ).json()

    data_source = client.post(
        "/data-sources",
        json={
            "chiller_unit_id": chiller["id"],
            "type": "MQTT",
            "connection_params": {"host": "localhost", "port": 1883},
        },
        headers=auth_header(token),
    )
    assert data_source.status_code == status.HTTP_201_CREATED
    data_source_id = data_source.json()["id"]

    alert_rule = client.post(
        "/alert-rules",
        json={
            "chiller_unit_id": chiller["id"],
            "name": "High Temp",
            "metric_key": "temp",
            "condition_operator": "GT",
            "threshold_value": 5.0,
            "severity": "WARNING",
            "is_active": True,
        },
        headers=auth_header(token),
    )
    assert alert_rule.status_code == status.HTTP_201_CREATED

    ds_list = client.get("/data-sources", headers=auth_header(token)).json()
    ar_list = client.get("/alert-rules", headers=auth_header(token)).json()

    assert len(ds_list) == 1
    assert ds_list[0]["id"] == data_source_id
    assert len(ar_list) == 1
    assert ar_list[0]["name"] == "High Temp"

    delete_resp = client.delete(f"/data-sources/{data_source_id}", headers=auth_header(token))
    assert delete_resp.status_code == status.HTTP_204_NO_CONTENT
