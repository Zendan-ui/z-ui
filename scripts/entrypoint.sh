#!/usr/bin/env bash
set -e

echo ""
echo "  ███████╗       ██╗   ██╗██╗"
echo "  ╚══███╔╝       ██║   ██║██║"
echo "    ███╔╝ █████╗ ██║   ██║██║"
echo "   ███╔╝  ╚════╝ ██║   ██║██║"
echo "  ███████╗        ╚██████╔╝██║"
echo "  ╚══════╝         ╚═════╝ ╚═╝  v${VERSION:-1.0.0}"
echo ""
echo "  The Future of Proxy Management"
echo "  github.com/Zendan-ui/z-ui | @Zendan_Ui"
echo ""

# Create dirs
mkdir -p /var/lib/z-ui/{db,xray,singbox,certs,backups,logs,geo}

# Xray version
if [ -f /usr/local/bin/xray ]; then
  echo "[INFO] Xray: $(/usr/local/bin/xray version 2>/dev/null | head -1 | awk '{print $2}' || echo 'unknown')"
fi

# Sing-box version
if [ -f /usr/local/bin/sing-box ]; then
  echo "[INFO] Sing-box: $(/usr/local/bin/sing-box version 2>/dev/null | head -1 | awk '{print $3}' || echo 'unknown')"
fi

# GeoIP
[ -f /usr/local/share/xray/geoip.dat ] && echo "[INFO] GeoIP database: OK"

# Wait for PostgreSQL
if [ "${ZUI_DB_TYPE}" = "postgres" ]; then
  echo "[INFO] Waiting for PostgreSQL..."
  until pg_isready -h "${ZUI_DB_HOST}" -p "${ZUI_DB_PORT:-5432}" -U "${ZUI_DB_USER}" 2>/dev/null; do
    sleep 1
  done
  echo "[INFO] PostgreSQL ready"
fi

echo "[INFO] Starting Z-UI..."
exec "$@"
