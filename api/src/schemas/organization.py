from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict

from src.models.organization import OrganizationType


class OrganizationBase(BaseModel):
    name: str
    type: OrganizationType


class OrganizationCreate(OrganizationBase):
    pass


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[OrganizationType] = None


class OrganizationResponse(OrganizationBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
