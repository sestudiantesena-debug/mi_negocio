import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from src.config import settings
from src.database import close_db, init_db
from src.exceptions import register_exception_handlers
from src.dependencies import verify_webhook_signature

logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up...")
    await init_db()
    logger.info("Database initialized")
    yield
    logger.info("Shutting down...")
    await close_db()
    logger.info("Database connections closed")


app = FastAPI(
    title="mi_negocio API",
    description="E-commerce + Conversational AI API for WhatsApp & Facebook",
    version="0.1.0",
    lifespan=lifespan,
    docs_url="/docs" if settings.is_development else None,
    redoc_url="/redoc" if settings.is_development else None,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL] if settings.is_production else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)


@app.get("/health", tags=["health"])
async def health_check():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "version": "0.1.0",
    }


@app.get("/health/db", tags=["health"])
async def health_db():
    from src.database import engine
    from sqlalchemy import text

    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "healthy", "database": "connected"}
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {"status": "unhealthy", "database": "disconnected", "error": str(e)}


@app.get("/health/redis", tags=["health"])
async def health_redis():
    from src.redis import redis_client

    try:
        result = await redis_client.ping()
        return {"status": "healthy" if result else "unhealthy", "redis": "connected" if result else "disconnected"}
    except Exception as e:
        logger.error(f"Redis health check failed: {e}")
        return {"status": "unhealthy", "redis": "disconnected", "error": str(e)}


@app.get("/health/all", tags=["health"])
async def health_all():
    from src.database import engine
    from src.redis import redis_client
    from sqlalchemy import text

    checks = {}

    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        checks["database"] = "connected"
    except Exception as e:
        checks["database"] = f"disconnected: {e}"

    try:
        result = await redis_client.ping()
        checks["redis"] = "connected" if result else "disconnected"
    except Exception as e:
        checks["redis"] = f"disconnected: {e}"

    all_healthy = all(v == "connected" for v in checks.values())

    return {
        "status": "healthy" if all_healthy else "degraded",
        "checks": checks,
    }


from src.modules.products.router import router as products_router
from src.modules.orders.router import router as orders_router
from src.modules.conversations.router import router as conversations_router
from src.modules.ai_engine.router import router as ai_router
from src.modules.whatsapp.router import router as whatsapp_router
from src.modules.facebook.router import router as facebook_router

app.include_router(products_router, prefix="/api/v1/products", tags=["products"])
app.include_router(orders_router, prefix="/api/v1/orders", tags=["orders"])
app.include_router(conversations_router, prefix="/api/v1/conversations", tags=["conversations"])
app.include_router(ai_router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(whatsapp_router, prefix="/webhook", tags=["whatsapp"], dependencies=[Depends(verify_webhook_signature)])
app.include_router(facebook_router, prefix="/webhook", tags=["facebook"], dependencies=[Depends(verify_webhook_signature)])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("src.main:app", host="0.0.0.0", port=8000, reload=settings.is_development)