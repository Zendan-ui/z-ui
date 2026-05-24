package database

import (
	"fmt"
	"os"
	"path/filepath"

	"github.com/Zendan-ui/z-ui/internal/config"
	"github.com/Zendan-ui/z-ui/internal/database/models"
	"github.com/Zendan-ui/z-ui/pkg/logger"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func Initialize(cfg *config.DatabaseConfig) error {
	var err error
	var dialector gorm.Dialector

	switch cfg.Type {
	case "postgres":
		dsn := fmt.Sprintf(
			"host=%s port=%d user=%s password=%s dbname=%s sslmode=%s",
			cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.Name, cfg.SSLMode,
		)
		dialector = postgres.Open(dsn)
	case "sqlite":
		dir := filepath.Dir(cfg.SQLite)
		if err := os.MkdirAll(dir, 0755); err != nil {
			return fmt.Errorf("failed to create sqlite directory: %w", err)
		}
		dialector = sqlite.Open(cfg.SQLite)
	default:
		return fmt.Errorf("unsupported database type: %s", cfg.Type)
	}

	DB, err = gorm.Open(dialector, &gorm.Config{
		PrepareStmt: true,
	})
	if err != nil {
		return fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := DB.DB()
	if err != nil {
		return fmt.Errorf("failed to get sql.DB: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)

	logger.Info("Database connected successfully (%s)", cfg.Type)
	return nil
}

func Migrate() error {
	err := DB.AutoMigrate(
		&models.Admin{},
		&models.Permission{},
		&models.User{},
		&models.Proxy{},
		&models.Inbound{},
		&models.Subscription{},
		&models.Server{},
		&models.Device{},
		&models.TrafficLog{},
		&models.SubLog{},
		&models.AuditLog{},
		&models.RoutingRule{},
		&models.Outbound{},
		&models.Backup{},
		&models.Setting{},
	)
	if err != nil {
		return fmt.Errorf("migration failed: %w", err)
	}
	logger.Info("Database migration completed")
	return nil
}

func SeedDefaults(cfg *config.AuthConfig) error {
	var count int64
	DB.Model(&models.Admin{}).Count(&count)
	if count == 0 {
		admin := models.Admin{
			UUID:     "00000000-0000-0000-0000-000000000001",
			Username: cfg.AdminUser,
			Role:     "superadmin",
			IsActive: true,
			Language: "en",
		}
		// Password will be hashed by the auth service
		if err := DB.Create(&admin).Error; err != nil {
			return fmt.Errorf("failed to seed admin: %w", err)
		}
		logger.Info("Default admin user created: %s", cfg.AdminUser)
	}

	// Seed default permissions
	permissions := []models.Permission{
		{Name: "users.create", Resource: "users", Action: "create"},
		{Name: "users.read", Resource: "users", Action: "read"},
		{Name: "users.update", Resource: "users", Action: "update"},
		{Name: "users.delete", Resource: "users", Action: "delete"},
		{Name: "servers.manage", Resource: "servers", Action: "manage"},
		{Name: "inbounds.manage", Resource: "inbounds", Action: "manage"},
		{Name: "subscriptions.manage", Resource: "subscriptions", Action: "manage"},
		{Name: "system.manage", Resource: "system", Action: "manage"},
		{Name: "logs.read", Resource: "logs", Action: "read"},
		{Name: "backup.manage", Resource: "backup", Action: "manage"},
	}
	for _, p := range permissions {
		DB.FirstOrCreate(&p, models.Permission{Name: p.Name})
	}

	return nil
}
