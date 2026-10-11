from typing import Optional
from sqlalchemy import select, func, or_, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.modules.conversations.models import Conversation, Message, ConversationStatus, ChannelType, MessageRole
from src.modules.conversations.schemas import ConversationCreate, ConversationUpdate, MessageCreate


class ConversationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_or_create(
        self,
        channel: ChannelType,
        external_id: str,
        customer_id: Optional[int] = None,
        context: Optional[dict] = None,
    ) -> Conversation:
        result = await self.session.execute(
            select(Conversation).where(
                Conversation.channel == channel,
                Conversation.external_id == external_id,
            )
        )
        conversation = result.scalar_one_or_none()

        if conversation:
            if customer_id and not conversation.customer_id:
                conversation.customer_id = customer_id
                await self.session.flush()
            return conversation

        conversation = Conversation(
            channel=channel,
            external_id=external_id,
            customer_id=customer_id,
            context=context or {},
            status=ConversationStatus.ACTIVE,
        )
        self.session.add(conversation)
        await self.session.flush()
        await self.session.refresh(conversation)
        return conversation

    async def get_by_id(self, conversation_id: int) -> Optional[Conversation]:
        result = await self.session.execute(
            select(Conversation)
            .options(selectinload(Conversation.messages))
            .where(Conversation.id == conversation_id)
        )
        return result.scalar_one_or_none()

    async def get_by_external_id(self, channel: ChannelType, external_id: str) -> Optional[Conversation]:
        result = await self.session.execute(
            select(Conversation).where(
                Conversation.channel == channel,
                Conversation.external_id == external_id,
            )
        )
        return result.scalar_one_or_none()

    async def list(
        self,
        page: int = 1,
        page_size: int = 20,
        status: Optional[ConversationStatus] = None,
        channel: Optional[ChannelType] = None,
        customer_id: Optional[int] = None,
        assigned_agent_id: Optional[int] = None,
    ) -> tuple[list[Conversation], int]:
        query = select(Conversation)
        count_query = select(func.count(Conversation.id))

        conditions = []
        if status:
            conditions.append(Conversation.status == status)
        if channel:
            conditions.append(Conversation.channel == channel)
        if customer_id:
            conditions.append(Conversation.customer_id == customer_id)
        if assigned_agent_id:
            conditions.append(Conversation.assigned_agent_id == assigned_agent_id)

        if conditions:
            query = query.where(and_(*conditions))
            count_query = count_query.where(and_(*conditions))

        total_result = await self.session.execute(count_query)
        total = total_result.scalar_one()

        query = query.order_by(desc(Conversation.updated_at))
        query = query.offset((page - 1) * page_size).limit(page_size)

        result = await self.session.execute(query)
        items = result.scalars().all()

        return list(items), total

    async def update(self, conversation_id: int, data: ConversationUpdate) -> Optional[Conversation]:
        conversation = await self.get_by_id(conversation_id)
        if not conversation:
            return None

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(conversation, key, value)

        await self.session.flush()
        await self.session.refresh(conversation)
        return conversation

    async def add_message(self, conversation_id: int, data: MessageCreate) -> Message:
        message = Message(conversation_id=conversation_id, **data.model_dump())
        self.session.add(message)

        result = await self.session.execute(
            select(Conversation).where(Conversation.id == conversation_id)
        )
        conversation = result.scalar_one()
        conversation.updated_at = func.now()

        await self.session.flush()
        await self.session.refresh(message)
        return message

    async def get_messages(
        self,
        conversation_id: int,
        limit: int = 50,
        before_id: Optional[int] = None,
    ) -> list[Message]:
        query = select(Message).where(Message.conversation_id == conversation_id)
        if before_id:
            query = query.where(Message.id < before_id)
        query = query.order_by(desc(Message.created_at)).limit(limit)

        result = await self.session.execute(query)
        messages = result.scalars().all()
        return list(reversed(messages))

    async def get_recent_context(self, conversation_id: int, limit: int = 10) -> list[Message]:
        return await self.get_messages(conversation_id, limit=limit)