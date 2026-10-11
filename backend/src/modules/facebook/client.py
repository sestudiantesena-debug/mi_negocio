import httpx
import logging
from typing: Optional, Dict, Any, List

from src.config import settings

logger = logging.getLogger(__name__)


class MetaGraphAPIClient:
    def __init__(
        self,
        app_id: str = None,
        app_secret: str = None,
        page_access_token: str = None,
    ):
        self.app_id = app_id or settings.META_APP_ID
        self.app_secret = app_secret or settings.META_APP_SECRET
        self.page_access_token = page_access_token
        self.base_url = "https://graph.facebook.com/v20.0"
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                timeout=30.0,
            )
        return self._client

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None

    def _get_params(self, extra: Dict[str, Any] = None) -> Dict[str, Any]:
        params = {"access_token": self.page_access_token}
        if extra:
            params.update(extra)
        return params

    async def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        params = kwargs.pop("params", {})
        params.update(self._get_params())

        try:
            response = await self.client.request(method, url, params=params, **kwargs)
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            logger.error(f"Meta API error: {e.response.status_code} - {e.response.text}")
            raise
        except Exception as e:
            logger.error(f"Meta API request failed: {e}")
            raise

    async def send_text(self, recipient_id: str, text: str) -> Dict[str, Any]:
        return await self._request(
            "POST",
            "/me/messages",
            json={
                "recipient": {"id": recipient_id},
                "message": {"text": text},
                "messaging_type": "RESPONSE",
            },
        )

    async def send_template(
        self,
        recipient_id: str,
        template_name: str,
        language_code: str = "es",
        components: List[Dict[str, Any]] = None,
    ) -> Dict[str, Any]:
        payload = {
            "recipient": {"id": recipient_id},
            "message": {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "button",
                        "template_name": template_name,
                        "language": language_code,
                    },
                },
            },
        }
        if components:
            payload["message"]["attachment"]["payload"]["components"] = components

        return await self._request("POST", "/me/messages", json=payload)

    async def send_buttons(
        self,
        recipient_id: str,
        text: str,
        buttons: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        return await self._request(
            "POST",
            "/me/messages",
            json={
                "recipient": {"id": recipient_id},
                "message": {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "button",
                            "text": text,
                            "buttons": buttons,
                        },
                    },
                },
            },
        )

    async def send_generic_template(
        self,
        recipient_id: str,
        elements: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        return await self._request(
            "POST",
            "/me/messages",
            json={
                "recipient": {"id": recipient_id},
                "message": {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": elements,
                        },
                    },
                },
            },
        )

    async def sender_action(self, recipient_id: str, action: str = "typing_on") -> Dict[str, Any]:
        return await self._request(
            "POST",
            "/me/messages",
            json={
                "recipient": {"id": recipient_id},
                "sender_action": action,
            },
        )

    async def get_page_info(self) -> Dict[str, Any]:
        return await self._request("GET", "/me", params={"fields": "id,name,access_token"})

    async def subscribe_app(self) -> Dict[str, Any]:
        return await self._request("POST", f"/{self.app_id}/subscriptions")

    def verify_webhook(self, mode: str, token: str, challenge: str) -> Optional[str]:
        if mode == "subscribe" and token == settings.META_VERIFY_TOKEN:
            return challenge
        return None


meta_client = MetaGraphAPIClient()