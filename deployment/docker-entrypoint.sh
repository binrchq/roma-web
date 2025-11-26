#!/bin/sh

# 参考：https://www.cnblogs.com/JulianHuang/p/13032240.html
# 在容器启动时，使用环境变量替换前端代码中的占位符

# VITE_API_BASE_URL - 优先使用 VITE_API_BASE_URL，其次使用 API_BASE_URL
if [ -n "$VITE_API_BASE_URL" ]; then
    # 确保 URL 格式正确（移除末尾的斜杠，不包含 /api/v1/）
    API_BASE_URL=$(echo "$VITE_API_BASE_URL" | sed 's|/api/.*$||' | sed 's|/$||')
    echo "Using VITE_API_BASE_URL: $API_BASE_URL"
    
    # 替换前端 JS 文件中的占位符为实际的环境变量值
    echo "Replacing VITE_API_BASE_URL_PLACEHOLDER in JS files..."
    find /usr/share/nginx/html -name '*.js' -type f -exec sed -i "s|VITE_API_BASE_URL_PLACEHOLDER|$API_BASE_URL|g" {} \;
    echo "Replacement completed."
    
    # 根据API_BASE_URL提取后端地址（用于 nginx 代理配置）
    BACKEND_URL="$API_BASE_URL"
elif [ -n "$API_BASE_URL" ]; then
    # 如果设置了 API_BASE_URL，进行替换
    # 确保 API_BASE_URL 格式正确（移除末尾的斜杠，不包含 /api/v1/）
    API_BASE_URL=$(echo "$API_BASE_URL" | sed 's|/api/.*$||' | sed 's|/$||')
    echo "Using API_BASE_URL: $API_BASE_URL"
    
    # 替换前端 JS 文件中的占位符为实际的环境变量值
    echo "Replacing VITE_API_BASE_URL_PLACEHOLDER in JS files..."
    find /usr/share/nginx/html -name '*.js' -type f -exec sed -i "s|VITE_API_BASE_URL_PLACEHOLDER|$API_BASE_URL|g" {} \;
    echo "Replacement completed."
    
    # 根据API_BASE_URL提取后端地址（用于 nginx 代理配置）
    BACKEND_URL="$API_BASE_URL"
else
    # 如果没有设置任何环境变量，占位符保持不变（前端使用默认值）
    echo "No VITE_API_BASE_URL or API_BASE_URL set, placeholder will remain unchanged"
    BACKEND_URL=""
fi

if [ -n "$BACKEND_URL" ]; then
    echo "Setting BACKEND_URL to: $BACKEND_URL"
    # 使用envsubst替换nginx配置模板中的环境变量
    export BACKEND_URL
    envsubst '${BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
else
    echo "No BACKEND_URL set, using nginx.conf.template as-is (no proxy needed)"
    # 如果没有设置 BACKEND_URL，直接使用模板（可能需要手动配置或使用默认配置）
    cp /etc/nginx/nginx.conf.template /etc/nginx/nginx.conf
fi

# 输出最终的nginx配置用于调试
echo "Final nginx configuration:"
cat /etc/nginx/nginx.conf

# 测试nginx配置
nginx -t

# 启动nginx
exec nginx -g "daemon off;"