#!/bin/sh

# 参考：https://www.cnblogs.com/JulianHuang/p/13032240.html
# 在容器启动时，使用环境变量替换前端代码中的占位符

# 前后端分离，前端直接使用完整 URL 请求后端，不需要 nginx 代理
# VITE_API_BASE_URL - 从环境变量读取，替换构建时保留的占位符

# 前后端分离，直接使用 nginx 配置模板（不包含代理配置）
cp /etc/nginx/nginx.conf.template /etc/nginx/nginx.conf

# 替换 VITE_API_BASE_URL 占位符
if [ -n "$VITE_API_BASE_URL" ]; then
    # 确保 URL 格式正确（移除末尾的斜杠，不包含 /api/v1/）
    API_BASE_URL=$(echo "$VITE_API_BASE_URL" | sed 's|/api/.*$||' | sed 's|/$||')
    echo "Using VITE_API_BASE_URL: $API_BASE_URL"
    echo "Replacing VITE_API_BASE_URL_PLACEHOLDER in JS files..."
    
    # 替换占位符
    find /usr/share/nginx/html -name '*.js' -type f -exec sed -i "s|VITE_API_BASE_URL_PLACEHOLDER|$API_BASE_URL|g" {} \;
    
    # 验证替换是否成功
    REMAINING=$(find /usr/share/nginx/html -name '*.js' -type f -exec grep -l "VITE_API_BASE_URL_PLACEHOLDER" {} \; 2>/dev/null | wc -l)
    if [ "$REMAINING" -gt 0 ]; then
        echo "Warning: $REMAINING JS file(s) still contain VITE_API_BASE_URL_PLACEHOLDER after replacement"
    else
        echo "VITE_API_BASE_URL replacement completed successfully"
    fi
else
    echo "No VITE_API_BASE_URL set, placeholder will remain unchanged (using frontend default)"
fi

# 替换 VITE_ENV 占位符
if [ -n "$VITE_ENV" ]; then
    echo "Using VITE_ENV: $VITE_ENV"
    echo "Replacing VITE_ENV_PLACEHOLDER in JS files..."
    
    # 替换占位符
    find /usr/share/nginx/html -name '*.js' -type f -exec sed -i "s|VITE_ENV_PLACEHOLDER|$VITE_ENV|g" {} \;
    
    # 验证替换是否成功
    REMAINING=$(find /usr/share/nginx/html -name '*.js' -type f -exec grep -l "VITE_ENV_PLACEHOLDER" {} \; 2>/dev/null | wc -l)
    if [ "$REMAINING" -gt 0 ]; then
        echo "Warning: $REMAINING JS file(s) still contain VITE_ENV_PLACEHOLDER after replacement"
    else
        echo "VITE_ENV replacement completed successfully"
    fi
else
    echo "No VITE_ENV set, placeholder will remain unchanged (using frontend default)"
fi
# 输出最终的nginx配置用于调试
echo "Final nginx configuration:"
cat /etc/nginx/nginx.conf

# 测试nginx配置
nginx -t

# 启动nginx
exec nginx -g "daemon off;"