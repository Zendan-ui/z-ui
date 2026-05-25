#!/usr/bin/env bash
set -e

APP_DIR="/opt/z-ui"
DATA_DIR="/var/lib/z-ui"
IMAGE="ghcr.io/zendan-ui/z-ui:latest"
COMPOSE_URL="https://raw.githubusercontent.com/Zendan-ui/z-ui/main/docker-compose.yml"

R='\033[0;31m' G='\033[0;32m' Y='\033[1;33m' C='\033[0;36m' W='\033[1;37m' D='\033[2m' N='\033[0m'

banner() {
  echo ""
  echo -e "${C}"
  echo "   ███████╗       ██╗   ██╗██╗"
  echo "   ╚══███╔╝       ██║   ██║██║"
  echo "     ███╔╝ █████╗ ██║   ██║██║"
  echo "    ███╔╝  ╚════╝ ██║   ██║██║"
  echo "   ███████╗        ╚██████╔╝██║"
  echo "   ╚══════╝         ╚═════╝ ╚═╝  v1.0.0"
  echo ""
  echo "   github.com/Zendan-ui/z-ui"
  echo "   Telegram: @Zendan_Ui"
  echo -e "${N}"
}

check_root() {
  [[ $EUID -eq 0 ]] || { echo -e " ${R}[-]${N} Run as root: sudo $0"; exit 1; }
}

install_docker() {
  if command -v docker &>/dev/null; then
    echo -e " ${G}[+]${N} Docker: $(docker --version 2>/dev/null | grep -oP '\d+\.\d+' | head -1)"
  else
    echo -e " ${C}[*]${N} Installing Docker..."
    curl -fsSL https://get.docker.com | sh >/dev/null 2>&1
    systemctl enable --now docker >/dev/null 2>&1 || true
    echo -e " ${G}[+]${N} Docker installed"
  fi

  if docker compose version &>/dev/null; then
    echo -e " ${G}[+]${N} Docker Compose ready"
  else
    echo -e " ${R}[-]${N} Docker Compose not found"; exit 1
  fi
}

setup_files() {
  echo -e " ${C}[*]${N} Creating directories..."
  mkdir -p "$APP_DIR"
  mkdir -p "$DATA_DIR"/{db,xray,singbox,certs,backups,logs,geo}
  echo -e " ${G}[+]${N} Directories created"

  # ──── docker-compose.yml ────
  echo -e " ${C}[*]${N} Fetching compose file"
  curl -fsSL "$COMPOSE_URL" -o "$APP_DIR/docker-compose.yml" 2>/dev/null || {
    cat > "$APP_DIR/docker-compose.yml" << 'EOF'
services:
  z-ui:
    image: ghcr.io/zendan-ui/z-ui:latest
    container_name: z-ui
    restart: unless-stopped
    network_mode: host
    env_file: .env
    volumes:
      - /var/lib/z-ui:/var/lib/z-ui
    cap_add:
      - NET_ADMIN
EOF
  }
  echo -e " ${G}[+]${N} File saved in $APP_DIR/docker-compose.yml"

  # ──── .env ────
  if [[ ! -f "$APP_DIR/.env" ]]; then
    echo -e " ${C}[*]${N} Creating .env file"
    cat > "$APP_DIR/.env" << 'EOF'
ZUI_HOST=0.0.0.0
ZUI_PORT=8443
ZUI_DB_TYPE=sqlite
ZUI_DB_SQLITE=/var/lib/z-ui/db/z-ui.db
ZUI_XRAY_PATH=/usr/local/bin/xray
ZUI_XRAY_CONFIG=/var/lib/z-ui/xray/config.json
ZUI_XRAY_ASSETS=/usr/local/share/xray
ZUI_XRAY_API_PORT=10085
ZUI_XRAY_STATS=true
ZUI_DEFAULT_THEME=amoled
ZUI_TELEGRAM_ENABLED=false
ZUI_TELEGRAM_TOKEN=
ZUI_TELEGRAM_ADMIN_ID=0
EOF
    echo -e " ${G}[+]${N} File saved in $APP_DIR/.env"
  else
    echo -e " ${G}[+]${N} .env already exists, keeping current config"
  fi

  # ──── Xray config ────
  if [[ ! -f "$DATA_DIR/xray/config.json" ]]; then
    echo -e " ${C}[*]${N} Creating default Xray config"
    cat > "$DATA_DIR/xray/config.json" << 'EOF'
{
  "log": {"loglevel": "warning"},
  "api": {"tag": "api", "services": ["HandlerService", "LoggerService", "StatsService"]},
  "stats": {},
  "policy": {
    "levels": {"0": {"statsUserUplink": true, "statsUserDownlink": true}},
    "system": {"statsInboundUplink": true, "statsInboundDownlink": true, "statsOutboundUplink": true, "statsOutboundDownlink": true}
  },
  "inbounds": [
    {"tag": "api", "listen": "127.0.0.1", "port": 10085, "protocol": "dokodemo-door", "settings": {"address": "127.0.0.1"}}
  ],
  "outbounds": [
    {"tag": "direct", "protocol": "freedom"},
    {"tag": "blocked", "protocol": "blackhole", "settings": {"response": {"type": "http"}}}
  ],
  "routing": {
    "rules": [
      {"type": "field", "inboundTag": ["api"], "outboundTag": "api"},
      {"type": "field", "protocol": ["bittorrent"], "outboundTag": "blocked"}
    ]
  }
}
EOF
    echo -e " ${G}[+]${N} File saved in $DATA_DIR/xray/config.json"
  fi

  # ──── Ensure DB file exists ────
  touch "$DATA_DIR/db/z-ui.db" 2>/dev/null || true

  echo -e " ${G}[+]${N} Z-UI files ready"
}

