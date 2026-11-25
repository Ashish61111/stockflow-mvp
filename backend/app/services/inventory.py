from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.product import Product
from app.models.setting import OrganizationSetting


def get_default_threshold(
        db: Session,
        organization_id: UUID,
) -> int:
    threshold = db.scalar(
        select(
            OrganizationSetting.default_low_stock_threshold
        ).where(
            OrganizationSetting.organization_id == organization_id
        )
    )

    if threshold is None:
        return settings.default_low_stock_threshold

    return threshold


def get_dashboard_summary(
        db: Session,
        organization_id: UUID,
) -> dict:
    default_threshold = get_default_threshold(
        db,
        organization_id,
    )

    total_products = db.scalar(
        select(func.count(Product.id)).where(
            Product.organization_id == organization_id
        )
    ) or 0

    total_quantity = db.scalar(
        select(
            func.coalesce(func.sum(Product.quantity_on_hand), 0)
        ).where(
            Product.organization_id == organization_id
        )
    ) or 0

    products = db.scalars(
        select(Product)
        .where(Product.organization_id == organization_id)
        .order_by(Product.name.asc())
    ).all()

    low_stock_items = []

    for product in products:
        effective_threshold = (
            product.low_stock_threshold
            if product.low_stock_threshold is not None
            else default_threshold
        )

        if product.quantity_on_hand <= effective_threshold:
            low_stock_items.append(
                {
                    "id": product.id,
                    "name": product.name,
                    "sku": product.sku,
                    "quantity_on_hand": product.quantity_on_hand,
                    "low_stock_threshold": effective_threshold,
                }
            )

    return {
        "total_products": total_products,
        "total_quantity": total_quantity,
        "low_stock_items": low_stock_items,
    }
