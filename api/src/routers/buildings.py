from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user
from src.db import get_db_session
from src.models import Building, User
from src.schemas.building import BuildingCreate, BuildingResponse, BuildingUpdate
from src.services.tenancy import get_building_for_org

router = APIRouter(prefix="/buildings", tags=["buildings"])


@router.get("", response_model=list[BuildingResponse])
def list_buildings(current_user: User = Depends(get_current_user), db: Session = Depends(get_db_session)):
    return (
        db.query(Building)
        .filter(Building.organization_id == current_user.organization_id)
        .order_by(Building.id)
        .all()
    )


@router.post("", response_model=BuildingResponse, status_code=status.HTTP_201_CREATED)
def create_building(
    payload: BuildingCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    building = Building(organization_id=current_user.organization_id, **payload.model_dump())
    db.add(building)
    db.commit()
    db.refresh(building)
    return building


@router.get("/{building_id}", response_model=BuildingResponse)
def get_building(
    building_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return get_building_for_org(db, building_id, current_user)


@router.patch("/{building_id}", response_model=BuildingResponse)
def update_building(
    building_id: int,
    payload: BuildingUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    building = get_building_for_org(db, building_id, current_user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(building, field, value)
    db.add(building)
    db.commit()
    db.refresh(building)
    return building


@router.delete("/{building_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_building(
    building_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    building = get_building_for_org(db, building_id, current_user)
    db.delete(building)
    db.commit()
    return None
