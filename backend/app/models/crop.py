from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.database.db import Base


class Crop(Base):
    __tablename__ = "crops"

    id = Column(Integer, primary_key=True, index=True)
    # optional link to user who added the crop
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    crop_name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)

    # original monitoring fields (kept for backward compatibility)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    temperature = Column(Float, nullable=True)
    soil_moisture = Column(String(50), nullable=True)
    status = Column(String(255), default="Monitoring")
    risk_level = Column(String(50), default="Low")
    last_checked = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # new structured data fields
    soil_data = Column(JSON, nullable=True)
    weather_data = Column(JSON, nullable=True)
    recommendation = Column(String, nullable=True)

