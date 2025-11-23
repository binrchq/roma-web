#!/bin/sh

# 优先使用运行时环境变量，如果没有则从 .env 文件读取
if [ -n "$VITE_API_BASE_URL" ]; then
    # 使用运行时环境变量
    API_BASE_URL="$VITE_API_BASE_URL"
    echo "Using API_BASE_URL from environment variable: $API_BASE_URL"
elif [ -f "/app/.env" ]; then
    # 从.env文件中提取VITE_API_BASE_URL
    API_BASE_URL=$(grep '^VITE_API_BASE_URL=' /app/.env | cut -d '=' -f2)
    echo "Found API_BASE_URL in .env: $API_BASE_URL"
else
    echo "Warning: No API_BASE_URL found, using default"
    API_BASE_URL="https://roma-backend.binrc.com/api/"
fi

# 根据API_BASE_URL提取后端地址
if [ -n "$API_BASE_URL" ]; then
    # 从 https://svr-test.meshwise.cn/api/ 提取 https://svr-test.meshwise.cn
    BACKEND_URL=$(echo "$API_BASE_URL" | sed 's|/api/.*$||')
else
    # 默认后端地址
    BACKEND_URL="https://roma-backend.binrc.com"
fi

echo "Setting BACKEND_URL to: $BACKEND_URL"


# 使用envsubst替换nginx配置模板中的环境变量
export BACKEND_URL
envsubst '${BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf

# 输出最终的nginx配置用于调试
echo "Final nginx configuration:"
cat /etc/nginx/nginx.conf

# 测试nginx配置
nginx -t

# 启动nginx
exec nginx -g "daemon off;"