package handlers

import (
	"net/http"

	"github.com/EvolutionAPI/evolution-router/pkg/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TargetHandler struct {
	db *gorm.DB
}

func NewTargetHandler(db *gorm.DB) *TargetHandler {
	return &TargetHandler{db: db}
}

// CreateTarget cria um novo target
// @Summary Criar target
// @Tags Targets
// @Accept json
// @Produce json
// @Param route_id path string true "Route ID"
// @Param target body models.Target true "Target"
// @Success 201 {object} models.Target
// @Router /routes/{route_id}/targets [post]
// @Security ApiKeyAuth
func (h *TargetHandler) CreateTarget(c *gin.Context) {
	routeID := c.Param("id")

	var target models.Target
	if err := c.ShouldBindJSON(&target); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	target.RouteID = routeID

	if err := h.db.Create(&target).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, target)
}

// GetTargets lista targets de uma rota
// @Summary Listar targets
// @Tags Targets
// @Produce json
// @Param route_id path string true "Route ID"
// @Success 200 {array} models.Target
// @Router /routes/{route_id}/targets [get]
// @Security ApiKeyAuth
func (h *TargetHandler) GetTargets(c *gin.Context) {
	routeID := c.Param("id")

	var targets []models.Target
	if err := h.db.Find(&targets, "route_id = ?", routeID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, targets)
}

// UpdateTarget atualiza um target
// @Summary Atualizar target
// @Tags Targets
// @Accept json
// @Produce json
// @Param id path string true "Target ID"
// @Param target body models.Target true "Target"
// @Success 200 {object} models.Target
// @Router /targets/{id} [put]
// @Security ApiKeyAuth
func (h *TargetHandler) UpdateTarget(c *gin.Context) {
	id := c.Param("id")

	var target models.Target
	if err := h.db.First(&target, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Target not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var updates models.Target
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Model(&target).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, target)
}

// DeleteTarget deleta um target
// @Summary Deletar target
// @Tags Targets
// @Param id path string true "Target ID"
// @Success 204
// @Router /targets/{id} [delete]
// @Security ApiKeyAuth
func (h *TargetHandler) DeleteTarget(c *gin.Context) {
	id := c.Param("id")

	if err := h.db.Delete(&models.Target{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
