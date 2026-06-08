from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.models.commercial import PaymentCondition, ShippingType
from src.schemas.commercial import CommercialOptionCreate, CommercialOptionResponse, CommercialOptionUpdate
from src.services.access import get_active_user, require_admin
from src.services.auth import AuthService

router = APIRouter(prefix="/commercial-options", tags=["Configuracoes Comerciais"])


def _list_options(model, db: Session, include_inactive: bool):
    query = db.query(model)
    if not include_inactive:
        query = query.filter(model.is_active == True)
    return query.order_by(model.sort_order.asc(), model.label.asc()).all()


def _create_option(model, payload: CommercialOptionCreate, db: Session):
    option = model(**payload.model_dump())
    db.add(option)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Ja existe uma opcao com o codigo '{payload.code}'.",
        )
    db.refresh(option)
    return option


def _update_option(model, option_id: UUID, payload: CommercialOptionUpdate, db: Session):
    option = db.query(model).filter(model.id == option_id).first()
    if not option:
        raise HTTPException(status_code=404, detail="Opcao comercial nao encontrada.")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(option, field, value.strip() if isinstance(value, str) else value)

    db.commit()
    db.refresh(option)
    return option


@router.get("/payment-conditions", response_model=list[CommercialOptionResponse])
def list_payment_conditions(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    user = get_active_user(db, current_user)
    return _list_options(PaymentCondition, db, include_inactive and user.role.value == "ADM")


@router.post("/payment-conditions", response_model=CommercialOptionResponse, status_code=201)
def create_payment_condition(
    payload: CommercialOptionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    require_admin(db, current_user)
    return _create_option(PaymentCondition, payload, db)


@router.patch("/payment-conditions/{option_id}", response_model=CommercialOptionResponse)
def update_payment_condition(
    option_id: UUID,
    payload: CommercialOptionUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    require_admin(db, current_user)
    return _update_option(PaymentCondition, option_id, payload, db)


@router.get("/shipping-types", response_model=list[CommercialOptionResponse])
def list_shipping_types(
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    user = get_active_user(db, current_user)
    return _list_options(ShippingType, db, include_inactive and user.role.value == "ADM")


@router.post("/shipping-types", response_model=CommercialOptionResponse, status_code=201)
def create_shipping_type(
    payload: CommercialOptionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    require_admin(db, current_user)
    return _create_option(ShippingType, payload, db)


@router.patch("/shipping-types/{option_id}", response_model=CommercialOptionResponse)
def update_shipping_type(
    option_id: UUID,
    payload: CommercialOptionUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(AuthService.obter_usuario_logado),
):
    require_admin(db, current_user)
    return _update_option(ShippingType, option_id, payload, db)
