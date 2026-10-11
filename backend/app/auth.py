from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from supabase import Client

from app.database import get_db


security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Client = Depends(get_db),
) -> dict:
    """Validate the access token with Supabase and return its user details."""
    try:
        response = db.auth.get_user(credentials.credentials)
        user = response.user
    except Exception:
        # Never trust claims decoded from a token until Supabase validates it.
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )

    return {
        "user_id": user.id,
        "email": user.email,
        "user_metadata": user.user_metadata or {},
    }
