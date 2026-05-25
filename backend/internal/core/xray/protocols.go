package xray

import (
	"encoding/json"
	"fmt"

	"github.com/Zendan-ui/z-ui/pkg/crypto"
)

// ========== Protocol Constants ==========

const (
	ProtoVLESS       = "vless"
	ProtoVMess       = "vmess"
	ProtoTrojan      = "trojan"
	ProtoShadowsocks = "shadowsocks"
	ProtoHysteria    = "hysteria"
	ProtoHysteria2   = "hysteria2"
	ProtoTUIC        = "tuic"
	ProtoWireGuard   = "wireguard"
	ProtoSOCKS       = "socks"
	ProtoHTTP        = "http"
	ProtoSSH         = "ssh"
	ProtoTunnel      = "tunnel"
	ProtoMixed       = "mixed"
	ProtoTUN         = "tun"
)

const (
	TransTCP         = "tcp"
	TransWS          = "ws"
	TransGRPC        = "grpc"
	TransQUIC        = "quic"
	TransKCP         = "kcp"
	TransXHTTP       = "xhttp"
	TransHTTPUpgrade = "httpupgrade"
	TransSplitHTTP   = "splithttp"
)

const (
	SecNone    = "none"
	SecTLS     = "tls"
	SecReality = "reality"
)

func ValidProtocols() []string {
	return []string{
		ProtoVLESS, ProtoVMess, ProtoTrojan, ProtoShadowsocks,
		ProtoHysteria, ProtoHysteria2, ProtoTUIC, ProtoWireGuard,
		ProtoSOCKS, ProtoHTTP, ProtoTunnel, ProtoMixed, ProtoTUN,
	}
}

// ========== Client Config ==========

type ClientConfig struct {
	ID         string `json:"id"`
	Email      string `json:"email"`
	Password   string `json:"password,omitempty"`
	Flow       string `json:"flow,omitempty"`
	LimitIP    int    `json:"limit_ip,omitempty"`
	TotalGB    int64  `json:"total_gb,omitempty"`
	ExpiryTime int64  `json:"expiry_time,omitempty"`
	Enable     bool   `json:"enable"`
	TgID       int64  `json:"tg_id,omitempty"`
	SubID      string `json:"sub_id,omitempty"`
	Comment    string `json:"comment,omitempty"`
	Reset      int    `json:"reset,omitempty"`
}

// NewDefaultClient creates a new client with generated UUID.
func NewDefaultClient(email string) ClientConfig {
	return ClientConfig{
		ID:     crypto.GenerateUUID(),
		Email:  email,
		Enable: true,
	}
}

// ========== Config Generators ==========

// GenerateFullInboundConfig creates a complete Xray inbound config given protocol, transport, security, and clients.
// This is the main function that brings everything together.
func GenerateFullInboundConfig(tag string, port int, protocol, transport, security string,
	clients []ClientConfig, streamOpts StreamOpts, protoOpts map[string]interface{}) map[string]interface{} {

	config := map[string]interface{}{
		"tag":      tag,
		"listen":   "0.0.0.0",
		"port":     port,
		"protocol": protocol,
	}

	// Protocol-specific settings
	switch protocol {
	case ProtoVLESS:
		config["settings"] = BuildVLESSInbound(clients)
	case ProtoVMess:
		config["settings"] = BuildVMessInbound(clients)
	case ProtoTrojan:
		config["settings"] = BuildTrojanInbound(clients)
	case ProtoShadowsocks:
		method, _ := protoOpts["method"].(string)
		if method == "" {
			method = "2022-blake3-aes-128-gcm"
		}
		serverKey, _ := protoOpts["server_key"].(string)
		if serverKey == "" {
			serverKey, _ = crypto.GenerateShadowsocks2022Key(16)
		}
		config["settings"] = BuildShadowsocksInbound(method, serverKey, clients)
	case ProtoHysteria2:
		upMbps, _ := protoOpts["up_mbps"].(int)
		downMbps, _ := protoOpts["down_mbps"].(int)
		obfsType, _ := protoOpts["obfs_type"].(string)
		obfsPass, _ := protoOpts["obfs_password"].(string)
		config["settings"] = BuildHysteria2Inbound(clients, upMbps, downMbps, obfsType, obfsPass)
	case ProtoTUIC:
		cc, _ := protoOpts["congestion_control"].(string)
		if cc == "" {
			cc = "bbr"
		}
		config["settings"] = BuildTUICInbound(clients, cc)
	case ProtoWireGuard:
		privKey, pubKey, peers, mtu := generateWireGuardConfig(clients, protoOpts)
		config["settings"] = BuildWireGuardInbound(privKey, peers, mtu)
		// Store public key in protoOpts for client distribution
		protoOpts["server_public_key"] = pubKey
	case ProtoTunnel:
		destAddr, _ := protoOpts["dest_address"].(string)
		destPort, _ := protoOpts["dest_port"].(int)
		network, _ := protoOpts["network"].(string)
		if network == "" {
			network = "tcp,udp"
		}
		config["settings"] = BuildTunnelInbound(destAddr, destPort, network)
		config["protocol"] = "dokodemo-door"
	case ProtoSOCKS:
		config["settings"] = BuildSOCKSInbound(true, nil)
	case ProtoHTTP:
		config["settings"] = map[string]interface{}{
			"accounts":        []map[string]interface{}{},
			"allowTransparent": false,
		}
	case ProtoMixed:
		config["settings"] = map[string]interface{}{}
		config["protocol"] = "socks"
	}

	// Stream settings
	if protocol != ProtoTunnel && protocol != ProtoSOCKS && protocol != ProtoHTTP && protocol != ProtoMixed {
		config["streamSettings"] = BuildStreamSettings(transport, security, streamOpts)
	}

	// Sniffing
	config["sniffing"] = map[string]interface{}{
		"enabled":      true,
		"destOverride": []string{"http", "tls", "quic", "fakedns"},
		"routeOnly":    false,
	}

	return config
}

