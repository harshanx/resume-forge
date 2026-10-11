from typing import Dict, List


class ATSChecker:
    """Check resume for ATS compatibility."""

    def __init__(self):
        self.ats_keywords = [
            "python", "java", "javascript", "react", "node.js", "sql",
            "machine learning", "data analysis", "project management",
            "agile", "scrum", "git", "docker", "aws", "cloud",
            "leadership", "communication", "problem solving"
        ]

    def check_ats_compatibility(self, resume_data: Dict) -> Dict:
        """
        Check resume for ATS compatibility and return detailed report.
        """
        checks = {
            "contact_info": self._check_contact_info(resume_data),
            "education": self._check_education(resume_data),
            "skills": self._check_skills(resume_data),
            "experience": self._check_experience(resume_data),
            "formatting": self._check_formatting(resume_data),
            "keywords": self._check_keywords(resume_data),
            "length": self._check_length(resume_data),
        }

        # Calculate overall score
        total_checks = len(checks)
        passed_checks = sum(1 for check in checks.values() if check["passed"])
        overall_score = (passed_checks / total_checks) * 100

        return {
            "overall_score": overall_score,
            "checks": checks,
            "recommendations": self._get_recommendations(checks)
        }

    def _check_contact_info(self, resume_data: Dict) -> Dict:
        """Check if contact information is complete."""
        personal = resume_data.get("personal", {})
        passed = all([
            personal.get("name"),
            personal.get("email"),
            personal.get("phone")
        ])

        issues = []
        if not personal.get("name"):
            issues.append("Missing name")
        if not personal.get("email"):
            issues.append("Missing email")
        if not personal.get("phone"):
            issues.append("Missing phone number")

        return {
            "passed": passed,
            "score": 100 if passed else 0,
            "issues": issues,
            "message": "Contact information is complete" if passed else "Contact information is incomplete"
        }

    def _check_education(self, resume_data: Dict) -> Dict:
        """Check if education section is properly filled."""
        education = resume_data.get("education", [])
        passed = len(education) > 0

        issues = []
        if not education:
            issues.append("No education entries")

        for edu in education:
            if not edu.get("degree"):
                issues.append("Missing degree in education entry")
            if not edu.get("institution"):
                issues.append("Missing institution in education entry")
            if not edu.get("graduation_year"):
                issues.append("Missing graduation year in education entry")

        return {
            "passed": passed,
            "score": 100 if passed and not issues else 50,
            "issues": issues,
            "message": "Education section is complete" if passed and not issues else "Education section needs improvement"
        }

    def _check_skills(self, resume_data: Dict) -> Dict:
        """Check if skills section is present and detailed."""
        skills = resume_data.get("skills", {})
        technical = skills.get("technical", "")
        professional = skills.get("professional", "")

        passed = bool(technical or professional)
        issues = []

        if not technical:
            issues.append("Missing technical skills")
        if not professional:
            issues.append("Missing professional skills")

        # Check skill count
        skill_count = len(technical.split(",")) if technical else 0
        if skill_count < 3:
            issues.append("Add more technical skills (aim for 5-10)")

        return {
            "passed": passed,
            "score": 100 if passed and skill_count >= 3 else 50,
            "issues": issues,
            "message": "Skills section is comprehensive" if passed and skill_count >= 3 else "Skills section needs more detail"
        }

    def _check_experience(self, resume_data: Dict) -> Dict:
        """Check if experience section has bullet points."""
        experience = resume_data.get("experience", [])
        passed = len(experience) > 0

        issues = []
        if not experience:
            issues.append("No experience entries")

        for exp in experience:
            bullets = exp.get("bullets", [])
            if len(bullets) < 3:
                issues.append(f"Experience entry should have at least 3 bullet points (found {len(bullets)})")

        return {
            "passed": passed,
            "score": 100 if passed and not issues else 50,
            "issues": issues,
            "message": "Experience section is detailed" if passed and not issues else "Experience section needs more detail"
        }

    def _check_formatting(self, resume_data: Dict) -> Dict:
        """Check for ATS-friendly formatting issues."""
        issues = []

        # Check for special characters that might cause issues
        personal = resume_data.get("personal", {})
        for field, value in personal.items():
            if value and any(char in value for char in ["@", "#", "$", "%", "^", "&", "*"]):
                if field not in ["email", "linkedin", "github"]:
                    issues.append(f"Special characters in {field} field may cause ATS issues")

        passed = len(issues) == 0

        return {
            "passed": passed,
            "score": 100 if passed else 75,
            "issues": issues,
            "message": "Formatting is ATS-friendly" if passed else "Some formatting issues detected"
        }

    def _check_keywords(self, resume_data: Dict) -> Dict:
        """Check for relevant ATS keywords."""
        all_text = ""

        # Extract text from all sections
        skills = resume_data.get("skills", {})
        all_text += skills.get("technical", "") + " "
        all_text += skills.get("professional", "") + " "

        for exp in resume_data.get("experience", []):
            all_text += " ".join(exp.get("bullets", [])) + " "

        for project in resume_data.get("projects", []):
            all_text += " ".join(project.get("bullets", [])) + " "

        all_text = all_text.lower()

        # Check for ATS keywords
        found_keywords = [kw for kw in self.ats_keywords if kw.lower() in all_text]
        keyword_score = (len(found_keywords) / len(self.ats_keywords)) * 100

        passed = len(found_keywords) >= 5
        issues = []

        if len(found_keywords) < 5:
            issues.append(f"Add more industry keywords (found {len(found_keywords)}/{len(self.ats_keywords)})")

        return {
            "passed": passed,
            "score": keyword_score,
            "issues": issues,
            "found_keywords": found_keywords,
            "message": f"Found {len(found_keywords)} relevant keywords" if found_keywords else "No relevant keywords found"
        }

    def _check_length(self, resume_data: Dict) -> Dict:
        """Check if resume content is appropriate length."""
        # Count total words
        total_words = 0

        personal = resume_data.get("personal", {})
        total_words += len(personal.get("name", "").split())
        total_words += len(personal.get("location", "").split())

        for exp in resume_data.get("experience", []):
            total_words += len(exp.get("job_title", "").split())
            total_words += len(exp.get("company", "").split())
            total_words += sum(len(b.split()) for b in exp.get("bullets", []))

        for project in resume_data.get("projects", []):
            total_words += len(project.get("name", "").split())
            total_words += len(project.get("technologies", "").split())
            total_words += sum(len(b.split()) for b in project.get("bullets", []))

        # Ideal range: 300-500 words for one-page resume
        passed = 300 <= total_words <= 500
        issues = []

        if total_words < 300:
            issues.append(f"Resume is too short ({total_words} words). Add more detail to reach 300-500 words.")
        elif total_words > 500:
            issues.append(f"Resume is too long ({total_words} words). Aim for 300-500 words for one page.")

        return {
            "passed": passed,
            "score": 100 if passed else 50,
            "issues": issues,
            "word_count": total_words,
            "message": "Resume length is optimal" if passed else "Resume length needs adjustment"
        }

    def _get_recommendations(self, checks: Dict) -> List[str]:
        """Generate recommendations based on check results."""
        recommendations = []

        for check_name, check_result in checks.items():
            if not check_result["passed"]:
                recommendations.extend(check_result["issues"])

        return recommendations
