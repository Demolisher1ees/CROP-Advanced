from pydantic_settings import BaseSettings
from typing import Optional
import os
from pathlib import Path

# Always resolve .env relative to this file's location (backend root)
ENV_FILE = Path(__file__).parent.parent.parent / ".env"


class Settings(BaseSettings):
    # Database (MongoDB)
    MONGODB_URL: str = "mongodb://localhost:27017/crop_advisor"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # API Keys
    WEATHER_API_KEY: Optional[str] = None
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    
    # Email Configuration
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # Authentication
    AUTH_SECRET: Optional[str] = None

    # Frontend URL (used in email links for password reset / verification)
    FRONTEND_URL: str = "http://localhost:3000"
    
    # Application
    # use environment variable so production won't run in debug mode
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    SECRET_KEY: str  # must be provided via environment
    JWT_SECRET_KEY: str  # must be provided via environment
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    from pydantic import model_validator

    @model_validator(mode='before')
    @classmethod
    def check_secrets(cls, values):
        # ensure critical secrets are set and not empty
        if not values.get('SECRET_KEY'):
            raise ValueError("SECRET_KEY environment variable is required")
        if not values.get('JWT_SECRET_KEY'):
            raise ValueError("JWT_SECRET_KEY environment variable is required")
        return values

    class Config:
        if ENV_FILE.exists():
            env_file = str(ENV_FILE)
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"

settings = Settings()
