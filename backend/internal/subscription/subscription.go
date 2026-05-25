package subscription

import (
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/url"
	"strings"
	"time"

	"github.com/Zendan-ui/z-ui/internal/database"
	"github.com/Zendan-ui/z-ui/internal/database/models"
)

type SubscriptionService struct {
	baseURL string
}

func NewSubscriptionService(baseURL string) *SubscriptionService {
	return &SubscriptionService{baseURL: baseURL}
}

// GenerateSubscription generates subscription content for a user
func (s *SubscriptionService) GenerateSubscription(token string, format string, userAgent string) (string, string, error) {
	// Find user by token
	var user models.User
	result := database.DB.Where("sub_token = ?", token).
		Preload("Proxies").
		Preload("Proxies.Inbound").
		Preload("Proxies.Inbound.Server").
		First(&user)

	if result.Error != nil {
		return "", "", fmt.Errorf("user not found")
	}

	// Check user status
	if user.Status != "active" {
		return "", "", fmt.Errorf("user is not active")
	}

	// Check expiration
	if user.ExpiresAt != nil && user.ExpiresAt.Before(time.Now()) {
		return "", "", fmt.Errorf("subscription expired")
	}

	// Check traffic limit
	if user.TrafficLimit > 0 && user.TrafficUsed >= user.TrafficLimit {
		return "", "", fmt.Errorf("traffic limit exceeded")
	}

	// Auto-detect format from user agent
	if format == "" || format == "auto" {
		format = detectFormat(userAgent)
	}

	// Log subscription access
	go s.logAccess(token, userAgent, format)

	// Generate configs based on format
	var content string
	var contentType string
	var err error

	switch format {
	case "clash":
		content, err = s.generateClash(&user)
		contentType = "application/yaml"
	case "singbox":
		content, err = s.generateSingbox(&user)
		contentType = "application/json"
	case "v2ray", "xray":
		content, err = s.generateV2Ray(&user)
		contentType = "text/plain"
	case "json":
		content, err = s.generateJSON(&user)
		contentType = "application/json"
	default:
		content, err = s.generateV2Ray(&user)
		contentType = "text/plain"
	}

	return content, contentType, err
}

func (s *SubscriptionService) GenerateByShortLink(shortLink string, format string, ua string) (string, string, error) {
	var user models.User
	if err := database.DB.Where("sub_short_link = ?", shortLink).First(&user).Error; err != nil {
		return "", "", fmt.Errorf("not found")
	}
	return s.GenerateSubscription(user.SubToken, format, ua)
}

func detectFormat(userAgent string) string {
	ua := strings.ToLower(userAgent)
	switch {
	case strings.Contains(ua, "clash"):
		return "clash"
	case strings.Contains(ua, "sing-box"), strings.Contains(ua, "singbox"):
		return "singbox"
	case strings.Contains(ua, "hiddify"):
		return "singbox"
	case strings.Contains(ua, "nekobox"), strings.Contains(ua, "nekoray"):
		return "singbox"
	case strings.Contains(ua, "streisand"):
		return "v2ray"
	case strings.Contains(ua, "shadowrocket"):
		return "v2ray"
	case strings.Contains(ua, "v2rayng"), strings.Contains(ua, "v2rayn"):
		return "v2ray"
	case strings.Contains(ua, "v2box"):
		return "v2ray"
	case strings.Contains(ua, "kitsunebi"):
		return "v2ray"
	default:
		return "v2ray"
	}
}

// ==================== V2Ray/Xray Format ====================

func (s *SubscriptionService) generateV2Ray(user *models.User) (string, error) {
	var links []string

	for _, proxy := range user.Proxies {
		if !proxy.IsActive || proxy.Inbound == nil || !proxy.Inbound.IsActive {
			continue
		}

		link := s.proxyToV2RayLink(&proxy)
		if link != "" {
			links = append(links, link)
		}
	}

	combined := strings.Join(links, "\n")
	encoded := base64.StdEncoding.EncodeToString([]byte(combined))
	return encoded, nil
}

