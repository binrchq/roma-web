.PHONY: help build build-prod build-test build-demo push push-prod push-test push-demo push-all docker-up docker-down docker-logs clean

# 变量定义
APP_NAME := roma-web
VERSION := $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")
IMAGE_REGISTRY := registry.cn-hongkong.aliyuncs.com/binrc
IMAGE_NAME := $(IMAGE_REGISTRY)/roma-web
IMAGE_TAG := latest

# 构建参数
BUILD_MODE ?= production
NODE_ENV ?= production
VITE_API_BASE_URL ?=
VITE_ENV ?= $(BUILD_MODE)
VITE_DEMO ?=

# Docker 相关
DOCKER_COMPOSE := docker compose
DOCKER_COMPOSE_FILE := docker-compose.yml
DOCKER_COMPOSE_LOCAL := docker-compose.local.yml

# 默认目标
.DEFAULT_GOAL := help

##@ 帮助信息

help: ## 显示此帮助信息
	@echo "ROMA-WEB 项目 Makefile"
	@echo ""
	@echo "用法: make [target]"
	@echo ""
	@echo "可用目标:"
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

##@ Docker 构建

build: ## 构建 Docker 镜像（默认 production 模式）
	@echo "🔨 构建 Docker 镜像..."
	@docker build \
		--build-arg BUILD_MODE=$(BUILD_MODE) \
		--build-arg NODE_ENV=$(NODE_ENV) \
		--build-arg VITE_API_BASE_URL=$(VITE_API_BASE_URL) \
		--build-arg VITE_ENV=$(VITE_ENV) \
		--build-arg VITE_DEMO=$(VITE_DEMO) \
		-t $(IMAGE_NAME):$(IMAGE_TAG) \
		-t $(IMAGE_NAME):$(VERSION) \
		.
	@echo "✅ 镜像构建完成: $(IMAGE_NAME):$(IMAGE_TAG)"

build-prod: BUILD_MODE=prod
build-prod: VITE_ENV=production
build-prod: build ## 构建生产环境镜像

build-test: BUILD_MODE=test
build-test: VITE_ENV=test
build-test: build ## 构建测试环境镜像

build-demo: BUILD_MODE=demo
build-demo: VITE_ENV=demo
build-demo: VITE_DEMO=true
build-demo: build ## 构建演示环境镜像

##@ Docker 推送

push: ## 推送 Docker 镜像到仓库
	@echo "📤 推送镜像到仓库..."
	@docker push $(IMAGE_NAME):$(IMAGE_TAG)
	@docker push $(IMAGE_NAME):$(VERSION)
	@echo "✅ 镜像推送完成"

push-prod: build-prod push ## 构建并推送生产环境镜像

push-test: build-test push ## 构建并推送测试环境镜像

push-demo: build-demo push ## 构建并推送演示环境镜像

push-all: push-prod push-test push-demo ## 构建并推送所有环境镜像

##@ Docker Compose

docker-up: ## 启动 Docker Compose 服务
	@echo "🚀 启动 Docker Compose 服务..."
	@$(DOCKER_COMPOSE) up -d
	@echo "✅ 服务已启动"

docker-up-local: ## 启动本地 Docker Compose 服务
	@echo "🚀 启动本地 Docker Compose 服务..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_LOCAL) up -d --build
	@echo "✅ 服务已启动"

docker-down: ## 停止 Docker Compose 服务
	@echo "🛑 停止 Docker Compose 服务..."
	@$(DOCKER_COMPOSE) down
	@echo "✅ 服务已停止"

docker-down-local: ## 停止本地 Docker Compose 服务
	@echo "🛑 停止本地 Docker Compose 服务..."
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_LOCAL) down
	@echo "✅ 服务已停止"

docker-logs: ## 查看 Docker Compose 日志
	@$(DOCKER_COMPOSE) logs -f

docker-logs-local: ## 查看本地 Docker Compose 日志
	@$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_LOCAL) logs -f

docker-restart: docker-down docker-up ## 重启 Docker Compose 服务

##@ 清理

clean: ## 清理本地构建的镜像
	@echo "🧹 清理本地镜像..."
	@-docker rmi $(IMAGE_NAME):$(IMAGE_TAG) 2>/dev/null || true
	@-docker rmi $(IMAGE_NAME):$(VERSION) 2>/dev/null || true
	@echo "✅ 清理完成"

clean-all: clean ## 清理所有（包括停止的容器）
	@echo "🧹 清理所有资源..."
	@-docker-compose down -v 2>/dev/null || true
	@-docker system prune -f
	@echo "✅ 清理完成"

##@ 工具

version: ## 显示版本信息
	@echo "版本: $(VERSION)"
	@echo "镜像: $(IMAGE_NAME):$(IMAGE_TAG)"

login: ## 登录 Docker 镜像仓库
	@echo "🔐 登录 Docker 镜像仓库..."
	@docker login $(IMAGE_REGISTRY)
	@echo "✅ 登录成功"


