package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// ==================== Admin & RBAC ====================

type Admin struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	UUID          string         `gorm:"uniqueIndex;type:varchar(36)" json:"uuid"`
	Username      string         `gorm:"uniqueIndex;type:varchar(64);not null" json:"username"`
	PasswordHash  string         `gorm:"type:varchar(256);not null" json:"-"`
	Email         string         `gorm:"type:varchar(256)" json:"email"`
	Role          string         `gorm:"type:varchar(32);default:'admin'" json:"role"` // superadmin, admin, moderator, viewer
	TwoFactorKey  string         `gorm:"type:varchar(64)" json:"-"`
	TwoFactorOn   bool           `gorm:"default:false" json:"two_factor_enabled"`
	TelegramID    int64          `json:"telegram_id"`
	IsActive      bool           `gorm:"default:true" json:"is_active"`
	LastLogin     *time.Time     `json:"last_login"`
	LoginAttempts int            `gorm:"default:0" json:"-"`
	LockedUntil   *time.Time     `json:"-"`
	Language      string         `gorm:"type:varchar(5);default:'en'" json:"language"`
	Permissions   []Permission   `gorm:"many2many:admin_permissions;" json:"permissions,omitempty"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

type Permission struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Name     string `gorm:"uniqueIndex;type:varchar(64);not null" json:"name"`
	Resource string `gorm:"type:varchar(64)" json:"resource"`
	Action   string `gorm:"type:varchar(32)" json:"action"` // create, read, update, delete, manage
}

// ==================== User ====================

type User struct {
	ID              uint           `gorm:"primaryKey" json:"id"`
	UUID            string         `gorm:"uniqueIndex;type:varchar(36)" json:"uuid"`
	Username        string         `gorm:"uniqueIndex;type:varchar(64);not null" json:"username"`
	Email           string         `gorm:"type:varchar(256)" json:"email"`
	TelegramID      int64          `gorm:"index" json:"telegram_id"`
	Status          string         `gorm:"type:varchar(20);default:'active'" json:"status"` // active, disabled, expired, limited
	TrafficLimit    int64          `gorm:"default:0" json:"traffic_limit"`                   // bytes, 0=unlimited
	TrafficUsed     int64          `gorm:"default:0" json:"traffic_used"`
	TrafficUp       int64          `gorm:"default:0" json:"traffic_up"`
	TrafficDown     int64          `gorm:"default:0" json:"traffic_down"`
	ExpiresAt       *time.Time     `json:"expires_at"`
	DeviceLimit     int            `gorm:"default:0" json:"device_limit"` // 0=unlimited
	OnlineDevices   int            `gorm:"default:0" json:"online_devices"`
	SubToken        string         `gorm:"uniqueIndex;type:varchar(64)" json:"sub_token"`
	SubShortLink    string         `gorm:"type:varchar(32)" json:"sub_short_link"`
	Note            string         `gorm:"type:text" json:"note"`
	AdminID         uint           `json:"admin_id"`
	Admin           *Admin         `gorm:"foreignKey:AdminID" json:"admin,omitempty"`
	AutoRenew       bool           `gorm:"default:false" json:"auto_renew"`
	RenewDays       int            `gorm:"default:30" json:"renew_days"`
	RenewTraffic    int64          `gorm:"default:0" json:"renew_traffic"`
	DataLimitReset  string         `gorm:"type:varchar(20);default:'no_reset'" json:"data_limit_reset_strategy"` // no_reset, day, week, month, year
	LifetimeUsed    int64          `gorm:"default:0" json:"lifetime_used_traffic"`
	OnHoldTimeout   *time.Time     `json:"on_hold_timeout"`
	OnHoldExpire    int64          `gorm:"default:0" json:"on_hold_expire_duration"`
	ExcludedInbounds string        `gorm:"type:text" json:"excluded_inbounds"` // JSON array of excluded inbound tags
	Tags            string         `gorm:"type:varchar(256)" json:"tags"`
	Proxies         []Proxy        `gorm:"foreignKey:UserID" json:"proxies,omitempty"`
	Subscriptions   []Subscription `gorm:"foreignKey:UserID" json:"subscriptions,omitempty"`
	Devices         []Device       `gorm:"foreignKey:UserID" json:"devices,omitempty"`
	CreatedAt       time.Time      `json:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at"`
	DeletedAt       gorm.DeletedAt `gorm:"index" json:"-"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.UUID == "" {
		u.UUID = uuid.New().String()
	}
	if u.SubToken == "" {
		u.SubToken = uuid.New().String()
	}
	return nil
}

// ==================== Proxy/Inbound ====================

type Proxy struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	UUID       string         `gorm:"uniqueIndex;type:varchar(36)" json:"uuid"`
	UserID     uint           `gorm:"index;not null" json:"user_id"`
	InboundID  uint           `gorm:"index;not null" json:"inbound_id"`
	Inbound    *Inbound       `gorm:"foreignKey:InboundID" json:"inbound,omitempty"`
	Protocol   string         `gorm:"type:varchar(32);not null" json:"protocol"`
	Settings   string         `gorm:"type:text" json:"settings"` // JSON protocol-specific settings
	FlowType   string         `gorm:"type:varchar(32)" json:"flow_type"`
	Email      string         `gorm:"type:varchar(128)" json:"email"`
	IsActive   bool           `gorm:"default:true" json:"is_active"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

