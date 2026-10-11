import os
from typing import Any
from groq import AsyncGroq
from pydantic import BaseModel

from src.config import settings


class LLMClient:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = "llama-3.1-70b-versatile"
        self.temperature = 0.7
        self.max_tokens = 2048

    async def chat_completion(
        self,
        messages: list[dict[str, Any]],
        tools: list[dict] | None = None,
        tool_choice: str | dict | None = "auto",
    ) -> Any:
        kwargs = {
            "model": self.model,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": self.max_tokens,
        }
        if tools:
            kwargs["tools"] = tools
            kwargs["tool_choice"] = tool_choice

        response = await self.client.chat.completions.create(**kwargs)
        return response

    async def simple_completion(self, prompt: str, system_prompt: str | None = None) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        response = await self.chat_completion(messages)
        return response.choices[0].message.content or ""


llm_client = LLMClient()