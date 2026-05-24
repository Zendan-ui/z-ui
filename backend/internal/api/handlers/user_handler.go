package handlers

import (
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

func NewUserHandler() *UserHandler {
	return &UserHandler{}
}

type CreateUserRequest struct {
	Username     string  `json:"username"`
	Email        string  `json:"email"`
	TelegramID   int64   `json:"telegram_id"`
	TrafficLimit int64   `json:"traffic_limit"`
	DeviceLimit  int     `json:"device_limit"`
	ExpiresAt    string  `json:"expires_at"`
	AutoRenew    bool    `json:"auto_renew"`
	RenewDays    int     `json:"renew_days"`
	RenewTraffic int64   `json:"renew_traffic"`
	InboundIDs   []uint  `json:"inbound_ids"`
	Note         string  `json:"note"`
	Tags         string  `json:"tags"`
}

type UpdateUserRequest struct {
	Email        *string  `json:"email"`
	TelegramID   *int64   `json:"telegram_id"`
	Status       *string  `json:"status"`
	TrafficLimit *int64   `json:"traffic_limit"`
	DeviceLimit  *int     `json:"device_limit"`
	ExpiresAt    *string  `json:"expires_at"`
	AutoRenew    *bool    `json:"auto_renew"`
	RenewDays    *int     `json:"renew_days"`
	RenewTraffic *int64   `json:"renew_traffic"`
	Note         *string  `json:"note"`
	Tags         *string  `json:"tags"`
}

type UserListResponse struct {
	Users      []models.User `json:"users"`
	Total      int64         `json:"total"`
	Page       int           `json:"page"`
	PageSize   int           `json:"page_size"`
	TotalPages int           `json:"total_pages"`
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
		query = query.Where("username LIKE ? OR email LIKE ? OR note LIKE ?",
			"%"+search+"%", "%"+search+"%", "%"+search+"%")
	}

	if status != "" {
		query = query.Where("status = ?", status)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	query.Order(sortBy + " " + sortOrder).
		Offset(offset).
		Limit(pageSize).
		Preload("Proxies").
		Preload("Subscriptions").
		Find(&users)

	totalPages := int(math.Ceil(float64(total) / float64(pageSize)))

	return c.JSON(UserListResponse{
		Users:      users,
		Total:      total,
		Page:       page,
		PageSize:   pageSize,
		TotalPages: totalPages,
	})
}

func (h *UserHandler) Get(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var user models.User
	result := database.DB.Preload("Proxies").
		Preload("Proxies.Inbound").
		Preload("Subscriptions").
		Preload("Devices").
		First(&user, uint(id))

	if result.Error != nil {
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

	// Check duplicate
	var count int64
	database.DB.Model(&models.User{}).Where("username = ?", req.Username).Count(&count)
	if count > 0 {
		return c.Status(409).JSON(fiber.Map{"error": "Username already exists"})
	}

	adminID, _ := c.Locals("admin_id").(uint)

	user := models.User{
		UUID:         uuid.New().String(),
		Username:     req.Username,
		Email:        req.Email,
		TelegramID:   req.TelegramID,
		Status:       "active",
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

	// Create proxies for specified inbounds
	if len(req.InboundIDs) > 0 {
		for _, inboundID := range req.InboundIDs {
			var inbound models.Inbound
			if err := database.DB.First(&inbound, inboundID).Error; err != nil {
				continue
			}

			proxy := models.Proxy{
				UUID:      uuid.New().String(),
				UserID:    user.ID,
				InboundID: inboundID,
				Protocol:  inbound.Protocol,
				Email:     user.Username + "@" + inbound.Tag,
				IsActive:  true,
			}
			database.DB.Create(&proxy)
		}
	}

	// Create default subscription
	sub := models.Subscription{
		UUID:     uuid.New().String(),
		UserID:   user.ID,
		Name:     "Default",
		Token:    uuid.New().String(),
		ShortLink: crypto.GenerateShortLink(8),
		Format:   "auto",
		IsActive: true,
	}
	database.DB.Create(&sub)

	// Reload with associations
	database.DB.Preload("Proxies").Preload("Subscriptions").First(&user, user.ID)

	return c.Status(201).JSON(user)
}

func (h *UserHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

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
	if req.RenewDays != nil { updates["renew_days"] = *req.RenewDays }
	if req.RenewTraffic != nil { updates["renew_traffic"] = *req.RenewTraffic }
	if req.Note != nil { updates["note"] = *req.Note }
	if req.Tags != nil { updates["tags"] = *req.Tags }
	if req.ExpiresAt != nil {
		t, err := time.Parse(time.RFC3339, *req.ExpiresAt)
		if err == nil {
			updates["expires_at"] = t
		}
	}

	if err := database.DB.Model(&user).Updates(updates).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update user"})
	}

	database.DB.Preload("Proxies").Preload("Subscriptions").First(&user, user.ID)
	return c.JSON(user)
}

func (h *UserHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	var user models.User
	if err := database.DB.First(&user, uint(id)).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	// Delete associated records
	database.DB.Where("user_id = ?", user.ID).Delete(&models.Proxy{})
	database.DB.Where("user_id = ?", user.ID).Delete(&models.Subscription{})
	database.DB.Where("user_id = ?", user.ID).Delete(&models.Device{})
	database.DB.Delete(&user)

	return c.JSON(fiber.Map{"message": "User deleted successfully"})
}

func (h *UserHandler) ResetTraffic(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	result := database.DB.Model(&models.User{}).Where("id = ?", uint(id)).Updates(map[string]interface{}{
		"traffic_used": 0,
		"traffic_up":   0,
		"traffic_down": 0,
	})

	if result.Error != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to reset traffic"})
	}

	return c.JSON(fiber.Map{"message": "Traffic reset successfully"})
}

func (h *UserHandler) Suspend(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	database.DB.Model(&models.User{}).Where("id = ?", uint(id)).Update("status", "disabled")
	return c.JSON(fiber.Map{"message": "User suspended"})
}

func (h *UserHandler) Activate(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	database.DB.Model(&models.User{}).Where("id = ?", uint(id)).Update("status", "active")
	return c.JSON(fiber.Map{"message": "User activated"})
}

func (h *UserHandler) RevokeSubscription(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	// Regenerate subscription token
	newToken := uuid.New().String()
	newShort := crypto.GenerateShortLink(8)

	database.DB.Model(&models.User{}).Where("id = ?", uint(id)).Updates(map[string]interface{}{
		"sub_token":      newToken,
		"sub_short_link": newShort,
	})

	return c.JSON(fiber.Map{
		"message":   "Subscription revoked and regenerated",
		"new_token": newToken,
		"new_short": newShort,
	})
}

func (h *UserHandler) GetUsage(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

	days, _ := strconv.Atoi(c.Query("days", "30"))

	var logs []models.TrafficLog
	since := time.Now().AddDate(0, 0, -days)
	database.DB.Where("user_id = ? AND period >= ?", uint(id), since).
		Order("period ASC").
		Find(&logs)

	return c.JSON(fiber.Map{"usage": logs})
}

func (h *UserHandler) GetDevices(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid user ID"})
	}

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
