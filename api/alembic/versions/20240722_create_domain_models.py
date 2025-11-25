"""create domain models

Revision ID: 20240722_create_domain_models
Revises: 
Create Date: 2024-07-22
"""
from __future__ import annotations

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20240722_create_domain_models"
down_revision = None
branch_labels = None
depends_on = None

organization_type = sa.Enum(
    "ENERGY_MGMT", "FM", "ESCO", name="organization_type"
)
user_role = sa.Enum("ORG_ADMIN", "ANALYST", "VIEWER", name="user_role")
data_source_type = sa.Enum("MQTT", "HTTP", "FILE_UPLOAD", name="data_source_type")
condition_operator = sa.Enum(">", "<", ">=", "<=", name="condition_operator")
alert_severity = sa.Enum("INFO", "WARNING", "CRITICAL", name="alert_severity")


def upgrade() -> None:
    op.create_table(
        "organizations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("type", organization_type, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )
    op.create_index(op.f("ix_organizations_id"), "organizations", ["id"], unique=False)

    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("role", user_role, nullable=False),
        sa.Column("organization_id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("email"),
    )
    op.create_index(op.f("ix_users_email"), "users", ["email"], unique=False)
    op.create_index(op.f("ix_users_id"), "users", ["id"], unique=False)
    op.create_index(op.f("ix_users_organization_id"), "users", ["organization_id"], unique=False)

    op.create_table(
        "buildings",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("organization_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("location", sa.String(length=255), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["organization_id"], ["organizations.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_buildings_id"), "buildings", ["id"], unique=False)
    op.create_index(op.f("ix_buildings_organization_id"), "buildings", ["organization_id"], unique=False)

    op.create_table(
        "chiller_units",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("building_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("manufacturer", sa.String(length=255), nullable=False),
        sa.Column("model", sa.String(length=255), nullable=False),
        sa.Column("capacity_tons", sa.Float(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["building_id"], ["buildings.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_chiller_units_building_id"), "chiller_units", ["building_id"], unique=False)
    op.create_index(op.f("ix_chiller_units_id"), "chiller_units", ["id"], unique=False)

    op.create_table(
        "data_source_configs",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("chiller_unit_id", sa.Integer(), nullable=False),
        sa.Column("type", data_source_type, nullable=False),
        sa.Column("connection_params", postgresql.JSONB(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["chiller_unit_id"], ["chiller_units.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_data_source_configs_chiller_unit_id"), "data_source_configs", ["chiller_unit_id"], unique=False)
    op.create_index(op.f("ix_data_source_configs_id"), "data_source_configs", ["id"], unique=False)

    op.create_table(
        "alert_rules",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("chiller_unit_id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("metric_key", sa.String(length=255), nullable=False),
        sa.Column("condition_operator", condition_operator, nullable=False),
        sa.Column("threshold_value", sa.Float(), nullable=False),
        sa.Column("severity", alert_severity, nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default=sa.text("true"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["chiller_unit_id"], ["chiller_units.id"], ondelete="CASCADE"),
    )
    op.create_index(op.f("ix_alert_rules_chiller_unit_id"), "alert_rules", ["chiller_unit_id"], unique=False)
    op.create_index(op.f("ix_alert_rules_id"), "alert_rules", ["id"], unique=False)


def downgrade() -> None:
    op.drop_index(op.f("ix_alert_rules_id"), table_name="alert_rules")
    op.drop_index(op.f("ix_alert_rules_chiller_unit_id"), table_name="alert_rules")
    op.drop_table("alert_rules")

    op.drop_index(op.f("ix_data_source_configs_id"), table_name="data_source_configs")
    op.drop_index(op.f("ix_data_source_configs_chiller_unit_id"), table_name="data_source_configs")
    op.drop_table("data_source_configs")

    op.drop_index(op.f("ix_chiller_units_id"), table_name="chiller_units")
    op.drop_index(op.f("ix_chiller_units_building_id"), table_name="chiller_units")
    op.drop_table("chiller_units")

    op.drop_index(op.f("ix_buildings_organization_id"), table_name="buildings")
    op.drop_index(op.f("ix_buildings_id"), table_name="buildings")
    op.drop_table("buildings")

    op.drop_index(op.f("ix_users_organization_id"), table_name="users")
    op.drop_index(op.f("ix_users_id"), table_name="users")
    op.drop_index(op.f("ix_users_email"), table_name="users")
    op.drop_table("users")

    op.drop_index(op.f("ix_organizations_id"), table_name="organizations")
    op.drop_table("organizations")

    organization_type.drop(op.get_bind(), checkfirst=True)
    user_role.drop(op.get_bind(), checkfirst=True)
    data_source_type.drop(op.get_bind(), checkfirst=True)
    condition_operator.drop(op.get_bind(), checkfirst=True)
    alert_severity.drop(op.get_bind(), checkfirst=True)
