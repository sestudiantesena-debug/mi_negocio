from decimal import Decimal
from typing import Optional
from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.modules.products.models import Product
from src.modules.products.schemas import ProductCreate, ProductUpdate


class ProductRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: ProductCreate) -> Product:
        product = Product(**data.model_dump())
        self.session.add(product)
        await self.session.flush()
        await self.session.refresh(product)
        return product

    async def get_by_id(self, product_id: int) -> Optional[Product]:
        result = await self.session.execute(select(Product).where(Product.id == product_id))
        return result.scalar_one_or_none()

    async def get_by_sku(self, sku: str) -> Optional[Product]:
        result = await self.session.execute(select(Product).where(Product.sku == sku))
        return result.scalar_one_or_none()

    async def list(
        self,
        page: int = 1,
        page_size: int = 20,
        category: Optional[str] = None,
        search: Optional[str] = None,
        is_active: Optional[bool] = None,
        min_price: Optional[Decimal] = None,
        max_price: Optional[Decimal] = None,
    ) -> tuple[list[Product], int]:
        query = select(Product)
        count_query = select(func.count(Product.id))

        conditions = []
        if category:
            conditions.append(Product.category == category)
        if search:
            conditions.append(or_(Product.name.ilike(f"%{search}%"), Product.description.ilike(f"%{search}%")))
        if is_active is not None:
            conditions.append(Product.is_active == is_active)
        if min_price is not None:
            conditions.append(Product.price >= min_price)
        if max_price is not None:
            conditions.append(Product.price <= max_price)

        if conditions:
            from sqlalchemy import and_
            query = query.where(and_(*conditions))
            count_query = count_query.where(and_(*conditions))

        total_result = await self.session.execute(count_query)
        total = total_result.scalar_one()

        query = query.order_by(Product.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)

        result = await self.session.execute(query)
        items = result.scalars().all()

        return list(items), total

    async def update(self, product_id: int, data: ProductUpdate) -> Optional[Product]:
        product = await self.get_by_id(product_id)
        if not product:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(product, key, value)

        await self.session.flush()
        await self.session.refresh(product)
        return product

    async def delete(self, product_id: int) -> bool:
        product = await self.get_by_id(product_id)
        if not product:
            return False
        await self.session.delete(product)
        await self.session.flush()
        return True

    async def get_categories(self) -> list[str]:
        result = await self.session.execute(select(Product.category).distinct())
        return [row[0] for row in result.all()]

    async def search_for_ai(self, query: str, limit: int = 5) -> list[Product]:
        stmt = (
            select(Product)
            .where(
                Product.is_active == True,
                or_(
                    Product.name.ilike(f"%{query}%"),
                    Product.description.ilike(f"%{query}%"),
                    Product.category.ilike(f"%{query}%"),
                ),
            )
            .order_by(Product.name)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())