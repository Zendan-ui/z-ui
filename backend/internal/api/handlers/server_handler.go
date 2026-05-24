package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/Zendan-ui/z-ui/internal/database"
	"github.com/Zendan-ui/z-ui/internal/database/models"
)

type ServerHandler struct{}

func NewServerHandler() *ServerHandler {
	return &ServerHandler{}
}

type CreateServerRequest struct {
	Name        string `json:"name"`
	Host        string `json:"host"`
	Port        int    `json:"port"`
	SSHUser     string `json:"ssh_user"`
	SSHKey      string `json:"ssh_key"`
	SSHPassword string `json:"ssh_password"`
	APIPort     int    `json:"api_port"`
	APIKey      string `json:"api_key"`
	Type        string `json:"type"`
	Location    string `json:"location"`
	CountryCode string `json:"country_code"`
	ISP         string `json:"isp"`
	Weight      int    `json:"weight"`
	MaxUsers    int    `json:"max_users"`
	Tags        string `json:"tags"`
}

func (h *ServerHandler) List(c *fiber.Ctx) error {
	var servers []models.Server
	database.DB.Preload("Inbounds").Find(&servers)
	return c.JSON(fiber.Map{"servers": servers})
}

func (h *ServerHandler) Get(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid server ID"})
	}

	var server models.Server
	if err := database.DB.Preload("Inbounds").First(&server, uint(id)).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Server not found"})
	}

	return c.JSON(server)
}

func (h *ServerHandler) Create(c *fiber.Ctx) error {
	var req CreateServerRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	server := models.Server{
		UUID:        uuid.New().String(),
		Name:        req.Name,
		Host:        req.Host,
		Port:        req.Port,
		SSHUser:     req.SSHUser,
		SSHKey:      req.SSHKey,
		SSHPassword: req.SSHPassword,
		APIPort:     req.APIPort,
		APIKey:      req.APIKey,
		Type:        req.Type,
		Status:      "offline",
		Location:    req.Location,
		CountryCode: req.CountryCode,
		ISP:         req.ISP,
		Weight:      req.Weight,
		MaxUsers:    req.MaxUsers,
		Tags:        req.Tags,
	}

	if err := database.DB.Create(&server).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create server"})
	}

	return c.Status(201).JSON(server)
}

func (h *ServerHandler) Update(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid server ID"})
	}

	var server models.Server
	if err := database.DB.First(&server, uint(id)).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Server not found"})
	}

	var req CreateServerRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	updates := map[string]interface{}{}
	if req.Name != "" { updates["name"] = req.Name }
	if req.Host != "" { updates["host"] = req.Host }
	if req.Port != 0 { updates["port"] = req.Port }
	if req.Location != "" { updates["location"] = req.Location }
	if req.CountryCode != "" { updates["country_code"] = req.CountryCode }
	if req.Weight != 0 { updates["weight"] = req.Weight }
	if req.Tags != "" { updates["tags"] = req.Tags }

	database.DB.Model(&server).Updates(updates)
	database.DB.Preload("Inbounds").First(&server, server.ID)

	return c.JSON(server)
}

func (h *ServerHandler) Delete(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid server ID"})
	}

	database.DB.Where("server_id = ?", uint(id)).Delete(&models.Inbound{})
	database.DB.Delete(&models.Server{}, uint(id))

	return c.JSON(fiber.Map{"message": "Server deleted"})
}

func (h *ServerHandler) Status(c *fiber.Ctx) error {
	id, err := strconv.ParseUint(c.Params("id"), 10, 32)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid server ID"})
	}

	var server models.Server
	if err := database.DB.First(&server, uint(id)).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Server not found"})
	}

	return c.JSON(fiber.Map{
		"status":      server.Status,
		"cpu":         server.CPU,
		"memory":      server.Memory,
		"disk":        server.Disk,
		"uptime":      server.Uptime,
		"network_in":  server.NetworkIn,
		"network_out": server.NetworkOut,
		"xray_version":    server.XrayVersion,
		"singbox_version": server.SingBoxVersion,
	})
}
