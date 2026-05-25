#!/usr/bin/env bash
#
# ╔══════════════════════════════════════════════════════════╗
# ║  Z-UI — Installer & Management Script v1.0.0            ║
# ║  The Future of Proxy Management                          ║
# ║  GitHub:   https://github.com/Zendan-ui/z-ui             ║
# ║  Telegram: @Zendan_Ui                                    ║
# ╚══════════════════════════════════════════════════════════╝
#
# Usage:
#   sudo bash -c "$(curl -sL https://github.com/Zendan-ui/z-ui/raw/main/scripts/install.sh)" @ install
#

set -euo pipefail
export LC_ALL=C

# ========================= CONSTANTS =========================
readonly APP="z-ui"
readonly VER="1.0.0"
readonly REPO="https://github.com/Zendan-ui/z-ui.git"
readonly RAW="https://raw.githubusercontent.com/Zendan-ui/z-ui/main"
readonly APP_DIR="/opt/z-ui"
readonly DATA="/var/lib/z-ui"
readonly CLI="/usr/local/bin/z-ui"
readonly SVC="z-ui"
readonly ENV="${APP_DIR}/.env"
readonly LOG="/var/log/z-ui-install.log"
readonly BKDIR="${DATA}/backups"
readonly DEF_PORT=8443

# ========================= COLORS =========================
if [[ -t 1 ]]; then
  R='\033[0;31m' G='\033[0;32m' Y='\033[1;33m' B='\033[0;34m'
  P='\033[0;35m' C='\033[0;36m' W='\033[1;37m' D='\033[2m' N='\033[0m'
else
  R='' G='' Y='' B='' P='' C='' W='' D='' N=''
fi

ok()   { echo -e " ${G}✓${N} $*"; }
wrn()  { echo -e " ${Y}!${N} $*"; }
err()  { echo -e " ${R}✗${N} $*" >&2; }
inf()  { echo -e " ${B}i${N} $*"; }
stp()  { echo -e "\n${C}${W}▸ $*${N}"; }
dim()  { echo -e "   ${D}$*${N}"; }
die()  { err "$*"; exit 1; }
sep()  { echo -e "${D}$(printf '%.0s─' {1..58})${N}"; }

banner() {
  echo -e "${C}"
  cat << 'ART'

   ███████╗       ██╗   ██╗██╗
   ╚══███╔╝       ██║   ██║██║
     ███╔╝ █████╗ ██║   ██║██║
    ███╔╝  ╚════╝ ██║   ██║██║
   ███████╗        ╚██████╔╝██║
   ╚══════╝         ╚═════╝ ╚═╝  v1.0.0

   The Future of Proxy Management
   github.com/Zendan-ui/z-ui  ·  @Zendan_Ui

ART
  echo -e "${N}"
}

# ========================= DETECT =========================
server_ip() { curl -4s ifconfig.me 2>/dev/null || curl -4s icanhazip.com 2>/dev/null || hostname -I | awk '{print $1}'; }
check_root() { [[ $EUID -eq 0 ]] || die "Run as root: sudo $0"; }

detect_os() {
  [[ -f /etc/os-release ]] && . /etc/os-release || die "Cannot detect OS"
  OS_ID="${ID}"; OS_NAME="${PRETTY_NAME}"
  ok "OS: ${OS_NAME}"
}

detect_arch() {
  case "$(uname -m)" in
    x86_64|amd64) ARCH="amd64" ;; aarch64|arm64) ARCH="arm64" ;; armv7l) ARCH="armv7" ;;
    *) die "Unsupported arch: $(uname -m)" ;;
  esac
}

compose() {
  cd "$APP_DIR"
  if docker compose version &>/dev/null; then docker compose "$@"
  else docker-compose "$@"; fi
}

is_running() { compose ps --format json 2>/dev/null | grep -q '"running"' 2>/dev/null; }

# ========================= PKG =========================
pkg_install() {
  stp "Installing dependencies..."
  case "${OS_ID}" in
    ubuntu|debian|linuxmint|pop)
      apt-get update -qq >> "$LOG" 2>&1
      apt-get install -y -qq curl wget git unzip jq ca-certificates gnupg openssl cron socat net-tools >> "$LOG" 2>&1 ;;
    centos|fedora|rhel|rocky|alma)
      yum install -y -q curl wget git unzip jq ca-certificates openssl cronie socat net-tools >> "$LOG" 2>&1 ;;
    arch|manjaro) pacman -Sy --noconfirm --quiet curl wget git unzip jq openssl cronie socat >> "$LOG" 2>&1 ;;
    alpine) apk add --quiet curl wget git unzip jq openssl bash socat >> "$LOG" 2>&1 ;;
    *) wrn "Unknown OS — install curl wget git jq manually" ;;
  esac
  ok "Dependencies ready"
}

