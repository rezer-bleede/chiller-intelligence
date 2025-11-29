"""add dashboard layouts table

Revision ID: 20240801_add_dashboard_layouts
Revises: 20240730_add_chiller_telemetry
Create Date: 2024-08-01
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "20240801_add_dashboard_layouts"
down_revision = "20240730_add_chiller_telemetry"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "dashboard_layouts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("organization_id", sa.Integer(), nullable=False),
        sa.Column("page_key", sa.String(length=100), nullable=False),
        sa.Column("layout_json", sa.JSON(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("user_id", "organization_id", "page_key", name="uq_dashboard_layout_user_org_page"),
    )
    op.create_index(op.f("ix_dashboard_layouts_id"), "dashboard_layouts", ["id"], unique=False)
    op.create_index(
        op.f("ix_dashboard_layouts_user_id"), "dashboard_layouts", ["user_id"], unique=False
    )
    op.create_index(
        op.f("ix_dashboard_layouts_organization_id"),
        "dashboard_layouts",
        ["organization_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index(op.f("ix_dashboard_layouts_organization_id"), table_name="dashboard_layouts")
    op.drop_index(op.f("ix_dashboard_layouts_user_id"), table_name="dashboard_layouts")
    op.drop_index(op.f("ix_dashboard_layouts_id"), table_name="dashboard_layouts")
    op.drop_table("dashboard_layouts")
