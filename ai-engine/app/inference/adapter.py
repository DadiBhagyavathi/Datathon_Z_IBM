import os
import httpx

class InferenceError(RuntimeError):
    pass

async def generate(prompt: str, adapter_name: str | None = None) -> tuple[str, str]:
    adapter = adapter_name or os.getenv("MODEL_ADAPTER", "mock-inference-v1")
    if adapter == "mock-inference-v1":
        return (
            "MOCK RESPONSE (no language model was called). The request was sanitized "
            "and a minimal prompt was prepared. Configure an approved Granite endpoint "
            "to enable real model inference.",
            "mock-inference-v1",
        )
    if adapter == "granite-api":
        return await call_granite(prompt), "granite-api"
    raise InferenceError("Unknown model adapter")

async def call_granite(prompt: str) -> str:
    url = os.getenv("GRANITE_API_URL", "").strip()
    api_key = os.getenv("GRANITE_API_KEY", "").strip()
    timeout = float(os.getenv("GRANITE_TIMEOUT_SECONDS", "20"))
    if not url:
        raise InferenceError("GRANITE_API_URL is not configured")
    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            response = await client.post(url, json={"prompt": prompt}, headers=headers)
            response.raise_for_status()
            payload = response.json()
    except (httpx.HTTPError, ValueError) as exc:
        raise InferenceError("Granite endpoint request failed") from exc
    if not isinstance(payload, dict):
        raise InferenceError("Unexpected Granite response format")
    generated = payload.get("generated_text") or payload.get("answer")
    if not isinstance(generated, str) or not generated.strip():
        raise InferenceError("Granite response did not contain generated_text or answer")
    return generated.strip()
