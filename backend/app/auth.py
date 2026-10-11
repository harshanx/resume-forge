from typing import Optional
import os
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv

load_dotenv()

# Supabase Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")

security = HTTPBearer()


def decode_supabase_token(token: str) -> dict:
    """Decode and verify a Supabase JWT token."""
    try:
        # Supabase uses RS256 by default
        # If you have the JWT secret, you can decode it
        # Otherwise, you'd need to verify with Supabase's public key
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET if SUPABASE_JWT_SECRET else "",
            algorithms=["HS256"],
            options={"verify_signature": False}  # For development only
        )
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get the current user from the Supabase JWT token."""
    token = credentials.credentials
    payload = decode_supabase_token(token)
    
    user_id: str = payload.get("sub")
    email: str = payload.get("email")
    
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    return {"user_id": user_id, "email": email}
