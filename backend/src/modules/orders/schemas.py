import enum
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"
    REFUNDED = "REFUNDED"
    PENDING_PAYMENT = "PENDING_PAYMENT"


class ChannelType(str, enum.Enum):
    WHATSAPP = "WHATSAPP"
    FACEBOOK = "FACEBOOK"
    WEB = "WEB"
    INSTAGRAM = "INSTAGRAM"


class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., ge=1)
    unit_price: Decimal = Field(..., ge=0, decimal_places=2)


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    total_price: Decimal


class OrderBase(BaseModel):
    channel: ChannelType
    customer_name: str
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    customer_external_id: str
    items: list[OrderItemCreate]
    metadata: dict = Field(default_factory=dict)


class OrderCreate(OrderBase):
    pass


class OrderUpdate(BaseModel):
    status: Optional[OrderStatus] = None
    metadata: Optional[dict] = None


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    order_number: str
    status: OrderStatus
    channel: ChannelType
    customer_id: int
    items: list[OrderItemResponse]
    total: Decimal
    metadata: dict
    created_at: datetime
    updated_at: datetime


class OrderListResponse(BaseModel):
    items: list[OrderResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class CustomerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    external_id: str
    name: str
    phone: Optional[str]
    email: Optional[str]
    channel: ChannelType
    metadata: dict
    created_at: datetime