from decimal import Decimal
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.modules.products.schemas import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    ProductListResponse,
)
from src.modules.products.service import ProductService

router = APIRouter()


def get_product_service(session: AsyncSession = Depends(get_db)) -> ProductService:
    return ProductService(session)


@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
async def create_product(
    data: ProductCreate,
    service: ProductService = Depends(get_product_service),
):
    return await service.create(data)


@router.get("", response_model=ProductListResponse)
async def list_products(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
    service: ProductService = Depends(get_product_service),
):
    return await service.list(
        page=page,
        page_size=page_size,
        category=category,
        search=search,
        is_active=is_active,
        min_price=min_price,
        max_price=max_price,
    )


@router.get("/categories", response_model=list[str])
async def get_categories(service: ProductService = Depends(get_product_service)):
    return await service.get_categories()


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    service: ProductService = Depends(get_product_service),
):
    return await service.get(product_id)


@router.patch("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    data: ProductUpdate,
    service: ProductService = Depends(get_product_service),
):
    return await service.update(product_id, data)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: int,
    service: ProductService = Depends(get_product_service),
):
    await service.delete(product_id)