package handlers

import (
	"net/http"

	"github.com/EvolutionAPI/evolution-router/pkg/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type FilterHandler struct {
	db *gorm.DB
}

func NewFilterHandler(db *gorm.DB) *FilterHandler {
	return &FilterHandler{db: db}
}

// CreateFilter cria um novo filtro
// @Summary Criar filtro
// @Tags Filters
// @Accept json
// @Produce json
// @Param route_id path string true "Route ID"
// @Param filter body models.Filter true "Filter"
// @Success 201 {object} models.Filter
// @Router /routes/{route_id}/filters [post]
// @Security ApiKeyAuth
func (h *FilterHandler) CreateFilter(c *gin.Context) {
	routeID := c.Param("id")

	var filter models.Filter
	if err := c.ShouldBindJSON(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	filter.RouteID = routeID

	if err := h.db.Create(&filter).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, filter)
}

// GetFilters lista filtros de uma rota
// @Summary Listar filtros
// @Tags Filters
// @Produce json
// @Param route_id path string true "Route ID"
// @Success 200 {array} models.Filter
// @Router /routes/{route_id}/filters [get]
// @Security ApiKeyAuth
func (h *FilterHandler) GetFilters(c *gin.Context) {
	routeID := c.Param("id")

	var filters []models.Filter
	if err := h.db.Find(&filters, "route_id = ?", routeID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, filters)
}

// UpdateFilter atualiza um filtro
// @Summary Atualizar filtro
// @Tags Filters
// @Accept json
// @Produce json
// @Param id path string true "Filter ID"
// @Param filter body models.Filter true "Filter"
// @Success 200 {object} models.Filter
// @Router /filters/{id} [put]
// @Security ApiKeyAuth
func (h *FilterHandler) UpdateFilter(c *gin.Context) {
	id := c.Param("id")

	var filter models.Filter
	if err := h.db.First(&filter, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Filter not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var updates models.Filter
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Model(&filter).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, filter)
}

// DeleteFilter deleta um filtro
// @Summary Deletar filtro
// @Tags Filters
// @Param id path string true "Filter ID"
// @Success 204
// @Router /filters/{id} [delete]
// @Security ApiKeyAuth
func (h *FilterHandler) DeleteFilter(c *gin.Context) {
	id := c.Param("id")

	if err := h.db.Delete(&models.Filter{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
