from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    sku: str = Field(min_length=1, max_length=100)
    description: str | None = None

    quantity_on_hand: int = Field(default=0, ge=0)
    cost_price: Decimal | None = Field(default=None, ge=0)
    selling_price: Decimal | None = Field(default=None, ge=0)
    low_stock_threshold: int | None = Field(default=None, ge=0)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("Product name cannot be empty")
        return value

    @field_validator("sku")
    @classmethod
    def clean_sku(cls, value: str) -> str:
        value = value.strip().upper()
        if not value:
            raise ValueError("SKU cannot be empty")
        return value


class ProductUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    sku: str | None = Field(default=None, min_length=1, max_length=100)
    description: str | None = None

    quantity_on_hand: int | None = Field(default=None, ge=0)
    cost_price: Decimal | None = Field(default=None, ge=0)
    selling_price: Decimal | None = Field(default=None, ge=0)
    low_stock_threshold: int | None = Field(default=None, ge=0)

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip()
        if not value:
            raise ValueError("Product name cannot be empty")
        return value

    @field_validator("sku")
    @classmethod
    def clean_sku(cls, value: str | None) -> str | None:
        if value is None:
            return None

        value = value.strip().upper()
        if not value:
            raise ValueError("SKU cannot be empty")
        return value


class ProductRead(BaseModel):
    id: UUID
    organization_id: UUID
    name: str
    sku: str
    description: str | None
    quantity_on_hand: int
    cost_price: Decimal | None
    selling_price: Decimal | None
    low_stock_threshold: int | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
