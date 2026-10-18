import re
from dataclasses import dataclass

@dataclass
class ResponseCheck:
    safe: bool
    answer: str
    reason: str | None = None

_SENSITIVE_PATTERNS = [
    re.compile(r"\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b"),
    re.compile(r"(?<!\d)(?:\+91[\s-]?)?[6-9]\d{9}(?!\d)"),
    re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),
    re.compile(r"\b[A-Z]{5}\d{4}[A-Z]\b", re.IGNORECASE),
    re.compile(r"(?<!\d)\d{4}[\s-]?\d{4}[\s-]?\d{4}(?!\d)"),
]
# First-pass prompt-injection indicators. These are heuristic patterns,
# not a complete prompt-injection defense.
_INJECTION_PATTERNS = [
    re.compile(r"\bignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions\b", re.IGNORECASE),
    re.compile(r"\bdisregard\s+(?:all\s+)?(?:previous|prior|above)\s+instructions\b", re.IGNORECASE),
    re.compile(r"\breveal\s+(?:the\s+)?(?:system|hidden)\s+prompt\b", re.IGNORECASE),
    re.compile(r"\bshow\s+(?:me\s+)?(?:the\s+)?system\s+prompt\b", re.IGNORECASE),
    re.compile(r"\b(bypass|disable|override)\s+(?:the\s+)?(?:security|safety|guardrails|policies)\b", re.IGNORECASE),
]


def detect_prompt_injection(text: str) -> bool:
    """Return True when common prompt-injection phrases are detected."""
    return any(pattern.search(text) for pattern in _INJECTION_PATTERNS)

def check_response(answer: str, sanitized_question: str) -> ResponseCheck:
    for pattern in _SENSITIVE_PATTERNS:
        if pattern.search(answer):
            return ResponseCheck(
                safe=False,
                answer="The response was blocked because it may contain sensitive information.",
                reason="POTENTIAL_SENSITIVE_DATA_IN_RESPONSE",
            )
    return ResponseCheck(safe=True, answer=answer)
