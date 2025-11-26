#!/bin/sh

echo "=========================================="
echo "Roma Web - 运行时配置注入"
echo "=========================================="

# 前后端分离部署：
# - 开发环境：使用 Vite 代理 (/api)
# - 生产环境：前端直接请求后端完整 URL（无代理）

# 复制 nginx 配置模板（不包含代理配置）
cp /etc/nginx/nginx.conf.template /etc/nginx/nginx.conf

# 替换 VITE_API_BASE_URL 占位符
echo ""
echo "1️⃣  配置 API 地址..."
if [ -n "$VITE_API_BASE_URL" ]; then
    API_BASE_URL="${VITE_API_BASE_URL%/}"
    echo "   ✓ 使用运行时注入: $API_BASE_URL"
    
    find /usr/share/nginx/html -name '*.js' -type f -exec sed -i "s|VITE_API_BASE_URL_PLACEHOLDER|$API_BASE_URL|g" {} \;
    
    REMAINING=$(find /usr/share/nginx/html -name '*.js' -type f -exec grep -l "VITE_API_BASE_URL_PLACEHOLDER" {} \; 2>/dev/null | wc -l)
    if [ "$REMAINING" -gt 0 ]; then
        echo "   ⚠️  警告: 仍有 $REMAINING 个文件包含占位符"
    else
        echo "   ✓ API 地址替换成功"
    fi
else
    echo "   ⚠️  警告: 未设置 VITE_API_BASE_URL 环境变量"
    echo "   → 前端将使用默认配置（可能导致请求失败）"
fi

# 替换 VITE_ENV 占位符
echo ""
echo "2️⃣  配置环境标识..."
if [ -n "$VITE_ENV" ]; then
    echo "   ✓ 使用运行时注入: $VITE_ENV"
    
    find /usr/share/nginx/html -name '*.js' -type f -exec sed -i "s|VITE_ENV_PLACEHOLDER|$VITE_ENV|g" {} \;
    
    REMAINING=$(find /usr/share/nginx/html -name '*.js' -type f -exec grep -l "VITE_ENV_PLACEHOLDER" {} \; 2>/dev/null | wc -l)
    if [ "$REMAINING" -gt 0 ]; then
        echo "   ⚠️  警告: 仍有 $REMAINING 个文件包含占位符"
    else
        echo "   ✓ 环境标识替换成功"
    fi
else
    echo "   ℹ️  未设置 VITE_ENV，使用默认值"
fi

echo ""
echo "3️⃣  验证 Nginx 配置..."
nginx -t 2>&1 | grep -q "successful" && echo "   ✓ Nginx 配置正确" || echo "   ✗ Nginx 配置错误"

echo ""
echo "=========================================="
echo "✓ 配置完成，启动 Nginx..."
echo "=========================================="
echo ""

exec nginx -g "daemon off;"