from typing import List, Dict
import re


class AIImprover:
    """AI-powered resume improvement service."""

    def __init__(self):
        # Action verbs for bullet points
        self.action_verbs = [
            "developed", "designed", "implemented", "created", "built",
            "managed", "led", "coordinated", "analyzed", "optimized",
            "increased", "decreased", "improved", "reduced", "enhanced",
            "launched", "deployed", "maintained", "tested", "debugged",
            "engineered", "architected", "streamlined", "automated"
        ]

        # Quantitative indicators
        self.quantitative_words = [
            "increased", "decreased", "reduced", "improved", "enhanced",
            "optimized", "streamlined", "boosted", "grew", "expanded"
        ]

        # Weak words to avoid
        self.weak_words = [
            "responsible for", "helped", "assisted", "worked on",
            "participated in", "involved in", "did", "made"
        ]

    def improve_bullets(self, bullets: List[str]) -> Dict:
        """
        Improve bullet points using AI techniques.
        """
        improved_bullets = []
        suggestions = []

        for bullet in bullets:
            improved, bullet_suggestions = self._improve_single_bullet(bullet)
            improved_bullets.append(improved)
            suggestions.extend(bullet_suggestions)

        return {
            "original_bullets": bullets,
            "improved_bullets": improved_bullets,
            "suggestions": suggestions,
            "improvement_score": self._calculate_improvement_score(bullets, improved_bullets)
        }

    def _improve_single_bullet(self, bullet: str) -> tuple:
        """Improve a single bullet point."""
        improved = bullet
        suggestions = []

        # Check if bullet starts with action verb
        if not self._starts_with_action_verb(bullet):
            improved = self._add_action_verb(bullet)
            suggestions.append(f"Added action verb to: '{bullet}'")

        # Check for weak words
        for weak_word in self.weak_words:
            if weak_word in bullet.lower():
                improved = improved.replace(weak_word, self._get_stronger_phrase(weak_word))
                suggestions.append(f"Replaced weak phrase '{weak_word}' with stronger alternative")

        # Check for quantitative results
        if self._needs_quantitative(bullet):
            suggestions.append(f"Consider adding metrics to: '{bullet}'")

        # Ensure bullet starts with capital letter
        improved = improved[0].upper() + improved[1:] if improved else improved

        # Ensure bullet ends with period
        if improved and not improved.endswith('.'):
            improved += '.'

        return improved, suggestions

    def _starts_with_action_verb(self, text: str) -> bool:
        """Check if text starts with an action verb."""
        words = text.lower().split()
        if not words:
            return False
        return words[0] in [v.lower() for v in self.action_verbs]

    def _add_action_verb(self, text: str) -> str:
        """Add an appropriate action verb to the text."""
        # Simple heuristic - add "Developed" or "Implemented"
        if "design" in text.lower() or "create" in text.lower():
            return f"Designed {text}"
        elif "manage" in text.lower() or "lead" in text.lower():
            return f"Managed {text}"
        else:
            return f"Implemented {text}"

    def _get_stronger_phrase(self, weak_word: str) -> str:
        """Get a stronger alternative for weak phrases."""
        replacements = {
            "responsible for": "Led",
            "helped": "Collaborated on",
            "assisted": "Supported",
            "worked on": "Developed",
            "participated in": "Contributed to",
            "involved in": "Engaged in",
            "did": "Executed",
            "made": "Created"
        }
        return replacements.get(weak_word, weak_word)

    def _needs_quantitative(self, text: str) -> bool:
        """Check if bullet needs quantitative results."""
        # Check for numbers
        has_numbers = bool(re.search(r'\d+', text))
        # Check for percentage symbols
        has_percentage = '%' in text
        # Check for quantitative verbs
        has_quantitative_verb = any(verb in text.lower() for verb in self.quantitative_words)

        return has_quantitative_verb and not (has_numbers or has_percentage)

    def _calculate_improvement_score(self, original: List[str], improved: List[str]) -> float:
        """Calculate improvement score (0-100)."""
        if not original:
            return 0.0

        improvements = 0
        for orig, imp in zip(original, improved):
            if orig != imp:
                improvements += 1

        return (improvements / len(original)) * 100

    def suggest_metrics(self, bullet: str) -> List[str]:
        """Suggest appropriate metrics for a bullet point."""
        suggestions = []

        if "increase" in bullet.lower() or "improve" in bullet.lower():
            suggestions.append("Consider adding: Increased by X%")
            suggestions.append("Consider adding: Improved by X units")

        if "reduce" in bullet.lower() or "decrease" in bullet.lower():
            suggestions.append("Consider adding: Reduced by X%")
            suggestions.append("Consider adding: Saved X hours")

        if "develop" in bullet.lower() or "create" in bullet.lower():
            suggestions.append("Consider adding: Used by X users")
            suggestions.append("Consider adding: Deployed to production")

        if "manage" in bullet.lower() or "lead" in bullet.lower():
            suggestions.append("Consider adding: Led team of X people")
            suggestions.append("Consider adding: Managed budget of $X")

        return suggestions if suggestions else ["Consider adding specific numbers to quantify impact"]
