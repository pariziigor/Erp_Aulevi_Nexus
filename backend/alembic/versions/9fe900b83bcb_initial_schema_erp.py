"""initial_schema_erp

Revision ID: 9fe900b83bcb
Revises:
Create Date: 2026-06-01 11:49:03.727891

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "9fe900b83bcb"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    def has_table(table_name: str) -> bool:
        return table_name in inspector.get_table_names()

    def has_index(table_name: str, index_name: str) -> bool:
        if not has_table(table_name):
            return False
        return index_name in {index["name"] for index in inspector.get_indexes(table_name)}

    role_enum = postgresql.ENUM("ADM", "SELLER", name="roleenum", create_type=False)
    category_enum = postgresql.ENUM("LSF", "MM", "CHALE", name="categoryenum", create_type=False)
    quote_status_enum = postgresql.ENUM(
        "RASCUNHO",
        "PENDENTE",
        "APROVADO",
        "CANCELADO",
        "EXPIRADO",
        "CONVERTIDO_EM_PEDIDO",
        "REVISADO",
        name="quotestatus",
        create_type=False,
    )
    role_enum.create(bind, checkfirst=True)
    category_enum.create(bind, checkfirst=True)
    quote_status_enum.create(bind, checkfirst=True)

    if not has_table("users"):
        op.create_table(
            "users",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("name", sa.String(), nullable=False),
            sa.Column("email", sa.String(), nullable=False),
            sa.Column("password_hash", sa.String(), nullable=False),
            sa.Column("role", role_enum, nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        )
    if not has_index("users", "ix_users_email"):
        op.create_index("ix_users_email", "users", ["email"], unique=True)

    if not has_table("clients"):
        op.create_table(
            "clients",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("cnpj", sa.String(), nullable=False),
            sa.Column("razao_social", sa.String(), nullable=False),
            sa.Column("nome_fantasia", sa.String(), nullable=True),
            sa.Column("situacao_cadastral", sa.String(), nullable=True),
            sa.Column("cnae", sa.String(), nullable=True),
            sa.Column("cep", sa.String(), nullable=True),
            sa.Column("endereco", sa.String(), nullable=True),
            sa.Column("numero", sa.String(), nullable=True),
            sa.Column("bairro", sa.String(), nullable=True),
            sa.Column("cidade", sa.String(), nullable=True),
            sa.Column("uf", sa.String(), nullable=True),
            sa.Column("contato_nome", sa.String(), nullable=False),
            sa.Column("contato_email", sa.String(), nullable=False),
            sa.Column("contato_whatsapp", sa.String(), nullable=False),
            sa.Column("contato_telefone", sa.String(), nullable=True),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.Column("updated_at", sa.DateTime(), nullable=True),
        )
    if not has_index("clients", "ix_clients_cnpj"):
        op.create_index("ix_clients_cnpj", "clients", ["cnpj"], unique=True)

    if not has_table("products"):
        op.create_table(
            "products",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("codigo", sa.String(), nullable=False),
            sa.Column("descricao", sa.String(), nullable=False),
            sa.Column("categoria", category_enum, nullable=False),
            sa.Column("unidade_medida", sa.String(), nullable=False),
            sa.Column("preco", sa.Numeric(10, 2), nullable=False),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.Column("updated_at", sa.DateTime(), nullable=True),
        )
    if not has_index("products", "ix_products_codigo"):
        op.create_index("ix_products_codigo", "products", ["codigo"], unique=True)

    if not has_table("quotes"):
        op.create_table(
            "quotes",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("numero_orcamento", sa.String(), nullable=False),
            sa.Column("client_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("clients.id"), nullable=False),
            sa.Column("seller_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
            sa.Column("status", quote_status_enum, nullable=False),
            sa.Column("subtotal", sa.Numeric(10, 2), nullable=True),
            sa.Column("desconto", sa.Numeric(10, 2), nullable=True),
            sa.Column("valor_frete", sa.Numeric(10, 2), nullable=True),
            sa.Column("total", sa.Numeric(10, 2), nullable=True),
            sa.Column("payment_condition", sa.String(), nullable=True),
            sa.Column("shipping_type", sa.String(), nullable=True),
            sa.Column("observations", sa.Text(), nullable=True),
            sa.Column("pdf_url", sa.String(), nullable=True),
            sa.Column("zapi_message_id", sa.String(), nullable=True),
            sa.Column("sent_at", sa.DateTime(), nullable=True),
            sa.Column("client_response", sa.String(), nullable=True),
            sa.Column("responded_at", sa.DateTime(), nullable=True),
            sa.Column("send_error", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(), nullable=True),
            sa.Column("updated_at", sa.DateTime(), nullable=True),
        )
    if not has_index("quotes", "ix_quotes_numero_orcamento"):
        op.create_index("ix_quotes_numero_orcamento", "quotes", ["numero_orcamento"], unique=True)

    if not has_table("quote_items"):
        op.create_table(
            "quote_items",
            sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
            sa.Column("quote_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("quotes.id"), nullable=False),
            sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id"), nullable=False),
            sa.Column("quantidade", sa.Numeric(10, 2), nullable=False),
            sa.Column("preco_unitario", sa.Numeric(10, 2), nullable=False),
            sa.Column("total_item", sa.Numeric(10, 2), nullable=False),
        )


def downgrade() -> None:
    op.drop_table("quote_items")
    op.drop_index("ix_quotes_numero_orcamento", table_name="quotes")
    op.drop_table("quotes")
    op.drop_index("ix_products_codigo", table_name="products")
    op.drop_table("products")
    op.drop_index("ix_clients_cnpj", table_name="clients")
    op.drop_table("clients")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
    postgresql.ENUM(name="quotestatus").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name="categoryenum").drop(op.get_bind(), checkfirst=True)
    postgresql.ENUM(name="roleenum").drop(op.get_bind(), checkfirst=True)
