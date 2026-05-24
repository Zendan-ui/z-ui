package middleware

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"

	"github.com/Zendan-ui/z-ui/internal/auth"
	"github.com/Zendan-ui/z-ui/internal/config"
	"github.com/Zendan-ui/z-ui/internal/database"
	"github.com/Zendan-ui/z-ui/internal/database/models"
	"github.com/Zendan-ui/z-ui/pkg/logger"
)

func Setup(app *fiber.App) {
	app.Use(recover.New())
	app.Use(requestid.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",
		AllowMethods:     "GET,POST,PUT,DELETE,PATCH,OPTIONS",
		AllowHeaders:     "Origin,Content-Type,Accept,Authorization,X-Request-ID",
		AllowCredentials: false,
		MaxAge:           3600,
	}))
	app.Use(RequestLogger())
}

func RequestLogger() fiber.Handler {
	return func(c *fiber.Ctx) error {
		start := time.Now()
		err := c.Next()
		duration := time.Since(start)

		status := c.Response().StatusCode()
		if status >= 400 {
			logger.Warn("%s %s %d %v", c.Method(), c.Path(), status, duration)
		} else {
			logger.Debug("%s %s %d %v", c.Method(), c.Path(), status, duration)
		}
		return err
	}
}

func JWTAuth(authSvc *auth.AuthService) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Status(401).JSON(fiber.Map{
				"error": "Missing authorization header",
			})
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenStr == authHeader {
			return c.Status(401).JSON(fiber.Map{
				"error": "Invalid authorization format",
			})
		}

		claims, err := authSvc.ValidateToken(tokenStr)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{
				"error": "Invalid or expired token",
			})
		}

		c.Locals("admin_id", claims.AdminID)
		c.Locals("username", claims.Username)
		c.Locals("role", claims.Role)

		return c.Next()
	}
}

func RequireRole(roles ...string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		role, ok := c.Locals("role").(string)
		if !ok {
			return c.Status(403).JSON(fiber.Map{"error": "Forbidden"})
		}

		for _, r := range roles {
			if role == r {
				return c.Next()
			}
		}

		return c.Status(403).JSON(fiber.Map{"error": "Insufficient permissions"})
	}
}

func RequirePermission(permission string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		adminID, ok := c.Locals("admin_id").(uint)
		if !ok {
			return c.Status(403).JSON(fiber.Map{"error": "Forbidden"})
		}

		if !auth.HasPermission(adminID, permission) {
			return c.Status(403).JSON(fiber.Map{"error": "Insufficient permissions"})
		}

		return c.Next()
	}
}

func RateLimiter(max int, window time.Duration) fiber.Handler {
	return limiter.New(limiter.Config{
		Max:        max,
		Expiration: window,
		KeyGenerator: func(c *fiber.Ctx) string {
			return c.IP()
		},
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(429).JSON(fiber.Map{
				"error": "Too many requests",
			})
		},
	})
}

func AuditLog() fiber.Handler {
	return func(c *fiber.Ctx) error {
		err := c.Next()

		// Only log write operations
		method := c.Method()
		if method == "GET" || method == "OPTIONS" {
			return err
		}

		adminID, _ := c.Locals("admin_id").(uint)
		if adminID == 0 {
			return err
		}

		log := models.AuditLog{
			AdminID:   adminID,
			Action:    method,
			Resource:  c.Path(),
			IP:        c.IP(),
			UserAgent: c.Get("User-Agent"),
			CreatedAt: time.Now(),
		}

		go func() {
			database.DB.Create(&log)
		}()

		return err
	}
}

func APIKeyAuth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		apiKey := c.Get("X-API-Key")
		if apiKey == "" {
			apiKey = c.Query("api_key")
		}
		if apiKey == "" {
			return c.Status(401).JSON(fiber.Map{"error": "API key required"})
		}

		// Validate API key against database
		var setting models.Setting
		result := database.DB.Where("key = ?", "api_key_"+apiKey).First(&setting)
		if result.Error != nil {
			return c.Status(401).JSON(fiber.Map{"error": "Invalid API key"})
		}

		return c.Next()
	}
}

func SetupPublicMiddleware() fiber.Handler {
	return func(c *fiber.Ctx) error {
		c.Set("X-Powered-By", "Z-UI")
		c.Set("X-Content-Type-Options", "nosniff")
		c.Set("X-Frame-Options", "DENY")
		c.Set("X-XSS-Protection", "1; mode=block")
		return c.Next()
	}
}

func _ () {
	_ = config.C
}
