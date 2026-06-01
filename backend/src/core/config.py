# backend/src/core/config.py
from pathlib import Path

from pydantic_settings import BaseSettings

BASE_DIR = Path(__file__).resolve().parents[2]

class Settings(BaseSettings):
    PROJECT_NAME: str = "ERP Comercial"
    VERSION: str = "1.0.0"
    DATABASE_URL: str
    SUPABASE_URL: str
    SUPABASE_KEY: str
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    class Config:
        env_file = BASE_DIR / ".env"

settings = Settings()
