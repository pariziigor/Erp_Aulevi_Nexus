"""add quote sequences

Revision ID: 20260608_quote_sequences
Revises: 20260604_supabase_user_id
Create Date: 2026-06-08 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260608_quote_sequences"
down_revision: Union[str, Sequence[str], None] = "20260604_supabase_user_id"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "quote_sequences" not in inspector.get_table_names():
        op.create_table(
            "quote_sequences",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("prefix", sa.String(), nullable=False),
            sa.Column("year", sa.Integer(), nullable=False),
            sa.Column("last_value", sa.Integer(), nullable=False, server_default="0"),
            sa.UniqueConstraint("prefix", "year", name="uq_quote_sequences_prefix_year"),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "quote_sequences" in inspector.get_table_names():
        op.drop_table("quote_sequences")
