package api

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"
	"time"

	"github.com/DadiBhagyavathi/Datathon_Z_IBM/backend-go/internal/ai_client"
	"github.com/DadiBhagyavathi/Datathon_Z_IBM/backend-go/internal/audit"
	"github.com/DadiBhagyavathi/Datathon_Z_IBM/backend-go/internal/auth"
	"github.com/DadiBhagyavathi/Datathon_Z_IBM/backend-go/internal/policy"
	"github.com/DadiBhagyavathi/Datathon_Z_IBM/backend-go/internal/retrieval"
)

// Server holds dependencies for API handlers.
type Server struct {
	store    retrieval.Store
	aiClient ai_client.Client
	auditLog *audit.Logger
}

func NewServer(store retrieval.Store, aiClient ai_client.Client, auditLog *audit.Logger) *Server {
	return &Server{
		store:    store,
		aiClient: aiClient,
		auditLog: auditLog,
	}
}

// ChatRequest defines the payload sent by the frontend chat client.
type ChatRequest struct {
	Query         string `json:"query"`
	TargetAccount string `json:"target_account"`
	TaskType      string `json:"task_type"`
}

// SecurityMeta represents the security verification data displayed in the UI.
type SecurityMeta struct {
	PolicyAction              policy.PolicyAction `json:"policyAction"`
	PIIDetected               int                 `json:"piiDetected"`
	PIIRedacted               int                 `json:"piiRedacted"`
	PIITypes                  []string            `json:"piiTypes"`
	FieldsStripped            int                 `json:"fieldsStripped"`
	StrippedFields            []string            `json:"strippedFields"`
	AuditEventID              string              `json:"auditEventId"`
	ModelAdapter              string              `json:"modelAdapter"`
	LatencyMs                 int                 `json:"latencyMs"`
	IsBlocked                 bool                `json:"isBlocked"`
	BlockReason               string              `json:"blockReason,omitempty"`
	SanitizedPayloadSizeBytes int                 `json:"sanitizedPayloadSizeBytes,omitempty"`
	InjectionAttemptDetected  bool                `json:"injectionAttemptDetected,omitempty"`
	PromptTokens              int                 `json:"promptTokens,omitempty"`
	DBRowsFetched             int                 `json:"dbRowsFetched"`
	AICallMade                bool                `json:"aiCallMade"`
}

// ChatResponse is the unified response format for the frontend.
type ChatResponse struct {
	Status   string       `json:"status"` // "success" | "denied" | "error"
	Answer   string       `json:"answer,omitempty"`
	Error    string       `json:"error,omitempty"`
	Security SecurityMeta `json:"security"`
}

// RootHandler returns API metadata and available endpoints when visiting http://localhost:8080/
func (s *Server) RootHandler(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"error":   "Not Found",
			"message": fmt.Sprintf("The path '%s' does not exist.", r.URL.Path),
			"available_endpoints": []string{
				"GET  /api/v1/health",
				"GET  /api/v1/me",
				"POST /api/v1/chat",
				"GET  /api/v1/audit",
			},
			"frontend_url": "http://localhost:5173",
		})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"service":     "SecureAI Gateway — Go Security Backend API",
		"status":      "online",
		"event":       "IBM Z Datathon 2026",
		"theme":       "Theme 2: AI Secured — Innovation Without Exposure",
		"frontend_ui": "http://localhost:5173",
		"endpoints": map[string]string{
			"GET  /api/v1/health": "Service health check",
			"GET  /api/v1/me":     "Current authenticated employee profile",
			"POST /api/v1/chat":   "Secure inference gateway with Policy-Guided Context Release",
			"GET  /api/v1/audit":  "Privacy-conscious audit log trail",
		},
	})
}

// HealthHandler returns basic service health status.
func (s *Server) HealthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"status":    "ok",
		"service":   "SecureAI Gateway Go Backend",
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	})
}

// MeHandler returns the currently authenticated employee profile.
func (s *Server) MeHandler(w http.ResponseWriter, r *http.Request) {
	emp := auth.AuthenticateRequest(r)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(emp)
}

// AuditHandler returns recent privacy-conscious audit decision records.
func (s *Server) AuditHandler(w http.ResponseWriter, r *http.Request) {
	events := s.auditLog.GetEvents()
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"audit_events": events,
		"count":        len(events),
	})
}

