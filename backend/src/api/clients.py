# backend/src/api/clients.py
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from src.core.database import get_db
from src.models.audit_log import AuditLog
from src.models.client import Client
from src.schemas.client import ClientContactUpdate, ClientCreate, ClientResponse
from src.services.cnpj import CNPJService
from src.services.auth import AuthService
from src.services.access import get_active_user

router = APIRouter(prefix="/clients", tags=["Clientes"])

@router.get("/cnpj/{cnpj}")
async def buscar_cnpj(
    cnpj: str,
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    """Buca dados cadastrais de uma empresa automaticamente pelo CNPJ."""
    get_active_user(db, current_user)
    return await CNPJService.consultar_cnpj(cnpj)

@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_cliente(
    payload: ClientCreate,
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    """Salva um novo cliente na base compartilhada do Supabase. Evita duplicidade de CNPJ."""
    get_active_user(db, current_user)
    # Garante CNPJ apenas com números para busca no banco
    cnpj_limpo = "".join(filter(str.isdigit, payload.cnpj))
    
    # Regra de negócio: Evitar duplicidade de CNPJ
    cliente_existente = db.query(Client).filter(Client.cnpj == cnpj_limpo).first()
    if cliente_existente:
        # Retorna o cliente existente diretamente para o vendedor vinculá-lo ao orçamento
        return cliente_existente

    # Cria a instância mapeada para o banco de dados
    novo_cliente = Client(
        cnpj=cnpj_limpo,
        razao_social=payload.razao_social,
        nome_fantasia=payload.nome_fantasia,
        situacao_cadastral=payload.situacao_cadastral,
        cnae=payload.cnae,
        cep=payload.cep,
        endereco=payload.endereco,
        numero=payload.numero,
        bairro=payload.bairro,
        cidade=payload.cidade,
        uf=payload.uf,
        contato_nome=payload.contato_nome,
        contato_email=payload.contato_email,
        contato_whatsapp=payload.contato_whatsapp,
        contato_telefone=payload.contato_telefone,
        is_active=True # Booleano nativo estrito
    )
    
    db.add(novo_cliente)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        cliente_existente = db.query(Client).filter(Client.cnpj == cnpj_limpo).first()
        if cliente_existente:
            return cliente_existente
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Nao foi possivel cadastrar o cliente por conflito de dados.",
        )
    db.refresh(novo_cliente)
    return novo_cliente

@router.get("", response_model=List[ClientResponse])
def listar_clientes(
    search: str | None = Query(default=None, max_length=120),
    uf: str | None = Query(default=None, min_length=2, max_length=2),
    skip: int = Query(default=0, ge=0),
    limit: int | None = Query(default=None, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    """Retorna todos os clientes cadastrados na base compartilhada."""
    get_active_user(db, current_user)
    query = db.query(Client).filter(Client.is_active == True)
    if search:
        term = f"%{search.strip()}%"
        query = query.filter(or_(
            Client.cnpj.ilike(term),
            Client.razao_social.ilike(term),
            Client.nome_fantasia.ilike(term),
            Client.cidade.ilike(term),
        ))
    if uf:
        query = query.filter(Client.uf == uf.upper())
    query = query.order_by(Client.razao_social.asc()).offset(skip)
    if limit is not None:
        query = query.limit(limit)
    return query.all()


@router.patch("/{client_id}/contact", response_model=ClientResponse)
def atualizar_contato_cliente(
    client_id: UUID,
    payload: ClientContactUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    """Atualiza apenas e-mail e telefones de contato. Cliente cadastrado nunca é removido por esta rota."""
    client = db.query(Client).filter(Client.id == client_id, Client.is_active == True).first()
    if not client:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cliente não encontrado.")

    actor = get_active_user(db, current_user)

    allowed_fields = ("contato_email", "contato_whatsapp", "contato_telefone")
    changes = {}

    for field in allowed_fields:
        new_value = getattr(payload, field)
        if new_value is None:
            continue

        old_value = getattr(client, field)
        if old_value != new_value:
            changes[field] = {"old": old_value, "new": new_value}
            setattr(client, field, new_value)

    if not changes:
        return client

    log = AuditLog(
        user_id=actor.id,
        user_name=actor.name,
        user_email=actor.email,
        action="client_contact_updated",
        entity_type="client",
        entity_id=str(client.id),
        entity_label=client.razao_social,
        changes=changes,
    )
    db.add(log)
    db.commit()
    db.refresh(client)
    return client
