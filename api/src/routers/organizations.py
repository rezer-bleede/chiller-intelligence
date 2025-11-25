from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user, require_admin
from src.db import get_db_session
from src.models import Organization, User
from src.schemas.organization import OrganizationResponse, OrganizationUpdate

router = APIRouter(prefix="/organizations", tags=["organizations"])


@router.get("", response_model=OrganizationResponse)
def get_organization(current_user: User = Depends(get_current_user), db: Session = Depends(get_db_session)):
    organization = db.get(Organization, current_user.organization_id)
    return organization


@router.get("/me", response_model=OrganizationResponse)
def get_my_organization(current_user: User = Depends(get_current_user), db: Session = Depends(get_db_session)):
    organization = db.get(Organization, current_user.organization_id)
    return organization


@router.patch("/me", response_model=OrganizationResponse)
def update_organization(
    payload: OrganizationUpdate,
    current_user: User = Depends(require_admin),
    db: Session = Depends(get_db_session),
):
    organization = db.get(Organization, current_user.organization_id)
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(organization, field, value)
    db.add(organization)
    db.commit()
    db.refresh(organization)
    return organization
