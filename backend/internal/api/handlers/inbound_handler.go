package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/Zendan-ui/z-ui/internal/database"
	"github.com/Zendan-ui/z-ui/internal/database/models"
)

type InboundHandler struct{}

func NewInboundHandler() *InboundHandler {
	return &InboundHandler{}
}

type CreateInboundRequest struct {
	Tag            string `json:"tag"`
	Protocol       string `json:"protocol"`
	Port           int    `json:"port"`
	Listen         string `json:"listen"`
	Transport      string `json:"transport"`
	Security       string `json:"security"`
	Settings       string `json:"settings"`
	StreamSettings string `json:"stream_settings"`
	Sniffing       string `json:"sniffing"`
	ServerID       uint   `json:"server_id"`
	Remark         string `json:"remark"`
}

func (h *InboundHandler) List(c *fiber.Ctx) error {
	serverID := c.Query("server_id", "")

	query := database.DB.Model(&models.Inbound{}).Preload("Server")
	if serverID != "" {
		query = query.Where("server_id = ?", serverID)
	}

	var inbounds []models.Inbound
	query.Find(&inbounds)

	return c.JSON(fiber.Map{"inbounds": inbounds})
}

func (h *InboundHandler) Get(c *fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 32)
	var inbound models.Inbound
	if err := database.DB.Preload("Server").Preload("Proxies").First(&inbound, uint(id)).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Inbound not found"})
	}
	return c.JSON(inbound)
}

func (h *InboundHandler) Create(c *fiber.Ctx) error {
	var req CreateInboundRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	if req.Tag == "" || req.Protocol == "" || req.Port == 0 {
		return c.Status(400).JSON(fiber.Map{"error": "Tag, protocol, and port are required"})
	}

	validProtocols := map[string]bool{
		"vless": true, "vmess": true, "trojan": true, "shadowsocks": true,
		"hysteria2": true, "tuic": true, "wireguard": true, "socks": true, "ssh": true,
	}
	if !validProtocols[req.Protocol] {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid protocol"})
	}

	inbound := models.Inbound{
		UUID:           uuid.New().String(),
		Tag:            req.Tag,
		Protocol:       req.Protocol,
		Port:           req.Port,
		Listen:         req.Listen,
		Transport:      req.Transport,
		Security:       req.Security,
		Settings:       req.Settings,
		StreamSettings: req.StreamSettings,
		Sniffing:       req.Sniffing,
		ServerID:       req.ServerID,
		IsActive:       true,
		Remark:         req.Remark,
	}

	if inbound.Listen == "" {
		inbound.Listen = "0.0.0.0"
	}

	if err := database.DB.Create(&inbound).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create inbound"})
	}

	return c.Status(201).JSON(inbound)
}

func (h *InboundHandler) Update(c *fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 32)

	var inbound models.Inbound
	if err := database.DB.First(&inbound, uint(id)).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Inbound not found"})
	}

	var req CreateInboundRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	updates := map[string]interface{}{}
	if req.Tag != "" { updates["tag"] = req.Tag }
	if req.Port != 0 { updates["port"] = req.Port }
	if req.Transport != "" { updates["transport"] = req.Transport }
	if req.Security != "" { updates["security"] = req.Security }
	if req.Settings != "" { updates["settings"] = req.Settings }
	if req.StreamSettings != "" { updates["stream_settings"] = req.StreamSettings }
	if req.Remark != "" { updates["remark"] = req.Remark }

	database.DB.Model(&inbound).Updates(updates)

	return c.JSON(inbound)
}

func (h *InboundHandler) Delete(c *fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 32)
	database.DB.Where("inbound_id = ?", uint(id)).Delete(&models.Proxy{})
	database.DB.Delete(&models.Inbound{}, uint(id))
	return c.JSON(fiber.Map{"message": "Inbound deleted"})
}

func (h *InboundHandler) Toggle(c *fiber.Ctx) error {
	id, _ := strconv.ParseUint(c.Params("id"), 10, 32)

	var inbound models.Inbound
	if err := database.DB.First(&inbound, uint(id)).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Inbound not found"})
	}

	inbound.IsActive = !inbound.IsActive
	database.DB.Save(&inbound)

	return c.JSON(fiber.Map{
		"message":   "Inbound toggled",
		"is_active": inbound.IsActive,
	})
}
