from fastapi.testclient import TestClient

from src.main import app


client = TestClient(app)


def test_health_endpoint_returns_ok_status():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
