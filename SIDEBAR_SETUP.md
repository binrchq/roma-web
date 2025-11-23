# Sidebar 组件设置说明

## 安装依赖

新的 Sidebar 组件需要以下依赖：

```bash
cd web/frontend
npm install lucide-react @radix-ui/react-slot @radix-ui/react-separator @radix-ui/react-tooltip @radix-ui/react-dialog class-variance-authority
```

## 组件说明

### Sidebar 组件

位于 `src/components/blocks/sidebar.jsx`，是一个功能完整的侧边栏组件。

**特性：**
- 响应式设计（移动端和桌面端）
- 可折叠/展开
- 键盘快捷键支持（Ctrl/Cmd + B）
- 支持图标模式和完整模式
- 移动端使用 Sheet 抽屉式显示
- 状态持久化（使用 Cookie）

### 依赖组件

已创建以下组件：
- `src/components/ui/sheet.jsx` - 抽屉组件（移动端使用）
- `src/components/ui/separator.jsx` - 分隔线组件
- `src/components/ui/skeleton.jsx` - 骨架屏组件
- `src/components/ui/tooltip.jsx` - 提示框组件
- `src/components/hooks/use-mobile.js` - 移动端检测 Hook

### Layout 更新

`src/components/Layout.jsx` 已更新为使用新的 Sidebar 组件：
- 使用 lucide-react 图标
- 集成 React Router 导航
- 显示用户信息在底部
- 支持活动状态高亮

## 配置更新

### 1. Tailwind 配置 (`tailwind.config.js`)
- 添加了 `sidebar` 颜色系统

### 2. CSS (`src/index.css`)
- 添加了 Sidebar 的 CSS 变量定义
- 支持深色模式

### 3. Package.json
- 添加了必要的依赖包

## 使用方式

Layout 组件会自动使用新的 Sidebar。菜单项配置在 `Layout.jsx` 中的 `navigation` 数组。

## 键盘快捷键

- `Ctrl/Cmd + B` - 切换侧边栏显示/隐藏

## 样式定制

可以通过修改 CSS 变量来自定义 Sidebar 的颜色：
- `--sidebar-background` - 背景色
- `--sidebar-foreground` - 文字颜色
- `--sidebar-accent` - 悬停/活动状态背景
- `--sidebar-border` - 边框颜色

## 注意事项

1. 确保所有依赖都已安装
2. Sidebar 状态会保存在 Cookie 中，刷新页面后保持状态
3. 移动端会自动使用抽屉式显示
4. 图标模式在折叠状态下只显示图标，悬停显示工具提示

