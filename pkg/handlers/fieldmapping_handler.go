package handlers

import (
	"net/http"

	"github.com/EvolutionAPI/evolution-router/pkg/models"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type FieldMappingHandler struct {
	db *gorm.DB
}

func NewFieldMappingHandler(db *gorm.DB) *FieldMappingHandler {
	return &FieldMappingHandler{db: db}
}

// CreateFieldMapping cria um novo mapeamento de campo
// @Summary Criar field mapping
// @Tags FieldMappings
// @Accept json
// @Produce json
// @Param route_id path string true "Route ID"
// @Param mapping body models.FieldMapping true "FieldMapping"
// @Success 201 {object} models.FieldMapping
// @Router /routes/{route_id}/field-mappings [post]
// @Security ApiKeyAuth
func (h *FieldMappingHandler) CreateFieldMapping(c *gin.Context) {
	routeID := c.Param("id")

	var mapping models.FieldMapping
	if err := c.ShouldBindJSON(&mapping); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	mapping.RouteID = routeID

	if err := h.db.Create(&mapping).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, mapping)
}

// GetFieldMappings lista mapeamentos de uma rota
// @Summary Listar field mappings
// @Tags FieldMappings
// @Produce json
// @Param route_id path string true "Route ID"
// @Success 200 {array} models.FieldMapping
// @Router /routes/{route_id}/field-mappings [get]
// @Security ApiKeyAuth
func (h *FieldMappingHandler) GetFieldMappings(c *gin.Context) {
	routeID := c.Param("id")

	var mappings []models.FieldMapping
	if err := h.db.Find(&mappings, "route_id = ?", routeID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, mappings)
}

// UpdateFieldMapping atualiza um mapeamento
// @Summary Atualizar field mapping
// @Tags FieldMappings
// @Accept json
// @Produce json
// @Param id path string true "FieldMapping ID"
// @Param mapping body models.FieldMapping true "FieldMapping"
// @Success 200 {object} models.FieldMapping
// @Router /field-mappings/{id} [put]
// @Security ApiKeyAuth
func (h *FieldMappingHandler) UpdateFieldMapping(c *gin.Context) {
	id := c.Param("id")

	var mapping models.FieldMapping
	if err := h.db.First(&mapping, "id = ?", id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, gin.H{"error": "FieldMapping not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var updates models.FieldMapping
	if err := c.ShouldBindJSON(&updates); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.db.Model(&mapping).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, mapping)
}

// DeleteFieldMapping deleta um mapeamento
// @Summary Deletar field mapping
// @Tags FieldMappings
// @Param id path string true "FieldMapping ID"
// @Success 204
// @Router /field-mappings/{id} [delete]
// @Security ApiKeyAuth
func (h *FieldMappingHandler) DeleteFieldMapping(c *gin.Context) {
	id := c.Param("id")

	if err := h.db.Delete(&models.FieldMapping{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.Status(http.StatusNoContent)
}
