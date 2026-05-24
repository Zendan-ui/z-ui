package xray

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"sync"

	"github.com/Zendan-ui/z-ui/internal/config"
	"github.com/Zendan-ui/z-ui/internal/database/models"
	"github.com/Zendan-ui/z-ui/pkg/logger"
)

type XrayCore struct {
	cfg     *config.XrayConfig
	cmd     *exec.Cmd
	mu      sync.Mutex
	running bool
}

func NewXrayCore(cfg *config.XrayConfig) *XrayCore {
	return &XrayCore{cfg: cfg}
}

func (x *XrayCore) Start() error {
	x.mu.Lock()
	defer x.mu.Unlock()

	if x.running {
		return fmt.Errorf("xray is already running")
	}

	// Ensure config exists
	if err := x.generateConfig(); err != nil {
		return fmt.Errorf("failed to generate config: %w", err)
	}

	x.cmd = exec.Command(x.cfg.BinaryPath, "run", "-config", x.cfg.ConfigPath)
	x.cmd.Stdout = os.Stdout
	x.cmd.Stderr = os.Stderr

	if err := x.cmd.Start(); err != nil {
		return fmt.Errorf("failed to start xray: %w", err)
	}

	x.running = true
	logger.Info("Xray-core started (PID: %d)", x.cmd.Process.Pid)

	go func() {
		if err := x.cmd.Wait(); err != nil {
			logger.Error("Xray-core exited: %v", err)
		}
		x.mu.Lock()
		x.running = false
		x.mu.Unlock()
	}()

	return nil
}

func (x *XrayCore) Stop() error {
	x.mu.Lock()
	defer x.mu.Unlock()

	if !x.running || x.cmd == nil || x.cmd.Process == nil {
		return nil
	}

	if err := x.cmd.Process.Kill(); err != nil {
		return fmt.Errorf("failed to stop xray: %w", err)
	}

	x.running = false
	logger.Info("Xray-core stopped")
	return nil
}

func (x *XrayCore) Restart() error {
	x.Stop()
	return x.Start()
}

func (x *XrayCore) IsRunning() bool {
	x.mu.Lock()
	defer x.mu.Unlock()
	return x.running
}

func (x *XrayCore) generateConfig() error {
	config := x.buildBaseConfig()

	jsonBytes, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return err
	}

	dir := x.cfg.ConfigPath[:len(x.cfg.ConfigPath)-len("/config.json")]
	os.MkdirAll(dir, 0755)

	return os.WriteFile(x.cfg.ConfigPath, jsonBytes, 0644)
}

func (x *XrayCore) buildBaseConfig() map[string]interface{} {
	config := map[string]interface{}{
		"log": map[string]interface{}{
			"loglevel": "warning",
			"access":   x.cfg.LogPath,
			"error":    x.cfg.LogPath,
		},
		"api": map[string]interface{}{
			"tag": "api",
			"services": []string{
				"HandlerService",
				"LoggerService",
				"StatsService",
			},
		},
		"stats":  map[string]interface{}{},
		"policy": map[string]interface{}{
			"levels": map[string]interface{}{
				"0": map[string]interface{}{
					"statsUserUplink":   true,
					"statsUserDownlink": true,
				},
			},
			"system": map[string]interface{}{
				"statsInboundUplink":    true,
				"statsInboundDownlink":  true,
				"statsOutboundUplink":   true,
				"statsOutboundDownlink": true,
			},
		},
		"inbounds": []map[string]interface{}{
			{
				"tag":      "api",
				"listen":   "127.0.0.1",
				"port":     x.cfg.APIPort,
				"protocol": "dokodemo-door",
				"settings": map[string]interface{}{
					"address": "127.0.0.1",
				},
			},
		},
		"outbounds": []map[string]interface{}{
			{
				"tag":      "direct",
				"protocol": "freedom",
			},
			{
				"tag":      "blocked",
				"protocol": "blackhole",
			},
		},
		"routing": map[string]interface{}{
			"rules": []map[string]interface{}{
				{
					"inboundTag":  []string{"api"},
					"outboundTag": "api",
					"type":        "field",
				},
			},
		},
	}

	return config
}

