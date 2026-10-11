import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import String, Text, Enum, DateTime, func, ForeignKey, JSON, Index, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from src.database import Base


class ChannelType(str, enum.Enum):
    WHATSAPP = "WHATSAPP"
    FACEBOOK = "FACEBOOK"
    INSTAGRAM = "INSTAGRAM"
    WEB = "WEB"


class ConversationStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    CLOSED = "CLOSED"
    ESCALATED = "ESCALATED"
    BOT = "BOT"
    HUMAN = "HUMAN"


class MessageRole(str, enum.Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"
    TOOL = "tool"


class Conversation(Base):
    __tablename__ = "conversations"
    __table_args__ = (
        Index("ix_conversations_channel_external", "channel", "external_id", unique=True),
        Index("ix_conversations_customer_status", "customer_id", "status"),
        Index("ix_conversations_status_updated", "status", "updated_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    channel: Mapped[ChannelType] = mapped_column(Enum(ChannelType))
    external_id: Mapped[str] = mapped_column(String(100), index=True)
    customer_id: Mapped[Optional[int]] = mapped_column(ForeignKey("customers.id"), nullable=True)
    status: Mapped[ConversationStatus] = mapped_column(Enum(ConversationStatus), default=ConversationStatus.ACTIVE)
    context: Mapped[dict] = mapped_column(JSON, default=dict)
    assigned_agent_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now(), onupdate=func.now())

    messages: Mapped[list["Message"]] = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")


class Message(Base):
    __tablename__ = "messages"
    __table_args__ = (
        Index("ix_messages_conversation_created", "conversation_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    conversation_id: Mapped[int] = mapped_column(ForeignKey("conversations.id", ondelete="CASCADE"), index=True)
    role: Mapped[MessageRole] = mapped_column(Enum(MessageRole))
    content: Mapped[str] = mapped_column(Text)
    tool_calls: Mapped[Optional[list[dict]]] = mapped_column(JSON, nullable=True)
    tool_call_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    metadata: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=func.now())

    conversation: Mapped["Conversation"] = relationship("Conversation", back_populates="messages")