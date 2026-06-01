"""add_api_contract_columns

Revision ID: 20260601_api_contract
Revises: 9fe900b83bcb
Create Date: 2026-06-01 14:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260601_api_contract"
down_revision: Union[str, Sequence[str], None] = "9fe900b83bcb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(table_name: str, column_name: str) -> bool:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    return column_name in {column["name"] for column in inspector.get_columns(table_name)}


def _add_column_if_missing(table_name: str, column: sa.Column) -> None:
    if not _has_column(table_name, column.name):
        op.add_column(table_name, column)


def _drop_column_if_exists(table_name: str, column_name: str) -> None:
    if _has_column(table_name, column_name):
        op.drop_column(table_name, column_name)


def upgrade() -> None:
    op.execute("ALTER TYPE quotestatus ADD VALUE IF NOT EXISTS 'REVISADO'")

    _add_column_if_missing("products", sa.Column("created_at", sa.DateTime(), nullable=True))
    _add_column_if_missing("products", sa.Column("updated_at", sa.DateTime(), nullable=True))

    _add_column_if_missing("clients", sa.Column("situacao_cadastral", sa.String(), nullable=True))
    _add_column_if_missing("clients", sa.Column("contato_telefone", sa.String(), nullable=True))
    _add_column_if_missing("clients", sa.Column("created_at", sa.DateTime(), nullable=True))
    _add_column_if_missing("clients", sa.Column("updated_at", sa.DateTime(), nullable=True))

    _add_column_if_missing("quotes", sa.Column("payment_condition", sa.String(), nullable=True))
    _add_column_if_missing("quotes", sa.Column("shipping_type", sa.String(), nullable=True))
    _add_column_if_missing("quotes", sa.Column("observations", sa.Text(), nullable=True))
    _add_column_if_missing("quotes", sa.Column("sent_at", sa.DateTime(), nullable=True))
    _add_column_if_missing("quotes", sa.Column("client_response", sa.String(), nullable=True))
    _add_column_if_missing("quotes", sa.Column("responded_at", sa.DateTime(), nullable=True))
    _add_column_if_missing("quotes", sa.Column("send_error", sa.Text(), nullable=True))
    _add_column_if_missing("quotes", sa.Column("updated_at", sa.DateTime(), nullable=True))


def downgrade() -> None:
    _drop_column_if_exists("quotes", "updated_at")
    _drop_column_if_exists("quotes", "send_error")
    _drop_column_if_exists("quotes", "responded_at")
    _drop_column_if_exists("quotes", "client_response")
    _drop_column_if_exists("quotes", "sent_at")
    _drop_column_if_exists("quotes", "observations")
    _drop_column_if_exists("quotes", "shipping_type")
    _drop_column_if_exists("quotes", "payment_condition")

    _drop_column_if_exists("clients", "updated_at")
    _drop_column_if_exists("clients", "created_at")
    _drop_column_if_exists("clients", "contato_telefone")
    _drop_column_if_exists("clients", "situacao_cadastral")

    _drop_column_if_exists("products", "updated_at")
    _drop_column_if_exists("products", "created_at")
