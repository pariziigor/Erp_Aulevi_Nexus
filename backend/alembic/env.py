import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context

# 1. Adiciona o diretório raiz do backend ao path
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))

# 2. Importações de Configuração e Modelos
from src.core.config import settings
from src.core.database import Base
from src.models.user import User
from src.models.client import Client
from src.models.product import Product
from src.models.quote import Quote, QuoteItem, QuoteSequence
from src.models.audit_log import AuditLog
from src.models.commercial import PaymentCondition, ShippingType

# 3. Configurações base do Alembic
config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 4. Aponta o metadata
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """Executa migrações no modo offline."""
    url = settings.DATABASE_URL
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Executa migrações no modo online."""
    configuration = config.get_section(config.config_ini_section)
    configuration["sqlalchemy.url"] = settings.DATABASE_URL
    
    connectable = engine_from_config(
        configuration,
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
