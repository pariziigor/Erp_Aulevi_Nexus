from datetime import datetime
from decimal import Decimal
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.models.client import Client
from src.models.product import Product
from src.models.quote import Quote, QuoteItem, QuoteStatus
from src.models.user import User
from src.schemas.quotes import DashboardSummary, QuoteCreate, QuoteResponse, QuoteStatusUpdate
from src.services.auth import AuthService
from src.services.pdf import PDFService

router = APIRouter(prefix="/quotes", tags=["Orçamentos / Vendas"])


def _get_current_seller(db: Session, current_user) -> User:
    seller = db.query(User).filter(User.email == current_user.email, User.is_active == True).first()
    if not seller:
        raise HTTPException(status_code=404, detail="Usuário não identificado ou inativo no ERP.")
    return seller


def _build_quote(payload: QuoteCreate, db: Session, seller: User, status_value: QuoteStatus) -> Quote:
    client_exists = db.query(Client.id).filter(Client.id == payload.client_id, Client.is_active == True).first()
    if not client_exists:
        raise HTTPException(status_code=404, detail="Cliente não encontrado ou inativo.")

    subtotal = Decimal("0")
    items_to_save = []
    product_categories = []

    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id, Product.is_active == True).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Produto {item.product_id} não encontrado ou inativo.")

        item_total = product.preco * item.quantity
        subtotal += item_total
        product_categories.append(product.categoria.value)
        items_to_save.append(
            {
                "product_id": product.id,
                "quantidade": item.quantity,
                "preco_unitario": product.preco,
                "total_item": item_total,
            }
        )

    prefix = product_categories[0] if product_categories else "ORC"
    current_year = datetime.now().year
    existing_count = db.query(func.count(Quote.id)).filter(
        Quote.numero_orcamento.like(f"{prefix}-{current_year}-%")
    ).scalar() or 0
    quote_number = f"{prefix}-{current_year}-{existing_count + 1:06d}"

    total = subtotal - payload.desconto + payload.valor_frete
    if total < 0:
        raise HTTPException(status_code=400, detail="O desconto não pode deixar o orçamento negativo.")

    quote = Quote(
        numero_orcamento=quote_number,
        client_id=payload.client_id,
        seller_id=seller.id,
        status=status_value,
        subtotal=subtotal,
        desconto=payload.desconto,
        valor_frete=payload.valor_frete,
        total=total,
        payment_condition=payload.payment_condition,
        shipping_type=payload.shipping_type,
        observations=payload.observations,
    )
    db.add(quote)
    db.flush()

    for item_data in items_to_save:
        db.add(QuoteItem(quote_id=quote.id, **item_data))

    db.commit()
    db.refresh(quote)
    return quote


def _quote_pdf_response(quote: Quote):
    items_details = [
        {
            "codigo": item.product.codigo,
            "descricao": item.product.descricao,
            "unidade_medida": item.product.unidade_medida,
            "quantity": item.quantidade,
            "unit_price": item.preco_unitario,
            "subtotal": item.total_item,
        }
        for item in quote.items
    ]
    pdf_file = PDFService.gerar_pdf_orcamento(quote, quote.client, items_details)
    filename = f"Orcamento_{quote.numero_orcamento}.pdf"
    return StreamingResponse(
        pdf_file,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )


