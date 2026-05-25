# ╔══════════════════════════════════════════════════════════╗
# ║  Z-UI Dockerfile — Multi-stage, Multi-arch              ║
# ║  github.com/Zendan-ui/z-ui | @Zendan_Ui                 ║
# ╚══════════════════════════════════════════════════════════╝

# ==================== Build Backend ====================
FROM golang:1.22-alpine AS backend-builder

# Minimal dependencies: only git needed for go mod download
# Pure static binary (CGO_ENABLED=0) eliminates need for gcc/musl-dev
RUN apk add --no-cache git

WORKDIR /build

# Copy go.mod first (go.sum may or may not exist yet)
COPY backend/go.mod ./
# Generate go.sum if missing, then download deps
RUN go mod download 2>/dev/null || go mod tidy && go mod download

COPY backend/ .

# Build pure static binary with CGO_ENABLED=0
# This eliminates dependency on gcc/musl-dev/libc-dev
# Solves I/O errors on resource-constrained environments
ARG TARGETARCH=amd64
RUN CGO_ENABLED=0 GOOS=linux GOARCH=${TARGETARCH} \
    go build -ldflags="-s -w -X main.Version=1.0.0" \
    -o z-ui ./cmd/server

# ==================== Build Frontend ====================
FROM node:20-alpine AS frontend-builder

WORKDIR /build

COPY frontend/package.json ./
# If package-lock.json exists, copy it too
COPY frontend/package-lock.json* ./

# Use npm install instead of npm ci
# npm ci requires an exactly-synced package-lock.json which may
# not exist or may be out of sync in fresh clones
RUN npm install --legacy-peer-deps

COPY frontend/ .

# Build static export (not standalone, since we serve from Go)
RUN npm run build

# ==================== Final Image ====================
FROM alpine:3.20

LABEL maintainer="Z-UI Team <@Zendan_Ui>"
LABEL org.opencontainers.image.title="Z-UI"
LABEL org.opencontainers.image.description="The Future of Proxy Management"
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.url="https://github.com/Zendan-ui/z-ui"
LABEL org.opencontainers.image.source="https://github.com/Zendan-ui/z-ui"

RUN apk add --no-cache \
    ca-certificates \
    curl \
    wget \
    unzip \
    tzdata \
    bash \
    jq \
    iptables \
    ip6tables \
    libgcc \
    libstdc++

# Auto-detect architecture for Xray download
ARG TARGETARCH=amd64
RUN set -ex && \
    XRAY_VERSION=$(curl -s https://api.github.com/repos/XTLS/Xray-core/releases/latest | jq -r .tag_name) && \
    case "${TARGETARCH}" in \
      amd64) XRAY_ARCH="64" ;; \
      arm64) XRAY_ARCH="arm64-v8a" ;; \
      arm)   XRAY_ARCH="arm32-v7a" ;; \
      *)     XRAY_ARCH="64" ;; \
    esac && \
    wget -qO /tmp/xray.zip "https://github.com/XTLS/Xray-core/releases/download/${XRAY_VERSION}/Xray-linux-${XRAY_ARCH}.zip" && \
    unzip -o /tmp/xray.zip -d /usr/local/bin/ xray geoip.dat geosite.dat && \
    chmod +x /usr/local/bin/xray && \
    rm -f /tmp/xray.zip

# Auto-detect architecture for Sing-box download
RUN set -ex && \
    SINGBOX_VERSION=$(curl -s https://api.github.com/repos/SagerNet/sing-box/releases/latest | jq -r .tag_name | sed 's/v//') && \
    case "${TARGETARCH}" in \
      amd64) SB_ARCH="amd64" ;; \
      arm64) SB_ARCH="arm64" ;; \
      arm)   SB_ARCH="armv7" ;; \
      *)     SB_ARCH="amd64" ;; \
    esac && \
    wget -qO /tmp/singbox.tar.gz "https://github.com/SagerNet/sing-box/releases/download/v${SINGBOX_VERSION}/sing-box-${SINGBOX_VERSION}-linux-${SB_ARCH}.tar.gz" && \
    tar -xzf /tmp/singbox.tar.gz -C /tmp/ && \
    mv /tmp/sing-box-*/sing-box /usr/local/bin/ && \
    chmod +x /usr/local/bin/sing-box && \
    rm -rf /tmp/singbox* /tmp/sing-box*

# Download GeoIP and GeoSite databases
RUN mkdir -p /usr/local/share/xray && \
    wget -qO /usr/local/share/xray/geoip.dat "https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geoip.dat" && \
    wget -qO /usr/local/share/xray/geosite.dat "https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geosite.dat"

WORKDIR /app

# Copy backend binary
COPY --from=backend-builder /build/z-ui .

# Copy the static export from Next.js (not standalone)
# The Go server serves these files directly from ./frontend/out/
COPY --from=frontend-builder /build/out ./frontend/out/

# Create data directories
RUN mkdir -p /var/lib/z-ui/{db,xray,singbox,certs,backups,logs,geo}

# Copy configs and entrypoint
COPY configs/ ./configs/
COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Environment defaults
ENV ZUI_HOST=0.0.0.0 \
    ZUI_PORT=8443 \
    ZUI_DB_TYPE=sqlite \
    ZUI_DB_SQLITE=/var/lib/z-ui/db/z-ui.db \
    ZUI_XRAY_PATH=/usr/local/bin/xray \
    ZUI_SINGBOX_PATH=/usr/local/bin/sing-box \
    ZUI_XRAY_ASSETS=/usr/local/share/xray \
    ZUI_DEFAULT_THEME=amoled

EXPOSE 8443

VOLUME ["/var/lib/z-ui"]

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -sf http://127.0.0.1:${ZUI_PORT}/health || exit 1

ENTRYPOINT ["/entrypoint.sh"]
CMD ["./z-ui"]
