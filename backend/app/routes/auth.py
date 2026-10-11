from fastapi import APIRouter, HTTPException, Depends, status
from supabase import Client
from app.schemas.auth import UserResponse
from app.auth import get_current_user
from app.database import get_db

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user), db: Client = Depends(get_db)):
    """Get current user information from Supabase."""
    user_id = current_user["user_id"]
    
    response = db.table("users").select("*").eq("id", user_id).execute()
    
    if not response.data:
        # User might not exist in users table yet (created via trigger)
        # Return basic info from token
        return UserResponse(email=current_user["email"], name=current_user.get("user_metadata", {}).get("name", ""))

    db_user = response.data[0]
    return UserResponse(email=db_user.get("email"), name=db_user.get("name"))