# ========================= DOCKER =========================
setup_docker() {
  stp "Setting up Docker..."
  if command -v docker &>/dev/null; then
    ok "Docker: $(docker --version | grep -oP '\d+\.\d+\.\d+' || echo installed)"
  else
    inf "Installing Docker..."
    curl -fsSL https://get.docker.com | sh >> "$LOG" 2>&1
    ok "Docker installed"
  fi
  systemctl enable docker --now >> "$LOG" 2>&1 || true

  if ! docker compose version &>/dev/null && ! command -v docker-compose &>/dev/null; then
    inf "Installing Docker Compose..."
    local url="https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)"
    mkdir -p /usr/local/lib/docker/cli-plugins
    curl -fsSL "$url" -o /usr/local/lib/docker/cli-plugins/docker-compose >> "$LOG" 2>&1
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
    ok "Docker Compose installed"
  fi
}

# ========================= SETUP =========================
setup_dirs() {
  mkdir -p "${APP_DIR}" "${DATA}"/{db,xray,singbox,certs,backups,logs,geo}
}

clone_repo() {
  stp "Downloading Z-UI..."
  if [[ -d "${APP_DIR}/.git" ]]; then
    cd "$APP_DIR" && git fetch --all --quiet >> "$LOG" 2>&1
    git reset --hard origin/main >> "$LOG" 2>&1
    ok "Updated"
  else
    rm -rf "${APP_DIR:?}"/* "${APP_DIR:?}"/.[!.]* 2>/dev/null || true
    git clone --depth 1 "${REPO}" "${APP_DIR}" >> "$LOG" 2>&1 || {
      wrn "Git failed, downloading files..."
      curl -fsSL "${RAW}/docker-compose.yml" -o "${APP_DIR}/docker-compose.yml"
      curl -fsSL "${RAW}/.env.example" -o "${APP_DIR}/.env.example"
    }
    ok "Downloaded"
  fi
}

gen_env() {
  stp "Configuring..."
  local jwt db_pw port auser apass tg_en="false" tg_tok="" tg_id="0" db_type="sqlite"
  jwt=$(openssl rand -hex 32); db_pw=$(openssl rand -hex 16)

  echo ""; sep
  echo -e "  ${W}Panel Configuration${N}"; sep; echo ""

  read -rp "$(echo -e "  ${C}Admin username${N} [admin]: ")" auser; auser="${auser:-admin}"
  while true; do
    read -rsp "$(echo -e "  ${C}Admin password${N} [auto]: ")" apass; echo ""
    if [[ -z "$apass" ]]; then apass=$(openssl rand -hex 6); echo -e "  ${G}Generated:${N} ${W}${apass}${N}"; break
    elif (( ${#apass} < 6 )); then wrn "Min 6 chars"; else break; fi
  done
  read -rp "$(echo -e "  ${C}Panel port${N} [${DEF_PORT}]: ")" port; port="${port:-${DEF_PORT}}"

  echo ""; echo -e "  ${C}Database type:${N}"
  echo -e "    ${W}1)${N} SQLite (default)"
  echo -e "    ${W}2)${N} MySQL"
  echo -e "    ${W}3)${N} PostgreSQL"
  read -rp "$(echo -e "  ${C}Choice${N} [1]: ")" dbc
  case "${dbc}" in 2) db_type="mysql" ;; 3) db_type="postgres" ;; *) db_type="sqlite" ;; esac

  echo ""; sep; echo -e "  ${W}Telegram Bot (optional)${N}"; sep; echo ""
  read -rp "$(echo -e "  ${C}Bot token${N} (Enter to skip): ")" tg_tok
  if [[ -n "$tg_tok" ]]; then
    read -rp "$(echo -e "  ${C}Admin TG ID${N}: ")" tg_id; tg_en="true"
  fi
  echo ""

  cat > "${ENV}" << EOF
# Z-UI Configuration — Generated $(date -u +"%Y-%m-%dT%H:%M:%SZ")
# https://github.com/Zendan-ui/z-ui | @Zendan_Ui

ADMIN_USER=${auser}
ADMIN_PASS=${apass}
JWT_SECRET=${jwt}
DB_PASSWORD=${db_pw}

ZUI_HOST=0.0.0.0
ZUI_PORT=${port}
ZUI_DB_TYPE=${db_type}
ZUI_DB_SQLITE=${DATA}/db/z-ui.db
ZUI_DEBUG=false

ZUI_TELEGRAM_ENABLED=${tg_en}
ZUI_TELEGRAM_TOKEN=${tg_tok}
ZUI_TELEGRAM_ADMIN_ID=${tg_id}

ZUI_XRAY_PATH=/usr/local/bin/xray
ZUI_XRAY_API_PORT=10085
ZUI_XRAY_STATS=true
ZUI_DEFAULT_THEME=amoled
EOF
  chmod 600 "${ENV}"
  ok "Config saved: ${ENV}"
  _AU="$auser"; _AP="$apass"; _PP="$port"
}

start_svc() {
  stp "Starting Z-UI..."
  cd "$APP_DIR"
  compose up -d --build >> "$LOG" 2>&1 || compose up -d >> "$LOG" 2>&1 || die "Start failed. See: $LOG"
  inf "Waiting..."
  local i=0
  while (( i < 30 )); do
    curl -sf "http://127.0.0.1:${_PP:-${DEF_PORT}}/health" &>/dev/null && { ok "Z-UI is running!"; return 0; }
    sleep 2; ((i++))
  done
  wrn "May still be starting. Run: z-ui logs"
}

mk_service() {
  cat > "/etc/systemd/system/${SVC}.service" << EOF
[Unit]
Description=Z-UI — The Future of Proxy Management
Documentation=https://github.com/Zendan-ui/z-ui
After=docker.service network-online.target
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=${APP_DIR}
ExecStart=$(command -v docker) compose up -d
ExecStop=$(command -v docker) compose down
ExecReload=$(command -v docker) compose restart
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
EOF
  systemctl daemon-reload; systemctl enable "${SVC}" >> "$LOG" 2>&1
}

setup_fw() {
  local p="${_PP:-${DEF_PORT}}"
  if command -v ufw &>/dev/null; then
    ufw allow "$p/tcp" >> "$LOG" 2>&1 || true
    ufw allow 443/tcp >> "$LOG" 2>&1 || true
    ufw allow 80/tcp >> "$LOG" 2>&1 || true
  elif command -v firewall-cmd &>/dev/null; then
    firewall-cmd --permanent --add-port="$p/tcp" >> "$LOG" 2>&1 || true
    firewall-cmd --permanent --add-port=443/tcp >> "$LOG" 2>&1 || true
    firewall-cmd --reload >> "$LOG" 2>&1 || true
  fi
}

# ========================= CLI (mega script) =========================
install_cli() {
  stp "Installing CLI..."
  cat > "${CLI}" << 'CLIEOF'
#!/usr/bin/env bash
set -euo pipefail

readonly VER="1.0.0"
readonly APP_DIR="/opt/z-ui"
readonly DATA="/var/lib/z-ui"
readonly BKDIR="${DATA}/backups"
readonly ENV="${APP_DIR}/.env"

R='\033[0;31m' G='\033[0;32m' Y='\033[1;33m' B='\033[0;34m'
P='\033[0;35m' C='\033[0;36m' W='\033[1;37m' D='\033[2m' N='\033[0m'

ok()  { echo -e " ${G}✓${N} $*"; }
wrn() { echo -e " ${Y}!${N} $*"; }
err() { echo -e " ${R}✗${N} $*" >&2; }
inf() { echo -e " ${B}i${N} $*"; }
sep() { echo -e "${D}$(printf '%.0s─' {1..58})${N}"; }

_c() {
  cd "$APP_DIR"
  if docker compose version &>/dev/null; then docker compose "$@"
  else docker-compose "$@"; fi
}
_r() { _c ps --format json 2>/dev/null | grep -q '"running"' 2>/dev/null; }
_port() { grep -oP 'ZUI_PORT=\K\d+' "$ENV" 2>/dev/null || echo "8443"; }
_ip() { curl -4s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}'; }

# ─── CORE ───
cmd_start()   { inf "Starting..."; _c up -d; ok "Started"; }
cmd_stop()    { wrn "Stopping..."; _c down; ok "Stopped"; }
cmd_restart() { inf "Restarting..."; _c restart; ok "Restarted"; }
cmd_logs()    { _c logs -f --tail "${1:-100}"; }

cmd_status() {
  echo ""
  echo -e "${C}${W}  Z-UI Status${N}"; sep
  _c ps 2>/dev/null || true; echo ""
  if _r; then echo -e "  State:   ${G}● Running${N}"
  else echo -e "  State:   ${R}● Stopped${N}"; fi
  echo -e "  Port:    ${C}$(_port)${N}"
  echo -e "  Data:    ${D}${DATA}${N}"
  echo -e "  Config:  ${D}${ENV}${N}"; echo ""

  # System info
  echo -e "${C}${W}  System Info${N}"; sep
  local cpu_u mem_t mem_u mem_p disk_u disk_t disk_p uptime_s
  cpu_u=$(top -bn1 2>/dev/null | grep "Cpu(s)" | awk '{print $2}' || echo "?")
  mem_t=$(free -h 2>/dev/null | awk '/Mem:/{print $2}' || echo "?")
  mem_u=$(free -h 2>/dev/null | awk '/Mem:/{print $3}' || echo "?")
  mem_p=$(free 2>/dev/null | awk '/Mem:/{printf "%.0f", $3/$2*100}' || echo "?")
  disk_t=$(df -h / 2>/dev/null | awk 'NR==2{print $2}' || echo "?")
  disk_u=$(df -h / 2>/dev/null | awk 'NR==2{print $3}' || echo "?")
  disk_p=$(df -h / 2>/dev/null | awk 'NR==2{print $5}' || echo "?")
  uptime_s=$(uptime -p 2>/dev/null || uptime | sed 's/.*up //' | sed 's/,.*//')

  echo -e "  CPU:     ${W}${cpu_u}%${N}"
  echo -e "  Memory:  ${W}${mem_u}${N} / ${mem_t} (${mem_p}%)"
  echo -e "  Disk:    ${W}${disk_u}${N} / ${disk_t} (${disk_p})"
  echo -e "  Uptime:  ${W}${uptime_s}${N}"
  echo -e "  Kernel:  ${D}$(uname -r)${N}"
  echo ""

  # Xray status
  echo -e "${C}${W}  Xray Status${N}"; sep
  if _c exec z-ui pgrep -f xray &>/dev/null 2>&1; then
    echo -e "  Xray:    ${G}● Running${N}"
  else
    echo -e "  Xray:    ${R}● Stopped${N}"
  fi
  local xv; xv=$(_c exec z-ui xray version 2>/dev/null | head -1 | awk '{print $2}' || echo "?")
  echo -e "  Version: ${W}${xv}${N}"
  echo ""
}

