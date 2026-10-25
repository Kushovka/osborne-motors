"""Create the initial Osborne Motors database schema.

Revision ID: osborne_0001
Revises:
"""

from alembic import op
import sqlalchemy as sa


revision = "osborne_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "vehicles",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("slug", sa.String(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("make", sa.String(), nullable=False),
        sa.Column("model", sa.String(), nullable=False),
        sa.Column("trim", sa.String(), nullable=True),
        sa.Column("year", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("stock_number", sa.String(), nullable=True),
        sa.Column("vin", sa.String(), nullable=True),
        sa.Column("price", sa.Integer(), nullable=False),
        sa.Column("mileage", sa.Integer(), nullable=False),
        sa.Column("body_type", sa.String(), nullable=False),
        sa.Column("transmission", sa.String(), nullable=True),
        sa.Column("drivetrain", sa.String(), nullable=True),
        sa.Column("engine", sa.String(), nullable=True),
        sa.Column("exterior_color", sa.String(), nullable=True),
        sa.Column("interior_color", sa.String(), nullable=True),
        sa.Column("location", sa.String(), nullable=False),
        sa.Column("short_description", sa.String(), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("images", sa.JSON(), nullable=False),
        sa.Column("features", sa.JSON(), nullable=False),
        sa.Column("specs", sa.JSON(), nullable=False),
        sa.Column("details", sa.JSON(), nullable=False),
        sa.Column("featured", sa.Boolean(), nullable=False),
        sa.Column("financing_available", sa.Boolean(), nullable=False),
        sa.Column("warranty_available", sa.Boolean(), nullable=False),
        sa.Column("delivery_available", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_vehicles_slug", "vehicles", ["slug"], unique=True)
    op.create_index("ix_vehicles_make", "vehicles", ["make"], unique=False)
    op.create_index("ix_vehicles_model", "vehicles", ["model"], unique=False)
    op.create_index("ix_vehicles_year", "vehicles", ["year"], unique=False)
    op.create_index("ix_vehicles_status", "vehicles", ["status"], unique=False)
    op.create_index("ix_vehicles_stock_number", "vehicles", ["stock_number"], unique=True)
    op.create_index("ix_vehicles_vin", "vehicles", ["vin"], unique=True)
    op.create_index("ix_vehicles_price", "vehicles", ["price"], unique=False)
    op.create_index("ix_vehicles_mileage", "vehicles", ["mileage"], unique=False)
    op.create_index("ix_vehicles_body_type", "vehicles", ["body_type"], unique=False)
    op.create_index("ix_vehicles_transmission", "vehicles", ["transmission"], unique=False)
    op.create_index("ix_vehicles_drivetrain", "vehicles", ["drivetrain"], unique=False)
    op.create_index("ix_vehicles_exterior_color", "vehicles", ["exterior_color"], unique=False)
    op.create_index("ix_vehicles_featured", "vehicles", ["featured"], unique=False)

    op.create_table(
        "leads",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("vehicle_id", sa.String(), nullable=True),
        sa.Column("lead_type", sa.String(), nullable=False),
        sa.Column("customer_name", sa.String(), nullable=False),
        sa.Column("phone", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("subject", sa.String(), nullable=True),
        sa.Column("preferred_contact", sa.String(), nullable=True),
        sa.Column("zip_code", sa.String(), nullable=True),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column("source_page", sa.String(), nullable=True),
        sa.Column("consent_to_contact", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["vehicle_id"], ["vehicles.id"]),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("leads")
    op.drop_index("ix_vehicles_featured", table_name="vehicles")
    op.drop_index("ix_vehicles_exterior_color", table_name="vehicles")
    op.drop_index("ix_vehicles_drivetrain", table_name="vehicles")
    op.drop_index("ix_vehicles_transmission", table_name="vehicles")
    op.drop_index("ix_vehicles_body_type", table_name="vehicles")
    op.drop_index("ix_vehicles_mileage", table_name="vehicles")
    op.drop_index("ix_vehicles_price", table_name="vehicles")
    op.drop_index("ix_vehicles_vin", table_name="vehicles")
    op.drop_index("ix_vehicles_stock_number", table_name="vehicles")
    op.drop_index("ix_vehicles_status", table_name="vehicles")
    op.drop_index("ix_vehicles_year", table_name="vehicles")
    op.drop_index("ix_vehicles_model", table_name="vehicles")
    op.drop_index("ix_vehicles_make", table_name="vehicles")
    op.drop_index("ix_vehicles_slug", table_name="vehicles")
    op.drop_table("vehicles")
