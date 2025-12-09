from src.db import SessionLocal
from datetime import timedelta

from datetime import timedelta

from sqlalchemy import func

from src.db import SessionLocal, TelemetrySessionLocal
from src.models import (
    AlertRule,
    Building,
    ChillerTelemetry,
    ChillerUnit,
    DataSourceConfig,
    Organization,
    User,
)
from src.seeder.demo_data import seed_demo_data


def test_seed_demo_data_populates_entities():
    seed_demo_data()

    session = SessionLocal()
    telemetry_session = TelemetrySessionLocal()
    try:
        organization_count = session.query(Organization).count()
        building_count = session.query(Building).count()
        chiller_count = session.query(ChillerUnit).count()
        alert_count = session.query(AlertRule).count()
        data_source_count = session.query(DataSourceConfig).count()

        assert organization_count == 1
        assert building_count >= 2
        assert chiller_count >= 3
        assert alert_count == chiller_count * 2
        assert data_source_count == chiller_count

        user = session.query(User).filter_by(email="demo@demo.com").one()
        assert user.organization_id == session.query(Organization).first().id
        assert telemetry_session.query(ChillerTelemetry).count() > 0
    finally:
        session.close()
        telemetry_session.close()


def test_seed_demo_data_is_idempotent():
    seed_demo_data()
    session = SessionLocal()
    telemetry_session = TelemetrySessionLocal()
    try:
        initial_counts = {
            "orgs": session.query(Organization).count(),
            "buildings": session.query(Building).count(),
            "chillers": session.query(ChillerUnit).count(),
            "alerts": session.query(AlertRule).count(),
            "data_sources": session.query(DataSourceConfig).count(),
            "telemetry": telemetry_session.query(ChillerTelemetry).count(),
        }
    finally:
        session.close()
        telemetry_session.close()

    seed_demo_data()

    session = SessionLocal()
    telemetry_session = TelemetrySessionLocal()
    try:
        assert session.query(Organization).count() == initial_counts["orgs"]
        assert session.query(Building).count() == initial_counts["buildings"]
        assert session.query(ChillerUnit).count() == initial_counts["chillers"]
        assert session.query(AlertRule).count() == initial_counts["alerts"]
        assert session.query(DataSourceConfig).count() == initial_counts["data_sources"]
        assert telemetry_session.query(ChillerTelemetry).count() == initial_counts["telemetry"]
    finally:
        session.close()
        telemetry_session.close()


def test_seed_demo_data_populates_two_years_of_telemetry():
    seed_demo_data()

    session = SessionLocal()
    telemetry_session = TelemetrySessionLocal()
    try:
        telemetry_count = telemetry_session.query(ChillerTelemetry).count()
        assert telemetry_count > 0

        grouped_counts = dict(
            telemetry_session.query(ChillerTelemetry.chiller_unit_id, func.count())
            .group_by(ChillerTelemetry.chiller_unit_id)
            .all()
        )
        for count in grouped_counts.values():
            assert count >= 700

        min_timestamp, max_timestamp = telemetry_session.query(
            func.min(ChillerTelemetry.timestamp), func.max(ChillerTelemetry.timestamp)
        ).one()
        assert (max_timestamp - min_timestamp) >= timedelta(days=720)
    finally:
        session.close()
        telemetry_session.close()
