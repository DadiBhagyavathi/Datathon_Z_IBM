package policy

import (
	"regexp"
	"strings"

	"github.com/DadiBhagyavathi/Datathon_Z_IBM/backend-go/internal/auth"
	"github.com/DadiBhagyavathi/Datathon_Z_IBM/backend-go/internal/authorization"
)

// PolicyAction defines the context release transformation.
type PolicyAction string

const (
	ActionAllowMinimalFields PolicyAction = "ALLOW_MINIMAL_FIELDS"
	ActionAggregate          PolicyAction = "AGGREGATE"
	ActionRedact             PolicyAction = "REDACT"
	ActionDeny               PolicyAction = "DENY"
)

// PolicyDecision encapsulates the outcome of the policy engine evaluation.
type PolicyDecision struct {
	Action                   PolicyAction `json:"action"`
	IsAllowed                bool         `json:"isAllowed"`
	ReasonCode               string       `json:"reasonCode"`
	FieldsToStrip            []string     `json:"fieldsToStrip"`
	IsAggregateOnly          bool         `json:"isAggregateOnly"`
	InjectionDetected        bool         `json:"injectionDetected"`
	PIIDetectedCount         int          `json:"piiDetectedCount"`
	PIITypes                 []string     `json:"piiTypes"`
	DenialMessage            string       `json:"denialMessage,omitempty"`
}

var injectionRegexes = []*regexp.Regexp{
	regexp.MustCompile(`(?i)ignore\s+(all\s+)?(previous|prior|above)\s+instructions?`),
	regexp.MustCompile(`(?i)forget\s+(the\s+)?(system|your|all)\s+(prompt|instructions?|context)`),
	regexp.MustCompile(`(?i)reveal\s+(all\s+)?(your\s+)?(secret|hidden|system|internal|database)`),
	regexp.MustCompile(`(?i)show\s+(me\s+)?(all\s+)?(customer|user|account|internal)\s+(data|records|info)`),
	regexp.MustCompile(`(?i)dump\s+(all\s+)?(database|tables?|records?)`),
	regexp.MustCompile(`(?i)bypass\s+(the\s+)?(security|policy|filter|restriction)`),
	regexp.MustCompile(`(?i)jailbreak`),
	regexp.MustCompile(`(?i)override\s+(access|permission|security|boundary)`),
	regexp.MustCompile(`(?i)system\s+override`),
}

var piiRegexes = []struct {
	pattern *regexp.Regexp
	typ     string
}{
	{regexp.MustCompile(`\b\d{3}-\d{2}-\d{4}\b`), "US_SSN"},
	{regexp.MustCompile(`\b[6-9]\d{9}\b`), "PHONE_NUMBER"},
	{regexp.MustCompile(`\b[\w.+-]+@[\w.-]+\.\w{2,}\b`), "EMAIL_ADDRESS"},
	{regexp.MustCompile(`\b4\d{3}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b`), "CREDIT_CARD"},
	{regexp.MustCompile(`(?i)\b(?:my name is|i am|i'm)\s+[A-Z][a-z]+\s+[A-Z][a-z]+\b`), "PERSON"},
}

// Standard sensitive fields stripped under minimal context policy
var StandardStrippedFields = []string{
	"internal_notes",
	"sensitivity_class",
	"internal_customer_id",
	"customer_email",
	"customer_phone",
	"tax_id_ssn",
	"internal_audit_tags",
}

// Evaluate runs the Policy-Guided Context Release engine on the incoming request.
func Evaluate(emp *auth.Employee, query string, targetAccount string) PolicyDecision {
	// 1. Detect PII in user query
	piiCount, piiTypes := ScanPII(query)

	// 2. Detect Prompt Injection Attempts
	if DetectPromptInjection(query) {
		return PolicyDecision{
			Action:            ActionDeny,
			IsAllowed:         false,
			ReasonCode:        authorization.ReasonPromptInjection,
			InjectionDetected: true,
			PIIDetectedCount:  piiCount,
			PIITypes:          piiTypes,
			DenialMessage:     "Security Alert: Prompt injection attempt detected and blocked by Go security boundary.",
		}
	}

	// 3. Evaluate Role Permission: Interns are unconditionally denied
	if emp.RoleID == auth.RoleIntern {
		return PolicyDecision{
			Action:            ActionDeny,
			IsAllowed:         false,
			ReasonCode:        authorization.ReasonRBACNoPermission,
			PIIDetectedCount:  piiCount,
			PIITypes:          piiTypes,
			DenialMessage:     "Access Denied: Role 'intern' has zero production record permissions. Denied server-side at Go boundary.",
		}
	}

	// 4. Determine Query Intent (Detailed vs. Aggregated)
	isAggregateIntent := IsAggregateQuery(query)

	// 5. Evaluate Branch Staff: Permitted for aggregate only
	if emp.RoleID == auth.RoleBranchStaff || isAggregateIntent {
		return PolicyDecision{
			Action:          ActionAggregate,
			IsAllowed:       true,
			ReasonCode:      authorization.ReasonAuthOKAggregate,
			IsAggregateOnly: true,
			FieldsToStrip:   append(StandardStrippedFields, "raw_transaction_rows", "individual_amounts"),
			PIIDetectedCount: piiCount,
			PIITypes:        piiTypes,
		}
	}

	// 6. Evaluate Senior Analyst: Permitted with Minimal Fields policy
	if emp.RoleID == auth.RoleSeniorAnalyst {
		return PolicyDecision{
			Action:          ActionAllowMinimalFields,
			IsAllowed:       true,
			ReasonCode:      authorization.ReasonAuthOK,
			IsAggregateOnly: false,
			FieldsToStrip:   StandardStrippedFields,
			PIIDetectedCount: piiCount,
			PIITypes:        piiTypes,
		}
	}

	// Default: Fail closed
	return PolicyDecision{
		Action:        ActionDeny,
		IsAllowed:     false,
		ReasonCode:    authorization.ReasonRBACNoPermission,
		DenialMessage: "Access Denied: Request cannot be safely satisfied under active security policy.",
	}
}

// DetectPromptInjection checks if the user prompt contains hostile instructions.
func DetectPromptInjection(text string) bool {
	for _, re := range injectionRegexes {
		if re.MatchString(text) {
			return true
		}
	}
	return false
}

// ScanPII returns the count and types of PII patterns detected in the text.
func ScanPII(text string) (int, []string) {
	found := make(map[string]bool)
	for _, p := range piiRegexes {
		if p.pattern.MatchString(text) {
			found[p.typ] = true
		}
	}

	types := make([]string, 0, len(found))
	for t := range found {
		types = append(types, t)
	}
	return len(types), types
}

// IsAggregateQuery detects if the user is asking for summaries, totals, or trends.
func IsAggregateQuery(text string) bool {
	lower := strings.ToLower(text)
	return strings.Contains(lower, "summar") ||
		strings.Contains(lower, "total") ||
		strings.Contains(lower, "volume") ||
		strings.Contains(lower, "average") ||
		strings.Contains(lower, "trend") ||
		strings.Contains(lower, "monthly") ||
		strings.Contains(lower, "breakdown")
}
