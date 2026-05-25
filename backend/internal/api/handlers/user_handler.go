package handlers

import (
	"encoding/json"
	"math"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/Zendan-ui/z-ui/internal/database"
	"github.com/Zendan-ui/z-ui/internal/database/models"
	"github.com/Zendan-ui/z-ui/pkg/crypto"
)

type UserHandler struct{}

func NewUserHandler() *UserHandler { return &UserHandler{} }

type CreateUserRequest struct {
	Username          string `json:"username"`
	Email             string `json:"email"`
	TelegramID        int64  `json:"telegram_id"`
	TrafficLimit      int64  `json:"traffic_limit"`
	DeviceLimit       int    `json:"device_limit"`
	ExpiresAt         string `json:"expires_at"`
	AutoRenew         bool   `json:"auto_renew"`
	RenewDays         int    `json:"renew_days"`
	RenewTraffic      int64  `json:"renew_traffic"`
	InboundIDs        []uint `json:"inbound_ids"`
	Note              string `json:"note"`
	Tags              string `json:"tags"`
	DataLimitReset    string `json:"data_limit_reset_strategy"` // no_reset, day, week, month
	ExcludedInbounds  []uint `json:"excluded_inbounds"`
	OnHoldExpire      int64  `json:"on_hold_expire_duration"`
	Status            string `json:"status"` // active, on_hold, disabled
}

type UpdateUserRequest struct {
	Email        *string `json:"email"`
	TelegramID   *int64  `json:"telegram_id"`
	Status       *string `json:"status"`
	TrafficLimit *int64  `json:"traffic_limit"`
	DeviceLimit  *int    `json:"device_limit"`
	ExpiresAt    *string `json:"expires_at"`
	AutoRenew    *bool   `json:"auto_renew"`
	Note         *string `json:"note"`
	Tags         *string `json:"tags"`
}

// generateProxySettings creates real protocol-specific settings JSON for a proxy
func generateProxySettings(protocol string, userUUID string) string {
	var settings map[string]interface{}

	switch protocol {
	case "vless":
		settings = map[string]interface{}{
			"id":   userUUID,
			"flow": "",
		}
	case "vmess":
		settings = map[string]interface{}{
			"id":       userUUID,
			"security": "auto",
		}
	case "trojan":
		settings = map[string]interface{}{
			"password": userUUID,
		}
	case "shadowsocks":
		key, _ := crypto.GenerateShadowsocks2022Key(16)
		settings = map[string]interface{}{
			"password": key,
			"method":   "2022-blake3-aes-128-gcm",
		}
	case "hysteria2":
		settings = map[string]interface{}{
			"password": crypto.GenerateToken(16),
		}
	case "tuic":
		settings = map[string]interface{}{
			"uuid":     userUUID,
			"password": crypto.GenerateToken(16),
		}
	case "wireguard":
		privKey, pubKey, _ := crypto.GenerateWireGuardKeyPair()
		settings = map[string]interface{}{
			"private_key":     privKey,
			"peer_public_key": pubKey,
			"address":         "10.0.0.2/32",
		}
	default:
		settings = map[string]interface{}{
			"id": userUUID,
		}
	}

	jsonBytes, _ := json.Marshal(settings)
	return string(jsonBytes)
}

func (h *UserHandler) List(c *fiber.Ctx) error {
	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", "20"))
	search := c.Query("search", "")
	status := c.Query("status", "")
	sortBy := c.Query("sort_by", "created_at")
	sortOrder := c.Query("sort_order", "desc")

	if page < 1 { page = 1 }
	if pageSize < 1 { pageSize = 20 }
	if pageSize > 100 { pageSize = 100 }

	var users []models.User
	var total int64
	query := database.DB.Model(&models.User{})
	if search != "" {
		query = query.Where("username LIKE ? OR email LIKE ?", "%"+search+"%", "%"+search+"%")
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	query.Count(&total)
	query.Order(sortBy + " " + sortOrder).Offset((page - 1) * pageSize).Limit(pageSize).
		Preload("Proxies").Preload("Subscriptions").Find(&users)

	return c.JSON(fiber.Map{
		"users":       users,
		"total":       total,
		"page":        page,
		"page_size":   pageSize,
		"total_pages": int(math.Ceil(float64(total) / float64(pageSize))),
	})
}

func (h *UserHandler) Get(c *fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 32)
	var user models.User
	if err := database.DB.Preload("Proxies").Preload("Proxies.Inbound").Preload("Proxies.Inbound.Server").
		Preload("Subscriptions").Preload("Devices").First(&user, uint(id)).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}
	return c.JSON(user)
}

