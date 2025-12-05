from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, validator


class BaselineValueBase(BaseModel):
    name: str = Field(..., max_length=255)
    metric_key: str = Field(..., max_length=255)
    value: float
    unit: Optional[str] = Field(None, max_length=64)
    notes: Optional[str] = None
    building_id: Optional[int] = None
    chiller_unit_id: Optional[int] = None

    @validator("name", "metric_key")
    def strip_strings(cls, value: str) -> str:
        return value.strip()


class BaselineValueCreate(BaselineValueBase):
    pass


class BaselineValueUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    metric_key: Optional[str] = Field(None, max_length=255)
    value: Optional[float] = None
    unit: Optional[str] = Field(None, max_length=64)
    notes: Optional[str] = None
    building_id: Optional[int] = None
    chiller_unit_id: Optional[int] = None


class BaselineValueResponse(BaselineValueBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
