# 使用 Node.js 作为22基础镜像
FROM node:22-alpine AS builder

# 设置工作目录
WORKDIR /app

RUN npm install -g npm@11.4.1
# 复制 package.json 和 package-lock.json
COPY package.json ./
# 安装依赖
# 安装依赖，启用 verbose 日志
RUN npm install --loglevel=verbose 2>&1 | tee /app/npm-install.log || { echo "npm install failed, printing logs"; cat /app/npm-install.log /root/.npm/_logs/*.log 2>/dev/null; exit 1; }

# 复制项目文件
COPY . .

# 构建时不注入任何环境变量，使用占位符在运行时替换
# 这样同一个镜像可以用于不同环境，只需在运行时设置环境变量

# 构建应用（占位符 VITE_API_BASE_URL_PLACEHOLDER 会保留在构建后的 JS 文件中）
RUN npm run build

# 使用 Nginx 作为生产环境的基础镜像
FROM nginx:alpine

# 将构建好的 React 应用复制到 Nginx 的静态文件目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置模板
COPY deployment/nginx.conf.template /etc/nginx/nginx.conf.template

# 复制启动脚本
COPY deployment/docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# 暴露 80 端口
EXPOSE 80

# 使用启动脚本来处理配置替换
ENTRYPOINT ["/docker-entrypoint.sh"]