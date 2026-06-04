from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field

from src.models.quote import QuoteStatus


class QuoteItemCreate(BaseModel):
    product_id: UUID
    quantity: Decimal = Field(..., gt=0, description="Quantidade deve ser maior que zero")


class QuoteItemResponse(BaseModel):
    id: UUID
    product_id: UUID
    quantidade: Decimal
    preco_unitario: Decimal
    total_item: Decimal

    class Config:
        from_attributes = True


class QuoteCreate(BaseModel):
    client_id: UUID
    items: List[QuoteItemCreate] = Field(..., min_length=1, description="O orçamento deve ter pelo menos um item")
    payment_condition: Optional[str] = None
    shipping_type: Optional[str] = None
    observations: Optional[str] = None
    desconto: Decimal = Field(default=0, ge=0)
    valor_frete: Decimal = Field(default=0, ge=0)


class QuoteStatusUpdate(BaseModel):
    status: QuoteStatus
    client_response: Optional[str] = None


class QuoteResponse(BaseModel):
    id: UUID
    numero_orcamento: str
    client_id: UUID
    seller_id: UUID
    status: QuoteStatus
    subtotal: Decimal
    desconto: Decimal
    valor_frete: Decimal
    total: Decimal
    payment_condition: Optional[str] = None
    shipping_type: Optional[str] = None
    observations: Optional[str] = None
    zapi_message_id: Optional[str] = None
    client_response: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    items: List[QuoteItemResponse] = []

    class Config:
        from_attributes = True


class DashboardSummary(BaseModel):
    total_clientes: int
    total_orcamentos: int
    orcamentos_pendentes: int
    orcamentos_aprovados: int
    orcamentos_cancelados: int
    taxa_conversao: float
    valor_total_orcado_mes: Decimal
    valor_total_aprovado_mes: Decimal
    ticket_medio: Decimal
    categoria_maior_faturamento: Optional[str] = None
    vendedor_maior_valor: Optional[dict] = None
    vendedor_maior_pedidos: Optional[dict] = None
    regiao_maior_vendas: Optional[dict] = None
    ranking_vendedores: list[dict] = []
    regioes_clientes_vendas: list[dict] = []
    tempo_medio_conversao_horas: float = 0
    produtos_mais_orcados: list[dict]
