from typing import Annotated, AsyncGenerator

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.config import settings
from src.database import get_db as get_db_session
from src.redis import get_redis as get_redis_client, UpstashRedis


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async for session in get_db_session():
        yield session


async def get_redis() -> UpstashRedis:
    return await get_redis_client()


async def verify_webhook_signature(
    x_hub_signature_256: Annotated[str | None, Header()] = None,
    x_hub_signature: Annotated[str | None, Header()] = None,
) -> None:
    if settings.is_production:
        if not x_hub_signature_256 and not x_hub_signature:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing signature header",
            )


async def verify_evolution_api_key(
    apikey: Annotated[str | None, Header(alias="apikey")] = None,
) -> None:
    if apikey != settings.EVOLUTION_API_KEY:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API key",
        )


DatabaseDep = Annotated[AsyncSession, Depends(get_db)]
RedisDep = Annotated[UpstashRedis, Depends(get_redis)]