from datetime import date, datetime, time
from decimal import Decimal
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import StreamingResponse
from sqlalchemy import extract, func, text
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.models.client import Client
from src.models.commercial import PaymentCondition, ShippingType
from src.models.product import Product
from src.models.quote import Quote, QuoteItem, QuoteSequence, QuoteStatus
from src.models.user import RoleEnum, User
from src.schemas.quotes import DashboardSummary, QuoteCreate, QuoteResponse, QuoteStatusUpdate
from src.services.auth import AuthService
from src.services.access import get_active_user, require_admin
from src.services.pdf import PDFService

router = APIRouter(prefix="/quotes", tags=["Orcamentos / Vendas"])


def _get_current_seller(db: Session, current_user) -> User:
    return get_active_user(db, current_user)


def _get_current_admin(db: Session, current_user) -> User:
    return require_admin(db, current_user)


def _can_access_quote(user: User, quote: Quote) -> bool:
    return user.role == RoleEnum.ADM or quote.seller_id == user.id


ALLOWED_STATUS_TRANSITIONS = {
    QuoteStatus.RASCUNHO: {QuoteStatus.PENDENTE, QuoteStatus.CANCELADO},
    QuoteStatus.PENDENTE: {QuoteStatus.REVISADO, QuoteStatus.APROVADO, QuoteStatus.CANCELADO, QuoteStatus.EXPIRADO},
    QuoteStatus.REVISADO: {QuoteStatus.PENDENTE, QuoteStatus.APROVADO, QuoteStatus.CANCELADO, QuoteStatus.EXPIRADO},
    QuoteStatus.APROVADO: {QuoteStatus.CONVERTIDO_EM_PEDIDO, QuoteStatus.CANCELADO},
    QuoteStatus.CANCELADO: set(),
    QuoteStatus.EXPIRADO: {QuoteStatus.REVISADO},
    QuoteStatus.CONVERTIDO_EM_PEDIDO: set(),
}


def _validate_status_transition(current: QuoteStatus, target: QuoteStatus) -> None:
    if current == target:
        return
    if target not in ALLOWED_STATUS_TRANSITIONS[current]:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Transicao de status invalida: {current.value} -> {target.value}.",
        )


def _next_quote_number(db: Session, prefix: str, year: int) -> str:
    lock_key = f"quote-sequence:{prefix}:{year}"
    db.execute(text("SELECT pg_advisory_xact_lock(hashtext(:lock_key))"), {"lock_key": lock_key})

    sequence = db.query(QuoteSequence).filter(
        QuoteSequence.prefix == prefix,
        QuoteSequence.year == year,
    ).first()
    if not sequence:
        existing_numbers = db.query(Quote.numero_orcamento).filter(
            Quote.numero_orcamento.like(f"{prefix}-{year}-%")
        ).all()
        existing_values = []
        for (number,) in existing_numbers:
            try:
                existing_values.append(int(str(number).rsplit("-", 1)[-1]))
            except ValueError:
                continue
        sequence = QuoteSequence(prefix=prefix, year=year, last_value=max(existing_values, default=0))
        db.add(sequence)

    sequence.last_value += 1
    db.flush()
    return f"{prefix}-{year}-{sequence.last_value:06d}"


def _quote_detail_payload(quote: Quote) -> dict:
    return {
        "id": quote.id,
        "numero_orcamento": quote.numero_orcamento,
        "status": quote.status.value,
        "client_id": quote.client_id,
        "client_name": quote.client.razao_social if quote.client else None,
        "client_cnpj": quote.client.cnpj if quote.client else None,
        "client_city": quote.client.cidade if quote.client else None,
        "client_uf": quote.client.uf if quote.client else None,
        "seller_id": quote.seller_id,
        "seller_name": quote.seller.name if quote.seller else None,
        "subtotal": quote.subtotal,
        "desconto": quote.desconto,
        "valor_frete": quote.valor_frete,
        "total": quote.total,
        "payment_condition": quote.payment_condition,
        "shipping_type": quote.shipping_type,
        "observations": quote.observations,
        "client_response": quote.client_response,
        "created_at": quote.created_at,
        "updated_at": quote.updated_at,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "codigo": item.product.codigo if item.product else None,
                "descricao": item.product.descricao if item.product else None,
                "categoria": item.product.categoria.value if item.product and item.product.categoria else None,
                "unidade_medida": item.product.unidade_medida if item.product else None,
                "quantidade": item.quantidade,
                "preco_unitario": item.preco_unitario,
                "total_item": item.total_item,
            }
            for item in quote.items
        ],
    }


