package telegram

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/Zendan-ui/z-ui/internal/database"
	"github.com/Zendan-ui/z-ui/internal/database/models"
	"github.com/Zendan-ui/z-ui/pkg/crypto"
	"github.com/Zendan-ui/z-ui/pkg/logger"

	"github.com/google/uuid"
)

// Bot represents the Telegram bot instance
type Bot struct {
	token   string
	adminID int64
	baseURL string
}

type BotConfig struct {
	Token   string
	AdminID int64
	BaseURL string
}

// ========== Translations ==========

var translations = map[string]map[string]string{
	"en": {
		"welcome":          "🚀 *Welcome to Z-UI Bot!*\n\n_The Future of Proxy Management_\n\n📌 Developed by @Zendan_Ui\n🔗 https://github.com/Zendan-ui/z-ui",
		"main_menu":        "📋 *Main Menu*",
		"users":            "👥 Users",
		"servers":          "🖥️ Servers",
		"subscriptions":    "📦 Subscriptions",
		"create_user":      "➕ Create User",
		"user_list":        "📋 User List",
		"user_created":     "✅ *User created successfully!*\n\n👤 Username: `%s`\n🔗 Sub Link: `%s`\n📊 Traffic: %s\n⏰ Expires: %s",
		"user_suspended":   "⛔ User `%s` has been suspended",
		"user_activated":   "✅ User `%s` has been activated",
		"traffic_reset":    "🔄 Traffic reset for user `%s`",
		"sub_link":         "🔗 *Subscription Link:*\n\n`%s`\n\n📱 Scan QR code to connect",
		"server_status":    "🖥️ Server: *%s*\n📊 CPU: %.1f%%\n💾 RAM: %.1f%%\n💽 Disk: %.1f%%\n🔌 Status: %s",
		"stats":            "📊 *System Statistics*\n\n👥 Total Users: %d\n✅ Active: %d\n⛔ Disabled: %d\n📡 Servers: %d\n📥 Total Traffic: %s",
		"enter_username":   "📝 Enter username:",
		"enter_traffic":    "📊 Enter traffic limit (GB, 0 for unlimited):",
		"enter_days":       "⏰ Enter subscription days:",
		"select_inbounds":  "📡 Select inbounds:",
		"confirm_action":   "⚠️ Are you sure?",
		"unauthorized":     "🚫 Unauthorized. Contact @Zendan_Ui.",
		"error":            "❌ Error: %s",
		"renewal_alert":    "⚠️ User `%s` subscription expires in %d days!",
		"traffic_alert":    "⚠️ User `%s` has used %s of %s traffic!",
		"settings":         "⚙️ Settings",
		"language":         "🌐 Language",
		"back":             "🔙 Back",
		"cancel":           "❌ Cancel",
		"live_logs":        "📜 Live Logs",
		"search_user":      "🔍 Search User",
		"about":            "ℹ️ *Z-UI — The Future of Proxy Management*\n\nVersion: 1.0.0\nDeveloper: @Zendan_Ui\nGitHub: github.com/Zendan-ui/z-ui",
	},
	"fa": {
		"welcome":          "🚀 *به ربات Z-UI خوش آمدید!*\n\n_آینده مدیریت پروکسی_\n\n📌 توسعه‌دهنده: @Zendan_Ui\n🔗 https://github.com/Zendan-ui/z-ui",
		"main_menu":        "📋 *منوی اصلی*",
		"users":            "👥 کاربران",
		"servers":          "🖥️ سرورها",
		"subscriptions":    "📦 اشتراک‌ها",
		"create_user":      "➕ ایجاد کاربر",
		"user_list":        "📋 لیست کاربران",
		"user_created":     "✅ *کاربر با موفقیت ایجاد شد!*\n\n👤 نام کاربری: `%s`\n🔗 لینک اشتراک: `%s`\n📊 ترافیک: %s\n⏰ انقضا: %s",
		"user_suspended":   "⛔ کاربر `%s` مسدود شد",
		"user_activated":   "✅ کاربر `%s` فعال شد",
		"traffic_reset":    "🔄 ترافیک کاربر `%s` ریست شد",
		"sub_link":         "🔗 *لینک اشتراک:*\n\n`%s`\n\n📱 QR کد را اسکن کنید",
		"server_status":    "🖥️ سرور: *%s*\n📊 CPU: %.1f%%\n💾 RAM: %.1f%%\n💽 دیسک: %.1f%%\n🔌 وضعیت: %s",
		"stats":            "📊 *آمار سیستم*\n\n👥 کل کاربران: %d\n✅ فعال: %d\n⛔ غیرفعال: %d\n📡 سرورها: %d\n📥 کل ترافیک: %s",
		"enter_username":   "📝 نام کاربری را وارد کنید:",
		"unauthorized":     "🚫 غیرمجاز. با @Zendan_Ui تماس بگیرید.",
		"error":            "❌ خطا: %s",
		"back":             "🔙 بازگشت",
		"cancel":           "❌ لغو",
		"about":            "ℹ️ *Z-UI — آینده مدیریت پروکسی*\n\nنسخه: 1.0.0\nتوسعه‌دهنده: @Zendan_Ui\nگیت‌هاب: github.com/Zendan-ui/z-ui",
	},
	"ru": {
		"welcome":          "🚀 *Добро пожаловать в Z-UI Bot!*\n\n_Будущее управления прокси_\n\n📌 Разработчик: @Zendan_Ui\n🔗 https://github.com/Zendan-ui/z-ui",
		"main_menu":        "📋 *Главное меню*",
		"users":            "👥 Пользователи",
		"servers":          "🖥️ Серверы",
		"subscriptions":    "📦 Подписки",
		"create_user":      "➕ Создать пользователя",
		"user_list":        "📋 Список пользователей",
		"user_created":     "✅ *Пользователь создан!*\n\n👤 Имя: `%s`\n🔗 Ссылка: `%s`\n📊 Трафик: %s\n⏰ Истекает: %s",
		"user_suspended":   "⛔ Пользователь `%s` заблокирован",
		"user_activated":   "✅ Пользователь `%s` активирован",
		"traffic_reset":    "🔄 Трафик сброшен для `%s`",
		"unauthorized":     "🚫 Нет доступа. Свяжитесь с @Zendan_Ui.",
		"error":            "❌ Ошибка: %s",
		"back":             "🔙 Назад",
		"cancel":           "❌ Отмена",
		"about":            "ℹ️ *Z-UI — Будущее управления прокси*\n\nВерсия: 1.0.0\nРазработчик: @Zendan_Ui\nGitHub: github.com/Zendan-ui/z-ui",
	},
}

