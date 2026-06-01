from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

# Esquema base com os campos comuns
class ClientBase(BaseModel):
    cnpj: str = Field(..., description="CNPJ apenas com números ou formatado")
    razao_social: str
    nome_fantasia: Optional[str] = None
    situacao_cadastral: Optional[str] = None
    cnae: Optional[str] = None
    
    cep: Optional[str] = None
    endereco: Optional[str] = None
    numero: Optional[str] = None
    bairro: Optional[str] = None
    cidade: Optional[str] = None
    uf: Optional[str] = None
    
    contato_nome: str
    contato_email: EmailStr
    contato_whatsapp: str
    contato_telefone: Optional[str] = None
    is_active: bool = True

# Esquema usado para CRIAR um cliente (herda tudo do base)
class ClientCreate(ClientBase):
    pass

# Esquema usado para DEVOLVER os dados (Out/Response)
class ClientResponse(ClientBase):
    id: UUID
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True # Permite que o Pydantic leia modelos do SQLAlchemy
