from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from config import settings


conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,   # ✅ instead of MAIL_TLS
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,     # ✅ instead of MAIL_SSL
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)

async def send_reset_email(email: str, reset_link: str):
    message = MessageSchema(
        subject="Password Reset Request",
        recipients=[email],
        body=f"Click the link to reset your password: {reset_link}",
        subtype="plain"
    )
    fm = FastMail(conf)
    await fm.send_message(message)