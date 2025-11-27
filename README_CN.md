# ROMA Web - 堡垒机管理界面

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)

基于 React + Vite + TailwindCSS 构建的 ROMA 堡垒机现代化管理界面。

**相关项目：** [ROMA 核心](https://github.com/binrchq/roma) • [MCP 服务器](https://github.com/binrchq/roma-mcp) • [官方网站](https://roma.binrc.com)

语言: [English](./README.md) • 中文

---

## 快速体验

### Docker 快速启动（推荐）

```bash
# 拉取镜像
docker pull binrc/roma-web:latest

# 启动容器
docker run -d -p 7000:80 \
  -e VITE_API_BASE_URL=http://your-roma-api:6999/api/v1 \
  binrc/roma-web:latest

# 访问
open http://localhost:7000
```

### 在线演示

**https://roma-demo.binrc.com**
- 凭证：***demo/demo123456***

---

<div align="left">
  <img src="./1764251915586.png" alt="ROMA Web UI"/>
</div>

## 技术栈

- **React 18** - UI 框架
- **Vite** - 构建工具
- **TailwindCSS** - CSS 框架
- **React Router** - 路由管理
- **Axios** - HTTP 客户端
- **Zustand** - 状态管理

## 功能特性

- **现代化设计** - 基于 TailwindCSS 的响应式界面
- **实时仪表盘** - 资源统计和状态监控
- **资源管理** - 支持 6 种资源类型（Linux/Windows/Docker/数据库/路由器/交换机）
- **用户管理** - 用户和角色的 CRUD 操作
- **SSH 密钥管理** - 上传、生成和管理 SSH 密钥
- **审计日志** - 完整的访问日志查看
- **系统设置** - API Key 和系统配置
- **暗黑模式** - 支持亮色/暗色主题切换
- **安全认证** - Token 和 API Key 双重认证

## 本地开发

### 前置要求

- Node.js 18+
- npm 或 pnpm

### 安装依赖

```bash
npm install
# 或
pnpm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:3021

### 环境配置

创建 `.env.local` 文件：

```env
# 后端 API 地址
VITE_API_BASE_URL=http://localhost:6999/api/v1
```

### 生产构建

```bash
npm run build
```

### 预览构建

```bash
npm run preview
```

## 项目结构

```
src/
├── components/       # 可复用组件
│   └── Layout.jsx   # 主布局组件
├── pages/           # 页面组件
│   ├── Dashboard.jsx
│   ├── Resources.jsx
│   ├── Users.jsx
│   ├── Roles.jsx
│   ├── Logs.jsx
│   └── Settings.jsx
├── utils/           # 工具函数
│   └── api.js      # API 请求封装
├── App.jsx         # 应用入口
├── main.jsx        # React 入口
└── index.css       # 全局样式
```

## API 配置

在 `src/utils/api.js` 中配置 API 基础地址：

```javascript
const apiClient = axios.create({
  baseURL: '/api/v1',
})
```

## 代理配置

开发环境下，Vite 会自动将 `/api` 请求代理到后端服务：

```javascript
// vite.config.js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true,
    }
  }
}
```

## Docker 部署

### 构建镜像

```bash
docker build -t roma-web:latest .
```

### 运行容器

```bash
docker run -d \
  --name roma-web \
  -p 7000:80 \
  -e VITE_API_BASE_URL=https://your-roma-api.com/api/v1 \
  roma-web:latest
```

### Docker Compose

```yaml
services:
  roma-web:
    image: binrc/roma-web:latest
    ports:
      - "7000:80"
    environment:
      - VITE_API_BASE_URL=http://roma-backend:6999/api/v1
    depends_on:
      - roma-backend
```

---

## 相关项目

ROMA 生态系统包含多个项目：

### [roma](https://github.com/binrchq/roma)
ROMA 核心跳板机服务（Go 语言开发）

**功能：**
- SSH 跳板机服务（端口 2200）
- RESTful API 服务（端口 6999）
- 资源管理和连接处理
- 用户认证和权限控制

**快速启动：**
```bash
curl -O https://raw.githubusercontent.com/binrchq/roma/main/deployment/quickstart.yaml
docker compose -f quickstart.yaml up -d
```

---

### [roma-mcp](https://github.com/binrchq/roma-mcp)
独立的 MCP 服务器，用于 AI 集成

**功能：**
- 完整的 MCP 协议支持
- 20+ AI 工具用于基础设施管理
- 兼容 Claude Desktop、Cursor 等客户端
- 独立部署，灵活配置

**使用场景：**
- AI 驱动的运维自动化
- 自然语言控制基础设施
- 智能故障诊断和修复

---

### 项目对比

| 项目 | 用途 | 技术栈 | 端口 |
|------|------|--------|------|
| **roma** | 核心跳板机 | Go | 2200 (SSH), 6999 (API) |
| **roma-web** | Web 管理界面 | React + Vite | 7000 (HTTP) |
| **roma-mcp** | AI 集成服务 | Go | stdio (MCP) |

---

## 使用说明

### 首次登录

1. 确保 ROMA 后端服务已启动
2. 访问 Web 界面 `http://localhost:7000`
3. 使用配置的账户登录（默认：demo/demo123456）
4. 上传 SSH 公钥（设置 → SSH 密钥）

### 添加资源

1. 导航到对应的资源页面（Linux/Windows/Docker等）
2. 点击"添加资源"按钮
3. 填写资源信息（名称、地址、端口、凭证等）
4. 保存后即可通过 SSH 连接

### API 密钥管理

1. 进入"设置"页面
2. 在"API 密钥"部分查看或生成新密钥
3. 复制密钥用于 API 调用

---

## 故障排查

### 问题：无法连接到后端

**解决方案：**
```bash
# 检查环境变量
echo $VITE_API_BASE_URL

# 检查后端服务状态
curl http://localhost:6999/health
```

### 问题：登录失败

**解决方案：**
- 检查用户名密码是否正确
- 确认后端用户配置
- 查看浏览器控制台错误信息

### 问题：生产环境看到开发组件

**解决方案：**
- 确保使用生产构建：`npm run build`
- 检查环境变量：应该没有 `VITE_ENV=development`

---

## 贡献

欢迎贡献代码和提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 许可证

本项目基于 AGPL-3.0 许可证开源。详见 [LICENSE](../LICENSE) 文件。

---

## 支持

- 邮箱: support@binrc.com
- 问题: [GitHub Issues](https://github.com/binrchq/roma-web/issues)
- 文档: [ROMA 文档](https://roma.binrc.com)

---

**ROMA Web** - 为远程访问提供现代化的管理界面