// ========== Per-Protocol Builders ==========

func BuildVLESSInbound(clients []ClientConfig) map[string]interface{} {
	cs := make([]map[string]interface{}, 0, len(clients))
	for _, c := range clients {
		cl := map[string]interface{}{
			"id":    c.ID,
			"email": c.Email,
		}
		if c.Flow != "" {
			cl["flow"] = c.Flow
		}
		cs = append(cs, cl)
	}
	return map[string]interface{}{
		"clients":    cs,
		"decryption": "none",
	}
}

func BuildVMessInbound(clients []ClientConfig) map[string]interface{} {
	cs := make([]map[string]interface{}, 0, len(clients))
	for _, c := range clients {
		cs = append(cs, map[string]interface{}{
			"id":      c.ID,
			"alterId": 0,
			"email":   c.Email,
		})
	}
	return map[string]interface{}{"clients": cs}
}

func BuildTrojanInbound(clients []ClientConfig) map[string]interface{} {
	cs := make([]map[string]interface{}, 0, len(clients))
	for _, c := range clients {
		pass := c.Password
		if pass == "" {
			pass = c.ID // fallback to UUID as password
		}
		cs = append(cs, map[string]interface{}{
			"password": pass,
			"email":    c.Email,
		})
	}
	return map[string]interface{}{"clients": cs}
}

func BuildShadowsocksInbound(method, serverKey string, clients []ClientConfig) map[string]interface{} {
	cs := make([]map[string]interface{}, 0, len(clients))
	for _, c := range clients {
		pass := c.Password
		if pass == "" {
			keySize := 16
			if method == "2022-blake3-aes-256-gcm" || method == "2022-blake3-chacha20-poly1305" {
				keySize = 32
			}
			pass, _ = crypto.GenerateShadowsocks2022Key(keySize)
		}
		cs = append(cs, map[string]interface{}{
			"password": pass,
			"email":    c.Email,
		})
	}
	return map[string]interface{}{
		"method":   method,
		"password": serverKey,
		"clients":  cs,
		"network":  "tcp,udp",
	}
}

func BuildHysteria2Inbound(clients []ClientConfig, upMbps, downMbps int, obfsType, obfsPassword string) map[string]interface{} {
	cs := make([]map[string]interface{}, 0, len(clients))
	for _, c := range clients {
		pass := c.Password
		if pass == "" {
			pass = crypto.GenerateToken(16)
		}
		cs = append(cs, map[string]interface{}{
			"password": pass,
			"email":    c.Email,
		})
	}
	settings := map[string]interface{}{
		"clients": cs,
	}
	if upMbps > 0 {
		settings["up_mbps"] = upMbps
	}
	if downMbps > 0 {
		settings["down_mbps"] = downMbps
	}
	if obfsType != "" {
		settings["obfs"] = map[string]interface{}{
			"type":     obfsType,
			"password": obfsPassword,
		}
	}
	return settings
}

