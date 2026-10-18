
import re
from dataclasses import dataclass
from functools import lru_cache

from presidio_analyzer import AnalyzerEngine, Pattern, PatternRecognizer
from presidio_anonymizer import AnonymizerEngine
from presidio_anonymizer.entities import OperatorConfig


@dataclass
class SanitizationResult:
    text: str
    detected_count: int
    redacted_count: int
    types: list[str]


# Preserve the existing custom rules for identifiers that may not be
# detected reliably by Presidio's default recognizers.
_CUSTOM_RULES: list[tuple[str, re.Pattern[str]]] = [
    ("PHONE_NUMBER", re.compile(r"(?<!\d)(?:\+91[\s-]?)?[6-9]\d{9}(?!\d)")),
    ("US_SSN", re.compile(r"\b\d{3}-\d{2}-\d{4}\b")),
    ("IN_PAN", re.compile(r"\b[A-Z]{5}\d{4}[A-Z]\b", re.IGNORECASE)),
    ("AADHAAR_LIKE", re.compile(r"(?<!\d)\d{4}[\s-]?\d{4}[\s-]?\d{4}(?!\d)")),
    ("CREDIT_CARD_LIKE", re.compile(r"(?<!\d)(?:4\d{3}[\s-]?){3}\d{4}(?!\d)")),
]


@lru_cache(maxsize=1)
def _get_engines() -> tuple[AnalyzerEngine, AnonymizerEngine]:
    """Initialize Presidio once and reuse the engines."""
    analyzer = AnalyzerEngine()

    # Add project-specific patterns to Presidio's recognizer registry.
    custom_recognizers = [
        PatternRecognizer(
            supported_entity=entity,
            patterns=[
                Pattern(
                    name=f"{entity.lower()}_pattern",
                    regex=pattern.pattern,
                    score=0.85,
                )
            ],
            supported_language="en",
        )
        for entity, pattern in _CUSTOM_RULES
    ]

    for recognizer in custom_recognizers:
        analyzer.registry.add_recognizer(recognizer)

    return analyzer, AnonymizerEngine()


def sanitize_text(text: str) -> SanitizationResult:
    if not text:
        return SanitizationResult(
            text=text,
            detected_count=0,
            redacted_count=0,
            types=[],
        )

    analyzer, anonymizer = _get_engines()

    # Presidio detects standard PII and the project's custom identifiers.
    findings = analyzer.analyze(text=text, language="en")

    # Remove overlapping detections, preferring specific PII entities
    # such as EMAIL_ADDRESS over a URL detected inside the email.
    priority = {
        "EMAIL_ADDRESS": 3,
        "PHONE_NUMBER": 3,
        "US_SSN": 3,
        "IN_PAN": 3,
        "AADHAAR_LIKE": 3,
        "CREDIT_CARD_LIKE": 3,
        "URL": 1,
    }

    ranked_findings = sorted(
        findings,
        key=lambda item: (
            -priority.get(item.entity_type, 2),
            -(item.end - item.start),
            -item.score,
            item.start,
        ),
    )

    filtered_findings = []
    for finding in ranked_findings:
        overlaps = any(
            finding.start < kept.end and finding.end > kept.start
            for kept in filtered_findings
        )
        if not overlaps:
            filtered_findings.append(finding)

    findings = sorted(filtered_findings, key=lambda item: item.start)

    if not findings:
        return SanitizationResult(
            text=text,
            detected_count=0,
            redacted_count=0,
            types=[],
        )

    # Map custom entity labels to stable output labels.
    type_mapping = {
        "PHONE_NUMBER": "PHONE_NUMBER",
        "US_SSN": "US_SSN",
        "IN_PAN": "IN_PAN",
        "AADHAAR_LIKE": "AADHAAR_LIKE",
        "CREDIT_CARD_LIKE": "CREDIT_CARD_LIKE",
    }

    found_types = sorted({
        type_mapping.get(item.entity_type, item.entity_type)
        for item in findings
    })

    # Replace every detected span with a type-specific redaction marker.
    operators = {
        entity: OperatorConfig(
            "replace",
            {"new_value": f"[REDACTED_{type_mapping.get(entity, entity)}]"},
        )
        for entity in {item.entity_type for item in findings}
    }

    anonymized = anonymizer.anonymize(
        text=text,
        analyzer_results=findings,
        operators=operators,
    )

    return SanitizationResult(
        text=anonymized.text,
        detected_count=len(findings),
        redacted_count=len(findings),
        types=found_types,
    )
