package database

import (
	"log"

	"github.com/EvolutionAPI/evolution-router/pkg/models"
	"gorm.io/gorm"
)

func RunMigrations(db *gorm.DB) error {
	log.Println("🔄 Executando migrations...")

	err := db.AutoMigrate(
		&models.Route{},
		&models.Target{},
		&models.Filter{},
		&models.FieldMapping{},
		&models.WebhookLog{},
		&models.RetryLog{},
	)

	if err != nil {
		return err
	}

	log.Println("✅ Migrations executadas com sucesso")
	return nil
}
