.PHONY: help dev run build clean test docker-build docker-run docker-compose-up docker-compose-down

# Configurações
APP_NAME=evolution-router
MAIN_PATH=cmd/router/main.go
BUILD_DIR=build
GO=go

##@ Ajuda

help: ## Exibe esta mensagem de ajuda
	@echo "Evolution Router - Makefile"
	@awk 'BEGIN {FS = ":.*##"; printf "\nUso:\n  make <target>\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  %-15s %s\n", $$1, $$2 } /^##@/ { printf "\n%s\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Desenvolvimento

dev: ## Roda em modo desenvolvimento
	$(GO) run $(MAIN_PATH)

run: ## Roda em modo produção
	$(GO) run $(MAIN_PATH)

##@ Build

build: ## Compila a aplicação
	@mkdir -p $(BUILD_DIR)
	$(GO) build -o $(BUILD_DIR)/$(APP_NAME) $(MAIN_PATH)

deps: ## Baixa dependências
	$(GO) mod download
	$(GO) mod tidy

##@ Testes

test: ## Roda testes
	$(GO) test -v ./...

##@ Docker

docker-build: ## Build da imagem Docker
	docker build -t $(APP_NAME):latest .

docker-run: docker-build ## Roda container
	docker run -p 3000:3000 --env-file .env $(APP_NAME):latest

docker-compose-up: ## Sobe todos os serviços
	docker-compose up -d

docker-compose-down: ## Para todos os serviços
	docker-compose down

docker-compose-full: ## Sobe Evolution API + Router
	docker-compose -f docker-compose.full.yml up -d

docker-logs: ## Exibe logs
	docker-compose logs -f

##@ Limpeza

clean: ## Remove arquivos de build
	rm -rf $(BUILD_DIR)
	$(GO) clean
