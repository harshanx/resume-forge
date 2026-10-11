from typing import Dict, List
import re


class JobAnalyzer:
    """Analyze job descriptions to extract key information."""

    def __init__(self):
        # Common technical skills to look for (order matters - longer phrases first)
        self.technical_skills = [
            "kubernetes", "docker", "terraform", "ansible",
            "machine learning", "deep learning", "data science", "nlp",
            "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
            "node.js", "django", "flask", "spring", "express", "fastapi",
            "postgresql", "mongodb", "mysql", "redis", "nosql", "sql",
            "amazon web services", "aws", "azure", "google cloud platform", "gcp",
            "ci/cd", "jenkins", "github", "gitlab", "git",
            "typescript", "javascript", "java", "python", "react", "angular", "vue",
            "linux", "bash", "shell", "networking", "security", "ai"
        ]

        # Common soft skills
        self.soft_skills = [
            "communication", "leadership", "teamwork", "problem solving",
            "critical thinking", "adaptability", "time management",
            "collaboration", "creativity", "analytical", "organizational"
        ]

        # Education keywords
        self.education_keywords = [
            "bachelor", "master", "phd", "degree", "computer science",
            "engineering", "mathematics", "statistics", "mba"
        ]

    def analyze_job_description(self, job_description: str) -> Dict:
        """
        Analyze job description and extract key information.
        """
        description_lower = job_description.lower()

        analysis = {
            "required_skills": self._extract_skills(description_lower),
            "soft_skills": self._extract_soft_skills(description_lower),
            "education_requirements": self._extract_education(description_lower),
            "experience_level": self._extract_experience_level(description_lower),
            "key_responsibilities": self._extract_responsibilities(job_description),
            "matching_keywords": self._extract_all_keywords(description_lower),
            "summary": self._generate_summary(job_description)
        }

        return analysis

    def _extract_skills(self, text: str) -> List[str]:
        """Extract technical skills from job description."""
        found_skills = []
        text_lower = text.lower()

        for skill in self.technical_skills:
            # Case-insensitive search
            if skill.lower() in text_lower:
                # Capitalize properly for display
                if len(skill.split()) > 1:
                    # Multi-word skill - capitalize each word
                    display_name = ' '.join(word.capitalize() for word in skill.split())
                else:
                    # Single word - capitalize
                    display_name = skill.capitalize()
                found_skills.append(display_name)

        return found_skills

    def _extract_soft_skills(self, text: str) -> List[str]:
        """Extract soft skills from job description."""
        found_skills = []
        for skill in self.soft_skills:
            if skill.lower() in text:
                found_skills.append(skill.capitalize())
        return found_skills

    def _extract_education(self, text: str) -> List[str]:
        """Extract education requirements."""
        found = []
        for keyword in self.education_keywords:
            if keyword.lower() in text:
                found.append(keyword.capitalize())
        return found

    def _extract_experience_level(self, text: str) -> str:
        """Extract experience level from job description."""
        text_lower = text.lower()

        # Check for specific year ranges first - pattern for "X+ years" or "X years"
        match_plus = re.search(r'(\d+)\+\s*years', text_lower)
        match_plain = re.search(r'(\d+)\s*years', text_lower)

        if match_plus:
            years = int(match_plus.group(1))
            if years >= 5:
                return f"Senior Level ({years}+ years)"
            elif years >= 3:
                return f"Mid Level ({years}+ years)"
            else:
                return f"Entry Level ({years}+ years)"
        elif match_plain:
            years = int(match_plain.group(1))
            if years >= 10:
                return f"Senior Level ({years}+ years)"
            elif years >= 5:
                return f"Senior Level ({years}+ years)"
            elif years >= 3:
                return f"Mid Level ({years}+ years)"
            else:
                return f"Entry Level ({years}+ years)"

        # Check for specific patterns
        if "entry level" in text_lower or "junior" in text_lower or "0-2 years" in text_lower or "1-2 years" in text_lower:
            return "Entry Level (0-2 years)"
        elif "mid level" in text_lower or "mid-senior" in text_lower or "3-5 years" in text_lower or "3-7 years" in text_lower:
            return "Mid Level (3-5 years)"
        elif "senior" in text_lower or "lead" in text_lower or "principal" in text_lower or "staff" in text_lower:
            return "Senior Level (5+ years)"
        elif "intern" in text_lower or "co-op" in text_lower:
            return "Internship"
        else:
            return "Not specified"

    def _extract_responsibilities(self, text: str) -> List[str]:
        """Extract key responsibilities from job description."""
        responsibilities = []

        # Look for bullet points or numbered lists
        lines = text.split('\n')
        for line in lines:
            line = line.strip()
            # Check for bullet points
            if line.startswith(('•', '-', '*', '○')) or line.startswith(('1.', '2.', '3.', '4.', '5.')):
                responsibilities.append(line[2:].strip())

        # If no bullet points found, look for sentences with action verbs
        if not responsibilities:
            action_verbs = ["develop", "design", "implement", "create", "manage",
                          "lead", "build", "coordinate", "analyze", "optimize"]
            sentences = re.split(r'[.!?]', text)
            for sentence in sentences:
                if any(verb in sentence.lower() for verb in action_verbs):
                    responsibilities.append(sentence.strip())

        return responsibilities[:10]  # Return top 10 responsibilities

    def _extract_all_keywords(self, text: str) -> List[str]:
        """Extract all relevant keywords."""
        keywords = []

        # Combine all skill lists
        all_skills = self.technical_skills + self.soft_skills + self.education_keywords
        for skill in all_skills:
            if skill.lower() in text:
                keywords.append(skill.capitalize())

        return list(set(keywords))  # Remove duplicates

    def _generate_summary(self, text: str) -> str:
        """Generate a brief summary of the job description."""
        # Extract first 200 characters as summary
        summary = text[:200].strip()
        if len(text) > 200:
            summary += "..."
        return summary

    def compare_with_resume(self, job_description: str, resume_data: Dict) -> Dict:
        """
        Compare job description with resume and provide gap analysis.
        """
        job_analysis = self.analyze_job_description(job_description)

        # Extract resume skills
        resume_skills = []
        skills = resume_data.get("skills", {})
        if skills.get("technical"):
            resume_skills.extend([s.strip().lower() for s in skills["technical"].split(",")])
        if skills.get("professional"):
            resume_skills.extend([s.strip().lower() for s in skills["professional"].split(",")])

        # Extract experience bullets
        resume_experience = []
        for exp in resume_data.get("experience", []):
            resume_experience.extend([b.lower() for b in exp.get("bullets", [])])

        # Extract project bullets
        resume_projects = []
        for proj in resume_data.get("projects", []):
            resume_projects.extend([b.lower() for b in proj.get("bullets", [])])

        resume_text = " ".join(resume_skills + resume_experience + resume_projects)

        # Compare skills - use the skills from job analysis
        required_skills = job_analysis["required_skills"]
        required_skills_lower = [s.lower() for s in required_skills]

        matched_skills = []
        missing_skills = []

        for skill, skill_lower in zip(required_skills, required_skills_lower):
            # Check if skill (case-insensitive) is in resume text
            if skill_lower in resume_text:
                matched_skills.append(skill)
            else:
                missing_skills.append(skill)

        # Calculate match percentage
        if required_skills:
            match_percentage = (len(matched_skills) / len(required_skills)) * 100
        else:
            match_percentage = 0

        return {
            "job_summary": job_analysis["summary"],
            "required_skills": required_skills,
            "matched_skills": matched_skills,
            "missing_skills": missing_skills,
            "match_percentage": round(match_percentage, 2),
            "recommendations": self._generate_recommendations(missing_skills),
            "experience_level": job_analysis["experience_level"]
        }

    def _generate_recommendations(self, missing_skills: List[str]) -> List[str]:
        """Generate recommendations based on missing skills."""
        recommendations = []

        if missing_skills:
            recommendations.append(f"Add these skills to your resume: {', '.join(missing_skills)}")
            recommendations.append("Consider highlighting relevant projects that demonstrate these skills")
            recommendations.append("Take online courses or certifications to learn missing skills")

        return recommendations
