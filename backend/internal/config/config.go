package config

import (
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	Server     ServerConfig
	Database   DatabaseConfig
	Redis      RedisConfig
	Auth       AuthConfig
	Xray       XrayConfig
	SingBox    SingBoxConfig
	Telegram   TelegramConfig
	Cluster    ClusterConfig
	Monitoring MonitoringConfig
	Geo        GeoConfig
}

type ServerConfig struct {
	Host         string
	Port         int
	BasePath     string
	TLSCert      string
	TLSKey       string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
	Debug        bool
}

type DatabaseConfig struct {
	Type     string // postgres, sqlite
	Host     string
	Port     int
	Name     string
	User     string
	Password string
	SSLMode  string
	SQLite   string
}

type RedisConfig struct {
	URL      string
	Password string
	DB       int
}

type AuthConfig struct {
	JWTSecret        string
	JWTExpiry        time.Duration
	RefreshExpiry    time.Duration
	AdminUser        string
	AdminPass        string
	Enable2FA        bool
	SessionTimeout   time.Duration
	MaxLoginAttempts int
	LockoutDuration  time.Duration
}

type XrayConfig struct {
	BinaryPath  string
	ConfigPath  string
	AssetPath   string
	LogPath     string
	APIPort     int
	EnableStats bool
}

type SingBoxConfig struct {
	BinaryPath string
	ConfigPath string
	LogPath    string
}

type TelegramConfig struct {
	Token   string
	AdminID int64
	Enabled bool
}

type ClusterConfig struct {
	Enabled    bool
	NodeID     string
	MasterURL  string
	SyncInterval time.Duration
}

type MonitoringConfig struct {
	Enabled        bool
	PrometheusPort int
	RetentionDays  int
}

type GeoConfig struct {
	GeoIPPath   string
	GeoSitePath string
	AutoUpdate  bool
}

var C *Config

func Load() *Config {
	C = &Config{
		Server: ServerConfig{
			Host:         getEnv("ZUI_HOST", "0.0.0.0"),
			Port:         getEnvInt("ZUI_PORT", 8443),
			BasePath:     getEnv("ZUI_BASE_PATH", "/"),
			TLSCert:      getEnv("ZUI_TLS_CERT", ""),
			TLSKey:       getEnv("ZUI_TLS_KEY", ""),
			ReadTimeout:  time.Duration(getEnvInt("ZUI_READ_TIMEOUT", 30)) * time.Second,
			WriteTimeout: time.Duration(getEnvInt("ZUI_WRITE_TIMEOUT", 30)) * time.Second,
			Debug:        getEnvBool("ZUI_DEBUG", false),
		},
		Database: DatabaseConfig{
			Type:     getEnv("ZUI_DB_TYPE", "sqlite"),
			Host:     getEnv("ZUI_DB_HOST", "localhost"),
			Port:     getEnvInt("ZUI_DB_PORT", 5432),
			Name:     getEnv("ZUI_DB_NAME", "zui"),
			User:     getEnv("ZUI_DB_USER", "zui"),
			Password: getEnv("ZUI_DB_PASS", ""),
			SSLMode:  getEnv("ZUI_DB_SSL", "disable"),
			SQLite:   getEnv("ZUI_DB_SQLITE", "/var/lib/z-ui/db/z-ui.db"),
		},
		Redis: RedisConfig{
			URL:      getEnv("ZUI_REDIS_URL", "redis://localhost:6379"),
			Password: getEnv("ZUI_REDIS_PASS", ""),
			DB:       getEnvInt("ZUI_REDIS_DB", 0),
		},
		Auth: AuthConfig{
			JWTSecret:        getEnv("ZUI_JWT_SECRET", "change-me-in-production"),
			JWTExpiry:        time.Duration(getEnvInt("ZUI_JWT_EXPIRY", 24)) * time.Hour,
			RefreshExpiry:    time.Duration(getEnvInt("ZUI_REFRESH_EXPIRY", 168)) * time.Hour,
			AdminUser:        getEnv("ZUI_ADMIN_USER", "admin"),
			AdminPass:        getEnv("ZUI_ADMIN_PASS", "admin"),
			Enable2FA:        getEnvBool("ZUI_ENABLE_2FA", false),
			SessionTimeout:   time.Duration(getEnvInt("ZUI_SESSION_TIMEOUT", 30)) * time.Minute,
			MaxLoginAttempts: getEnvInt("ZUI_MAX_LOGIN_ATTEMPTS", 5),
			LockoutDuration:  time.Duration(getEnvInt("ZUI_LOCKOUT_DURATION", 15)) * time.Minute,
		},
		Xray: XrayConfig{
			BinaryPath:  getEnv("ZUI_XRAY_PATH", "/usr/local/bin/xray"),
			ConfigPath:  getEnv("ZUI_XRAY_CONFIG", "/var/lib/z-ui/xray/config.json"),
			AssetPath:   getEnv("ZUI_XRAY_ASSETS", "/usr/local/share/xray"),
			LogPath:     getEnv("ZUI_XRAY_LOG", "/var/lib/z-ui/logs/xray.log"),
			APIPort:     getEnvInt("ZUI_XRAY_API_PORT", 10085),
			EnableStats: getEnvBool("ZUI_XRAY_STATS", true),
		},
		SingBox: SingBoxConfig{
			BinaryPath: getEnv("ZUI_SINGBOX_PATH", "/usr/local/bin/sing-box"),
			ConfigPath: getEnv("ZUI_SINGBOX_CONFIG", "/var/lib/z-ui/singbox/config.json"),
			LogPath:    getEnv("ZUI_SINGBOX_LOG", "/var/lib/z-ui/logs/singbox.log"),
		},
		Telegram: TelegramConfig{
			Token:   getEnv("ZUI_TELEGRAM_TOKEN", ""),
			AdminID: int64(getEnvInt("ZUI_TELEGRAM_ADMIN_ID", 0)),
			Enabled: getEnvBool("ZUI_TELEGRAM_ENABLED", false),
		},
		Cluster: ClusterConfig{
			Enabled:      getEnvBool("ZUI_CLUSTER_ENABLED", false),
			NodeID:       getEnv("ZUI_NODE_ID", "master"),
			MasterURL:    getEnv("ZUI_MASTER_URL", ""),
			SyncInterval: time.Duration(getEnvInt("ZUI_SYNC_INTERVAL", 30)) * time.Second,
		},
		Monitoring: MonitoringConfig{
			Enabled:        getEnvBool("ZUI_MONITORING_ENABLED", true),
			PrometheusPort: getEnvInt("ZUI_PROMETHEUS_PORT", 9090),
			RetentionDays:  getEnvInt("ZUI_RETENTION_DAYS", 30),
		},
		Geo: GeoConfig{
			GeoIPPath:   getEnv("ZUI_GEOIP_PATH", "/var/lib/z-ui/geo/geoip.dat"),
			GeoSitePath: getEnv("ZUI_GEOSITE_PATH", "/var/lib/z-ui/geo/geosite.dat"),
			AutoUpdate:  getEnvBool("ZUI_GEO_AUTO_UPDATE", true),
		},
	}
	return C
}

func getEnv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	if value := os.Getenv(key); value != "" {
		if i, err := strconv.Atoi(value); err == nil {
			return i
		}
	}
	return fallback
}

func getEnvBool(key string, fallback bool) bool {
	if value := os.Getenv(key); value != "" {
		return strings.ToLower(value) == "true" || value == "1"
	}
	return fallback
}
