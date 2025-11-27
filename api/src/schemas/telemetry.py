from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class TelemetryIngestRequest(BaseModel):
    unit_id: int
    timestamp: datetime
    inlet_temp: float
    outlet_temp: float
    power_kw: float
    flow_rate: float
    cop: float


class TelemetryResponse(BaseModel):
    id: int
    unit_id: int
    timestamp: datetime
    inlet_temp: float
    outlet_temp: float
    power_kw: float
    flow_rate: float
    cop: float

    model_config = ConfigDict(from_attributes=True)
