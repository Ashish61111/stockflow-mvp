from uuid import UUID

from pydantic import BaseModel, ConfigDict


class LowStockItem(BaseModel):
    id: UUID
    name: str
    sku: str
    quantity_on_hand: int
    low_stock_threshold: int

    model_config = ConfigDict(from_attributes=True)


class DashboardRead(BaseModel):
    total_products: int
    total_quantity: int
    low_stock_items: list[LowStockItem]