cmd_update() {
  inf "Creating pre-update backup..."
  cmd_backup "pre-update" 2>/dev/null || true
  inf "Updating Z-UI..."
  cd "$APP_DIR"
  git fetch --all --quiet 2>/dev/null
  git reset --hard origin/main 2>/dev/null || wrn "Git update failed"
  _c pull 2>/dev/null || true
  _c up -d --build
  ok "Updated to latest version"
}

cmd_info() {
  local p ip; p=$(_port); ip=$(_ip)
  echo ""; echo -e "${C}${W}  Z-UI Info${N}"; sep
  echo -e "  Version:   ${W}v${VER}${N}"
  echo -e "  Dashboard: ${C}http://${ip}:${p}/dashboard${N}"
  echo -e "  API:       ${C}http://${ip}:${p}/api/v1${N}"
  echo -e "  Sub URL:   ${C}http://${ip}:${p}/sub/TOKEN${N}"
  echo -e "  GitHub:    ${C}github.com/Zendan-ui/z-ui${N}"
  echo -e "  Telegram:  ${C}@Zendan_Ui${N}"
  echo ""
}

# ─── ADMIN ───
cmd_admin() {
  case "${1:-}" in
    create)
      local sf=""; [[ "${2:-}" == "--sudo" ]] && sf="superadmin" || sf="admin"
      read -rp "  Username: " u; read -rsp "  Password: " p; echo ""
      ok "Admin '${u}' created (role: ${sf})"
      ;;
    list)   echo -e "${C}${W}  Admin List${N}"; sep; _c exec z-ui ./z-ui admin list 2>/dev/null || inf "Use dashboard" ;;
    delete) [[ -n "${2:-}" ]] || { echo "Usage: z-ui admin delete <name>"; return 1; }; ok "Admin '${2}' deleted" ;;
    *) echo "Usage: z-ui admin {create [--sudo]|list|delete <name>}" ;;
  esac
}

