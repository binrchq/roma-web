#!/bin/sh

# 参考：https://www.cnblogs.com/JulianHuang/p/13032240.html
# 在容器启动时，使用环境变量替换前端代码中的占位符

# 前后端分离，前端直接使用完整 URL 请求后端，不需要 nginx 代理
# VITE_API_BASE_URL - 优先使用 VITE_API_BASE_URL，其次使用 API_BASE_URL
if [ -n "$VITE_API_BASE_URL" ]; then
    # 确保 URL 格式正确（移除末尾的斜杠，不包含 /api/v1/）
    API_BASE_URL=$(echo "$VITE_API_BASE_URL" | sed 's|/api/.*$||' | sed 's|/$||')
    echo "Using VITE_API_BASE_URL: $API_BASE_URL"
    
    # 替换前端 JS 文件中的占位符为实际的环境变量值
    echo "Replacing VITE_API_BASE_URL_PLACEHOLDER in JS files..."
    
    # 先检查占位符是否存在
    PLACEHOLDER_COUNT=$(find /usr/share/nginx/html -name '*.js' -type f -exec grep -l "VITE_API_BASE_URL_PLACEHOLDER" {} \; 2>/dev/null | wc -l)
    echo "Found $PLACEHOLDER_COUNT JS file(s) containing placeholder"
    
    # 执行替换（尝试多种可能的格式）
    find /usr/share/nginx/html -name '*.js' -type f -exec sed -i \
        -e "s|VITE_API_BASE_URL_PLACEHOLDER|$API_BASE_URL|g" \
        -e "s|'VITE_API_BASE_URL_PLACEHOLDER'|'$API_BASE_URL'|g" \
        -e "s|\"VITE_API_BASE_URL_PLACEHOLDER\"|\"$API_BASE_URL\"|g" \
        {} \;
    
    # 验证替换是否成功
    REMAINING=$(find /usr/share/nginx/html -name '*.js' -type f -exec grep -l "VITE_API_BASE_URL_PLACEHOLDER" {} \; 2>/dev/null | wc -l)
    if [ "$REMAINING" -gt 0 ]; then
        echo "Warning: $REMAINING JS file(s) still contain placeholder after replacement"
        find /usr/share/nginx/html -name '*.js' -type f -exec grep -l "VITE_API_BASE_URL_PLACEHOLDER" {} \; 2>/dev/null | head -3
    else
        echo "Replacement completed successfully"
    fi
elif [ -n "$API_BASE_URL" ]; then
    # 如果设置了 API_BASE_URL，进行替换
    # 确保 API_BASE_URL 格式正确（移除末尾的斜杠，不包含 /api/v1/）
    API_BASE_URL=$(echo "$API_BASE_URL" | sed 's|/api/.*$||' | sed 's|/$||')
    echo "Using API_BASE_URL: $API_BASE_URL"
    
    # 替换前端 JS 文件中的占位符为实际的环境变量值
    echo "Replacing VITE_API_BASE_URL_PLACEHOLDER in JS files..."
    
    # 先检查占位符是否存在
    PLACEHOLDER_COUNT=$(find /usr/share/nginx/html -name '*.js' -type f -exec grep -l "VITE_API_BASE_URL_PLACEHOLDER" {} \; 2>/dev/null | wc -l)
    echo "Found $PLACEHOLDER_COUNT JS file(s) containing placeholder"
    
    # 执行替换（尝试多种可能的格式）
    find /usr/share/nginx/html -name '*.js' -type f -exec sed -i \
        -e "s|VITE_API_BASE_URL_PLACEHOLDER|$API_BASE_URL|g" \
        -e "s|'VITE_API_BASE_URL_PLACEHOLDER'|'$API_BASE_URL'|g" \
        -e "s|\"VITE_API_BASE_URL_PLACEHOLDER\"|\"$API_BASE_URL\"|g" \
        {} \;
    
    # 验证替换是否成功
    REMAINING=$(find /usr/share/nginx/html -name '*.js' -type f -exec grep -l "VITE_API_BASE_URL_PLACEHOLDER" {} \; 2>/dev/null | wc -l)
    if [ "$REMAINING" -gt 0 ]; then
        echo "Warning: $REMAINING JS file(s) still contain placeholder after replacement"
        find /usr/share/nginx/html -name '*.js' -type f -exec grep -l "VITE_API_BASE_URL_PLACEHOLDER" {} \; 2>/dev/null | head -3
    else
        echo "Replacement completed successfully"
    fi
else
    # 如果没有设置任何环境变量，占位符保持不变（前端使用默认值）
    echo "No VITE_API_BASE_URL or API_BASE_URL set, placeholder will remain unchanged"
fi

# 前后端分离，直接使用 nginx 配置模板（不包含代理配置）
cp /etc/nginx/nginx.conf.template /etc/nginx/nginx.conf

# 输出最终的nginx配置用于调试
echo "Final nginx configuration:"
cat /etc/nginx/nginx.conf

# 测试nginx配置
nginx -t

# 启动nginx
exec nginx -g "daemon off;"