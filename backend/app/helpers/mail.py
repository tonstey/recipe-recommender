from fastapi_mail import FastMail, ConnectionConfig, MessageSchema, MessageType
from decouple import config



configMail = ConnectionConfig(
   MAIL_USERNAME=config("EMAIL"),
   MAIL_PASSWORD=config("EMAIL_PASSWORD"),
   MAIL_FROM=config("EMAIL"),
   MAIL_PORT=587,
   MAIL_SERVER="smtp.gmail.com",
   MAIL_STARTTLS=True,
   MAIL_SSL_TLS= False,
)
mail = FastMail(configMail)

async def mail_token(email, token):
    try:
        frontend = config("FRONTEND_URL")
        verification_link = f"{frontend}/account/confirm/{token}"

        msg = MessageSchema(
            subject="Savorly Account Verification Email",
            recipients=[email],
            body=f"<a href='{verification_link}'>Confirm Your Account Here</a>",
            subtype=MessageType.html)

        await mail.send_message(msg)
        return {"success": True}
    except Exception as e:
        print(str(e))
        return {"success": False, "message": "Unable to send verification link. Please log in later to resend the link."}