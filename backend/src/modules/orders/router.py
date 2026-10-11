from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.modules.orders.schemas import (
    OrderCreate,
    OrderUpdate,
    OrderResponse,
    OrderListResponse,
    OrderStatus,
    ChannelType,
)
from src.modules.orders.service import OrderService

router = APIRouter()


def get_order_service(session: AsyncSession = Depends(get_db)) -> OrderService:
    return OrderService(session)


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    data: OrderCreate,
    service: OrderService = Depends(get_order_service),
):
    return await service.create(data)


@router.get("", response_model=OrderListResponse)
async def list_orders(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[OrderStatus] = None,
    channel: Optional[ChannelType] = None,
    customer_id: Optional[int] = None,
    search: Optional[str] = None,
    service: OrderService = Depends(get_order_service),
):
    return await service.list(
        page=page,
        page_size=page_size,
        status=status,
        channel=channel,
        customer_id=customer_id,
        search=search,
    )


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: int,
    service: OrderService = Depends(get_order_service),
):
    return await service.get(order_id)


@router.get("/number/{order_number}", response_model=OrderResponse)
async def get_order_by_number(
    order_number: str,
    service: OrderService = Depends(get_order_service),
):
    return await service.get_by_number(order_number)


@router.patch("/{order_id}", response_model=OrderResponse)
async def update_order(
    order_id: int,
    data: OrderUpdate,
    service: OrderService = Depends(get_order_service),
):
    return await service.update(order_id, data)


@router.post("/{order_number}/confirm-payment", response_model=OrderResponse)
async def confirm_payment(
    order_number: str,
    service: OrderService = Depends(get_order_service),
):
    return await service.confirm_payment(order_number)