# backend/src/api/clients.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from src.core.database import get_db
from src.models.client import Client
from src.schemas.client import ClientCreate, ClientResponse
from src.services.cnpj import CNPJService

router = APIRouter(prefix="/clients", tags=["Clientes"])

@router.get("/cnpj/{cnpj}")
async def buscar_cnpj(cnpj: str):
    """Buca dados cadastrais de uma empresa automaticamente pelo CNPJ."""
    return await CNPJService.consultar_cnpj(cnpj)

@router.post("", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def cadastrar_cliente(payload: ClientCreate, db: Session = Depends(get_db)):
    """Salva um novo cliente na base compartilhada do Supabase. Evita duplicidade de CNPJ."""
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
    db.commit()
    db.refresh(novo_cliente)
    return novo_cliente

@router.get("", response_model=List[ClientResponse])
def listar_clientes(db: Session = Depends(get_db)):
    """Retorna todos os clientes cadastrados na base compartilhada."""
    return db.query(Client).filter(Client.is_active == True).all()
