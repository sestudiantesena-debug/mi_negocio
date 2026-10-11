from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.modules.conversations.schemas import (
    ConversationCreate,
    ConversationUpdate,
    ConversationResponse,
    ConversationListResponse,
    ConversationDetailResponse,
    ConversationStatus,
    ChannelType,
    MessageCreate,
    MessageResponse,
)
from src.modules.conversations.service import ConversationService

router = APIRouter()


def get_conversation_service(session: AsyncSession = Depends(get_db)) -> ConversationService:
    return ConversationService(session)


@router.post("", response_model=ConversationResponse, status_code=status.HTTP_201_CREATED)
async def create_conversation(
    data: ConversationCreate,
    service: ConversationService = Depends(get_conversation_service),
):
    return await service.get_or_create(
        channel=data.channel,
        external_id=data.external_id,
        customer_id=data.customer_id,
        context=data.context,
    )


@router.get("", response_model=ConversationListResponse)
async def list_conversations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[ConversationStatus] = None,
    channel: Optional[ChannelType] = None,
    customer_id: Optional[int] = None,
    assigned_agent_id: Optional[int] = None,
    service: ConversationService = Depends(get_conversation_service),
):
    return await service.list(
        page=page,
        page_size=page_size,
        status=status,
        channel=channel,
        customer_id=customer_id,
        assigned_agent_id=assigned_agent_id,
    )


@router.get("/{conversation_id}", response_model=ConversationDetailResponse)
async def get_conversation(
    conversation_id: int,
    service: ConversationService = Depends(get_conversation_service),
):
    return await service.get_detail(conversation_id)


@router.patch("/{conversation_id}", response_model=ConversationResponse)
async def update_conversation(
    conversation_id: int,
    data: ConversationUpdate,
    service: ConversationService = Depends(get_conversation_service),
):
    return await service.update(conversation_id, data)


@router.post("/{conversation_id}/messages", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def add_message(
    conversation_id: int,
    data: MessageCreate,
    service: ConversationService = Depends(get_conversation_service),
):
    return await service.add_message(conversation_id, data)


@router.get("/{conversation_id}/context", response_model=list[MessageResponse])
async def get_ai_context(
    conversation_id: int,
    limit: int = Query(10, ge=1, le=50),
    service: ConversationService = Depends(get_conversation_service),
):
    return await service.get_context_for_ai(conversation_id, limit)


@router.post("/{conversation_id}/escalate", response_model=ConversationResponse)
async def escalate_to_human(
    conversation_id: int,
    reason: str,
    service: ConversationService = Depends(get_conversation_service),
):
    return await service.escalate_to_human(conversation_id, reason)