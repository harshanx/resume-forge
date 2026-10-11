from typing import Dict, List
import re


class JobTailor:
    """Tailor resume for specific job descriptions."""

    def __init__(self):
        pass

    def tailor_resume(self, resume_data: Dict, job_description: str) -> Dict:
        """
        Tailor resume data to match job description.
        """
        # Extract job requirements
        job_requirements = self._extract_job_requirements(job_description)

        # Analyze current resume
        current_skills = self._extract_skills(resume_data)

        # Identify gaps
        skill_gaps = self._identify_skill_gaps(job_requirements, current_skills)

        # Generate tailored suggestions
        tailored_suggestions = self._generate_tailored_suggestions(
            resume_data,
            job_requirements,
            skill_gaps
        )

        return {
            "job_requirements": job_requirements,
            "current_skills": current_skills,
            "skill_gaps": skill_gaps,
            "tailored_suggestions": tailored_suggestions,
            "match_score": self._calculate_match_score(job_requirements, current_skills)
        }

    def _extract_job_requirements(self, job_description: str) -> Dict:
        """Extract requirements from job description."""
        requirements = {
            "skills": [],
            "experience_level": "",
            "education": [],
            "keywords": []
        }

        text_lower = job_description.lower()

        # Common technical skills
        tech_skills = [
            "python", "java", "javascript", "react", "node.js", "sql",
            "aws", "docker", "kubernetes", "git", "agile", "scrum",
            "machine learning", "data science", "cloud", "api"
        ]

        for skill in tech_skills:
            if skill in text_lower:
                requirements["skills"].append(skill)

        # Experience level
        if "entry level" in text_lower or "junior" in text_lower:
            requirements["experience_level"] = "Entry Level"
        elif "mid level" in text_lower or "3-5 years" in text_lower:
            requirements["experience_level"] = "Mid Level"
        elif "senior" in text_lower or "5+ years" in text_lower:
            requirements["experience_level"] = "Senior"

        # Education
        if "bachelor" in text_lower:
            requirements["education"].append("Bachelor's degree")
        if "master" in text_lower:
            requirements["education"].append("Master's degree")
        if "phd" in text_lower:
            requirements["education"].append("PhD")

        # Extract keywords (words > 4 chars that appear multiple times)
        words = re.findall(r'\b\w{5,}\b', text_lower)
        word_count = {}
        for word in words:
            word_count[word] = word_count.get(word, 0) + 1

        # Get words that appear at least twice
        requirements["keywords"] = [w for w, c in word_count.items() if c >= 2]

        return requirements

    def _extract_skills(self, resume_data: Dict) -> List[str]:
        """Extract skills from resume."""
        skills = set()

        # From skills section
        skills_section = resume_data.get("skills", {})
        if skills_section.get("technical"):
            skills.update([s.strip().lower() for s in skills_section["technical"].split(",")])
        if skills_section.get("professional"):
            skills.update([s.strip().lower() for s in skills_section["professional"].split(",")])

        # From experience
        for exp in resume_data.get("experience", []):
            bullets = exp.get("bullets", [])
            for bullet in bullets:
                words = re.findall(r'\b\w+\b', bullet.lower())
                skills.update(words)

        # From projects
        for project in resume_data.get("projects", []):
            bullets = project.get("bullets", [])
            for bullet in bullets:
                words = re.findall(r'\b\w+\b', bullet.lower())
                skills.update(words)

        return list(skills)

    def _identify_skill_gaps(self, job_requirements: Dict, current_skills: List[str]) -> List[str]:
        """Identify skills that are missing from resume."""
        required_skills = [s.lower() for s in job_requirements["skills"]]
        current_skills_lower = [s.lower() for s in current_skills]

        gaps = []
        for skill in required_skills:
            if skill not in current_skills_lower:
                gaps.append(skill)

        return gaps

    def _generate_tailored_suggestions(
        self,
        resume_data: Dict,
        job_requirements: Dict,
        skill_gaps: List[str]
    ) -> List[str]:
        """Generate suggestions to tailor resume for the job."""
        suggestions = []

        # Suggest adding missing skills
        if skill_gaps:
            suggestions.append(f"Add these skills to your resume: {', '.join(skill_gaps)}")

        # Suggest highlighting relevant experience
        for skill in job_requirements["skills"]:
            if skill in self._extract_skills(resume_data):
                suggestions.append(f"Highlight your experience with {skill}")

        # Suggest reordering sections
        if job_requirements["experience_level"] == "Senior":
            suggestions.append("Consider placing experience section before education")
        elif job_requirements["experience_level"] == "Entry Level":
            suggestions.append("Consider placing education section before experience")

        # Suggest adding relevant projects
        if skill_gaps:
            suggestions.append("Consider adding projects that demonstrate the missing skills")

        # Suggest customizing summary
        suggestions.append("Customize your professional summary to include keywords from the job description")

        return suggestions

    def _calculate_match_score(self, job_requirements: Dict, current_skills: List[str]) -> float:
        """Calculate how well resume matches job requirements."""
        required_skills = [s.lower() for s in job_requirements["skills"]]
        current_skills_lower = [s.lower() for s in current_skills]

        if not required_skills:
            return 50.0  # Neutral score if no requirements

        matched = sum(1 for skill in required_skills if skill in current_skills_lower)
        return (matched / len(required_skills)) * 100

    def generate_tailored_summary(self, resume_data: Dict, job_description: str) -> str:
        """Generate a tailored professional summary."""
        job_reqs = self._extract_job_requirements(job_description)
        personal = resume_data.get("personal", {})
        name = personal.get("name", "Professional")

        # Get top 3 skills from job
        top_skills = job_reqs["skills"][:3]

        summary = f"{name} is a"
        if job_reqs["experience_level"]:
            summary += f" {job_reqs['experience_level'].lower()}"

        summary += " professional with expertise in "
        if top_skills:
            summary += ", ".join(top_skills[:2])
        else:
            summary += "software development"

        summary += ". Proven track record of delivering high-quality solutions and driving results."

        return summary
