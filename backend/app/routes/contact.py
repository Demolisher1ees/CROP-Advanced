from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.schemas.contact import ContactRequest, ContactResponse
from app.database.db import get_db
from app.models.contact import Contact
from app.core.logger import logger
from app.services.email_service import send_email

router = APIRouter()

ADMIN_EMAIL = "noreplycropstation@gmail.com"

@router.post("/contact", response_model=ContactResponse)
def submit_contact(contact: ContactRequest, db: Session = Depends(get_db)):
    """Handle contact form submissions, save to DB, and send emails."""
    try:
        logger.info(f"Contact form submission from {contact.email}")

        # Save to database
        new_msg = Contact(
            name=contact.name,
            email=contact.email,
            message=contact.message
        )
        db.add(new_msg)
        db.commit()
        db.refresh(new_msg)

        # --- Email 1: Notification to admin ---
        # Subject includes sender name so it's easy to spot in inbox
        admin_subject = f"[FarmIQ Contact] Message from {contact.name} ({contact.email})"
        admin_body = f"""You have received a new message via the FarmIQ contact form.

From Name: {contact.name}
From Email: {contact.email}

Message:
{contact.message}

---
Reply directly to this email to respond to {contact.name}.
"""
        try:
            from app.core.config import settings
            logger.info(f"Attempting to send email. SMTP_USER from settings is: {settings.SMTP_USER}")
            # From must match the authenticated SMTP account (noreplycropstation@gmail.com).
            # Putting another @gmail.com in the From display triggers Gmail 550 5.7.1
            # "unsolicited mail" / impersonation blocks. Use Reply-To + subject/body for the user.
            send_email(
                to_email=ADMIN_EMAIL,
                subject=admin_subject,
                body=admin_body,
                reply_to=contact.email,
                from_name="FarmIQ Contact",
            )
            logger.info(f"Admin notification sent to {ADMIN_EMAIL}")
        except Exception as e:
            logger.error(f"Admin email failed: {e}")

        # --- Email 2: Confirmation to the user ---
        user_subject = "We received your message — FarmIQ"
        user_body = f"""Hi {contact.name},

Thank you for reaching out to FarmIQ! We have received your message and will get back to you within 24 hours.

Here's a copy of what you sent:

"{contact.message}"

If you have any urgent questions, you can also reach us at {ADMIN_EMAIL}.

Best regards,
The FarmIQ Team
"""
        try:
            send_email(
                to_email=contact.email,
                subject=user_subject,
                body=user_body,
                from_name="FarmIQ Support"
            )
            logger.info(f"Confirmation email sent to {contact.email}")
        except Exception as e:
            logger.error(f"User confirmation email failed: {e}")

        return ContactResponse(
            success=True,
            message="Thank you for contacting us! We'll get back to you soon."
        )

    except Exception as e:
        logger.error(f"Error processing contact form: {e}")
        raise HTTPException(status_code=500, detail="Failed to process contact form")
