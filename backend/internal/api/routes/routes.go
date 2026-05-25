package routes

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/Zendan-ui/z-ui/internal/api/handlers"
	"github.com/Zendan-ui/z-ui/internal/api/middleware"
	"github.com/Zendan-ui/z-ui/internal/api/ws"
	"github.com/Zendan-ui/z-ui/internal/auth"
	"github.com/Zendan-ui/z-ui/internal/subscription"
)

func Setup(app *fiber.App, authSvc *auth.AuthService, subSvc *subscription.SubscriptionService) {
	// Handlers
	authHandler := handlers.NewAuthHandler(authSvc)
	userHandler := handlers.NewUserHandler()
	serverHandler := handlers.NewServerHandler()
	inboundHandler := handlers.NewInboundHandler()
	subHandler := handlers.NewSubscriptionHandler(subSvc)
	systemHandler := handlers.NewSystemHandler()
	tunnelHandler := handlers.NewTunnelHandler()

	// ==================== Public Routes ====================

	app.Get("/health", systemHandler.Health)

	// Subscription (public)
	sub := app.Group("/sub")
	sub.Get("/:token", subHandler.Serve)
	sub.Get("/s/:short", subHandler.ServeShort)

	// ==================== Auth ====================

	authGroup := app.Group("/api/v1/auth")
	authGroup.Use(middleware.RateLimiter(10, time.Minute))
	authGroup.Post("/login", authHandler.Login)
	authGroup.Post("/refresh", authHandler.RefreshToken)

	// ==================== Protected API ====================

	api := app.Group("/api/v1", middleware.JWTAuth(authSvc), middleware.AuditLog())

	// Auth
	api.Post("/auth/logout", authHandler.Logout)
	api.Get("/auth/me", authHandler.Me)
	api.Post("/auth/change-password", authHandler.ChangePassword)

	// Dashboard
	api.Get("/dashboard", systemHandler.Dashboard)
	api.Get("/dashboard/traffic", systemHandler.TrafficStats)
	api.Get("/dashboard/online", systemHandler.OnlineUsers)

	// Users
	users := api.Group("/users")
	users.Get("/", userHandler.List)
	users.Get("/stats", userHandler.Stats)
	users.Get("/:id", userHandler.Get)
	users.Post("/", middleware.RequireRole("superadmin", "admin"), userHandler.Create)
	users.Put("/:id", middleware.RequireRole("superadmin", "admin"), userHandler.Update)
	users.Delete("/:id", middleware.RequireRole("superadmin", "admin"), userHandler.Delete)
	users.Post("/:id/reset-traffic", middleware.RequireRole("superadmin", "admin"), userHandler.ResetTraffic)
	users.Post("/:id/suspend", middleware.RequireRole("superadmin", "admin"), userHandler.Suspend)
	users.Post("/:id/activate", middleware.RequireRole("superadmin", "admin"), userHandler.Activate)
	users.Post("/:id/revoke-sub", middleware.RequireRole("superadmin", "admin"), userHandler.RevokeSubscription)
	users.Get("/:id/usage", userHandler.GetUsage)
	users.Get("/:id/devices", userHandler.GetDevices)

	// Servers
	servers := api.Group("/servers")
	servers.Get("/", serverHandler.List)
	servers.Get("/:id", serverHandler.Get)
	servers.Post("/", middleware.RequireRole("superadmin"), serverHandler.Create)
	servers.Put("/:id", middleware.RequireRole("superadmin"), serverHandler.Update)
	servers.Delete("/:id", middleware.RequireRole("superadmin"), serverHandler.Delete)
	servers.Get("/:id/status", serverHandler.Status)

	// Inbounds
	inbounds := api.Group("/inbounds")
	inbounds.Get("/", inboundHandler.List)
	inbounds.Get("/:id", inboundHandler.Get)
	inbounds.Post("/", middleware.RequireRole("superadmin", "admin"), inboundHandler.Create)
	inbounds.Put("/:id", middleware.RequireRole("superadmin", "admin"), inboundHandler.Update)
	inbounds.Delete("/:id", middleware.RequireRole("superadmin", "admin"), inboundHandler.Delete)
	inbounds.Post("/:id/toggle", middleware.RequireRole("superadmin", "admin"), inboundHandler.Toggle)

	// Tunnels
	tunnels := api.Group("/tunnels")
	tunnels.Get("/", tunnelHandler.List)
	tunnels.Get("/:id", tunnelHandler.Get)
	tunnels.Post("/", middleware.RequireRole("superadmin", "admin"), tunnelHandler.Create)
	tunnels.Put("/:id", middleware.RequireRole("superadmin", "admin"), tunnelHandler.Update)
	tunnels.Delete("/:id", middleware.RequireRole("superadmin", "admin"), tunnelHandler.Delete)
	tunnels.Post("/:id/toggle", middleware.RequireRole("superadmin", "admin"), tunnelHandler.Toggle)

	// Subscriptions
	subs := api.Group("/subscriptions")
	subs.Get("/", subHandler.List)
	subs.Get("/:id", subHandler.Get)
	subs.Post("/", middleware.RequireRole("superadmin", "admin"), subHandler.Create)
	subs.Delete("/:id", middleware.RequireRole("superadmin", "admin"), subHandler.Delete)
	subs.Post("/:id/regenerate", middleware.RequireRole("superadmin", "admin"), subHandler.Regenerate)
	subs.Get("/:id/logs", subHandler.GetLogs)
	subs.Get("/analytics/:user_id", subHandler.Analytics)

	// System
	system := api.Group("/system", middleware.RequireRole("superadmin"))
	system.Get("/settings", systemHandler.GetSettings)
	system.Put("/settings", systemHandler.UpdateSettings)
	system.Get("/audit-logs", systemHandler.GetAuditLogs)

	// ==================== WebSocket ====================

	app.Get("/ws", ws.HandleWebSocket(ws.MainHub))

	// ==================== Public API ====================

	publicAPI := app.Group("/public/api/v1", middleware.APIKeyAuth())
	publicAPI.Get("/users", userHandler.List)
	publicAPI.Get("/users/:id", userHandler.Get)
	publicAPI.Post("/users", userHandler.Create)
	publicAPI.Get("/servers", serverHandler.List)
}
