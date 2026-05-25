package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/Zendan-ui/z-ui/internal/database"
	"github.com/Zendan-ui/z-ui/internal/database/models"
)

type TunnelHandler struct{}

func NewTunnelHandler() *TunnelHandler {
	return &TunnelHandler{}
}

type CreateTunnelRequest struct {
	Name        string `json:"name"`
	Type        string `json:"type"`        // direct, reverse, relay, warp
	Source      string `json:"source"`
	Destination string `json:"destination"`
	Port        int    `json:"port"`
	DestPort    int    `json:"dest_port"`
	Protocol    string `json:"protocol"`    // tcp, udp, tcp+udp
	Remark      string `json:"remark"`
	Settings    string `json:"settings"`    // JSON — WARP config, etc.
	InboundTags string `json:"inbound_tags"` // comma-separated inbound tags to route
}

func (h *TunnelHandler) List(c *fiber.Ctx) error {
	var tunnels []models.Outbound
	database.DB.Where("protocol IN ?", []string{"tunnel", "wireguard", "freedom"}).Find(&tunnels)
	return c.JSON(fiber.Map{"tunnels": tunnels})
}

func (h *TunnelHandler) Get(c *fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 32)
	var tunnel models.Outbound
	if err := database.DB.First(&tunnel, uint(id)).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Tunnel not found"})
	}
	return c.JSON(tunnel)
}

func (h *TunnelHandler) Create(c *fiber.Ctx) error {
	var req CreateTunnelRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if req.Name == "" || req.Type == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Name and type are required"})
	}

	// Determine protocol based on tunnel type
	proto := "freedom"
	switch req.Type {
	case "warp":
		proto = "wireguard"
	case "direct", "relay":
		proto = "freedom"
	case "reverse":
		proto = "freedom"
	}

	tunnel := models.Outbound{
		UUID:     uuid.New().String(),
		Tag:      "tunnel-" + req.Name,
		Protocol: proto,
		Settings: req.Settings,
		IsActive: true,
	}

	if err := database.DB.Create(&tunnel).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create tunnel"})
	}

	return c.Status(201).JSON(tunnel)
}

func (h *TunnelHandler) Update(c *fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 32)
	var tunnel models.Outbound
	if err := database.DB.First(&tunnel, uint(id)).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Tunnel not found"})
	}

	var req CreateTunnelRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	updates := map[string]interface{}{}
	if req.Name != "" {
		updates["tag"] = "tunnel-" + req.Name
	}
	if req.Settings != "" {
		updates["settings"] = req.Settings
	}

	database.DB.Model(&tunnel).Updates(updates)
	return c.JSON(tunnel)
}

func (h *TunnelHandler) Delete(c *fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 32)
	database.DB.Delete(&models.Outbound{}, uint(id))
	return c.JSON(fiber.Map{"message": "Tunnel deleted"})
}

func (h *TunnelHandler) Toggle(c *fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 32)
	var tunnel models.Outbound
	if err := database.DB.First(&tunnel, uint(id)).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Not found"})
	}

	tunnel.IsActive = !tunnel.IsActive
	database.DB.Save(&tunnel)

	return c.JSON(fiber.Map{
		"message":   "Toggled",
		"is_active": tunnel.IsActive,
	})
}
