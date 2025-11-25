from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict

from src.models.data_source_config import DataSourceType


class DataSourceBase(BaseModel):
    chiller_unit_id: Optional[int] = None
    type: DataSourceType
    connection_params: dict[str, Any]


class DataSourceCreate(DataSourceBase):
    chiller_unit_id: int


class DataSourceUpdate(BaseModel):
    type: Optional[DataSourceType] = None
    connection_params: Optional[dict[str, Any]] = None


class DataSourceResponse(DataSourceBase):
    id: int
    chiller_unit_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
