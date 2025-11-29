from fastapi import status


def auth_header(token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {token}"}


def register_user(client, email: str, org_name: str = "Org") -> str:
    response = client.post(
        "/auth/register",
        json={
            "organization_name": org_name,
            "organization_type": "ENERGY_MGMT",
            "admin_email": email,
            "admin_password": "password123",
            "admin_name": "Admin",
        },
    )
    assert response.status_code == status.HTTP_201_CREATED
    return response.json()["access_token"]


def test_default_layout_returned_when_missing(client):
    token = register_user(client, "layout1@example.com")

    response = client.get(
        "/dashboard-layouts/dashboard_overview", headers=auth_header(token)
    )

    assert response.status_code == status.HTTP_200_OK
    payload = response.json()
    assert payload["page_key"] == "dashboard_overview"
    assert any(item["widgetId"] == "kpi-cooling-load" for item in payload["layout"])


def test_layout_can_be_saved_and_retrieved(client):
    token = register_user(client, "layout2@example.com")
    new_layout = {
        "layout": [
            {"widgetId": "kpi-cooling-load", "x": 1, "y": 2, "w": 3, "h": 4},
            {"widgetId": "plant-efficiency", "x": 0, "y": 0, "w": 6, "h": 4},
        ]
    }

    save_response = client.put(
        "/dashboard-layouts/dashboard_overview",
        headers=auth_header(token),
        json=new_layout,
    )
    assert save_response.status_code == status.HTTP_200_OK

    fetch_response = client.get(
        "/dashboard-layouts/dashboard_overview", headers=auth_header(token)
    )
    assert fetch_response.status_code == status.HTTP_200_OK
    saved_payload = fetch_response.json()
    assert saved_payload["layout"] == new_layout["layout"]


def test_layout_is_tenant_isolated(client):
    token_org1 = register_user(client, "tenant1@example.com", org_name="Org A")
    token_org2 = register_user(client, "tenant2@example.com", org_name="Org B")

    layout_org1 = {
        "layout": [
            {"widgetId": "kpi-power", "x": 2, "y": 2, "w": 3, "h": 3}
        ]
    }

    save_org1 = client.put(
        "/dashboard-layouts/dashboard_overview",
        headers=auth_header(token_org1),
        json=layout_org1,
    )
    assert save_org1.status_code == status.HTTP_200_OK

    fetch_org2 = client.get(
        "/dashboard-layouts/dashboard_overview",
        headers=auth_header(token_org2),
    )
    assert fetch_org2.status_code == status.HTTP_200_OK
    payload_org2 = fetch_org2.json()["layout"]
    assert payload_org2 != layout_org1["layout"]
    assert any(item["widgetId"] == "kpi-cooling-load" for item in payload_org2)

    fetch_org1 = client.get(
        "/dashboard-layouts/dashboard_overview",
        headers=auth_header(token_org1),
    )
    assert fetch_org1.status_code == status.HTTP_200_OK
    assert fetch_org1.json()["layout"] == layout_org1["layout"]
