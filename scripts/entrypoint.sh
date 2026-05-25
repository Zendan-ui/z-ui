#!/usr/bin/env bash
set -e

echo ""
echo "  Z-UI v1.0.0 — Starting..."
echo "  github.com/Zendan-ui/z-ui | @Zendan_Ui"
echo ""

# ──── Create all required directories ────
mkdir -p /var/lib/z-ui/{db,xray,singbox,certs,backups,logs,geo}

# ──── If .env exists in /opt/z-ui but not in workdir, link it ────
if [ -f /opt/z-ui/.env ] && [ ! -f /app/.env ]; then
  ln -sf /opt/z-ui/.env /app/.env 2>/dev/null || true
fi

# ──── Xray config: if not exists, create default ────
if [ ! -f /var/lib/z-ui/xray/config.json ] && [ ! -f /var/lib/z-ui/xray/xray_config.json ]; then
  echo '[INFO] Creating default Xray config...'
  cat > /var/lib/z-ui/xray/config.json << 'XEOF'
{
  "log":{"loglevel":"warning"},
  "api":{"tag":"api","services":["HandlerService","LoggerService","StatsService"]},
  "stats":{},
  "policy":{"levels":{"0":{"statsUserUplink":true,"statsUserDownlink":true}},"system":{"statsInboundUplink":true,"statsInboundDownlink":true}},
  "inbounds":[{"tag":"api","listen":"127.0.0.1","port":10085,"protocol":"dokodemo-door","settings":{"address":"127.0.0.1"}}],
  "outbounds":[{"tag":"direct","protocol":"freedom"},{"tag":"blocked","protocol":"blackhole","settings":{"response":{"type":"http"}}}],
  "routing":{"rules":[{"type":"field","inboundTag":["api"],"outboundTag":"api"},{"type":"field","protocol":["bittorrent"],"outboundTag":"blocked"}]}
}
XEOF
fi

# ──── SQLite: ensure DB directory is writable ────
DB_PATH="${ZUI_DB_SQLITE:-/var/lib/z-ui/db/z-ui.db}"
DB_DIR=$(dirname "$DB_PATH")
mkdir -p "$DB_DIR"
touch "$DB_PATH" 2>/dev/null || true

# ──── Xray check ────
if [ -f /usr/local/bin/xray ]; then
  echo "[INFO] Xray: $(/usr/local/bin/xray version 2>/dev/null | head -1 | awk '{print $2}' || echo 'installed')"
fi

# ──── Sing-box check ────
if [ -f /usr/local/bin/sing-box ]; then
  echo "[INFO] Sing-box: $(/usr/local/bin/sing-box version 2>/dev/null | head -1 | awk '{print $3}' || echo 'installed')"
fi

# ──── GeoIP check ────
for f in /usr/local/share/xray/geoip.dat /var/lib/z-ui/geo/geoip.dat; do
  [ -f "$f" ] && echo "[INFO] GeoIP: $f" && break
done

echo "[INFO] DB: $DB_PATH"
echo "[INFO] Port: ${ZUI_PORT:-8443}"
echo "[INFO] Starting Z-UI..."
echo ""

exec "$@"