type Inbound struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	UUID          string         `gorm:"uniqueIndex;type:varchar(36)" json:"uuid"`
	Tag           string         `gorm:"uniqueIndex;type:varchar(64);not null" json:"tag"`
	Protocol      string         `gorm:"type:varchar(32);not null" json:"protocol"` // vless, vmess, trojan, shadowsocks, hysteria2, tuic, wireguard, socks, ssh
	Port          int            `gorm:"not null" json:"port"`
	Listen        string         `gorm:"type:varchar(64);default:'0.0.0.0'" json:"listen"`
	Transport     string         `gorm:"type:varchar(32)" json:"transport"` // tcp, ws, grpc, quic, kcp, xhttp, httpupgrade, splithttp
	Security      string         `gorm:"type:varchar(32)" json:"security"` // none, tls, reality
	Settings      string         `gorm:"type:text" json:"settings"`        // JSON
	StreamSettings string        `gorm:"type:text" json:"stream_settings"` // JSON
	Sniffing      string         `gorm:"type:text" json:"sniffing"`        // JSON
	ServerID      uint           `gorm:"index" json:"server_id"`
	Server        *Server        `gorm:"foreignKey:ServerID" json:"server,omitempty"`
	IsActive      bool           `gorm:"default:true" json:"is_active"`
	Remark        string         `gorm:"type:varchar(128)" json:"remark"`
	Proxies       []Proxy        `gorm:"foreignKey:InboundID" json:"proxies,omitempty"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

// ==================== Subscription ====================

type Subscription struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	UUID         string         `gorm:"uniqueIndex;type:varchar(36)" json:"uuid"`
	UserID       uint           `gorm:"index;not null" json:"user_id"`
	User         *User          `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Name         string         `gorm:"type:varchar(128)" json:"name"`
	Token        string         `gorm:"uniqueIndex;type:varchar(64)" json:"token"`
	ShortLink    string         `gorm:"type:varchar(32)" json:"short_link"`
	Format       string         `gorm:"type:varchar(32);default:'auto'" json:"format"` // auto, clash, singbox, v2ray, json
	ProxyIDs     string         `gorm:"type:text" json:"proxy_ids"`                   // JSON array of proxy IDs
	ServerIDs    string         `gorm:"type:text" json:"server_ids"`                  // JSON array of server IDs
	Include      string         `gorm:"type:text" json:"include"`                     // filter rules
	Exclude      string         `gorm:"type:text" json:"exclude"`
	SortBy       string         `gorm:"type:varchar(32)" json:"sort_by"`
	IsActive     bool           `gorm:"default:true" json:"is_active"`
	HitCount     int64          `gorm:"default:0" json:"hit_count"`
	LastAccess   *time.Time     `json:"last_access"`
	UserAgent    string         `gorm:"type:varchar(256)" json:"user_agent"`
	ExpiresAt    *time.Time     `json:"expires_at"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (s *Subscription) BeforeCreate(tx *gorm.DB) error {
	if s.UUID == "" {
		s.UUID = uuid.New().String()
	}
	if s.Token == "" {
		s.Token = uuid.New().String()
	}
	return nil
}

// ==================== Server/Node ====================

type Server struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	UUID          string         `gorm:"uniqueIndex;type:varchar(36)" json:"uuid"`
	Name          string         `gorm:"type:varchar(128);not null" json:"name"`
	Host          string         `gorm:"type:varchar(256);not null" json:"host"`
	Port          int            `gorm:"default:22" json:"port"`
	SSHUser       string         `gorm:"type:varchar(64)" json:"ssh_user"`
	SSHKey        string         `gorm:"type:text" json:"-"`
	SSHPassword   string         `gorm:"type:varchar(256)" json:"-"`
	APIPort       int            `gorm:"default:8443" json:"api_port"`
	APIKey        string         `gorm:"type:varchar(128)" json:"-"`
	Type          string         `gorm:"type:varchar(32);default:'node'" json:"type"` // master, node
	Status        string         `gorm:"type:varchar(32);default:'offline'" json:"status"` // online, offline, error
	Location      string         `gorm:"type:varchar(64)" json:"location"`
	CountryCode   string         `gorm:"type:varchar(5)" json:"country_code"`
	ISP           string         `gorm:"type:varchar(128)" json:"isp"`
	CPU           float64        `json:"cpu"`
	Memory        float64        `json:"memory"`
	Disk          float64        `json:"disk"`
	Uptime        int64          `json:"uptime"`
	NetworkIn     int64          `json:"network_in"`
	NetworkOut    int64          `json:"network_out"`
	XrayVersion   string         `gorm:"type:varchar(32)" json:"xray_version"`
	SingBoxVersion string        `gorm:"type:varchar(32)" json:"singbox_version"`
	Weight        int            `gorm:"default:1" json:"weight"` // for load balancing
	MaxUsers      int            `gorm:"default:0" json:"max_users"`
	Tags          string         `gorm:"type:varchar(256)" json:"tags"`
	Inbounds      []Inbound      `gorm:"foreignKey:ServerID" json:"inbounds,omitempty"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`
}

// ==================== Device Management ====================

type Device struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `gorm:"index;not null" json:"user_id"`
	IP         string    `gorm:"type:varchar(45)" json:"ip"`
	UserAgent  string    `gorm:"type:varchar(512)" json:"user_agent"`
	ClientType string    `gorm:"type:varchar(64)" json:"client_type"` // detected client app
	LastSeen   time.Time `json:"last_seen"`
	IsOnline   bool      `gorm:"default:false" json:"is_online"`
	CreatedAt  time.Time `json:"created_at"`
}

// ==================== Traffic Log ====================

type TrafficLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"index" json:"user_id"`
	ProxyID   uint      `gorm:"index" json:"proxy_id"`
	ServerID  uint      `gorm:"index" json:"server_id"`
	Upload    int64     `json:"upload"`
	Download  int64     `json:"download"`
	Period    time.Time `gorm:"index" json:"period"` // hourly bucket
	CreatedAt time.Time `json:"created_at"`
}

