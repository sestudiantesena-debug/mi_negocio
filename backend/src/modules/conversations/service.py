from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from src.exceptions import NotFoundError
from src.modules.conversations.models import Conversation, ConversationStatus, ChannelType
from src.modules.conversations.schemas import (
    ConversationCreate,
    ConversationUpdate,
    ConversationListResponse,
    ConversationResponse,
    ConversationDetailResponse,
    MessageCreate,
    MessageResponse,
)
from src.modules.conversations.repository import ConversationRepository


class ConversationService:
    def __init__(self, session: AsyncSession):
        self.repo = ConversationRepository(session)

    async def get_or_create(
        self,
        channel: ChannelType,
        external_id: str,
        customer_id: Optional[int] = None,
        context: Optional[dict] = None,
    ) -> Conversation:
        return await self.repo.get_or_create(channel, external_id, customer_id, context)

    async def get(self, conversation_id: int) -> Conversation:
        conversation = await self.repo.get_by_id(conversation_id)
        if not conversation:
            raise NotFoundError("Conversation", conversation_id)
        return conversation

    async def get_detail(self, conversation_id: int) -> ConversationDetailResponse:
        conversation = await self.get(conversation_id)
        messages = await self.repo.get_messages(conversation_id, limit=100)
        return ConversationDetailResponse(
            **conversation.__dict__,
            messages=messages,
            message_count=len(messages),
            last_message=messages[-1].content if messages else None,
        )

    async def list(
        self,
        page: int = 1,
        page_size: int = 20,
        status: Optional[ConversationStatus] = None,
        channel: Optional[ChannelType] = None,
        customer_id: Optional[int] = None,
        assigned_agent_id: Optional[int] = None,
    ) -> ConversationListResponse:
        items, total = await self.repo.list(
            page=page,
            page_size=page_size,
            status=status,
            channel=channel,
            customer_id=customer_id,
            assigned_agent_id=assigned_agent_id,
        )
        total_pages = (total + page_size - 1) // page_size
        return ConversationListResponse(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
        )

    async def update(self, conversation_id: int, data: ConversationUpdate) -> Conversation:
        conversation = await self.repo.update(conversation_id, data)
        if not conversation:
            raise NotFoundError("Conversation", conversation_id)
        return conversation

    async def add_message(self, conversation_id: int, data: MessageCreate) -> MessageResponse:
        message = await self.repo.add_message(conversation_id, data)
        return MessageResponse.model_validate(message)

    async def get_context_for_ai(self, conversation_id: int, limit: int = 10) -> list[MessageResponse]:
        messages = await self.repo.get_recent_context(conversation_id, limit)
        return [MessageResponse.model_validate(m) for m in messages]

    async def escalate_to_human(self, conversation_id: int, reason: str) -> Conversation:
        conversation = await self.get(conversation_id)
        conversation.status = ConversationStatus.ESCALATED
        conversation.context["escalation_reason"] = reason
        conversation.context["escalated_at"] = str(datetime.now())
        await self.repo.session.flush()
        await self.repo.session.refresh(conversation)
        return conversation


from datetime import datetime