func BuildTUICInbound(clients []ClientConfig, congestionControl string) map[string]interface{} {
	cs := make([]map[string]interface{}, 0, len(clients))
	for _, c := range clients {
		id := c.ID
		if id == "" {
			id = crypto.GenerateUUID()
		}
		pass := c.Password
		if pass == "" {
			pass = crypto.GenerateToken(16)
		}
		cs = append(cs, map[string]interface{}{
			"uuid":     id,
			"password": pass,
			"email":    c.Email,
		})
	}
	return map[string]interface{}{
		"clients":            cs,
		"congestion_control": congestionControl,
	}
}

func BuildWireGuardInbound(privateKey string, peers []WireGuardPeer, mtu int) map[string]interface{} {
	if mtu == 0 {
		mtu = 1420
	}
	ps := make([]map[string]interface{}, 0, len(peers))
	for _, p := range peers {
		pm := map[string]interface{}{
			"publicKey":  p.PublicKey,
			"allowedIPs": p.AllowedIPs,
		}
		if p.PreSharedKey != "" {
			pm["preSharedKey"] = p.PreSharedKey
		}
		if p.Endpoint != "" {
			pm["endpoint"] = p.Endpoint
		}
		if p.KeepAlive > 0 {
			pm["keepAlive"] = p.KeepAlive
		}
		ps = append(ps, pm)
	}
	return map[string]interface{}{
		"secretKey":  privateKey,
		"peers":      ps,
		"mtu":        mtu,
		"kernelMode": false,
	}
}

func BuildTunnelInbound(destAddr string, destPort int, network string) map[string]interface{} {
	return map[string]interface{}{
		"address": destAddr,
		"port":    destPort,
		"network": network,
	}
}

func BuildSOCKSInbound(auth bool, accounts []map[string]string) map[string]interface{} {
	authType := "noauth"
	if auth {
		authType = "password"
	}
	s := map[string]interface{}{
		"auth": authType,
		"udp":  true,
		"ip":   "0.0.0.0",
	}
	if auth && len(accounts) > 0 {
		s["accounts"] = accounts
	}
	return s
}

// ========== Outbound Builders ==========

func BuildWARPOutbound(secretKey, publicKey, endpoint string, addresses []string, mtu int) map[string]interface{} {
	if secretKey == "" || publicKey == "" {
		secretKey2, publicKey2, _ := crypto.GenerateWireGuardKeyPair()
		if secretKey == "" {
			secretKey = secretKey2
		}
		if publicKey == "" {
			publicKey = publicKey2
		}
	}
	if endpoint == "" {
		endpoint = "engage.cloudflareclient.com:2408"
	}
	if mtu == 0 {
		mtu = 1420
	}
	if len(addresses) == 0 {
		addresses = []string{"172.16.0.2/32", "2606:4700:110:8a36:df92:f5:eb88:391/128"}
	}
	return map[string]interface{}{
		"protocol": "wireguard",
		"settings": map[string]interface{}{
			"secretKey":      secretKey,
			"address":        addresses,
			"mtu":            mtu,
			"workers":        2,
			"domainStrategy": "ForceIPv6v4",
			"peers": []map[string]interface{}{
				{
					"publicKey":  "bmXOC+F1FxEMF9dyiK2H5/1SUtzH0JuVo51h2wPfgyo=",
					"allowedIPs": []string{"0.0.0.0/0", "::/0"},
					"endpoint":   endpoint,
					"keepAlive":  0,
				},
			},
			"kernelMode": false,
		},
		"tag": "warp",
	}
}

func BuildDirectOutbound(tag string) map[string]interface{} {
	return map[string]interface{}{"protocol": "freedom", "settings": map[string]interface{}{}, "tag": tag}
}

func BuildBlackholeOutbound(tag string) map[string]interface{} {
	return map[string]interface{}{
		"protocol": "blackhole",
		"settings": map[string]interface{}{"response": map[string]interface{}{"type": "http"}},
		"tag":      tag,
	}
}

// ========== Stream Settings ==========

