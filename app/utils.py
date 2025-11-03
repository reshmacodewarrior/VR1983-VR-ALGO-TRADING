import requests
from app.config import settings
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

class UpstoxClient:
    def __init__(self):
        self.config = self._get_config()

    def _get_config(self):
        if settings.ENVIRONMENT == "sandbox":
            return {
                "client_id": settings.UPSTOX_SANDBOX_CLIENT_ID,
                "client_secret": settings.UPSTOX_SANDBOX_CLIENT_SECRET,
                "redirect_uri": settings.UPSTOX_SANDBOX_REDIRECT_URL,
                "base_url": settings.UPSTOX_SANDBOX_BASE_URL,
                "auth_url": settings.UPSTOX_SANDBOX_AUTH_URL,
            }
        else:
            return {
                "client_id": settings.UPSTOX_LIVE_CLIENT_ID,
                "client_secret": settings.UPSTOX_LIVE_CLIENT_SECRET,
                "redirect_uri": settings.UPSTOX_LIVE_REDIRECT_URL,
                "base_url": settings.UPSTOX_LIVE_BASE_URL,
                "auth_url": settings.UPSTOX_LIVE_AUTH_URL,
            }

    def exchange_code_for_token(self, code: str):
        url = f"{self.config['base_url']}/login/authorization/token"
        data = {
            "code": code,
            "client_id": self.config["client_id"],
            "client_secret": self.config["client_secret"],
            "redirect_uri": self.config["redirect_uri"],
            "grant_type": "authorization_code",
        }

        resp = requests.post(url, data=data)
        if resp.status_code != 200:
            raise Exception(f"Failed to exchange code: {resp.text}")

        return resp.json()

    def get_profile(self, access_token: str):
        headers = {"Authorization": f"Bearer {access_token}"}
        resp = requests.get(f"{self.config['base_url']}/user/profile", headers=headers)
        if resp.status_code != 200:
            raise Exception(f"Failed to fetch profile: {resp.text}")
        return resp.json()

    def get_holdings(self, access_token: str):
        headers = {"Authorization": f"Bearer {access_token}"}
        resp = requests.get(f"{self.config['base_url']}/portfolio/holdings", headers=headers)
        return resp.json()
