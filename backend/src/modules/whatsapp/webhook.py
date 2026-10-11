import hmac
import hashlib
import logging
from typing import Dict, Any, Optional
from fastapi import Request, HTTPException, status

from src.config import settings
from src.modules.whatsapp.models import (
    EvolutionWebhookMessage,
    EvolutionWebhookConnection,
    EvolutionWebhookQRCode,
    EvolutionWebhookBase,
)

logger = logging.getLogger(__name__)


async def verify_evolution_signature(request: Request) -> bool:
    if not settings.is_production:
        return True

    signature = request.headers.get("x-hub-signature") or request.headers.get("x-hub-signature-256")
    if not signature:
        return False

    body = await request.body()
    expected = hmac.new(
        settings.EVOLUTION_API_KEY.encode(),
        body,
        hashlib.sha256,
    ).hexdigest()

    if signature.startswith("sha256="):
        signature = signature[7:]

    return hmac.compare_digest(signature, expected)


def parse_evolution_webhook(data: Dict[str, Any]) -> Optional[EvolutionWebhookBase]:
    event = data.get("event", "")

    if event == "messages.upsert":
        return EvolutionWebhookMessage(**data)
    elif event == "connection.update":
        return EvolutionWebhookConnection(**data)
    elif event == "qrcode.updated":
        return EvolutionWebhookQRCode(**data)
    else:
        return EvolutionWebhookBase(**data)


def extract_message_info(webhook: EvolutionWebhookMessage) -> Dict[str, Any]:
    data = webhook.data
    key = data.key
    message = data.message

    from_me = key.get("fromMe", False)
    remote_jid = key.get("remoteJid", "")
    sender = key.get("participant") or remote_jid
    message_id = key.get("id", "")
    timestamp = data.message_timestamp
    push_name = data.push_name

    text_content = ""
    message_type = data.message_type

    if message_type == "conversation":
        text_content = message.get("conversation", "")
    elif message_type == "extendedTextMessage":
        text_content = message.get("extendedTextMessage", {}).get("text", "")
    elif message_type == "imageMessage":
        text_content = message.get("imageMessage", {}).get("caption", "[Imagen]")
    elif message_type == "videoMessage":
        text_content = message.get("videoMessage", {}).get("caption", "[Video]")
    elif message_type == "audioMessage":
        text_content = "[Audio]"
    elif message_type == "documentMessage":
        text_content = f"[Documento: {message.get('documentMessage', {}).get('fileName', 'archivo')}]"
    elif message_type == "stickerMessage":
        text_content = "[Sticker]"
    elif message_type == "locationMessage":
        text_content = "[Ubicación]"
    elif message_type == "contactMessage":
        text_content = "[Contacto]"
    elif message_type == "reactionMessage":
        text_content = "[Reacción]"
    else:
        text_content = f"[{message_type}]"

    return {
        "from_me": from_me,
        "remote_jid": remote_jid,
        "sender": sender,
        "message_id": message_id,
        "timestamp": timestamp,
        "push_name": push_name,
        "text": text_content,
        "message_type": message_type,
        "raw_message": message,
    }