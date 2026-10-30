import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import settings

def send_otp_email(to_email: str, otp: str):
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        print("⚠️ WARNING: SMTP credentials not set in environment or config. Using console simulation.")
        return False
        
    try:
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USERNAME
        msg['To'] = to_email
        msg['Subject'] = "Your Password Reset OTP - NeuroDetect"
        
        body = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #f4f4f5; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                <h2 style="color: #0284C7; text-align: center;">Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset your password for your NeuroDetect account. Your One-Time Password (OTP) is:</p>
                <div style="text-align: center; margin: 30px 0;">
                    <span style="font-size: 32px; font-weight: bold; background: #F0F9FF; color: #0284C7; padding: 15px 30px; border-radius: 8px; letter-spacing: 5px;">{otp}</span>
                </div>
                <p style="color: #64748b; font-size: 14px;">This OTP will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
                <p style="color: #94a3b8; font-size: 12px; text-align: center;">NeuroDetect Team</p>
            </div>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(body, 'html'))
        
        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        return True
    except Exception as e:
        print(f"❌ ERROR sending email: {e}")
        return False
