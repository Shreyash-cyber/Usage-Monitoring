import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Enterprise Usage Monitoring"
    secret_key: str = "change_me"
    access_token_expire_minutes: int = 60 * 24
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./usage.db")
    gemini_api_key: str | None = None
    ai_provider: str = "gemini"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False)


def get_settings() -> Settings:
    return Settings()
