package routes

import (
	"net/http"

	"github.com/EvolutionAPI/evolution-router/pkg/config"
	"github.com/EvolutionAPI/evolution-router/pkg/handlers"
	"github.com/EvolutionAPI/evolution-router/pkg/middleware"
	"github.com/EvolutionAPI/evolution-router/pkg/webhook/dispatcher"
	"github.com/EvolutionAPI/evolution-router/pkg/webhook/receiver"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Setup(router *gin.Engine, db *gorm.DB, cfg *config.Config, dispatcherService *dispatcher.Dispatcher) {
	// Servir o manager web (arquivos estáticos)
	router.Static("/assets", "./manager/dist/assets")

	// Rota do manager (SPA routing)
	router.GET("/manager/*any", func(c *gin.Context) {
		c.File("manager/dist/index.html")
	})

	router.GET("/manager", func(c *gin.Context) {
		c.File("manager/dist/index.html")
	})

	// Redirect raiz para manager
	router.GET("/", func(c *gin.Context) {
		c.Redirect(http.StatusMovedPermanently, "/manager")
	})

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "ok"})
	})

	// Inicializar serviços
	receiverService := receiver.NewReceiverService(db, dispatcherService)

	// Inicializar handlers
	routeHandler := handlers.NewRouteHandler(db)
	targetHandler := handlers.NewTargetHandler(db)
	filterHandler := handlers.NewFilterHandler(db)
	fieldMappingHandler := handlers.NewFieldMappingHandler(db)
	webhookHandler := handlers.NewWebhookHandler(receiverService)
	logHandler := handlers.NewLogHandler(db)

	// Webhook receiver (sem autenticação para facilitar integração)
	router.POST("/webhook/:source/:route_id", webhookHandler.ReceiveWebhook)

	// API routes (com autenticação)
	api := router.Group("/api/v1")
	api.Use(middleware.AuthMiddleware(cfg))
	{
		// Routes
		routes := api.Group("/routes")
		{
			routes.POST("", routeHandler.CreateRoute)
			routes.GET("", routeHandler.GetRoutes)
			routes.GET("/:id", routeHandler.GetRoute)
			routes.PUT("/:id", routeHandler.UpdateRoute)
			routes.DELETE("/:id", routeHandler.DeleteRoute)
		}

		// Targets
		api.POST("/routes/:id/targets", targetHandler.CreateTarget)
		api.GET("/routes/:id/targets", targetHandler.GetTargets)

		// Filters
		api.POST("/routes/:id/filters", filterHandler.CreateFilter)
		api.GET("/routes/:id/filters", filterHandler.GetFilters)

		// Field Mappings
		api.POST("/routes/:id/field-mappings", fieldMappingHandler.CreateFieldMapping)
		api.GET("/routes/:id/field-mappings", fieldMappingHandler.GetFieldMappings)

		// Targets (individual)
		api.PUT("/targets/:id", targetHandler.UpdateTarget)
		api.DELETE("/targets/:id", targetHandler.DeleteTarget)

		// Filters (individual)
		api.PUT("/filters/:id", filterHandler.UpdateFilter)
		api.DELETE("/filters/:id", filterHandler.DeleteFilter)

		// Field Mappings (individual)
		api.PUT("/field-mappings/:id", fieldMappingHandler.UpdateFieldMapping)
		api.DELETE("/field-mappings/:id", fieldMappingHandler.DeleteFieldMapping)

		// Logs
		api.GET("/logs", logHandler.GetLogs)
		api.GET("/logs/:id", logHandler.GetLog)

		// Stats
		api.GET("/stats", logHandler.GetStats)
	}
}