type StreamOpts struct {
	WSPath, WSHost                                    string
	GRPCServiceName                                   string
	GRPCMultiMode                                     bool
	GRPCAuthority                                     string
	KCPMtu, KCPTti, KCPUpCap, KCPDownCap             int
	KCPHeaderType, KCPSeed                            string
	XHTTPPath, XHTTPHost, XHTTPMode                   string
	HTTPUpgradePath, HTTPUpgradeHost                  string
	SplitHTTPPath, SplitHTTPHost                      string
	TCPHeaderType, TCPPath, TCPHost                   string
	TLSServerName, TLSFingerprint, TLSALPN            string
	TLSCertFile, TLSKeyFile                           string
	TLSMinVersion, TLSMaxVersion                      string
	RealityDest, RealityServerName                    string
	RealityPrivateKey, RealityPublicKey                string
	RealityShortID, RealityFingerprint, RealitySpiderX string
}

func BuildStreamSettings(network, security string, opts StreamOpts) map[string]interface{} {
	stream := map[string]interface{}{
		"network":  network,
		"security": security,
	}

	switch network {
	case TransWS:
		ws := map[string]interface{}{"path": opts.WSPath}
		if opts.WSHost != "" {
			ws["headers"] = map[string]interface{}{"Host": opts.WSHost}
		}
		stream["wsSettings"] = ws

	case TransGRPC:
		grpc := map[string]interface{}{
			"serviceName": opts.GRPCServiceName,
			"multiMode":   opts.GRPCMultiMode,
		}
		if opts.GRPCAuthority != "" {
			grpc["authority"] = opts.GRPCAuthority
		}
		stream["grpcSettings"] = grpc

	case TransKCP:
		if opts.KCPMtu == 0 { opts.KCPMtu = 1350 }
		if opts.KCPTti == 0 { opts.KCPTti = 20 }
		if opts.KCPUpCap == 0 { opts.KCPUpCap = 5 }
		if opts.KCPDownCap == 0 { opts.KCPDownCap = 20 }
		if opts.KCPHeaderType == "" { opts.KCPHeaderType = "none" }
		stream["kcpSettings"] = map[string]interface{}{
			"mtu": opts.KCPMtu, "tti": opts.KCPTti,
			"uplinkCapacity": opts.KCPUpCap, "downlinkCapacity": opts.KCPDownCap,
			"congestion": false, "readBufferSize": 2, "writeBufferSize": 2,
			"header": map[string]interface{}{"type": opts.KCPHeaderType},
			"seed":   opts.KCPSeed,
		}

	case TransQUIC:
		stream["quicSettings"] = map[string]interface{}{
			"security": "none",
			"key":      "",
			"header":   map[string]interface{}{"type": "none"},
		}

	case TransXHTTP:
		xh := map[string]interface{}{"path": opts.XHTTPPath}
		if opts.XHTTPHost != "" { xh["host"] = []string{opts.XHTTPHost} }
		if opts.XHTTPMode != "" { xh["mode"] = opts.XHTTPMode }
		stream["xhttpSettings"] = xh

	case TransHTTPUpgrade:
		stream["httpupgradeSettings"] = map[string]interface{}{
			"path": opts.HTTPUpgradePath,
			"host": opts.HTTPUpgradeHost,
		}

	case TransSplitHTTP:
		stream["splithttpSettings"] = map[string]interface{}{
			"path": opts.SplitHTTPPath,
			"host": opts.SplitHTTPHost,
		}

	case TransTCP:
		if opts.TCPHeaderType == "http" {
			stream["tcpSettings"] = map[string]interface{}{
				"header": map[string]interface{}{
					"type": "http",
					"request": map[string]interface{}{
						"version": "1.1", "method": "GET",
						"path":    []string{opts.TCPPath},
						"headers": map[string]interface{}{"Host": []string{opts.TCPHost}},
					},
				},
			}
		}
	}

	switch security {
	case SecTLS:
		tls := map[string]interface{}{
			"serverName": opts.TLSServerName,
		}
		if opts.TLSFingerprint != "" { tls["fingerprint"] = opts.TLSFingerprint }
		if opts.TLSALPN != "" { tls["alpn"] = []string{opts.TLSALPN} }
		if opts.TLSCertFile != "" {
			tls["certificates"] = []map[string]interface{}{
				{"certificateFile": opts.TLSCertFile, "keyFile": opts.TLSKeyFile},
			}
		}
		if opts.TLSMinVersion != "" { tls["minVersion"] = opts.TLSMinVersion }
		stream["tlsSettings"] = tls

	case SecReality:
		privKey := opts.RealityPrivateKey
		shortID := opts.RealityShortID
		if privKey == "" {
			var pubKey string
			privKey, pubKey, _ = crypto.GenerateX25519KeyPair()
			opts.RealityPublicKey = pubKey
		}
		if shortID == "" {
			shortID = crypto.GenerateRealityShortID()
		}
		fp := opts.RealityFingerprint
		if fp == "" { fp = "chrome" }

		stream["realitySettings"] = map[string]interface{}{
			"show":        false,
			"dest":        opts.RealityDest,
			"xver":        0,
			"serverNames": []string{opts.RealityServerName},
			"privateKey":  privKey,
			"shortIds":    []string{shortID},
		}
	}

	return stream
}

