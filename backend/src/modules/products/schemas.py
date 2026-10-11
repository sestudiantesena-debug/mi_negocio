from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class ProductBase(BaseModel):
    sku: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    price: Decimal = Field(..., ge=0, decimal_places=2)
    stock: int = Field(default=0, ge=0)
    category: str = Field(..., min_length=1, max_length=100)
    images: list[str] = Field(default_factory=list)
    is_active: bool = True
    metadata: dict = Field(default_factory=dict)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    stock: Optional[int] = Field(None, ge=0)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    images: Optional[list[str]] = None
    is_active: Optional[bool] = None
    metadata: Optional[dict] = None


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int