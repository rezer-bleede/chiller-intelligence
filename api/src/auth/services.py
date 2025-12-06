from __future__ import annotations

from sqlalchemy.orm import Session

from src.auth.security import get_password_hash
from src.models import Organization, User, UserRole


def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def register_user(db: Session, email: str, password: str, organization_id: int, name: str | None = None) -> User:
    user = User(
        email=email,
        password_hash=get_password_hash(password),
        role=UserRole.ORG_ADMIN,
        organization_id=organization_id,
        name=name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
