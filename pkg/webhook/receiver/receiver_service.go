package receiver

import (
	"encoding/json"
	"time"

	"github.com/EvolutionAPI/evolution-router/pkg/models"
	"github.com/EvolutionAPI/evolution-router/pkg/webhook/dispatcher"
	"github.com/EvolutionAPI/evolution-router/pkg/webhook/filter"
	"github.com/EvolutionAPI/evolution-router/pkg/webhook/transformer"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type ReceiverService struct {
	db                 *gorm.DB
	filterService      *filter.FilterService
	transformerService *transformer.TransformerService
	dispatcher         *dispatcher.Dispatcher
}

func NewReceiverService(db *gorm.DB, dispatcherService *dispatcher.Dispatcher) *ReceiverService {
	return &ReceiverService{
		db:                 db,
		filterService:      filter.NewFilterService(),
		transformerService: transformer.NewTransformerService(),
		dispatcher:         dispatcherService,
	}
}

// ProcessWebhook processa um webhook recebido
func (s *ReceiverService) ProcessWebhook(routeID string, sourceFromURL string, payload map[string]interface{}) (*models.WebhookLog, error) {
	startTime := time.Now()

	// Buscar rota com relacionamentos
	var route models.Route
	if err := s.db.Preload("Filters").Preload("FieldMappings").Preload("Targets").
		First(&route, "id = ? AND enabled = ? AND source = ?", routeID, true, sourceFromURL).Error; err != nil {
		return nil, err
	}

	// Criar log inicial
	payloadJSON, _ := json.Marshal(payload)
	log := &models.WebhookLog{
		RouteID:     route.ID,
		Source:      route.Source,
		RawPayload:  datatypes.JSON(payloadJSON),
		ProcessedAt: time.Now(),
	}

	// Extrair event type do payload
	if eventType, ok := payload["event"].(string); ok {
		log.EventType = eventType
	} else if eventType, ok := payload["event_type"].(string); ok {
		log.EventType = eventType
	}

	// Aplicar filtros
	filtersPassed, err := s.filterService.ApplyFilters(route.Filters, payload)
	if err != nil {
		log.Error = err.Error()
		log.FiltersPassed = false
		log.ProcessingTime = int(time.Since(startTime).Milliseconds())
		s.db.Create(log)
		return log, err
	}

	log.FiltersPassed = filtersPassed

	// Se não passou nos filtros, salvar log e retornar
	if !filtersPassed {
		log.ProcessingTime = int(time.Since(startTime).Milliseconds())
		s.db.Create(log)
		return log, nil
	}

	// Aplicar transformação de campos
	transformedPayload, err := s.transformerService.TransformPayload(route.FieldMappings, payload)
	if err != nil {
		log.Error = err.Error()
		log.ProcessingTime = int(time.Since(startTime).Milliseconds())
		s.db.Create(log)
		return log, err
	}

	// Se não há mapeamentos, usar payload original
	if len(route.FieldMappings) == 0 {
		transformedPayload = payload
	}

	// Salvar log antes de disparar para obter ID
	log.ProcessingTime = int(time.Since(startTime).Milliseconds())
	if err := s.db.Create(log).Error; err != nil {
		return nil, err
	}

	// Disparar para todos os targets ativos e aguardar resultados
	targetsSent := 0
	targetsFailed := 0
	var resultChannels []chan dispatcher.DispatchResult

	for _, target := range route.Targets {
		if !target.Enabled {
			continue
		}

		// Enviar para o dispatcher e coletar channel de resultado
		resultChan := s.dispatcher.DispatchWebhook(log.ID, target, transformedPayload)
		resultChannels = append(resultChannels, resultChan)
	}

	// Aguardar todos os resultados
	for _, resultChan := range resultChannels {
		result := <-resultChan
		if result.Success {
			targetsSent++
		} else {
			targetsFailed++
		}
	}

	// Atualizar contadores
	log.TargetsSent = targetsSent
	log.TargetsFailed = targetsFailed
	s.db.Save(log)

	return log, nil
}

// GetRouteByID busca uma rota por ID
func (s *ReceiverService) GetRouteByID(routeID string) (*models.Route, error) {
	var route models.Route
	if err := s.db.Preload("Filters").Preload("FieldMappings").Preload("Targets").
		First(&route, "id = ?", routeID).Error; err != nil {
		return nil, err
	}
	return &route, nil
}
