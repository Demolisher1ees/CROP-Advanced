import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


def send_email(to_email: str, subject: str, body: str, reply_to: str = None, from_name: str = None):
    """Send email using SMTP credentials from settings."""
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        raise ValueError("SMTP credentials not configured. Set SMTP_USER and SMTP_PASSWORD environment variables.")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{from_name} <{settings.SMTP_USER}>" if from_name else f"FarmIQ <{settings.SMTP_USER}>"
    msg["To"] = to_email
    if reply_to:
        msg["Reply-To"] = reply_to

    msg.attach(MIMEText(body, "plain"))

    with smtplib.SMTP(settings.SMTP_HOST or "smtp.gmail.com", settings.SMTP_PORT or 587) as server:
        server.ehlo()
        server.starttls()
        server.ehlo()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.SMTP_USER, [to_email], msg.as_string())
    return True
