package audit

import (
	"context"
	"database/sql"
	"sync"
	"time"

	"github.com/DadiBhagyavathi/Datathon_Z_IBM/backend-go/internal/policy"
)

// AuditEvent represents a privacy-conscious security decision record.
type AuditEvent struct {
	EventID        string              `json:"eventId"`
	Timestamp      time.Time           `json:"timestamp"`
	UserReference  string              `json:"userReference"`
	TargetResource string              `json:"targetResource"`
	Outcome        string              `json:"outcome"`      // "ALLOWED" | "DENIED"
	PolicyAction   policy.PolicyAction `json:"policyAction"` // "ALLOW_MINIMAL_FIELDS", "AGGREGATE", "DENY"
	ReasonCode     string              `json:"reasonCode"`
	RequestID      string              `json:"requestId"`
	LatencyMs      int                 `json:"latencyMs"`
}

// Logger records audit events safely.
type Logger struct {
	mu     sync.RWMutex
	events []AuditEvent
	db     *sql.DB
}

func NewLogger(db *sql.DB) *Logger {
	return &Logger{
		events: make([]AuditEvent, 0, 100),
		db:     db,
	}
}

// Log records an audit event in memory and to the database if connected.
func (l *Logger) Log(ctx context.Context, evt AuditEvent) {
	if evt.Timestamp.IsZero() {
		evt.Timestamp = time.Now().UTC()
	}

	l.mu.Lock()
	// Prepend newest events to the top
	l.events = append([]AuditEvent{evt}, l.events...)
	if len(l.events) > 100 {
		l.events = l.events[:100]
	}
	l.mu.Unlock()

	// Persist to database asynchronously if DB is available
	if l.db != nil {
		go func(e AuditEvent) {
			query := `INSERT INTO audit_events 
                      (event_id, timestamp, user_reference, target_resource, outcome, policy_action, reason_code, request_id, latency_ms) 
                      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
			_, _ = l.db.Exec(query, e.EventID, e.Timestamp, e.UserReference, e.TargetResource, e.Outcome, e.PolicyAction, e.ReasonCode, e.RequestID, e.LatencyMs)
		}(evt)
	}
}

// GetEvents returns a slice of all recorded audit events for demonstrator review.
func (l *Logger) GetEvents() []AuditEvent {
	l.mu.RLock()
	defer l.mu.RUnlock()

	result := make([]AuditEvent, len(l.events))
	copy(result, l.events)
	return result
}
