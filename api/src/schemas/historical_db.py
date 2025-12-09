from __future__ import annotations

from pydantic import BaseModel, Field, field_validator


class HistoricalDBConfigPayload(BaseModel):
    host: str = Field(..., description="Database host")
    port: int = Field(..., description="Database port")
    database: str = Field(..., description="Database name")
    username: str = Field(..., description="Username for authentication")
    password: str = Field(..., description="Password for authentication")
    driver: str = Field("postgresql+psycopg", description="SQLAlchemy driver prefix")

    @field_validator("driver")
    @classmethod
    def validate_driver(cls, value: str) -> str:
        if "+" not in value:
            raise ValueError("Driver should include a DBAPI implementation (e.g. postgresql+psycopg)")
        return value


class HistoricalDBConfigResponse(BaseModel):
    connection_url: str
    connection_params: dict
    source: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "connection_url": "postgresql+psycopg://postgres:postgres@history-db:5432/postgres",
                "connection_params": {
                    "host": "history-db",
                    "port": 5432,
                    "database": "postgres",
                    "username": "postgres",
                    "password": "",
                    "driver": "postgresql+psycopg",
                },
                "source": "database",
            }
        }
    }