// ==================== Subscription Log ====================

type SubLog struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	SubscriptionID uint      `gorm:"index" json:"subscription_id"`
	UserID         uint      `gorm:"index" json:"user_id"`
	IP             string    `gorm:"type:varchar(45)" json:"ip"`
	UserAgent      string    `gorm:"type:varchar(512)" json:"user_agent"`
	Format         string    `gorm:"type:varchar(32)" json:"format"`
	CreatedAt      time.Time `json:"created_at"`
}

// ==================== Audit Log ====================

type AuditLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	AdminID   uint      `gorm:"index" json:"admin_id"`
	Action    string    `gorm:"type:varchar(64);not null" json:"action"`
	Resource  string    `gorm:"type:varchar(64)" json:"resource"`
	ResourceID uint     `json:"resource_id"`
	Details   string    `gorm:"type:text" json:"details"` // JSON
	IP        string    `gorm:"type:varchar(45)" json:"ip"`
	UserAgent string    `gorm:"type:varchar(512)" json:"user_agent"`
	CreatedAt time.Time `json:"created_at"`
}

// ==================== Routing Rules ====================

type RoutingRule struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	UUID       string         `gorm:"uniqueIndex;type:varchar(36)" json:"uuid"`
	Name       string         `gorm:"type:varchar(128)" json:"name"`
	Priority   int            `gorm:"default:0" json:"priority"`
	Type       string         `gorm:"type:varchar(32)" json:"type"` // geoip, domain, ip, protocol
	Condition  string         `gorm:"type:text;not null" json:"condition"` // JSON
	Action     string         `gorm:"type:varchar(32);not null" json:"action"` // direct, proxy, block, outbound
	OutboundID uint           `json:"outbound_id"`
	IsActive   bool           `gorm:"default:true" json:"is_active"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

// ==================== Outbound ====================

type Outbound struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	UUID       string         `gorm:"uniqueIndex;type:varchar(36)" json:"uuid"`
	Tag        string         `gorm:"uniqueIndex;type:varchar(64);not null" json:"tag"`
	Protocol   string         `gorm:"type:varchar(32);not null" json:"protocol"`
	Settings   string         `gorm:"type:text" json:"settings"` // JSON
	ServerID   uint           `gorm:"index" json:"server_id"`
	IsActive   bool           `gorm:"default:true" json:"is_active"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

// ==================== Backup ====================

type Backup struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `gorm:"type:varchar(256);not null" json:"name"`
	FilePath  string    `gorm:"type:varchar(512);not null" json:"file_path"`
	Size      int64     `json:"size"`
	Type      string    `gorm:"type:varchar(32)" json:"type"` // full, database, configs
	AdminID   uint      `json:"admin_id"`
	CreatedAt time.Time `json:"created_at"`
}

// ==================== System Settings ====================

type Setting struct {
	ID    uint   `gorm:"primaryKey" json:"id"`
	Key   string `gorm:"uniqueIndex;type:varchar(128);not null" json:"key"`
	Value string `gorm:"type:text" json:"value"`
	Type  string `gorm:"type:varchar(32);default:'string'" json:"type"` // string, int, bool, json
}
