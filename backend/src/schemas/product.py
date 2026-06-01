# backend/src/schemas/product.py
from pydantic import BaseModel, Field
from decimal import Decimal
from uuid import UUID
from datetime import datetime
from typing import Optional
from src.models.product import CategoryEnum

class ProductBase(BaseModel):
    codigo: str = Field(..., description="Código único do item (ex: PERFIL-LSF-01)")
    descricao: str = Field(..., description="Descrição detalhada do produto")
    categoria: CategoryEnum = Field(..., description="Categorias aceitas: LSF, MM ou CHALE")
    unidade_medida: str = Field(..., description="Ex: KG, METRO, UNID")
    preco: Decimal = Field(..., description="Preço unitário do item")
    is_active: bool = True # Forçando booleano nativo estrito

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
