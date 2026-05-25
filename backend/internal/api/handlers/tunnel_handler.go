package handlers

import (
	"encoding/json"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/Zendan-ui/z-ui/internal/database"
	"github.com/Zendan-ui/z-ui/internal/database/models"
	"github.com/Zendan-ui/z-ui/internal/core/xray"
	"github.com/Zendan-ui/z-ui/pkg/crypto"
)

type TunnelHandler struct{}

func NewTunnelHandler() *TunnelHandler { return &TunnelHandler{} }

type CreateTunnelRequest struct {
	Name        string `json:"name"`
	Type        string `json:"type"`         // direct, reverse, relay, warp
	Source      string `json:"source"`
	Destination string `json:"destination"`
	Port        int    `json:"port"`
	DestPort    int    `json:"dest_port"`
	Protocol    string `json:"protocol"`     // tcp, udp, tcp+udp
	Remark      string `json:"remark"`
	// WARP specific
	WarpEndpoint   string `json:"warp_endpoint"`
	WarpMTU        int    `json:"warp_mtu"`
	WarpPrivateKey string `json:"warp_private_key"`
}

func (h *TunnelHandler) List(c *fiber.Ctx) error {
	var tunnels []models.Outbound
	database.DB.Find(&tunnels)
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
		return c.Status(400).JSON(fiber.Map{"error": "Name and type required"})
	}

	var proto string
	var settings string

	switch req.Type {
	case "warp":
		proto = "wireguard"
		// Generate real WARP outbound config
		privKey := req.WarpPrivateKey
		if privKey == "" {
			privKey2, _, _ := crypto.GenerateWireGuardKeyPair()
			privKey = privKey2
		}
		endpoint := req.WarpEndpoint
		if endpoint == "" {
			endpoint = "engage.cloudflareclient.com:2408"
		}
		mtu := req.WarpMTU
		if mtu == 0 {
			mtu = 1420
		}
		warpConfig := xray.BuildWARPOutbound(privKey, "", endpoint, nil, mtu)
		jsonBytes, _ := json.Marshal(warpConfig)
		settings = string(jsonBytes)

	case "direct":
		proto = "freedom"
		// Dokodemo-door tunnel config
		tunnelCfg := map[string]interface{}{
			"type":        "direct",
			"source":      req.Source,
			"destination": req.Destination,
			"port":        req.Port,
			"dest_port":   req.DestPort,
			"protocol":    req.Protocol,
		}
		jsonBytes, _ := json.Marshal(tunnelCfg)
		settings = string(jsonBytes)

	case "reverse":
		proto = "freedom"
		tunnelCfg := map[string]interface{}{
			"type":        "reverse",
			"source":      req.Source,
			"destination": req.Destination,
			"port":        req.Port,
			"dest_port":   req.DestPort,
		}
		jsonBytes, _ := json.Marshal(tunnelCfg)
		settings = string(jsonBytes)

	case "relay":
		proto = "freedom"
		tunnelCfg := map[string]interface{}{
			"type":        "relay",
			"source":      req.Source,
			"destination": req.Destination,
			"port":        req.Port,
			"dest_port":   req.DestPort,
			"protocol":    req.Protocol,
		}
		jsonBytes, _ := json.Marshal(tunnelCfg)
		settings = string(jsonBytes)

	default:
		return c.Status(400).JSON(fiber.Map{"error": "Invalid tunnel type"})
	}

	tunnel := models.Outbound{
		UUID:     uuid.New().String(),
		Tag:      "tunnel-" + req.Name,
		Protocol: proto,
		Settings: settings,
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
		return c.Status(404).JSON(fiber.Map{"error": "Not found"})
	}

	var req CreateTunnelRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request"})
	}

	updates := map[string]interface{}{}
	if req.Name != "" {
		updates["tag"] = "tunnel-" + req.Name
	}
	if req.Remark != "" {
		// Store remark in settings
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
	return c.JSON(fiber.Map{"message": "Toggled", "is_active": tunnel.IsActive})
}
