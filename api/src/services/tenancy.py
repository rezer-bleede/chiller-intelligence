from __future__ import annotations

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from src.models import AlertRule, Building, ChillerUnit, DataSourceConfig, User


def assert_same_organization(target_org_id: int, user: User) -> None:
    if target_org_id != user.organization_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")


def get_building_for_org(db: Session, building_id: int, user: User) -> Building:
    building = db.get(Building, building_id)
    if building is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Building not found")
    assert_same_organization(building.organization_id, user)
    return building


def get_chiller_for_org(db: Session, chiller_unit_id: int, user: User) -> ChillerUnit:
    chiller = db.get(ChillerUnit, chiller_unit_id)
    if chiller is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chiller unit not found")
    building = get_building_for_org(db, chiller.building_id, user)
    assert_same_organization(building.organization_id, user)
    return chiller


def get_data_source_for_org(db: Session, data_source_id: int, user: User) -> DataSourceConfig:
    data_source = db.get(DataSourceConfig, data_source_id)
    if data_source is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Data source not found")
    get_chiller_for_org(db, data_source.chiller_unit_id, user)
    return data_source


def get_alert_rule_for_org(db: Session, alert_rule_id: int, user: User) -> AlertRule:
    alert_rule = db.get(AlertRule, alert_rule_id)
    if alert_rule is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert rule not found")
    get_chiller_for_org(db, alert_rule.chiller_unit_id, user)
    return alert_rule