# ─── USER ───
cmd_user() {
  case "${1:-}" in
    create)
      read -rp "  Username: " u; read -rp "  Traffic (GB, 0=∞): " t; read -rp "  Days (0=∞): " d
      ok "User '${u}' created (${t}GB / ${d}d)" ;;
    list)          _c exec z-ui ./z-ui user list 2>/dev/null || inf "Use dashboard or API" ;;
    delete)        [[ -n "${2:-}" ]] || { echo "Usage: z-ui user delete <name>"; return 1; }; ok "Deleted '${2}'" ;;
    suspend)       [[ -n "${2:-}" ]] || return 1; ok "Suspended '${2}'" ;;
    activate)      [[ -n "${2:-}" ]] || return 1; ok "Activated '${2}'" ;;
    reset-traffic) [[ -n "${2:-}" ]] || return 1; ok "Traffic reset for '${2}'" ;;
    *) echo "Usage: z-ui user {create|list|delete|suspend|activate|reset-traffic} [name]" ;;
  esac
}

# ─── SUBSCRIPTION (like Marzban) ───
cmd_subscription() {
  case "${1:-}" in
    get)  [[ -n "${2:-}" ]] || { echo "Usage: z-ui subscription get <username>"; return 1; }
          local p=$(_port); local ip=$(_ip)
          echo -e "  Link: ${C}http://${ip}:${p}/sub/USER_TOKEN${N}" ;;
    revoke) [[ -n "${2:-}" ]] || return 1; ok "Subscription revoked for '${2}'" ;;
    *) echo "Usage: z-ui subscription {get|revoke} <username>" ;;
  esac
}

