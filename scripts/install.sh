#!/usr/bin/env bash
set -e

APP_DIR="/opt/z-ui"
DATA_DIR="/var/lib/z-ui"
IMAGE="ghcr.io/zendan-ui/z-ui:latest"

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
  echo "   github.com/Zendan-ui/z-ui | @Zendan_Ui"
  echo -e "${N}"
}

check_root() { [[ $EUID -eq 0 ]] || { echo -e " ${R}[-]${N} Run as root"; exit 1; }; }

install_docker() {
  if command -v docker &>/dev/null; then
    echo -e " ${G}[+]${N} Docker: $(docker --version 2>/dev/null | grep -oP '\d+\.\d+' | head -1)"
  else
    echo -e " ${C}[*]${N} Installing Docker..."
    curl -fsSL https://get.docker.com | sh >/dev/null 2>&1
    systemctl enable --now docker >/dev/null 2>&1 || true
    echo -e " ${G}[+]${N} Docker installed"
  fi
  docker compose version &>/dev/null || { echo -e " ${R}[-]${N} Docker Compose not found"; exit 1; }
}

setup_files() {
  echo -e " ${C}[*]${N} Creating directories..."
  mkdir -p "$APP_DIR" "$DATA_DIR"/{db,xray,singbox,certs,backups,logs,geo}

  # ── docker-compose.yml ──
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
  echo -e " ${G}[+]${N} docker-compose.yml saved"

  # ── First-run setup: ask admin credentials + port ──
  if [[ ! -f "$APP_DIR/.env" ]]; then
    echo ""
    echo -e " ${W}━━━ Initial Setup ━━━${N}"
    echo ""

    # Admin username
    read -rp "$(echo -e " ${C}Admin username${N} [admin]: ")" ADMIN_USER
    ADMIN_USER="${ADMIN_USER:-admin}"

    # Admin password
    while true; do
      read -rsp "$(echo -e " ${C}Admin password${N} [auto]: ")" ADMIN_PASS
      echo ""
      if [[ -z "$ADMIN_PASS" ]]; then
        ADMIN_PASS=$(openssl rand -hex 6 2>/dev/null || head -c12 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9' | head -c12)
        echo -e " ${G}[+]${N} Generated password: ${W}${ADMIN_PASS}${N}"
        break
      elif (( ${#ADMIN_PASS} < 4 )); then
        echo -e " ${R}[-]${N} Min 4 chars"
      else
        break
      fi
    done

    # Port
    read -rp "$(echo -e " ${C}Panel port${N} [8443]: ")" PANEL_PORT
    PANEL_PORT="${PANEL_PORT:-8443}"

    # Telegram
    echo ""
    read -rp "$(echo -e " ${C}Telegram bot token${N} (Enter to skip): ")" TG_TOKEN
    TG_ENABLED="false"
    TG_ADMIN="0"
    if [[ -n "$TG_TOKEN" ]]; then
      TG_ENABLED="true"
      read -rp "$(echo -e " ${C}Admin Telegram ID${N}: ")" TG_ADMIN
    fi

    cat > "$APP_DIR/.env" << ENVEOF
ZUI_HOST=0.0.0.0
ZUI_PORT=${PANEL_PORT}
ZUI_DB_TYPE=sqlite
ZUI_DB_SQLITE=/var/lib/z-ui/db/z-ui.db
ZUI_ADMIN_USER=${ADMIN_USER}
ZUI_ADMIN_PASS=${ADMIN_PASS}
ZUI_XRAY_PATH=/usr/local/bin/xray
ZUI_XRAY_CONFIG=/var/lib/z-ui/xray/config.json
ZUI_XRAY_ASSETS=/usr/local/share/xray
ZUI_XRAY_API_PORT=10085
ZUI_XRAY_STATS=true
ZUI_DEFAULT_THEME=midnight
ZUI_TELEGRAM_ENABLED=${TG_ENABLED}
ZUI_TELEGRAM_TOKEN=${TG_TOKEN}
ZUI_TELEGRAM_ADMIN_ID=${TG_ADMIN}
ENVEOF
    echo -e " ${G}[+]${N} .env saved"
  else
    echo -e " ${G}[+]${N} .env exists, keeping config"
    ADMIN_USER=$(grep -oP 'ZUI_ADMIN_USER=\K.*' "$APP_DIR/.env" 2>/dev/null || echo "admin")
    ADMIN_PASS=$(grep -oP 'ZUI_ADMIN_PASS=\K.*' "$APP_DIR/.env" 2>/dev/null || echo "***")
    PANEL_PORT=$(grep -oP 'ZUI_PORT=\K\d+' "$APP_DIR/.env" 2>/dev/null || echo "8443")
  fi

  # ── Xray config ──
  if [[ ! -f "$DATA_DIR/xray/config.json" ]]; then
    cat > "$DATA_DIR/xray/config.json" << 'EOF'
{"log":{"loglevel":"warning"},"api":{"tag":"api","services":["HandlerService","LoggerService","StatsService"]},"stats":{},"policy":{"levels":{"0":{"statsUserUplink":true,"statsUserDownlink":true}},"system":{"statsInboundUplink":true,"statsInboundDownlink":true}},"inbounds":[{"tag":"api","listen":"127.0.0.1","port":10085,"protocol":"dokodemo-door","settings":{"address":"127.0.0.1"}}],"outbounds":[{"tag":"direct","protocol":"freedom"},{"tag":"blocked","protocol":"blackhole","settings":{"response":{"type":"http"}}}],"routing":{"rules":[{"type":"field","inboundTag":["api"],"outboundTag":"api"},{"type":"field","protocol":["bittorrent"],"outboundTag":"blocked"}]}}
EOF
    echo -e " ${G}[+]${N} Xray config saved"
  fi

  touch "$DATA_DIR/db/z-ui.db" 2>/dev/null || true
}

pull_and_start() {
  echo -e " ${C}[*]${N} Pulling latest image..."
  cd "$APP_DIR"
  docker compose pull 2>&1 | tail -3 || {
    echo -e " ${R}[-]${N} Pull failed. Try: export HTTPS_PROXY=http://proxy:port"
    exit 1
  }
  docker compose up -d 2>&1 | tail -3
  echo -e " ${C}[*]${N} Waiting for startup..."
  local port="${PANEL_PORT:-8443}"
  for i in $(seq 1 15); do
    curl -sf "http://127.0.0.1:$port/health" &>/dev/null && { echo -e " ${G}[+]${N} Z-UI is running"; return; }
    sleep 2
  done
  echo -e " ${Y}[!]${N} Still starting... check: z-ui logs"
}

install_cli() {
  cat > /usr/local/bin/z-ui << 'CLIEOF'
#!/usr/bin/env bash
set -e
APP="/opt/z-ui"
DATA="/var/lib/z-ui"
_c() { cd "$APP" && docker compose "$@"; }
_port() { grep -oP 'ZUI_PORT=\K\d+' "$APP/.env" 2>/dev/null || echo "8443"; }
_ip() { curl -4s ifconfig.me 2>/dev/null || curl -4s icanhazip.com 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}'; }

case "${1:-help}" in
  start)   _c up -d; echo "[+] Started on port $(_port)" ;;
  stop)    _c down; echo "[+] Stopped" ;;
  restart) _c restart; echo "[+] Restarted" ;;
  status)
    echo ""
    echo "  Z-UI Status"
    echo "  ─────────────────────"
    _c ps 2>/dev/null || true
    echo ""
    # Ping health
    local p=$(_port)
    if curl -sf "http://127.0.0.1:$p/health" &>/dev/null; then
      echo "  Panel:   ✅ Running (port $p)"
    else
      echo "  Panel:   ❌ Down"
    fi
    # System info
    echo "  CPU:     $(top -bn1 2>/dev/null | grep 'Cpu(s)' | awk '{printf "%.0f%%", $2}' || echo '?')"
    echo "  RAM:     $(free -h 2>/dev/null | awk '/Mem:/{print $3"/"$2}' || echo '?')"
    echo "  Disk:    $(df -h / 2>/dev/null | awk 'NR==2{print $3"/"$2" ("$5")"}' || echo '?')"
    echo "  Uptime:  $(uptime -p 2>/dev/null || uptime | sed 's/.*up //' | sed 's/,.*//')"
    echo ""
    ;;
  logs) _c logs -f --tail "${2:-100}" ;;
  update) _c pull && _c up -d --remove-orphans; echo "[+] Updated" ;;

  # ── Admin ──
  admin)
    case "${2:-}" in
      create)
        read -rp "  Username: " u
        read -rsp "  Password: " p; echo ""
        [[ -z "$u" || -z "$p" ]] && { echo "[-] Username and password required"; exit 1; }
        # Save to .env for next restart
        sed -i "s|^ZUI_ADMIN_USER=.*|ZUI_ADMIN_USER=$u|" "$APP/.env" 2>/dev/null
        sed -i "s|^ZUI_ADMIN_PASS=.*|ZUI_ADMIN_PASS=$p|" "$APP/.env" 2>/dev/null
        _c restart
        echo "[+] Admin '$u' created. Panel restarted."
        ;;
      *) echo "Usage: z-ui admin create" ;;
    esac ;;

  # ── Port ──
  port)
    case "${2:-}" in
      set)
        local new_port="${3:-}"
        [[ -z "$new_port" ]] && { read -rp "  New port: " new_port; }
        [[ "$new_port" =~ ^[0-9]+$ ]] || { echo "[-] Invalid port"; exit 1; }
        sed -i "s|^ZUI_PORT=.*|ZUI_PORT=$new_port|" "$APP/.env"
        _c restart
        echo "[+] Port changed to $new_port"
        echo "    Dashboard: http://$(_ip):$new_port/dashboard/"
        ;;
      show) echo "Current port: $(_port)" ;;
      *) echo "Usage: z-ui port {set <port>|show}" ;;
    esac ;;

  # ── Ping / Test ──
  ping)
    echo ""
    echo "  Connection Test"
    echo "  ─────────────────────"
    local p=$(_port) ip=$(_ip)
    # Panel health
    if curl -sf "http://127.0.0.1:$p/health" &>/dev/null; then
      echo "  Panel:     ✅ http://127.0.0.1:$p"
    else
      echo "  Panel:     ❌ Not responding"
    fi
    # External access
    if curl -sf --max-time 5 "http://$ip:$p/health" &>/dev/null; then
      echo "  External:  ✅ http://$ip:$p"
    else
      echo "  External:  ⚠ Not reachable (firewall?)"
    fi
    # Docker status
    if docker ps --filter "name=z-ui" --format '{{.Status}}' 2>/dev/null | grep -q "Up"; then
      echo "  Docker:    ✅ Container running"
    else
      echo "  Docker:    ❌ Container not running"
    fi
    # Xray
    if _c exec z-ui pgrep -f xray &>/dev/null 2>&1; then
      echo "  Xray:      ✅ Running"
    else
      echo "  Xray:      ⚠ Not detected"
    fi
    # DNS
    if ping -c1 -W2 google.com &>/dev/null; then
      echo "  Internet:  ✅ Connected"
    else
      echo "  Internet:  ❌ No connection"
    fi
    echo ""
    ;;

  # ── Config ──
  config)
    case "${2:-edit}" in
      edit) ${EDITOR:-nano} "$APP/.env"; echo "[!] Restart: z-ui restart" ;;
      show)
        echo ""
        echo "  Configuration"
        echo "  ─────────────────────"
        grep -v '^#' "$APP/.env" | grep . | while IFS='=' read -r k v; do
          if [[ "$k" =~ PASS|SECRET|TOKEN ]]; then
            echo "  $k = ********"
          else
            echo "  $k = $v"
          fi
        done
        echo ""
        ;;
      *) echo "Usage: z-ui config {edit|show}" ;;
    esac ;;

  # ── Backup ──
  backup)
    ts=$(date +%Y%m%d_%H%M%S)
    f="$DATA/backups/z-ui-$ts.tar.gz"
    mkdir -p "$DATA/backups"
    tar -czf "$f" -C / var/lib/z-ui/db opt/z-ui/.env 2>/dev/null
    echo "[+] Backup: $f ($(du -h "$f" 2>/dev/null | awk '{print $1}'))"
    ;;

  # ── Info ──
  info)
    local p=$(_port) ip=$(_ip)
    echo ""
    echo "  Z-UI Info"
    echo "  ─────────────────────"
    echo "  Dashboard: http://$ip:$p/dashboard/"
    echo "  API:       http://$ip:$p/api/v1/"
    echo "  Health:    http://$ip:$p/health"
    echo "  Port:      $p"
    echo "  Config:    $APP/.env"
    echo "  Data:      $DATA"
    echo "  Version:   1.0.0"
    echo ""
    ;;

  # ── Uninstall ──
  uninstall)
    echo ""
    read -rp "$(echo -e "\033[0;31m  Remove Z-UI? Data will be kept. [y/N]: \033[0m")" a
    [[ "${a,,}" == "y" ]] || exit 0
    cd "$APP" && _c down 2>/dev/null || true
    rm -rf "$APP" /usr/local/bin/z-ui /etc/bash_completion.d/z-ui
    echo "[+] Removed. Data at: $DATA"
    ;;

  version|-v) echo "Z-UI v1.0.0" ;;

  help|-h|--help|"")
    echo ""
    echo "  Z-UI — Proxy Management Panel"
    echo "  github.com/Zendan-ui/z-ui | @Zendan_Ui"
    echo ""
    echo "  ${W}Panel:${N}"
    echo "    z-ui start          Start panel"
    echo "    z-ui stop           Stop panel"
    echo "    z-ui restart        Restart panel"
    echo "    z-ui status         Status + system info"
    echo "    z-ui logs [n]       View logs"
    echo "    z-ui update         Update to latest"
    echo "    z-ui info           Show panel URL"
    echo "    z-ui ping           Test connectivity"
    echo ""
    echo "  ${W}Config:${N}"
    echo "    z-ui admin create   Create admin account"
    echo "    z-ui port set 443   Change panel port"
    echo "    z-ui port show      Show current port"
    echo "    z-ui config edit    Edit .env file"
    echo "    z-ui config show    Show config (masked)"
    echo ""
    echo "  ${W}Data:${N}"
    echo "    z-ui backup         Create backup"
    echo "    z-ui uninstall      Remove Z-UI"
    echo "    z-ui version        Show version"
    echo ""
    ;;

  *) echo "Unknown: $1 — run: z-ui help" ;;
