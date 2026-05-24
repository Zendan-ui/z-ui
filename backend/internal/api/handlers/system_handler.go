package handlers

import (
	"runtime"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/Zendan-ui/z-ui/internal/database"
	"github.com/Zendan-ui/z-ui/internal/database/models"
)

type SystemHandler struct {
	startTime time.Time
}

func NewSystemHandler() *SystemHandler {
	return &SystemHandler{startTime: time.Now()}
}

func (h *SystemHandler) Dashboard(c *fiber.Ctx) error {
	var userCount, activeUsers, serverCount, inboundCount int64
	var totalTraffic struct {
		Up   int64
		Down int64
	}

	database.DB.Model(&models.User{}).Count(&userCount)
	database.DB.Model(&models.User{}).Where("status = ?", "active").Count(&activeUsers)
	database.DB.Model(&models.Server{}).Count(&serverCount)
	database.DB.Model(&models.Inbound{}).Count(&inboundCount)

	database.DB.Model(&models.User{}).Select("COALESCE(SUM(traffic_up),0) as up, COALESCE(SUM(traffic_down),0) as down").Scan(&totalTraffic)

	// Recent users
	var recentUsers []models.User
	database.DB.Order("created_at DESC").Limit(5).Find(&recentUsers)

	// Memory stats
	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)

	return c.JSON(fiber.Map{
		"users": fiber.Map{
			"total":  userCount,
			"active": activeUsers,
		},
		"servers":  serverCount,
		"inbounds": inboundCount,
		"traffic": fiber.Map{
			"up":    totalTraffic.Up,
			"down":  totalTraffic.Down,
			"total": totalTraffic.Up + totalTraffic.Down,
		},
		"system": fiber.Map{
			"uptime":      time.Since(h.startTime).Seconds(),
			"goroutines":  runtime.NumGoroutine(),
			"memory_alloc": mem.Alloc,
			"memory_sys":   mem.Sys,
			"go_version":   runtime.Version(),
			"os":           runtime.GOOS,
			"arch":         runtime.GOARCH,
			"cpus":         runtime.NumCPU(),
		},
		"recent_users": recentUsers,
		"version":      "1.0.0",
	})
}

func (h *SystemHandler) Health(c *fiber.Ctx) error {
	sqlDB, err := database.DB.DB()
	dbStatus := "healthy"
	if err != nil || sqlDB.Ping() != nil {
		dbStatus = "unhealthy"
	}

	return c.JSON(fiber.Map{
		"status":   "ok",
		"database": dbStatus,
		"uptime":   time.Since(h.startTime).String(),
		"version":  "1.0.0",
	})
}

func (h *SystemHandler) GetSettings(c *fiber.Ctx) error {
	var settings []models.Setting
	database.DB.Find(&settings)

	result := make(map[string]interface{})
	for _, s := range settings {
		result[s.Key] = s.Value
	}

	return c.JSON(result)
}

func (h *SystemHandler) UpdateSettings(c *fiber.Ctx) error {
	var body map[string]string
	if err := c.BodyParser(&body); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	for key, value := range body {
		database.DB.Where("key = ?", key).Assign(models.Setting{Key: key, Value: value}).FirstOrCreate(&models.Setting{})
	}

	return c.JSON(fiber.Map{"message": "Settings updated"})
}

func (h *SystemHandler) GetAuditLogs(c *fiber.Ctx) error {
	page, _ := c.ParamsInt("page", 1)
	pageSize := 50

	var logs []models.AuditLog
	var total int64

	database.DB.Model(&models.AuditLog{}).Count(&total)
	database.DB.Order("created_at DESC").
		Offset((page - 1) * pageSize).
		Limit(pageSize).
		Find(&logs)

	return c.JSON(fiber.Map{
		"logs":  logs,
		"total": total,
		"page":  page,
	})
}

func (h *SystemHandler) TrafficStats(c *fiber.Ctx) error {
	period := c.Query("period", "24h")

	var since time.Time
	switch period {
	case "1h":
		since = time.Now().Add(-1 * time.Hour)
	case "24h":
		since = time.Now().Add(-24 * time.Hour)
	case "7d":
		since = time.Now().AddDate(0, 0, -7)
	case "30d":
		since = time.Now().AddDate(0, 0, -30)
	default:
		since = time.Now().Add(-24 * time.Hour)
	}

	var logs []models.TrafficLog
	database.DB.Where("period >= ?", since).
		Order("period ASC").
		Find(&logs)

	return c.JSON(fiber.Map{"traffic_logs": logs, "period": period})
}

func (h *SystemHandler) OnlineUsers(c *fiber.Ctx) error {
	var devices []models.Device
	cutoff := time.Now().Add(-5 * time.Minute)
	database.DB.Where("last_seen >= ? AND is_online = ?", cutoff, true).
		Find(&devices)

	return c.JSON(fiber.Map{
		"online_count": len(devices),
		"devices":      devices,
	})
}
