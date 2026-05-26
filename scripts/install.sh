#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/opt/z-ui"
IMAGE="ghcr.io/zendan-ui/z-ui:latest"
COMPOSE_FILE="$APP_DIR/docker-compose.yml"

R='\033[0;31m'; G='\033[0;32m'; Y='\033[1;33m'; C='\033[0;36m'; W='\033[1;37m'; N='\033[0m'

msg() { echo -e " ${C}[*]${N} $*"; }
ok()  { echo -e " ${G}[+]${N} $*"; }
warn(){ echo -e " ${Y}[!]${N} $*"; }
err() { echo -e " ${R}[-]${N} $*"; }

need_root() {
  [[ ${EUID:-0} -eq 0 ]] || { err "Please run as root"; exit 1; }
}

install_docker() {
  if command -v docker >/dev/null 2>&1; then
    ok "Docker already installed"
  else
    msg "Installing Docker..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable --now docker >/dev/null 2>&1 || true
    ok "Docker installed"
  fi
  docker compose version >/dev/null 2>&1 || { err "Docker Compose plugin is required"; exit 1; }
}

ask_value() {
  local prompt="$1" default="$2" var
  read -rp "$(echo -e " ${W}${prompt}${N} [${default}]: ")" var
  echo "${var:-$default}"
}

ask_secret() {
  local prompt="$1" generated
  generated=$(openssl rand -base64 12 2>/dev/null | tr -dc 'A-Za-z0-9' | head -c 14)
  read -rsp "$(echo -e " ${W}${prompt}${N} [auto-generate]: ")" var; echo ""
  echo "${var:-$generated}"
}

write_compose() {
  mkdir -p "$APP_DIR" "$APP_DIR/db" "$APP_DIR/cert"
  cat > "$COMPOSE_FILE" <<COMPOSE
services:
  z-ui:
    image: ${IMAGE}
    container_name: z-ui
    hostname: z-ui
    restart: unless-stopped
    network_mode: host
    environment:
      TZ: Asia/Tehran
    volumes:
      - ${APP_DIR}/db:/app/db
      - ${APP_DIR}/cert:/app/cert
    cap_add:
      - NET_ADMIN
COMPOSE
  ok "Docker compose file created at ${COMPOSE_FILE}"
}

start_stack() {
  cd "$APP_DIR"
  msg "Pulling latest Z-UI image..."
  docker compose pull
  msg "Starting Z-UI container..."
  docker compose up -d
  ok "Container started"
}

wait_container() {
  msg "Waiting for container startup..."
  for _ in $(seq 1 30); do
    if docker ps --filter 'name=^z-ui$' --format '{{.Status}}' | grep -q '^Up'; then
      sleep 2
      return 0
    fi
    sleep 2
  done
  err "Container did not start correctly"
  cd "$APP_DIR" && docker compose logs --tail 100 || true
  exit 1
}

configure_panel() {
  local user="$1" pass="$2" panel_port="$3" sub_port="$4"
  msg "Applying admin credentials and panel settings..."
  local cmd="./z-ui admin -username '$user' -password '$pass' && ./z-ui setting -port $panel_port -path /app/ -subPort $sub_port -subPath /sub/"
  for _ in $(seq 1 20); do
    if docker exec z-ui sh -lc "$cmd" >/dev/null 2>&1; then
      ok "Panel configuration applied"
      return 0
    fi
    sleep 2
  done
  warn "Could not configure panel automatically. You can run it later with z-ui admin/set commands."
}

install_cli() {
  cat > /usr/local/bin/z-ui <<'CLIEOF'
#!/usr/bin/env bash
set -euo pipefail
APP_DIR="/opt/z-ui"
cd "$APP_DIR"
compose() { docker compose "$@"; }
exec_in() { docker exec z-ui sh -lc "$*"; }
server_ip() { curl -4s ifconfig.me 2>/dev/null || curl -4s icanhazip.com 2>/dev/null || hostname -I | awk '{print $1}'; }
panel_uri() {
  exec_in './z-ui uri' 2>/dev/null || true
}

case "${1:-help}" in
  start) compose up -d ;;
  stop) compose down ;;
  restart) compose restart ;;
  status) compose ps ; echo ""; panel_uri ;;
  logs) compose logs -f --tail "${2:-100}" ;;
  update) compose pull && compose up -d ;;
  info)
    echo "Z-UI access URLs:"
    panel_uri
    ;;
  admin)
    case "${2:-}" in
      show) exec_in './z-ui admin -show' ;;
      set)
        user="${3:-}"; pass="${4:-}"
        [[ -n "$user" && -n "$pass" ]] || { echo "Usage: z-ui admin set <username> <password>"; exit 1; }
        exec_in "./z-ui admin -username '$user' -password '$pass'"
        ;;
      *) echo "Usage: z-ui admin {show|set <username> <password>}" ;;
    esac
    ;;
  setting)
    case "${2:-}" in
      show) exec_in './z-ui setting -show' ;;
      set-port)
        port="${3:-}"; [[ -n "$port" ]] || { echo "Usage: z-ui setting set-port <port>"; exit 1; }
        exec_in "./z-ui setting -port '$port'"
        ;;
      *) echo "Usage: z-ui setting {show|set-port <port>}" ;;
    esac
    ;;
  uninstall)
    compose down || true
    rm -rf "$APP_DIR"
    rm -f /usr/local/bin/z-ui
    echo "Z-UI removed."
    ;;
  help|*)
    echo "Z-UI helper"
    echo "  z-ui start"
    echo "  z-ui stop"
    echo "  z-ui restart"
    echo "  z-ui status"
    echo "  z-ui logs [n]"
    echo "  z-ui update"
    echo "  z-ui info"
    echo "  z-ui admin show"
    echo "  z-ui admin set <username> <password>"
    echo "  z-ui setting show"
    echo "  z-ui setting set-port <port>"
    echo "  z-ui uninstall"
    ;;
esac
CLIEOF
  chmod +x /usr/local/bin/z-ui
  ok "z-ui helper command installed"
}

show_result() {
  local user="$1" pass="$2" panel_port="$3"
  local ip
  ip=$(curl -4s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')
  echo ""
  echo -e "${G}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"
  echo -e "${G}        Z-UI installed${N}"
  echo -e "${G}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${N}"
  echo -e " URL      : ${W}http://${ip}:${panel_port}/app/${N}"
  echo -e " Username : ${W}${user}${N}"
  echo -e " Password : ${W}${pass}${N}"
  echo -e " Data dir : ${W}${APP_DIR}/db${N}"
  echo -e " Cert dir : ${W}${APP_DIR}/cert${N}"
  echo ""
  echo -e " Commands : ${W}z-ui status${N}, ${W}z-ui logs${N}, ${W}z-ui update${N}, ${W}z-ui info${N}"
  echo ""
}

main() {
  need_root
  echo ""
  echo -e "${C}Z-UI Installer${N}"
  echo -e "${C}Modern proxy panel with 4 themes and 4 languages${N}"
  echo ""

  local admin_user admin_pass panel_port sub_port
  admin_user=$(ask_value "Admin username" "admin")
  admin_pass=$(ask_secret "Admin password")
  panel_port=$(ask_value "Panel port" "2095")
  sub_port=$(ask_value "Subscription port" "2096")

  install_docker
  write_compose
  start_stack
  wait_container
  configure_panel "$admin_user" "$admin_pass" "$panel_port" "$sub_port"
  install_cli
  show_result "$admin_user" "$admin_pass" "$panel_port"
}

case "${1:-install}" in
  install) main ;;
  *) echo "Usage: sudo bash scripts/install.sh install" ; exit 1 ;;
esac