func (s *SubscriptionService) proxyToV2RayLink(proxy *models.Proxy) string {
	inbound := proxy.Inbound
	if inbound == nil || inbound.Server == nil {
		return ""
	}

	host := inbound.Server.Host
	port := inbound.Port

	var settings map[string]interface{}
	json.Unmarshal([]byte(proxy.Settings), &settings)

	var streamSettings map[string]interface{}
	json.Unmarshal([]byte(inbound.StreamSettings), &streamSettings)

	switch proxy.Protocol {
	case "vless":
		return s.buildVLESSLink(proxy, host, port, settings, streamSettings)
	case "vmess":
		return s.buildVMessLink(proxy, host, port, settings, streamSettings)
	case "trojan":
		return s.buildTrojanLink(proxy, host, port, settings, streamSettings)
	case "shadowsocks":
		return s.buildSSLink(proxy, host, port, settings)
	case "hysteria2":
		return s.buildHysteria2Link(proxy, host, port, settings)
	case "tuic":
		return s.buildTUICLink(proxy, host, port, settings)
	case "wireguard":
		return s.buildWireGuardLink(proxy, host, port, settings)
	}
	return ""
}

func (s *SubscriptionService) buildVLESSLink(proxy *models.Proxy, host string, port int, settings, stream map[string]interface{}) string {
	userID := getStr(settings, "id")
	if userID == "" {
		userID = proxy.UUID
	}

	params := url.Values{}
	params.Set("type", getStr(stream, "network"))
	params.Set("security", getStr(stream, "security"))

	if flow := proxy.FlowType; flow != "" {
		params.Set("flow", flow)
	}

	// Transport-specific params
	network := getStr(stream, "network")
	switch network {
	case "ws":
		wsSettings := getMap(stream, "wsSettings")
		params.Set("path", getStr(wsSettings, "path"))
		headers := getMap(wsSettings, "headers")
		if h := getStr(headers, "Host"); h != "" {
			params.Set("host", h)
		}
	case "grpc":
		grpcSettings := getMap(stream, "grpcSettings")
		params.Set("serviceName", getStr(grpcSettings, "serviceName"))
		params.Set("mode", getStr(grpcSettings, "mode"))
	case "tcp":
		// HTTP headers if any
	case "xhttp":
		xhttpSettings := getMap(stream, "xhttpSettings")
		params.Set("path", getStr(xhttpSettings, "path"))
	case "splithttp":
		splitSettings := getMap(stream, "splithttpSettings")
		params.Set("path", getStr(splitSettings, "path"))
	case "httpupgrade":
		huSettings := getMap(stream, "httpupgradeSettings")
		params.Set("path", getStr(huSettings, "path"))
	}

	// TLS/Reality params
	security := getStr(stream, "security")
	switch security {
	case "tls":
		tlsSettings := getMap(stream, "tlsSettings")
		params.Set("sni", getStr(tlsSettings, "serverName"))
		params.Set("fp", getStr(tlsSettings, "fingerprint"))
		params.Set("alpn", getStr(tlsSettings, "alpn"))
	case "reality":
		realitySettings := getMap(stream, "realitySettings")
		params.Set("sni", getStr(realitySettings, "serverName"))
		params.Set("fp", getStr(realitySettings, "fingerprint"))
		params.Set("pbk", getStr(realitySettings, "publicKey"))
		params.Set("sid", getStr(realitySettings, "shortId"))
		params.Set("spx", getStr(realitySettings, "spiderX"))
	}

	remark := proxy.Email
	if remark == "" {
		remark = fmt.Sprintf("Z-UI_%s_%d", proxy.Protocol, proxy.ID)
	}

	return fmt.Sprintf("vless://%s@%s:%d?%s#%s",
		userID, host, port, params.Encode(), url.QueryEscape(remark))
}

