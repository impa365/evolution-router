package handlers

import (
	"net/http"

	"github.com/EvolutionAPI/evolution-router/pkg/webhook/receiver"
	"github.com/gin-gonic/gin"
)

type WebhookHandler struct {
	receiverService *receiver.ReceiverService
}

func NewWebhookHandler(receiverService *receiver.ReceiverService) *WebhookHandler {
	return &WebhookHandler{
		receiverService: receiverService,
	}
}

// ReceiveWebhook recebe um webhook
// @Summary Receber webhook
// @Tags Webhooks
// @Accept json
// @Produce json
// @Param source path string true "Source (evolution, n8n, zapier, custom)"
// @Param route_id path string true "Route ID"
// @Param payload body map[string]interface{} true "Payload"
// @Success 200 {object} models.WebhookLog
// @Router /webhook/{source}/{route_id} [post]
func (h *WebhookHandler) ReceiveWebhook(c *gin.Context) {
	source := c.Param("source")
	routeID := c.Param("route_id")

	var payload map[string]interface{}
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON payload"})
		return
	}

	// Adicionar informações do source ao payload se não existir
	if _, ok := payload["source"]; !ok {
		payload["source"] = source
	}

	// Processar webhook (validando source)
	log, err := h.receiverService.ProcessWebhook(routeID, source, payload)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Webhook received successfully",
		"log":     log,
	})
}
