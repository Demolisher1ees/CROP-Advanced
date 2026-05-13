from datetime import datetime
from beanie import Document
from pydantic import Field

class ContactMessage(Document):
    name: str
    email: str
    message: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "contact_messages"
