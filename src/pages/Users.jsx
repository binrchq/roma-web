import { useState, useEffect, useMemo } from 'react'
import { api } from '../api/roma'
import { UserDataTable } from '@/components/ui/user-data-table'
import { Input } from '@/components/ui/input'
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

const allColumns = ["username", "email", "name", "roles", "createdAt", "status", "actions"]

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchFilter, setSearchFilter] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [visibleColumns, setVisibleColumns] = useState(new Set(allColumns))

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const data = await api.getUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('加载用户失败:', error)
      setUsers([])
    } finally {
      setLoading(false)
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

  const handleEdit = (user) => {
    console.log('编辑用户:', user)
    // TODO: 实现编辑功能
  }

  const handleDelete = (user) => {
    if (confirm(`确定要删除用户 "${user.username}" 吗？`)) {
      console.log('删除用户:', user)
      // TODO: 实现删除功能
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">用户管理</h1>
          <p className="mt-2 text-sm text-gray-600">管理系统用户和访问权限</p>
        </div>
        <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
          添加用户
        </button>
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
    </div>
  )
}
