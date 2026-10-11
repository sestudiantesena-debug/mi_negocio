from decimal import Decimal
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from src.exceptions import NotFoundError
from src.modules.orders.models import Order, OrderStatus, ChannelType
from src.modules.orders.schemas import OrderCreate, OrderUpdate, OrderListResponse, OrderResponse
from src.modules.orders.repository import OrderRepository


class OrderService:
    def __init__(self, session: AsyncSession):
        self.repo = OrderRepository(session)

    async def create(self, data: OrderCreate) -> Order:
        return await self.repo.create(data)

    async def get(self, order_id: int) -> Order:
        order = await self.repo.get_by_id(order_id)
        if not order:
            raise NotFoundError("Order", order_id)
        return order

    async def get_by_number(self, order_number: str) -> Order:
        order = await self.repo.get_by_order_number(order_number)
        if not order:
            raise NotFoundError("Order", order_number)
        return order

    async def list(
        self,
        page: int = 1,
        page_size: int = 20,
        status: Optional[OrderStatus] = None,
        channel: Optional[ChannelType] = None,
        customer_id: Optional[int] = None,
        search: Optional[str] = None,
    ) -> OrderListResponse:
        items, total = await self.repo.list(
            page=page,
            page_size=page_size,
            status=status,
            channel=channel,
            customer_id=customer_id,
            search=search,
        )
        total_pages = (total + page_size - 1) // page_size
        return OrderListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    async def update(self, order_id: int, data: OrderUpdate) -> Order:
        order = await self.repo.update(order_id, data)
        if not order:
            raise NotFoundError("Order", order_id)
        return order

    async def confirm_payment(self, order_number: str) -> Order:
        order = await self.get_by_number(order_number)
        if order.status == OrderStatus.PENDING_PAYMENT:
            order.status = OrderStatus.CONFIRMED
            await self.repo.session.flush()
            await self.repo.session.refresh(order)
        return order