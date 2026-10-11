from pydantic import BaseModel, Field, validator, root_validator
from typing import List, Optional, Literal
from datetime import date as Date
from math import isfinite


def validate_optional_web_url(value):
    if value is None or value == "":
        return None
    from urllib.parse import urlparse
    value = value.strip()
    parsed = urlparse(value)
    if parsed.scheme not in ("http", "https") or not parsed.netloc:
        raise ValueError("URL must begin with http:// or https://")
    return value


class PersonalInfo(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    email: str = Field(..., min_length=1, max_length=100)
    linkedin: Optional[str] = Field(None, max_length=200)
    github: Optional[str] = Field(None, max_length=200)
    location: Optional[str] = Field(None, max_length=100)


class Education(BaseModel):
    degree: str = Field(..., min_length=1, max_length=200)
    specialization: Optional[str] = Field(None, max_length=200)
    institution: Optional[str] = Field(None, max_length=200)
    university: Optional[str] = Field(None, max_length=200)
    cgpa: Optional[str] = Field(None, max_length=20)
    percentage: Optional[str] = Field(None, max_length=20)
    grade_value: Optional[str] = Field(None, max_length=20)
    grade_scale: Optional[Literal["10", "5", "percentile"]] = None
    graduation_year: Optional[int] = Field(None, ge=1950, le=2035)

    @root_validator(skip_on_failure=True)
    def validate_grade_range(cls, values):
        grade_value = values.get("grade_value")
        if grade_value not in (None, ""):
            try:
                grade = float(grade_value)
            except (TypeError, ValueError):
                raise ValueError("Grade must be a number")
            if not isfinite(grade):
                raise ValueError("Grade must be a finite number")
            scale = values.get("grade_scale")
            maximum = 100 if scale == "percentile" else int(scale) if scale in ("5", "10") else None
            if maximum is None:
                raise ValueError("Choose a grade scale")
            if grade < 0 or grade > maximum:
                raise ValueError(f"Grade must be between 0 and {maximum}")
        return values


class Skills(BaseModel):
    technical: Optional[str] = Field(None, max_length=500)
    professional: Optional[str] = Field(None, max_length=500)


class Certification(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    organization: Optional[str] = Field(None, max_length=200)
    date: Optional[str] = Field(None, max_length=50)
    certificate_id: Optional[str] = Field(None, max_length=100)
    url: Optional[str] = Field(None, max_length=500)

    _validate_url = validator("url", allow_reuse=True)(validate_optional_web_url)


class Experience(BaseModel):
    job_title: str = Field(..., min_length=1, max_length=200)
    company: str = Field(..., min_length=1, max_length=200)
    date: str = Field(..., min_length=1, max_length=100)
    start_date: Optional[str] = Field(None, max_length=10)
    end_date: Optional[str] = Field(None, max_length=10)
    current_role: bool = False
    bullets: List[str] = Field(default_factory=list, max_items=5)

    @root_validator(skip_on_failure=True)
    def validate_experience_dates(cls, values):
        start = values.get("start_date")
        end = values.get("end_date")
        current = values.get("current_role")
        if end and not start:
            raise ValueError("Add a start date before the end date")
        if start:
            try:
                Date.fromisoformat(start)
                if end:
                    Date.fromisoformat(end)
            except ValueError:
                raise ValueError("Experience dates must use YYYY-MM-DD format")
            if not current and not end:
                raise ValueError("Add an end date or mark this as your current role")
            if end and end < start:
                raise ValueError("End date cannot be earlier than start date")
        return values


class Project(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    technologies: str = Field(..., min_length=1, max_length=200)
    github_url: Optional[str] = Field(None, max_length=500)
    bullets: List[str] = Field(default_factory=list, max_items=5)

    _validate_github_url = validator("github_url", allow_reuse=True)(validate_optional_web_url)


class ResumeData(BaseModel):
    personal: PersonalInfo
    education: List[Education] = Field(default_factory=list, max_items=5)
    skills: Optional[Skills] = None
    certifications: List[Certification] = Field(default_factory=list, max_items=5)
    experience: List[Experience] = Field(default_factory=list, max_items=5)
    projects: List[Project] = Field(default_factory=list, max_items=5)
    achievements: List[str] = Field(default_factory=list, max_items=10)


class ResumeResponse(BaseModel):
    success: bool
    message: str
    pages: int
    pdf_url: Optional[str] = None
    latex_url: Optional[str] = None
    warnings: List[str] = Field(default_factory=list)
