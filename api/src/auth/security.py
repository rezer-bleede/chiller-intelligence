from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any

import jwt
from passlib.context import CryptContext

from src.config import settings

pwd_context = CryptContext(schemes=["bcrypt_sha256"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash."""

    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt."""

    return pwd_context.hash(password)


def create_access_token(subject: dict[str, Any], expires_delta: timedelta | None = None) -> str:
    """Create a JWT token for the provided subject payload."""

    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(hours=1))
    to_encode = {"exp": expire, **subject}
    return jwt.encode(to_encode, settings.secret_key, algorithm="HS256")


def decode_token(token: str) -> dict[str, Any]:
    """Decode a JWT token and return its payload."""

    return jwt.decode(token, settings.secret_key, algorithms=["HS256"])
