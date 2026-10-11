from fastapi import APIRouter, HTTPException, Depends, status
from typing import List
from supabase import Client
from app.schemas.resume_version import ResumeVersion, ResumeVersionCreate, ResumeVersionResponse
from app.auth import get_current_user
from app.database import get_db
from app.models import ResumeVersion as ResumeVersionModel

router = APIRouter(prefix="/api/resume-versions", tags=["resume-versions"])


@router.post("/", response_model=ResumeVersionResponse)
async def save_resume_version(
    version: ResumeVersionCreate,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Save a resume version for the current user."""
    user_id = current_user["user_id"]

    # Create new resume version
    version_data = {
        "user_id": user_id,
        "version_name": version.version_name,
        "resume_data": version.resume_data,
        "template": version.template,
        "created_at": "now()"
    }
    
    # Save to Supabase
    result = db.table("resume_versions").insert(version_data).execute()
    
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save resume version"
        )

    saved_version = result.data[0]
    return ResumeVersionResponse(
        id=str(saved_version["id"]),
        version_name=saved_version["version_name"],
        created_at=saved_version["created_at"],
        template=saved_version["template"]
    )


@router.get("/", response_model=List[ResumeVersionResponse])
async def get_resume_versions(
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Get all resume versions for the current user."""
    user_id = current_user["user_id"]

    response = db.table("resume_versions").select("*").eq("user_id", user_id).execute()

    return [
        ResumeVersionResponse(
            id=str(version["id"]),
            version_name=version["version_name"],
            created_at=version["created_at"],
            template=version["template"]
        )
        for version in response.data
    ]


@router.get("/{version_id}", response_model=ResumeVersion)
async def get_resume_version(
    version_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Get a specific resume version."""
    response = db.table("resume_versions").select("*").eq("id", version_id).execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume version not found"
        )

    version_data = response.data[0]
    
    # Check if user owns this version
    if version_data.get("user_id") != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this resume version"
        )

    return ResumeVersion(
        id=str(version_data["id"]),
        user_email=current_user["email"],
        version_name=version_data["version_name"],
        resume_data=version_data["resume_data"],
        created_at=version_data["created_at"],
        template=version_data["template"]
    )


@router.delete("/{version_id}")
async def delete_resume_version(
    version_id: str,
    current_user: dict = Depends(get_current_user),
    db: Client = Depends(get_db)
):
    """Delete a resume version."""
    response = db.table("resume_versions").select("*").eq("id", version_id).execute()

    if not response.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Resume version not found"
        )

    version_data = response.data[0]
    
    # Check if user owns this version
    if version_data.get("user_id") != current_user["user_id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this resume version"
        )

    db.table("resume_versions").delete().eq("id", version_id).execute()

    return {"message": "Resume version deleted successfully"}