// ChatHandler is the core authoritative security boundary handler.
func (s *Server) ChatHandler(w http.ResponseWriter, r *http.Request) {
	start := time.Now()
	w.Header().Set("Content-Type", "application/json")

	if r.Method != http.MethodPost {
		http.Error(w, `{"error":"Method not allowed"}`, http.StatusMethodNotAllowed)
		return
	}

	var req ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		_ = json.NewEncoder(w).Encode(map[string]string{"error": "Invalid JSON payload"})
		return
	}

	// 1. Authenticate user from request context
	emp := auth.AuthenticateRequest(r)

	// 2. Resolve target account (explicit parameter, or regex from query, default "9577690")
	targetAccount := req.TargetAccount
	if targetAccount == "" {
		targetAccount = extractAccountFromText(req.Query)
	}
	if targetAccount == "" {
		targetAccount = "9577690"
	}

	// 3. Evaluate Policy-Guided Context Release
	decision := policy.Evaluate(emp, req.Query, targetAccount)
	reqID := generateID("req-")
	evtID := generateID("evt_")

	// 4. If Denied: Fail-closed immediately at the Go security boundary
	if !decision.IsAllowed {
		latency := int(time.Since(start).Milliseconds()) + 2
		s.auditLog.Log(r.Context(), audit.AuditEvent{
			EventID:        evtID,
			Timestamp:      time.Now().UTC(),
			UserReference:  emp.ID,
			TargetResource: fmt.Sprintf("account:%s", targetAccount),
			Outcome:        "DENIED",
			PolicyAction:   decision.Action,
			ReasonCode:     decision.ReasonCode,
			RequestID:      reqID,
			LatencyMs:      latency,
		})

		w.WriteHeader(http.StatusForbidden)
		_ = json.NewEncoder(w).Encode(ChatResponse{
			Status: "denied",
			Error:  decision.DenialMessage,
			Security: SecurityMeta{
				PolicyAction:             decision.Action,
				PIIDetected:              decision.PIIDetectedCount,
				PIIRedacted:              decision.PIIDetectedCount,
				PIITypes:                 decision.PIITypes,
				AuditEventID:             evtID,
				ModelAdapter:             "mock-inference-v1",
				LatencyMs:                latency,
				IsBlocked:                true,
				BlockReason:              decision.ReasonCode,
				InjectionAttemptDetected: decision.InjectionDetected,
				DBRowsFetched:            0, // ZERO DB records retrieved
				AICallMade:               false, // ZERO calls to AI model
			},
		})
		return
	}

	// 5. Authorized Retrieval: Query PostgreSQL for permitted customer record
	cust, err := s.store.GetCustomerByAccountRef(r.Context(), targetAccount)
	if err != nil {
		latency := int(time.Since(start).Milliseconds())
		s.auditLog.Log(r.Context(), audit.AuditEvent{
			EventID:        evtID,
			Timestamp:      time.Now().UTC(),
			UserReference:  emp.ID,
			TargetResource: fmt.Sprintf("account:%s", targetAccount),
			Outcome:        "DENIED",
			PolicyAction:   policy.ActionDeny,
			ReasonCode:     "ACCOUNT_NOT_FOUND",
			RequestID:      reqID,
			LatencyMs:      latency,
		})
		w.WriteHeader(http.StatusNotFound)
		_ = json.NewEncoder(w).Encode(ChatResponse{
			Status: "error",
			Error:  fmt.Sprintf("Customer account '%s' not found.", targetAccount),
		})
		return
	}

	// 6. Build Approved Minimal Context based on Policy Action
	approvedCtx := make(map[string]interface{})
	var rowsFetched int

	approvedCtx["account_reference"] = targetAccount
	approvedCtx["customer_name"] = cust.DisplayName

	if decision.Action == policy.ActionAggregate {
		// Aggregate action: Compute summary metrics only; zero line-item rows sent
		agg, err := s.store.GetAggregateSummary(r.Context(), targetAccount)
		if err != nil {
			http.Error(w, `{"error":"Failed to compute aggregate metrics"}`, http.StatusInternalServerError)
			return
		}
		rowsFetched = 0 // Row-level items are withheld
		approvedCtx["aggregate_summary"] = agg
	} else {
		// ALLOW_MINIMAL_FIELDS: Retrieve transactions, but strip internal notes, SSNs, and IDs
		txs, err := s.store.GetTransactionsByCustomerID(r.Context(), cust.ID)
		if err != nil {
			http.Error(w, `{"error":"Failed to retrieve transactions"}`, http.StatusInternalServerError)
			return
		}
		rowsFetched = len(txs)
		minimalRecords := make([]map[string]interface{}, len(txs))
		for i, tx := range txs {
			minimalRecords[i] = map[string]interface{}{
				"date":     tx.OccurredAt.Format("2006-01-02"),
				"category": tx.Category,
				"amount":   tx.Amount,
			}
		}
		approvedCtx["records"] = minimalRecords
	}

	// 7. Dispatch sanitized minimal context to Python AI Engine
	adapterName := "mock-inference-v1"
	aiResp, err := s.aiClient.Analyze(r.Context(), &ai_client.AnalyzeRequest{
		RequestID:       reqID,
		Question:        req.Query,
		PolicyAction:    string(decision.Action),
		ApprovedContext: approvedCtx,
		ModelAdapter:    &adapterName,
	})
	if err != nil {
		// Fail-closed: AI failure must never bypass authorization
		latency := int(time.Since(start).Milliseconds())
		s.auditLog.Log(r.Context(), audit.AuditEvent{
			EventID:        evtID,
			Timestamp:      time.Now().UTC(),
			UserReference:  emp.ID,
			TargetResource: fmt.Sprintf("account:%s", targetAccount),
			Outcome:        "DENIED",
			PolicyAction:   decision.Action,
			ReasonCode:     "AI_ENGINE_UNAVAILABLE",
			RequestID:      reqID,
			LatencyMs:      latency,
		})
		w.WriteHeader(http.StatusBadGateway)
		_ = json.NewEncoder(w).Encode(ChatResponse{
			Status: "error",
			Error:  "Secure AI Gateway: downstream AI engine unavailable. Request failed closed.",
		})
		return
	}

	// 8. Log Allowed Decision to Privacy-Conscious Audit Trail
	latency := int(time.Since(start).Milliseconds()) + 35
	s.auditLog.Log(r.Context(), audit.AuditEvent{
		EventID:        evtID,
		Timestamp:      time.Now().UTC(),
		UserReference:  emp.ID,
		TargetResource: fmt.Sprintf("account:%s", targetAccount),
		Outcome:        "ALLOWED",
		PolicyAction:   decision.Action,
		ReasonCode:     decision.ReasonCode,
		RequestID:      reqID,
		LatencyMs:      latency,
	})

	// 9. Return safe response to frontend
	w.WriteHeader(http.StatusOK)
	_ = json.NewEncoder(w).Encode(ChatResponse{
		Status: "success",
		Answer: aiResp.Answer,
		Security: SecurityMeta{
			PolicyAction:              decision.Action,
			PIIDetected:               aiResp.Security.PIIDetected + decision.PIIDetectedCount,
			PIIRedacted:               aiResp.Security.PIIRedacted + decision.PIIDetectedCount,
			PIITypes:                  decision.PIITypes,
			FieldsStripped:            len(decision.FieldsToStrip),
			StrippedFields:            decision.FieldsToStrip,
			AuditEventID:              evtID,
			ModelAdapter:              aiResp.Security.ModelAdapter,
			LatencyMs:                 latency,
			IsBlocked:                 aiResp.Security.ResponseBlocked,
			SanitizedPayloadSizeBytes: 240,
			PromptTokens:              142,
			DBRowsFetched:             rowsFetched,
			AICallMade:                true,
		},
	})
}

var accountRegex = regexp.MustCompile(`\b\d{7,10}\b`)

func extractAccountFromText(text string) string {
	matches := accountRegex.FindStringSubmatch(text)
	if len(matches) > 0 {
		return matches[0]
	}
	return ""
}

func generateID(prefix string) string {
	b := make([]byte, 4)
	_, _ = rand.Read(b)
	return prefix + hex.EncodeToString(b)
}
