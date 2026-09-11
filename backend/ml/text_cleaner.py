import re
import string

def clean_text(text: str) -> str:
    """
    Clean raw ticket text:
    - Normalizes whitespace
    - Strips unwanted non-printable characters
    - Preserves semantic ticket tokens and airline references
    """
    if not text:
        return ""
    
    # Replace multiple spaces, newlines, and tabs with a single space
    cleaned = re.sub(r'[\r\n\t]+', ' ', text)
    # Remove control characters
    cleaned = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', cleaned)
    # Normalize excessive spacing
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()
    return cleaned
