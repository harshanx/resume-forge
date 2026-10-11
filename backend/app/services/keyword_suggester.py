from typing import List, Dict
import re


class KeywordSuggester:
    """Suggest relevant keywords for resume based on industry and role."""

    def __init__(self):
        # Industry-specific keywords
        self.industry_keywords = {
            "software_engineering": [
                "python", "java", "javascript", "react", "node.js", "sql",
                "api", "rest", "graphql", "microservices", "cloud",
                "docker", "kubernetes", "ci/cd", "agile", "scrum",
                "git", "github", "testing", "debugging", "algorithms",
                "data structures", "system design", "performance optimization"
            ],
            "data_science": [
                "python", "r", "sql", "machine learning", "deep learning",
                "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
                "data visualization", "statistics", "nlp", "computer vision",
                "a/b testing", "data mining", "predictive modeling"
            ],
            "product_management": [
                "agile", "scrum", "roadmap", "user research", "data-driven",
                "stakeholder management", "metrics", "kpi", "analytics",
                "cross-functional", "prioritization", "strategy", "market research"
            ],
            "web_development": [
                "html", "css", "javascript", "react", "vue", "angular",
                "node.js", "express", "frontend", "backend", "full-stack",
                "responsive design", "ui/ux", "accessibility", "performance"
            ],
            "devops": [
                "docker", "kubernetes", "aws", "azure", "gcp", "ci/cd",
                "jenkins", "terraform", "ansible", "linux", "shell scripting",
                "monitoring", "logging", "infrastructure as code", "automation"
            ]
        }

        # Role-specific keywords
        self.role_keywords = {
            "frontend": ["react", "vue", "angular", "javascript", "typescript", "css", "html", "ui", "ux"],
            "backend": ["python", "java", "node.js", "api", "database", "sql", "nosql", "microservices"],
            "fullstack": ["react", "node.js", "python", "javascript", "sql", "api", "frontend", "backend"],
            "data_scientist": ["python", "machine learning", "tensorflow", "pandas", "statistics", "nlp"],
            "devops_engineer": ["docker", "kubernetes", "aws", "ci/cd", "terraform", "linux", "jenkins"]
        }

        # Soft skills keywords
        self.soft_skills = [
            "leadership", "communication", "teamwork", "problem solving",
            "critical thinking", "adaptability", "time management",
            "collaboration", "creativity", "analytical", "organization",
            "mentoring", "presentation", "negotiation", "strategic thinking"
        ]

    def suggest_keywords(self, resume_data: Dict, industry: str = None, role: str = None) -> Dict:
        """
        Suggest keywords to add to resume based on industry and role.
        """
        # Extract current keywords from resume
        current_keywords = self._extract_current_keywords(resume_data)

        # Get industry keywords
        industry_keywords = []
        if industry and industry.lower() in self.industry_keywords:
            industry_keywords = self.industry_keywords[industry.lower()]
        else:
            # If no industry specified, suggest from all industries
            industry_keywords = list(set(k for keywords in self.industry_keywords.values() for k in keywords))

        # Get role keywords
        role_keywords = []
        if role and role.lower() in self.role_keywords:
            role_keywords = self.role_keywords[role.lower()]

        # Combine all suggested keywords
        all_suggested = list(set(industry_keywords + role_keywords + self.soft_skills))

        # Find missing keywords
        missing_keywords = [k for k in all_suggested if k.lower() not in current_keywords]

        # Prioritize keywords
        prioritized = self._prioritize_keywords(missing_keywords, industry, role)

        return {
            "current_keywords": current_keywords,
            "suggested_keywords": prioritized[:20],  # Top 20 suggestions
            "missing_count": len(missing_keywords),
            "keyword_coverage": len(current_keywords) / len(all_suggested) * 100 if all_suggested else 0,
            "industry": industry or "not specified",
            "role": role or "not specified"
        }

    def _extract_current_keywords(self, resume_data: Dict) -> List[str]:
        """Extract keywords from current resume."""
        keywords = set()

        # From skills
        skills = resume_data.get("skills", {})
        if skills.get("technical"):
            keywords.update([k.strip().lower() for k in skills["technical"].split(",")])
        if skills.get("professional"):
            keywords.update([k.strip().lower() for k in skills["professional"].split(",")])

        # From experience bullets
        for exp in resume_data.get("experience", []):
            for bullet in exp.get("bullets", []):
                words = re.findall(r'\b\w+\b', bullet.lower())
                keywords.update(words)

        # From project bullets
        for project in resume_data.get("projects", []):
            for bullet in project.get("bullets", []):
                words = re.findall(r'\b\w+\b', bullet.lower())
                keywords.update(words)

        return list(keywords)

    def _prioritize_keywords(self, keywords: List[str], industry: str, role: str) -> List[str]:
        """Prioritize keywords based on relevance."""
        prioritized = {}

        for keyword in keywords:
            score = 0

            # Role-specific keywords get highest priority
            if role and keyword in self.role_keywords.get(role.lower(), []):
                score += 10

            # Industry-specific keywords get high priority
            if industry and keyword in self.industry_keywords.get(industry.lower(), []):
                score += 8

            # Soft skills get medium priority
            if keyword in self.soft_skills:
                score += 5

            prioritized[keyword] = score

        # Sort by score
        sorted_keywords = sorted(prioritized.items(), key=lambda x: x[1], reverse=True)
        return [k[0] for k in sorted_keywords]

    def get_trending_keywords(self, year: int = 2024) -> List[str]:
        """Get trending keywords for the current year."""
        trending = [
            "ai", "machine learning", "cloud computing", "cybersecurity",
            "data science", "devops", "kubernetes", "microservices",
            "react", "python", "blockchain", "edge computing",
            "sustainability", "remote work", "agile", "automation"
        ]
        return trending

    def analyze_keyword_density(self, resume_data: Dict) -> Dict:
        """Analyze keyword density in resume."""
        all_text = self._extract_all_text(resume_data)
        words = re.findall(r'\b\w+\b', all_text.lower())

        # Count word frequency
        word_count = {}
        for word in words:
            if len(word) > 3:  # Ignore short words
                word_count[word] = word_count.get(word, 0) + 1

        # Get top keywords
        top_keywords = sorted(word_count.items(), key=lambda x: x[1], reverse=True)[:20]

        return {
            "total_words": len(words),
            "unique_words": len(set(words)),
            "top_keywords": [{"word": k, "count": v} for k, v in top_keywords],
            "keyword_density": len(set(words)) / len(words) * 100 if words else 0
        }

    def _extract_all_text(self, resume_data: Dict) -> str:
        """Extract all text from resume data."""
        text_parts = []

        personal = resume_data.get("personal", {})
        text_parts.extend([v for v in personal.values() if v])

        skills = resume_data.get("skills", {})
        text_parts.extend([v for v in skills.values() if v])

        for exp in resume_data.get("experience", []):
            text_parts.append(exp.get("job_title", ""))
            text_parts.append(exp.get("company", ""))
            text_parts.extend(exp.get("bullets", []))

        for project in resume_data.get("projects", []):
            text_parts.append(project.get("name", ""))
            text_parts.extend(project.get("bullets", []))

        text_parts.extend(resume_data.get("achievements", []))

        return " ".join(text_parts)