// BuildInboundConfig creates Xray inbound configuration from an Inbound model
func BuildInboundConfig(inbound *models.Inbound, proxies []models.Proxy) map[string]interface{} {
	config := map[string]interface{}{
		"tag":      inbound.Tag,
		"listen":   inbound.Listen,
		"port":     inbound.Port,
		"protocol": inbound.Protocol,
	}

	// Protocol-specific settings
	switch inbound.Protocol {
	case "vless":
		clients := buildVLESSClients(proxies)
		config["settings"] = map[string]interface{}{
			"clients":    clients,
			"decryption": "none",
		}
	case "vmess":
		clients := buildVMessClients(proxies)
		config["settings"] = map[string]interface{}{
			"clients": clients,
		}
	case "trojan":
		clients := buildTrojanClients(proxies)
		config["settings"] = map[string]interface{}{
			"clients": clients,
		}
	case "shadowsocks":
		config["settings"] = buildShadowsocksSettings(proxies)
	}

	// Stream settings
	if inbound.StreamSettings != "" {
		var stream map[string]interface{}
		json.Unmarshal([]byte(inbound.StreamSettings), &stream)
		config["streamSettings"] = stream
	}

	// Sniffing
	if inbound.Sniffing != "" {
		var sniff map[string]interface{}
		json.Unmarshal([]byte(inbound.Sniffing), &sniff)
		config["sniffing"] = sniff
	} else {
		config["sniffing"] = map[string]interface{}{
			"enabled":      true,
			"destOverride": []string{"http", "tls", "quic", "fakedns"},
		}
	}

	return config
}

func buildVLESSClients(proxies []models.Proxy) []map[string]interface{} {
	var clients []map[string]interface{}
	for _, p := range proxies {
		var settings map[string]interface{}
		json.Unmarshal([]byte(p.Settings), &settings)

		client := map[string]interface{}{
			"id":    getStrDefault(settings, "id", p.UUID),
			"email": p.Email,
		}
		if p.FlowType != "" {
			client["flow"] = p.FlowType
		}
		clients = append(clients, client)
	}
	return clients
}

func buildVMessClients(proxies []models.Proxy) []map[string]interface{} {
	var clients []map[string]interface{}
	for _, p := range proxies {
		var settings map[string]interface{}
		json.Unmarshal([]byte(p.Settings), &settings)

		clients = append(clients, map[string]interface{}{
			"id":      getStrDefault(settings, "id", p.UUID),
			"alterId": 0,
			"email":   p.Email,
		})
	}
	return clients
}

func buildTrojanClients(proxies []models.Proxy) []map[string]interface{} {
	var clients []map[string]interface{}
	for _, p := range proxies {
		var settings map[string]interface{}
		json.Unmarshal([]byte(p.Settings), &settings)

		clients = append(clients, map[string]interface{}{
			"password": getStrDefault(settings, "password", p.UUID),
			"email":    p.Email,
		})
	}
	return clients
}

func buildShadowsocksSettings(proxies []models.Proxy) map[string]interface{} {
	if len(proxies) == 0 {
		return map[string]interface{}{}
	}

	var settings map[string]interface{}
	json.Unmarshal([]byte(proxies[0].Settings), &settings)

	return map[string]interface{}{
		"method":   getStrDefault(settings, "method", "2022-blake3-aes-128-gcm"),
		"password": getStrDefault(settings, "password", ""),
		"clients":  func() []map[string]interface{} {
			var clients []map[string]interface{}
			for _, p := range proxies {
				var s map[string]interface{}
				json.Unmarshal([]byte(p.Settings), &s)
				clients = append(clients, map[string]interface{}{
					"password": getStrDefault(s, "password", p.UUID),
					"email":    p.Email,
				})
			}
			return clients
		}(),
	}
}

func getStrDefault(m map[string]interface{}, key, fallback string) string {
	if m == nil {
		return fallback
	}
	if v, ok := m[key]; ok {
		if s, ok := v.(string); ok && s != "" {
			return s
		}
	}
	return fallback
}