func (s *SubscriptionService) buildVMessLink(proxy *models.Proxy, host string, port int, settings, stream map[string]interface{}) string {
	vmessConfig := map[string]interface{}{
		"v":    "2",
		"ps":   proxy.Email,
		"add":  host,
		"port": port,
		"id":   getStr(settings, "id"),
		"aid":  0,
		"scy":  getStr(settings, "security"),
		"net":  getStr(stream, "network"),
		"type": "none",
		"tls":  getStr(stream, "security"),
	}

	network := getStr(stream, "network")
	switch network {
	case "ws":
		ws := getMap(stream, "wsSettings")
		vmessConfig["path"] = getStr(ws, "path")
		headers := getMap(ws, "headers")
		vmessConfig["host"] = getStr(headers, "Host")
	case "grpc":
		grpc := getMap(stream, "grpcSettings")
		vmessConfig["path"] = getStr(grpc, "serviceName")
	}

	jsonBytes, _ := json.Marshal(vmessConfig)
	encoded := base64.StdEncoding.EncodeToString(jsonBytes)
	return "vmess://" + encoded
}

func (s *SubscriptionService) buildTrojanLink(proxy *models.Proxy, host string, port int, settings, stream map[string]interface{}) string {
	password := getStr(settings, "password")
	params := url.Values{}
	params.Set("type", getStr(stream, "network"))
	params.Set("security", getStr(stream, "security"))

	network := getStr(stream, "network")
	if network == "ws" {
		ws := getMap(stream, "wsSettings")
		params.Set("path", getStr(ws, "path"))
	}

	if getStr(stream, "security") == "tls" {
		tls := getMap(stream, "tlsSettings")
		params.Set("sni", getStr(tls, "serverName"))
	}

	remark := proxy.Email
	return fmt.Sprintf("trojan://%s@%s:%d?%s#%s",
		password, host, port, params.Encode(), url.QueryEscape(remark))
}

func (s *SubscriptionService) buildSSLink(proxy *models.Proxy, host string, port int, settings map[string]interface{}) string {
	method := getStr(settings, "method")
	password := getStr(settings, "password")
	userInfo := base64.URLEncoding.EncodeToString([]byte(method + ":" + password))
	remark := proxy.Email
	return fmt.Sprintf("ss://%s@%s:%d#%s", userInfo, host, port, url.QueryEscape(remark))
}

func (s *SubscriptionService) buildHysteria2Link(proxy *models.Proxy, host string, port int, settings map[string]interface{}) string {
	password := getStr(settings, "password")
	params := url.Values{}
	if sni := getStr(settings, "sni"); sni != "" {
		params.Set("sni", sni)
	}
	if insecure := getStr(settings, "insecure"); insecure == "true" {
		params.Set("insecure", "1")
	}
	remark := proxy.Email
	return fmt.Sprintf("hysteria2://%s@%s:%d?%s#%s",
		password, host, port, params.Encode(), url.QueryEscape(remark))
}

func (s *SubscriptionService) buildTUICLink(proxy *models.Proxy, host string, port int, settings map[string]interface{}) string {
	uuid := getStr(settings, "uuid")
	password := getStr(settings, "password")
	params := url.Values{}
	params.Set("congestion_control", getStr(settings, "congestion_control"))
	if sni := getStr(settings, "sni"); sni != "" {
		params.Set("sni", sni)
	}
	remark := proxy.Email
	return fmt.Sprintf("tuic://%s:%s@%s:%d?%s#%s",
		uuid, password, host, port, params.Encode(), url.QueryEscape(remark))
}

func (s *SubscriptionService) buildWireGuardLink(proxy *models.Proxy, host string, port int, settings map[string]interface{}) string {
	privateKey := getStr(settings, "private_key")
	publicKey := getStr(settings, "peer_public_key")
	params := url.Values{}
	params.Set("publickey", publicKey)
	if address := getStr(settings, "address"); address != "" {
		params.Set("address", address)
	}
	remark := proxy.Email
	return fmt.Sprintf("wireguard://%s@%s:%d?%s#%s",
		url.QueryEscape(privateKey), host, port, params.Encode(), url.QueryEscape(remark))
}

// ==================== Clash Meta Format ====================

