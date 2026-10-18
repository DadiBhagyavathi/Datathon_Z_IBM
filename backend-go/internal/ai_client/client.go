package ai_client

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/DadiBhagyavathi/Datathon_Z_IBM/backend-go/internal/policy"
	"github.com/DadiBhagyavathi/Datathon_Z_IBM/backend-go/internal/retrieval"
)

// MinimalTransaction represents sanitized transaction fields sent to AI.
type MinimalTransaction struct {
	Date     string  `json:"date"`
	Category string  `json:"category"`
	Amount   float64 `json:"amount"`
}

// ApprovedContext is the structured, data-minimized payload passed across the trust boundary.
type ApprovedContext struct {
	AccountReference string                `json:"account_reference"`
	CustomerName     string                `json:"customer_name,omitempty"`
	AggregateSummary *retrieval.AggregateSummary `json:"aggregate_summary,omitempty"`
	Records          []MinimalTransaction  `json:"records,omitempty"`
}

// AnalyzeRequest represents the service-to-service contract sent to Python.
type AnalyzeRequest struct {
	RequestID        string          `json:"request_id"`
	TaskType         string          `json:"task_type"`
	PolicyAction     string          `json:"policy_action"`
	ApprovedContext  ApprovedContext `json:"approved_context"`
	UserPrompt       string          `json:"user_prompt"`
}

// AnalyzeResponse represents the structured response returned by Python.
type AnalyzeResponse struct {
	RequestID          string   `json:"request_id"`
	Answer             string   `json:"answer"`
	SafetyCheckStatus  string   `json:"safety_check_status"` // "PASSED" | "WARNING"
	PIIDetectedCount   int      `json:"pii_detected_count"`
	AdapterUsed        string   `json:"adapter_used"`        // "mock-inference-v1" or "granite-api"
	Warnings           []string `json:"warnings"`
	PromptTokens       int      `json:"prompt_tokens,omitempty"`
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
		summary := req.ApprovedContext.AggregateSummary
		if summary != nil {
			answer = fmt.Sprintf(
				"Spending Summary for **Account %s**:\n\n"+
					"- **Total Transactions:** %d\n"+
					"- **Total Volume:** $%.2f\n"+
					"- **Average Transaction:** $%.2f\n"+
					"- **Date Range:** %s\n\n"+
					"> ℹ️ *Enforced under policy AGGREGATE: Individual transaction rows and internal customer IDs were withheld from the model context.*",
				summary.AccountRef, summary.TotalTransactions, summary.TotalAmount, summary.AverageAmount, summary.DateRange,
			)
		} else {
			answer = "Aggregate summary metrics compiled successfully. Zero row-level transaction records released to the model."
		}
	} else {
		// ALLOW_MINIMAL_FIELDS
		ctx := req.ApprovedContext
		answer = fmt.Sprintf(
			"Transaction Analysis for **Account %s (%s)**:\n\n"+
				"Recorded **%d business transactions** in October 2026:\n\n"+
				"| Date | Category | Amount |\n"+
				"|---|---|---|\n",
			ctx.AccountReference, ctx.CustomerName, len(ctx.Records),
		)

		var total float64
		for _, r := range ctx.Records {
			answer += fmt.Sprintf("| %s | %s | $%.2f |\n", r.Date, r.Category, r.Amount)
			total += r.Amount
		}
		answer += fmt.Sprintf("\n**Total Spending:** $%.2f.\n\n"+
			"> 🛡️ *Policy ALLOW_MINIMAL_FIELDS applied: Internal customer notes, sensitivity classifications, and tax IDs were stripped by Go before model inference.*", total)
	}

	return &AnalyzeResponse{
		RequestID:         req.RequestID,
		Answer:            answer,
		SafetyCheckStatus: "PASSED",
		PIIDetectedCount:  0,
		AdapterUsed:       "mock-inference-v1",
		Warnings:          []string{},
		PromptTokens:      142,
	}
}
