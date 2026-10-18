from app.response_checks.checker import check_response

def test_sensitive_email_in_answer_is_blocked():
    result = check_response("Email is person@example.com", "What is the account total?")
    assert not result.safe
    assert "blocked" in result.answer.lower()

def test_regular_answer_is_allowed():
    result = check_response("The approved context contains three transactions.", "Summarize it.")
    assert result.safe
