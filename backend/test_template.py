"""
Test script to validate LaTeX template with sample data.
Run this to verify the template compiles correctly.
"""

from app.schemas.resume import ResumeData
from app.services.latex_generator import LatexGenerator
from app.services.pdf_generator import PDFGenerator
from app.utils.latex_escape import escape_resume_data
import json

# Sample resume data matching your structure
sample_data = {
    "personal": {
        "name": "Harshan P V",
        "phone": "+91 9778566031",
        "email": "harshanpv3@gmail.com",
        "linkedin": "linkedin.com/in/harshan-p-v",
        "github": "github.com/harshanx",
        "location": "Malappuram, Kerala"
    },
    "education": [
        {
            "degree": "B.Tech in Computer Science and Engineering",
            "institution": "Government Engineering College, Sreekrishnapuram",
            "university": "APJ Abdul Kalam Technological University",
            "cgpa": "7.51 / 10",
            "percentage": None,
            "graduation_year": 2027
        },
        {
            "degree": "Higher Secondary - Computer Science",
            "institution": "Government Higher Secondary School, Kuttippuram",
            "university": None,
            "cgpa": None,
            "percentage": "97.08%",
            "graduation_year": 2023
        }
    ],
    "skills": {
        "technical": "Python, C++, JavaScript, Flutter, Firebase, Git",
        "professional": "Problem Solving, Team Coordination, Technical Documentation"
    },
    "experience": [
        {
            "job_title": "Software Engineer Intern",
            "company": "Tech Company",
            "date": "Jun 2024 - Aug 2024",
            "bullets": [
                "Tested Android accessibility application",
                "Found UI inconsistencies",
                "Created reproducible bug reports"
            ]
        }
    ],
    "projects": [
        {
            "name": "CollBus – Real-Time College Bus Tracking System",
            "technologies": "Flutter, Dart, Firebase",
            "bullets": [
                "Developed a cross-platform mobile application",
                "Configured secure driver-to-bus route mapping",
                "Designed intuitive passenger interfaces"
            ]
        },
        {
            "name": "Portfolio Website",
            "technologies": "React, Node.js, MongoDB",
            "bullets": [
                "Built responsive personal portfolio",
                "Implemented contact form with email notifications"
            ]
        }
    ],
    "certifications": [
        {
            "name": "Software Engineer Role Certification",
            "organization": "HackerRank",
            "date": "24 Sep 2026",
            "certificate_id": "0ED97FC20668"
        }
    ],
    "achievements": [
        "Participated in college hackathon",
        "Volunteer at coding club"
    ]
}

def test_template():
    print("Testing LaTeX Template Generation...")
    print("=" * 50)
    
    try:
        # Validate data structure
        resume_data = ResumeData(**sample_data)
        print("✓ Data validation passed")
        
        # Escape LaTeX special characters
        escaped_data = escape_resume_data(sample_data)
        print("✓ LaTeX escaping completed")
        
        # Generate LaTeX code
        latex_gen = LatexGenerator()
        latex_code = latex_gen.generate_resume_latex(escaped_data)
        print(f"✓ LaTeX code generated ({len(latex_code)} characters)")
        
        # Save LaTeX for manual inspection
        with open("test_resume.tex", "w", encoding="utf-8") as f:
            f.write(latex_code)
        print("✓ LaTeX saved to test_resume.tex")
        
        # Try to compile to PDF (requires pdflatex)
        print("\nAttempting PDF compilation...")
        pdf_gen = PDFGenerator()
        try:
            pdf_bytes = pdf_gen.compile_latex(latex_code)
            if pdf_bytes:
                with open("test_resume.pdf", "wb") as f:
                    f.write(pdf_bytes)
                print("✓ PDF generated successfully: test_resume.pdf")
                
                # Check page count
                from app.services.pdf_validator import PDFValidator
                validator = PDFValidator()
                is_one_page, page_count = validator.validate_one_page(pdf_bytes)
                print(f"✓ PDF page count: {page_count}")
                if is_one_page:
                    print("✓ PDF fits on one page")
                else:
                    print("⚠ PDF exceeds one page - optimization will be needed")
            else:
                print("✗ PDF compilation failed")
        except RuntimeError as e:
            print(f"⚠ PDF compilation skipped: {e}")
            print("  (Install TeX Live or use Docker to enable PDF generation)")
        
        print("\n" + "=" * 50)
        print("Template test completed successfully!")
        print("\nNext steps:")
        print("1. Review test_resume.tex to verify template structure")
        print("2. If pdflatex is installed, check test_resume.pdf")
        print("3. Start the backend: uvicorn app.main:app --reload")
        print("4. Test the API at http://localhost:8000/docs")
        
    except Exception as e:
        print(f"✗ Test failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_template()