func NewBot(cfg BotConfig) *Bot {
	return &Bot{
		token:   cfg.Token,
		adminID: cfg.AdminID,
		baseURL: cfg.BaseURL,
	}
}

func (b *Bot) Start() error {
	if b.token == "" {
		logger.Warn("Telegram bot token not configured, skipping")
		return nil
	}

	logger.Info("Starting Telegram bot...")
	logger.Info("Bot contact: @Zendan_Ui")

	// In production, initialize with go-telegram-bot-api:
	// bot, err := tgbotapi.NewBotAPI(b.token)
	// ...

	go b.monitorAlerts()

	logger.Info("Telegram bot started successfully")
	return nil
}

func (b *Bot) handleCommand(command string, chatID int64, userID int64, args string, lang string) string {
	if lang == "" {
		lang = "en"
	}
	t := translations[lang]
	if t == nil {
		t = translations["en"]
	}

	if !b.isAuthorized(userID) {
		return t["unauthorized"]
	}

	switch command {
	case "/start":
		return t["welcome"]
	case "/menu":
		return b.buildMainMenu(lang)
	case "/users":
		return b.handleUserList(lang)
	case "/create":
		return b.handleCreateUser(args, lang)
	case "/stats":
		return b.handleStats(lang)
	case "/servers":
		return b.handleServerList(lang)
	case "/sub":
		return b.handleGetSubLink(args, lang)
	case "/suspend":
		return b.handleSuspendUser(args, lang)
	case "/activate":
		return b.handleActivateUser(args, lang)
	case "/resettraffic":
		return b.handleResetTraffic(args, lang)
	case "/renew":
		return b.handleRenewUser(args, lang)
	case "/search":
		return b.handleSearchUser(args, lang)
	case "/lang":
		return b.handleLanguageChange(args, userID)
	case "/about":
		return t["about"]
	default:
		return "❓ Unknown command. Use /menu for available options.\n\n📌 @Zendan_Ui"
	}
}

