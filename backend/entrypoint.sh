#!/bin/sh
set -e

DB_DIR="${ZUI_DB_FOLDER:-/app/db}"
DB_PATH="${DB_DIR}/z-ui.db"
BIN="./z-ui"

mkdir -p "$DB_DIR"
[ -f "$DB_PATH" ] && "$BIN" migrate || true

exec "$BIN"
