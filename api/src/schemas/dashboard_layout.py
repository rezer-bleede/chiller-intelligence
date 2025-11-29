from __future__ import annotations

from pydantic import BaseModel, Field


class WidgetLayout(BaseModel):
    widgetId: str = Field(..., description="Unique widget identifier")
    x: int
    y: int
    w: int
    h: int


class DashboardLayoutResponse(BaseModel):
    page_key: str
    layout: list[WidgetLayout]


class DashboardLayoutUpsert(BaseModel):
    layout: list[WidgetLayout]
