#!/bin/sh
set -e

DB_DIR="${ZUI_DB_FOLDER:-/app/db}"
DB_PATH="${DB_DIR}/z-ui.db"
BIN="./z-ui"

mkdir -p "$DB_DIR"

# Bootstrap admin/settings from environment before app starts.
if [ -n "${ZUI_ADMIN_USER:-}" ] && [ -n "${ZUI_ADMIN_PASS:-}" ]; then
  "$BIN" admin -username "$ZUI_ADMIN_USER" -password "$ZUI_ADMIN_PASS" >/dev/null 2>&1 || true
fi

SETTING_ARGS=""
if [ -n "${ZUI_PANEL_PORT:-}" ]; then
  SETTING_ARGS="$SETTING_ARGS -port $ZUI_PANEL_PORT"
fi
if [ -n "${ZUI_PANEL_PATH:-}" ]; then
  SETTING_ARGS="$SETTING_ARGS -path $ZUI_PANEL_PATH"
fi
if [ -n "${ZUI_SUB_PORT:-}" ]; then
  SETTING_ARGS="$SETTING_ARGS -subPort $ZUI_SUB_PORT"
fi
if [ -n "${ZUI_SUB_PATH:-}" ]; then
  SETTING_ARGS="$SETTING_ARGS -subPath $ZUI_SUB_PATH"
fi
if [ -n "$SETTING_ARGS" ]; then
  # shellcheck disable=SC2086
  "$BIN" setting $SETTING_ARGS >/dev/null 2>&1 || true
fi

[ -f "$DB_PATH" ] && "$BIN" migrate >/dev/null 2>&1 || true

exec "$BIN"
