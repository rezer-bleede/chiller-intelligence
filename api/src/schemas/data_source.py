from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, ConfigDict, field_validator

from src.models.data_source_config import DataSourceType


class DataSourceBase(BaseModel):
    chiller_unit_id: Optional[int] = None
    type: DataSourceType
    connection_params: "DataSourceConnectionParams"


class HistoricalStorageConfig(BaseModel):
    backend: Literal["POSTGRES"] = "POSTGRES"
    host: str
    port: int
    database: str
    username: str
    password: str
    ssl: bool = False
    preload_years: int = 2

    model_config = ConfigDict(extra="allow")


class DataSourceConnectionParams(BaseModel):
    live: dict[str, Any]
    historical_storage: HistoricalStorageConfig

    model_config = ConfigDict(extra="allow")

    @field_validator("live")
    @classmethod
    def _ensure_live_present(cls, value: dict[str, Any]) -> dict[str, Any]:
        if value is None:
            raise ValueError("Live connection details are required")
        return value


class DataSourceCreate(DataSourceBase):
    chiller_unit_id: int


class DataSourceUpdate(BaseModel):
    type: Optional[DataSourceType] = None
    connection_params: Optional[DataSourceConnectionParams] = None


class DataSourceResponse(DataSourceBase):
    id: int
    chiller_unit_id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
