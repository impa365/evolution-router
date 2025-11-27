package handlers

import (
	"net/http"

	"github.com/EvolutionAPI/evolution-router/pkg/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type RouteHandler struct {
	db *gorm.DB
}

func NewRouteHandler(db *gorm.DB) *RouteHandler {
	return &RouteHandler{db: db}
}

// CreateRoute cria uma nova rota
// @Summary Criar rota
// @Tags Routes
// @Accept json
// @Produce json
// @Param route body models.Route true "Route"
// @Success 201 {object} models.Route
// @Router /routes [post]
// @Security ApiKeyAuth
func (h *RouteHandler) CreateRoute(c *gin.Context) {
	var route models.Route
	if err := c.ShouldBindJSON(&route); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Create(&route).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, route)
}

// GetRoutes lista todas as rotas
// @Summary Listar rotas
// @Tags Routes
// @Produce json
// @Success 200 {array} models.Route
// @Router /routes [get]
// @Security ApiKeyAuth
func (h *RouteHandler) GetRoutes(c *gin.Context) {
	var routes []models.Route
	if err := h.db.Preload("Targets").Preload("Filters").Preload("FieldMappings").Find(&routes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, routes)
}

// GetRoute busca uma rota por ID
// @Summary Buscar rota
// @Tags Routes
// @Produce json
// @Param id path string true "Route ID"
// @Success 200 {object} models.Route
// @Router /routes/{id} [get]
// @Security ApiKeyAuth
func (h *RouteHandler) GetRoute(c *gin.Context) {
	id := c.Param("id")

	var route models.Route
	if err := h.db.Preload("Targets").Preload("Filters").Preload("FieldMappings").First(&route, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Route not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, route)
}

// UpdateRoute atualiza uma rota
// @Summary Atualizar rota
// @Tags Routes
// @Accept json
// @Produce json
// @Param id path string true "Route ID"
// @Param route body models.Route true "Route"
// @Success 200 {object} models.Route
// @Router /routes/{id} [put]
// @Security ApiKeyAuth
func (h *RouteHandler) UpdateRoute(c *gin.Context) {
	id := c.Param("id")

	var route models.Route
	if err := h.db.First(&route, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "Route not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var updates models.Route
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Model(&route).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, route)
}

// DeleteRoute deleta uma rota
// @Summary Deletar rota
// @Tags Routes
// @Param id path string true "Route ID"
// @Success 204
// @Router /routes/{id} [delete]
// @Security ApiKeyAuth
func (h *RouteHandler) DeleteRoute(c *gin.Context) {
	id := c.Param("id")

	if err := h.db.Delete(&models.Route{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