func (b *Bot) isAuthorized(userID int64) bool {
	if userID == b.adminID {
		return true
	}
	var admin models.Admin
	result := database.DB.Where("telegram_id = ? AND is_active = ?", userID, true).First(&admin)
	return result.Error == nil
}

func (b *Bot) buildMainMenu(lang string) string {
	t := translations[lang]
	return fmt.Sprintf(`%s

/users — %s
/create <username> <traffic_gb> <days> — %s
/stats — System Statistics
/servers — %s
/sub <username> — Get subscription link
/suspend <username> — Suspend user
/activate <username> — Activate user
/resettraffic <username> — Reset traffic
/renew <username> <days> — Renew user
/search <query> — Search users
/lang <en|fa|ru> — Change language
/about — About Z-UI

📌 @Zendan_Ui`, t["main_menu"], t["user_list"], t["create_user"], t["servers"])
}

func (b *Bot) handleUserList(lang string) string {
	var users []models.User
	database.DB.Order("created_at DESC").Limit(20).Find(&users)

	if len(users) == 0 {
		return "📋 No users found."
	}

	var sb strings.Builder
	sb.WriteString("👥 *Users:*\n\n")
	for i, u := range users {
		status := "✅"
		if u.Status == "disabled" {
			status = "⛔"
		} else if u.Status == "expired" {
			status = "⏰"
		} else if u.Status == "limited" {
			status = "📊"
		}

		traffic := formatBytes(u.TrafficUsed)
		limit := "♾️"
		if u.TrafficLimit > 0 {
			limit = formatBytes(u.TrafficLimit)
		}

		sb.WriteString(fmt.Sprintf("%d. %s `%s` — %s/%s", i+1, status, u.Username, traffic, limit))
		if u.ExpiresAt != nil {
			sb.WriteString(fmt.Sprintf(" — %s", u.ExpiresAt.Format("2006-01-02")))
		}
		sb.WriteString("\n")
	}

	return sb.String()
}

func (b *Bot) handleCreateUser(args string, lang string) string {
	t := translations[lang]
	parts := strings.Fields(args)
	if len(parts) < 3 {
		return "Usage: /create <username> <traffic_gb> <days>\nExample: /create john 50 30"
	}

	username := parts[0]
	trafficGB, _ := strconv.ParseInt(parts[1], 10, 64)
	days, _ := strconv.Atoi(parts[2])

	var count int64
	database.DB.Model(&models.User{}).Where("username = ?", username).Count(&count)
	if count > 0 {
		return fmt.Sprintf(t["error"], "Username already exists")
	}

	expiresAt := time.Now().AddDate(0, 0, days)
	trafficBytes := trafficGB * 1024 * 1024 * 1024

	user := models.User{
		UUID:         uuid.New().String(),
		Username:     username,
		Status:       "active",
		TrafficLimit: trafficBytes,
		SubToken:     uuid.New().String(),
		SubShortLink: crypto.GenerateShortLink(8),
		ExpiresAt:    &expiresAt,
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return fmt.Sprintf(t["error"], err.Error())
	}

	// Default subscription
	sub := models.Subscription{
		UUID:      uuid.New().String(),
		UserID:    user.ID,
		Name:      "Default",
		Token:     uuid.New().String(),
		ShortLink: crypto.GenerateShortLink(8),
		Format:    "auto",
		IsActive:  true,
	}
	database.DB.Create(&sub)

	// Add to all active inbounds
	var inbounds []models.Inbound
	database.DB.Where("is_active = ?", true).Find(&inbounds)
	for _, inbound := range inbounds {
		proxy := models.Proxy{
			UUID:      uuid.New().String(),
			UserID:    user.ID,
			InboundID: inbound.ID,
			Protocol:  inbound.Protocol,
			Email:     username + "@" + inbound.Tag,
			IsActive:  true,
		}
		database.DB.Create(&proxy)
	}

	subLink := fmt.Sprintf("%s/sub/%s", b.baseURL, user.SubToken)
	trafficStr := "♾️"
	if trafficGB > 0 {
		trafficStr = fmt.Sprintf("%dGB", trafficGB)
	}

	return fmt.Sprintf(t["user_created"], username, subLink, trafficStr, expiresAt.Format("2006-01-02"))
}

