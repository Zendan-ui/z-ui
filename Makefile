.PHONY: all build backend frontend docker clean dev docker-up docker-down docker-logs setup

BUILD_TAGS := with_quic,with_grpc,with_utls,with_acme,with_gvisor,with_naive_outbound,with_purego,with_tailscale

all: build

build: backend
	@echo "✅ Z-UI build complete"

frontend:
	@echo "🔨 Building frontend..."
	cd frontend && npm ci && npm run build
	@echo "✅ Frontend built: frontend/dist"

backend: frontend
	@echo "🔨 Preparing embedded web assets for backend..."
	mkdir -p backend/web/html
	rm -rf backend/web/html/*
	cp -R frontend/dist/* backend/web/html/
	@echo "🔨 Building backend..."
	cd backend && go mod download && go build -ldflags="-w -s" -tags "$(BUILD_TAGS)" -o ../bin/z-ui ./main.go
	@echo "✅ Backend built: bin/z-ui"

dev:
	@echo "🚀 Starting frontend dev server..."
	cd frontend && npm run dev

setup:
	cd frontend && npm ci
	cd backend && go mod download
	@echo "✅ Dependencies installed"

docker:
	docker compose -f docker-compose.dev.yml build

docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

clean:
	rm -rf bin frontend/dist backend/web/html/*
	@echo "🧹 Cleaned"
