"""add chiller telemetry table

Revision ID: 20240730_add_chiller_telemetry
Revises: 20240722_create_domain_models
Create Date: 2024-07-30
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20240730_add_chiller_telemetry"
down_revision = "20240722_create_domain_models"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "chiller_telemetry",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("chiller_unit_id", sa.Integer(), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), nullable=False),
        sa.Column("inlet_temp", sa.Float(), nullable=False),
        sa.Column("outlet_temp", sa.Float(), nullable=False),
        sa.Column("power_kw", sa.Float(), nullable=False),
        sa.Column("flow_rate", sa.Float(), nullable=False),
        sa.Column("cop", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["chiller_unit_id"], ["chiller_units.id"], ondelete="CASCADE"),
    )
    op.create_index(
        op.f("ix_chiller_telemetry_id"), "chiller_telemetry", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_chiller_telemetry_chiller_unit_id"),
        "chiller_telemetry",
        ["chiller_unit_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_chiller_telemetry_chiller_unit_id"), table_name="chiller_telemetry")
    op.drop_index(op.f("ix_chiller_telemetry_id"), table_name="chiller_telemetry")
    op.drop_table("chiller_telemetry")
