import logging
from fastapi import FastAPI, HTTPException
from app.schemas import AnalyzeRequest, AnalyzeResponse, SecurityMetadata
from app.pii.sanitizer import sanitize_text
from app.context_builder.builder import build_prompt
from app.inference.adapter import generate, InferenceError
from app.response_checks.checker import check_response, detect_prompt_injection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("secureai.ai_engine")
app = FastAPI(
    title="SecureAI Gateway — AI Engine",
    version="0.1.0",
    description="Internal AI processing service. Authorization remains in the Go gateway.",
)

@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "service": "secureai-ai-engine"}

@app.post("/internal/v1/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest) -> AnalyzeResponse:
    # Go must enforce authorization before calling this endpoint.
    question_result = sanitize_text(request.question)
    injection_detected = detect_prompt_injection(request.question)

    if injection_detected:
        context_result = sanitize_text(str(request.approved_context))
        security = SecurityMetadata(
            pii_detected=question_result.detected_count + context_result.detected_count,
            pii_redacted=question_result.redacted_count + context_result.redacted_count,
            pii_types=sorted(set(question_result.types + context_result.types)),
            response_blocked=True,
            block_reason="PROMPT_INJECTION_DETECTED",
            model_adapter="not_called",
            injection_attempt_detected=True,
        )
        return AnalyzeResponse(
            request_id=request.request_id,
            answer="The request was blocked because it may contain a prompt-injection attempt.",
            security=security,
        )
    context_result = sanitize_text(str(request.approved_context))
    prompt = build_prompt(
        question=question_result.text,
        approved_context={"approved_context_sanitized": context_result.text},
        policy_action=request.policy_action,
    )
    try:
        answer, adapter_name = await generate(prompt, request.model_adapter)
    except InferenceError as exc:
        # Fail closed; never substitute a success-looking answer on inference failure.
        logger.warning("Inference failed for request_id=%s", request.request_id)
        raise HTTPException(status_code=503, detail="AI inference is temporarily unavailable") from exc

    check = check_response(answer, question_result.text)
    if not check.safe:
        answer = check.answer
    security = SecurityMetadata(
        pii_detected=question_result.detected_count + context_result.detected_count,
        pii_redacted=question_result.redacted_count + context_result.redacted_count,
        pii_types=sorted(set(question_result.types + context_result.types)),
        response_blocked=not check.safe,
        block_reason=check.reason,
        model_adapter=adapter_name,
        injection_attempt_detected=injection_detected,
    )
    return AnalyzeResponse(request_id=request.request_id, answer=answer, security=security)