pull_and_start() {
  echo -e " ${C}[*]${N} Installing latest version"
  cd "$APP_DIR"

  docker compose pull 2>&1 | tail -5 || {
    echo -e " ${R}[-]${N} Failed to pull image. Check internet."
    echo -e " ${Y}[!]${N} If GHCR blocked, try: export HTTPS_PROXY=http://proxy:port"
    exit 1
  }

  docker compose up -d 2>&1 | tail -5

  # ──── Wait for health ────
  echo -e " ${C}[*]${N} Waiting for Z-UI to start..."
  local port
  port=$(grep -oP 'ZUI_PORT=\K\d+' "$APP_DIR/.env" 2>/dev/null || echo 8443)
  local ok=0
  for i in $(seq 1 20); do
    if curl -sf "http://127.0.0.1:$port/health" &>/dev/null; then
      ok=1; break
    fi
    sleep 2
  done

  if [[ $ok -eq 1 ]]; then
    echo -e " ${G}[+]${N} Z-UI is running"
  else
    echo -e " ${Y}[!]${N} Z-UI may still be starting. Check: z-ui logs"
  fi
}

install_cli() {
  cat > /usr/local/bin/z-ui << 'CLIEOF'
#!/usr/bin/env bash
set -e
APP="/opt/z-ui"
DATA="/var/lib/z-ui"
_c() { cd "$APP" && docker compose "$@"; }
_port() { grep -oP 'ZUI_PORT=\K\d+' "$APP/.env" 2>/dev/null || echo 8443; }

case "${1:-help}" in
  start)   _c up -d; echo "[+] Started" ;;
  stop)    _c down; echo "[+] Stopped" ;;
  restart) _c restart; echo "[+] Restarted" ;;
  status)  _c ps ;;
  logs)    _c logs -f --tail "${2:-100}" ;;
  update)  _c pull && _c up -d --remove-orphans; echo "[+] Updated" ;;
  admin)
    case "${2:-}" in
      create) _c exec -it z-ui /app/z-ui admin create ${3:+"$3"} 2>/dev/null || {
        echo "Create admin from dashboard: http://$(curl -4s ifconfig.me 2>/dev/null):$(_port)/dashboard/"
      } ;;
      *) echo "Usage: z-ui admin create [--sudo]" ;;
    esac ;;
  config)
    case "${2:-edit}" in
      edit) ${EDITOR:-nano} "$APP/.env"; echo "[!] Restart: z-ui restart" ;;
      show) grep -v '^#' "$APP/.env" | grep . ;;
      *) echo "Usage: z-ui config {edit|show}" ;;
    esac ;;
  backup)
    local ts=$(date +%Y%m%d_%H%M%S)
    local f="$DATA/backups/z-ui-$ts.tar.gz"
    mkdir -p "$DATA/backups"
    tar -czf "$f" -C / var/lib/z-ui/db opt/z-ui/.env 2>/dev/null
    echo "[+] Backup: $f" ;;
  uninstall)
    read -rp "Remove Z-UI? (data kept) [y/N]: " a
    [[ "${a,,}" == "y" ]] || exit 0
    cd "$APP" && _c down 2>/dev/null || true
    rm -rf "$APP" /usr/local/bin/z-ui /etc/bash_completion.d/z-ui
    echo "[+] Removed. Data: $DATA" ;;
  info)
    local ip=$(curl -4s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
    echo "Dashboard: http://$ip:$(_port)/dashboard/"
    echo "API:       http://$ip:$(_port)/api/v1/"
    echo "Config:    $APP/.env"
    echo "Data:      $DATA" ;;
  version|-v) echo "Z-UI v1.0.0" ;;
  help|-h|--help|"")
    echo ""
    echo "  Z-UI — Proxy Management"
    echo "  @Zendan_Ui"
    echo ""
    echo "  z-ui start       Start"
    echo "  z-ui stop        Stop"
    echo "  z-ui restart     Restart"
    echo "  z-ui status      Status"
    echo "  z-ui logs [n]    Logs"
    echo "  z-ui update      Update"
    echo "  z-ui info        Panel URL"
    echo "  z-ui admin create [--sudo]"
    echo "  z-ui config edit"
    echo "  z-ui config show"
    echo "  z-ui backup"
    echo "  z-ui uninstall"
    echo "" ;;
  *) echo "Unknown: $1 — run: z-ui help" ;;
