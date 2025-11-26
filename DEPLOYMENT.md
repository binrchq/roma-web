# Roma Web 部署配置说明

## 架构概述

Roma Web 采用**运行时参数注入**的部署方式，而非构建时注入。这意味着：

- ✅ **开发环境**：使用 Vite 代理（`/api` → 后端地址）
- ✅ **生产环境**：前端直接请求后端完整 URL（独立部署，无代理）
- ✅ **一次构建，多处部署**：构建产物保留占位符，在容器启动时注入实际配置

---

## 环境配置

### 1. 开发环境

**本地开发时**，配置会自动使用代理模式：

```bash
# 启动开发服务器
npm run dev

# 默认后端地址：http://localhost:6999
# 可通过环境变量覆盖：
VITE_API_BASE_URL=http://localhost:8080 npm run dev
```

**工作原理**：
- 前端请求 `/api/xxx` 
- Vite 代理转发到 `http://localhost:6999/api/xxx`
- 避免跨域问题

---

### 2. 生产环境（K8s 部署）

#### 2.1 构建镜像

```bash
# 构建时不需要传入任何环境变量
docker build -t roma-web:latest .
```

构建产物中包含占位符：
- `VITE_ENV_PLACEHOLDER` → 运行时替换为实际环境
- `VITE_API_BASE_URL_PLACEHOLDER` → 运行时替换为实际 API 地址

#### 2.2 K8s 部署配置

编辑 `deployment/k8s-deployment.yaml`：

```yaml
env:
  - name: VITE_ENV
    value: "prod"  # 可选：prod/staging/test
  - name: VITE_API_BASE_URL
    value: "https://roma-api.c.binrc.com/api/v1"  # 必须：后端完整地址
```

#### 2.3 运行时注入流程

容器启动时，`docker-entrypoint.sh` 会：

1. 扫描所有 JS 文件
2. 将 `VITE_API_BASE_URL_PLACEHOLDER` 替换为环境变量 `$VITE_API_BASE_URL`
3. 将 `VITE_ENV_PLACEHOLDER` 替换为环境变量 `$VITE_ENV`
4. 启动 Nginx

---

## 配置验证

### 检查运行时注入是否成功

```bash
# 进入容器
kubectl exec -it <pod-name> -n roma -- sh

# 检查环境变量
echo $VITE_API_BASE_URL
echo $VITE_ENV

# 验证 JS 文件中是否还有占位符（应该为空）
grep -r "VITE_API_BASE_URL_PLACEHOLDER" /usr/share/nginx/html/assets/
grep -r "VITE_ENV_PLACEHOLDER" /usr/share/nginx/html/assets/
```

### 浏览器控制台日志

打开浏览器控制台，应该看到：

```
[env] 生产环境，使用运行时注入的 API 地址: https://roma-api.c.binrc.com/api/v1
```

**如果看到错误**：
```
⚠️ 生产环境缺少 VITE_API_BASE_URL 运行时注入，请检查 K8s 配置或 docker-entrypoint.sh
```
说明运行时注入失败，请检查 K8s 环境变量配置。

---

## 环境判断逻辑

代码中的 API 地址获取优先级（`src/utils/env.js`）：

| 优先级 | 条件 | API 地址 | 说明 |
|--------|------|----------|------|
| 1️⃣ | 运行时注入成功 | 注入的完整 URL | ✅ 最高优先级，适用于所有部署环境 |
| 2️⃣ | `import.meta.env.DEV` | `/api`（代理） | ✅ Vite 开发模式 (`npm run dev`) |
| 3️⃣ | `localhost` / `127.0.0.1` / `192.168.*` / `10.*` | `/api`（代理） | ⚠️ 本地访问生产构建（测试用） |
| 4️⃣ | 无配置 | ❌ 报错 | 生产环境必须配置运行时注入 |

**重要**：即使通过内网 IP（如 `10.x.x.x`）访问，只要运行时注入配置成功，就会使用注入的 API 地址。

---

## 常见问题

### Q1: 为什么不用构建时注入？

**A**: 构建时注入的缺点：
- ❌ 不同环境需要多次构建（test/staging/prod）
- ❌ 镜像无法在多环境复用
- ❌ CI/CD 流程复杂，容易出错

**运行时注入的优点**：
- ✅ 一次构建，多环境部署
- ✅ 配置集中在 K8s ConfigMap/Deployment
- ✅ 敏感信息不打包进镜像

### Q2: 如何本地测试生产模式？

```bash
# 1. 构建生产版本
npm run build

# 2. 使用 Docker 本地运行
docker build -t roma-web-test .
docker run -p 8080:80 \
  -e VITE_ENV=staging \
  -e VITE_API_BASE_URL=https://test-api.example.com/api/v1 \
  roma-web-test
```

### Q3: 为什么开发环境还是用代理？

**A**: 开发环境使用代理的原因：
- ✅ 避免跨域问题（CORS）
- ✅ 简化开发配置
- ✅ 更接近真实用户体验（相对路径）

---

## 相关文件

| 文件 | 作用 |
|------|------|
| `vite.config.js` | 配置开发代理，仅在 `mode=development` 时启用 |
| `src/utils/env.js` | 环境检测和 API 地址获取逻辑 |
| `docker-entrypoint.sh` | 容器启动时替换占位符 |
| `deployment/k8s-deployment.yaml` | K8s 部署配置，设置环境变量 |

---

## 最佳实践

1. **不要在代码中硬编码后端地址**
2. **生产环境必须配置 `VITE_API_BASE_URL` 环境变量**
3. **使用 K8s ConfigMap 管理多环境配置**
4. **定期检查容器启动日志，确认替换成功**

---

更新时间：2025-11-26