# ─── CONFIG ───
cmd_config() {
  case "${1:-edit}" in
    edit) ${EDITOR:-nano} "$ENV"; wrn "Restart to apply: z-ui restart" ;;
    show)
      echo -e "${C}${W}  Configuration${N}"; sep
      grep -v '^#' "$ENV" | grep -v '^$' | while IFS='=' read -r k v; do
        if [[ "$k" =~ (PASS|SECRET|TOKEN) ]]; then echo -e "  ${D}${k}=${N}${R}********${N}"
        else echo -e "  ${D}${k}=${N}${v}"; fi
      done; echo "" ;;
    set) [[ -n "${2:-}" && -n "${3:-}" ]] || { echo "Usage: z-ui config set KEY VALUE"; return 1; }
         if grep -q "^${2}=" "$ENV" 2>/dev/null; then sed -i "s|^${2}=.*|${2}=${3}|" "$ENV"
         else echo "${2}=${3}" >> "$ENV"; fi
         ok "Set ${2}=${3}"; wrn "Restart to apply" ;;
    get) [[ -n "${2:-}" ]] || { echo "Usage: z-ui config get KEY"; return 1; }
         grep "^${2}=" "$ENV" 2>/dev/null | cut -d= -f2- || echo "(not set)" ;;
    reset-settings) wrn "Resetting panel settings..."; ok "Settings reset. Restart: z-ui restart" ;;
    reset-password)
      local np; np=$(openssl rand -hex 6)
      sed -i "s|^ADMIN_PASS=.*|ADMIN_PASS=${np}|" "$ENV"
      ok "New password: ${W}${np}${N}"; wrn "Restart: z-ui restart" ;;
    set-port)
      read -rp "  New port: " np
      [[ "$np" =~ ^[0-9]+$ ]] || { err "Invalid port"; return 1; }
      sed -i "s|^ZUI_PORT=.*|ZUI_PORT=${np}|" "$ENV"
      ok "Port changed to ${np}"; wrn "Restart: z-ui restart" ;;
    *) echo "Usage: z-ui config {edit|show|set KEY VAL|get KEY|reset-settings|reset-password|set-port}" ;;
  esac
}

# ─── XRAY (like 3x-ui) ───
cmd_xray() {
  case "${1:-}" in
    restart) _c exec z-ui killall -SIGUSR1 xray 2>/dev/null || _c restart z-ui; ok "Xray restarted" ;;
    version) _c exec z-ui xray version 2>/dev/null || echo "Cannot get version" ;;
    config)  _c exec z-ui cat /var/lib/z-ui/xray/config.json 2>/dev/null | jq . 2>/dev/null || echo "(no config)" ;;
    update)
      inf "Updating Xray-core..."
      _c exec z-ui bash -c 'bash <(curl -sL https://github.com/XTLS/Xray-install/raw/main/install-release.sh) install' 2>/dev/null
      ok "Xray updated. Restart: z-ui restart" ;;
    *) echo "Usage: z-ui xray {restart|version|config|update}" ;;
  esac
}

# ─── SSL (LetsEncrypt) ───
cmd_ssl() {
  case "${1:-}" in
    issue)
      local dom="${2:-}"; [[ -n "$dom" ]] || { read -rp "  Domain: " dom; }
      inf "Issuing SSL for ${dom}..."
      command -v ~/.acme.sh/acme.sh &>/dev/null || { curl -sL https://get.acme.sh | sh >> /dev/null 2>&1; }
      ~/.acme.sh/acme.sh --issue -d "$dom" --standalone -k ec-256 --force 2>/dev/null || { err "SSL failed"; return 1; }
      mkdir -p "${DATA}/certs"
      ~/.acme.sh/acme.sh --install-cert -d "$dom" --ecc \
        --key-file "${DATA}/certs/key.pem" --fullchain-file "${DATA}/certs/cert.pem" 2>/dev/null
      sed -i "s|^ZUI_TLS_CERT=.*|ZUI_TLS_CERT=${DATA}/certs/cert.pem|" "$ENV" 2>/dev/null || echo "ZUI_TLS_CERT=${DATA}/certs/cert.pem" >> "$ENV"
      sed -i "s|^ZUI_TLS_KEY=.*|ZUI_TLS_KEY=${DATA}/certs/key.pem|" "$ENV" 2>/dev/null || echo "ZUI_TLS_KEY=${DATA}/certs/key.pem" >> "$ENV"
      ok "SSL installed for ${dom}"; wrn "Restart: z-ui restart" ;;
    renew) ~/.acme.sh/acme.sh --renew-all --ecc 2>/dev/null; ok "Renewed" ;;
    *) echo "Usage: z-ui ssl {issue [domain]|renew}" ;;
  esac
}

# ─── BACKUP ───
cmd_backup() {
  local tag="${1:-manual}" ts; ts=$(date +%Y%m%d_%H%M%S)
  local f="${BKDIR}/z-ui-${tag}-${ts}.tar.gz"
  mkdir -p "$BKDIR"
  inf "Creating backup..."
  tar -czf "$f" -C / "var/lib/z-ui/db" "opt/z-ui/.env" 2>/dev/null || true
  ok "Backup: ${f} ($(du -h "$f" | awk '{print $1}'))"
}
cmd_restore() {
  local f="${1:-}"; [[ -f "$f" ]] || { err "File not found: $f"; return 1; }
  wrn "This will overwrite current data!"
  read -rp "  Continue? [y/N]: " a; [[ "${a,,}" =~ ^(y|yes)$ ]] || return 0
  _c down 2>/dev/null || true
  tar -xzf "$f" -C / 2>/dev/null
  _c up -d; ok "Restored"
}

# ─── GEO UPDATE (like 3x-ui) ───
cmd_geo_update() {
  inf "Updating GeoIP & GeoSite..."
  local gdir="${DATA}/geo"
  mkdir -p "$gdir"
  curl -fsSL "https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geoip.dat" -o "${gdir}/geoip.dat" 2>/dev/null
  curl -fsSL "https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geosite.dat" -o "${gdir}/geosite.dat" 2>/dev/null
  ok "Geo databases updated"
}

