from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr

from src.models.organization import OrganizationType
from src.models.user import UserRole


class RegisterRequest(BaseModel):
    organization_name: str
    organization_type: OrganizationType
    admin_email: EmailStr
    admin_password: str
    admin_name: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class AuthUser(BaseModel):
    id: int
    email: EmailStr
    name: str
    role: UserRole
    organization_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class AuthResponse(TokenResponse):
    user: AuthUser
    organization: "OrganizationResponse"


class MeResponse(BaseModel):
    user: AuthUser
    organization: "OrganizationResponse"


class OrganizationResponse(BaseModel):
    id: int
    name: str
    type: OrganizationType
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