func (h *UserHandler) Create(c *fiber.Ctx) error {
	var req CreateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}
	if req.Username == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Username is required"})
	}

	var count int64
	database.DB.Model(&models.User{}).Where("username = ?", req.Username).Count(&count)
	if count > 0 {
		return c.Status(409).JSON(fiber.Map{"error": "Username already exists"})
	}

	adminID, _ := c.Locals("admin_id").(uint)
	userUUID := uuid.New().String()

	status := req.Status
	if status == "" {
		status = "active"
	}
	dataReset := req.DataLimitReset
	if dataReset == "" {
		dataReset = "no_reset"
	}

	user := models.User{
		UUID:           userUUID,
		Username:       req.Username,
		Email:          req.Email,
		TelegramID:     req.TelegramID,
		Status:         status,
		DataLimitReset: dataReset,
		OnHoldExpire:   req.OnHoldExpire,
		TrafficLimit: req.TrafficLimit,
		DeviceLimit:  req.DeviceLimit,
		SubToken:     uuid.New().String(),
		SubShortLink: crypto.GenerateShortLink(8),
		Note:         req.Note,
		Tags:         req.Tags,
		AdminID:      adminID,
		AutoRenew:    req.AutoRenew,
		RenewDays:    req.RenewDays,
		RenewTraffic: req.RenewTraffic,
	}

	if req.ExpiresAt != "" {
		t, err := time.Parse(time.RFC3339, req.ExpiresAt)
		if err == nil {
			user.ExpiresAt = &t
		}
	}

	if err := database.DB.Create(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create user"})
	}

	// Create proxies for specified inbounds (or all active inbounds)
	inboundIDs := req.InboundIDs
	if len(inboundIDs) == 0 {
		// If no inbounds specified, use all active ones
		var allInbounds []models.Inbound
		database.DB.Where("is_active = ?", true).Find(&allInbounds)
		for _, ib := range allInbounds {
			inboundIDs = append(inboundIDs, ib.ID)
		}
	}

	for _, inboundID := range inboundIDs {
		var inbound models.Inbound
		if err := database.DB.First(&inbound, inboundID).Error; err != nil {
			continue
		}

		proxyUUID := uuid.New().String()

		// Generate REAL protocol settings with actual UUID/password
		settings := generateProxySettings(inbound.Protocol, proxyUUID)

		proxy := models.Proxy{
			UUID:      proxyUUID,
			UserID:    user.ID,
			InboundID: inboundID,
			Protocol:  inbound.Protocol,
			Settings:  settings,
			Email:     user.Username + "@" + inbound.Tag,
			IsActive:  true,
		}

		// Set flow for VLESS Reality
		if inbound.Protocol == "vless" && inbound.Security == "reality" {
			proxy.FlowType = "xtls-rprx-vision"
		}

		database.DB.Create(&proxy)
	}

	// Create default subscription
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

	// Reload with associations
	database.DB.Preload("Proxies").Preload("Proxies.Inbound").Preload("Subscriptions").First(&user, user.ID)

	// Build subscription URL and links
	baseURL := c.Protocol() + "://" + c.Hostname()
	if c.Port() != "443" && c.Port() != "80" {
		baseURL += ":" + c.Port()
	}
	subURL := baseURL + "/sub/" + user.SubToken

	// Generate individual proxy links
	var links []string
	for _, proxy := range user.Proxies {
		if proxy.Inbound != nil && proxy.Inbound.Server != nil {
			host := proxy.Inbound.Server.Host
			port := proxy.Inbound.Port
			var settings map[string]interface{}
			json.Unmarshal([]byte(proxy.Settings), &settings)
			uid := ""
			if id, ok := settings["id"].(string); ok {
				uid = id
			} else if pw, ok := settings["password"].(string); ok {
				uid = pw
			}
			if uid != "" {
				switch proxy.Protocol {
				case "vless":
					links = append(links, "vless://"+uid+"@"+host+":"+strconv.Itoa(port)+"#"+proxy.Email)
				case "vmess":
					links = append(links, "vmess://"+uid+"@"+host+":"+strconv.Itoa(port)+"#"+proxy.Email)
				case "trojan":
					links = append(links, "trojan://"+uid+"@"+host+":"+strconv.Itoa(port)+"#"+proxy.Email)
				}
			}
		}
	}

	return c.Status(201).JSON(fiber.Map{
		"user":             user,
		"subscription_url": subURL,
		"links":            links,
	})
}

