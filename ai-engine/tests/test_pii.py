from app.pii.sanitizer import sanitize_text

def test_email_is_redacted():
    result = sanitize_text("Contact person@example.com")
    assert "person@example.com" not in result.text
    assert "[REDACTED_EMAIL_ADDRESS]" in result.text
    assert result.detected_count == 1
    assert result.redacted_count == 1

def test_indian_phone_is_redacted():
    result = sanitize_text("Call 9876543210")
    assert "9876543210" not in result.text
    assert "PHONE_NUMBER" in result.types

def test_text_without_pii_is_unchanged():
    text = "Summarize the approved transaction totals."
    result = sanitize_text(text)
    assert result.text == text
    assert result.detected_count == 0
