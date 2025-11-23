# 数据表格组件设置说明

## 安装依赖

新的数据表格组件需要以下依赖：

```bash
cd web/frontend
npm install framer-motion @radix-ui/react-avatar @radix-ui/react-dropdown-menu
```

## 组件说明

### ResourceDataTable 组件

位于 `src/components/ui/resource-data-table.jsx`，用于显示资源数据。

**特性：**
- 支持多种资源类型（Linux, Windows, Docker, Database, Router, Switch）
- 可配置的列显示
- 动画效果（framer-motion）
- 状态徽章显示
- 操作按钮（连接、编辑、删除）

### UserDataTable 组件

位于 `src/components/ui/user-data-table.jsx`，用于显示用户数据。

**特性：**
- 用户头像显示
- 角色徽章显示
- 可配置的列显示
- 动画效果
- 操作按钮（编辑、删除）

### 依赖组件

已创建以下组件：
- `src/components/ui/table.jsx` - 表格组件
- `src/components/ui/avatar.jsx` - 头像组件
- `src/components/ui/badge.jsx` - 徽章组件
- `src/components/ui/dropdown-menu.jsx` - 下拉菜单组件

## 页面更新

### Resources 页面

已更新为使用 `ResourceDataTable` 组件：
- 支持按类型筛选
- 支持按状态筛选
- 支持按名称搜索
- 可切换列显示

### Users 页面

已更新为使用 `UserDataTable` 组件：
- 支持按角色筛选
- 支持按状态筛选
- 支持搜索（用户名、邮箱、姓名）
- 可切换列显示

## 功能特性

- **筛选功能**：支持多维度筛选（类型、状态、角色等）
- **搜索功能**：实时搜索过滤
- **列控制**：可动态显示/隐藏列
- **动画效果**：使用 framer-motion 提供流畅的动画
- **响应式设计**：适配移动端和桌面端
- **操作按钮**：支持编辑、删除、连接等操作

## 使用示例

### Resources 页面

```jsx
<ResourceDataTable
  resources={filteredResources}
  visibleColumns={visibleColumns}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onConnect={handleConnect}
/>
```

### Users 页面

```jsx
<UserDataTable
  users={filteredUsers}
  visibleColumns={visibleColumns}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## 注意事项

1. 确保所有依赖都已安装
2. 数据格式需要符合组件定义的接口
3. 操作回调函数（onEdit, onDelete, onConnect）需要自行实现
4. 动画效果需要 framer-motion 库支持

