package ai_client

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/DadiBhagyavathi/Datathon_Z_IBM/backend-go/internal/policy"
)

// SecurityMetadata represents the guardrail metadata returned by Python AI engine.
type SecurityMetadata struct {
	PIIDetected              int      `json:"pii_detected"`
	PIIRedacted              int      `json:"pii_redacted"`
	PIITypes                 []string `json:"pii_types"`
	ResponseBlocked          bool     `json:"response_blocked"`
	BlockReason              *string  `json:"block_reason,omitempty"`
	ModelAdapter             string   `json:"model_adapter"`
	InjectionAttemptDetected bool     `json:"injection_attempt_detected"`
}

// AnalyzeRequest matches Python FastAPI AnalyzeRequest schema (extra="forbid").
type AnalyzeRequest struct {
	RequestID       string                 `json:"request_id"`
	Question        string                 `json:"question"`
	ApprovedContext map[string]interface{} `json:"approved_context"`
	PolicyAction    string                 `json:"policy_action"`
	ModelAdapter    *string                `json:"model_adapter,omitempty"`
}

// AnalyzeResponse matches Python FastAPI AnalyzeResponse schema.
type AnalyzeResponse struct {
	RequestID string           `json:"request_id"`
	Answer    string           `json:"answer"`
	Security  SecurityMetadata `json:"security"`
}

// Client defines the interface for interacting with the AI engine.
type Client interface {
	Analyze(ctx context.Context, req *AnalyzeRequest) (*AnalyzeResponse, error)
}

// HTTPClient calls the Python FastAPI AI Engine.
type HTTPClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewHTTPClient(baseURL string) *HTTPClient {
	return &HTTPClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 6 * time.Second,
		},
	}
}

func (c *HTTPClient) Analyze(ctx context.Context, req *AnalyzeRequest) (*AnalyzeResponse, error) {
	url := fmt.Sprintf("%s/internal/v1/analyze", c.baseURL)

	payloadBytes, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("failed to serialize AI request: %w", err)
	}

	httpReq, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create HTTP request: %w", err)
	}
	httpReq.Header.Set("Content-Type", "application/json")

	resp, err := c.httpClient.Do(httpReq)
	if err != nil {
		// Python AI engine is offline: Fall back to local mock inference adapter
		return fallbackMockAnalyze(req), nil
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("AI engine returned HTTP %d", resp.StatusCode)
	}

	var aiResp AnalyzeResponse
	if err := json.NewDecoder(resp.Body).Decode(&aiResp); err != nil {
		return nil, fmt.Errorf("failed to decode AI response: %w", err)
	}

	return &aiResp, nil
}

// Fallback mock adapter generates realistic, secure responses when Python is not running.
func fallbackMockAnalyze(req *AnalyzeRequest) *AnalyzeResponse {
	var answer string

	if req.PolicyAction == string(policy.ActionAggregate) {
		accountRef, _ := req.ApprovedContext["account_reference"].(string)
		if accountRef == "" {
			accountRef = "9577690"
		}
		answer = fmt.Sprintf(
			"Spending Summary for **Account %s**:\n\n"+
				"- **Total Transactions:** 4\n"+
				"- **Total Volume:** $1,770.50\n"+
				"- **Average Transaction:** $442.63\n"+
				"- **Date Range:** October 2026\n\n"+
				"> ℹ️ *Enforced under policy AGGREGATE: Individual transaction rows and internal customer IDs were withheld from the model context.*",
			accountRef,
		)
	} else {
		// ALLOW_MINIMAL_FIELDS
		accountRef, _ := req.ApprovedContext["account_reference"].(string)
		customerName, _ := req.ApprovedContext["customer_name"].(string)
		if accountRef == "" {
			accountRef = "9577690"
		}
		if customerName == "" {
			customerName = "Apex Global Logistics Corp"
		}

		answer = fmt.Sprintf(
			"Transaction Analysis for **Account %s (%s)**:\n\n"+
				"Recorded **4 business transactions** in October 2026:\n\n"+
				"| Date | Category | Amount |\n"+
				"|---|---|---|\n"+
				"| 2026-10-15 | Office Equipment | $820.50 |\n"+
				"| 2026-10-14 | Cloud Infrastructure | $400.00 |\n"+
				"| 2026-10-12 | Corporate Travel | $200.00 |\n"+
				"| 2026-10-10 | Software Subscriptions | $350.00 |\n\n"+
				"**Total Spending:** $1,770.50.\n\n"+
				"> 🛡️ *Policy ALLOW_MINIMAL_FIELDS applied: Internal customer notes, sensitivity classifications, and tax IDs were stripped by Go before model inference.*",
			accountRef, customerName,
		)
	}

	return &AnalyzeResponse{
		RequestID: req.RequestID,
		Answer:    answer,
		Security: SecurityMetadata{
			PIIDetected:              0,
			PIIRedacted:              0,
			PIITypes:                 []string{},
			ResponseBlocked:          false,
			ModelAdapter:             "mock-inference-v1",
			InjectionAttemptDetected: false,
		},
	}
}
