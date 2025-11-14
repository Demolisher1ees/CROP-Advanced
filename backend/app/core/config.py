from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://cropuser:croppass@localhost:5432/crop_advisor"
    
    # Redis
    REDIS_URL: str = "redis://localhost:6379"
    
    # API Keys
    WEATHER_API_KEY: Optional[str] = None
    
    # Application
    DEBUG: bool = True
    SECRET_KEY: str = "change-this-secret-key-in-production"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
