package handlers

import (
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/Zendan-ui/z-ui/internal/database"
	"github.com/Zendan-ui/z-ui/internal/database/models"
	"github.com/Zendan-ui/z-ui/internal/subscription"
	"github.com/Zendan-ui/z-ui/pkg/crypto"
)

type SubscriptionHandler struct {
	subSvc *subscription.SubscriptionService
}

func NewSubscriptionHandler(subSvc *subscription.SubscriptionService) *SubscriptionHandler {
	return &SubscriptionHandler{subSvc: subSvc}
}

// Public endpoint: Serve subscription content
func (h *SubscriptionHandler) Serve(c *fiber.Ctx) error {
	token := c.Params("token")
	format := c.Query("format", "auto")
	userAgent := c.Get("User-Agent")

	content, contentType, err := h.subSvc.GenerateSubscription(token, format, userAgent)
	if err != nil {
		return c.Status(404).SendString("Subscription not found or expired")
	}

	c.Set("Content-Type", contentType)
	c.Set("Subscription-Userinfo", h.getUserInfo(token))
	c.Set("Profile-Update-Interval", "1")
	c.Set("Content-Disposition", "attachment; filename=z-ui-sub")

	return c.SendString(content)
}

// Public endpoint: Serve by short link
func (h *SubscriptionHandler) ServeShort(c *fiber.Ctx) error {
	shortLink := c.Params("short")
	format := c.Query("format", "auto")
	userAgent := c.Get("User-Agent")

	content, contentType, err := h.subSvc.GenerateByShortLink(shortLink, format, userAgent)
	if err != nil {
		return c.Status(404).SendString("Not found")
	}

	c.Set("Content-Type", contentType)
	c.Set("Profile-Update-Interval", "1")

	return c.SendString(content)
}

func (h *SubscriptionHandler) getUserInfo(token string) string {
	var user models.User
	if err := database.DB.Where("sub_token = ?", token).First(&user).Error; err != nil {
		return ""
	}

	info := fmt.Sprintf("upload=%d; download=%d; total=%d",
		user.TrafficUp, user.TrafficDown, user.TrafficLimit)

	if user.ExpiresAt != nil {
		info += fmt.Sprintf("; expire=%d", user.ExpiresAt.Unix())
	}

	return info
}

// Admin endpoints
func (h *SubscriptionHandler) List(c *fiber.Ctx) error {
	userID := c.Query("user_id", "")

	query := database.DB.Model(&models.Subscription{}).Preload("User")
	if userID != "" {
		query = query.Where("user_id = ?", userID)
	}

	var subs []models.Subscription
	query.Find(&subs)

	return c.JSON(fiber.Map{"subscriptions": subs})
}

func (h *SubscriptionHandler) Get(c *fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 32)

	var sub models.Subscription
	if err := database.DB.Preload("User").First(&sub, uint(id)).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Subscription not found"})
	}

	return c.JSON(sub)
}

func (h *SubscriptionHandler) Create(c *fiber.Ctx) error {
	var req struct {
		UserID    uint   `json:"user_id"`
		Name      string `json:"name"`
		Format    string `json:"format"`
		ProxyIDs  []uint `json:"proxy_ids"`
		ServerIDs []uint `json:"server_ids"`
		Include   string `json:"include"`
		Exclude   string `json:"exclude"`
		ExpiresAt string `json:"expires_at"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	proxyIDsJSON, _ := json.Marshal(req.ProxyIDs)
	serverIDsJSON, _ := json.Marshal(req.ServerIDs)

	sub := models.Subscription{
		UUID:      uuid.New().String(),
		UserID:    req.UserID,
		Name:      req.Name,
		Token:     uuid.New().String(),
		ShortLink: crypto.GenerateShortLink(8),
		Format:    req.Format,
		ProxyIDs:  string(proxyIDsJSON),
		ServerIDs: string(serverIDsJSON),
		Include:   req.Include,
		Exclude:   req.Exclude,
		IsActive:  true,
	}

	if req.ExpiresAt != "" {
		t, err := time.Parse(time.RFC3339, req.ExpiresAt)
		if err == nil {
			sub.ExpiresAt = &t
		}
	}

	if err := database.DB.Create(&sub).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create subscription"})
	}

	return c.Status(201).JSON(sub)
}

func (h *SubscriptionHandler) Delete(c *fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 32)
	database.DB.Delete(&models.Subscription{}, uint(id))
	return c.JSON(fiber.Map{"message": "Subscription deleted"})
}

func (h *SubscriptionHandler) Regenerate(c *fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 32)

	var sub models.Subscription
	if err := database.DB.First(&sub, uint(id)).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Not found"})
	}

	sub.Token = uuid.New().String()
	sub.ShortLink = crypto.GenerateShortLink(8)
	database.DB.Save(&sub)

	return c.JSON(sub)
}

func (h *SubscriptionHandler) GetLogs(c *fiber.Ctx) error {
	subID := c.Params("id")
	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", "50"))

	var logs []models.SubLog
	var total int64

	query := database.DB.Model(&models.SubLog{}).Where("subscription_id = ?", subID)
	query.Count(&total)
	query.Order("created_at DESC").Offset((page - 1) * pageSize).Limit(pageSize).Find(&logs)

	return c.JSON(fiber.Map{
		"logs":  logs,
		"total": total,
		"page":  page,
	})
}

func (h *SubscriptionHandler) Analytics(c *fiber.Ctx) error {
	userID := c.Params("user_id")

	var stats struct {
		TotalHits    int64 `json:"total_hits"`
		UniqueIPs    int64 `json:"unique_ips"`
		LastAccess   *time.Time `json:"last_access"`
	}

	database.DB.Model(&models.SubLog{}).Where("user_id = ?", userID).Count(&stats.TotalHits)
	database.DB.Model(&models.SubLog{}).Where("user_id = ?", userID).
		Select("COUNT(DISTINCT ip)").Scan(&stats.UniqueIPs)

	var lastLog models.SubLog
	database.DB.Where("user_id = ?", userID).Order("created_at DESC").First(&lastLog)
	if lastLog.ID > 0 {
		stats.LastAccess = &lastLog.CreatedAt
	}

	return c.JSON(stats)
}
