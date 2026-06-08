"""add commercial options

Revision ID: 20260608_commercial_options
Revises: 20260608_quote_sequences
Create Date: 2026-06-08 12:30:00.000000

"""
from typing import Sequence, Union
import uuid

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260608_commercial_options"
down_revision: Union[str, Sequence[str], None] = "20260608_quote_sequences"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

PAYMENT_OPTIONS = [
    ("A_VISTA", "A vista"),
    ("BOLETO", "Boleto"),
    ("CARTAO", "Cartao"),
    ("30_DIAS", "30 dias"),
    ("30_60", "30/60"),
    ("30_60_90", "30/60/90"),
    ("ENTRADA_PARCELAS", "Entrada + parcelas"),
]

SHIPPING_OPTIONS = [
    ("CIF", "CIF"),
    ("FOB", "FOB"),
    ("RETIRADA", "Retirada"),
    ("ENTREGA_LOCAL", "Entrega local"),
    ("TRANSPORTADORA", "Transportadora"),
    ("FRETE_INCLUSO", "Frete incluso"),
    ("FRETE_A_CALCULAR", "Frete a calcular"),
]


def _create_options_table(table_name: str) -> None:
    op.create_table(
        table_name,
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("code", sa.String(), nullable=False),
        sa.Column("label", sa.String(), nullable=False),
        sa.Column("description", sa.String(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("created_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.create_index(f"ix_{table_name}_code", table_name, ["code"], unique=True)


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if "payment_conditions" not in tables:
        _create_options_table("payment_conditions")
    if "shipping_types" not in tables:
        _create_options_table("shipping_types")

    payment_table = sa.table(
        "payment_conditions",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("code", sa.String()),
        sa.column("label", sa.String()),
        sa.column("sort_order", sa.Integer()),
        sa.column("is_active", sa.Boolean()),
    )
    shipping_table = sa.table(
        "shipping_types",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("code", sa.String()),
        sa.column("label", sa.String()),
        sa.column("sort_order", sa.Integer()),
        sa.column("is_active", sa.Boolean()),
    )
    op.bulk_insert(payment_table, [
        {"id": uuid.uuid4(), "code": code, "label": label, "sort_order": index, "is_active": True}
        for index, (code, label) in enumerate(PAYMENT_OPTIONS)
    ])
    op.bulk_insert(shipping_table, [
        {"id": uuid.uuid4(), "code": code, "label": label, "sort_order": index, "is_active": True}
        for index, (code, label) in enumerate(SHIPPING_OPTIONS)
    ])


def downgrade() -> None:
    op.drop_table("shipping_types")
    op.drop_table("payment_conditions")
