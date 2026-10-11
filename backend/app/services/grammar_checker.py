from typing import List, Dict
import re


class GrammarChecker:
    """Basic grammar and spelling checker for resumes."""

    def __init__(self):
        # Common grammar mistakes
        self.common_mistakes = {
            "their": "their/there/they're",
            "its": "its/it's",
            "your": "your/you're",
            "then": "then/than",
            "affect": "affect/effect",
            "complement": "complement/compliment",
            "principal": "principal/principle",
            "stationary": "stationary/stationery",
            "discreet": "discreet/discrete"
        }

        # Resume-specific errors
        self.resume_errors = [
            "i ",  # lowercase 'i'
            "i'm ",  # lowercase "i'm"
            "cant ",  # missing apostrophe
            "dont ",  # missing apostrophe
            "wont ",  # missing apostrophe
            "im ",  # missing apostrophe
        ]

    def _should_ignore(self, text: str) -> bool:
        """Check if text should be ignored (email, URL, phone, etc.)."""
        for pattern in self.ignore_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                return True
        return False

    def _remove_ignored_content(self, text: str) -> str:
        """Remove emails, URLs, and phone numbers from text before checking."""
        for pattern in self.ignore_patterns:
            text = re.sub(pattern, '', text, flags=re.IGNORECASE)
        return text

    # Common spelling mistakes
        self.spelling_mistakes = {
            "teh": "the",
            "recieve": "receive",
            "occured": "occurred",
            "seperate": "separate",
            "definately": "definitely",
            "goverment": "government",
            "accomodate": "accommodate",
            "necesary": "necessary",
            "begining": "beginning",
            "sucessful": "successful",
            "maintainance": "maintenance",
            "untill": "until",
            "wich": "which",
            "thier": "their",
            "could of": "could have",
            "would of": "would have",
            "should of": "should have",
            "alot": "a lot",
            "irregardless": "regardless",
            "supose": "suppose",
            "bussiness": "business",
            "occassion": "occasion",
            "belive": "believe",
            "acheive": "achieve",
            "agressive": "aggressive",
            "collegue": "colleague",
            "comittee": "committee",
            "concious": "conscious",
            "curiculum": "curriculum",
            "embarass": "embarrass",
            "existance": "existence",
            "gaurantee": "guarantee",
            "happend": "happened",
            "intresting": "interesting",
            "knowlege": "knowledge",
            "lisence": "license",
            "millenium": "millennium",
            "neccessary": "necessary",
            "noticable": "noticeable",
            "occurance": "occurrence",
            "persistance": "persistence",
            "phisically": "physically",
            "posession": "possession",
            "priviledge": "privilege",
            "profesion": "profession",
            "reccomend": "recommend",
            "recomend": "recommend",
            "refering": "referring",
            "relevent": "relevant",
            "repetitive": "repetitive",
            "resistence": "resistance",
            "sacrilegious": "sacrilegious",
            "scedule": "schedule",
            "sincerly": "sincerely",
            "succesful": "successful",
            "supercede": "supersede",
            "tendancy": "tendency",
            "tommorrow": "tomorrow",
            "truely": "truly",
            "unfortunatly": "unfortunately",
            "untill": "until",
            "unusal": "unusual",
            "wich": "which",
            "wierd": "weird",
            "zebra": "zebra"
        }

        # Patterns to ignore (emails, URLs, etc.)
        self.ignore_patterns = [
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',  # Email
            r'https?://[^\s]+',  # URLs
            r'www\.[^\s]+',  # www URLs
            r'linkedin\.com/[^\s]+',  # LinkedIn URLs
            r'github\.com/[^\s]+',  # GitHub URLs
            r'\+\d{1,3}[\s-]?\d{3,}',  # Phone numbers
        ]

    def check_grammar(self, text: str) -> Dict:
        """
        Check text for grammar and spelling issues.
        """
        errors = []
        warnings = []
        suggestions = []

        # Remove emails, URLs, phone numbers before checking
        clean_text = self._remove_ignored_content(text)

        # Check for common mistakes
        for word, alternatives in self.common_mistakes.items():
            if word in clean_text.lower():
                errors.append({
                    "type": "potential_error",
                    "word": word,
                    "message": f"Check if you meant: {alternatives}"
                })

        # Check for spelling mistakes
        for mistake, correction in self.spelling_mistakes.items():
            if mistake in clean_text.lower():
                errors.append({
                    "type": "spelling",
                    "word": mistake,
                    "message": f"Spelling mistake: '{mistake}' should be '{correction}'"
                })

        # Check for resume-specific errors
        for error in self.resume_errors:
            if error in clean_text.lower():
                errors.append({
                    "type": "capitalization",
                    "word": error.strip(),
                    "message": f"Should be capitalized: {error.strip().capitalize()}"
                })

        # Check for double spaces
        if "  " in text:
            errors.append({
                "type": "formatting",
                "message": "Remove double spaces"
            })

        # Check for sentence case (only on clean text, ignoring emails/URLs)
        sentences = re.split(r'[.!?]', clean_text)
        for sentence in sentences:
            sentence = sentence.strip()
            # Only check if it's a real sentence (has words, not just spaces)
            if sentence and len(sentence.split()) > 1 and sentence[0].islower():
                warnings.append({
                    "type": "capitalization",
                    "message": f"Sentence should start with capital letter: '{sentence}'"
                })

        # Check for missing periods at end of sentences
        for sentence in sentences:
            sentence = sentence.strip()
            if sentence and len(sentence) > 5 and not sentence.endswith('.'):
                suggestions.append({
                    "type": "punctuation",
                    "message": f"Consider adding period: '{sentence}'"
                })

        # Check bullet point formatting
        if text.startswith('-') or text.startswith('*'):
            suggestions.append({
                "type": "formatting",
                "message": "Consider using strong action verbs at the start of bullet points"
            })

        return {
            "has_errors": len(errors) > 0,
            "error_count": len(errors),
            "warning_count": len(warnings),
            "suggestion_count": len(suggestions),
            "errors": errors,
            "warnings": warnings,
            "suggestions": suggestions,
            "overall_score": self._calculate_score(errors, warnings, suggestions)
        }

    def check_resume_grammar(self, resume_data: Dict) -> Dict:
        """
        Check grammar across entire resume.
        """
        all_text = self._extract_all_text(resume_data)
        sections_checked = {}

        # Check personal info - skip grammar check for contact fields as they have specific formats
        personal = resume_data.get("personal", {})
        if personal:
            # Only check name and location, skip email, phone, linkedin, github
            personal_fields_to_check = []
            if personal.get("name"):
                personal_fields_to_check.append(personal["name"])
            if personal.get("location"):
                personal_fields_to_check.append(personal["location"])

            if personal_fields_to_check:
                personal_text = " ".join(personal_fields_to_check)
                result = self.check_grammar(personal_text)
                if result["has_errors"] or result["warning_count"] > 0:
                    sections_checked["personal"] = result

        # Check experience bullets
        experience = resume_data.get("experience", [])
        for i, exp in enumerate(experience):
            bullets = exp.get("bullets", [])
            for j, bullet in enumerate(bullets):
                result = self.check_grammar(bullet)
                if result["has_errors"] or result["warning_count"] > 0:
                    sections_checked[f"experience_{i}_bullet_{j}"] = result

        # Check project bullets
        projects = resume_data.get("projects", [])
        for i, project in enumerate(projects):
            bullets = project.get("bullets", [])
            for j, bullet in enumerate(bullets):
                result = self.check_grammar(bullet)
                if result["has_errors"] or result["warning_count"] > 0:
                    sections_checked[f"project_{i}_bullet_{j}"] = result

        # Check achievements
        achievements = resume_data.get("achievements", [])
        for i, achievement in enumerate(achievements):
            result = self.check_grammar(achievement)
            if result["has_errors"] or result["warning_count"] > 0:
                sections_checked[f"achievement_{i}"] = result

        total_errors = sum(s["error_count"] for s in sections_checked.values())
        total_warnings = sum(s["warning_count"] for s in sections_checked.values())

        return {
            "overall_score": self._calculate_score(
                [e for s in sections_checked.values() for e in s["errors"]],
                [w for s in sections_checked.values() for w in s["warnings"]],
                [s for s in sections_checked.values() for s in s["suggestions"]]
            ),
            "total_errors": total_errors,
            "total_warnings": total_warnings,
            "sections": sections_checked,
            "summary": self._generate_summary(total_errors, total_warnings)
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

    def _calculate_score(self, errors: List, warnings: List, suggestions: List) -> float:
        """Calculate grammar score (0-100)."""
        total_issues = len(errors) + len(warnings) + len(suggestions)
        if total_issues == 0:
            return 100.0

        # Errors are weighted more heavily
        weighted_score = 100 - (len(errors) * 10 + len(warnings) * 5 + len(suggestions) * 2)
        return max(0.0, min(100.0, weighted_score))

    def _generate_summary(self, errors: int, warnings: int) -> str:
        """Generate a summary of grammar check."""
        if errors == 0 and warnings == 0:
            return "Excellent! No grammar or spelling issues found."
        elif errors == 0:
            return f"Good! {warnings} warnings found. Review for minor improvements."
        elif errors <= 3:
            return f"Fair. {errors} errors and {warnings} warnings found. Please review."
        else:
            return f"Needs improvement. {errors} errors and {warnings} warnings found. Significant review needed."
