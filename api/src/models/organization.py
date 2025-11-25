from __future__ import annotations

from datetime import datetime
from enum import Enum

from sqlalchemy import DateTime, Enum as SQLEnum, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.db import Base


class OrganizationType(str, Enum):
    ENERGY_MGMT = "ENERGY_MGMT"
    FM = "FM"
    ESCO = "ESCO"


class Organization(Base):
    """Represents a tenant organization within the platform."""

    __tablename__ = "organizations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    type: Mapped[OrganizationType] = mapped_column(
        SQLEnum(OrganizationType, name="organization_type"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )

    users: Mapped[list["User"]] = relationship("User", back_populates="organization")
    buildings: Mapped[list["Building"]] = relationship(
        "Building", back_populates="organization", cascade="all, delete-orphan"
    )
