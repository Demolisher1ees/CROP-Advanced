from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings

# Import all models here so Beanie can register them
from app.models.user import User
from app.models.crop import Crop
from app.models.contact import ContactMessage
from app.models.password_reset import PasswordReset

async def init_db():
    """Initialize MongoDB connection and Beanie ODM"""
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    # The database name is the path part of the URL (e.g., /crop_advisor)
    parsed_db_name = settings.MONGODB_URL.split("/")[-1].split("?")[0]
    db_name = parsed_db_name if parsed_db_name else "crop_advisor"
    
    # Avoid TypeError: MotorDatabase object is not callable in Beanie 2.1.0/Motor 3.7.x
    client.append_metadata = lambda *args, **kwargs: None

    await init_beanie(
        database=client[db_name],
        document_models=[
            User,
            Crop,
            ContactMessage,
            PasswordReset
        ]
    )

