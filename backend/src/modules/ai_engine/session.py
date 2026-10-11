from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.conversations.service import ConversationService
from src.modules.conversations.schemas import MessageResponse
from src.modules.ai_engine.prompts import SYSTEM_PROMPT, WELCOME_MESSAGES
from src.modules.conversations.models import ChannelType


class ConversationContextBuilder:
    def __init__(self, session: AsyncSession):
        self.conversation_service = ConversationService(session)

    async def build_context(
        self,
        conversation_id: int,
        channel: ChannelType,
        include_history: bool = True,
        history_limit: int = 10,
    ) -> list[dict]:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]

        if include_history:
            history = await self.conversation_service.get_context_for_ai(conversation_id, history_limit)
            for msg in history:
                msg_dict = {"role": msg.role.value, "content": msg.content}
                if msg.tool_calls:
                    msg_dict["tool_calls"] = msg.tool_calls
                if msg.tool_call_id:
                    msg_dict["tool_call_id"] = msg.tool_call_id
                messages.append(msg_dict)

        return messages

    async def get_welcome_message(self, channel: ChannelType) -> str:
        return WELCOME_MESSAGES.get(channel, WELCOME_MESSAGES["WEB"])

    async def build_product_context(self, products: list) -> str:
        if not products:
            return "No se encontraron productos."

        lines = []
        for p in products:
            lines.append(
                f"- **{p.name}** (ID: {p.id}) - ${p.price} - Stock: {p.stock} - {p.category}"
            )
            if p.description:
                lines.append(f"  {p.description[:100]}...")

        return "\n".join(lines)

    async def build_order_summary(self, order) -> str:
        items_lines = []
        for item in order.items:
            items_lines.append(
                f"  - {item.quantity}x {item.product.name} @ ${item.unit_price} = ${item.total_price}"
            )

        return "\n".join(items_lines)