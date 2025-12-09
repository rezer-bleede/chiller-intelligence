"""Populate the database with demo data for fresh installations."""
from __future__ import annotations

import math
import random
import sys
from datetime import datetime, timedelta, timezone
from typing import Sequence

from sqlalchemy import func
from sqlalchemy.orm import Session

from src.auth.security import get_password_hash
from src.constants import DEMO_ORG_NAME
from src.db import SessionLocal
from src.models import (
    AlertRule,
    AlertSeverity,
    BaselineValue,
    Building,
    ChillerTelemetry,
    ChillerUnit,
    ConditionOperator,
    DataSourceConfig,
    DataSourceType,
    Organization,
    OrganizationType,
    User,
    UserRole,
)

def _database_is_empty(session: Session) -> bool:
    return session.query(Organization).count() == 0


def _create_organization(session: Session) -> Organization:
    organization = Organization(name=DEMO_ORG_NAME, type=OrganizationType.ENERGY_MGMT)
    session.add(organization)
    session.flush()
    return organization


def _create_demo_admin(session: Session, organization: Organization) -> User:
    user = User(
        email="demo@demo.com",
        password_hash=get_password_hash("demo123"),
        name="Demo Admin",
        role=UserRole.ORG_ADMIN,
        organization_id=organization.id,
    )
    session.add(user)
    return user


def _create_buildings(session: Session, organization: Organization) -> Sequence[Building]:
    building_specs = [
        {"name": "Central Plant", "location": "Downtown", "latitude": 37.7749, "longitude": -122.4194},
        {"name": "East Campus", "location": "Business District", "latitude": 37.7833, "longitude": -122.4167},
        {"name": "Innovation Hub", "location": "Waterfront", "latitude": 37.7890, "longitude": -122.3900},
    ]
    buildings: list[Building] = []
    for spec in building_specs[:3]:
        building = Building(organization_id=organization.id, **spec)
        session.add(building)
        buildings.append(building)
    session.flush()
    return buildings


def _create_chillers(session: Session, buildings: Sequence[Building]) -> list[ChillerUnit]:
    chiller_specs = [
        {"name": "Chiller-CP-1", "manufacturer": "Trane", "model": "CGAM", "capacity_tons": 180},
        {"name": "Chiller-CP-2", "manufacturer": "Carrier", "model": "30RB", "capacity_tons": 160},
        {"name": "Chiller-EC-1", "manufacturer": "Daikin", "model": "EWAD", "capacity_tons": 140},
        {"name": "Chiller-EC-2", "manufacturer": "York", "model": "YS", "capacity_tons": 150},
        {"name": "Chiller-IH-1", "manufacturer": "LG", "model": "ACVQ", "capacity_tons": 130},
    ]

    chillers: list[ChillerUnit] = []
    for index, spec in enumerate(chiller_specs):
        building = buildings[index % len(buildings)]
        chiller = ChillerUnit(building_id=building.id, **spec)
        session.add(chiller)
        chillers.append(chiller)
    session.flush()
    return chillers


def _attach_data_sources(session: Session, chillers: Sequence[ChillerUnit]) -> None:
    for chiller in chillers:
        config = DataSourceConfig(
            chiller_unit_id=chiller.id,
            type=DataSourceType.HTTP,
            connection_params={"generator": True},
        )
        session.add(config)


def _create_alert_rules(session: Session, chillers: Sequence[ChillerUnit]) -> None:
    for chiller in chillers:
        high_power = AlertRule(
            chiller_unit_id=chiller.id,
            name="High Power Consumption",
            metric_key="power_kw",
            condition_operator=ConditionOperator.GT,
            threshold_value=40.0,
            severity=AlertSeverity.WARNING,
            is_active=True,
            recipient_emails=["ops-team@example.com"],
        )
        low_delta_t = AlertRule(
            chiller_unit_id=chiller.id,
            name="Low Delta T",
            metric_key="delta_t",
            condition_operator=ConditionOperator.LT,
            threshold_value=4.5,
            severity=AlertSeverity.INFO,
            is_active=True,
            recipient_emails=["maintenance@example.com"],
        )
        session.add_all([high_power, low_delta_t])


def _create_baselines(session: Session, organization: Organization) -> None:
    session.add_all(
        [
            BaselineValue(
                organization_id=organization.id,
                name="Plant COP Target",
                metric_key="cop",
                value=3.8,
                unit="COP",
                notes="Target efficiency for the portfolio",
            ),
            BaselineValue(
                organization_id=organization.id,
                name="Power Demand Threshold",
                metric_key="power_kw",
                value=42.0,
                unit="kW",
                notes="Upper bound before operator review",
            ),
        ]
    )


def _generate_historical_telemetry_for_chiller(
    chiller: ChillerUnit, days: int = 730
) -> list[ChillerTelemetry]:
    """Create synthetic telemetry spanning the requested number of days."""

    now = datetime.now(timezone.utc)
    telemetry_records: list[ChillerTelemetry] = []

    for offset in range(days):
        timestamp = now - timedelta(days=offset)
        seasonal_factor = 1 + 0.2 * math.sin(2 * math.pi * (offset % 365) / 365)
        load_factor = random.uniform(0.85, 1.15)
        base_power_kw = max(chiller.capacity_tons * 0.7, 40.0)
        power_kw = round(base_power_kw * seasonal_factor * load_factor, 2)

        delta_t = round(random.uniform(4.5, 7.0), 2)
        flow_rate = round((power_kw * 12000) / (delta_t * 500), 2)
        inlet_temp = round(random.uniform(10.5, 13.5), 2)
        outlet_temp = round(inlet_temp - delta_t, 2)
        cop = round(random.uniform(3.0, 5.0) * seasonal_factor, 2)

        telemetry_records.append(
            ChillerTelemetry(
                chiller_unit_id=chiller.id,
                timestamp=timestamp,
                inlet_temp=inlet_temp,
                outlet_temp=outlet_temp,
                power_kw=power_kw,
                flow_rate=flow_rate,
                cop=cop,
            )
        )

    return telemetry_records


def _populate_historical_telemetry(session: Session, chillers: Sequence[ChillerUnit]) -> None:
    """Backfill two years of demo telemetry for analytics visualizations."""

    if session.query(func.count(ChillerTelemetry.id)).scalar():
        return

    records: list[ChillerTelemetry] = []
    for chiller in chillers:
        records.extend(_generate_historical_telemetry_for_chiller(chiller))

    session.bulk_save_objects(records)


def seed_demo_data() -> None:
    session = SessionLocal()
    try:
        if not _database_is_empty(session):
            print("[seeder] Database already contains data, skipping demo seed")
            return

        organization = _create_organization(session)
        _create_demo_admin(session, organization)
        buildings = _create_buildings(session, organization)
        chillers = _create_chillers(session, buildings)
        _attach_data_sources(session, chillers)
        _create_alert_rules(session, chillers)
        _create_baselines(session, organization)
        _populate_historical_telemetry(session, chillers)

        session.commit()
        print("[seeder] Demo data created successfully")
    except Exception as exc:  # pragma: no cover - defensive logging
        session.rollback()
        print(f"[seeder] Failed to seed demo data: {exc}")
        raise
    finally:
        session.close()


if __name__ == "__main__":
    seed_demo_data()
    sys.exit(0)
