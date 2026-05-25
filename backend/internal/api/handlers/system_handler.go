package handlers

import (
	"fmt"
	"os"
	"runtime"
	"strings"
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

// readProcFile reads a /proc file and returns its content
func readProcFile(path string) string {
	data, err := os.ReadFile(path)
	if err != nil {
		return ""
	}
	return strings.TrimSpace(string(data))
}

// getCPUUsage reads /proc/stat to calculate CPU usage percentage
func getCPUUsage() float64 {
	content := readProcFile("/proc/stat")
	if content == "" {
		return 0
	}
	lines := strings.Split(content, "\n")
	if len(lines) == 0 {
		return 0
	}
	fields := strings.Fields(lines[0])
	if len(fields) < 5 {
		return 0
	}
	var total, idle int64
	for i := 1; i < len(fields); i++ {
		var v int64
		fmt.Sscanf(fields[i], "%d", &v)
		total += v
		if i == 4 {
			idle = v
		}
	}
	if total == 0 {
		return 0
	}
	return float64(total-idle) / float64(total) * 100
}

// getMemoryInfo reads /proc/meminfo for real memory usage
func getMemoryInfo() (total, used, free uint64, percent float64) {
	content := readProcFile("/proc/meminfo")
	if content == "" {
		// Fallback to Go runtime
		var mem runtime.MemStats
		runtime.ReadMemStats(&mem)
		return mem.Sys, mem.Alloc, mem.Sys - mem.Alloc, float64(mem.Alloc) / float64(mem.Sys) * 100
	}

	var memTotal, memFree, memBuffers, memCached uint64
	for _, line := range strings.Split(content, "\n") {
		fields := strings.Fields(line)
		if len(fields) < 2 {
			continue
		}
		var val uint64
		fmt.Sscanf(fields[1], "%d", &val)
		val *= 1024 // Convert KB to bytes

		switch fields[0] {
		case "MemTotal:":
			memTotal = val
		case "MemFree:":
			memFree = val
		case "Buffers:":
			memBuffers = val
		case "Cached:":
			memCached = val
		}
	}

	memUsed := memTotal - memFree - memBuffers - memCached
	pct := float64(0)
	if memTotal > 0 {
		pct = float64(memUsed) / float64(memTotal) * 100
	}
	return memTotal, memUsed, memFree, pct
}

// getDiskInfo reads disk usage for root partition
func getDiskInfo() (total, used, free uint64, percent float64) {
	// Try reading from /proc/mounts + statfs equivalent via df parsing
	// Simplified: read /proc/diskstats or just provide Go-available info
	content := readProcFile("/proc/mounts")
	if content == "" {
		return 0, 0, 0, 0
	}
	// For now return 0 — real implementation needs syscall.Statfs
	return 0, 0, 0, 0
}

// getUptime reads system uptime from /proc/uptime
func getUptime() float64 {
	content := readProcFile("/proc/uptime")
	if content == "" {
		return time.Since(time.Now().Add(-time.Hour)).Seconds()
	}
	var uptime float64
	fmt.Sscanf(content, "%f", &uptime)
	return uptime
}

// getHostname reads system hostname
func getHostname() string {
	name, err := os.Hostname()
	if err != nil {
		return "unknown"
	}
	return name
}

// getLoadAvg reads system load average
func getLoadAvg() (float64, float64, float64) {
	content := readProcFile("/proc/loadavg")
	if content == "" {
		return 0, 0, 0
	}
	var l1, l5, l15 float64
	fmt.Sscanf(content, "%f %f %f", &l1, &l5, &l15)
	return l1, l5, l15
}

func (h *SystemHandler) Dashboard(c *fiber.Ctx) error {
	var userCount, activeUsers, serverCount, inboundCount int64
	database.DB.Model(&models.User{}).Count(&userCount)
	database.DB.Model(&models.User{}).Where("status = ?", "active").Count(&activeUsers)
	database.DB.Model(&models.Server{}).Count(&serverCount)
	database.DB.Model(&models.Inbound{}).Count(&inboundCount)

	var totalTraffic struct{ Up, Down int64 }
	database.DB.Model(&models.User{}).Select("COALESCE(SUM(traffic_up),0) as up, COALESCE(SUM(traffic_down),0) as down").Scan(&totalTraffic)

	var recentUsers []models.User
	database.DB.Order("created_at DESC").Limit(5).Find(&recentUsers)

	// Real system metrics
	cpuUsage := getCPUUsage()
	memTotal, memUsed, _, memPercent := getMemoryInfo()
	_, _, _, diskPercent := getDiskInfo()
	uptime := getUptime()
	l1, l5, l15 := getLoadAvg()
	hostname := getHostname()

	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)

	// Online users (devices seen in last 5 min)
	var onlineCount int64
	cutoff := time.Now().Add(-5 * time.Minute)
	database.DB.Model(&models.Device{}).Where("last_seen >= ?", cutoff).Count(&onlineCount)

	return c.JSON(fiber.Map{
		"users": fiber.Map{
			"total":  userCount,
			"active": activeUsers,
			"online": onlineCount,
		},
		"servers":  serverCount,
		"inbounds": inboundCount,
		"traffic": fiber.Map{
			"up":    totalTraffic.Up,
			"down":  totalTraffic.Down,
			"total": totalTraffic.Up + totalTraffic.Down,
		},
		"system": fiber.Map{
			"hostname":     hostname,
			"uptime":       uptime,
			"cpu_usage":    cpuUsage,
			"cpu_cores":    runtime.NumCPU(),
			"mem_total":    memTotal,
			"mem_used":     memUsed,
			"mem_percent":  memPercent,
			"disk_percent": diskPercent,
			"load_avg":     []float64{l1, l5, l15},
			"goroutines":   runtime.NumGoroutine(),
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
	page := c.QueryInt("page", 1)
	pageSize := 50
	var logs []models.AuditLog
	var total int64
	database.DB.Model(&models.AuditLog{}).Count(&total)
	database.DB.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&logs)
	return c.JSON(fiber.Map{"logs": logs, "total": total, "page": page})
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
	database.DB.Where("period >= ?", since).Order("period ASC").Find(&logs)
	return c.JSON(fiber.Map{"traffic_logs": logs, "period": period})
}

func (h *SystemHandler) OnlineUsers(c *fiber.Ctx) error {
	var devices []models.Device
	cutoff := time.Now().Add(-5 * time.Minute)
	database.DB.Where("last_seen >= ?", cutoff).Find(&devices)
	return c.JSON(fiber.Map{"online_count": len(devices), "devices": devices})
}
