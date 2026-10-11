from pydantic import BaseModel
from typing import List, Optional


class BulletImprovementRequest(BaseModel):
    bullets: List[str]


class GrammarCheckRequest(BaseModel):
    resume_data: dict


class KeywordSuggestionRequest(BaseModel):
    resume_data: dict
    industry: Optional[str] = None
    role: Optional[str] = None


class ResumeTailorRequest(BaseModel):
    resume_data: dict
    job_description: str


class SummaryGenerationRequest(BaseModel):
    resume_data: dict
    job_description: str
