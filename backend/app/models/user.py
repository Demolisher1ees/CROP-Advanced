from datetime import datetime
from typing import Optional
from beanie import Document
from pydantic import Field

class User(Document):
    email: str
    first_name: str
    last_name: str
    hashed_password: str
    is_active: bool = True
    is_verified: bool = False
    verification_token: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    class Settings:
        name = "users"
        indexes = ["email", "verification_token"]
