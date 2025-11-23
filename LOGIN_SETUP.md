# 登录页面设置说明

## 安装依赖

新的登录组件需要以下依赖：

```bash
cd web/frontend
npm install clsx tailwind-merge
```

## 组件说明

### SplitLoginCard 组件

位于 `src/components/ui/split-login-card.jsx`，是一个现代化的分屏登录卡片组件。

**特性：**
- 左侧：欢迎信息和图标
- 右侧：登录表单（用户名 + API Key）
- 支持深色模式
- 响应式设计（移动端和桌面端）

### 基础 UI 组件

已创建以下基础组件（位于 `src/components/ui/`）：
- `button.jsx` - 按钮组件
- `input.jsx` - 输入框组件
- `label.jsx` - 标签组件

### 工具函数

- `src/lib/utils.js` - 包含 `cn()` 函数，用于合并 Tailwind CSS 类名

## 配置更新

### 1. Vite 配置 (`vite.config.js`)
- 添加了路径别名 `@` 指向 `./src`

### 2. Tailwind 配置 (`tailwind.config.js`)
- 启用了深色模式支持 (`darkMode: ["class"]`)

### 3. CSS (`src/index.css`)
- 添加了 shadcn/ui 的 CSS 变量定义
- 支持深色模式

### 4. API 客户端 (`src/utils/api.js`)
- 更新了 API Key 的传递方式，使用 `apikey` header 和 query 参数

## 使用方式

登录页面会自动使用新的 SplitLoginCard 组件。用户需要输入：
1. **用户名**（可选，用于显示）
2. **API Key**（必需，用于认证）

登录成功后，API Key 会保存到 `localStorage`，并跳转到仪表盘。

## 样式定制

可以通过修改 `split-login-card.jsx` 中的颜色和样式来自定义登录页面：
- 左侧背景色：`bg-[#8371F5]`
- 按钮颜色：使用 `primary` 颜色系统

## 注意事项

1. 确保后端 API 支持 `apikey` header 或 query 参数认证
2. API Key 验证通过调用 `/api/v1/system/health` 端点
3. 登录失败时会清除 localStorage 中的认证信息

