from __future__ import annotations

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class ChillerUnitBase(BaseModel):
    name: str
    manufacturer: str
    model: str
    capacity_tons: float
    building_id: Optional[int] = None


class ChillerUnitCreate(ChillerUnitBase):
    building_id: int


class ChillerUnitUpdate(BaseModel):
    name: Optional[str] = None
    manufacturer: Optional[str] = None
    model: Optional[str] = None
    capacity_tons: Optional[float] = None
    building_id: Optional[int] = None


class ChillerUnitResponse(ChillerUnitBase):
    id: int
    building_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