esac
CLIEOF
  chmod +x /usr/local/bin/z-ui

  # Bash completion
  mkdir -p /etc/bash_completion.d
  cat > /etc/bash_completion.d/z-ui << 'COMPEOF'
_zui(){ local c="${COMP_WORDS[COMP_CWORD]}" p="${COMP_WORDS[COMP_CWORD-1]}";case "$p" in admin)COMPREPLY=($(compgen -W "create" -- "$c"));;config)COMPREPLY=($(compgen -W "edit show" -- "$c"));;create)COMPREPLY=($(compgen -W "--sudo" -- "$c"));;*)COMPREPLY=($(compgen -W "start stop restart status logs update info admin config backup uninstall help version" -- "$c"));;esac;}
complete -F _zui z-ui
COMPEOF

  echo -e " ${G}[+]${N} z-ui command installed"
}

show_result() {
  local ip=$(curl -4s ifconfig.me 2>/dev/null || curl -4s icanhazip.com 2>/dev/null || hostname -I | awk '{print $1}')
  local port=$(grep -oP 'ZUI_PORT=\K\d+' "$APP_DIR/.env" 2>/dev/null || echo 8443)

  echo ""
  echo -e "${G}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"
  echo -e "${G} Z-UI installed successfully${N}"
  echo -e "${G}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"
  echo ""
  echo -e " Dashboard: ${C}http://${ip}:${port}/dashboard/${N}"
  echo ""
  echo -e " Next: Create admin account"
  echo -e "   ${W}z-ui admin create --sudo${N}"
  echo ""
  echo -e " Commands:"
  echo -e "   ${W}z-ui logs${N}        View logs"
  echo -e "   ${W}z-ui restart${N}     Restart"
  echo -e "   ${W}z-ui config edit${N} Edit config"
  echo -e "   ${W}z-ui info${N}        Show URL"
  echo -e "   ${W}z-ui help${N}        All commands"
  echo ""
  echo -e " Config: ${D}$APP_DIR/.env${N}"
  echo -e " Data:   ${D}$DATA_DIR${N}"
  echo ""
  echo -e " ${C}@Zendan_Ui${N}"
  echo -e "${G}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"
  echo ""
}

main() {
  banner
  check_root
  install_docker
  setup_files
  pull_and_start
  install_cli
  show_result

  echo -e "${D}Showing logs (Ctrl+C to stop)...${N}"
  cd "$APP_DIR" && docker compose logs -f --tail 20
}

case "${1:-install}" in
  install) main ;;
  *) echo "Usage: sudo bash $0 install" ;;
esac
