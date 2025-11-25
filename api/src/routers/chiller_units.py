from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user
from src.db import get_db_session
from src.models import Building, ChillerUnit, User
from src.schemas.chiller_unit import ChillerUnitCreate, ChillerUnitResponse, ChillerUnitUpdate
from src.services.tenancy import get_building_for_org, get_chiller_for_org

router = APIRouter(prefix="/chiller-units", tags=["chiller_units"])


@router.get("", response_model=list[ChillerUnitResponse])
def list_chiller_units(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return (
        db.query(ChillerUnit)
        .join(Building)
        .filter(Building.organization_id == current_user.organization_id)
        .order_by(ChillerUnit.id)
        .all()
    )


@router.post("", response_model=ChillerUnitResponse, status_code=status.HTTP_201_CREATED)
def create_chiller_unit(
    payload: ChillerUnitCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    get_building_for_org(db, payload.building_id, current_user)
    chiller_unit = ChillerUnit(**payload.model_dump())
    db.add(chiller_unit)
    db.commit()
    db.refresh(chiller_unit)
    return chiller_unit


@router.get("/{chiller_unit_id}", response_model=ChillerUnitResponse)
def get_chiller_unit(
    chiller_unit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return get_chiller_for_org(db, chiller_unit_id, current_user)


@router.patch("/{chiller_unit_id}", response_model=ChillerUnitResponse)
def update_chiller_unit(
    chiller_unit_id: int,
    payload: ChillerUnitUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    chiller_unit = get_chiller_for_org(db, chiller_unit_id, current_user)
    update_data = payload.model_dump(exclude_unset=True)
    if "building_id" in update_data and update_data["building_id"] is not None:
        get_building_for_org(db, update_data["building_id"], current_user)
    for field, value in update_data.items():
        setattr(chiller_unit, field, value)
    db.add(chiller_unit)
    db.commit()
    db.refresh(chiller_unit)
    return chiller_unit


@router.delete("/{chiller_unit_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chiller_unit(
    chiller_unit_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    chiller_unit = get_chiller_for_org(db, chiller_unit_id, current_user)
    db.delete(chiller_unit)
    db.commit()
    return None
