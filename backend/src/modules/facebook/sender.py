import logging
from typing import Optional
from src.modules.facebook.client import meta_client, MetaGraphAPIClient
from src.modules.facebook.models import OutgoingMetaMessage

logger = logging.getLogger(__name__)


class FacebookSender:
    def __init__(self, client: MetaGraphAPIClient = None):
        self.client = client or meta_client

    async def send_text(self, recipient_id: str, text: str) -> bool:
        try:
            await self.client.send_text(recipient_id, text)
            logger.info(f"Facebook message sent to {recipient_id}")
            return True
        except Exception as e:
            logger.error(f"Failed to send Facebook message to {recipient_id}: {e}")
            return False

    async def send_template(
        self,
        recipient_id: str,
        template_name: str,
        language_code: str = "es",
        components: Optional[list] = None,
    ) -> bool:
        try:
            await self.client.send_template(recipient_id, template_name, language_code, components)
            return True
        except Exception as e:
            logger.error(f"Failed to send Facebook template to {recipient_id}: {e}")
            return False

    async def send_buttons(self, recipient_id: str, text: str, buttons: list[dict]) -> bool:
        try:
            await self.client.send_buttons(recipient_id, text, buttons)
            return True
        except Exception as e:
            logger.error(f"Failed to send Facebook buttons to {recipient_id}: {e}")
            return False

    async def send_generic_template(self, recipient_id: str, elements: list[dict]) -> bool:
        try:
            await self.client.send_generic_template(recipient_id, elements)
            return True
        except Exception as e:
            logger.error(f"Failed to send Facebook generic template to {recipient_id}: {e}")
            return False

    async def sender_action(self, recipient_id: str, action: str = "typing_on") -> bool:
        try:
            await self.client.sender_action(recipient_id, action)
            return True
        except Exception as e:
            logger.error(f"Failed to send sender action to {recipient_id}: {e}")
            return False


facebook_sender = FacebookSender()