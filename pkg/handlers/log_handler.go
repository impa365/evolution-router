package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/EvolutionAPI/evolution-router/pkg/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type LogHandler struct {
	db *gorm.DB
}

func NewLogHandler(db *gorm.DB) *LogHandler {
	return &LogHandler{db: db}
}

// GetLogs lista logs de webhooks
// @Summary Listar logs
// @Tags Logs
// @Produce json
// @Param route_id query string false "Route ID"
// @Param limit query int false "Limit"
// @Param offset query int false "Offset"
// @Success 200 {array} models.WebhookLog
// @Router /logs [get]
// @Security ApiKeyAuth
func (h *LogHandler) GetLogs(c *gin.Context) {
	routeID := c.Query("route_id")
	limit := c.DefaultQuery("limit", "50")
	offset := c.DefaultQuery("offset", "0")

	query := h.db.Model(&models.WebhookLog{}).Order("processed_at DESC")

	if routeID != "" {
		query = query.Where("route_id = ?", routeID)
	}

	var logs []models.WebhookLog
	if err := query.Limit(parseIntOrDefault(limit, 50)).
		Offset(parseIntOrDefault(offset, 0)).
		Find(&logs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Converter logs para formato serializable
	responseLogs := make([]map[string]interface{}, len(logs))
	for i, log := range logs {
		var rawPayload map[string]interface{}
		if log.RawPayload != nil {
			json.Unmarshal(log.RawPayload, &rawPayload)
		}

		responseLogs[i] = map[string]interface{}{
			"id":              log.ID,
			"route_id":        log.RouteID,
			"source":          log.Source,
			"event_type":      log.EventType,
			"raw_payload":     rawPayload,
			"processed_at":    log.ProcessedAt,
			"filters_passed":  log.FiltersPassed,
			"targets_sent":    log.TargetsSent,
			"targets_failed":  log.TargetsFailed,
			"processing_time": log.ProcessingTime,
			"error":           log.Error,
		}
	}

	// Buscar total para paginação
	var total int64
	countQuery := h.db.Model(&models.WebhookLog{})
	if routeID != "" {
		countQuery = countQuery.Where("route_id = ?", routeID)
	}
	countQuery.Count(&total)

	c.JSON(http.StatusOK, gin.H{
		"logs":  responseLogs,
		"total": total,
	})
}

// GetLog busca um log específico
// @Summary Buscar log
// @Tags Logs
// @Produce json
// @Param id path string true "Log ID"
// @Success 200 {object} models.WebhookLog
// @Router /logs/{id} [get]
// @Security ApiKeyAuth
func (h *LogHandler) GetLog(c *gin.Context) {
	id := c.Param("id")

	var log models.WebhookLog
	if err := h.db.Preload("RetryLogs").First(&log, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Log not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Converter para formato serializable
	var rawPayload map[string]interface{}
	if log.RawPayload != nil {
		json.Unmarshal(log.RawPayload, &rawPayload)
	}

	response := map[string]interface{}{
		"id":              log.ID,
		"route_id":        log.RouteID,
		"source":          log.Source,
		"event_type":      log.EventType,
		"raw_payload":     rawPayload,
		"processed_at":    log.ProcessedAt,
		"filters_passed":  log.FiltersPassed,
		"targets_sent":    log.TargetsSent,
		"targets_failed":  log.TargetsFailed,
		"processing_time": log.ProcessingTime,
		"error":           log.Error,
	}

	c.JSON(http.StatusOK, response)
}

// GetStats retorna estatísticas gerais
// @Summary Estatísticas
// @Tags Logs
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /stats [get]
// @Security ApiKeyAuth
func (h *LogHandler) GetStats(c *gin.Context) {
	var totalLogs int64
	var successLogs int64
	var failedLogs int64

	h.db.Model(&models.WebhookLog{}).Count(&totalLogs)
	h.db.Model(&models.WebhookLog{}).Where("filters_passed = ? AND targets_failed = ?", true, 0).Count(&successLogs)
	h.db.Model(&models.WebhookLog{}).Where("targets_failed > ?", 0).Count(&failedLogs)

	var totalRoutes int64
	h.db.Model(&models.Route{}).Count(&totalRoutes)

	c.JSON(http.StatusOK, gin.H{
		"total_webhooks":      totalLogs,
		"successful_webhooks": successLogs,
		"failed_webhooks":     failedLogs,
		"total_routes":        totalRoutes,
	})
}

func parseIntOrDefault(s string, defaultValue int) int {
	var i int
	if _, err := fmt.Sscanf(s, "%d", &i); err != nil {
		return defaultValue
	}
	return i
}
