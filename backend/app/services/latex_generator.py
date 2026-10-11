from jinja2 import Environment, FileSystemLoader
import os
from typing import Dict


class LatexGenerator:
    def __init__(self, template_dir: str = None):
        if template_dir is None:
            # Get the project root (go up from backend/app/services to project root)
            project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__))))
            template_dir = os.path.join(project_root, 'latex/templates')
        self.env = Environment(
            loader=FileSystemLoader(template_dir),
            autoescape=False,
            # Use different delimiters to avoid conflicts with LaTeX %
            variable_start_string='[[',
            variable_end_string=']]',
            block_start_string='[%',
            block_end_string='%]',
            comment_start_string='[#',
            comment_end_string='#]'
        )
    
    def generate_latex(self, template_name: str, data: Dict) -> str:
        """
        Generate LaTeX code from template and data.
        """
        template = self.env.get_template(template_name)
        latex_code = template.render(**data)
        return latex_code
    
    def generate_resume_latex(self, resume_data: Dict) -> str:
        """
        Generate resume LaTeX using the ATS one-page template.
        """
        return self.generate_latex('ats-one-page/resume.tex', resume_data)
