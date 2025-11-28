from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user
from src.db import get_db_session
from src.models import AlertRule, ChillerUnit, User
from src.schemas.alert_rule import AlertRuleCreate, AlertRuleResponse, AlertRuleUpdate
from src.services.tenancy import get_alert_rule_for_org, get_chiller_for_org

router = APIRouter(prefix="/alert_rules", tags=["alert_rules"])


@router.get("", response_model=list[AlertRuleResponse])
def list_alert_rules(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return (
        db.query(AlertRule)
        .join(ChillerUnit)
        .join(ChillerUnit.building)
        .filter(ChillerUnit.building.has(organization_id=current_user.organization_id))
        .order_by(AlertRule.id)
        .all()
    )


@router.post("", response_model=AlertRuleResponse, status_code=status.HTTP_201_CREATED)
def create_alert_rule(
    payload: AlertRuleCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    get_chiller_for_org(db, payload.chiller_unit_id, current_user)
    alert_rule = AlertRule(**payload.model_dump())
    db.add(alert_rule)
    db.commit()
    db.refresh(alert_rule)
    return alert_rule


@router.get("/{alert_rule_id}", response_model=AlertRuleResponse)
def get_alert_rule(
    alert_rule_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return get_alert_rule_for_org(db, alert_rule_id, current_user)


@router.patch("/{alert_rule_id}", response_model=AlertRuleResponse)
def update_alert_rule(
    alert_rule_id: int,
    payload: AlertRuleUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    alert_rule = get_alert_rule_for_org(db, alert_rule_id, current_user)
    update_data = payload.model_dump(exclude_unset=True)
    if "chiller_unit_id" in update_data and update_data["chiller_unit_id"] is not None:
        get_chiller_for_org(db, update_data["chiller_unit_id"], current_user)
    for field, value in update_data.items():
        setattr(alert_rule, field, value)
    db.add(alert_rule)
    db.commit()
    db.refresh(alert_rule)
    return alert_rule


@router.delete("/{alert_rule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert_rule(
    alert_rule_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    alert_rule = get_alert_rule_for_org(db, alert_rule_id, current_user)
    db.delete(alert_rule)
    db.commit()
    return None
