import { useState, useEffect, useMemo } from 'react'
import { api } from '../api/roma'
import { UserDataTable } from '@/components/ui/user-data-table'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Columns } from 'lucide-react'
import { logger } from '@/utils/logger'

const allColumns = ["username", "email", "name", "roles", "createdAt", "status", "actions"]
const initialFormState = {
  username: '',
  name: '',
  nickname: '',
  email: '',
  password: '',
  public_key: '',
  role_ids: [],
}

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchFilter, setSearchFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [visibleColumns, setVisibleColumns] = useState(new Set(allColumns))

  const [roles, setRoles] = useState([])
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [formData, setFormData] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState({})
  const [formSubmitting, setFormSubmitting] = useState(false)

  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await api.getUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      logger.error('加载用户失败:', error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const data = await api.getRoles()
      setRoles(Array.isArray(data) ? data : [])
    } catch (error) {
      logger.error('加载角色失败:', error)
    }
  }

  // 获取所有角色列表
  const allRoles = useMemo(() => {
    const roleSet = new Set()
    users.forEach(user => {
      if (user.roles) {
        user.roles.forEach(role => roleSet.add(role.name))
      }
    })
    return Array.from(roleSet)
  }, [users])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchMatch = searchFilter === "" ||
        user.username?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchFilter.toLowerCase())

      const roleMatch = roleFilter === "all" ||
        (user.roles && user.roles.some(r => r.name === roleFilter))

      const statusMatch = statusFilter === "all" ||
        (statusFilter === "active" && !user.deleted_at) ||
        (statusFilter === "disabled" && user.deleted_at)

      return searchMatch && roleMatch && statusMatch
    })
  }, [users, searchFilter, roleFilter, statusFilter])

  const toggleColumn = (column) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(column)) {
        newSet.delete(column)
      } else {
        newSet.add(column)
      }
      return newSet
    })
  }

  const resetForm = () => {
    setFormData(initialFormState)
    setFormErrors({})
  }

  const openCreateDialog = () => {
    resetForm()
    setCreateDialogOpen(true)
  }

  const closeCreateDialog = () => {
    setCreateDialogOpen(false)
    resetForm()
  }

  const closeEditDialog = () => {
    setEditDialogOpen(false)
    setSelectedUser(null)
    resetForm()
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const toggleRoleSelection = (roleId) => {
    setFormData((prev) => {
      const exists = prev.role_ids.includes(roleId)
      const role_ids = exists
        ? prev.role_ids.filter((id) => id !== roleId)
        : [...prev.role_ids, roleId]
      return { ...prev, role_ids }
    })
  }

  const validateForm = (data, { requirePassword }) => {
    const errors = {}
    if (!data.username.trim()) errors.username = '请输入用户名'
    if (!data.name.trim()) errors.name = '请输入姓名'
    if (!data.nickname.trim()) errors.nickname = '请输入昵称'
    if (!data.email.trim()) {
      errors.email = '请输入邮箱'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      errors.email = '请输入合法邮箱'
    }
    if (requirePassword && !data.password.trim()) {
      errors.password = '请输入初始密码'
    }
    return errors
  }

  const buildRoleObjects = (roleIds) => {
    return roleIds.map((id) => {
      const current = roles.find((role) => role.id === id)
      if (current) {
        return { id: current.id, name: current.name }
      }
      return { id }
    })
  }

  const buildPayload = (data, { requirePassword }) => {
    const roleIds = data.role_ids.map((id) => Number(id))
    const payload = {
      username: data.username.trim(),
      name: data.name.trim(),
      nickname: data.nickname.trim(),
      email: data.email.trim(),
      public_key: data.public_key.trim() || undefined,
      role_ids: roleIds,
      roles: buildRoleObjects(roleIds),
    }
    if (data.password.trim()) {
      payload.password = data.password.trim()
    } else if (requirePassword) {
      payload.password = ''
    }
    return payload
  }

  const getErrorMessage = (error) => {
    if (error?.data?.msg) return error.data.msg
    if (error?.message) return error.message
    return '操作失败，请稍后重试'
  }

  const handleCreateSubmit = async (event) => {
    event.preventDefault()
    const errors = validateForm(formData, { requirePassword: true })
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    try {
      setFormSubmitting(true)
      const payload = buildPayload(formData, { requirePassword: true })
      await api.createUser(payload)
      await loadUsers()
      closeCreateDialog()
      window.alert('用户创建成功')
    } catch (error) {
      logger.error('创建用户失败:', error)
      window.alert(getErrorMessage(error))
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()
    if (!selectedUser) return
    const errors = validateForm(formData, { requirePassword: false })
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }
    try {
      setFormSubmitting(true)
      const payload = buildPayload(formData, { requirePassword: false })
      if (!payload.password) {
        delete payload.password
      }
      await api.updateUser(selectedUser.id, payload)
      await loadUsers()
      closeEditDialog()
      window.alert('用户更新成功')
    } catch (error) {
      logger.error('更新用户失败:', error)
      window.alert(getErrorMessage(error))
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setFormData({
      username: user.username || '',
      name: user.name || '',
      nickname: user.nickname || '',
      email: user.email || '',
      password: '',
      public_key: user.public_key || '',
      role_ids: user.roles ? user.roles.map((role) => role.id) : [],
    })
    setFormErrors({})
    setEditDialogOpen(true)
  }

  const handleDelete = async (user) => {
    if (!confirm(`确定要删除用户 "${user.username}" 吗？`)) {
      return
    }
    try {
      await api.deleteUser(user.id)
      await loadUsers()
      window.alert('用户已删除')
    } catch (error) {
      logger.error('删除用户失败:', error)
      window.alert(getErrorMessage(error))
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">用户管理</h1>
          <p className="mt-2 text-sm text-gray-600">管理系统用户和访问权限</p>
        </div>
        <Button
          onClick={openCreateDialog}
          className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-4 py-2 text-white shadow-lg transition-all hover:scale-[1.02] hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600"
        >
          添加用户
        </Button>
      </div>

      {/* 筛选器和列控制 */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
        <div className="flex flex-1 gap-4">
          <Input
            placeholder="搜索用户名、邮箱或姓名..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="max-w-xs"
          />

          {/* 角色筛选 */}
          {allRoles.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <span>角色</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>筛选角色</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={roleFilter === "all"}
                  onCheckedChange={() => setRoleFilter("all")}
                >
                  全部
                </DropdownMenuCheckboxItem>
                {allRoles.map((role) => (
                  <DropdownMenuCheckboxItem
                    key={role}
                    checked={roleFilter === role}
                    onCheckedChange={() => setRoleFilter(role)}
                  >
                    {role}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* 状态筛选 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <span>状态</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>筛选状态</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={statusFilter === "all"}
                onCheckedChange={() => setStatusFilter("all")}
              >
                全部
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "active"}
                onCheckedChange={() => setStatusFilter("active")}
              >
                活跃
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "disabled"}
                onCheckedChange={() => setStatusFilter("disabled")}
              >
                已禁用
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 列显示控制 */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Columns className="h-4 w-4" />
              <span>列</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>切换列显示</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {allColumns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column}
                className="capitalize"
                checked={visibleColumns.has(column)}
                onCheckedChange={() => toggleColumn(column)}
              >
                {column === "username" ? "用户名" :
                  column === "email" ? "邮箱" :
                    column === "name" ? "姓名" :
                      column === "roles" ? "角色" :
                        column === "createdAt" ? "创建时间" :
                          column === "status" ? "状态" :
                            column === "actions" ? "操作" : column}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 数据表格 */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : (
        <UserDataTable
          users={filteredUsers}
          visibleColumns={visibleColumns}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <Dialog open={createDialogOpen} onOpenChange={(open) => { if (!open) closeCreateDialog() }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>添加用户</DialogTitle>
            <DialogDescription>填写基本信息并为用户分配角色</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="create-username">用户名</Label>
                <Input
                  id="create-username"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                />
                {formErrors.username && <p className="text-sm text-red-500">{formErrors.username}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-name">姓名</Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-nickname">昵称</Label>
                <Input
                  id="create-nickname"
                  value={formData.nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value)}
                />
                {formErrors.nickname && <p className="text-sm text-red-500">{formErrors.nickname}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-email">邮箱</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-password">初始密码</Label>
              <Input
                id="create-password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
              {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-public-key">SSH 公钥（可选）</Label>
              <Textarea
                id="create-public-key"
                placeholder="ssh-ed25519 AAAA..."
                value={formData.public_key}
                onChange={(e) => handleInputChange('public_key', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>角色分配</Label>
              {roles.length === 0 ? (
                <p className="text-sm text-muted-foreground">暂无角色可用，请先创建角色</p>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={formData.role_ids.includes(role.id)}
                        onChange={() => toggleRoleSelection(role.id)}
                      />
                      {role.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeCreateDialog} disabled={formSubmitting}>
                取消
              </Button>
              <Button type="submit" disabled={formSubmitting}>
                {formSubmitting ? '提交中...' : '创建'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={(open) => { if (!open) closeEditDialog() }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>编辑用户</DialogTitle>
            <DialogDescription>更新用户信息，不修改的字段保持不变</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>用户名</Label>
                <Input value={formData.username} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">姓名</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
                {formErrors.name && <p className="text-sm text-red-500">{formErrors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-nickname">昵称</Label>
                <Input
                  id="edit-nickname"
                  value={formData.nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value)}
                />
                {formErrors.nickname && <p className="text-sm text-red-500">{formErrors.nickname}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">邮箱</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
                {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">密码</Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="留空则保持不变"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-public-key">SSH 公钥（可选）</Label>
              <Textarea
                id="edit-public-key"
                placeholder="ssh-ed25519 AAAA..."
                value={formData.public_key}
                onChange={(e) => handleInputChange('public_key', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>角色分配</Label>
              {roles.length === 0 ? (
                <p className="text-sm text-muted-foreground">暂无角色可用，请先创建角色</p>
              ) : (
                <div className="flex flex-wrap gap-4">
                  {roles.map((role) => (
                    <label key={role.id} className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        className="h-4 w-4"
                        checked={formData.role_ids.includes(role.id)}
                        onChange={() => toggleRoleSelection(role.id)}
                      />
                      {role.name}
                    </label>
                  ))}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={closeEditDialog} disabled={formSubmitting}>
                取消
              </Button>
              <Button type="submit" disabled={formSubmitting}>
                {formSubmitting ? '提交中...' : '保存'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
