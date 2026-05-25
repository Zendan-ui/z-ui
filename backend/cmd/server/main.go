package main

import (
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/compress"
	"github.com/joho/godotenv"

	"github.com/Zendan-ui/z-ui/internal/api/middleware"
	"github.com/Zendan-ui/z-ui/internal/api/routes"
	"github.com/Zendan-ui/z-ui/internal/api/ws"
	"github.com/Zendan-ui/z-ui/internal/auth"
	"github.com/Zendan-ui/z-ui/internal/config"
	"github.com/Zendan-ui/z-ui/internal/core/xray"
	"github.com/Zendan-ui/z-ui/internal/database"
	"github.com/Zendan-ui/z-ui/internal/monitoring"
	"github.com/Zendan-ui/z-ui/internal/subscription"
	"github.com/Zendan-ui/z-ui/internal/telegram"
	"github.com/Zendan-ui/z-ui/pkg/crypto"
	"github.com/Zendan-ui/z-ui/pkg/logger"
)

const banner = `
╔══════════════════════════════════════════════════╗
║                                                  ║
║     ███████╗     ██╗   ██╗██╗                    ║
║     ╚══███╔╝     ██║   ██║██║                    ║
║       ███╔╝█████╗██║   ██║██║                    ║
║      ███╔╝ ╚════╝██║   ██║██║                    ║
║     ███████╗      ╚██████╔╝██║                   ║
║     ╚══════╝       ╚═════╝ ╚═╝                   ║
║                                                  ║
║     The Future of Proxy Management    v1.0.0     ║
║                                                  ║
╚══════════════════════════════════════════════════╝
`

func main() {
	fmt.Println(banner)

	// Load .env file
	godotenv.Load()

	// Initialize configuration
	cfg := config.Load()

	// Setup logger
	if cfg.Server.Debug {
		logger.SetLevel(0) // DEBUG
	}
	logger.SetFile("/var/lib/z-ui/logs/zui.log")

	logger.Info("Starting Z-UI server...")

	// Initialize database
	if err := database.Initialize(&cfg.Database); err != nil {
		logger.Fatal("Database initialization failed: %v", err)
	}

	// Run migrations
	if err := database.Migrate(); err != nil {
		logger.Fatal("Database migration failed: %v", err)
	}

	// Seed default admin with hashed password
	if err := database.SeedDefaults(&cfg.Auth); err != nil {
		logger.Fatal("Failed to seed defaults: %v", err)
	}

	// Hash and set admin password
	setupDefaultAdmin(&cfg.Auth)

	// Initialize services
	authSvc := auth.NewAuthService(&cfg.Auth)
	baseURL := fmt.Sprintf("https://%s:%d", cfg.Server.Host, cfg.Server.Port)
	subSvc := subscription.NewSubscriptionService(baseURL)

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:               "Z-UI v1.0.0",
		ServerHeader:          "Z-UI",
		ReadTimeout:           cfg.Server.ReadTimeout,
		WriteTimeout:          cfg.Server.WriteTimeout,
		DisableStartupMessage: false,
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"error":   err.Error(),
				"status":  code,
				"path":    c.Path(),
			})
		},
	})

	// Compression
	app.Use(compress.New(compress.Config{
		Level: compress.LevelBestSpeed,
	}))

	// Setup middleware
	middleware.Setup(app)

	// Setup routes
	routes.Setup(app, authSvc, subSvc)

	// Serve frontend static files
	app.Static("/", "./frontend/out")
	app.Get("/*", func(c *fiber.Ctx) error {
		return c.SendFile("./frontend/out/index.html")
	})

	// Start WebSocket hub
	go ws.MainHub.Run()
	ws.StartMonitoringBroadcast(ws.MainHub)

	// Start monitoring
	monitor := monitoring.NewMonitor(5*time.Second, 720) // 1 hour of 5s intervals
	monitor.Start()

	trafficCollector := monitoring.NewTrafficCollector(30 * time.Second)
	trafficCollector.Start()

	// Start Xray core
	if _, err := os.Stat(cfg.Xray.BinaryPath); err == nil {
		xrayCore := xray.NewXrayCore(&cfg.Xray)
		if err := xrayCore.Start(); err != nil {
			logger.Error("Failed to start Xray: %v", err)
		}
	} else {
		logger.Warn("Xray binary not found at %s, skipping", cfg.Xray.BinaryPath)
	}

	// Start Telegram bot
	if cfg.Telegram.Enabled && cfg.Telegram.Token != "" {
		bot := telegram.NewBot(telegram.BotConfig{
			Token:   cfg.Telegram.Token,
			AdminID: cfg.Telegram.AdminID,
			BaseURL: baseURL,
		})
		if err := bot.Start(); err != nil {
			logger.Error("Failed to start Telegram bot: %v", err)
		}
	}

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		<-quit
		logger.Info("Shutting down Z-UI server...")
		app.Shutdown()
	}()

	// Start server
	addr := fmt.Sprintf("%s:%d", cfg.Server.Host, cfg.Server.Port)
	logger.Info("Z-UI server listening on %s", addr)

	if cfg.Server.TLSCert != "" && cfg.Server.TLSKey != "" {
		if err := app.ListenTLS(addr, cfg.Server.TLSCert, cfg.Server.TLSKey); err != nil {
			logger.Fatal("Server failed: %v", err)
		}
	} else {
		if err := app.Listen(addr); err != nil {
			logger.Fatal("Server failed: %v", err)
		}
	}
}

func setupDefaultAdmin(cfg *config.AuthConfig) {
	var admin struct {
		ID           uint
		PasswordHash string
	}

	database.DB.Table("admins").Where("username = ?", cfg.AdminUser).
		Select("id, password_hash").Scan(&admin)

	if admin.ID > 0 && admin.PasswordHash == "" {
		hash, err := crypto.HashPassword(cfg.AdminPass)
		if err != nil {
			logger.Fatal("Failed to hash admin password: %v", err)
		}
		database.DB.Table("admins").Where("id = ?", admin.ID).
			Update("password_hash", hash)
		logger.Info("Default admin password set")
	}
}
