from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any


class MetaWebhookEntry(BaseModel):
    id: str
    time: int
    messaging: Optional[List[Dict[str, Any]]] = None
    changes: Optional[List[Dict[str, Any]]] = None


class MetaWebhookPayload(BaseModel):
    object: str
    entry: List[MetaWebhookEntry]


class MetaMessage(BaseModel):
    mid: str
    text: Optional[str] = None
    attachments: Optional[List[Dict[str, Any]]] = None
    quick_reply: Optional[Dict[str, Any]] = None
    metadata: Optional[str] = None


class MetaMessagingEvent(BaseModel):
    sender: Dict[str, str]
    recipient: Dict[str, str]
    timestamp: int
    message: Optional[MetaMessage] = None
    postback: Optional[Dict[str, Any]] = None
    delivery: Optional[Dict[str, Any]] = None
    read: Optional[Dict[str, Any]] = None


class OutgoingMetaMessage(BaseModel):
    recipient: Dict[str, str]
    message: Optional[Dict[str, Any]] = None
    sender_action: Optional[str] = None
    notification_type: str = "REGULAR"
    tag: Optional[str] = None


class SendTextMessage(BaseModel):
    recipient_id: str
    text: str


class SendTemplateMessage(BaseModel):
    recipient_id: str
    template_name: str
    language_code: str = "es"
    components: Optional[List[Dict[str, Any]]] = None


class SendButtonTemplate(BaseModel):
    recipient_id: str
    template_name: str
    language_code: str = "es"
    buttons: List[Dict[str, Any]]