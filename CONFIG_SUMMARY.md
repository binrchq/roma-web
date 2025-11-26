# 配置修改总结

## 🎯 目标

实现**运行时参数注入**，而不是构建时注入：
- ✅ 开发环境：使用 Vite 代理
- ✅ 生产环境：前端直接请求后端完整 URL（无代理）

---

## 📝 核心修改

### 1. `src/utils/env.js` - 优化环境判断逻辑

**关键改进**：
- 明确区分开发/生产环境的判断逻辑
- 开发环境优先使用 `/api` 代理
- 生产环境强制要求运行时注入 API 地址

```javascript
export const getApiBaseUrl = () => {
    // 优先级1: 运行时注入配置（最高优先级）
    if (runtimeApiBaseUrl) {
        console.log('[env] ✓ 使用运行时注入的 API 地址:', runtimeApiBaseUrl);
        return runtimeApiBaseUrl;
    }

    // 优先级2: Vite 开发模式
    if (import.meta.env.DEV) {
        console.log('[env] ✓ Vite 开发模式，使用代理: /api');
        return '/api';
    }

    // 优先级3: 本地访问生产构建（测试用）
    if (isLocalhost()) {
        console.log('[env] ⚠️  本地访问生产构建，使用代理: /api');
        return '/api';
    }

    // 优先级4: 无配置时报错
    throw new Error('[env] ❌ 生产环境缺少 VITE_API_BASE_URL 运行时注入');
};
```

**关键改进**：运行时注入的配置拥有最高优先级，即使通过内网 IP 访问也能正确使用注入的 API 地址。

---

### 2. `vite.config.js` - 只在开发环境启用代理

```javascript
server: {
  port: 3021,
  host: true,
  // ✅ 只在开发环境使用代理
  ...(isDev && {
    proxy: {
      '/api': {
        target: devBackendTarget,
        changeOrigin: true,
        secure: false,
      }
    }
  })
}
```

---

### 3. `deployment/docker-entrypoint.sh` - 运行时替换

容器启动时自动替换占位符：

```bash
# 构建时保留占位符
VITE_API_BASE_URL_PLACEHOLDER
VITE_ENV_PLACEHOLDER

# 运行时替换为实际值
$VITE_API_BASE_URL
$VITE_ENV
```

---

### 4. `src/api/roma-request.js` - 简化日志

- 移除冗余的日志输出
- 只保留关键信息

---

## 🚀 使用方式

### 开发环境

```bash
# 本地开发（自动使用代理）
npm run dev

# 前端请求: /api/users
# 实际请求: http://localhost:6999/api/users
```

### 生产环境（K8s）

```yaml
# deployment/k8s-deployment.yaml
env:
  - name: VITE_ENV
    value: "prod"
  - name: VITE_API_BASE_URL
    value: "https://roma-api.c.binrc.com/api/v1"  # ✅ 必须配置
```

```bash
# 容器启动时自动替换
# 前端请求: https://roma-api.c.binrc.com/api/v1/users
```

---

## 🔍 验证方法

### 1. 浏览器控制台日志

**开发环境**：
```
[env] 开发环境，使用代理模式: /api
```

**生产环境**：
```
[env] 生产环境，使用运行时注入的 API 地址: https://roma-api.c.binrc.com/api/v1
```

### 2. 容器启动日志

```
==========================================
Roma Web - 运行时配置注入
==========================================

1️⃣  配置 API 地址...
   ✓ 使用运行时注入: https://roma-api.c.binrc.com/api/v1
   ✓ API 地址替换成功

2️⃣  配置环境标识...
   ✓ 使用运行时注入: prod
   ✓ 环境标识替换成功

3️⃣  验证 Nginx 配置...
   ✓ Nginx 配置正确

==========================================
✓ 配置完成，启动 Nginx...
==========================================
```

---

## ✨ 优势

| 对比项 | 构建时注入 | 运行时注入（当前） |
|--------|-----------|------------------|
| 多环境部署 | ❌ 需要多次构建 | ✅ 一次构建，多处部署 |
| 配置管理 | ❌ 分散在 CI/CD | ✅ 集中在 K8s |
| 安全性 | ❌ 配置打包进镜像 | ✅ 配置在运行时注入 |
| 灵活性 | ❌ 修改需要重新构建 | ✅ 修改环境变量即可 |

---

## 📌 注意事项

1. **生产环境必须配置 `VITE_API_BASE_URL`**，否则前端会报错
2. 开发环境自动使用 `/api` 代理，无需额外配置
3. 占位符替换发生在容器启动时，构建时不需要传入任何环境变量

---

详细文档请参考：[DEPLOYMENT.md](./DEPLOYMENT.md)

