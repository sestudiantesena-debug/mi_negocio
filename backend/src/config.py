from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )

    # App
    ENVIRONMENT: str = Field(default="development")
    LOG_LEVEL: str = Field(default="INFO")
    FRONTEND_URL: str = Field(default="http://localhost:3000")

    # Database
    DATABASE_URL: str = Field(default="postgresql+asyncpg://postgres:postgres@localhost:5432/mi_negocio")

    # Redis
    REDIS_URL: str = Field(default="redis://localhost:6379/0")

    # Evolution API (WhatsApp)
    EVOLUTION_API_URL: str = Field(default="http://localhost:8080")
    EVOLUTION_API_KEY: str = Field(default="mi_negocio_key_123")

    # Groq (LLM)
    GROQ_API_KEY: str = Field(default="")

    # Meta Business API (Facebook/Instagram)
    META_APP_ID: str = Field(default="")
    META_APP_SECRET: str = Field(default="")
    META_VERIFY_TOKEN: str = Field(default="")

    # Clerk (Admin Auth)
    CLERK_SECRET_KEY: str = Field(default="")

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()