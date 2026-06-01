# backend/src/api/quotes.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from datetime import datetime
from uuid import UUID
from src.core.database import get_db
from src.models.quote import Quote, QuoteItem
from src.models.product import Product
from src.models.user import User
from src.schemas.quotes import QuoteCreate, QuoteResponse
from src.services.auth import AuthService
from fastapi.responses import StreamingResponse
from src.services.pdf import PDFService

router = APIRouter(prefix="/quotes", tags=["Orçamentos / Vendas"])

@router.post("", response_model=QuoteResponse, status_code=status.HTTP_201_CREATED)
def criar_orcamento(
    payload: QuoteCreate, 
    db: Session = Depends(get_db), 
    current_user: dict = Depends(AuthService.obter_usuario_logado)
):
    """
    Cria um orçamento comercial completo, calcula subtotais/totais com precisão decimal
     e gera a numeração sequencial única baseada na categoria predominante e no ano corrente (2026).
    """
    # 1. Busca o vendedor local no banco
    vendedor = db.query(User).filter(User.email == current_user.email).first()
    if not vendedor:
        raise HTTPException(status_code=404, detail="Vendedor não identificado no sistema.")

    # 2. Processamento analítico dos itens e cálculo de valores
    total_geral = 0
    itens_para_salvar = []
    categorias_dos_produtos = []

    for item in payload.items:
        produto = db.query(Product).filter(Product.id == item.product_id, Product.is_active == True).first()
        if not produto:
            raise HTTPException(
                status_code=404, 
                detail=f"Produto com ID {item.product_id} não encontrado ou está inativo."
            )
        
        # Cálculo de precisão com tipo Decimal nativo
        subtotal_item = produto.preco * item.quantity
        total_geral += subtotal_item
        categorias_dos_produtos.append(produto.categoria.value)

        # Guarda a estrutura do item provisoriamente
        itens_para_salvar.append({
            "product_id": produto.id,
            "quantity": item.quantity,
            "unit_price": produto.preco,
            "subtotal": subtotal_item
        })

    # 3. Algoritmo de definição do Prefixo do Orçamento (Baseado na categoria do primeiro item)
    # Se houver itens mistos, adota a categoria do primeiro produto inserido
    prefixo_categoria = categorias_dos_produtos[0] if categorias_dos_produtos else "ORC"
    ano_atual = datetime.now().year # Dinâmico (2026)

    # 4. Cálculo do Sequencial Único (Bloqueio de concorrência simples via contagem)
    contador_ano = db.query(func.count(Quote.id)).filter(
        Quote.numero_orcamento.like(f"{prefixo_categoria}-{ano_atual}-%")
    ).scalar()
    
    proximo_sequencial = contador_ano + 1
    # Formata como: LSF-2026-0001
    codigo_identificador = f"{prefixo_categoria}-{ano_atual}-{proximo_sequencial:04d}"

    # 5. Salva o cabeçalho do Orçamento
    novo_orcamento = Quote(
        numero_orcamento=codigo_identificador,
        client_id=payload.client_id,
        user_id=vendedor.id,
        total_amount=total_geral,
        status="DRAFT" # Status inicial estrito
    )
    db.add(novo_orcamento)
    db.commit() # Commita para gerar o ID do orçamento pai
    db.refresh(novo_orcamento)

    # 6. Salva os itens vinculados ao ID do orçamento pai
    for item_dados in itens_para_salvar:
        db_item = QuoteItem(
            quote_id=novo_orcamento.id,
            product_id=item_dados["product_id"],
            quantity=item_dados["quantity"],
            unit_price=item_dados["unit_price"],
            subtotal=item_dados["subtotal"]
        )
        db.add(db_item)
    
    db.commit()
    db.refresh(novo_orcamento)
    
    return novo_orcamento

@router.get("", response_model=List[QuoteResponse])
def listar_orcamentos(db: Session = Depends(get_db)):
    """Lista todos os orçamentos emitidos no sistema para controle e auditoria."""
    return db.query(Quote).order_by(Quote.created_at.desc()).all()

@router.get("/{quote_id}/pdf")
def exportar_orcamento_pdf(quote_id: UUID, db: Session = Depends(get_db)):
    """
    Busca o orçamento e gera o arquivo PDF customizado de alta qualidade
    pronto para download ou impressão pelo vendedor.
    """
    # 1. Busca o cabeçalho do orçamento
    quote = db.query(Quote).filter(Quote.id == quote_id).first()
    if not quote:
        raise HTTPException(status_code=404, detail="Orçamento não encontrado.")
        
    # 2. Busca os dados do cliente vinculado
    client = quote.client
    
    # 3. Monta os detalhes dos itens com as descrições e códigos do produto
    items_details = []
    for item in quote.items:
        items_details.append({
            "codigo": item.product.codigo,
            "descricao": item.product.descricao,
            "unidade_medida": item.product.unidade_medida,
            "quantity": item.quantity,
            "unit_price": item.unit_price,
            "subtotal": item.subtotal
        })
        
    # 4. Dispara a geração do PDF
    pdf_file = PDFService.gerar_pdf_orcamento(quote, client, items_details)
    
    # 5. Retorna o arquivo como um fluxo de download binário para o navegador
    filename = f"Orcamento_{quote.numero_orcamento}.pdf"
    return StreamingResponse(
        pdf_file, 
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )