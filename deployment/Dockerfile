# 使用 Node.js 作为22基础镜像
FROM registry.cn-hongkong.aliyuncs.com/binrcbase/node:22-alpine as build

# 设置工作目录
WORKDIR /app

RUN npm install -g npm@11.4.1

# 复制 package.json 和 package-lock.json
COPY package.json ./

# 安装依赖
RUN npm install --loglevel=error || npm install --loglevel=error

# 复制项目文件
COPY . .

# 构建参数，支持多环境构建
ARG BUILD_MODE=production
ARG NODE_ENV=production

# 根据构建模式复制对应的环境文件并构建
RUN if [ "$BUILD_MODE" = "test" ]; then \
        cp .env.test .env && npm run build; \
    elif [ "$BUILD_MODE" = "prod" ]; then \
        cp .env.prod .env && npm run build; \
    else \
        npm run build; \
    fi

# 使用 Nginx 作为生产环境的基础镜像
FROM registry.cn-hongkong.aliyuncs.com/binrcbase/nginx:alpine

# 构建参数传递到运行时镜像
ARG BUILD_MODE=production

# 将构建好的 React 应用复制到 Nginx 的静态文件目录
COPY --from=build /app/dist /usr/share/nginx/html

# 根据构建模式复制对应的环境文件到运行时容器
COPY --from=build /app/.env.${BUILD_MODE} /app/.env 2>/dev/null || true

# 复制 Nginx 配置模板
COPY deployment/nginx.conf.template /etc/nginx/nginx.conf.template

# 复制启动脚本
COPY deployment/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# 暴露 80 端口
EXPOSE 80

# 使用启动脚本来处理配置替换
ENTRYPOINT ["/docker-entrypoint.sh"]
