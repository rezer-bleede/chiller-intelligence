from __future__ import annotations

from typing import Callable

import jwt
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from src.config import settings
from src.auth.security import decode_token
from src.db import SessionLocal
from src.models import Organization, User
from src.constants import DEMO_ORG_NAME


class TenantMiddleware(BaseHTTPMiddleware):
    """Middleware that attaches the authenticated user to the request state."""

    async def dispatch(self, request: Request, call_next: Callable):  # type: ignore[override]
        service_token = request.headers.get("X-Service-Token")
        if service_token == settings.service_token:
            session = SessionLocal()
            try:
                user = (
                    session.query(User)
                    .join(Organization)
                    .filter(Organization.name == DEMO_ORG_NAME)
                    .order_by(User.id)
                    .first()
                )
                if user:
                    request.state.user = user
                    request.state.organization_id = user.organization_id
            finally:
                session.close()

            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.lower().startswith("bearer "):
            return await call_next(request)

        token = auth_header.split(" ", 1)[1]
        try:
            payload = decode_token(token)
        except jwt.PyJWTError:
            return JSONResponse(status_code=401, content={"detail": "Invalid token"})

        session = SessionLocal()
        try:
            user = session.get(User, payload.get("user_id"))
            if user is None or user.organization_id != payload.get("organization_id"):
                return JSONResponse(status_code=401, content={"detail": "Invalid token subject"})

            request.state.user = user
            request.state.organization_id = user.organization_id
            response = await call_next(request)
        finally:
            session.close()

        return response
