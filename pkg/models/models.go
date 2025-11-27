package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

// Route representa uma rota de webhook
type Route struct {
	ID          string    `gorm:"type:uuid;primary_key" json:"id"`
	Name        string    `gorm:"type:varchar(255);not null" json:"name" binding:"required"`
	Description string    `gorm:"type:text" json:"description"`
	Source      string    `gorm:"type:varchar(100);not null;index" json:"source" binding:"required"` // evolution-api, n8n, zapier, custom
	Enabled     bool      `gorm:"default:true" json:"enabled"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relacionamentos
	Targets       []Target       `gorm:"foreignKey:RouteID;constraint:OnDelete:CASCADE" json:"targets,omitempty"`
	Filters       []Filter       `gorm:"foreignKey:RouteID;constraint:OnDelete:CASCADE" json:"filters,omitempty"`
	FieldMappings []FieldMapping `gorm:"foreignKey:RouteID;constraint:OnDelete:CASCADE" json:"field_mappings,omitempty"`
	Logs          []WebhookLog   `gorm:"foreignKey:RouteID;constraint:OnDelete:CASCADE" json:"-"`
}

// BeforeCreate hook para gerar UUID
func (r *Route) BeforeCreate(tx *gorm.DB) error {
	if r.ID == "" {
		r.ID = uuid.New().String()
	}
	return nil
}

// Target representa um destino de webhook
type Target struct {
	ID        string         `gorm:"type:uuid;primary_key" json:"id"`
	RouteID   string         `gorm:"type:uuid;not null;index" json:"route_id"`
	Name      string         `gorm:"type:varchar(255);not null" json:"name" binding:"required"`
	URL       string         `gorm:"type:text;not null" json:"url" binding:"required,url"`
	Method    string         `gorm:"type:varchar(10);default:'POST'" json:"method"` // POST, PUT, PATCH
	Headers   datatypes.JSON `gorm:"type:jsonb" json:"headers"`
	Enabled   bool           `gorm:"default:true" json:"enabled"`
	Priority  int            `gorm:"default:0" json:"priority"` // Ordem de execução
	Timeout   int            `gorm:"default:30" json:"timeout"` // Segundos
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`

	// Relacionamentos
	RetryLogs []RetryLog `gorm:"foreignKey:TargetID;constraint:OnDelete:CASCADE" json:"-"`
}

func (t *Target) BeforeCreate(tx *gorm.DB) error {
	if t.ID == "" {
		t.ID = uuid.New().String()
	}
	return nil
}

// Filter representa um filtro de eventos
type Filter struct {
	ID        string    `gorm:"type:uuid;primary_key" json:"id"`
	RouteID   string    `gorm:"type:uuid;not null;index" json:"route_id"`
	Type      string    `gorm:"type:varchar(50);not null" json:"type" binding:"required"` // event_type, field_value, custom
	FieldPath string    `gorm:"type:varchar(500)" json:"field_path"`                      // Ex: data.message.text
	Condition string    `gorm:"type:varchar(50);not null" json:"condition"`               // equals, contains, regex, exists, gt, lt
	Value     string    `gorm:"type:text" json:"value"`
	Enabled   bool      `gorm:"default:true" json:"enabled"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

func (f *Filter) BeforeCreate(tx *gorm.DB) error {
	if f.ID == "" {
		f.ID = uuid.New().String()
	}
	return nil
}

// FieldMapping representa o mapeamento de campos para transformação
type FieldMapping struct {
	ID            string    `gorm:"type:uuid;primary_key" json:"id"`
	RouteID       string    `gorm:"type:uuid;not null;index" json:"route_id"`
	SourceField   string    `gorm:"type:varchar(500);not null" json:"source_field" binding:"required"` // Campo de origem (ex: data.message.text)
	TargetField   string    `gorm:"type:varchar(500);not null" json:"target_field" binding:"required"` // Campo de destino (ex: message)
	TransformType string    `gorm:"type:varchar(50);default:'direct'" json:"transform_type"`           // direct, uppercase, lowercase, custom
	DefaultValue  string    `gorm:"type:text" json:"default_value"`
	Enabled       bool      `gorm:"default:true" json:"enabled"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

func (fm *FieldMapping) BeforeCreate(tx *gorm.DB) error {
	if fm.ID == "" {
		fm.ID = uuid.New().String()
	}
	return nil
}

// WebhookLog armazena logs de webhooks recebidos e processados
type WebhookLog struct {
	ID             string         `gorm:"type:uuid;primary_key" json:"id"`
	RouteID        string         `gorm:"type:uuid;not null;index" json:"route_id"`
	Source         string         `gorm:"type:varchar(100);index" json:"source"`
	EventType      string         `gorm:"type:varchar(100);index" json:"event_type"`
	RawPayload     datatypes.JSON `gorm:"type:jsonb" json:"raw_payload"`
	ProcessedAt    time.Time      `gorm:"index" json:"processed_at"`
	FiltersPassed  bool           `json:"filters_passed"`
	TargetsSent    int            `json:"targets_sent"`
	TargetsFailed  int            `json:"targets_failed"`
	ProcessingTime int            `json:"processing_time_ms"` // Tempo em millisegundos
	Error          string         `gorm:"type:text" json:"error,omitempty"`

	// Relacionamentos
	RetryLogs []RetryLog `gorm:"foreignKey:WebhookLogID;constraint:OnDelete:CASCADE" json:"-"`
}

func (wl *WebhookLog) BeforeCreate(tx *gorm.DB) error {
	if wl.ID == "" {
		wl.ID = uuid.New().String()
	}
	if wl.ProcessedAt.IsZero() {
		wl.ProcessedAt = time.Now()
	}
	return nil
}

// RetryLog armazena tentativas de reenvio
type RetryLog struct {
	ID           string         `gorm:"type:uuid;primary_key" json:"id"`
	WebhookLogID string         `gorm:"type:uuid;not null;index" json:"webhook_log_id"`
	TargetID     string         `gorm:"type:uuid;not null;index" json:"target_id"`
	Attempt      int            `gorm:"not null" json:"attempt"`
	Status       string         `gorm:"type:varchar(50)" json:"status"` // success, failed, pending
	StatusCode   int            `json:"status_code"`
	Response     datatypes.JSON `gorm:"type:jsonb" json:"response"`
	Error        string         `gorm:"type:text" json:"error,omitempty"`
	AttemptedAt  time.Time      `gorm:"index" json:"attempted_at"`
	NextRetryAt  *time.Time     `json:"next_retry_at,omitempty"`
}

func (rl *RetryLog) BeforeCreate(tx *gorm.DB) error {
	if rl.ID == "" {
		rl.ID = uuid.New().String()
	}
	if rl.AttemptedAt.IsZero() {
		rl.AttemptedAt = time.Now()
	}
	return nil
}
