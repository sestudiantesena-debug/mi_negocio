import json
import logging
from typing import Any
from sqlalchemy.ext.asyncio import AsyncSession

from src.modules.ai_engine.llm import llm_client
from src.modules.ai_engine.tools import TOOLS, TOOL_FUNCTIONS
from src.modules.ai_engine.session import ConversationContextBuilder
from src.modules.ai_engine.prompts import PRODUCT_PRESENTATION_TEMPLATE, ORDER_SUMMARY_TEMPLATE, ESCALATION_MESSAGE
from src.modules.conversations.models import ChannelType
from src.modules.products.service import ProductService
from src.modules.orders.service import OrderService
from src.modules.conversations.service import ConversationService
from src.modules.conversations.schemas import MessageCreate, MessageRole

logger = logging.getLogger(__name__)


class AIOrchestrator:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.context_builder = ConversationContextBuilder(session)
        self.product_service = ProductService(session)
        self.order_service = OrderService(session)
        self.conversation_service = ConversationService(session)

    async def process_message(
        self,
        conversation_id: int,
        channel: ChannelType,
        user_message: str,
    ) -> str:
        context = await self.context_builder.build_context(conversation_id, channel)

        context.append({"role": "user", "content": user_message})

        response = await llm_client.chat_completion(context, tools=TOOLS)

        message = response.choices[0].message

        if message.tool_calls:
            for tool_call in message.tool_calls:
                tool_name = tool_call.function.name
                tool_args = json.loads(tool_call.function.arguments)

                result = await self._execute_tool(tool_name, tool_args, conversation_id, channel)

                context.append({
                    "role": "assistant",
                    "content": None,
                    "tool_calls": [{
                        "id": tool_call.id,
                        "type": "function",
                        "function": {"name": tool_name, "arguments": tool_call.function.arguments}
                    }]
                })

                context.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "content": json.dumps(result, ensure_ascii=False)
                })

            final_response = await llm_client.chat_completion(context, tools=TOOLS)
            final_message = final_response.choices[0].message

            await self.conversation_service.add_message(conversation_id, MessageCreate(
                role=MessageRole.ASSISTANT,
                content=final_message.content or "",
                tool_calls=[{
                    "id": tc.id,
                    "type": "function",
                    "function": {"name": tc.function.name, "arguments": tc.function.arguments}
                } for tc in message.tool_calls] if message.tool_calls else None
            ))

            return final_message.content or ""

        else:
            await self.conversation_service.add_message(conversation_id, MessageCreate(
                role=MessageRole.ASSISTANT,
                content=message.content or ""
            ))

            return message.content or ""

    async def _execute_tool(self, tool_name: str, args: dict, conversation_id: int, channel: ChannelType) -> dict:
        try:
            if tool_name == "search_products":
                return await self._search_products(args)
            elif tool_name == "get_product_details":
                return await self._get_product_details(args)
            elif tool_name == "create_draft_order":
                return await self._create_draft_order(args, conversation_id, channel)
            elif tool_name == "get_order_status":
                return await self._get_order_status(args)
            elif tool_name == "handoff_to_human":
                return await self._handoff_to_human(args, conversation_id)
            else:
                return {"error": f"Unknown tool: {tool_name}"}
        except Exception as e:
            logger.error(f"Tool {tool_name} failed: {e}")
            return {"error": str(e)}

    async def _search_products(self, args: dict) -> dict:
        products = await self.product_service.search_for_ai(
            query=args["query"],
            limit=args.get("limit", 5)
        )

        if args.get("category"):
            products = [p for p in products if p.category.lower() == args["category"].lower()]

        if args.get("max_price"):
            products = [p for p in products if p.price <= args["max_price"]]

        return {
            "products": [
                {
                    "id": p.id,
                    "name": p.name,
                    "price": float(p.price),
                    "stock": p.stock,
                    "category": p.category,
                    "description": p.description[:200] if p.description else None,
                    "images": p.images[:1] if p.images else [],
                }
                for p in products
            ],
            "count": len(products),
        }

    async def _get_product_details(self, args: dict) -> dict:
        product = await self.product_service.get(args["product_id"])
        return {
            "id": product.id,
            "name": product.name,
            "description": product.description,
            "price": float(product.price),
            "stock": product.stock,
            "category": product.category,
            "images": product.images,
            "metadata": product.metadata,
        }

    async def _create_draft_order(self, args: dict, conversation_id: int, channel: ChannelType) -> dict:
        from src.modules.orders.schemas import OrderCreate, OrderItemCreate

        conversation = await self.conversation_service.get(conversation_id)

        items = [OrderItemCreate(**item) for item in args["items"]]

        order_data = OrderCreate(
            channel=channel,
            customer_name=args["customer_name"],
            customer_phone=args["customer_phone"],
            customer_email=args.get("customer_email"),
            customer_external_id=conversation.external_id,
            items=items,
            metadata={"source": "ai_chat", "conversation_id": conversation_id},
        )

        order = await self.order_service.create(order_data)

        conversation.context["pending_order_id"] = order.id
        conversation.context["pending_order_number"] = order.order_number
        await self.session.flush()

        items_text = "\n".join([f"  - {item.quantity}x {item.product_id}" for item in args["items"]])

        return {
            "order_id": order.id,
            "order_number": order.order_number,
            "total": float(order.total),
            "items": [{"product_id": i.product_id, "quantity": i.quantity} for i in args["items"]],
            "message": ORDER_SUMMARY_TEMPLATE.format(
                items=items_text,
                total=f"${order.total}",
                shipping_info="A coordinar",
                payment_info="Transferencia/efectivo - te enviaremos los datos",
            )
        }

    async def _get_order_status(self, args: dict) -> dict:
        order = await self.order_service.get_by_number(args["order_number"])
        return {
            "order_number": order.order_number,
            "status": order.status.value,
            "total": float(order.total),
            "items": [
                {"product": item.product.name, "quantity": item.quantity, "price": float(item.unit_price)}
                for item in order.items
            ],
            "created_at": order.created_at.isoformat(),
        }

    async def _handoff_to_human(self, args: dict, conversation_id: int) -> dict:
        await self.conversation_service.escalate_to_human(conversation_id, args["reason"])
        return {
            "escalated": True,
            "reason": args["reason"],
            "message": ESCALATION_MESSAGE,
        }