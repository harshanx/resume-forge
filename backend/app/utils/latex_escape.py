def escape_latex(text: str) -> str:
    """
    Escape special LaTeX characters in user input.
    
    LaTeX special characters: & % $ # _ { } ~ ^ \
    """
    if not text:
        return ""
    
    # Order matters - escape backslash first
    replacements = [
        ('\\', '\\textbackslash{}'),
        ('&', '\\&'),
        ('%', '\\%'),
        ('$', '\\$'),
        ('#', '\\#'),
        ('_', '\\_'),
        ('{', '\\{'),
        ('}', '\\}'),
        ('~', '\\textasciitilde{}'),
        ('^', '\\textasciicircum{}'),
    ]
    
    for old, new in replacements:
        text = text.replace(old, new)
    
    return text


def escape_resume_data(resume_data) -> dict:
    """
    Escape all string fields in resume data.
    Accepts either a Pydantic model or a dict.
    """
    def escape_dict(data: dict) -> dict:
        result = {}
        for key, value in data.items():
            if isinstance(value, str):
                result[key] = escape_latex(value)
            elif isinstance(value, list):
                result[key] = [escape_dict(item) if isinstance(item, dict)
                               else escape_latex(item) if isinstance(item, str)
                               else item for item in value]
            elif isinstance(value, dict):
                result[key] = escape_dict(value)
            else:
                result[key] = value
        return result

    # Handle both Pydantic models and dicts
    if hasattr(resume_data, 'dict'):
        data = resume_data.dict()
    else:
        data = resume_data

    return escape_dict(data)
