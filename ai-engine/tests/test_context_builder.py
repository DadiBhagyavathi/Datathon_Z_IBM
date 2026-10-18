import pytest
from app.context_builder.builder import build_prompt

def test_prompt_includes_context_and_question():
    prompt = build_prompt("Summarize totals", {"count": 3}, "AGGREGATE")
    assert "Summarize totals" in prompt
    assert '"count":3' in prompt
    assert "AGGREGATE" in prompt

def test_unknown_policy_action_rejected():
    with pytest.raises(ValueError):
        build_prompt("hello", {}, "DENY")
