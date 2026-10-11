import hmac
import hashlib
import logging
from typing import Optional
from fastapi import Request

from src.config import settings
from src.modules.facebook.models import MetaWebhookPayload, MetaMessagingEvent

logger = logging.getLogger(__name__)


async def verify_meta_signature(request: Request) -> bool:
    if not settings.is_production:
        return True

    signature = request.headers.get("x-hub-signature-256")
    if not signature:
        return False

    body = await request.body()
    expected = hmac.new(
        settings.META_APP_SECRET.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()

    if signature.startswith("sha256="):
        signature = signature[7:]

    return hmac.compare_digest(signature, expected)


def parse_meta_webhook(data: dict) -> Optional[MetaWebhookPayload]:
    try:
        return MetaWebhookPayload(**data)
    except Exception as e:
        logger.error(f"Failed to parse Meta webhook: {e}")
        return None


def extract_messaging_events(payload: MetaWebhookPayload) -> list[MetaMessagingEvent]:
    events = []
    for entry in payload.entry:
        if entry.messaging:
            for msg in entry.messaging:
                try:
                    events.append(MetaMessagingEvent(**msg))
                except Exception as e:
                    logger.warning(f"Failed to parse messaging event: {e}")
    return events


def extract_message_info(event: MetaMessagingEvent) -> dict:
    sender_id = event.sender.get("id", "")
    recipient_id = event.recipient.get("id", "")
    timestamp = event.timestamp

    text_content = ""
    message_type = "text"

    if event.message:
        message_type = "message"
        if event.message.text:
            text_content = event.message.text
        elif event.message.attachments:
            for att in event.message.attachments:
                if att.get("type") == "image":
                    text_content = "[Imagen]"
                elif att.get("type") == "video":
                    text_content = "[Video]"
                elif att.get("type") == "audio":
                    text_content = "[Audio]"
                elif att.get("type") == "file":
                    text_content = f"[Archivo: {att.get('payload', {}).get('url', '')}]"
                else:
                    text_content = f"[{att.get('type', 'Adjunto')}]"
        elif event.message.quick_reply:
            text_content = event.message.quick_reply.get("payload", "")
    elif event.postback:
        message_type = "postback"
        text_content = event.postback.get("payload", "")
        if event.postback.get("title"):
            text_content = f"{event.postback.get('title')}: {text_content}"

    return {
        "sender_id": sender_id,
        "recipient_id": recipient_id,
        "timestamp": timestamp,
        "text": text_content,
        "message_type": message_type,
        "raw_event": event.model_dump(),
    }