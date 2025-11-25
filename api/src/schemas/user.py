from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from src.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: UserRole


class UserCreate(UserBase):
    password: str
    organization_id: int


class UserUpdate(BaseModel):
    name: str | None = None
    role: UserRole | None = None
    password: str | None = None


class UserResponse(UserBase):
    id: int
    organization_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
