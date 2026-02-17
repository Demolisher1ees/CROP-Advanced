from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    # Database (SQLite by default for easier setup)
    DATABASE_URL: str = "sqlite:///./crop_advisor.db"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # API Keys
    WEATHER_API_KEY: Optional[str] = None
    
    # Application
    DEBUG: bool = True
    SECRET_KEY: str = "change-this-secret-key-in-production"
    JWT_SECRET_KEY: str = "jwt-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
