import enum
from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Text, Numeric, Integer, Enum, DateTime, func, ForeignKey, JSON, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database import Base


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


class Order(Base):
    __tablename__ = "orders"
    __table_args__ = (
        Index("ix_orders_customer_status", "customer_id", "status"),
        Index("ix_orders_channel_created", "channel", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    order_number: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus), default=OrderStatus.PENDING)
    channel: Mapped[ChannelType] = mapped_column(Enum(ChannelType))
    customer_id: Mapped[int] = mapped_column(ForeignKey("customers.id"))
    items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    total: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now())


class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"))
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id"))
    quantity: Mapped[int] = mapped_column(Integer)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    total_price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    metadata: Mapped[dict] = mapped_column(JSON, default=dict)

    order: Mapped["Order"] = relationship("Order", back_populates="items")
    product: Mapped["Product"] = relationship("Product", back_populates="order_items")


class Customer(Base):
    __tablename__ = "customers"

    id: Mapped[int] = mapped_column(primary_key=True)
    external_id: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200))
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    channel: Mapped[ChannelType] = mapped_column(Enum(ChannelType))
    metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    orders: Mapped[list[Order]] = relationship("Order", back_populates="customer")