import re
from dataclasses import dataclass

@dataclass
class SanitizationResult:
    text: str
    detected_count: int
    redacted_count: int
    types: list[str]

# Starter patterns only; these are not exhaustive DLP rules.
_RULES: list[tuple[str, re.Pattern[str]]] = [
    ("EMAIL_ADDRESS", re.compile(r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b")),
    ("PHONE_NUMBER", re.compile(r"(?<!\d)(?:\+91[\s-]?)?[6-9]\d{9}(?!\d)")),
    ("US_SSN", re.compile(r"\b\d{3}-\d{2}-\d{4}\b")),
    ("IN_PAN", re.compile(r"\b[A-Z]{5}\d{4}[A-Z]\b", re.IGNORECASE)),
    ("AADHAAR_LIKE", re.compile(r"(?<!\d)\d{4}[\s-]?\d{4}[\s-]?\d{4}(?!\d)")),
    ("CREDIT_CARD_LIKE", re.compile(r"(?<!\d)(?:4\d{3}[\s-]?){3}\d{4}(?!\d)")),
]

def sanitize_text(text: str) -> SanitizationResult:
    output = text
    found_types: list[str] = []
    detected_count = 0
    for pii_type, pattern in _RULES:
        matches = list(pattern.finditer(output))
        if matches:
            found_types.append(pii_type)
            detected_count += len(matches)
            output = pattern.sub(f"[REDACTED_{pii_type}]", output)
    return SanitizationResult(
        text=output,
        detected_count=detected_count,
        redacted_count=detected_count,
        types=found_types,
    )
