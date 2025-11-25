from __future__ import annotations

from fastapi import Depends, HTTPException, Request, status

from src.models.user import User, UserRole


async def get_current_user(request: Request) -> User:
    """Retrieve the authenticated user from the request state."""

    user = getattr(request.state, "user", None)
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    """Ensure the current user is an organization administrator."""

    if user.role != UserRole.ORG_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return user
