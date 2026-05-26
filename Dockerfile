FROM --platform=$BUILDPLATFORM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM --platform=$BUILDPLATFORM golang:1.26-alpine AS backend-builder
WORKDIR /app/backend
ARG TARGETARCH
ARG TARGETVARIANT
ENV CGO_ENABLED=1
ENV CGO_CFLAGS="-D_LARGEFILE64_SOURCE"
ENV GOARCH=$TARGETARCH
ENV CC=gcc

RUN apk add --no-cache \
    gcc \
    musl-dev \
    libc-dev \
    make \
    git \
    wget \
    unzip \
    bash \
    curl

RUN CRONET_ARCH="${TARGETARCH}" && \
    CRONET_URL="https://github.com/SagerNet/cronet-go/releases/latest/download/libcronet-linux-${CRONET_ARCH}.so" && \
    echo "Downloading ${CRONET_URL}" && \
    wget -q -O /app/libcronet.so "${CRONET_URL}" && \
    chmod 755 /app/libcronet.so

COPY backend/go.mod backend/go.sum ./
RUN go mod download
COPY backend/ ./
COPY --from=frontend-builder /app/frontend/dist/ /app/backend/web/html/

RUN if [ "$TARGETARCH" = "arm" ]; then export GOARM=7; [ "$TARGETVARIANT" = "v6" ] && export GOARM=6; fi; \
    go build -ldflags="-w -s" \
    -tags "with_quic,with_grpc,with_utls,with_acme,with_gvisor,with_naive_outbound,with_purego,with_tailscale" \
    -o /app/z-ui ./main.go

FROM alpine:3.20
LABEL org.opencontainers.image.title="Z-UI"
LABEL org.opencontainers.image.description="Z-UI runtime image"
WORKDIR /app
ENV TZ=Asia/Tehran \
    ZUI_DB_FOLDER=/app/db
RUN apk add --no-cache --upgrade bash tzdata ca-certificates nftables curl
COPY --from=backend-builder /app/z-ui /app/libcronet.so /app/
COPY backend/entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh && mkdir -p /app/db /app/cert
EXPOSE 2095 2096
VOLUME ["/app/db", "/app/cert"]
ENTRYPOINT ["./entrypoint.sh"]
