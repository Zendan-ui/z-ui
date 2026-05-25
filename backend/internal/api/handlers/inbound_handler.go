package handlers

import (
	"encoding/json"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/Zendan-ui/z-ui/internal/core/xray"
	"github.com/Zendan-ui/z-ui/internal/database"
	"github.com/Zendan-ui/z-ui/internal/database/models"
	"github.com/Zendan-ui/z-ui/pkg/crypto"
)

type InboundHandler struct{}

func NewInboundHandler() *InboundHandler { return &InboundHandler{} }

type CreateInboundRequest struct {
	Tag       string `json:"tag"`
	Protocol  string `json:"protocol"`
	Port      int    `json:"port"`
	Listen    string `json:"listen"`
	Transport string `json:"transport"`
	Security  string `json:"security"`
	Remark    string `json:"remark"`
	ServerID  uint   `json:"server_id"`
	// Transport specific
	WSPath           string `json:"ws_path"`
	WSHost           string `json:"ws_host"`
	GRPCServiceName  string `json:"grpc_service_name"`
	// Security specific
	TLSServerName    string `json:"tls_server_name"`
	TLSCertFile      string `json:"tls_cert_file"`
	TLSKeyFile       string `json:"tls_key_file"`
	RealityDest      string `json:"reality_dest"`
	RealityServerName string `json:"reality_server_name"`
	// Shadowsocks
	SSMethod         string `json:"ss_method"`
	// Hysteria2
	Hy2UpMbps        int    `json:"hy2_up_mbps"`
	Hy2DownMbps      int    `json:"hy2_down_mbps"`
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

	valid := map[string]bool{
		"vless": true, "vmess": true, "trojan": true, "shadowsocks": true,
		"hysteria2": true, "tuic": true, "wireguard": true, "socks": true,
	}
	if !valid[req.Protocol] {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid protocol"})
	}

	if req.Listen == "" {
		req.Listen = "0.0.0.0"
	}
	if req.Transport == "" {
		req.Transport = "tcp"
	}
	if req.Security == "" {
		req.Security = "none"
	}

	// Build real protocol settings JSON
	var settingsJSON string
	switch req.Protocol {
	case "vless":
		s := map[string]interface{}{"clients": []interface{}{}, "decryption": "none"}
		b, _ := json.Marshal(s)
		settingsJSON = string(b)
	case "vmess":
		s := map[string]interface{}{"clients": []interface{}{}}
		b, _ := json.Marshal(s)
		settingsJSON = string(b)
	case "trojan":
		s := map[string]interface{}{"clients": []interface{}{}}
		b, _ := json.Marshal(s)
		settingsJSON = string(b)
	case "shadowsocks":
		method := req.SSMethod
		if method == "" {
			method = "2022-blake3-aes-128-gcm"
		}
		serverKey, _ := crypto.GenerateShadowsocks2022Key(16)
		s := map[string]interface{}{"method": method, "password": serverKey, "clients": []interface{}{}, "network": "tcp,udp"}
		b, _ := json.Marshal(s)
		settingsJSON = string(b)
	case "hysteria2":
		s := map[string]interface{}{"clients": []interface{}{}}
		if req.Hy2UpMbps > 0 {
			s["up_mbps"] = req.Hy2UpMbps
		}
		if req.Hy2DownMbps > 0 {
			s["down_mbps"] = req.Hy2DownMbps
		}
		b, _ := json.Marshal(s)
		settingsJSON = string(b)
	case "tuic":
		s := map[string]interface{}{"clients": []interface{}{}, "congestion_control": "bbr"}
		b, _ := json.Marshal(s)
		settingsJSON = string(b)
	default:
		settingsJSON = "{}"
	}

	// Build real stream settings JSON
	opts := xray.StreamOpts{
		WSPath: req.WSPath, WSHost: req.WSHost,
		GRPCServiceName: req.GRPCServiceName,
		TLSServerName: req.TLSServerName,
		TLSCertFile: req.TLSCertFile, TLSKeyFile: req.TLSKeyFile,
	}

	// Auto-generate Reality keys if needed
	if req.Security == "reality" {
		if req.RealityDest == "" {
			req.RealityDest = "www.google.com:443"
		}
		if req.RealityServerName == "" {
			req.RealityServerName = "www.google.com"
		}
		realityCfg, _ := xray.GenerateRealityConfig(req.RealityServerName)
		if realityCfg != nil {
			opts.RealityDest = req.RealityDest
			opts.RealityServerName = req.RealityServerName
			opts.RealityPrivateKey = realityCfg.PrivateKey
			opts.RealityShortID = realityCfg.ShortID
		}
	}

	streamSettings := xray.BuildStreamSettings(req.Transport, req.Security, opts)
	streamJSON, _ := json.Marshal(streamSettings)

	inbound := models.Inbound{
		UUID:           uuid.New().String(),
		Tag:            req.Tag,
		Protocol:       req.Protocol,
		Port:           req.Port,
		Listen:         req.Listen,
		Transport:      req.Transport,
		Security:       req.Security,
		Settings:       settingsJSON,
		StreamSettings: string(streamJSON),
		ServerID:       req.ServerID,
		IsActive:       true,
		Remark:         req.Remark,
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
		return c.Status(404).JSON(fiber.Map{"error": "Not found"})
	}
	inbound.IsActive = !inbound.IsActive
	database.DB.Save(&inbound)
	return c.JSON(fiber.Map{"message": "Toggled", "is_active": inbound.IsActive})
}