esac
CLIEOF
  chmod +x /usr/local/bin/z-ui

  # Bash completion
  mkdir -p /etc/bash_completion.d 2>/dev/null || true
  cat > /etc/bash_completion.d/z-ui << 'COMP'
_zui(){ local c="${COMP_WORDS[COMP_CWORD]}" p="${COMP_WORDS[COMP_CWORD-1]}";case "$p" in admin)COMPREPLY=($(compgen -W "create" -- "$c"));;port)COMPREPLY=($(compgen -W "set show" -- "$c"));;config)COMPREPLY=($(compgen -W "edit show" -- "$c"));;*)COMPREPLY=($(compgen -W "start stop restart status logs update info ping admin port config backup uninstall help version" -- "$c"));;esac;}
complete -F _zui z-ui
COMP

  echo -e " ${G}[+]${N} z-ui command installed"
}

show_result() {
  local ip=$(_ip)
  local port="${PANEL_PORT:-8443}"
  echo ""
  echo -e "${G}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"
  echo -e "${G} Z-UI installed successfully${N}"
  echo -e "${G}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"
  echo ""
  echo -e " Dashboard: ${C}http://${ip}:${port}/dashboard/${N}"
  echo -e " Username:  ${W}${ADMIN_USER:-admin}${N}"
  echo -e " Password:  ${W}${ADMIN_PASS:-admin}${N}"
  echo ""
  echo -e " Commands:"
  echo -e "   ${W}z-ui status${N}         Status + system info"
  echo -e "   ${W}z-ui ping${N}           Test connectivity"
  echo -e "   ${W}z-ui logs${N}           View logs"
  echo -e "   ${W}z-ui port set 443${N}   Change port"
  echo -e "   ${W}z-ui admin create${N}   New admin"
  echo -e "   ${W}z-ui config edit${N}    Edit settings"
  echo -e "   ${W}z-ui info${N}           Show URL"
  echo -e "   ${W}z-ui help${N}           All commands"
  echo ""
  echo -e " Config: ${D}$APP_DIR/.env${N}"
  echo -e " Data:   ${D}$DATA_DIR${N}"
  echo ""
  echo -e " ${C}@Zendan_Ui${N}"
  echo -e "${G}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"
  echo ""
}

_ip() { curl -4s ifconfig.me 2>/dev/null || curl -4s icanhazip.com 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}'; }

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
