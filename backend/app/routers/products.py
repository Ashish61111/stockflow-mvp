from typing import Annotated
from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy import or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.product import Product
from app.models.user import User
from app.schemas.product import (
    ProductCreate,
    ProductRead,
    ProductUpdate,
)

router = APIRouter(
    prefix="/api/products",
    tags=["Products"],
)


def get_owned_product(
        product_id: UUID,
        current_user: User,
        db: Session,
) -> Product:
    product = db.scalar(
        select(Product).where(
            Product.id == product_id,
            Product.organization_id == current_user.organization_id,
        )
    )

    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )

    return product


@router.post(
    "/",
    response_model=ProductRead,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
        payload: ProductCreate,
        db: Annotated[Session, Depends(get_db)],
        current_user: Annotated[User, Depends(get_current_user)],
):
    product = Product(
        **payload.model_dump(),
        organization_id=current_user.organization_id,
    )

    db.add(product)

    try:
        db.commit()
        db.refresh(product)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A product with this SKU already exists in your organization",
        )

    return product


@router.get(
    "/",
    response_model=list[ProductRead],
)
def list_products(
        db: Annotated[Session, Depends(get_db)],
        current_user: Annotated[User, Depends(get_current_user)],
        search: Annotated[str | None, Query(max_length=100)] = None,
):
    statement = select(Product).where(
        Product.organization_id == current_user.organization_id
    )

    if search and search.strip():
        search_term = f"%{search.strip()}%"

        statement = statement.where(
            or_(
                Product.name.ilike(search_term),
                Product.sku.ilike(search_term),
            )
        )

    statement = statement.order_by(Product.created_at.desc())

    return list(db.scalars(statement).all())


@router.get(
    "/{product_id}",
    response_model=ProductRead,
)
def get_product(
        product_id: UUID,
        db: Annotated[Session, Depends(get_db)],
        current_user: Annotated[User, Depends(get_current_user)],
):
    return get_owned_product(product_id, current_user, db)


@router.put(
    "/{product_id}",
    response_model=ProductRead,
)
def update_product(
        product_id: UUID,
        payload: ProductUpdate,
        db: Annotated[Session, Depends(get_db)],
        current_user: Annotated[User, Depends(get_current_user)],
):
    product = get_owned_product(product_id, current_user, db)

    changes = payload.model_dump(exclude_unset=True)

    if not changes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields provided for update",
        )

    required_fields = {"name", "sku", "quantity_on_hand"}

    for field in required_fields:
        if field in changes and changes[field] is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"{field} cannot be null",
            )

    if "sku" in changes:
        existing_product = db.scalar(
            select(Product).where(
                Product.organization_id == current_user.organization_id,
                Product.sku == changes["sku"],
                Product.id != product_id,
            )
        )

        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This SKU is already used by another product",
            )

    for field, value in changes.items():
        setattr(product, field, value)

    try:
        db.commit()
        db.refresh(product)

    except IntegrityError:
        db.rollback()

        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Product update conflicts with existing inventory data",
        )

    return product


@router.delete(
    "/{product_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_product(
        product_id: UUID,
        db: Annotated[Session, Depends(get_db)],
        current_user: Annotated[User, Depends(get_current_user)],
):
    product = get_owned_product(product_id, current_user, db)

    db.delete(product)
    db.commit()

    return None