func (h *UserHandler) Update(c *fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 32)
	var user models.User
	if err := database.DB.First(&user, uint(id)).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	var req UpdateUserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	updates := make(map[string]interface{})
	if req.Email != nil { updates["email"] = *req.Email }
	if req.TelegramID != nil { updates["telegram_id"] = *req.TelegramID }
	if req.Status != nil { updates["status"] = *req.Status }
	if req.TrafficLimit != nil { updates["traffic_limit"] = *req.TrafficLimit }
	if req.DeviceLimit != nil { updates["device_limit"] = *req.DeviceLimit }
	if req.AutoRenew != nil { updates["auto_renew"] = *req.AutoRenew }
	if req.Note != nil { updates["note"] = *req.Note }
	if req.Tags != nil { updates["tags"] = *req.Tags }
	if req.ExpiresAt != nil {
		t, err := time.Parse(time.RFC3339, *req.ExpiresAt)
		if err == nil { updates["expires_at"] = t }
	}

	database.DB.Model(&user).Updates(updates)
	database.DB.Preload("Proxies").Preload("Subscriptions").First(&user, user.ID)
	return c.JSON(user)
}

func (h *UserHandler) Delete(c *fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 32)
	var user models.User
	if err := database.DB.First(&user, uint(id)).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}
	database.DB.Where("user_id = ?", user.ID).Delete(&models.Proxy{})
	database.DB.Where("user_id = ?", user.ID).Delete(&models.Subscription{})
	database.DB.Where("user_id = ?", user.ID).Delete(&models.Device{})
	database.DB.Delete(&user)
	return c.JSON(fiber.Map{"message": "User deleted"})
}

func (h *UserHandler) ResetTraffic(c *fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 32)
	database.DB.Model(&models.User{}).Where("id = ?", uint(id)).Updates(map[string]interface{}{
		"traffic_used": 0, "traffic_up": 0, "traffic_down": 0,
	})
	return c.JSON(fiber.Map{"message": "Traffic reset"})
}

func (h *UserHandler) Suspend(c *fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 32)
	database.DB.Model(&models.User{}).Where("id = ?", uint(id)).Update("status", "disabled")
	return c.JSON(fiber.Map{"message": "User suspended"})
}

func (h *UserHandler) Activate(c *fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 32)
	database.DB.Model(&models.User{}).Where("id = ?", uint(id)).Update("status", "active")
	return c.JSON(fiber.Map{"message": "User activated"})
}

func (h *UserHandler) RevokeSubscription(c *fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 32)
	newToken := uuid.New().String()
	newShort := crypto.GenerateShortLink(8)
	database.DB.Model(&models.User{}).Where("id = ?", uint(id)).Updates(map[string]interface{}{
		"sub_token": newToken, "sub_short_link": newShort,
	})
	return c.JSON(fiber.Map{"message": "Subscription revoked", "new_token": newToken})
}

func (h *UserHandler) GetUsage(c *fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 32)
	days, _ := strconv.Atoi(c.Query("days", "30"))
	var logs []models.TrafficLog
	since := time.Now().AddDate(0, 0, -days)
	database.DB.Where("user_id = ? AND period >= ?", uint(id), since).Order("period ASC").Find(&logs)
	return c.JSON(fiber.Map{"usage": logs})
}

func (h *UserHandler) GetDevices(c *fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 32)
	var devices []models.Device
	database.DB.Where("user_id = ?", uint(id)).Order("last_seen DESC").Find(&devices)
	return c.JSON(fiber.Map{"devices": devices})
}

func (h *UserHandler) Stats(c *fiber.Ctx) error {
	var stats struct {
		Total    int64 `json:"total"`
		Active   int64 `json:"active"`
		Disabled int64 `json:"disabled"`
		Expired  int64 `json:"expired"`
		Limited  int64 `json:"limited"`
	}
	database.DB.Model(&models.User{}).Count(&stats.Total)
	database.DB.Model(&models.User{}).Where("status = ?", "active").Count(&stats.Active)
	database.DB.Model(&models.User{}).Where("status = ?", "disabled").Count(&stats.Disabled)
	database.DB.Model(&models.User{}).Where("status = ?", "expired").Count(&stats.Expired)
	database.DB.Model(&models.User{}).Where("status = ?", "limited").Count(&stats.Limited)
	return c.JSON(stats)
}
