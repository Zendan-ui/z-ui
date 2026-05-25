FROM golang:1.24-alpine AS backend
RUN apk add --no-cache git gcc musl-dev
WORKDIR /src
COPY backend/ .
RUN go mod tidy && CGO_ENABLED=1 GOOS=linux \
    go build -tags "musl" -ldflags="-s -w" -o /z-ui ./cmd/server

FROM node:20-alpine AS frontend
WORKDIR /src
COPY frontend/package.json ./
RUN npm install --legacy-peer-deps 2>/dev/null || npm install
COPY frontend/ .
RUN npm run build

FROM alpine:3.20
RUN apk add --no-cache ca-certificates curl wget unzip bash jq iptables libgcc

RUN set -ex && \
    VER=$(curl -s https://api.github.com/repos/XTLS/Xray-core/releases/latest | jq -r .tag_name) && \
    wget -qO /tmp/x.zip "https://github.com/XTLS/Xray-core/releases/download/${VER}/Xray-linux-64.zip" && \
    unzip -o /tmp/x.zip -d /usr/local/bin/ xray geoip.dat geosite.dat 2>/dev/null; \
    chmod +x /usr/local/bin/xray 2>/dev/null; rm -f /tmp/x.zip

RUN set -ex && \
    VER=$(curl -s https://api.github.com/repos/SagerNet/sing-box/releases/latest | jq -r .tag_name | sed 's/v//') && \
    wget -qO /tmp/sb.tar.gz "https://github.com/SagerNet/sing-box/releases/download/v${VER}/sing-box-${VER}-linux-amd64.tar.gz" && \
    tar -xzf /tmp/sb.tar.gz -C /tmp/ && mv /tmp/sing-box-*/sing-box /usr/local/bin/ 2>/dev/null; \
    chmod +x /usr/local/bin/sing-box 2>/dev/null; rm -rf /tmp/sb* /tmp/sing-box*

RUN mkdir -p /usr/local/share/xray && \
    wget -qO /usr/local/share/xray/geoip.dat "https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geoip.dat" 2>/dev/null; \
    wget -qO /usr/local/share/xray/geosite.dat "https://github.com/Loyalsoldier/v2ray-rules-dat/releases/latest/download/geosite.dat" 2>/dev/null; true

WORKDIR /app
COPY --from=backend /z-ui .
COPY --from=frontend /src/out ./frontend/out/
COPY configs/ ./configs/
COPY scripts/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh && mkdir -p /var/lib/z-ui/{db,xray,singbox,certs,backups,logs,geo}

ENV ZUI_HOST=0.0.0.0 ZUI_PORT=8443 ZUI_DB_TYPE=sqlite \
    ZUI_DB_SQLITE=/var/lib/z-ui/db/z-ui.db \
    ZUI_XRAY_PATH=/usr/local/bin/xray \
    ZUI_XRAY_CONFIG=/var/lib/z-ui/xray/config.json \
    ZUI_XRAY_ASSETS=/usr/local/share/xray \
    ZUI_XRAY_API_PORT=10085 ZUI_DEFAULT_THEME=amoled

EXPOSE 8443
VOLUME ["/var/lib/z-ui"]
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s CMD curl -sf http://127.0.0.1:${ZUI_PORT}/health || exit 1
ENTRYPOINT ["/entrypoint.sh"]
CMD ["./z-ui"]
