# Z-UI

**پنل مدیریت پروکسی نسل بعدی**

[English](#overview) · [فارسی](#فارسی) · [Telegram](https://t.me/Zendan_Ui)

---

## Overview

Z-UI is a proxy management panel built with Go and Next.js. It supports Xray-core and Sing-box with a modern dark UI.

### Quick Install

```bash
sudo bash -c "$(curl -sL https://github.com/Zendan-ui/z-ui/raw/main/scripts/install.sh)" @ install
```

Then create an admin:

```bash
z-ui admin create --sudo
```

Dashboard: `http://YOUR_IP:8443/dashboard`

### Features

**Protocols:** VLESS, VMess, Trojan, Shadowsocks, Hysteria2, TUIC, WireGuard, SOCKS5  
**Transport:** TCP, WebSocket, gRPC, QUIC, KCP, xHTTP, HTTPUpgrade, SplitHTTP  
**Security:** TLS, Reality  
**Subscription:** V2Ray, Clash, Sing-box, JSON — compatible with v2rayNG, Clash Meta, Hiddify, Shadowrocket, Nekobox, Streisand  
**Tunnel:** Direct, Reverse, Relay, WARP  
**Languages:** English, Persian (RTL), Russian  
**Themes:** Dark, Darker, AMOLED Black  

### Stack

- Backend: Go (Fiber)
- Frontend: Next.js, TypeScript, TailwindCSS
- Database: SQLite / PostgreSQL
- Cache: Redis
- Deploy: Docker

### CLI

```
z-ui start|stop|restart|status|logs|update|info
z-ui admin create|list|delete
z-ui user create|list|delete|suspend|activate|reset-traffic
z-ui config edit|show|set|get|reset-password|set-port
z-ui xray restart|version|config|update
z-ui ssl issue|renew
z-ui bbr|warp|speedtest|geo-update
z-ui firewall status|open|enable|disable
z-ui backup|restore|health|uninstall
z-ui                        # interactive menu
```

### Docker Compose

```bash
git clone https://github.com/Zendan-ui/z-ui.git
cd z-ui && docker compose up -d
```

### Manual Build

```bash
cd backend && go build -tags musl -o z-ui ./cmd/server
cd frontend && npm install && npm run build
```

---

## فارسی

Z-UI یک پنل مدیریت پروکسی با بکاند Go و فرانت‌اند Next.js است.

### نصب سریع

```bash
sudo bash -c "$(curl -sL https://github.com/Zendan-ui/z-ui/raw/main/scripts/install.sh)" @ install
z-ui admin create --sudo
```

### امکانات

- پشتیبانی از VLESS, VMess, Trojan, Shadowsocks, Hysteria2, TUIC, WireGuard
- تونل مستقیم، معکوس، رله و WARP
- سابسکریپشن برای Clash, Sing-box, V2Ray
- ربات تلگرام با مدیریت کامل
- ۳ تم: تیره، تیره‌تر، سیاه خالص
- ۳ زبان: انگلیسی، فارسی، روسی
- CLI با ۴۰+ دستور و منوی اینتراکتیو

[مستندات کامل نصب](docs/INSTALL.md)

---

## Links

- GitHub: [github.com/Zendan-ui/z-ui](https://github.com/Zendan-ui/z-ui)
- Telegram: [@Zendan_Ui](https://t.me/Zendan_Ui)

## License

MIT
