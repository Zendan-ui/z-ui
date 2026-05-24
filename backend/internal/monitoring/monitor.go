package monitoring

import (
	"runtime"
	"sync"
	"time"

	"github.com/Zendan-ui/z-ui/internal/database"
	"github.com/Zendan-ui/z-ui/internal/database/models"
	"github.com/Zendan-ui/z-ui/pkg/logger"
)

type SystemMetrics struct {
	Timestamp   time.Time `json:"timestamp"`
	CPUUsage    float64   `json:"cpu_usage"`
	MemoryUsage float64   `json:"memory_usage"`
	MemoryTotal uint64    `json:"memory_total"`
	MemoryUsed  uint64    `json:"memory_used"`
	DiskUsage   float64   `json:"disk_usage"`
	Goroutines  int       `json:"goroutines"`
	NetworkIn   int64     `json:"network_in"`
	NetworkOut  int64     `json:"network_out"`
	UsersOnline int       `json:"users_online"`
	UsersTotal  int64     `json:"users_total"`
}

type Monitor struct {
	metrics    []SystemMetrics
	mu         sync.RWMutex
	maxHistory int
	interval   time.Duration
}

func NewMonitor(interval time.Duration, maxHistory int) *Monitor {
	return &Monitor{
		interval:   interval,
		maxHistory: maxHistory,
		metrics:    make([]SystemMetrics, 0, maxHistory),
	}
}

func (m *Monitor) Start() {
	logger.Info("Starting system monitor (interval: %v)", m.interval)
	
	ticker := time.NewTicker(m.interval)
	go func() {
		for range ticker.C {
			metrics := m.collect()
			m.mu.Lock()
			m.metrics = append(m.metrics, metrics)
			if len(m.metrics) > m.maxHistory {
				m.metrics = m.metrics[1:]
			}
			m.mu.Unlock()
		}
	}()
}

func (m *Monitor) GetCurrent() SystemMetrics {
	m.mu.RLock()
	defer m.mu.RUnlock()
	if len(m.metrics) == 0 {
		return m.collect()
	}
	return m.metrics[len(m.metrics)-1]
}

func (m *Monitor) GetHistory(count int) []SystemMetrics {
	m.mu.RLock()
	defer m.mu.RUnlock()
	if count > len(m.metrics) {
		count = len(m.metrics)
	}
	return m.metrics[len(m.metrics)-count:]
}

func (m *Monitor) collect() SystemMetrics {
	var mem runtime.MemStats
	runtime.ReadMemStats(&mem)

	var totalUsers int64
	database.DB.Model(&models.User{}).Count(&totalUsers)

	var onlineDevices int64
	cutoff := time.Now().Add(-5 * time.Minute)
	database.DB.Model(&models.Device{}).Where("last_seen >= ?", cutoff).Count(&onlineDevices)

	return SystemMetrics{
		Timestamp:   time.Now(),
		MemoryUsage: float64(mem.Alloc) / float64(mem.Sys) * 100,
		MemoryTotal: mem.Sys,
		MemoryUsed:  mem.Alloc,
		Goroutines:  runtime.NumGoroutine(),
		UsersOnline: int(onlineDevices),
		UsersTotal:  totalUsers,
	}
}

// TrafficCollector periodically aggregates traffic data
type TrafficCollector struct {
	interval time.Duration
}

func NewTrafficCollector(interval time.Duration) *TrafficCollector {
	return &TrafficCollector{interval: interval}
}

func (tc *TrafficCollector) Start() {
	logger.Info("Starting traffic collector (interval: %v)", tc.interval)
	
	ticker := time.NewTicker(tc.interval)
	go func() {
		for range ticker.C {
			tc.collectTraffic()
		}
	}()
}

func (tc *TrafficCollector) collectTraffic() {
	// In production, query Xray/Sing-box stats API
	// and update user traffic in database
	logger.Debug("Collecting traffic data...")
	
	// Update online device status
	cutoff := time.Now().Add(-5 * time.Minute)
	database.DB.Model(&models.Device{}).
		Where("last_seen < ?", cutoff).
		Update("is_online", false)
}
