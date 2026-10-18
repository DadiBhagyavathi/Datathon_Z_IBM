from typing import Any, Literal
from pydantic import BaseModel, ConfigDict, Field

PolicyAction = Literal["ALLOW_MINIMAL_FIELDS", "AGGREGATE", "REDACT"]

class AnalyzeRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    request_id: str = Field(min_length=1, max_length=128)
    question: str = Field(min_length=1, max_length=8000)
    approved_context: dict[str, Any] = Field(default_factory=dict)
    policy_action: PolicyAction
    model_adapter: Literal["mock-inference-v1", "granite-api"] | None = None

class SecurityMetadata(BaseModel):
    pii_detected: int
    pii_redacted: int
    pii_types: list[str]
    response_blocked: bool
    block_reason: str | None = None
    model_adapter: str
    injection_attempt_detected: bool = False

class AnalyzeResponse(BaseModel):
    request_id: str
    answer: str
    security: SecurityMetadata
