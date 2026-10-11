from pydantic import BaseModel


class JobDescriptionRequest(BaseModel):
    job_description: str


class JobComparisonRequest(BaseModel):
    job_description: str
    resume_data: dict
