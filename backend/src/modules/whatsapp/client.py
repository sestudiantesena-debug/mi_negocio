import httpx
import logging
from typing import Optional, Dict, Any, List

from src.config import settings
from src.modules.whatsapp.models import (
    SendTextRequest,
    SendMediaRequest,
    SendButtonsRequest,
    SendListRequest,
    OutgoingMessage,
    InstanceStatus,
)

logger = logging.getLogger(__name__)


class EvolutionAPIClient:
    def __init__(self, base_url: str = None, api_key: str = None):
        self.base_url = (base_url or settings.EVOLUTION_API_URL).rstrip("/")
        self.api_key = api_key or settings.EVOLUTION_API_KEY
        self.instance_name = "mi_negocio"
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                headers={
                    "apikey": self.api_key,
                    "Content-Type": "application/json",
                },
                timeout=30.0,
            )
        return self._client

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None

    async def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        headers = {"apikey": self.api_key, "Content-Type": "application/json"}
        if "headers" in kwargs:
            headers.update(kwargs.pop("headers"))

        try:
            response = await self.client.request(method, url, headers=headers, **kwargs)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"Evolution API error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Evolution API request failed: {e}")
            raise

    async def send_text(self, request: SendTextRequest) -> Dict[str, Any]:
        return await self._request(
            "POST",
            f"/message/sendText/{self.instance_name}",
            json=request.model_dump(),
        )

    async def send_media(self, request: SendMediaRequest) -> Dict[str, Any]:
        return await self._request(
            "POST",
            f"/message/sendMedia/{self.instance_name}",
            json=request.model_dump(),
        )

    async def send_buttons(self, request: SendButtonsRequest) -> Dict[str, Any]:
        return await self._request(
            "POST",
            f"/message/sendButtons/{self.instance_name}",
            json=request.model_dump(),
        )

    async def send_list(self, request: SendListRequest) -> Dict[str, Any]:
        return await self._request(
            "POST",
            f"/message/sendList/{self.instance_name}",
            json=request.model_dump(),
        )

    async def send_message(self, message: OutgoingMessage) -> Dict[str, Any]:
        if message.text and not message.media_url:
            return await self.send_text(SendTextRequest(number=message.to, text=message.text))
        elif message.media_url:
            return await self.send_media(SendMediaRequest(
                number=message.to,
                media_url=message.media_url,
                media_type=message.media_type or "image",
                caption=message.caption,
            ))
        elif message.buttons:
            return await self.send_buttons(SendButtonsRequest(
                number=message.to,
                text=message.text or "",
                buttons=message.buttons,
            ))
        elif message.sections:
            return await self.send_list(SendListRequest(
                number=message.to,
                text=message.text or "",
                button_text="Ver opciones",
                sections=message.sections,
            ))
        else:
            raise ValueError("Message must have text, media, buttons, or sections")

    async def get_instance_status(self) -> InstanceStatus:
        result = await self._request("GET", f"/instance/connectionState/{self.instance_name}")
        return InstanceStatus(**result)

    async def get_qrcode(self) -> Dict[str, Any]:
        return await self._request("GET", f"/instance/qrcode/{self.instance_name}")

    async def restart_instance(self) -> Dict[str, Any]:
        return await self._request("POST", f"/instance/restart/{self.instance_name}")

    async def logout_instance(self) -> Dict[str, Any]:
        return await self._request("DELETE", f"/instance/logout/{self.instance_name}")

    async def set_webhook(self, webhook_url: str, events: List[str] = None) -> Dict[str, Any]:
        events = events or [
            "messages.upsert",
            "connection.update",
            "qrcode.updated",
        ]
        return await self._request(
            "POST",
            f"/webhook/set/{self.instance_name}",
            json={"url": webhook_url, "events": events},
        )


evolution_client = EvolutionAPIClient()