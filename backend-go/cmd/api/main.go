package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/DadiBhagyavathi/Datathon_Z_IBM/backend-go/internal/ai_client"
	"github.com/DadiBhagyavathi/Datathon_Z_IBM/backend-go/internal/api"
	"github.com/DadiBhagyavathi/Datathon_Z_IBM/backend-go/internal/audit"
	"github.com/DadiBhagyavathi/Datathon_Z_IBM/backend-go/internal/config"
	"github.com/DadiBhagyavathi/Datathon_Z_IBM/backend-go/internal/retrieval"
)

func main() {
	log.Println("🛡️  Starting SecureAI Gateway Go Backend...")

	// 1. Load configuration
	cfg := config.Load()
	log.Printf("Environment: %s | Port: %s | AI Engine URL: %s", cfg.Environment, cfg.Port, cfg.AIEngineURL)

	// 2. Initialize Data Store
	// Attempt PostgreSQL connection; fall back to synthetic memory store if offline
	var store retrieval.Store
	connStr := fmt.Sprintf("host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBSSLMode)

	pgStore, err := retrieval.NewPostgresStore(connStr)
	if err == nil {
		log.Println("Connected to PostgreSQL database successfully.")
		store = pgStore
	} else {
		log.Printf("PostgreSQL not accessible (%v). Using preloaded synthetic in-memory store.", err)
		store = retrieval.NewMemoryStore()
	}
	defer store.Close()

	// 3. Initialize Audit Logger
	auditLogger := audit.NewLogger(nil)
	log.Println("Privacy-conscious audit logger initialized.")

	// 4. Initialize AI Engine Client
	aiClient := ai_client.NewHTTPClient(cfg.AIEngineURL)

	// 5. Setup Router & Server
	server := api.NewServer(store, aiClient, auditLogger)
	handler := server.SetupRouter()

	addr := fmt.Sprintf("%s:%s", cfg.Host, cfg.Port)
	httpServer := &http.Server{
		Addr:         addr,
		Handler:      handler,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	// 6. Graceful Shutdown Listener
	stop := make(chan os.Signal, 1)
	signal.Notify(stop, os.Interrupt, syscall.SIGTERM)

	go func() {
		log.Printf("🚀 SecureAI Gateway running at http://%s", addr)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server failed to listen: %v", err)
		}
	}()

	<-stop
	log.Println("Shutting down SecureAI Gateway...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := httpServer.Shutdown(ctx); err != nil {
		log.Printf("Server shutdown error: %v", err)
	}
	log.Println("Server stopped safely.")
}