func (s *SubscriptionService) generateClash(user *models.User) (string, error) {
	var proxies []map[string]interface{}
	var proxyNames []string

	for _, proxy := range user.Proxies {
		if !proxy.IsActive || proxy.Inbound == nil || !proxy.Inbound.IsActive {
			continue
		}

		clashProxy := s.proxyToClash(&proxy)
		if clashProxy != nil {
			proxies = append(proxies, clashProxy)
			proxyNames = append(proxyNames, clashProxy["name"].(string))
		}
	}

	config := map[string]interface{}{
		"port":                 7890,
		"socks-port":           7891,
		"mixed-port":           7893,
		"allow-lan":            true,
		"mode":                 "rule",
		"log-level":            "info",
		"external-controller":  "127.0.0.1:9090",
		"dns": map[string]interface{}{
			"enable":            true,
			"enhanced-mode":     "fake-ip",
			"fake-ip-range":     "198.18.0.1/16",
			"nameserver":        []string{"https://dns.google/dns-query", "https://1.1.1.1/dns-query"},
		},
		"proxies": proxies,
		"proxy-groups": []map[string]interface{}{
			{
				"name":    "🚀 Select",
				"type":    "select",
				"proxies": append([]string{"♻️ Auto", "DIRECT"}, proxyNames...),
			},
			{
				"name":     "♻️ Auto",
				"type":     "url-test",
				"proxies":  proxyNames,
				"url":      "http://www.gstatic.com/generate_204",
				"interval": 300,
			},
		},
		"rules": []string{
			"GEOIP,IR,DIRECT",
			"GEOSITE,ir,DIRECT",
			"MATCH,🚀 Select",
		},
	}

	// Marshal to YAML-like format (simplified JSON for this implementation)
	yamlBytes, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return "", err
	}

	return string(yamlBytes), nil
}

func (s *SubscriptionService) proxyToClash(proxy *models.Proxy) map[string]interface{} {
	inbound := proxy.Inbound
	if inbound == nil || inbound.Server == nil {
		return nil
	}

	var settings map[string]interface{}
	json.Unmarshal([]byte(proxy.Settings), &settings)
	var stream map[string]interface{}
	json.Unmarshal([]byte(inbound.StreamSettings), &stream)

	name := proxy.Email
	if name == "" {
		name = fmt.Sprintf("Z-UI_%d", proxy.ID)
	}

	base := map[string]interface{}{
		"name":   name,
		"server": inbound.Server.Host,
		"port":   inbound.Port,
	}

	switch proxy.Protocol {
	case "vless":
		base["type"] = "vless"
		base["uuid"] = getStr(settings, "id")
		base["flow"] = proxy.FlowType
		s.addClashTransport(base, stream)
	case "vmess":
		base["type"] = "vmess"
		base["uuid"] = getStr(settings, "id")
		base["alterId"] = 0
		base["cipher"] = "auto"
		s.addClashTransport(base, stream)
	case "trojan":
		base["type"] = "trojan"
		base["password"] = getStr(settings, "password")
		s.addClashTransport(base, stream)
	case "shadowsocks":
		base["type"] = "ss"
		base["cipher"] = getStr(settings, "method")
		base["password"] = getStr(settings, "password")
	case "hysteria2":
		base["type"] = "hysteria2"
		base["password"] = getStr(settings, "password")
		base["sni"] = getStr(settings, "sni")
	case "tuic":
		base["type"] = "tuic"
		base["uuid"] = getStr(settings, "uuid")
		base["password"] = getStr(settings, "password")
		base["congestion-controller"] = getStr(settings, "congestion_control")
	case "wireguard":
		base["type"] = "wireguard"
		base["private-key"] = getStr(settings, "private_key")
		base["public-key"] = getStr(settings, "peer_public_key")
		base["ip"] = getStr(settings, "address")
	default:
		return nil
	}

	return base
}

func (s *SubscriptionService) addClashTransport(base map[string]interface{}, stream map[string]interface{}) {
	network := getStr(stream, "network")
	security := getStr(stream, "security")

	if security == "tls" {
		base["tls"] = true
		tls := getMap(stream, "tlsSettings")
		base["servername"] = getStr(tls, "serverName")
		base["skip-cert-verify"] = false
	} else if security == "reality" {
		base["tls"] = true
		reality := getMap(stream, "realitySettings")
		base["servername"] = getStr(reality, "serverName")
		base["reality-opts"] = map[string]interface{}{
			"public-key": getStr(reality, "publicKey"),
			"short-id":   getStr(reality, "shortId"),
		}
		base["client-fingerprint"] = getStr(reality, "fingerprint")
	}

	switch network {
	case "ws":
		base["network"] = "ws"
		ws := getMap(stream, "wsSettings")
		base["ws-opts"] = map[string]interface{}{
			"path": getStr(ws, "path"),
			"headers": getMap(ws, "headers"),
		}
	case "grpc":
		base["network"] = "grpc"
		grpc := getMap(stream, "grpcSettings")
		base["grpc-opts"] = map[string]interface{}{
			"grpc-service-name": getStr(grpc, "serviceName"),
		}
	case "tcp":
		base["network"] = "tcp"
	}
}

