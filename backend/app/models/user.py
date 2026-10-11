from datetime import datetime
from typing import Optional


class User:
    """User model for Firestore."""
    
    def __init__(
        self,
        email: str,
        hashed_password: str,
        name: Optional[str] = None,
        uid: Optional[str] = None,
        created_at: Optional[datetime] = None
    ):
        self.uid = uid or ""  # Firebase Auth UID
        self.email = email
        self.name = name or ""
        self.hashed_password = hashed_password
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        """Convert to Firestore document dict."""
        return {
            "email": self.email,
            "name": self.name,
            "hashed_password": self.hashed_password,
            "created_at": self.created_at,
        }
    
    @classmethod
    def from_dict(cls, data: dict, uid: str = None):
        """Create User from Firestore document."""
        return cls(
            email=data.get("email", ""),
            hashed_password=data.get("hashed_password", ""),
            name=data.get("name", ""),
            uid=uid,
            created_at=data.get("created_at")
        )
    
    def __repr__(self):
        return f"<User(uid={self.uid}, email={self.email})>"
