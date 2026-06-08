from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from src.models.user import RoleEnum, User


def get_active_user(db: Session, current_user) -> User:
    email = str(getattr(current_user, "email", "") or "").strip().lower()
    user = db.query(User).filter(User.email == email, User.is_active == True).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Usuario nao encontrado ou desativado no ERP.",
        )
    return user


def require_admin(db: Session, current_user) -> User:
    user = get_active_user(db, current_user)
    if user.role != RoleEnum.ADM:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Acesso restrito a administradores.",
        )
    return user