func (b *Bot) handleStats(lang string) string {
	t := translations[lang]

	var totalUsers, activeUsers, disabledUsers, serverCount int64
	database.DB.Model(&models.User{}).Count(&totalUsers)
	database.DB.Model(&models.User{}).Where("status = ?", "active").Count(&activeUsers)
	database.DB.Model(&models.User{}).Where("status = ?", "disabled").Count(&disabledUsers)
	database.DB.Model(&models.Server{}).Count(&serverCount)

	var totalTraffic struct{ Total int64 }
	database.DB.Model(&models.User{}).Select("COALESCE(SUM(traffic_up + traffic_down), 0) as total").Scan(&totalTraffic)

	return fmt.Sprintf(t["stats"],
		totalUsers, activeUsers, disabledUsers, serverCount,
		formatBytes(totalTraffic.Total))
}

func (b *Bot) handleServerList(lang string) string {
	var servers []models.Server
	database.DB.Find(&servers)

	if len(servers) == 0 {
		return "🖥️ No servers configured."
	}

	var sb strings.Builder
	sb.WriteString("🖥️ *Servers:*\n\n")
	for _, s := range servers {
		status := "🟢"
		if s.Status == "offline" {
			status = "🔴"
		}
		sb.WriteString(fmt.Sprintf("%s *%s* (%s)\n  %s · CPU: %.1f%% · RAM: %.1f%%\n\n",
			status, s.Name, s.Location, s.Host, s.CPU, s.Memory))
	}

	return sb.String()
}

func (b *Bot) handleGetSubLink(args string, lang string) string {
	t := translations[lang]
	username := strings.TrimSpace(args)
	if username == "" {
		return "Usage: /sub <username>"
	}

	var user models.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		return fmt.Sprintf(t["error"], "User not found")
	}

	subLink := fmt.Sprintf("%s/sub/%s", b.baseURL, user.SubToken)
	return fmt.Sprintf(t["sub_link"], subLink)
}

func (b *Bot) handleSuspendUser(args string, lang string) string {
	t := translations[lang]
	username := strings.TrimSpace(args)
	if username == "" {
		return "Usage: /suspend <username>"
	}

	result := database.DB.Model(&models.User{}).Where("username = ?", username).Update("status", "disabled")
	if result.RowsAffected == 0 {
		return fmt.Sprintf(t["error"], "User not found")
	}

	return fmt.Sprintf(t["user_suspended"], username)
}

func (b *Bot) handleActivateUser(args string, lang string) string {
	t := translations[lang]
	username := strings.TrimSpace(args)
	if username == "" {
		return "Usage: /activate <username>"
	}

	result := database.DB.Model(&models.User{}).Where("username = ?", username).Update("status", "active")
	if result.RowsAffected == 0 {
		return fmt.Sprintf(t["error"], "User not found")
	}

	return fmt.Sprintf(t["user_activated"], username)
}

func (b *Bot) handleResetTraffic(args string, lang string) string {
	t := translations[lang]
	username := strings.TrimSpace(args)
	if username == "" {
		return "Usage: /resettraffic <username>"
	}

	result := database.DB.Model(&models.User{}).Where("username = ?", username).Updates(map[string]interface{}{
		"traffic_used": 0, "traffic_up": 0, "traffic_down": 0,
	})
	if result.RowsAffected == 0 {
		return fmt.Sprintf(t["error"], "User not found")
	}

	return fmt.Sprintf(t["traffic_reset"], username)
}

func (b *Bot) handleRenewUser(args string, lang string) string {
	parts := strings.Fields(args)
	if len(parts) < 2 {
		return "Usage: /renew <username> <days>"
	}

	username := parts[0]
	days, _ := strconv.Atoi(parts[1])
	if days <= 0 {
		return "Days must be positive"
	}

	var user models.User
	if err := database.DB.Where("username = ?", username).First(&user).Error; err != nil {
		return "❌ User not found"
	}

	newExpiry := time.Now().AddDate(0, 0, days)
	if user.ExpiresAt != nil && user.ExpiresAt.After(time.Now()) {
		newExpiry = user.ExpiresAt.AddDate(0, 0, days)
	}

	database.DB.Model(&user).Updates(map[string]interface{}{
		"expires_at": newExpiry,
		"status":     "active",
	})

	return fmt.Sprintf("✅ User `%s` renewed until %s", username, newExpiry.Format("2006-01-02"))
}

