from datetime import datetime
from beanie import Document, PydanticObjectId
from pydantic import Field

class PasswordReset(Document):
    user_id: PydanticObjectId
    token: str
    expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "password_resets"
        indexes = ["token"]