// ========== WireGuard Helpers ==========

type WireGuardPeer struct {
	PublicKey    string   `json:"publicKey"`
	AllowedIPs  []string `json:"allowedIPs"`
	PreSharedKey string  `json:"preSharedKey,omitempty"`
	Endpoint    string   `json:"endpoint,omitempty"`
	KeepAlive   int      `json:"keepAlive,omitempty"`
}

func generateWireGuardConfig(clients []ClientConfig, opts map[string]interface{}) (privKey, pubKey string, peers []WireGuardPeer, mtu int) {
	mtu = 1420
	if m, ok := opts["mtu"].(int); ok && m > 0 {
		mtu = m
	}

	// Generate server key pair
	privKey, pubKey, err := crypto.GenerateWireGuardKeyPair()
	if err != nil {
		privKey = ""
		pubKey = ""
	}

	// Each client gets a peer entry
	peers = make([]WireGuardPeer, 0, len(clients))
	for i, c := range clients {
		// Generate client key pair
		_, clientPub, _ := crypto.GenerateWireGuardKeyPair()
		if c.ID != "" {
			clientPub = c.ID // If client provides their public key
		}

		peers = append(peers, WireGuardPeer{
			PublicKey:  clientPub,
			AllowedIPs: []string{fmt.Sprintf("10.0.0.%d/32", i+2)},
		})
	}

	return
}

// GenerateWireGuardClientConfig generates a client-side WireGuard config file.
func GenerateWireGuardClientConfig(serverHost string, serverPort int, serverPubKey string,
	clientPrivKey, clientAddress string, dns []string, mtu int) string {

	if mtu == 0 { mtu = 1420 }
	if len(dns) == 0 { dns = []string{"1.1.1.1", "8.8.8.8"} }

	dnsStr := ""
	for i, d := range dns {
		if i > 0 { dnsStr += ", " }
		dnsStr += d
	}

	return fmt.Sprintf(`[Interface]
PrivateKey = %s
Address = %s
DNS = %s
MTU = %d

[Peer]
PublicKey = %s
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = %s:%d
PersistentKeepalive = 25
`, clientPrivKey, clientAddress, dnsStr, mtu, serverPubKey, serverHost, serverPort)
}

// ========== Reality Helpers ==========

// GenerateRealityConfig generates Reality server and client configs.
type RealityConfig struct {
	PrivateKey string `json:"privateKey"`
	PublicKey  string `json:"publicKey"`
	ShortID    string `json:"shortId"`
	ServerName string `json:"serverName"`
	Dest       string `json:"dest"`
	Fingerprint string `json:"fingerprint"`
}

func GenerateRealityConfig(serverName string) (*RealityConfig, error) {
	privKey, pubKey, err := crypto.GenerateX25519KeyPair()
	if err != nil {
		return nil, err
	}
	shortID := crypto.GenerateRealityShortID()

	dest := serverName + ":443"
	if serverName == "" {
		serverName = "www.google.com"
		dest = "www.google.com:443"
	}

	return &RealityConfig{
		PrivateKey:  privKey,
		PublicKey:   pubKey,
		ShortID:     shortID,
		ServerName:  serverName,
		Dest:        dest,
		Fingerprint: "chrome",
	}, nil
}

// ========== JSON Helpers ==========

func ParseClientConfigs(data string) ([]ClientConfig, error) {
	var clients []ClientConfig
	if err := json.Unmarshal([]byte(data), &clients); err != nil {
		return nil, err
	}
	return clients, nil
}
