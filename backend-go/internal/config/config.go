package config

import (
	"os"
)

// Config holds all configuration parameters for the Go security backend.
type Config struct {
	Port        string
	Host        string
	DBHost      string
	DBPort      string
	DBUser      string
	DBPassword  string
	DBName      string
	DBSSLMode   string
	AIEngineURL string
	Environment string
}

// Load reads configuration from environment variables with safe defaults.
func Load() *Config {
	return &Config{
		Port:        getEnv("PORT", getEnv("BACKEND_PORT", "8080")),
		Host:        getEnv("HOST", getEnv("BACKEND_HOST", "0.0.0.0")),
		DBHost:      getEnv("DB_HOST", "localhost"),
		DBPort:      getEnv("DB_PORT", "5432"),
		DBUser:      getEnv("DB_USER", "secureai_user"),
		DBPassword:  getEnv("DB_PASSWORD", "secureai_pass"),
		DBName:      getEnv("DB_NAME", "secureai"),
		DBSSLMode:   getEnv("DB_SSLMODE", "disable"),
		AIEngineURL: getEnv("AI_ENGINE_URL", "http://127.0.0.1:8000"),
		Environment: getEnv("ENVIRONMENT", "development"),
	}
}

func getEnv(key, defaultVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defaultVal
}