@router.post("", response_model=QuoteResponse, status_code=status.HTTP_201_CREATED)
def criar_orcamento(
    payload: QuoteCreate,
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    seller = _get_current_seller(db, current_user)
    return _build_quote(payload, db, seller, QuoteStatus.RASCUNHO)


@router.post("/generate", status_code=status.HTTP_201_CREATED)
def gerar_orcamento_pdf(
    payload: QuoteCreate,
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    seller = _get_current_seller(db, current_user)
    quote = _build_quote(payload, db, seller, QuoteStatus.PENDENTE)
    return _quote_pdf_response(quote)


@router.get("", response_model=List[QuoteResponse])
def listar_orcamentos(db: Session = Depends(get_db)):
    return db.query(Quote).order_by(Quote.created_at.desc()).all()


@router.patch("/{quote_id}/status", response_model=QuoteResponse)
def atualizar_status_orcamento(
    quote_id: UUID,
    payload: QuoteStatusUpdate,
    db: Session = Depends(get_db),
):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado.")

    quote.status = payload.status
    quote.client_response = payload.client_response
    quote.responded_at = datetime.utcnow()
    db.commit()
    db.refresh(quote)
    return quote


@router.post("/webhook/whatsapp", response_model=QuoteResponse)
def receber_resposta_whatsapp(payload: dict, db: Session = Depends(get_db)):
    quote_number = payload.get("quote_number") or payload.get("numero_orcamento")
    response_text = str(payload.get("response") or payload.get("message") or "").lower()

    if not quote_number:
        raise HTTPException(status_code=400, detail="Número do orçamento não informado no webhook.")

    quote = db.query(Quote).filter(Quote.numero_orcamento == quote_number).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado para o webhook.")

    if "aprov" in response_text:
        quote.status = QuoteStatus.APROVADO
    elif "cancel" in response_text:
        quote.status = QuoteStatus.CANCELADO
    else:
        quote.status = QuoteStatus.REVISADO

    quote.client_response = response_text
    quote.responded_at = datetime.utcnow()
    db.commit()
    db.refresh(quote)
    return quote


@router.get("/analytics/summary", response_model=DashboardSummary)
def resumo_dashboard(db: Session = Depends(get_db)):
    now = datetime.now()
    total_clients = db.query(func.count(Client.id)).filter(Client.is_active == True).scalar() or 0
    total_quotes = db.query(func.count(Quote.id)).scalar() or 0
    approved_quotes = db.query(func.count(Quote.id)).filter(
        Quote.status.in_([QuoteStatus.APROVADO, QuoteStatus.CONVERTIDO_EM_PEDIDO])
    ).scalar() or 0
    canceled_quotes = db.query(func.count(Quote.id)).filter(Quote.status == QuoteStatus.CANCELADO).scalar() or 0
    pending_quotes = db.query(func.count(Quote.id)).filter(Quote.status == QuoteStatus.PENDENTE).scalar() or 0

    quoted_month = db.query(func.coalesce(func.sum(Quote.total), 0)).filter(
        extract("year", Quote.created_at) == now.year,
        extract("month", Quote.created_at) == now.month,
    ).scalar()
    approved_month = db.query(func.coalesce(func.sum(Quote.total), 0)).filter(
        extract("year", Quote.created_at) == now.year,
        extract("month", Quote.created_at) == now.month,
        Quote.status.in_([QuoteStatus.APROVADO, QuoteStatus.CONVERTIDO_EM_PEDIDO]),
    ).scalar()
    average_ticket = db.query(func.coalesce(func.avg(Quote.total), 0)).filter(
        Quote.status.in_([QuoteStatus.APROVADO, QuoteStatus.CONVERTIDO_EM_PEDIDO])
    ).scalar()

    top_category = db.query(Product.categoria, func.coalesce(func.sum(QuoteItem.total_item), 0).label("value")).join(
        QuoteItem, QuoteItem.product_id == Product.id
    ).join(Quote, Quote.id == QuoteItem.quote_id).group_by(Product.categoria).order_by(
        func.coalesce(func.sum(QuoteItem.total_item), 0).desc()
    ).first()

    top_products = db.query(
        Product.codigo,
        Product.descricao,
        func.coalesce(func.sum(QuoteItem.quantidade), 0).label("quantity"),
    ).join(QuoteItem, QuoteItem.product_id == Product.id).group_by(
        Product.codigo, Product.descricao
    ).order_by(func.coalesce(func.sum(QuoteItem.quantidade), 0).desc()).limit(5).all()

    return {
        "total_clientes": total_clients,
        "total_orcamentos": total_quotes,
        "orcamentos_pendentes": pending_quotes,
        "orcamentos_aprovados": approved_quotes,
        "orcamentos_cancelados": canceled_quotes,
        "taxa_conversao": round((approved_quotes / total_quotes) * 100, 2) if total_quotes else 0,
        "valor_total_orcado_mes": quoted_month,
        "valor_total_aprovado_mes": approved_month,
        "ticket_medio": average_ticket,
        "categoria_maior_faturamento": top_category[0].value if top_category else None,
        "produtos_mais_orcados": [
            {"codigo": row.codigo, "descricao": row.descricao, "quantidade": float(row.quantity)}
            for row in top_products
        ],
    }


@router.get("/{quote_id}/pdf")
def exportar_orcamento_pdf(quote_id: UUID, db: Session = Depends(get_db)):
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado.")
    return _quote_pdf_response(quote)
