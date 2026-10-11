from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy import String, Text, Numeric, Integer, Boolean, JSON, DateTime, func, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database import Base


class Product(Base):
    __tablename__ = "products"
    __table_args__ = (
        Index("ix_products_category_active", "category", "is_active"),
        Index("ix_products_name_search", "name"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    sku: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2))
    stock: Mapped[int] = mapped_column(Integer, default=0)
    category: Mapped[str] = mapped_column(String(100), index=True)
    images: Mapped[list[str]] = mapped_column(JSON, default=list)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    order_items: Mapped[list["OrderItem"]] = relationship("OrderItem", back_populates="product")