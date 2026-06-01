# backend/src/schemas/quote.py
from pydantic import BaseModel, Field
from decimal import Decimal
from uuid import UUID
from typing import List, Optional
from datetime import datetime
from src.models.quote import QuoteStatus

# Validação do Item que vem de dentro do Orçamento
class QuoteItemCreate(BaseModel):
    product_id: UUID
    quantity: Decimal = Field(..., gt=0, description="Quantidade deve ser maior que zero")

class QuoteItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    quantity: Decimal
    unit_price: Decimal
    subtotal: Decimal

    class Config:
        from_attributes = True

# Validação principal do Orçamento
class QuoteCreate(BaseModel):
    client_id: UUID
    items: List[QuoteItemCreate] = Field(..., min_items=1, description="O orçamento deve ter pelo menos um item")

class QuoteResponse(BaseModel):
    id: UUID
    numero_orcamento: str
    client_id: UUID
    user_id: UUID
    total_amount: Decimal
    status: QuoteStatus
    created_at: datetime
    items: List[QuoteItemResponse]

    class Config:
        from_attributes = True