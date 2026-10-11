import logging
from fastapi import APIRouter, Request, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.modules.whatsapp.webhook import (
    verify_evolution_signature,
    parse_evolution_webhook,
    extract_message_info,
)
from src.modules.whatsapp.sender import whatsapp_sender
from src.modules.conversations.models import ChannelType
from src.modules.ai_engine.orchestrator import AIOrchestrator
from src.modules.conversations.service import ConversationService
from src.modules.conversations.schemas import MessageCreate, MessageRole
from src.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/evolution")
async def evolution_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    session: AsyncSession = Depends(get_db),
    _verified: None = Depends(verify_evolution_signature),
):
    body = await request.json()
    logger.info(f"Evolution webhook received: {body.get('event')}")

    webhook = parse_evolution_webhook(body)
    if not webhook:
        logger.warning("Unknown webhook event type")
        return {"status": "ok"}

    if webhook.event == "messages.upsert":
        background_tasks.add_task(process_incoming_message, webhook, session)
    elif webhook.event == "connection.update":
        background_tasks.add_task(handle_connection_update, webhook)
    elif webhook.event == "qrcode.updated":
        background_tasks.add_task(handle_qrcode_update, webhook)

    return {"status": "ok"}


async def process_incoming_message(webhook, session: AsyncSession):
    try:
        msg_info = extract_message_info(webhook)

        if msg_info["from_me"]:
            logger.info("Ignoring message from me")
            return

        remote_jid = msg_info["remote_jid"]
        text = msg_info["text"]
        sender = msg_info["sender"]
        push_name = msg_info["push_name"]

        logger.info(f"Processing message from {sender}: {text[:50]}...")

        conv_service = ConversationService(session)
        conversation = await conv_service.get_or_create(
            channel=ChannelType.WHATSAPP,
            external_id=remote_jid,
            context={"push_name": push_name, "sender": sender},
        )

        await conv_service.add_message(conversation.id, MessageCreate(
            role=MessageRole.USER,
            content=text,
            metadata={"message_id": msg_info["message_id"], "timestamp": msg_info["timestamp"]},
        ))

        orchestrator = AIOrchestrator(session)
        response = await orchestrator.process_message(
            conversation_id=conversation.id,
            channel=ChannelType.WHATSAPP,
            user_message=text,
        )

        await conv_service.add_message(conversation.id, MessageCreate(
            role=MessageRole.ASSISTANT,
            content=response,
        ))

        if response:
            phone = whatsapp_sender.extract_phone(remote_jid)
            await whatsapp_sender.send_text(phone, response)

    except Exception as e:
        logger.error(f"Error processing incoming message: {e}", exc_info=True)


async def handle_connection_update(webhook):
    logger.info(f"Connection update: {webhook.data.state} - {webhook.data.status}")

    if webhook.data.state == "close" and settings.is_production:
        from src.modules.whatsapp.client import evolution_client
        await evolution_client.restart_instance()


async def handle_qrcode_update(webhook):
    logger.info("QR code updated - new QR available")