func (b *Bot) handleSearchUser(args string, lang string) string {
	query := strings.TrimSpace(args)
	if query == "" {
		return "Usage: /search <username or email>"
	}

	var users []models.User
	database.DB.Where("username LIKE ? OR email LIKE ?", "%"+query+"%", "%"+query+"%").
		Limit(10).Find(&users)

	if len(users) == 0 {
		return "🔍 No users found."
	}

	var sb strings.Builder
	sb.WriteString(fmt.Sprintf("🔍 Results for `%s`:\n\n", query))
	for _, u := range users {
		sb.WriteString(fmt.Sprintf("👤 `%s` — %s — %s/%s\n",
			u.Username, u.Status, formatBytes(u.TrafficUsed),
			func() string {
				if u.TrafficLimit > 0 {
					return formatBytes(u.TrafficLimit)
				}
				return "♾️"
			}()))
	}

	return sb.String()
}

func (b *Bot) handleLanguageChange(args string, userID int64) string {
	lang := strings.TrimSpace(strings.ToLower(args))
	if lang != "en" && lang != "fa" && lang != "ru" {
		return "Available: en, fa, ru\nUsage: /lang en"
	}

	database.DB.Model(&models.Admin{}).Where("telegram_id = ?", userID).Update("language", lang)
	return fmt.Sprintf("🌐 Language changed to: %s", lang)
}

// ========== Alert Monitor ==========

func (b *Bot) monitorAlerts() {
	ticker := time.NewTicker(1 * time.Hour)
	for range ticker.C {
		// Expiration alerts
		var expiringUsers []models.User
		threshold := time.Now().AddDate(0, 0, 3)
		database.DB.Where("status = ? AND expires_at IS NOT NULL AND expires_at <= ? AND expires_at > ?",
			"active", threshold, time.Now()).Find(&expiringUsers)

		for _, u := range expiringUsers {
			daysLeft := int(time.Until(*u.ExpiresAt).Hours() / 24)
			logger.Info("Alert: User %s expires in %d days", u.Username, daysLeft)
		}

		// Traffic alerts
		var highTrafficUsers []models.User
		database.DB.Where("status = ? AND traffic_limit > 0", "active").Find(&highTrafficUsers)
		for _, u := range highTrafficUsers {
			if float64(u.TrafficUsed)/float64(u.TrafficLimit) > 0.9 {
				logger.Info("Alert: User %s at 90%% traffic", u.Username)
			}
		}

		// Auto-expire
		database.DB.Model(&models.User{}).
			Where("status = ? AND expires_at IS NOT NULL AND expires_at <= ?", "active", time.Now()).
			Update("status", "expired")

		// Auto-limit
		database.DB.Model(&models.User{}).
			Where("status = ? AND traffic_limit > 0 AND traffic_used >= traffic_limit", "active").
			Update("status", "limited")

		// Auto-renew
		var renewUsers []models.User
		database.DB.Where("auto_renew = ? AND status IN ?", true, []string{"expired", "limited"}).
			Find(&renewUsers)
		for _, u := range renewUsers {
			newExpiry := time.Now().AddDate(0, 0, u.RenewDays)
			database.DB.Model(&u).Updates(map[string]interface{}{
				"status": "active", "expires_at": newExpiry,
				"traffic_used": 0, "traffic_up": 0, "traffic_down": 0,
			})
			logger.Info("Auto-renewed user: %s", u.Username)
		}
	}
}

func formatBytes(bytes int64) string {
	if bytes == 0 {
		return "0 B"
	}
	units := []string{"B", "KB", "MB", "GB", "TB"}
	i := 0
	val := float64(bytes)
	for val >= 1024 && i < len(units)-1 {
		val /= 1024
		i++
	}
	return fmt.Sprintf("%.1f %s", val, units[i])
}