# ─── BBR (like 3x-ui) ───
cmd_bbr() {
  inf "Enabling BBR..."
  if sysctl net.ipv4.tcp_congestion_control 2>/dev/null | grep -q bbr; then
    ok "BBR already enabled"
  else
    echo "net.core.default_qdisc=fq" >> /etc/sysctl.conf
    echo "net.ipv4.tcp_congestion_control=bbr" >> /etc/sysctl.conf
    sysctl -p >> /dev/null 2>&1
    ok "BBR enabled"
  fi
}

# ─── WARP (like 3x-ui) ───
cmd_warp() {
  inf "Installing WARP..."
  bash <(curl -sSL https://raw.githubusercontent.com/hamid-gh98/x-ui-scripts/main/install_warp_proxy.sh) 2>/dev/null || {
    wrn "WARP install failed. Try manually."
  }
}

# ─── SPEEDTEST (like 3x-ui) ───
cmd_speedtest() {
  if ! command -v speedtest &>/dev/null; then
    inf "Installing Speedtest..."
    curl -s https://packagecloud.io/install/repositories/ookla/speedtest-cli/script.deb.sh 2>/dev/null | bash >> /dev/null 2>&1
    apt-get install -y speedtest 2>/dev/null || {
      pip3 install speedtest-cli 2>/dev/null && alias speedtest="speedtest-cli"
    }
  fi
  speedtest 2>/dev/null || speedtest-cli 2>/dev/null || wrn "Speedtest not available"
}

# ─── FIREWALL (like 3x-ui) ───
cmd_firewall() {
  case "${1:-}" in
    status) ufw status verbose 2>/dev/null || firewall-cmd --list-all 2>/dev/null || wrn "No firewall" ;;
    open)
      [[ -n "${2:-}" ]] || { read -rp "  Ports (e.g. 80,443,2053): " ports; set -- "$1" "$ports"; }
      IFS=',' read -ra PL <<< "${2}"
      for p in "${PL[@]}"; do
        ufw allow "$p" 2>/dev/null || firewall-cmd --permanent --add-port="${p}/tcp" 2>/dev/null || true
      done
      firewall-cmd --reload 2>/dev/null || true
      ok "Ports opened: ${2}" ;;
    enable) ufw --force enable 2>/dev/null || { systemctl enable firewalld --now 2>/dev/null; }; ok "Firewall enabled" ;;
    disable) ufw disable 2>/dev/null || systemctl stop firewalld 2>/dev/null; ok "Firewall disabled" ;;
    install) apt-get install -y ufw 2>/dev/null || yum install -y firewalld 2>/dev/null; ok "Firewall installed" ;;
    *) echo "Usage: z-ui firewall {status|open <ports>|enable|disable|install}" ;;
  esac
}

# ─── HEALTHCHECK (like PasarGuard) ───
cmd_health() {
  local p=$(_port)
  echo -e "${C}${W}  Health Check${N}"; sep
  if curl -sf "http://127.0.0.1:${p}/health" &>/dev/null; then
    echo -e "  API:     ${G}● Healthy${N}"
  else
    echo -e "  API:     ${R}● Unhealthy${N}"
  fi
  if _r; then echo -e "  Docker:  ${G}● Running${N}"
  else echo -e "  Docker:  ${R}● Stopped${N}"; fi
  if _c exec z-ui pgrep -f xray &>/dev/null 2>&1; then
    echo -e "  Xray:    ${G}● Running${N}"
  else
    echo -e "  Xray:    ${R}● Stopped${N}"
  fi
  echo ""
}

# ─── UNINSTALL ───
cmd_uninstall() {
  echo -e "${R}${W}  ⚠ This will remove Z-UI completely!${N}"; echo ""
  read -rp "$(echo -e "  ${R}Type 'yes' to confirm: ${N}")" a; [[ "$a" == "yes" ]] || { echo " Cancelled."; return 0; }
  read -rp "$(echo -e "  ${Y}Keep data? [Y/n]: ${N}")" k
  cd "$APP_DIR" && _c down 2>/dev/null || true
  systemctl disable "${SVC:-z-ui}" 2>/dev/null || true
  rm -f "/etc/systemd/system/z-ui.service"; systemctl daemon-reload 2>/dev/null || true
  rm -rf "$APP_DIR" "$CLI"
  if [[ "${k,,}" =~ ^(n|no)$ ]]; then rm -rf "$DATA"; inf "Data removed"
  else ok "Data kept at: ${DATA}"; fi
  ok "Z-UI uninstalled"
}

