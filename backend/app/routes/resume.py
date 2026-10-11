from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from app.schemas.resume import ResumeData, ResumeResponse
from app.schemas.job import JobDescriptionRequest, JobComparisonRequest
from app.schemas.ai import (
    BulletImprovementRequest,
    GrammarCheckRequest,
    KeywordSuggestionRequest,
    ResumeTailorRequest,
    SummaryGenerationRequest
)
from app.services.latex_generator import LatexGenerator
from app.services.pdf_generator import PDFGenerator
from app.services.pdf_validator import PDFValidator
from app.services.content_optimizer import ContentOptimizer
from app.services.ats_checker import ATSChecker
from app.services.job_analyzer import JobAnalyzer
from app.services.ai_improver import AIImprover
from app.services.grammar_checker import GrammarChecker
from app.services.keyword_suggester import KeywordSuggester
from app.services.job_tailor import JobTailor
from app.utils.latex_escape import escape_resume_data
import base64
import io


router = APIRouter(prefix="/api/resume", tags=["resume"])

latex_generator = LatexGenerator()
pdf_generator = PDFGenerator()
pdf_validator = PDFValidator()
content_optimizer = ContentOptimizer()
ats_checker = ATSChecker()
job_analyzer = JobAnalyzer()
ai_improver = AIImprover()
grammar_checker = GrammarChecker()
keyword_suggester = KeywordSuggester()
job_tailor = JobTailor()


@router.post("/generate", response_model=ResumeResponse)
def generate_resume(resume_data: ResumeData, template: str = "ats-one-page"):
    """
    Generate a one-page ATS-friendly resume PDF.
    """
    warnings = []

    # Convert to dict and escape LaTeX special characters
    data_dict = resume_data.dict()
    escaped_data = escape_resume_data(data_dict)

    # Generate LaTeX with selected template
    latex_code = latex_generator.generate_latex(f'{template}/resume.tex', escaped_data)

    # Compile to PDF
    pdf_bytes = pdf_generator.compile_latex(latex_code, resume_data=data_dict)

    if not pdf_bytes:
        raise HTTPException(status_code=500, detail="Failed to compile LaTeX")

    # Validate page count
    is_one_page, page_count = pdf_validator.validate_one_page(pdf_bytes)

    # If not one page, optimize and retry
    max_attempts = 4
    attempt = 0

    while not is_one_page and attempt < max_attempts:
        attempt += 1
        warnings.append(f"Resume exceeded one page (attempt {attempt}). Optimizing...")

        # Optimize content
        optimized_data = content_optimizer.optimize(data_dict, level=attempt)
        escaped_data = escape_resume_data(optimized_data)

        # Regenerate LaTeX
        latex_code = latex_generator.generate_latex(f'{template}/resume.tex', escaped_data)

        # Recompile
        pdf_bytes = pdf_generator.compile_latex(latex_code, resume_data=optimized_data)

        if not pdf_bytes:
            raise HTTPException(status_code=500, detail="Failed to compile optimized LaTeX")

        # Revalidate
        is_one_page, page_count = pdf_validator.validate_one_page(pdf_bytes)

    # If still not one page after optimization
    if not is_one_page:
        suggestions = content_optimizer.get_optimization_suggestions(data_dict)
        warnings.extend(suggestions)
        warnings.append("Could not fit resume on one page. Please reduce content manually.")

    # Convert PDF to base64 for response
    pdf_base64 = base64.b64encode(pdf_bytes).decode('utf-8')

    return ResumeResponse(
        success=True,
        message="Resume generated successfully" if is_one_page else "Resume generated but exceeds one page",
        pages=page_count,
        pdf_url=f"data:application/pdf;base64,{pdf_base64}",
        latex_url=None,  # Can be implemented later
        warnings=warnings
    )


