"""Simple SMTP email sender used by the alert engine."""
from __future__ import annotations

import smtplib
from email.message import EmailMessage
from typing import Iterable

from src.config import settings


def send_email(to_addresses: Iterable[str], subject: str, body: str) -> bool:
    recipients = [address.strip() for address in to_addresses if address.strip()]
    if not recipients or not settings.smtp_host:
        return False

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = settings.email_from
    message["To"] = ", ".join(recipients)
    message.set_content(body)

    if settings.smtp_use_tls:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as smtp:
            if settings.smtp_username and settings.smtp_password:
                smtp.starttls()
                smtp.login(settings.smtp_username, settings.smtp_password)
            smtp.send_message(message)
    else:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as smtp:
            if settings.smtp_username and settings.smtp_password:
                smtp.login(settings.smtp_username, settings.smtp_password)
            smtp.send_message(message)

    return True
