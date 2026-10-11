import os
import subprocess
import tempfile
from typing import Optional
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from xml.sax.saxutils import escape as xml_escape


class PDFGenerator:
    def __init__(self, temp_dir: str = None):
        if temp_dir is None:
            temp_dir = os.path.join(os.path.dirname(__file__), '../../temp')
        self.temp_dir = temp_dir
        os.makedirs(temp_dir, exist_ok=True)
        self.use_latex = self._check_pdflatex()

    def _check_pdflatex(self) -> bool:
        """Check if pdflatex is available."""
        for compiler in ('xelatex', 'pdflatex'):
            try:
                result = subprocess.run([compiler, '--version'],
                                      capture_output=True,
                                      timeout=5)
                if result.returncode == 0:
                    return compiler
            except (FileNotFoundError, subprocess.TimeoutExpired):
                continue
        return None

    def compile_latex(self, latex_code: str, output_filename: str = "resume", resume_data: dict = None) -> Optional[bytes]:
        """
        Compile LaTeX code to PDF using pdflatex.
        Falls back to reportlab if pdflatex is not available.

        Returns PDF bytes or None if compilation fails.
        """
        if self.use_latex:
            return self._compile_with_latex(latex_code, output_filename)
        else:
            print("pdflatex not found, using reportlab fallback")
            if resume_data:
                return self._generate_pdf_from_data(resume_data)
            return self._compile_with_reportlab(latex_code, output_filename)

    def _compile_with_latex(self, latex_code: str, output_filename: str) -> Optional[bytes]:
        """Compile using XeLaTeX or pdfLaTeX, depending on availability."""
        compiler = self.use_latex
        with tempfile.TemporaryDirectory(dir=self.temp_dir) as temp_path:
            tex_file = os.path.join(temp_path, f"{output_filename}.tex")
            pdf_file = os.path.join(temp_path, f"{output_filename}.pdf")

            with open(tex_file, 'w', encoding='utf-8') as f:
                f.write(latex_code)

            for _ in range(2):
                try:
                    result = subprocess.run(
                        [compiler, '-interaction=nonstopmode', '-halt-on-error', tex_file],
                        cwd=temp_path,
                        capture_output=True,
                        text=True,
                        timeout=30
                    )

                    if result.returncode != 0:
                        print(f"{compiler} compilation error: {result.stdout}\n{result.stderr}")
                        return None

                except subprocess.TimeoutExpired:
                    print("LaTeX compilation timed out")
                    return None
                except FileNotFoundError:
                    print(f"{compiler} not found")
                    return None

            if os.path.exists(pdf_file):
                with open(pdf_file, 'rb') as f:
                    pdf_bytes = f.read()
                return pdf_bytes

            return None

    def _compile_with_reportlab(self, latex_code: str, output_filename: str) -> Optional[bytes]:
        """Fallback: Generate resume PDF using reportlab when pdflatex is unavailable."""
        try:
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.enums import TA_LEFT, TA_CENTER
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
            from reportlab.lib.units import inch
            import io
            import re

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter,
                                  rightMargin=0.75*inch, leftMargin=0.75*inch,
                                  topMargin=0.6*inch, bottomMargin=0.6*inch)

            story = []
            styles = getSampleStyleSheet()

            # Create custom styles
            header_style = ParagraphStyle(
                'Header',
                parent=styles['Heading1'],
                fontName='Helvetica-Bold',
                fontSize=16,
                alignment=TA_CENTER,
                spaceAfter=12
            )

            section_style = ParagraphStyle(
                'Section',
                parent=styles['Heading2'],
                fontName='Helvetica-Bold',
                fontSize=12,
                spaceAfter=6,
                spaceBefore=12,
                leftIndent=0
            )

            normal_style = ParagraphStyle(
                'Normal',
                parent=styles['Normal'],
                fontName='Helvetica',
                fontSize=10,
                spaceAfter=6,
                leftIndent=0
            )

            contact_style = ParagraphStyle(
                'Contact',
                parent=styles['Normal'],
                fontName='Helvetica',
                fontSize=9,
                alignment=TA_CENTER,
                spaceAfter=12
            )

            bullet_style = ParagraphStyle(
                'Bullet',
                parent=styles['Normal'],
                fontName='Helvetica',
                fontSize=10,
                spaceAfter=3,
                leftIndent=20,
                bulletIndent=10
            )

            # Extract data from rendered LaTeX
            # Extract name
            name_match = re.search(r'{\Large\bfseries\s+([^\n]+)', latex_code)
            name = name_match.group(1).strip() if name_match else "Your Name"

            # Extract contact info from the small section
            contact_parts = []
            contact_pattern = r'\[\%\s*if\s+phone\s*\%\]\[\[\s*phone\s*\]\]\[\%\s*endif\s*\]'
            phone_match = re.search(phone_pattern, latex_code)
            if phone_match:
                # Look for actual phone number in the rendered content
                phone_num = re.search(r'[\d\-\+\(\)\s]{10,}', latex_code)
                if phone_num:
                    contact_parts.append(phone_num.group())

            # Extract email
            email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', latex_code)
            if email_match:
                contact_parts.append(email_match.group())

            # Extract LinkedIn
            linkedin_match = re.search(r'linkedin\.com/[^\s\}]+', latex_code)
            if linkedin_match:
                contact_parts.append(linkedin_match.group())

            # Extract GitHub
            github_match = re.search(r'github\.com/[^\s\}]+', latex_code)
            if github_match:
                contact_parts.append(github_match.group())

            contact_info = ' • '.join(contact_parts) if contact_parts else ""

            # Build PDF
            story.append(Paragraph(name, header_style))
            if contact_info:
                story.append(Paragraph(contact_info, contact_style))
            story.append(Spacer(1, 12))

            # Extract and add sections
            section_pattern = r'\\section\{([^}]+)\}(.*?)(?=\\section\{|\\end\{document\})'
            for match in re.finditer(section_pattern, latex_code, re.DOTALL):
                section_name = match.group(1)
                section_content = match.group(2)

                # Section header
                story.append(Paragraph(section_name.upper(), section_style))

                # Parse content
                lines = section_content.strip().split('\n')
                for line in lines:
                    line = line.strip()
                    if line and not line.startswith('\\') and not line.startswith('%') and not line.startswith('['):
                        # Clean up LaTeX formatting
                        line = re.sub(r'\\[a-zA-Z]+\{([^}]+)\}', r'\1', line)
                        line = re.sub(r'\\[a-zA-Z]+', '', line)
                        line = re.sub(r'\{|\}', '', line)
                        line = line.replace(r'\\', '')
                        line = line.replace(r'\hfill', ' - ')
                        line = line.strip()

                        if line:
                            # Check if it's a bullet point
                            if line.startswith(r'\item'):
                                line = line.replace(r'\item', '').strip()
                                story.append(Paragraph(f"• {line}", bullet_style))
                            else:
                                story.append(Paragraph(line, normal_style))

            doc.build(story)
            pdf_bytes = buffer.getvalue()
            buffer.close()
            return pdf_bytes

        except Exception as e:
            print(f"Reportlab PDF generation failed: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def compile_latex_to_file(self, latex_code: str, output_path: str) -> bool:
        """
        Compile LaTeX code and save to specific file path.
        """
        pdf_bytes = self.compile_latex(latex_code)
        if pdf_bytes:
            os.makedirs(os.path.dirname(output_path), exist_ok=True)
            with open(output_path, 'wb') as f:
                f.write(pdf_bytes)
            return True
        return False

    def _generate_pdf_from_data(self, resume_data: dict) -> Optional[bytes]:
        """Generate PDF directly from resume data using ReportLab."""
        try:
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.enums import TA_LEFT, TA_CENTER
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
            from reportlab.lib.units import inch
            import io

            buffer = io.BytesIO()
            doc = SimpleDocTemplate(buffer, pagesize=letter,
                                  rightMargin=0.75*inch, leftMargin=0.75*inch,
                                  topMargin=0.6*inch, bottomMargin=0.6*inch)

            story = []
            styles = getSampleStyleSheet()

            # Create custom styles
            header_style = ParagraphStyle(
                'Header',
                parent=styles['Heading1'],
                fontName='Helvetica-Bold',
                fontSize=16,
                alignment=TA_CENTER,
                spaceAfter=12
            )

            section_style = ParagraphStyle(
                'Section',
                parent=styles['Heading2'],
                fontName='Helvetica-Bold',
                fontSize=12,
                spaceAfter=6,
                spaceBefore=12,
                leftIndent=0
            )

            normal_style = ParagraphStyle(
                'Normal',
                parent=styles['Normal'],
                fontName='Helvetica',
                fontSize=10,
                spaceAfter=6,
                leftIndent=0
            )

            contact_style = ParagraphStyle(
                'Contact',
                parent=styles['Normal'],
                fontName='Helvetica',
                fontSize=9,
                alignment=TA_CENTER,
                spaceAfter=12
            )

            bullet_style = ParagraphStyle(
                'Bullet',
                parent=styles['Normal'],
                fontName='Helvetica',
                fontSize=10,
                spaceAfter=3,
                leftIndent=20,
                bulletIndent=10
            )

            # Extract personal info
            personal = resume_data.get('personal', {})
            name = personal.get('name', 'Your Name')
            phone = personal.get('phone', '')
            email = personal.get('email', '')
            linkedin = personal.get('linkedin', '')
            github = personal.get('github', '')
            location = personal.get('location', '')

            # Build contact info
            contact_parts = []
            if phone:
                contact_parts.append(phone)
            if email:
                contact_parts.append(email)
            if linkedin:
                contact_parts.append(linkedin)
            if github:
                contact_parts.append(github)
            contact_info = ' • '.join(contact_parts)

            # Add header
            story.append(Paragraph(name, header_style))
            if contact_info:
                story.append(Paragraph(contact_info, contact_style))
            if location:
                story.append(Paragraph(location, contact_style))
            story.append(Spacer(1, 12))

            # Education
            education = resume_data.get('education', [])
            if education:
                story.append(Paragraph("EDUCATION", section_style))
                for edu in education:
                    degree = edu.get('degree', '')
                    institution = edu.get('institution', '')
                    university = edu.get('university', '')
                    grad_year = edu.get('graduation_year', '')
                    cgpa = edu.get('cgpa', '')
                    percentage = edu.get('percentage', '')
                    specialization = edu.get('specialization', '')
                    grade_value = edu.get('grade_value', '')
                    grade_scale = edu.get('grade_scale', '')

                    line = f"<b>{degree}</b>"
                    if specialization:
                        line += f" in {specialization}"
                    if grad_year:
                        line += f" - {grad_year}"
                    story.append(Paragraph(line, normal_style))

                    if institution:
                        line = institution
                        if university:
                            line += f" | {university}"
                        story.append(Paragraph(line, normal_style))

                    if grade_value and grade_scale == 'percentile':
                        story.append(Paragraph(f"Percentile: {grade_value}%", normal_style))
                    elif grade_value and grade_scale in ('5', '10'):
                        story.append(Paragraph(f"CGPA: {grade_value}/{grade_scale}", normal_style))
                    elif cgpa or percentage:
                        line = ""
                        if cgpa:
                            line += f"CGPA: {cgpa} "
                        if percentage:
                            line += f"Percentage: {percentage}"
                        story.append(Paragraph(line, normal_style))
                    story.append(Spacer(1, 6))

            # Skills
            skills = resume_data.get('skills', {})
            if skills:
                story.append(Paragraph("CORE SKILLS", section_style))
                if skills.get('technical'):
                    story.append(Paragraph(f"<b>Technical Skills:</b> {skills['technical']}", normal_style))
                if skills.get('professional'):
                    story.append(Paragraph(f"<b>Professional Skills:</b> {skills['professional']}", normal_style))
                story.append(Spacer(1, 6))

            # Certifications
            certifications = resume_data.get('certifications', [])
            if certifications:
                story.append(Paragraph("CERTIFICATIONS", section_style))
                for cert in certifications:
                    name = cert.get('name', '')
                    organization = cert.get('organization', '')
                    date = cert.get('date', '')
                    cert_id = cert.get('certificate_id', '')

                    line = f"<b>{name}</b>"
                    if date:
                        line += f" - {date}"
                    story.append(Paragraph(line, normal_style))

                    if organization:
                        line = organization
                        if cert_id:
                            line += f" | ID: {cert_id}"
                        story.append(Paragraph(line, normal_style))
                    if cert.get('url'):
                        story.append(Paragraph(xml_escape(cert['url']), normal_style))
                    story.append(Spacer(1, 6))

            # Experience
            experience = resume_data.get('experience', [])
            if experience:
                story.append(Paragraph("INTERNSHIP EXPERIENCE", section_style))
                for exp in experience:
                    job_title = exp.get('job_title', '')
                    company = exp.get('company', '')
                    date = exp.get('date', '')
                    bullets = exp.get('bullets', [])

                    line = f"<b>{job_title}</b>"
                    if date:
                        line += f" - {date}"
                    story.append(Paragraph(line, normal_style))

                    if company:
                        story.append(Paragraph(company, normal_style))

                    for bullet in bullets:
                        story.append(Paragraph(f"• {bullet}", bullet_style))
                    story.append(Spacer(1, 6))

            # Projects
            projects = resume_data.get('projects', [])
            if projects:
                story.append(Paragraph("PROJECTS", section_style))
                for project in projects:
                    name = project.get('name', '')
                    technologies = project.get('technologies', '')
                    bullets = project.get('bullets', [])

                    line = f"<b>{name}</b>"
                    if technologies:
                        line += f" - {technologies}"
                    story.append(Paragraph(line, normal_style))
                    if project.get('github_url'):
                        story.append(Paragraph(xml_escape(project['github_url']), normal_style))

                    for bullet in bullets:
                        story.append(Paragraph(f"• {bullet}", bullet_style))
                    story.append(Spacer(1, 6))

            # Achievements
            achievements = resume_data.get('achievements', [])
            if achievements:
                story.append(Paragraph("ACHIEVEMENTS & ACTIVITIES", section_style))
                for achievement in achievements:
                    story.append(Paragraph(f"• {achievement}", bullet_style))

            doc.build(story)
            pdf_bytes = buffer.getvalue()
            buffer.close()
            return pdf_bytes

        except Exception as e:
            print(f"ReportLab PDF generation from data failed: {e}")
            import traceback
            traceback.print_exc()
            return None
