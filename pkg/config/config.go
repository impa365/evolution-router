package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	// Server
	ServerPort string
	GinMode    string

	// Database
	PostgresHost     string
	PostgresPort     string
	PostgresUser     string
	PostgresPassword string
	PostgresDB       string
	PostgresSSLMode  string

	// Security
	APIKey string

	// Retry
	MaxRetryAttempts       int
	RetryDelaySeconds      int
	RetryBackoffMultiplier int

	// Logs
	LogLevel         string
	LogRetentionDays int

	// Worker
	WorkerPoolSize        int
	WebhookTimeoutSeconds int

	// Rate Limiting
	RateLimitRequests int
	RateLimitDuration int
}

func Load() *Config {
	// Tentar carregar .env (não é erro se não existir)
	_ = godotenv.Load()

	return &Config{
		// Server
		ServerPort: getEnv("SERVER_PORT", "3000"),
		GinMode:    getEnv("GIN_MODE", "debug"),

		// Database
		PostgresHost:     getEnv("POSTGRES_HOST", "localhost"),
		PostgresPort:     getEnv("POSTGRES_PORT", "5432"),
		PostgresUser:     getEnv("POSTGRES_USER", "router"),
		PostgresPassword: getEnv("POSTGRES_PASSWORD", "router123"),
		PostgresDB:       getEnv("POSTGRES_DB", "evolution_router"),
		PostgresSSLMode:  getEnv("POSTGRES_SSLMODE", "disable"),

		// Security
		APIKey: getEnv("API_KEY", "change-this-key"),

		// Retry
		MaxRetryAttempts:       getEnvInt("MAX_RETRY_ATTEMPTS", 3),
		RetryDelaySeconds:      getEnvInt("RETRY_DELAY_SECONDS", 5),
		RetryBackoffMultiplier: getEnvInt("RETRY_BACKOFF_MULTIPLIER", 2),

		// Logs
		LogLevel:         getEnv("LOG_LEVEL", "info"),
		LogRetentionDays: getEnvInt("LOG_RETENTION_DAYS", 30),

		// Worker
		WorkerPoolSize:        getEnvInt("WORKER_POOL_SIZE", 10),
		WebhookTimeoutSeconds: getEnvInt("WEBHOOK_TIMEOUT_SECONDS", 30),

		// Rate Limiting
		RateLimitRequests: getEnvInt("RATE_LIMIT_REQUESTS", 100),
		RateLimitDuration: getEnvInt("RATE_LIMIT_DURATION", 60),
	}
}

func (c *Config) GetDatabaseDSN() string {
	return "host=" + c.PostgresHost +
		" port=" + c.PostgresPort +
		" user=" + c.PostgresUser +
		" password=" + c.PostgresPassword +
		" dbname=" + c.PostgresDB +
		" sslmode=" + c.PostgresSSLMode
}

func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

func getEnvInt(key string, defaultValue int) int {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	intValue, err := strconv.Atoi(value)
	if err != nil {
		log.Printf("Warning: Invalid int value for %s, using default %d", key, defaultValue)
		return defaultValue
	}
	return intValue
}
