from decimal import Decimal
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from src.exceptions import NotFoundError, ConflictError
from src.modules.products.models import Product
from src.modules.products.schemas import ProductCreate, ProductUpdate, ProductListResponse
from src.modules.products.repository import ProductRepository


class ProductService:
    def __init__(self, session: AsyncSession):
        self.repo = ProductRepository(session)

    async def create(self, data: ProductCreate) -> Product:
        existing = await self.repo.get_by_sku(data.sku)
        if existing:
            raise ConflictError(f"Product with SKU '{data.sku}' already exists")
        return await self.repo.create(data)

    async def get(self, product_id: int) -> Product:
        product = await self.repo.get_by_id(product_id)
        if not product:
            raise NotFoundError("Product", product_id)
        return product

    async def list(
        self,
        page: int = 1,
        page_size: int = 20,
        category: Optional[str] = None,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
        min_price: Optional[Decimal] = None,
        max_price: Optional[Decimal] = None,
    ) -> ProductListResponse:
        items, total = await self.repo.list(
            page=page,
            page_size=page_size,
            category=category,
            search=search,
            is_active=is_active,
            min_price=min_price,
            max_price=max_price,
        )
        total_pages = (total + page_size - 1) // page_size
        return ProductListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    async def update(self, product_id: int, data: ProductUpdate) -> Product:
        product = await self.repo.update(product_id, data)
        if not product:
            raise NotFoundError("Product", product_id)
        return product

    async def delete(self, product_id: int) -> None:
        deleted = await self.repo.delete(product_id)
        if not deleted:
            raise NotFoundError("Product", product_id)

    async def get_categories(self) -> list[str]:
        return await self.repo.get_categories()

    async def search_for_ai(self, query: str, limit: int = 5) -> list[Product]:
        return await self.repo.search_for_ai(query, limit)