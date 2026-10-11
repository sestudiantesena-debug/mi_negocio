import enum
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


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


class MessageBase(BaseModel):
    role: MessageRole
    content: str
    tool_calls: Optional[list[dict]] = None
    tool_call_id: Optional[str] = None
    metadata: dict = Field(default_factory=dict)


class MessageCreate(MessageBase):
    pass


class MessageResponse(MessageBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    conversation_id: int
    created_at: datetime


class ConversationBase(BaseModel):
    channel: ChannelType
    external_id: str
    customer_id: Optional[int] = None
    context: dict = Field(default_factory=dict)


class ConversationCreate(ConversationBase):
    pass


class ConversationUpdate(BaseModel):
    status: Optional[ConversationStatus] = None
    context: Optional[dict] = None
    assigned_agent_id: Optional[int] = None


class ConversationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    channel: ChannelType
    external_id: str
    customer_id: Optional[int]
    status: ConversationStatus
    context: dict
    assigned_agent_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    last_message: Optional[str] = None
    message_count: int = 0


class ConversationListResponse(BaseModel):
    items: list[ConversationResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class ConversationDetailResponse(ConversationResponse):
    messages: list[MessageResponse] = []