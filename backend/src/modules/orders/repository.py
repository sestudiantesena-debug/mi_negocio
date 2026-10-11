from decimal import Decimal
from typing import Optional
from sqlalchemy import select, func, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.modules.orders.models import Order, OrderItem, Customer, OrderStatus, ChannelType
from src.modules.orders.schemas import OrderCreate, OrderUpdate, OrderItemCreate


class OrderRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, data: OrderCreate) -> Order:
        customer = await self._get_or_create_customer(
            external_id=data.customer_external_id,
            name=data.customer_name,
            phone=data.customer_phone,
            email=data.customer_email,
            channel=data.channel,
        )

        order_number = await self._generate_order_number()

        items_data = []
        total = Decimal("0")
        for item in data.items:
            items_data.append({
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price": item.unit_price,
                "total_price": item.unit_price * item.quantity,
            })
            total += items_data[-1]["total_price"]

        order = Order(
            order_number=order_number,
            status=OrderStatus.PENDING_PAYMENT,
            channel=data.channel,
            customer_id=customer.id,
            total=total,
            metadata=data.metadata,
        )
        self.session.add(order)
        await self.session.flush()

        for item_data in items_data:
            order_item = OrderItem(order_id=order.id, **item_data)
            self.session.add(order_item)

        await self.session.flush()
        await self.session.refresh(order)
        return order

    async def _get_or_create_customer(
        self,
        external_id: str,
        name: str,
        phone: Optional[str],
        email: Optional[str],
        channel: ChannelType,
    ) -> Customer:
        result = await self.session.execute(select(Customer).where(Customer.external_id == external_id))
        customer = result.scalar_one_or_none()

        if customer:
            return customer

        customer = Customer(
            external_id=external_id,
            name=name,
            phone=phone,
            email=email,
            channel=channel,
        )
        self.session.add(customer)
        await self.session.flush()
        await self.session.refresh(customer)
        return customer

    async def _generate_order_number(self) -> str:
        from datetime import datetime
        import random
        prefix = "MN"
        date_part = datetime.now().strftime("%Y%m%d")
        random_part = f"{random.randint(1000, 9999)}"
        return f"{prefix}-{date_part}-{random_part}"

    async def get_by_id(self, order_id: int) -> Optional[Order]:
        result = await self.session.execute(
            select(Order)
            .options(selectinload(Order.items).selectinload(OrderItem.product))
            .where(Order.id == order_id)
        )
        return result.scalar_one_or_none()

    async def get_by_order_number(self, order_number: str) -> Optional[Order]:
        result = await self.session.execute(
            select(Order)
            .options(selectinload(Order.items).selectinload(OrderItem.product))
            .where(Order.order_number == order_number)
        )
        return result.scalar_one_or_none()

    async def list(
        self,
        page: int = 1,
        page_size: int = 20,
        status: Optional[OrderStatus] = None,
        channel: Optional[ChannelType] = None,
        customer_id: Optional[int] = None,
        search: Optional[str] = None,
    ) -> tuple[list[Order], int]:
        query = select(Order).options(selectinload(Order.items).selectinload(OrderItem.product))
        count_query = select(func.count(Order.id))

        conditions = []
        if status:
            conditions.append(Order.status == status)
        if channel:
            conditions.append(Order.channel == channel)
        if customer_id:
            conditions.append(Order.customer_id == customer_id)
        if search:
            conditions.append(or_(
                Order.order_number.ilike(f"%{search}%"),
                Order.metadata.cast(String).ilike(f"%{search}%"),
            ))

        if conditions:
            query = query.where(and_(*conditions))
            count_query = count_query.where(and_(*conditions))

        total_result = await self.session.execute(count_query)
        total = total_result.scalar_one()

        query = query.order_by(Order.created_at.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)

        result = await self.session.execute(query)
        items = result.scalars().all()

        return list(items), total

    async def update(self, order_id: int, data: OrderUpdate) -> Optional[Order]:
        order = await self.get_by_id(order_id)
        if not order:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(order, key, value)

        await self.session.flush()
        await self.session.refresh(order)
        return order

    async def get_customer_by_external_id(self, external_id: str) -> Optional[Customer]:
        result = await self.session.execute(select(Customer).where(Customer.external_id == external_id))
        return result.scalar_one_or_none()