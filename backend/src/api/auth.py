from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.models.audit_log import AuditLog
from src.models.user import RoleEnum, User
from src.schemas.user import TokenResponse, UserCreate, UserLogin, UserResponse, UserUpdate
from src.services.auth import AuthService

router = APIRouter(prefix="/auth", tags=["Autenticacao / IAM"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def _get_admin_user(db: Session, current_user) -> User:
    admin = db.query(User).filter(User.email == current_user.email, User.is_active == True).first()
    if not admin or admin.role != RoleEnum.ADM:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso negado. Apenas administradores podem gerenciar usuarios.",
        )
    return admin


def _log_user_action(db: Session, actor: User, action: str, target: User, changes: dict | None = None) -> None:
    db.add(
        AuditLog(
            user_id=actor.id,
            user_name=actor.name,
            user_email=actor.email,
            action=action,
            entity_type="user",
            entity_id=str(target.id),
            entity_label=target.email,
            changes=changes,
        )
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    supabase_auth = AuthService.autenticar_usuario(payload.email, payload.password)
    user_local = db.query(User).filter(User.email == payload.email).first()

    if not user_local or not user_local.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Este usuario esta desativado no sistema comercial.",
        )

    return {
        "access_token": supabase_auth.session.access_token,
        "token_type": "bearer",
        "user": user_local,
    }


@router.get("/users", response_model=List[UserResponse])
def listar_usuarios(
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    _get_admin_user(db, current_user)
    return db.query(User).order_by(User.name.asc()).all()


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def criar_usuario(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    admin = _get_admin_user(db, current_user)

    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="E-mail ja cadastrado.")

    try:
        supabase_admin = AuthService.obter_cliente_admin()
        supabase_admin.auth.admin.create_user({
            "email": payload.email,
            "password": payload.password,
            "email_confirm": True,
        })
    except Exception as exc:
        if isinstance(exc, HTTPException):
            raise exc
        raise HTTPException(
            status_code=500,
            detail=(
                "Erro ao criar credenciais na nuvem. Verifique se SUPABASE_SERVICE_ROLE_KEY "
                f"esta configurada com a chave service_role correta. Detalhe: {str(exc)}"
            ),
        )

    new_user = User(
        name=payload.name,
        email=payload.email,
        password_hash=pwd_context.hash(payload.password),
        role=payload.role,
        is_active=True,
    )
    db.add(new_user)
    db.flush()
    _log_user_action(
        db,
        admin,
        "user_created",
        new_user,
        {"role": {"old": None, "new": payload.role.value}, "is_active": {"old": None, "new": True}},
    )
    db.commit()
    db.refresh(new_user)
    return new_user


@router.post("/register-seller", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def criar_vendedor(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    return criar_usuario(payload, db, current_user)


@router.patch("/users/{user_id}", response_model=UserResponse)
def atualizar_usuario(
    user_id: UUID,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    admin = _get_admin_user(db, current_user)
    target = db.query(User).filter(User.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="Usuario nao encontrado.")

    if target.id == admin.id and payload.is_active is False:
        raise HTTPException(status_code=400, detail="O administrador logado nao pode desativar o proprio acesso.")

    changes = {}
    if payload.role is not None and target.role != payload.role:
        changes["role"] = {"old": target.role.value, "new": payload.role.value}
        target.role = payload.role

    if payload.is_active is not None and target.is_active != payload.is_active:
        changes["is_active"] = {"old": target.is_active, "new": payload.is_active}
        target.is_active = payload.is_active

    if not changes:
        return target

    _log_user_action(db, admin, "user_permissions_updated", target, changes)
    db.commit()
    db.refresh(target)
    return target