@router.post("/download")
def download_resume(resume_data: ResumeData, template: str = "ats-one-page"):
    """
    Generate and download resume as PDF file.
    """
    # Convert to dict and escape
    data_dict = resume_data.dict()
    escaped_data = escape_resume_data(data_dict)

    # Generate LaTeX with selected template
    latex_code = latex_generator.generate_latex(f'{template}/resume.tex', escaped_data)

    # Compile to PDF
    pdf_bytes = pdf_generator.compile_latex(latex_code, resume_data=data_dict)

    if not pdf_bytes:
        raise HTTPException(status_code=500, detail="Failed to compile LaTeX")

    # Return as downloadable file
    filename = f"{resume_data.personal.name.replace(' ', '_')}_Resume.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("/validate")
async def validate_resume(resume_data: ResumeData):
    """
    Validate resume data without generating PDF.
    """
    health = {
        'personal_info': bool(resume_data.personal.name and resume_data.personal.email),
        'education': len(resume_data.education) > 0,
        'skills': bool(resume_data.skills),
        'projects': len(resume_data.projects) > 0,
        'experience': len(resume_data.experience) > 0,
    }

    overall_score = sum(health.values()) / len(health) * 100

    return {
        'health': health,
        'overall_score': overall_score,
        'suggestions': content_optimizer.get_optimization_suggestions(resume_data.dict())
    }


@router.get("/templates")
async def get_templates():
    """
    Get available LaTeX templates.
    """
    templates = [
        {
            "id": "ats-one-page",
            "name": "ATS One-Page",
            "description": "ATS-friendly minimalist template optimized for one page",
            "preview": "/templates/ats-one-page/preview.png"
        },
        {
            "id": "modern-clean",
            "name": "Modern Clean",
            "description": "Modern design with clean layout and professional styling",
            "preview": "/templates/modern-clean/preview.png"
        }
    ]
    return templates


@router.post("/latex-source")
async def download_latex_source(resume_data: ResumeData, template: str = "ats-one-page"):
    """
    Generate and download LaTeX source code.
    """
    # Convert to dict and escape
    data_dict = resume_data.dict()
    escaped_data = escape_resume_data(data_dict)

    # Generate LaTeX
    latex_code = latex_generator.generate_latex(f'{template}/resume.tex', escaped_data)

    # Return as downloadable file
    filename = f"{resume_data.personal.name.replace(' ', '_')}_Resume.tex"

    return Response(
        content=latex_code,
        media_type="application/x-tex",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )


@router.post("/ats-check")
async def check_ats_compatibility(resume_data: ResumeData):
    """
    Check resume for ATS compatibility.
    """
    data_dict = resume_data.dict()
    report = ats_checker.check_ats_compatibility(data_dict)
    return report


@router.post("/analyze-job")
async def analyze_job_description(request: JobDescriptionRequest):
    """
    Analyze a job description to extract key information.
    """
    analysis = job_analyzer.analyze_job_description(request.job_description)
    return analysis


@router.post("/compare-job")
async def compare_with_job(request: JobComparisonRequest):
    """
    Compare resume with job description and provide gap analysis.
    """
    comparison = job_analyzer.compare_with_resume(request.job_description, request.resume_data)
    return comparison


@router.post("/improve-bullets")
async def improve_bullets(request: BulletImprovementRequest):
    """
    Improve bullet points using AI techniques.
    """
    improvement = ai_improver.improve_bullets(request.bullets)
    return improvement


@router.post("/check-grammar")
async def check_grammar(request: GrammarCheckRequest):
    """
    Check grammar and spelling in resume.
    """
    grammar_report = grammar_checker.check_resume_grammar(request.resume_data)
    return grammar_report


@router.post("/suggest-keywords")
async def suggest_keywords(request: KeywordSuggestionRequest):
    """
    Suggest keywords to add to resume.
    """
    suggestions = keyword_suggester.suggest_keywords(
        request.resume_data,
        request.industry,
        request.role
    )
    return suggestions


@router.post("/tailor-resume")
async def tailor_resume(request: ResumeTailorRequest):
    """
    Tailor resume for a specific job description.
    """
    tailored = job_tailor.tailor_resume(request.resume_data, request.job_description)
    return tailored


@router.post("/generate-summary")
async def generate_tailored_summary(request: SummaryGenerationRequest):
    """
    Generate a tailored professional summary for a job.
    """
    summary = job_tailor.generate_tailored_summary(request.resume_data, request.job_description)
    return {"summary": summary}
