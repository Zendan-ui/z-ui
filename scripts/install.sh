set -euo pipefail

APP_DIR="/opt/z-ui"
IMAGE="ghcr.io/zendan-ui/z-ui:latest"
COMPOSE_FILE="$APP_DIR/docker-compose.yml"

R='\033[0;31m'; G='\033[0;32m'; Y='\033[1;33m'; C='\033[0;36m'; W='\033[1;37m'; N='\033[0m'
msg() { echo -e " ${C}[*]${N} $*"; }
ok()  { echo -e " ${G}[+]${N} $*"; }
warn(){ echo -e " ${Y}[!]${N} $*"; }
err() { echo -e " ${R}[-]${N} $*"; }
need_root() { [[ ${EUID:-0} -eq 0 ]] || { err "Please run as root"; exit 1; }; }

# Strip CR and surrounding whitespace
sanitize() {
  local s="$1"
  s="${s//$'\r'/}"
  s="${s##[[:space:]]}"
  s="${s%%[[:space:]]}"
  printf '%s' "$s"
}

# Escape for double-quoted YAML scalar
yaml_quote() {
  local s="$1"
  s="${s//\\/\\\\}"
  s="${s//\"/\\\"}"
  printf '"%s"' "$s"
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
  read -rp "$(echo -e " ${W}${prompt}${N} [${default}]: ")" var </dev/tty
  var=$(sanitize "$var")
  echo "${var:-$default}"
}

ask_secret() {
  local prompt="$1" generated var
  generated=$(openssl rand -base64 12 2>/dev/null | tr -dc 'A-Za-z0-9' | head -c 14)
  read -rsp "$(echo -e " ${W}${prompt}${N} [auto-generate]: ")" var </dev/tty; echo ""
  var=$(sanitize "$var")
  echo "${var:-$generated}"
}

write_compose() {
  local admin_user="$1" admin_pass="$2" panel_port="$3" sub_port="$4"
  mkdir -p "$APP_DIR" "$APP_DIR/db" "$APP_DIR/cert"

  local q_image q_user q_pass q_panel q_sub q_app
  q_image=$(yaml_quote "$IMAGE")
  q_user=$(yaml_quote "$admin_user")
  q_pass=$(yaml_quote "$admin_pass")
  q_panel=$(yaml_quote "$panel_port")
  q_sub=$(yaml_quote "$sub_port")
  q_app="$APP_DIR"

  cat > "$COMPOSE_FILE" <<COMPOSE
services:
  z-ui:
    image: ${q_image}
    container_name: z-ui
    hostname: z-ui
    restart: unless-stopped
    network_mode: host
    environment:
      TZ: "Asia/Tehran"
      ZUI_DB_FOLDER: "/app/db"
      ZUI_ADMIN_USER: ${q_user}
      ZUI_ADMIN_PASS: ${q_pass}
      ZUI_PANEL_PORT: ${q_panel}
      ZUI_PANEL_PATH: "/app/"
      ZUI_SUB_PORT: ${q_sub}
      ZUI_SUB_PATH: "/sub/"
    volumes:
      - ${q_app}/db:/app/db
      - ${q_app}/cert:/app/cert
    cap_add:
      - NET_ADMIN
COMPOSE
  ok "Docker compose file created at ${COMPOSE_FILE}"

  # Validate YAML before pulling
  if ! docker compose -f "$COMPOSE_FILE" config >/dev/null 2>/tmp/zui-compose.err; then
    err "Generated compose file is invalid:"
    cat /tmp/zui-compose.err
    exit 1
  fi
}

start_stack() {
  cd "$APP_DIR"
  msg "Pulling latest Z-UI image..."
  docker compose pull
  msg "Starting Z-UI container..."
  docker compose up -d --force-recreate
  ok "Container started"
}

wait_container() {
  msg "Waiting for container startup..."
  for _ in $(seq 1 40); do
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

verify_admin() {
  local user="$1" pass="$2"
  msg "Verifying bootstrap admin credentials..."
  for _ in $(seq 1 20); do
    if docker exec z-ui ./z-ui admin -show >/tmp/zui-admin-show.txt 2>/dev/null; then
      if grep -q "Username:.*${user}" /tmp/zui-admin-show.txt && grep -q "Password:.*${pass}" /tmp/zui-admin-show.txt; then
        ok "Admin user verified"
        rm -f /tmp/zui-admin-show.txt
        return 0
      fi
    fi
    sleep 2
  done
  warn "Automatic verification failed. Current admin from container:"
  docker exec z-ui ./z-ui admin -show || true
  rm -f /tmp/zui-admin-show.txt
}

install_cli() {
  cat > /usr/local/bin/z-ui <<'CLIEOF'
#!/usr/bin/env bash
set -euo pipefail
APP_DIR="/opt/z-ui"
cd "$APP_DIR"
compose() { docker compose "$@"; }
exec_in() { docker exec z-ui sh -lc "$*"; }
panel_uri() { exec_in './z-ui uri' 2>/dev/null || true; }

case "${1:-help}" in
  start) compose up -d ;;
  stop) compose down ;;
  restart) compose restart ;;
  status) compose ps ; echo "" ; panel_uri ;;
  logs) compose logs -f --tail "${2:-100}" ;;
  update) compose pull && compose up -d --force-recreate ;;
  info) echo "Z-UI access URLs:" ; panel_uri ;;
  admin)
    case "${2:-}" in
      show) exec_in './z-ui admin -show' ;;
      set)
        user="${3:-}"; pass="${4:-}"
        [[ -n "$user" && -n "$pass" ]] || { echo "Usage: z-ui admin set <username> <password>"; exit 1; }
        exec_in "./z-ui admin -username '$user' -password '$pass'" ;;
      *) echo "Usage: z-ui admin {show|set <username> <password>}" ;;
    esac ;;
  setting)
    case "${2:-}" in
      show) exec_in './z-ui setting -show' ;;
      set-port) port="${3:-}"; [[ -n "$port" ]] || { echo "Usage: z-ui setting set-port <port>"; exit 1; }; exec_in "./z-ui setting -port '$port'" ;;
      *) echo "Usage: z-ui setting {show|set-port <port>}" ;;
    esac ;;
  uninstall) compose down || true; rm -rf "$APP_DIR"; rm -f /usr/local/bin/z-ui; echo "Z-UI removed." ;;
  help|*)
    echo "Z-UI helper"
    echo "  z-ui start|stop|restart|status|logs|update|info"
    echo "  z-ui admin show | z-ui admin set <username> <password>"
    echo "  z-ui setting show | z-ui setting set-port <port>"
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
  echo ""; echo -e "${C}Z-UI Installer (patched)${N}"; echo ""
  local admin_user admin_pass panel_port sub_port
  admin_user=$(ask_value  "Admin username"    "admin")
  admin_pass=$(ask_secret "Admin password")
  panel_port=$(ask_value  "Panel port"        "2095")
  sub_port=$(ask_value    "Subscription port" "2096")
  install_docker
  write_compose "$admin_user" "$admin_pass" "$panel_port" "$sub_port"
  start_stack
  wait_container
  verify_admin "$admin_user" "$admin_pass"
  install_cli
  show_result "$admin_user" "$admin_pass" "$panel_port"
}

case "${1:-install}" in
  install) main ;;
  *) echo "Usage: sudo bash install-z-ui-fixed.sh install" ; exit 1 ;;
esac
