from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime


class EvolutionWebhookBase(BaseModel):
    event: str
    instance: str
    data: Dict[str, Any]
    date_time: str
    server_url: Optional[str] = None


class EvolutionMessageData(BaseModel):
    key: Dict[str, Any]
    message: Dict[str, Any]
    message_type: str
    message_timestamp: int
    push_name: Optional[str] = None
    status: Optional[str] = None


class EvolutionWebhookMessage(EvolutionWebhookBase):
    event: str = "messages.upsert"
    data: EvolutionMessageData


class EvolutionConnectionData(BaseModel):
    state: str
    status: str


class EvolutionWebhookConnection(EvolutionWebhookBase):
    event: str = "connection.update"
    data: EvolutionConnectionData


class EvolutionQRCodeData(BaseModel):
    qrcode: str
    code: str


class EvolutionWebhookQRCode(EvolutionWebhookBase):
    event: str = "qrcode.updated"
    data: EvolutionQRCodeData


class OutgoingMessage(BaseModel):
    to: str
    text: Optional[str] = None
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    caption: Optional[str] = None
    buttons: Optional[List[Dict[str, Any]]] = None
    sections: Optional[List[Dict[str, Any]]] = None


class SendTextRequest(BaseModel):
    number: str
    text: str
    delay: int = 1200
    link_preview: bool = True
    mentions: Optional[List[str]] = None


class SendMediaRequest(BaseModel):
    number: str
    media_url: str
    media_type: str = "image"
    caption: Optional[str] = None
    file_name: Optional[str] = None
    delay: int = 1200


class SendButtonsRequest(BaseModel):
    number: str
    text: str
    buttons: List[Dict[str, Any]]
    footer: Optional[str] = None
    delay: int = 1200


class SendListRequest(BaseModel):
    number: str
    text: str
    button_text: str
    sections: List[Dict[str, Any]]
    footer: Optional[str] = None
    delay: int = 1200


class InstanceStatus(BaseModel):
    instance: str
    state: str
    status: str
    qrcode: Optional[str] = None