#!/bin/sh

# 参考：https://www.cnblogs.com/JulianHuang/p/13032240.html
# 在容器启动时，使用环境变量替换前端代码中的占位符

# VITE_API_BASE_URL
if [ -n "$VITE_API_BASE_URL" ]; then
    find /usr/share/nginx/html -name '*.js' -type f -exec sed -i "s|VITE_API_BASE_URL_PLACEHOLDER|$VITE_API_BASE_URL|g" {} \;
    BACKEND_URL="$VITE_API_BASE_URL"
else if [ -n "$API_BASE_URL" ]; then 
# 如果设置了 API_BASE_URL，进行替换
    # 确保 API_BASE_URL 格式正确（移除末尾的斜杠，不包含 /api/v1/）
    API_BASE_URL=$(echo "$API_BASE_URL" | sed 's|/api/.*$||' | sed 's|/$||')
    echo "Setting API_BASE_URL to: $API_BASE_URL"
    
    # 替换前端 JS 文件中的占位符为实际的环境变量值
    # 参考文章的方式：使用 sed 替换所有 JS 文件中的占位符
    echo "Replacing VITE_API_BASE_URL_PLACEHOLDER in JS files..."
    find /usr/share/nginx/html -name '*.js' -type f -exec sed -i "s|VITE_API_BASE_URL_PLACEHOLDER|$API_BASE_URL|g" {} \;
    echo "Replacement completed."
    
    # 根据API_BASE_URL提取后端地址（用于 nginx 代理配置）
    BACKEND_URL="$API_BASE_URL"
else
    # 如果没有设置 API_BASE_URL，使用相对路径（由 nginx 代理处理）
    echo "No API_BASE_URL set, using relative path for nginx proxy"
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