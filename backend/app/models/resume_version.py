from datetime import datetime
from typing import Optional, Dict, Any


class ResumeVersion:
    """Resume version model for Firestore."""
    
    def __init__(
        self,
        user_id: str,
        version_name: str,
        resume_data: Dict[str, Any],
        template: str = "ats-one-page",
        doc_id: Optional[str] = None,
        created_at: Optional[datetime] = None
    ):
        self.doc_id = doc_id or ""  # Firestore document ID
        self.user_id = user_id
        self.version_name = version_name
        self.resume_data = resume_data
        self.template = template
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        """Convert to Firestore document dict."""
        return {
            "user_id": self.user_id,
            "version_name": self.version_name,
            "resume_data": self.resume_data,
            "template": self.template,
            "created_at": self.created_at,
        }
    
    @classmethod
    def from_dict(cls, data: dict, doc_id: str = None):
        """Create ResumeVersion from Firestore document."""
        return cls(
            user_id=data.get("user_id", ""),
            version_name=data.get("version_name", ""),
            resume_data=data.get("resume_data", {}),
            template=data.get("template", "ats-one-page"),
            doc_id=doc_id,
            created_at=data.get("created_at")
        )
    
    def __repr__(self):
        return f"<ResumeVersion(doc_id={self.doc_id}, version_name={self.version_name}, user_id={self.user_id})>"