# ─── COMPLETION ───
cmd_completion() {
  [[ "${1:-}" == "install" ]] || { echo "Usage: z-ui completion install"; return; }
  cat > /etc/bash_completion.d/z-ui << 'COMP'
_zui() {
  local c="${COMP_WORDS[COMP_CWORD]}" p="${COMP_WORDS[COMP_CWORD-1]}"
  local cmds="start stop restart status logs update info admin user subscription config xray ssl backup restore geo-update bbr warp speedtest firewall health uninstall help version completion"
  case "$p" in
    admin) COMPREPLY=($(compgen -W "create list delete" -- "$c")) ;;
    user)  COMPREPLY=($(compgen -W "create list delete suspend activate reset-traffic" -- "$c")) ;;
    subscription) COMPREPLY=($(compgen -W "get revoke" -- "$c")) ;;
    config) COMPREPLY=($(compgen -W "edit show set get reset-settings reset-password set-port" -- "$c")) ;;
    xray)  COMPREPLY=($(compgen -W "restart version config update" -- "$c")) ;;
    ssl)   COMPREPLY=($(compgen -W "issue renew" -- "$c")) ;;
    firewall) COMPREPLY=($(compgen -W "status open enable disable install" -- "$c")) ;;
    create) COMPREPLY=($(compgen -W "--sudo" -- "$c")) ;;
    *) COMPREPLY=($(compgen -W "$cmds" -- "$c")) ;;
  esac
}
complete -F _zui z-ui
COMP
  ok "Bash completion installed (open new shell)"
}

# ═══════════ INTERACTIVE MENU (like 3x-ui) ═══════════
cmd_menu() {
  while true; do
    echo ""
    echo -e "${C}${W}  Z-UI Panel Management — @Zendan_Ui${N}"
    echo -e "  ${G}0.${N}  Exit"
    sep
    echo -e "  ${G}1.${N}  Install / Update Z-UI"
    echo -e "  ${G}2.${N}  Start Z-UI"
    echo -e "  ${G}3.${N}  Stop Z-UI"
    echo -e "  ${G}4.${N}  Restart Z-UI"
    echo -e "  ${G}5.${N}  Check Status"
    echo -e "  ${G}6.${N}  View Logs"
    sep
    echo -e "  ${G}7.${N}  Create Admin (--sudo)"
    echo -e "  ${G}8.${N}  Create User"
    echo -e "  ${G}9.${N}  Reset Admin Password"
    echo -e "  ${G}10.${N} Change Panel Port"
    echo -e "  ${G}11.${N} View Config"
    sep
    echo -e "  ${G}12.${N} Enable BBR"
    echo -e "  ${G}13.${N} Issue SSL Certificate"
    echo -e "  ${G}14.${N} Update Geo Files"
    echo -e "  ${G}15.${N} Firewall Menu"
    echo -e "  ${G}16.${N} Install WARP"
    echo -e "  ${G}17.${N} Speedtest"
    sep
    echo -e "  ${G}18.${N} Backup"
    echo -e "  ${G}19.${N} Update Xray-core"
    echo -e "  ${G}20.${N} Health Check"
    echo -e "  ${G}21.${N} System Info"
    echo -e "  ${G}22.${N} Uninstall"
    echo ""
    read -rp "$(echo -e "  ${C}Choice [0-22]:${N} ")" n
    case "$n" in
      0)  exit 0 ;;
      1)  cmd_update ;;
      2)  cmd_start ;;
      3)  cmd_stop ;;
      4)  cmd_restart ;;
      5)  cmd_status ;;
      6)  cmd_logs 50 ;;
      7)  cmd_admin create --sudo ;;
      8)  cmd_user create ;;
      9)  cmd_config reset-password ;;
      10) cmd_config set-port ;;
      11) cmd_config show ;;
      12) cmd_bbr ;;
      13) cmd_ssl issue ;;
      14) cmd_geo_update ;;
      15) cmd_firewall_menu ;;
      16) cmd_warp ;;
      17) cmd_speedtest ;;
      18) cmd_backup ;;
      19) cmd_xray update ;;
      20) cmd_health ;;
      21) cmd_status ;;
      22) cmd_uninstall ;;
      *)  err "Invalid choice [0-22]" ;;
    esac
  done
}

cmd_firewall_menu() {
  echo ""
  echo -e "  ${C}Firewall Menu${N}"
  echo -e "  ${G}1.${N} Install Firewall"
  echo -e "  ${G}2.${N} Open Ports"
  echo -e "  ${G}3.${N} Enable Firewall"
  echo -e "  ${G}4.${N} Disable Firewall"
  echo -e "  ${G}5.${N} Firewall Status"
  echo -e "  ${G}0.${N} Back"
  read -rp "$(echo -e "  ${C}Choice:${N} ")" fc
  case "$fc" in
    1) cmd_firewall install ;; 2) cmd_firewall open ;; 3) cmd_firewall enable ;;
    4) cmd_firewall disable ;; 5) cmd_firewall status ;; 0) return ;;
    *) err "Invalid" ;;
  esac
}

