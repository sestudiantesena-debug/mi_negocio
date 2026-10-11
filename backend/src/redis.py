import json
from typing import Any, Optional
from urllib.parse import urlparse

import httpx
from pydantic import BaseModel

from src.config import settings


class UpstashRedis:
    def __init__(self, url: str | None = None, token: str | None = None):
        self.url = url or settings.REDIS_URL
        self.token = token

        parsed = urlparse(self.url)
        self.rest_url = f"{parsed.scheme}://{parsed.netloc}"
        if not self.token and parsed.password:
            self.token = parsed.password

    def _headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    async def _request(self, method: str, command: list[str], *, json_body: dict | None = None) -> Any:
        url = f"{self.rest_url}/{command[0]}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            if method == "GET":
                response = await client.get(url, headers=self._headers(), params={"args": json.dumps(command[1:])})
            else:
                response = await client.post(url, headers=self._headers(), json={"args": command[1:]})

            response.raise_for_status()
            data = response.json()
            if "result" in data:
                return data["result"]
            return data

    async def get(self, key: str) -> Optional[str]:
        result = await self._request("GET", ["GET", key])
        return result

    async def set(self, key: str, value: str, ex: int | None = None) -> bool:
        cmd = ["SET", key, value]
        if ex:
            cmd.extend(["EX", str(ex)])
        result = await self._request("POST", cmd)
        return result == "OK"

    async def delete(self, *keys: str) -> int:
        result = await self._request("POST", ["DEL", *keys])
        return int(result) if result else 0

    async def exists(self, *keys: str) -> int:
        result = await self._request("POST", ["EXISTS", *keys])
        return int(result) if result else 0

    async def expire(self, key: str, seconds: int) -> bool:
        result = await self._request("POST", ["EXPIRE", key, str(seconds)])
        return result == 1

    async def incr(self, key: str) -> int:
        result = await self._request("POST", ["INCR", key])
        return int(result) if result else 0

    async def hset(self, name: str, key: str | None = None, value: str | None = None, mapping: dict | None = None) -> int:
        cmd = ["HSET", name]
        if mapping:
            for k, v in mapping.items():
                cmd.extend([k, v])
        elif key and value:
            cmd.extend([key, value])
        result = await self._request("POST", cmd)
        return int(result) if result else 0

    async def hget(self, name: str, key: str) -> Optional[str]:
        result = await self._request("GET", ["HGET", name, key])
        return result

    async def hgetall(self, name: str) -> dict[str, str]:
        result = await self._request("GET", ["HGETALL", name])
        if isinstance(result, list):
            return {result[i]: result[i + 1] for i in range(0, len(result), 2)}
        return {}

    async def lpush(self, key: str, *values: str) -> int:
        result = await self._request("POST", ["LPUSH", key, *values])
        return int(result) if result else 0

    async def rpop(self, key: str) -> Optional[str]:
        result = await self._request("POST", ["RPOP", key])
        return result

    async def lrange(self, key: str, start: int, end: int) -> list[str]:
        result = await self._request("GET", ["LRANGE", key, str(start), str(end)])
        return result if isinstance(result, list) else []

    async def publish(self, channel: str, message: str) -> int:
        result = await self._request("POST", ["PUBLISH", channel, message])
        return int(result) if result else 0

    async def ping(self) -> bool:
        result = await self._request("GET", ["PING"])
        return result == "PONG"


redis_client = UpstashRedis()


async def get_redis() -> UpstashRedis:
    return redis_client