from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from src.auth.dependencies import get_current_user
from src.auth.security import create_access_token, verify_password
from src.auth.services import get_user_by_email, register_user
from src.db import get_db_session
from src.models import Organization, User
from src.schemas.auth import AuthResponse, LoginRequest, MeResponse, RegisterRequest

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db_session)):
    """Register a new organization and its admin user."""

    existing_user = get_user_by_email(db, payload.admin_email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    organization = Organization(name=payload.organization_name, type=payload.organization_type)
    db.add(organization)
    db.commit()
    db.refresh(organization)

    admin_user = register_user(
        db,
        payload.admin_email,
        payload.admin_password,
        organization.id,
        payload.admin_name,
    )

    token = create_access_token(
        {"user_id": admin_user.id, "organization_id": admin_user.organization_id}
    )
    return {
        "access_token": token,
        "user": admin_user,
        "organization": organization,
    }


@router.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db_session)):
    """Authenticate a user and return a JWT."""

    user = db.query(User).filter(User.email == payload.email).first()
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    token = create_access_token({"user_id": user.id, "organization_id": user.organization_id})
    organization = db.get(Organization, user.organization_id)
    return {"access_token": token, "user": user, "organization": organization}


@router.get("/me", response_model=MeResponse)
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db_session)):
    """Return the authenticated user's details and organization."""

    organization = db.get(Organization, current_user.organization_id)
    return {"user": current_user, "organization": organization}
