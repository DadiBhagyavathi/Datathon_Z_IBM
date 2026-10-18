package api

import (
	"net/http"

	"github.com/DadiBhagyavathi/Datathon_Z_IBM/backend-go/internal/middleware"
)

// SetupRouter creates the HTTP handler with all registered endpoints and middleware.
func (s *Server) SetupRouter() http.Handler {
	mux := http.NewServeMux()

	// Root route
	mux.HandleFunc("/", s.RootHandler)

	// API v1 routes
	mux.HandleFunc("/api/v1/health", s.HealthHandler)
	mux.HandleFunc("/api/v1/me", s.MeHandler)
	mux.HandleFunc("/api/v1/audit", s.AuditHandler)
	mux.HandleFunc("/api/v1/chat", s.ChatHandler)

	// Wrap in middleware chain
	var handler http.Handler = mux
	handler = middleware.Logging(handler)
	handler = middleware.CORS(handler)
	handler = middleware.Recovery(handler)

	return handler
}
