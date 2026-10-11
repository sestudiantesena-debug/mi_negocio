import logging
from fastapi import APIRouter, Request, Depends, Query, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.modules.facebook.webhook import (
    verify_meta_signature,
    parse_meta_webhook,
    extract_messaging_events,
    extract_message_info,
)
from src.modules.facebook.sender import facebook_sender
from src.modules.facebook.client import meta_client
from src.modules.conversations.models import ChannelType
from src.modules.ai_engine.orchestrator import AIOrchestrator
from src.modules.conversations.service import ConversationService
from src.modules.conversations.schemas import MessageCreate, MessageRole
from src.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/meta")
async def verify_meta_webhook(
    hub_mode: str = Query(None, alias="hub.mode"),
    hub_verify_token: str = Query(None, alias="hub.verify_token"),
    hub_challenge: str = Query(None, alias="hub.challenge"),
):
    challenge = meta_client.verify_webhook(hub_mode, hub_verify_token, hub_challenge)
    if challenge:
        return int(challenge)
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid verify token")


@router.post("/meta")
async def meta_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_db),
    _verified: None = Depends(verify_meta_signature),
):
    body = await request.json()
    logger.info(f"Meta webhook received: {body.get('object')}")

    payload = parse_meta_webhook(body)
    if not payload:
        return {"status": "ok"}

    events = extract_messaging_events(payload)
    for event in events:
        background_tasks.add_task(process_meta_event, event, session)

    return {"status": "ok"}


async def process_meta_event(event, session: AsyncSession):
    try:
        msg_info = extract_message_info(event)

        if msg_info["message_type"] in ("delivery", "read"):
            return

        sender_id = msg_info["sender_id"]
        text = msg_info["text"]

        if not text:
            logger.info(f"Empty message from {sender_id}, skipping")
            return

        logger.info(f"Processing Meta message from {sender_id}: {text[:50]}...")

        conv_service = ConversationService(session)
        conversation = await conv_service.get_or_create(
            channel=ChannelType.FACEBOOK,
            external_id=sender_id,
        )

        await conv_service.add_message(conversation.id, MessageCreate(
            role=MessageRole.USER,
            content=text,
            metadata={"timestamp": msg_info["timestamp"], "raw": msg_info["raw_event"]},
        ))

        orchestrator = AIOrchestrator(session)
        response = await orchestrator.process_message(
            conversation_id=conversation.id,
            channel=ChannelType.FACEBOOK,
            user_message=text,
        )

        await conv_service.add_message(conversation.id, MessageCreate(
            role=MessageRole.ASSISTANT,
            content=response,
        ))

        if response:
            await facebook_sender.send_text(sender_id, response)

    except Exception as e:
        logger.error(f"Error processing Meta event: {e}", exc_info=True)