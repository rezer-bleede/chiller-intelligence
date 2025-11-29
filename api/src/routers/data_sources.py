from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user
from src.db import get_db_session
from src.models import ChillerUnit, DataSourceConfig, User
from src.schemas.data_source import DataSourceCreate, DataSourceResponse, DataSourceUpdate
from src.services.tenancy import get_chiller_for_org, get_data_source_for_org

router = APIRouter(prefix="/data_sources", tags=["data_sources"])


@router.get("", response_model=list[DataSourceResponse])
def list_data_sources(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return (
        db.query(DataSourceConfig)
        .join(ChillerUnit)
        .join(ChillerUnit.building)
        .filter(ChillerUnit.building.has(organization_id=current_user.organization_id))
        .order_by(DataSourceConfig.id)
        .all()
    )


@router.post("", response_model=DataSourceResponse, status_code=status.HTTP_201_CREATED)
def create_data_source(
    payload: DataSourceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    get_chiller_for_org(db, payload.chiller_unit_id, current_user)
    data_source = DataSourceConfig(**payload.model_dump())
    db.add(data_source)
    db.commit()
    db.refresh(data_source)
    return data_source


@router.get("/{data_source_id}", response_model=DataSourceResponse)
def get_data_source(
    data_source_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    return get_data_source_for_org(db, data_source_id, current_user)


@router.patch("/{data_source_id}", response_model=DataSourceResponse)
def update_data_source(
    data_source_id: int,
    payload: DataSourceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    data_source = get_data_source_for_org(db, data_source_id, current_user)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(data_source, field, value)
    db.add(data_source)
    db.commit()
    db.refresh(data_source)
    return data_source


@router.delete("/{data_source_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_data_source(
    data_source_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db_session),
):
    data_source = get_data_source_for_org(db, data_source_id, current_user)
    db.delete(data_source)
    db.commit()
    return None
