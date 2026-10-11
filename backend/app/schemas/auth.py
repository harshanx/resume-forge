from pydantic import BaseModel
from typing import Optional


class UserResponse(BaseModel):
    email: str
    name: Optional[str] = None
