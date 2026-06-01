# backend/src/models/product.py
import uuid
from sqlalchemy import Column, String, Boolean, Numeric, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from src.core.database import Base
import enum
from datetime import datetime

class CategoryEnum(str, enum.Enum):
    LSF = "LSF"
    MM = "MM"
    CHALE = "CHALE"

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    codigo = Column(String, unique=True, index=True, nullable=False)
    descricao = Column(String, nullable=False)
    categoria = Column(Enum(CategoryEnum), nullable=False)
    unidade_medida = Column(String, nullable=False)
    
    # Usando Numeric para precisão monetária (evita erros de ponto flutuante)
    preco = Column(Numeric(10, 2), nullable=False)
    
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
