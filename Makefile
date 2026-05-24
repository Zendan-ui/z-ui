.PHONY: all build backend frontend docker clean dev test

VERSION := 1.0.0
BUILD_TIME := $(shell date -u +%Y-%m-%dT%H:%M:%SZ)
GIT_COMMIT := $(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")
LDFLAGS := -s -w -X main.Version=$(VERSION) -X main.BuildTime=$(BUILD_TIME) -X main.GitCommit=$(GIT_COMMIT)

all: build

# Build everything
build: backend frontend
	@echo "✅ Build complete"

# Build backend
backend:
	@echo "🔨 Building backend..."
	cd backend && CGO_ENABLED=1 go build -ldflags="$(LDFLAGS)" -o ../bin/z-ui ./cmd/server
	@echo "✅ Backend built: bin/z-ui"

# Build frontend
frontend:
	@echo "🔨 Building frontend..."
	cd frontend && npm ci && npm run build
	@echo "✅ Frontend built"

# Development mode
dev:
	@echo "🚀 Starting development mode..."
	@make -j2 dev-backend dev-frontend

dev-backend:
	cd backend && go run ./cmd/server

dev-frontend:
	cd frontend && npm run dev

# Docker
docker:
	@echo "🐳 Building Docker image..."
	docker compose build
	@echo "✅ Docker image built"

docker-up:
	docker compose up -d
	@echo "✅ Z-UI is running"

docker-down:
	docker compose down

docker-logs:
	docker compose logs -f

# Testing
test:
	cd backend && go test -v ./...

test-coverage:
	cd backend && go test -coverprofile=coverage.out ./...
	cd backend && go tool cover -html=coverage.out -o coverage.html

# Linting
lint:
	cd backend && golangci-lint run
	cd frontend && npm run lint

# Clean
clean:
	rm -rf bin/ frontend/.next frontend/out
	@echo "🧹 Cleaned"

# Install development dependencies
setup:
	cd backend && go mod download
	cd frontend && npm install
	@echo "✅ Dependencies installed"

# Generate API documentation
docs:
	@echo "📚 Generating API docs..."
	cd backend && swag init -g cmd/server/main.go -o docs/swagger

# Database migration
migrate:
	cd backend && go run ./cmd/server migrate

# Create backup
backup:
	mkdir -p backups
	tar -czf backups/zui-backup-$(shell date +%Y%m%d_%H%M%S).tar.gz data/ configs/
	@echo "💾 Backup created"

help:
	@echo "Z-UI — The Future of Proxy Management"
	@echo ""
	@echo "Usage:"
	@echo "  make build        Build backend and frontend"
	@echo "  make backend      Build backend only"
	@echo "  make frontend     Build frontend only"
	@echo "  make dev          Start development mode"
	@echo "  make docker       Build Docker image"
	@echo "  make docker-up    Start with Docker Compose"
	@echo "  make docker-down  Stop Docker Compose"
	@echo "  make test         Run tests"
	@echo "  make lint         Run linters"
	@echo "  make clean        Clean build artifacts"
	@echo "  make setup        Install dependencies"
	@echo "  make backup       Create backup"
