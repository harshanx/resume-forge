from typing import Dict, List
from copy import deepcopy


class ContentOptimizer:
    """
    Optimize resume content to fit on one page.
    Uses a hierarchy of optimizations:
    1. Reduce spacing
    2. Reduce bullet points
    3. Shorten descriptions
    4. Font size adjustment (last resort)
    """
    
    def __init__(self):
        self.optimization_level = 0
    
    def optimize(self, resume_data: Dict, level: int = 1) -> Dict:
        """
        Optimize resume data based on level.
        """
        self.optimization_level = level
        data = deepcopy(resume_data)
        
        if level >= 1:
            data = self._reduce_bullets(data)
        
        if level >= 2:
            data = self._reduce_projects(data)
        
        if level >= 3:
            data = self._reduce_experience(data)
        
        if level >= 4:
            data = self._reduce_achievements(data)
        
        return data
    
    def _reduce_bullets(self, data: Dict) -> Dict:
        """Reduce bullet points in projects and experience."""
        # Reduce project bullets to max 3
        if 'projects' in data:
            for project in data['projects']:
                if 'bullets' in project and len(project['bullets']) > 3:
                    project['bullets'] = project['bullets'][:3]
        
        # Reduce experience bullets to max 3
        if 'experience' in data:
            for exp in data['experience']:
                if 'bullets' in exp and len(exp['bullets']) > 3:
                    exp['bullets'] = exp['bullets'][:3]
        
        return data
    
    def _reduce_projects(self, data: Dict) -> Dict:
        """Reduce number of projects."""
        if 'projects' in data and len(data['projects']) > 3:
            data['projects'] = data['projects'][:3]
        return data
    
    def _reduce_experience(self, data: Dict) -> Dict:
        """Reduce number of experience entries."""
        if 'experience' in data and len(data['experience']) > 2:
            data['experience'] = data['experience'][:2]
        return data
    
    def _reduce_achievements(self, data: Dict) -> Dict:
        """Reduce number of achievements."""
        if 'achievements' in data and len(data['achievements']) > 5:
            data['achievements'] = data['achievements'][:5]
        return data
    
    def get_optimization_suggestions(self, resume_data: Dict) -> List[str]:
        """
        Get suggestions for content reduction.
        """
        suggestions = []

        if 'projects' in resume_data and len(resume_data['projects']) > 3:
            suggestions.append(f"Reduce projects from {len(resume_data['projects'])} to 3")

        if 'experience' in resume_data:
            for exp in resume_data['experience']:
                if 'bullets' in exp and len(exp['bullets']) > 3:
                    suggestions.append(f"Reduce bullets in '{exp.get('job_title', 'experience')}' to 3")

        if 'achievements' in resume_data and len(resume_data['achievements']) > 5:
            suggestions.append(f"Reduce achievements from {len(resume_data['achievements'])} to 5")

        if 'certifications' in resume_data and len(resume_data['certifications']) > 3:
            suggestions.append(f"Reduce certifications from {len(resume_data['certifications'])} to 3")

        return suggestions
