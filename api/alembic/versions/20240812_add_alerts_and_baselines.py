"""Add baseline values, alert events, and email recipients

Revision ID: 20240812_add_alerts_and_baselines
Revises: 20240801_add_dashboard_layouts
Create Date: 2024-08-12
"""

from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = "20240812_add_alerts_and_baselines"
down_revision = "20240801_add_dashboard_layouts"
branch_labels = None
depends_on = None


def upgrade():
    op.add_column(
        "alert_rules",
        sa.Column("recipient_emails", sa.JSON(), nullable=False, server_default="[]"),
    )
    op.alter_column("alert_rules", "recipient_emails", server_default=None)

    op.create_table(
        "baseline_values",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("organization_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("metric_key", sa.String(length=255), nullable=False),
        sa.Column("value", sa.Float(), nullable=False),
        sa.Column("unit", sa.String(length=64), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("metadata_json", sa.JSON(), nullable=False),
        sa.Column("building_id", sa.Integer(), nullable=True),
        sa.Column("chiller_unit_id", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["building_id"], ["buildings.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["chiller_unit_id"], ["chiller_units.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "alert_events",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("alert_rule_id", sa.Integer(), nullable=True),
        sa.Column("chiller_unit_id", sa.Integer(), nullable=True),
        sa.Column("severity", sa.Enum("INFO", "WARNING", "CRITICAL", name="alert_severity"), nullable=False),
        sa.Column("metric_key", sa.String(length=255), nullable=False),
        sa.Column("metric_value", sa.Float(), nullable=False),
        sa.Column("message", sa.String(length=500), nullable=False),
        sa.Column("triggered_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("acknowledged", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.ForeignKeyConstraint(["alert_rule_id"], ["alert_rules.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["chiller_unit_id"], ["chiller_units.id"], ondelete="SET NULL"),
        sa.PrimaryKeyConstraint("id"),
    )

    bind = op.get_bind()
    if bind and bind.dialect.name == "postgresql":
        op.execute("ALTER TYPE data_source_type ADD VALUE IF NOT EXISTS 'EXTERNAL_DB'")


def downgrade():
    op.drop_table("alert_events")
    op.drop_table("baseline_values")
    op.drop_column("alert_rules", "recipient_emails")

    bind = op.get_bind()
    if bind and bind.dialect.name == "postgresql":
        # PostgreSQL enums cannot remove values easily; document limitation.
        pass
