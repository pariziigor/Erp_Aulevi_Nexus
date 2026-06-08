# backend/src/models/__init__.py
from src.core.database import Base
from src.models.user import User
from src.models.client import Client
from src.models.product import Product
from src.models.quote import Quote, QuoteItem, QuoteSequence
from src.models.audit_log import AuditLog
from src.models.commercial import PaymentCondition, ShippingType

# Isso garante que quando importarmos Base daqui, o SQLAlchemy já mapeou todas as tabelas