def _build_quote(payload: QuoteCreate, db: Session, seller: User, status_value: QuoteStatus) -> Quote:
    client_exists = db.query(Client.id).filter(Client.id == payload.client_id, Client.is_active == True).first()
    if not client_exists:
        raise HTTPException(status_code=404, detail="Cliente nao encontrado ou inativo.")

    if payload.payment_condition:
        payment_exists = db.query(PaymentCondition.id).filter(
            PaymentCondition.code == payload.payment_condition,
            PaymentCondition.is_active == True,
        ).first()
        if not payment_exists:
            raise HTTPException(status_code=400, detail="Condicao de pagamento invalida ou inativa.")

    if payload.shipping_type:
        shipping_exists = db.query(ShippingType.id).filter(
            ShippingType.code == payload.shipping_type,
            ShippingType.is_active == True,
        ).first()
        if not shipping_exists:
            raise HTTPException(status_code=400, detail="Tipo de frete invalido ou inativo.")

    subtotal = Decimal("0")
    items_to_save = []
    product_categories = []

    for item in payload.items:
        product = db.query(Product).filter(Product.id == item.product_id, Product.is_active == True).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Produto {item.product_id} nao encontrado ou inativo.")

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
    quote_number = _next_quote_number(db, prefix, current_year)

    total = subtotal - payload.desconto + payload.valor_frete
    if total < 0:
        raise HTTPException(status_code=400, detail="O desconto nao pode deixar o orcamento negativo.")

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

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise
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
def listar_orcamentos(
    quote_status: QuoteStatus | None = Query(default=None, alias="status"),
    vendor_id: UUID | None = None,
    data_inicio: date | None = None,
    data_fim: date | None = None,
    skip: int = Query(default=0, ge=0),
    limit: int | None = Query(default=None, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    user = _get_current_seller(db, current_user)
    query = db.query(Quote)
    if user.role != RoleEnum.ADM:
        query = query.filter(Quote.seller_id == user.id)
    elif vendor_id:
        query = query.filter(Quote.seller_id == vendor_id)
    if quote_status:
        query = query.filter(Quote.status == quote_status)
    if data_inicio:
        query = query.filter(Quote.created_at >= datetime.combine(data_inicio, time.min))
    if data_fim:
        query = query.filter(Quote.created_at <= datetime.combine(data_fim, time.max))
    query = query.order_by(Quote.created_at.desc()).offset(skip)
    if limit is not None:
        query = query.limit(limit)
    return query.all()


@router.get("/seller/dashboard")
def dashboard_vendedor(
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    seller = _get_current_seller(db, current_user)
    quotes = db.query(Quote).filter(Quote.seller_id == seller.id).order_by(Quote.created_at.desc()).all()

    total_quotes = len(quotes)
    approved_statuses = {QuoteStatus.APROVADO, QuoteStatus.CONVERTIDO_EM_PEDIDO}
    pending_quotes = sum(1 for quote in quotes if quote.status == QuoteStatus.PENDENTE)
    approved_quotes = sum(1 for quote in quotes if quote.status in approved_statuses)
    canceled_quotes = sum(1 for quote in quotes if quote.status == QuoteStatus.CANCELADO)
    total_pipeline = sum((quote.total or Decimal("0")) for quote in quotes)
    approved_value = sum((quote.total or Decimal("0")) for quote in quotes if quote.status in approved_statuses)

    return {
        "seller": {"id": seller.id, "name": seller.name, "email": seller.email},
        "summary": {
            "total_orcamentos": total_quotes,
            "orcamentos_pendentes": pending_quotes,
            "orcamentos_aprovados": approved_quotes,
            "orcamentos_cancelados": canceled_quotes,
            "taxa_conversao": round((approved_quotes / total_quotes) * 100, 2) if total_quotes else 0,
            "valor_total_orcado": total_pipeline,
            "valor_total_aprovado": approved_value,
            "ticket_medio": (total_pipeline / total_quotes) if total_quotes else Decimal("0"),
        },
        "quotes": [_quote_detail_payload(quote) for quote in quotes],
    }


@router.patch("/{quote_id}/status", response_model=QuoteResponse)
def atualizar_status_orcamento(
    quote_id: UUID,
    payload: QuoteStatusUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    user = _get_current_seller(db, current_user)
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Orcamento nao encontrado.")
    if not _can_access_quote(user, quote):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado ao orcamento solicitado.")

    _validate_status_transition(quote.status, payload.status)
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
        raise HTTPException(status_code=400, detail="Numero do orcamento nao informado no webhook.")

    quote = db.query(Quote).filter(Quote.numero_orcamento == quote_number).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Orcamento nao encontrado para o webhook.")

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
def resumo_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    _get_current_admin(db, current_user)
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

    sales_statuses = [QuoteStatus.APROVADO, QuoteStatus.CONVERTIDO_EM_PEDIDO]

    top_category = db.query(Product.categoria, func.coalesce(func.sum(QuoteItem.total_item), 0).label("value")).join(
        QuoteItem, QuoteItem.product_id == Product.id
    ).join(Quote, Quote.id == QuoteItem.quote_id).group_by(Product.categoria).order_by(
        func.coalesce(func.sum(QuoteItem.total_item), 0).desc()
    ).first()

    top_seller_value = db.query(
        User.name,
        User.email,
        func.coalesce(func.sum(Quote.total), 0).label("value"),
        func.count(Quote.id).label("orders"),
    ).join(Quote, Quote.seller_id == User.id).filter(
        Quote.status.in_(sales_statuses)
    ).group_by(User.name, User.email).order_by(
        func.coalesce(func.sum(Quote.total), 0).desc()
    ).first()

    top_seller_orders = db.query(
        User.name,
        User.email,
        func.count(Quote.id).label("orders"),
        func.coalesce(func.sum(Quote.total), 0).label("value"),
    ).join(Quote, Quote.seller_id == User.id).filter(
        Quote.status.in_(sales_statuses)
    ).group_by(User.name, User.email).order_by(
        func.count(Quote.id).desc(),
        func.coalesce(func.sum(Quote.total), 0).desc(),
    ).first()

    top_region = db.query(
        func.coalesce(Client.uf, Client.cidade, "Sem regiao").label("region"),
        func.coalesce(func.sum(Quote.total), 0).label("value"),
        func.count(Quote.id).label("orders"),
    ).join(Quote, Quote.client_id == Client.id).filter(
        Quote.status.in_(sales_statuses)
    ).group_by(func.coalesce(Client.uf, Client.cidade, "Sem regiao")).order_by(
        func.coalesce(func.sum(Quote.total), 0).desc()
    ).first()

    seller_rankings = db.query(
        User.name,
        User.email,
        func.count(Quote.id).label("orders"),
        func.coalesce(func.sum(Quote.total), 0).label("value"),
    ).join(Quote, Quote.seller_id == User.id).filter(
        Quote.status.in_(sales_statuses)
    ).group_by(User.name, User.email).order_by(
        func.coalesce(func.sum(Quote.total), 0).desc(),
        func.count(Quote.id).desc(),
    ).limit(8).all()

    client_regions = db.query(
        func.coalesce(Client.uf, Client.cidade, "Sem regiao").label("region"),
        func.count(Client.id).label("clients"),
    ).filter(Client.is_active == True).group_by(
        func.coalesce(Client.uf, Client.cidade, "Sem regiao")
    ).all()

    sales_regions = db.query(
        func.coalesce(Client.uf, Client.cidade, "Sem regiao").label("region"),
        func.coalesce(func.sum(Quote.total), 0).label("value"),
        func.count(Quote.id).label("orders"),
    ).join(Quote, Quote.client_id == Client.id).filter(
        Quote.status.in_(sales_statuses)
    ).group_by(func.coalesce(Client.uf, Client.cidade, "Sem regiao")).all()

    region_map = {
        row.region: {"region": row.region, "clients": row.clients, "orders": 0, "value": Decimal("0")}
        for row in client_regions
    }
    for row in sales_regions:
        region_map.setdefault(row.region, {"region": row.region, "clients": 0, "orders": 0, "value": Decimal("0")})
        region_map[row.region]["orders"] = row.orders
        region_map[row.region]["value"] = row.value

    region_rankings = sorted(
        region_map.values(),
        key=lambda item: (item["value"], item["clients"], item["orders"]),
        reverse=True,
    )[:8]

    conversion_seconds = db.query(
        func.coalesce(func.avg(func.extract("epoch", Quote.updated_at - Quote.created_at)), 0)
    ).filter(
        Quote.status == QuoteStatus.CONVERTIDO_EM_PEDIDO,
        Quote.updated_at.isnot(None),
    ).scalar() or 0

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
        "vendedor_maior_valor": {
            "name": top_seller_value.name,
            "email": top_seller_value.email,
            "value": top_seller_value.value,
            "orders": top_seller_value.orders,
        } if top_seller_value else None,
        "vendedor_maior_pedidos": {
            "name": top_seller_orders.name,
            "email": top_seller_orders.email,
            "orders": top_seller_orders.orders,
            "value": top_seller_orders.value,
        } if top_seller_orders else None,
        "regiao_maior_vendas": {
            "region": top_region.region,
            "value": top_region.value,
            "orders": top_region.orders,
        } if top_region else None,
        "ranking_vendedores": [
            {
                "name": row.name,
                "email": row.email,
                "orders": row.orders,
                "value": row.value,
            }
            for row in seller_rankings
        ],
        "regioes_clientes_vendas": region_rankings,
        "tempo_medio_conversao_horas": round(float(conversion_seconds) / 3600, 2),
        "produtos_mais_orcados": [
            {"codigo": row.codigo, "descricao": row.descricao, "quantidade": float(row.quantity)}
            for row in top_products
        ],
    }


@router.get("/{quote_id}/pdf")
def exportar_orcamento_pdf(
    quote_id: UUID,
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    user = _get_current_seller(db, current_user)
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Orcamento nao encontrado.")
    if not _can_access_quote(user, quote):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso negado ao orcamento solicitado.")
    return _quote_pdf_response(quote)
