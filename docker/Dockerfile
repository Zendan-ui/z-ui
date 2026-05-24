# ==================== Build Backend ====================
FROM golang:1.22-alpine AS backend-builder

RUN apk add --no-cache git gcc musl-dev

WORKDIR /build
COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ .
RUN CGO_ENABLED=1 GOOS=linux go build -ldflags="-s -w" -o z-ui ./cmd/server

# ==================== Build Frontend ====================
FROM node:20-alpine AS frontend-builder

WORKDIR /build
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci

COPY frontend/ .
RUN npm run build

# ==================== Final Image ====================
FROM alpine:3.19

LABEL maintainer="Z-UI Team"
LABEL org.opencontainers.image.title="Z-UI"
LABEL org.opencontainers.image.description="The Future of Proxy Management"
LABEL org.opencontainers.image.version="1.0.0"

RUN apk add --no-cache \
    ca-certificates \
    curl \
    wget \
    unzip \
    tzdata \
    bash \
    jq \
    iptables \
    ip6tables

# Install Xray-core
RUN XRAY_VERSION=$(curl -s https://api.github.com/repos/XTLS/Xray-core/releases/latest | jq -r .tag_name) && \
    wget -qO /tmp/xray.zip "https://github.com/XTLS/Xray-core/releases/download/${XRAY_VERSION}/Xray-linux-64.zip" && \
    unzip /tmp/xray.zip -d /usr/local/bin/ && \
    chmod +x /usr/local/bin/xray && \
    rm /tmp/xray.zip

# Install Sing-box
RUN SINGBOX_VERSION=$(curl -s https://api.github.com/repos/SagerNet/sing-box/releases/latest | jq -r .tag_name | sed 's/v//') && \
    wget -qO /tmp/singbox.tar.gz "https://github.com/SagerNet/sing-box/releases/download/v${SINGBOX_VERSION}/sing-box-${SINGBOX_VERSION}-linux-amd64.tar.gz" && \
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

# Copy frontend
COPY --from=frontend-builder /build/.next/standalone ./frontend/
COPY --from=frontend-builder /build/out ./frontend/out/

# Create data directories
RUN mkdir -p data/logs data/backups data/xray data/singbox data/geo data/certs

# Copy configs
COPY configs/ ./configs/
COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Environment
ENV ZUI_HOST=0.0.0.0
ENV ZUI_PORT=8443
ENV ZUI_DB_TYPE=sqlite
ENV ZUI_DB_SQLITE=./data/zui.db
ENV ZUI_XRAY_PATH=/usr/local/bin/xray
ENV ZUI_SINGBOX_PATH=/usr/local/bin/sing-box
ENV ZUI_XRAY_ASSETS=/usr/local/share/xray

EXPOSE 8443
VOLUME ["/app/data"]

ENTRYPOINT ["/entrypoint.sh"]
CMD ["./z-ui"]