// ==================== Sing-box Format ====================

func (s *SubscriptionService) generateSingbox(user *models.User) (string, error) {
	var outbounds []map[string]interface{}

	for _, proxy := range user.Proxies {
		if !proxy.IsActive || proxy.Inbound == nil || !proxy.Inbound.IsActive {
			continue
		}

		sbProxy := s.proxyToSingbox(&proxy)
		if sbProxy != nil {
			outbounds = append(outbounds, sbProxy)
		}
	}

	// Get proxy tags for selector
	var tags []string
	for _, ob := range outbounds {
		tags = append(tags, ob["tag"].(string))
	}

	config := map[string]interface{}{
		"log": map[string]interface{}{
			"level": "info",
		},
		"dns": map[string]interface{}{
			"servers": []map[string]interface{}{
				{"tag": "google", "address": "https://dns.google/dns-query", "detour": "select"},
				{"tag": "local", "address": "local", "detour": "direct"},
			},
			"rules": []map[string]interface{}{
				{"geosite": []string{"ir"}, "server": "local"},
			},
		},
		"outbounds": append([]map[string]interface{}{
			{
				"type":       "selector",
				"tag":        "select",
				"outbounds":  append([]string{"auto"}, tags...),
				"default":    "auto",
			},
			{
				"type":      "urltest",
				"tag":       "auto",
				"outbounds": tags,
				"url":       "http://www.gstatic.com/generate_204",
				"interval":  "3m",
			},
			{"type": "direct", "tag": "direct"},
			{"type": "block", "tag": "block"},
			{"type": "dns", "tag": "dns-out"},
		}, outbounds...),
		"route": map[string]interface{}{
			"rules": []map[string]interface{}{
				{"protocol": "dns", "outbound": "dns-out"},
				{"geoip": []string{"ir"}, "outbound": "direct"},
				{"geosite": []string{"ir"}, "outbound": "direct"},
			},
			"final": "select",
		},
	}

	jsonBytes, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return "", err
	}

	return string(jsonBytes), nil
}

