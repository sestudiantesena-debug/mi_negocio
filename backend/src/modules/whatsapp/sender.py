import logging
from typing import Optional
from src.modules.whatsapp.client import evolution_client, EvolutionAPIClient
from src.modules.whatsapp.models import OutgoingMessage, SendTextRequest, SendMediaRequest, SendButtonsRequest, SendListRequest
from src.modules.conversations.models import ChannelType

logger = logging.getLogger(__name__)


class WhatsAppSender:
    def __init__(self, client: EvolutionAPIClient = None):
        self.client = client or evolution_client

    async def send_text(self, to: str, text: str, delay: int = 1200) -> bool:
        try:
            await self.client.send_text(SendTextRequest(number=to, text=text, delay=delay))
            logger.info(f"WhatsApp text sent to {to}")
            return True
        except Exception as e:
            logger.error(f"Failed to send WhatsApp text to {to}: {e}")
            return False

    async def send_media(
        self,
        to: str,
        media_url: str,
        media_type: str = "image",
        caption: Optional[str] = None,
    ) -> bool:
        try:
            await self.client.send_media(SendMediaRequest(
                number=to,
                media_url=media_url,
                media_type=media_type,
                caption=caption,
            ))
            logger.info(f"WhatsApp media sent to {to}")
            return True
        except Exception as e:
            logger.error(f"Failed to send WhatsApp media to {to}: {e}")
            return False

    async def send_buttons(
        self,
        to: str,
        text: str,
        buttons: list[dict],
        footer: Optional[str] = None,
    ) -> bool:
        try:
            await self.client.send_buttons(SendButtonsRequest(
                number=to,
                text=text,
                buttons=buttons,
                footer=footer,
            ))
            logger.info(f"WhatsApp buttons sent to {to}")
            return True
        except Exception as e:
            logger.error(f"Failed to send WhatsApp buttons to {to}: {e}")
            return False

    async def send_list(
        self,
        to: str,
        text: str,
        button_text: str,
        sections: list[dict],
        footer: Optional[str] = None,
    ) -> bool:
        try:
            await self.client.send_list(SendListRequest(
                number=to,
                text=text,
                button_text=button_text,
                sections=sections,
                footer=footer,
            ))
            logger.info(f"WhatsApp list sent to {to}")
            return True
        except Exception as e:
            logger.error(f"Failed to send WhatsApp list to {to}: {e}")
            return False

    async def send_message(self, message: OutgoingMessage) -> bool:
        try:
            await self.client.send_message(message)
            return True
        except Exception as e:
            logger.error(f"Failed to send WhatsApp message to {message.to}: {e}")
            return False

    @staticmethod
    def format_jid(phone: str) -> str:
        clean = "".join(c for c in phone if c.isdigit())
        if not clean.startswith("521") and len(clean) == 10:
            clean = "521" + clean
        return f"{clean}@s.whatsapp.net"

    @staticmethod
    def extract_phone(jid: str) -> str:
        return jid.split("@")[0] if "@" in jid else jid


whatsapp_sender = WhatsAppSender()