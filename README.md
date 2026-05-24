# Z-UI — The Future of Proxy Management

<p align="center">
  <img src="assets/logo.svg" width="200" alt="Z-UI Logo" />
</p>

<p align="center">
  <strong>Ultra-Advanced Next-Generation VPN/Proxy Management Platform</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#api">API</a> •
  <a href="#telegram-bot">Telegram Bot</a> •
  <a href="#documentation">Docs</a>
</p>

<p align="center">
  <a href="https://github.com/Zendan-ui/z-ui">GitHub</a> •
  <a href="https://t.me/Zendan_Ui">Telegram</a>
</p>

---

## Overview

Z-UI is a production-ready, enterprise-grade proxy management platform that combines and surpasses the best features of Marzban and 3X-UI (Sanaei). Built with a high-performance Go backend and a modern Next.js frontend, Z-UI delivers unmatched speed, security, and scalability.

## Features

### Protocol Support
- **VLESS** (TCP, WS, gRPC, QUIC, Reality, XHTTP, HTTPUpgrade, SplitHTTP)
- **VMess** (TCP, WS, gRPC, QUIC, KCP, HTTPUpgrade)
- **Trojan** (TCP, WS, gRPC, Reality)
- **Shadowsocks** (2022, AEAD)
- **Hysteria2** (QUIC-based)
- **TUIC** (v5)
- **WireGuard**
- **SOCKS5**
- **SSH Tunnel**
- **SUN** (Sing-box Universal)

### Transport Support
- WebSocket, gRPC, QUIC, TCP, KCP, XHTTP, HTTPUpgrade, SplitHTTP, Reality

### Core Architecture
- 🚀 High-performance Go backend with fiber/fasthttp
- ⚡ Next.js 14 + TypeScript + TailwindCSS frontend
- 🐳 Docker-native deployment
- 🔄 Real-time WebSocket communication
- 📊 Prometheus + Grafana monitoring
- 🗄️ PostgreSQL + Redis + SQLite support
- 🔐 JWT + 2FA + RBAC authentication
- 🎨 3 Themes: Dark, Darker, AMOLED Black

### Subscription System
- Dedicated subscription links per user
- Clash Meta / Sing-box / V2Ray / Xray subscription formats
- JSON subscription export
- Auto-updating subscriptions
- Encrypted subscription links
- QR code generation
- Short links
- Traffic & expiration limits
- Multi-subscription per user
- Device limit system
- Online device management
- Auto-renew system
- Analytics & usage logs

### Client Compatibility
- Clash Meta, Nekobox, Hiddify, Streisand
- Shadowrocket, v2rayNG, Sing-box, V2Box, Kitsunebi

### Telegram Bot
- Full admin panel inside Telegram
- User management (create, suspend, renew)
- Subscription management
- QR code generation
- Traffic & usage statistics
- Server monitoring
- Live logs
- Multi-language (EN, FA, RU)
- Inline menu UI

### Advanced Features
- Multi-server & cluster support
- Outbound tunnel & multi-hop routing
- GeoIP & smart routing
- Load balancing
- AI-based route optimization
- DDoS protection & firewall
- Audit logs
- Backup & restore
- Plugin system
- Theme customization (Dark / Darker / AMOLED Black)
- Automatic failover
- Remote node management

### Languages
- 🇬🇧 English
- 🇮🇷 Persian (RTL)
- 🇷🇺 Russian

## Installation

### One-Click Install
```bash
bash <(curl -sL https://raw.githubusercontent.com/Zendan-ui/z-ui/main/scripts/install.sh)
```

### Docker Compose
```bash
git clone https://github.com/Zendan-ui/z-ui.git
cd z-ui
docker compose up -d
```

### Manual Build
```bash
# Backend
cd backend && go build -o z-ui ./cmd/server

# Frontend
cd frontend && npm install && npm run build
```

## Configuration

Copy `.env.example` to `.env` and configure:

```env
ZUI_DB_TYPE=postgres
ZUI_DB_HOST=localhost
ZUI_DB_PORT=5432
ZUI_DB_NAME=zui
ZUI_DB_USER=zui
ZUI_DB_PASS=secret
ZUI_REDIS_URL=redis://localhost:6379
ZUI_JWT_SECRET=your-secret-key
ZUI_ADMIN_USER=admin
ZUI_ADMIN_PASS=admin
ZUI_TELEGRAM_TOKEN=your-bot-token
ZUI_XRAY_PATH=/usr/local/bin/xray
ZUI_SINGBOX_PATH=/usr/local/bin/sing-box
```

## API Documentation

REST API available at `/api/v1/`  
WebSocket API at `/ws/`  
Swagger docs at `/api/docs`

## Support

- GitHub: [github.com/Zendan-ui/z-ui](https://github.com/Zendan-ui/z-ui)
- Telegram: [@Zendan_Ui](https://t.me/Zendan_Ui)

## License

MIT License — © 2024-2026 Z-UI Project

---

**Z-UI — The Future of Proxy Management** 🚀
