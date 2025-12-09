import os
import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///:memory:")
os.environ.setdefault("HISTORICAL_DATABASE_URL", "sqlite+pysqlite:///:memory:")

from src.db import (  # noqa: E402
    Base,
    SessionLocal,
    TelemetryBase,
    TelemetrySessionLocal,
    telemetry_engine,
    engine,
    get_db_session,
    get_telemetry_session,
)
from src.main import app  # noqa: E402


@pytest.fixture(autouse=True)
def clean_database():
    Base.metadata.drop_all(bind=engine)
    TelemetryBase.metadata.drop_all(bind=telemetry_engine)
    Base.metadata.create_all(bind=engine)
    TelemetryBase.metadata.create_all(bind=telemetry_engine)
    yield
    Base.metadata.drop_all(bind=engine)
    TelemetryBase.metadata.drop_all(bind=telemetry_engine)


def _override_get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db_session] = _override_get_db


def _override_get_telemetry_db():
    db = TelemetrySessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_telemetry_session] = _override_get_telemetry_db


from src.models import (
    Building,
    ChillerUnit,
    Organization,
    OrganizationType,
    User,
)
from src.auth.services import get_user_by_email, register_user  # noqa: E402


@pytest.fixture
def db_session() -> SessionLocal:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def telemetry_session() -> TelemetrySessionLocal:
    db = TelemetrySessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def default_organization(db_session: SessionLocal) -> Organization:
    org = Organization(name="Default Org", type=OrganizationType.ENERGY_MGMT)
    db_session.add(org)
    db_session.commit()
    db_session.refresh(org)
    return org


@pytest.fixture
def default_user(db_session: SessionLocal, default_organization: Organization) -> User:
    user = get_user_by_email(db_session, "test@example.com")
    if user:
        return user
    user = register_user(
        db_session, "test@example.com", "password", default_organization.id, "Test User"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user


@pytest.fixture
def default_building(db_session: SessionLocal) -> Building:
    def _default_building(organization_id: int) -> Building:
        building = Building(
            name="Default Building",
            organization_id=organization_id,
            location="Default Location",
        )
        db_session.add(building)
        db_session.commit()
        db_session.refresh(building)
        return building

    return _default_building


@pytest.fixture
def default_chiller_unit(db_session: SessionLocal) -> ChillerUnit:
    def _default_chiller_unit(building_id: int) -> ChillerUnit:
        unit = ChillerUnit(
            name="Default Chiller",
            building_id=building_id,
            manufacturer="Default Manufacturer",
            model="Default Model",
            capacity_tons=100.0,
        )
        db_session.add(unit)
        db_session.commit()
        db_session.refresh(unit)
        return unit

    return _default_chiller_unit