func (s *SubscriptionService) proxyToSingbox(proxy *models.Proxy) map[string]interface{} {
	inbound := proxy.Inbound
	if inbound == nil || inbound.Server == nil {
		return nil
	}

	var settings map[string]interface{}
	json.Unmarshal([]byte(proxy.Settings), &settings)
	var stream map[string]interface{}
	json.Unmarshal([]byte(inbound.StreamSettings), &stream)

	tag := proxy.Email
	if tag == "" {
		tag = fmt.Sprintf("proxy_%d", proxy.ID)
	}

	base := map[string]interface{}{
		"tag":    tag,
		"server": inbound.Server.Host,
		"server_port": inbound.Port,
	}

	switch proxy.Protocol {
	case "vless":
		base["type"] = "vless"
		base["uuid"] = getStr(settings, "id")
		if flow := proxy.FlowType; flow != "" {
			base["flow"] = flow
		}
	case "vmess":
		base["type"] = "vmess"
		base["uuid"] = getStr(settings, "id")
		base["security"] = "auto"
	case "trojan":
		base["type"] = "trojan"
		base["password"] = getStr(settings, "password")
	case "shadowsocks":
		base["type"] = "shadowsocks"
		base["method"] = getStr(settings, "method")
		base["password"] = getStr(settings, "password")
	case "hysteria2":
		base["type"] = "hysteria2"
		base["password"] = getStr(settings, "password")
		if sni := getStr(settings, "sni"); sni != "" {
			base["tls"] = map[string]interface{}{"server_name": sni, "enabled": true}
		}
	case "tuic":
		base["type"] = "tuic"
		base["uuid"] = getStr(settings, "uuid")
		base["password"] = getStr(settings, "password")
		base["congestion_control"] = getStr(settings, "congestion_control")
	case "wireguard":
		base["type"] = "wireguard"
		base["private_key"] = getStr(settings, "private_key")
		base["peer_public_key"] = getStr(settings, "peer_public_key")
		base["local_address"] = []string{getStr(settings, "address")}
	default:
		return nil
	}

	// Add TLS
	security := getStr(stream, "security")
	if security == "tls" {
		tls := getMap(stream, "tlsSettings")
		base["tls"] = map[string]interface{}{
			"enabled":     true,
			"server_name": getStr(tls, "serverName"),
		}
	} else if security == "reality" {
		reality := getMap(stream, "realitySettings")
		base["tls"] = map[string]interface{}{
			"enabled":     true,
			"server_name": getStr(reality, "serverName"),
			"reality": map[string]interface{}{
				"enabled":    true,
				"public_key": getStr(reality, "publicKey"),
				"short_id":   getStr(reality, "shortId"),
			},
			"utls": map[string]interface{}{
				"enabled":     true,
				"fingerprint": getStr(reality, "fingerprint"),
			},
		}
	}

	// Add transport
	network := getStr(stream, "network")
	switch network {
	case "ws":
		ws := getMap(stream, "wsSettings")
		base["transport"] = map[string]interface{}{
			"type": "ws",
			"path": getStr(ws, "path"),
			"headers": getMap(ws, "headers"),
		}
	case "grpc":
		grpc := getMap(stream, "grpcSettings")
		base["transport"] = map[string]interface{}{
			"type":         "grpc",
			"service_name": getStr(grpc, "serviceName"),
		}
	case "httpupgrade":
		hu := getMap(stream, "httpupgradeSettings")
		base["transport"] = map[string]interface{}{
			"type": "httpupgrade",
			"path": getStr(hu, "path"),
		}
	}

	return base
}

// ==================== JSON Export ====================

func (s *SubscriptionService) generateJSON(user *models.User) (string, error) {
	var configs []map[string]interface{}

	for _, proxy := range user.Proxies {
		if !proxy.IsActive || proxy.Inbound == nil || !proxy.Inbound.IsActive {
			continue
		}

		var settings map[string]interface{}
		json.Unmarshal([]byte(proxy.Settings), &settings)

		config := map[string]interface{}{
			"id":       proxy.UUID,
			"protocol": proxy.Protocol,
			"email":    proxy.Email,
			"settings": settings,
			"server":   proxy.Inbound.Server.Host,
			"port":     proxy.Inbound.Port,
		}

		if proxy.Inbound.StreamSettings != "" {
			var stream map[string]interface{}
			json.Unmarshal([]byte(proxy.Inbound.StreamSettings), &stream)
			config["stream"] = stream
		}

		configs = append(configs, config)
	}

	result := map[string]interface{}{
		"username":      user.Username,
		"status":        user.Status,
		"traffic_used":  user.TrafficUsed,
		"traffic_limit": user.TrafficLimit,
		"expires_at":    user.ExpiresAt,
		"configs":       configs,
		"updated_at":    time.Now(),
	}

	jsonBytes, err := json.MarshalIndent(result, "", "  ")
	return string(jsonBytes), err
}

func (s *SubscriptionService) logAccess(token, userAgent, format string) {
	var user models.User
	database.DB.Where("sub_token = ?", token).First(&user)

	log := models.SubLog{
		UserID:    user.ID,
		UserAgent: userAgent,
		Format:    format,
		CreatedAt: time.Now(),
	}
	database.DB.Create(&log)
}

// Helper functions
func getStr(m map[string]interface{}, key string) string {
	if m == nil {
		return ""
	}
	if v, ok := m[key]; ok {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

func getMap(m map[string]interface{}, key string) map[string]interface{} {
	if m == nil {
		return nil
	}
	if v, ok := m[key]; ok {
		if m2, ok := v.(map[string]interface{}); ok {
			return m2
		}
	}
	return nil
}
