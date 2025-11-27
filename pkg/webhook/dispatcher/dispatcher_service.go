package dispatcher

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"sync"
	"time"

	"github.com/EvolutionAPI/evolution-router/pkg/config"
	"github.com/EvolutionAPI/evolution-router/pkg/models"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type DispatchJob struct {
	WebhookLogID string
	Target       models.Target
	Payload      map[string]interface{}
}

type Dispatcher struct {
	db         *gorm.DB
	config     *config.Config
	jobQueue   chan DispatchJob
	workers    int
	wg         sync.WaitGroup
	httpClient *http.Client
	shutdown   chan struct{}
}

func NewDispatcher(db *gorm.DB, cfg *config.Config) *Dispatcher {
	return &Dispatcher{
		db:       db,
		config:   cfg,
		jobQueue: make(chan DispatchJob, 1000),
		workers:  cfg.WorkerPoolSize,
		httpClient: &http.Client{
			Timeout: time.Duration(cfg.WebhookTimeoutSeconds) * time.Second,
		},
		shutdown: make(chan struct{}),
	}
}

// StartWorkers inicia os workers para processar webhooks
func (d *Dispatcher) StartWorkers() {
	log.Printf("🚀 Iniciando %d workers para dispatcher", d.workers)
	for i := 0; i < d.workers; i++ {
		d.wg.Add(1)
		go d.worker(i)
	}
}

// Stop para os workers
func (d *Dispatcher) Stop() {
	close(d.shutdown)
	d.wg.Wait()
	log.Println("✅ Todos os workers foram finalizados")
}

// DispatchWebhook adiciona um job na fila
func (d *Dispatcher) DispatchWebhook(webhookLogID string, target models.Target, payload map[string]interface{}) error {
	job := DispatchJob{
		WebhookLogID: webhookLogID,
		Target:       target,
		Payload:      payload,
	}

	select {
	case d.jobQueue <- job:
		return nil
	default:
		return fmt.Errorf("job queue is full")
	}
}

// worker processa jobs da fila
func (d *Dispatcher) worker(id int) {
	defer d.wg.Done()
	log.Printf("Worker %d iniciado", id)

	for {
		select {
		case <-d.shutdown:
			log.Printf("Worker %d finalizado", id)
			return
		case job := <-d.jobQueue:
			d.processJob(job)
		}
	}
}

// processJob processa um job individual
func (d *Dispatcher) processJob(job DispatchJob) {
	maxAttempts := d.config.MaxRetryAttempts
	retryDelay := time.Duration(d.config.RetryDelaySeconds) * time.Second
	backoffMultiplier := d.config.RetryBackoffMultiplier

	for attempt := 1; attempt <= maxAttempts; attempt++ {
		retryLog := &models.RetryLog{
			WebhookLogID: job.WebhookLogID,
			TargetID:     job.Target.ID,
			Attempt:      attempt,
			AttemptedAt:  time.Now(),
		}

		// Enviar webhook
		statusCode, response, err := d.sendWebhook(job.Target, job.Payload)

		retryLog.StatusCode = statusCode
		if response != nil {
			responseJSON, _ := json.Marshal(response)
			retryLog.Response = datatypes.JSON(responseJSON)
		}

		if err != nil {
			retryLog.Status = "failed"
			retryLog.Error = err.Error()

			// Se não é o último attempt, calcular próximo retry
			if attempt < maxAttempts {
				nextRetry := time.Now().Add(retryDelay)
				retryLog.NextRetryAt = &nextRetry

				// Salvar log
				d.db.Create(retryLog)

				// Aguardar antes da próxima tentativa
				time.Sleep(retryDelay)

				// Aumentar delay com backoff
				retryDelay = retryDelay * time.Duration(backoffMultiplier)
				continue
			}

			// Última tentativa falhou
			d.db.Create(retryLog)
			log.Printf("❌ Falha ao enviar webhook para %s após %d tentativas", job.Target.URL, maxAttempts)
			return
		}

		// Sucesso
		retryLog.Status = "success"
		d.db.Create(retryLog)
		log.Printf("✅ Webhook enviado com sucesso para %s (attempt %d)", job.Target.URL, attempt)
		return
	}
}

// sendWebhook envia o webhook para o target
func (d *Dispatcher) sendWebhook(target models.Target, payload map[string]interface{}) (int, map[string]interface{}, error) {
	// Serializar payload
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return 0, nil, fmt.Errorf("error marshaling payload: %w", err)
	}

	// Criar request
	req, err := http.NewRequest(target.Method, target.URL, bytes.NewBuffer(payloadBytes))
	if err != nil {
		return 0, nil, fmt.Errorf("error creating request: %w", err)
	}

	// Adicionar headers
	req.Header.Set("Content-Type", "application/json")
	if len(target.Headers) > 0 {
		var headers map[string]string
		if err := json.Unmarshal(target.Headers, &headers); err == nil {
			for key, value := range headers {
				req.Header.Set(key, value)
			}
		}
	}

	// Enviar request
	resp, err := d.httpClient.Do(req)
	if err != nil {
		return 0, nil, fmt.Errorf("error sending request: %w", err)
	}
	defer resp.Body.Close()

	// Ler resposta
	responseBody, _ := io.ReadAll(resp.Body)
	var responseData map[string]interface{}

	// Tentar parsear como JSON
	if err := json.Unmarshal(responseBody, &responseData); err != nil {
		// Se não for JSON válido, salvar como string
		responseData = map[string]interface{}{
			"raw_response": string(responseBody),
		}
	}

	// Verificar status code
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		if responseData == nil {
			responseData = map[string]interface{}{
				"error":       "Empty response body",
				"status_code": resp.StatusCode,
			}
		}
		return resp.StatusCode, responseData, fmt.Errorf("received status code %d: %s", resp.StatusCode, string(responseBody))
	}

	// Verificar se o corpo da resposta indica erro (mesmo com status 200)
	if errorMsg, hasError := responseData["error"]; hasError {
		return resp.StatusCode, responseData, fmt.Errorf("endpoint returned error: %v", errorMsg)
	}
	if success, hasSuccess := responseData["success"]; hasSuccess {
		if successBool, ok := success.(bool); ok && !successBool {
			return resp.StatusCode, responseData, fmt.Errorf("endpoint returned success=false")
		}
	}

	return resp.StatusCode, responseData, nil
}
