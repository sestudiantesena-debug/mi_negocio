from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.modules.conversations.models import ChannelType
from src.modules.ai_engine.orchestrator import AIOrchestrator
from src.modules.conversations.service import ConversationService

router = APIRouter()


class ChatRequest(BaseModel):
    channel: ChannelType
    external_id: str
    message: str
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: int


class TestChatRequest(BaseModel):
    message: str
    channel: ChannelType = ChannelType.WEB
    conversation_id: Optional[int] = None


@router.post("/chat", response_model=ChatResponse)
async def chat(
    request: ChatRequest,
    session: AsyncSession = Depends(get_db),
):
    conv_service = ConversationService(session)
    conversation = await conv_service.get_or_create(
        channel=request.channel,
        external_id=request.external_id,
        customer_id=None,
    )

    orchestrator = AIOrchestrator(session)
    response = await orchestrator.process_message(
        conversation_id=conversation.id,
        channel=request.channel,
        user_message=request.message,
    )

    return ChatResponse(response=response, conversation_id=conversation.id)


@router.post("/test", response_model=ChatResponse)
async def test_chat(
    request: TestChatRequest,
    session: AsyncSession = Depends(get_db),
):
    conv_service = ConversationService(session)

    if request.conversation_id:
        conversation = await conv_service.get(request.conversation_id)
    else:
        conversation = await conv_service.get_or_create(
            channel=request.channel,
            external_id="test_user_123",
        )

    orchestrator = AIOrchestrator(session)
    response = await orchestrator.process_message(
        conversation_id=conversation.id,
        channel=request.channel,
        user_message=request.message,
    )

    return ChatResponse(response=response, conversation_id=conversation.id)


@router.get("/tools")
async def list_tools():
    from src.modules.ai_engine.tools import TOOLS
    return {"tools": TOOLS}