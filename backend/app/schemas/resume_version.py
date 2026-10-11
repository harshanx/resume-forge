from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ResumeVersion(BaseModel):
    id: int
    user_email: str
    version_name: str
    resume_data: dict
    created_at: datetime
    template: str = "ats-one-page"


class ResumeVersionCreate(BaseModel):
    version_name: str
    resume_data: dict
    template: str = "ats-one-page"


class ResumeVersionResponse(BaseModel):
    id: int
    version_name: str
    created_at: datetime
    template: str
