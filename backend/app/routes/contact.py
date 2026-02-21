from fastapi import APIRouter, HTTPException
from app.schemas.contact import ContactRequest, ContactResponse
from datetime import datetime
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/contact", response_model=ContactResponse)
async def submit_contact(contact: ContactRequest):
    """
    Handle contact form submissions
    """
    try:
        # Log the contact submission
        logger.info(f"Contact form submission from {contact.email}")
        
        # In production, you would:
        # 1. Save to database
        # 2. Send email notification
        # 3. Add to CRM system
        
        # For now, we'll just log it and return success
        logger.info(f"Name: {contact.name}")
        logger.info(f"Email: {contact.email}")
        logger.info(f"Message: {contact.message}")
        
        return ContactResponse(
            success=True,
            message="Thank you for contacting us! We'll get back to you soon."
        )
    except Exception as e:
        logger.error(f"Error processing contact form: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to process contact form")
