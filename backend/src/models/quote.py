# backend/src/models/quote.py
import uuid
from sqlalchemy import Column, String, Numeric, Enum, ForeignKey, DateTime, Integer, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.core.database import Base
import enum
from datetime import datetime

class QuoteStatus(str, enum.Enum):
    RASCUNHO = "RASCUNHO"
    PENDENTE = "PENDENTE"
    APROVADO = "APROVADO"
    CANCELADO = "CANCELADO"
    EXPIRADO = "EXPIRADO"
    CONVERTIDO_EM_PEDIDO = "CONVERTIDO_EM_PEDIDO"
    REVISADO = "REVISADO"

class Quote(Base):
    __tablename__ = "quotes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    numero_orcamento = Column(String, unique=True, index=True, nullable=False)
    
    client_id = Column(UUID(as_uuid=True), ForeignKey("clients.id"), nullable=False)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    status = Column(Enum(QuoteStatus), default=QuoteStatus.RASCUNHO, nullable=False)
    
    # Valores Totais
    subtotal = Column(Numeric(10, 2), default=0)
    desconto = Column(Numeric(10, 2), default=0)
    valor_frete = Column(Numeric(10, 2), default=0)
    total = Column(Numeric(10, 2), default=0)
    payment_condition = Column(String, nullable=True)
    shipping_type = Column(String, nullable=True)
    observations = Column(Text, nullable=True)
    
    # Integrações
    pdf_url = Column(String, nullable=True)
    zapi_message_id = Column(String, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    client_response = Column(String, nullable=True)
    responded_at = Column(DateTime, nullable=True)
    send_error = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relacionamentos
    client = relationship("Client")
    seller = relationship("User")
    items = relationship("QuoteItem", back_populates="quote", cascade="all, delete-orphan")

class QuoteItem(Base):
    __tablename__ = "quote_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quote_id = Column(UUID(as_uuid=True), ForeignKey("quotes.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=False)
    
    quantidade = Column(Numeric(10, 2), nullable=False)
    preco_unitario = Column(Numeric(10, 2), nullable=False)
    total_item = Column(Numeric(10, 2), nullable=False)
    
    quote = relationship("Quote", back_populates="items")
    product = relationship("Product")


class QuoteSequence(Base):
    __tablename__ = "quote_sequences"
    __table_args__ = (
        UniqueConstraint("prefix", "year", name="uq_quote_sequences_prefix_year"),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    prefix = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    last_value = Column(Integer, nullable=False, default=0)