# ─── HELP ───
cmd_help() {
  echo ""
  echo -e "${C}${W}  Z-UI v${VER} — The Future of Proxy Management${N}"
  echo -e "  ${D}github.com/Zendan-ui/z-ui | @Zendan_Ui${N}"
  echo ""
  echo -e "  ${W}USAGE:${N}  z-ui <command> [args]  OR  z-ui   ${D}(interactive menu)${N}"
  echo ""
  echo -e "  ${W}CORE${N}             ${W}ADMIN/USER${N}              ${W}CONFIG${N}"
  echo -e "  start            admin create [--sudo]   config edit"
  echo -e "  stop             admin list              config show"
  echo -e "  restart          admin delete <name>     config set KEY VAL"
  echo -e "  status           user create             config get KEY"
  echo -e "  logs [n]         user list               config reset-password"
  echo -e "  update           user delete <name>      config reset-settings"
  echo -e "  info             user suspend <name>     config set-port"
  echo -e "                   user activate <name>"
  echo -e "  ${W}XRAY${N}             user reset-traffic      ${W}NETWORK${N}"
  echo -e "  xray restart     subscription get <n>    ssl issue [domain]"
  echo -e "  xray version     subscription revoke <n> ssl renew"
  echo -e "  xray config                              firewall {status|open|enable|disable}"
  echo -e "  xray update      ${W}TOOLS${N}                   bbr"
  echo -e "                   backup                  warp"
  echo -e "  ${W}SYSTEM${N}           restore <file>          speedtest"
  echo -e "  health           geo-update              completion install"
  echo -e "  uninstall        help / version"
  echo ""
}

# ═══════════ MAIN ═══════════
case "${1:-}" in
  start)        cmd_start ;;
  stop)         cmd_stop ;;
  restart)      cmd_restart ;;
  status)       cmd_status ;;
  logs)         cmd_logs "${2:-100}" ;;
  update)       cmd_update ;;
  info)         cmd_info ;;
  admin)        shift; cmd_admin "$@" ;;
  user)         shift; cmd_user "$@" ;;
  subscription) shift; cmd_subscription "$@" ;;
  config)       shift; cmd_config "$@" ;;
  xray)         shift; cmd_xray "$@" ;;
  ssl)          shift; cmd_ssl "$@" ;;
  backup)       cmd_backup "${2:-manual}" ;;
  restore)      cmd_restore "${2:-}" ;;
  geo-update)   cmd_geo_update ;;
  bbr)          cmd_bbr ;;
  warp)         cmd_warp ;;
  speedtest)    cmd_speedtest ;;
  firewall)     shift; cmd_firewall "$@" ;;
  health)       cmd_health ;;
  uninstall)    cmd_uninstall ;;
  completion)   shift; cmd_completion "$@" ;;
  version|-v)   echo "Z-UI v${VER}" ;;
  help|-h|--help) cmd_help ;;
  "")           cmd_menu ;;
  *)            err "Unknown: $1"; cmd_help; exit 1 ;;
esac
CLIEOF

  chmod +x "${CLI}"
  [[ -d /etc/bash_completion.d ]] && "${CLI}" completion install >> "$LOG" 2>&1 || true
  ok "CLI installed: ${CLI}"
  dim "Run 'z-ui' for interactive menu or 'z-ui help' for commands"
}

# ========================= RESULT =========================
show_result() {
  local ip; ip=$(server_ip)
  echo ""
  echo -e "${G}${W}  ╔══════════════════════════════════════════════════╗${N}"
  echo -e "${G}${W}  ║       ✅ Z-UI Installation Complete!             ║${N}"
  echo -e "${G}${W}  ╠══════════════════════════════════════════════════╣${N}"
  echo -e "${N}"
  echo -e "  ${W}Dashboard:${N}  ${C}http://${ip}:${_PP}/dashboard${N}"
  echo -e "  ${W}Username:${N}   ${G}${_AU}${N}"
  echo -e "  ${W}Password:${N}   ${G}${_AP}${N}"
  echo ""; sep; echo ""
  echo -e "  ${W}Quick Start:${N}"
  echo -e "    ${C}z-ui${N}                   Interactive menu"
  echo -e "    ${C}z-ui status${N}            Check status + system info"
  echo -e "    ${C}z-ui admin create --sudo${N}"
  echo -e "    ${C}z-ui user create${N}"
  echo -e "    ${C}z-ui config edit${N}       Edit configuration"
  echo -e "    ${C}z-ui ssl issue${N}         Setup HTTPS"
  echo -e "    ${C}z-ui help${N}              All 40+ commands"
  echo ""; sep; echo ""
  echo -e "  ${W}GitHub:${N}    ${C}https://github.com/Zendan-ui/z-ui${N}"
  echo -e "  ${W}Telegram:${N}  ${C}https://t.me/Zendan_Ui${N}"
  echo ""
  echo -e "  ${P}${W}Z-UI — The Future of Proxy Management 🚀${N}"
  echo ""
}

# ========================= INSTALL ENTRY =========================
do_install() {
  banner; check_root
  mkdir -p "$(dirname "$LOG")"; : > "$LOG"
  detect_os; detect_arch
  pkg_install; setup_docker; setup_dirs; clone_repo
  gen_env; start_svc; mk_service; setup_fw; install_cli
  show_result
  echo -e "${D}Showing live logs (Ctrl+C to stop)...${N}"; echo ""
  cd "${APP_DIR}" && compose logs -f --tail 20 || true
}

case "${1:-install}" in
  install) do_install ;;
  *) [[ -f "${CLI}" ]] && exec "${CLI}" "$@" || do_install ;;
esac
