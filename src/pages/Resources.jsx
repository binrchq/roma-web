import { useState, useEffect, useMemo } from 'react'
import { api } from '../api/roma'
import { ResourceDataTable } from '@/components/ui/resource-data-table'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ListFilter, Columns, Plus, ChevronLeft, ChevronRight } from 'lucide-react'
import { showToast } from '@/utils/toast'

const resourceTypes = [
  { value: 'linux', label: 'Linux 服务器' },
  { value: 'windows', label: 'Windows 服务器' },
  { value: 'docker', label: 'Docker 容器' },
  { value: 'database', label: '数据库' },
  { value: 'router', label: '路由器' },
  { value: 'switch', label: '交换机' },
]

const allColumns = ["type", "name", "host", "port", "description", "role", "space", "createdAt", "status", "actions"]

// 资源字段映射（根据类型）
const getResourceFields = (type) => {
  const commonFields = [
    { key: 'id', label: 'ID', type: 'number' },
    { key: 'description', label: '描述', type: 'text' },
    { key: 'created_at', label: '创建时间', type: 'datetime' },
    { key: 'updated_at', label: '更新时间', type: 'datetime' },
  ]

  switch (type) {
    case 'linux':
      return [
        { key: 'hostname', label: '主机名', type: 'text', required: true },
        { key: 'port', label: 'SSH端口', type: 'number' },
        { key: 'port_actual', label: '实际SSH端口', type: 'number' },
        { key: 'ipv4_pub', label: '公网IPv4', type: 'text' },
        { key: 'ipv4_priv', label: '内网IPv4', type: 'text' },
        { key: 'ipv6', label: 'IPv6', type: 'text' },
        { key: 'port_ipv6', label: 'IPv6端口', type: 'number' },
        { key: 'username', label: '用户名', type: 'text' },
        { key: 'password', label: '密码', type: 'password' },
        { key: 'private_key', label: '私钥', type: 'textarea' },
        ...commonFields,
      ]
    case 'windows':
      return [
        { key: 'hostname', label: '主机名', type: 'text', required: true },
        { key: 'port', label: 'RDP端口', type: 'number' },
        { key: 'ipv4_pub', label: '公网IPv4', type: 'text' },
        { key: 'ipv4_priv', label: '内网IPv4', type: 'text' },
        { key: 'ipv6', label: 'IPv6', type: 'text' },
        { key: 'port_ipv6', label: 'RDP端口IPv6', type: 'number' },
        { key: 'username', label: '用户名', type: 'text' },
        { key: 'password', label: '密码', type: 'password' },
        ...commonFields,
      ]
    case 'docker':
      return [
        { key: 'hostname', label: '容器名称', type: 'text', required: true },
        { key: 'port', label: 'SSH端口', type: 'number' },
        { key: 'ipv4_priv', label: '内网IPv4', type: 'text' },
        { key: 'ipv6', label: 'IPv6', type: 'text' },
        { key: 'port_ipv6', label: 'IPv6端口', type: 'number' },
        { key: 'username', label: '用户名', type: 'text' },
        { key: 'password', label: '密码', type: 'password' },
        { key: 'private_key', label: '私钥', type: 'textarea' },
        ...commonFields,
      ]
    case 'database':
      return [
        { key: 'database_nick', label: '数据库名称', type: 'text', required: true },
        { key: 'database_name', label: '数据库名', type: 'text' },
        { key: 'database_type', label: '数据库类型', type: 'text' },
        { key: 'port', label: '端口', type: 'number' },
        { key: 'ipv4_pub', label: '公网IPv4', type: 'text' },
        { key: 'ipv4_priv', label: '内网IPv4', type: 'text' },
        { key: 'ipv6', label: 'IPv6', type: 'text' },
        { key: 'username', label: '用户名', type: 'text' },
        { key: 'password', label: '密码', type: 'password' },
        { key: 'private_key', label: '私钥', type: 'textarea' },
        ...commonFields,
      ]
    case 'router':
      return [
        { key: 'router_name', label: '路由器名称', type: 'text', required: true },
        { key: 'web_port', label: 'Web管理端口', type: 'number' },
        { key: 'web_username', label: 'Web用户名', type: 'text' },
        { key: 'web_password', label: 'Web密码', type: 'password' },
        { key: 'port', label: 'SSH端口', type: 'number' },
        { key: 'ipv4_pub', label: '公网IPv4', type: 'text' },
        { key: 'ipv4_priv', label: '内网IPv4', type: 'text' },
        { key: 'ipv6', label: 'IPv6', type: 'text' },
        { key: 'username', label: 'SSH用户名', type: 'text' },
        { key: 'password', label: 'SSH密码', type: 'password' },
        { key: 'private_key', label: 'SSH私钥', type: 'textarea' },
        ...commonFields,
      ]
    case 'switch':
      return [
        { key: 'switch_name', label: '交换机名称', type: 'text', required: true },
        { key: 'port', label: 'SSH端口', type: 'number' },
        { key: 'port_actual', label: '实际SSH端口', type: 'number' },
        { key: 'ipv4_pub', label: '公网IPv4', type: 'text' },
        { key: 'ipv4_priv', label: '内网IPv4', type: 'text' },
        { key: 'ipv6', label: 'IPv6', type: 'text' },
        { key: 'port_ipv6', label: 'IPv6端口', type: 'number' },
        { key: 'username', label: '用户名', type: 'text' },
        { key: 'password', label: '密码', type: 'password' },
        ...commonFields,
      ]
    default:
      return commonFields
  }
}

export default function Resources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState("all")
  const [nameFilter, setNameFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [roleFilter, setRoleFilter] = useState("all")
  const [spaceFilter, setSpaceFilter] = useState("all")
  const [visibleColumns, setVisibleColumns] = useState(new Set(allColumns))

  // 分页
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)

  // 对话框状态
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addTypeDialogOpen, setAddTypeDialogOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState(null)
  const [selectedType, setSelectedType] = useState('')
  const [formData, setFormData] = useState({})
  const [roles, setRoles] = useState([])
  const [selectedRole, setSelectedRole] = useState('')

  useEffect(() => {
    loadResources()
    loadRoles()
  }, [typeFilter, page])

  const loadRoles = async () => {
    try {
      const data = await api.getRoles()
      setRoles(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('加载角色列表失败:', error)
      setRoles([])
    }
  }

  const loadResources = async () => {
    try {
      setLoading(true)
      const data = await api.getResources(typeFilter === 'all' ? '' : typeFilter, page, pageSize)
      const resourceList = Array.isArray(data) ? data : []
      // 确保每个资源都有 type 字段（从资源类型推断或从数据中获取）
      const resourcesWithType = resourceList.map(resource => {
        // 如果资源没有 type 字段，根据字段推断类型
        if (!resource.type) {
          if (resource.database_nick) {
            resource.type = 'database'
          } else if (resource.router_name) {
            resource.type = 'router'
          } else if (resource.switch_name) {
            resource.type = 'switch'
          } else if (resource.hostname) {
            resource.type = typeFilter !== 'all' ? typeFilter : 'linux' // 默认推断为 linux
          } else {
            resource.type = typeFilter !== 'all' ? typeFilter : 'linux'
          }
        }
        return resource
      })
      setResources(resourcesWithType)
      // 如果后端返回分页信息，使用后端的总数
      // setTotal(data.total || resourceList.length)
      setTotal(resourceList.length)
    } catch (error) {
      console.error('加载资源失败:', error)
      setResources([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  // 获取所有角色和空间列表（用于过滤器）
  const allRoles = useMemo(() => {
    const roleSet = new Set()
    resources.forEach(resource => {
      if (resource.roles && Array.isArray(resource.roles)) {
        resource.roles.forEach(role => {
          if (role && role.name) {
            roleSet.add(role.name)
          }
        })
      }
    })
    return Array.from(roleSet)
  }, [resources])

  const allSpaces = useMemo(() => {
    const spaceSet = new Set()
    resources.forEach(resource => {
      if (resource.space && resource.space.name) {
        spaceSet.add(resource.space.name)
      }
    })
    return Array.from(spaceSet)
  }, [resources])

  const filteredResources = useMemo(() => {
    let filtered = resources.filter((resource) => {
      const nameMatch = nameFilter === "" ||
        (resource.name || resource.hostname || resource.database_nick || resource.router_name || resource.switch_name || "").toLowerCase().includes(nameFilter.toLowerCase())

      const isEnabled = !resource.deleted_at
      const statusMatch = statusFilter === "all" ||
        (statusFilter === "enabled" && isEnabled) ||
        (statusFilter === "disabled" && !isEnabled)

      // 角色过滤
      const roleMatch = roleFilter === "all" ||
        (resource.roles && Array.isArray(resource.roles) &&
          resource.roles.some(r => r && r.name === roleFilter))

      // 空间过滤
      const spaceMatch = spaceFilter === "all" ||
        (resource.space && resource.space.name === spaceFilter)

      return nameMatch && statusMatch && roleMatch && spaceMatch
    })

    // 前端分页
    const start = (page - 1) * pageSize
    const end = start + pageSize
    setTotal(filtered.length)
    return filtered.slice(start, end)
  }, [resources, nameFilter, statusFilter, roleFilter, spaceFilter, page, pageSize])

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

  const handleView = async (resource) => {
    try {
      // 从后端获取完整资源详情
      const data = await api.getResourceById(resource.id, resource.type)
      setSelectedResource(data)
      setViewDialogOpen(true)
    } catch (error) {
      console.error('获取资源详情失败:', error)
      // 如果获取失败，使用当前资源数据
      setSelectedResource(resource)
      setViewDialogOpen(true)
    }
  }

  const handleEdit = async (resource) => {
    try {
      // 从后端获取完整资源详情
      const data = await api.getResourceById(resource.id, resource.type)
      setSelectedResource(data)
      setFormData(data.resource || data)
      // 设置角色信息
      if (data.role) {
        setSelectedRole(data.role.name || '')
      } else {
        setSelectedRole('')
      }
      setEditDialogOpen(true)
    } catch (error) {
      console.error('获取资源详情失败:', error)
      // 如果获取失败，使用当前资源数据
      setSelectedResource(resource)
      setFormData(resource)
      setSelectedRole('')
      setEditDialogOpen(true)
    }
  }

  const handleDelete = async (resource) => {
    if (confirm(`确定要删除资源 "${resource.name || resource.hostname || resource.database_nick || resource.router_name || resource.switch_name}" 吗？`)) {
      try {
        await api.deleteResource(resource.id, resource.type)
        await loadResources()
        showToast('删除成功', 'success')
      } catch (error) {
        console.error('删除资源失败:', error)
        showToast('删除失败: ' + (error.message || '未知错误'), 'error')
      }
    }
  }

  const handleAdd = () => {
    setAddTypeDialogOpen(true)
  }

  const handleTypeSelect = (type) => {
    setSelectedType(type)
    setFormData({ type })
    setSelectedRole('')
    setAddTypeDialogOpen(false)
    setAddDialogOpen(true)
  }

  const handleSave = async () => {
    try {
      // 转换数字字段
      const processedData = { ...formData }
      const resourceType = selectedResource?.type || selectedType

      if (processedData.id) processedData.id = Number(processedData.id)

      // 根据资源类型转换相应的数字字段
      switch (resourceType) {
        case 'linux':
          if (processedData.port !== undefined && processedData.port !== '') processedData.port = Number(processedData.port)
          if (processedData.port_actual !== undefined && processedData.port_actual !== '') processedData.port_actual = Number(processedData.port_actual)
          if (processedData.port_ipv6 !== undefined && processedData.port_ipv6 !== '') processedData.port_ipv6 = Number(processedData.port_ipv6)
          break
        case 'router':
          if (processedData.web_port !== undefined && processedData.web_port !== '') processedData.web_port = Number(processedData.web_port)
          if (processedData.port !== undefined && processedData.port !== '') processedData.port = Number(processedData.port)
          break
        case 'windows':
          if (processedData.port !== undefined && processedData.port !== '') processedData.port = Number(processedData.port)
          if (processedData.port_ipv6 !== undefined && processedData.port_ipv6 !== '') processedData.port_ipv6 = Number(processedData.port_ipv6)
          break
        case 'docker':
          if (processedData.port !== undefined && processedData.port !== '') processedData.port = Number(processedData.port)
          if (processedData.port_ipv6 !== undefined && processedData.port_ipv6 !== '') processedData.port_ipv6 = Number(processedData.port_ipv6)
          break
        case 'database':
          if (processedData.port !== undefined && processedData.port !== '') processedData.port = Number(processedData.port)
          break
        case 'switch':
          if (processedData.port !== undefined && processedData.port !== '') processedData.port = Number(processedData.port)
          if (processedData.port_actual !== undefined && processedData.port_actual !== '') processedData.port_actual = Number(processedData.port_actual)
          if (processedData.port_ipv6 !== undefined && processedData.port_ipv6 !== '') processedData.port_ipv6 = Number(processedData.port_ipv6)
          break
      }

      // 构建请求数据，包含角色信息
      const requestData = { ...processedData }
      if (selectedResource) {
        // 编辑 - 需要传递 type 参数
        requestData.type = selectedResource.type
      } else {
        // 新增 - 确保包含 type
        requestData.type = selectedType
      }
      if (selectedRole) {
        requestData.role = selectedRole
      }

      if (selectedResource) {
        await api.updateResource(selectedResource.id, requestData)
      } else {
        await api.createResource(requestData)
      }
      await loadResources()
      setEditDialogOpen(false)
      setAddDialogOpen(false)
      setFormData({})
      setSelectedResource(null)
      setSelectedType('')
      setSelectedRole('')
      showToast('保存成功', 'success')
    } catch (error) {
      console.error('保存资源失败:', error)
      showToast('保存失败: ' + (error.message || '未知错误'), 'error')
    }
  }

  const getResourceName = (resource) => {
    return resource.hostname || resource.database_nick || resource.router_name || resource.switch_name || resource.name || resource.id || "-"
  }

  const getResourceHost = (resource) => {
    return resource.ipv4_priv || resource.ipv4_pub || resource.host || "-"
  }

  const getResourcePort = (resource) => {
    return resource.port || resource.web_port || "-"
  }

  const renderField = (field, value) => {
    if (field.key === 'private_key') {
      const resourceData = selectedResource?.resource || selectedResource
      if (resourceData?.private_key_masked) {
        return resourceData.private_key_masked
      }
      if (resourceData?.has_private_key) {
        return '已配置'
      }
      return '未配置'
    }
    if (field.type === 'password' && value) {
      return '••••••••'
    }
    if (field.type === 'datetime' && value) {
      return new Date(value).toLocaleString('zh-CN')
    }
    return value || '-'
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">资源管理</h1>
          <p className="mt-2 text-sm text-gray-600">管理所有服务器、容器和网络设备</p>
        </div>
        <Button onClick={handleAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          新增
        </Button>
      </div>

      {/* 筛选器和列控制 */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
        <div className="flex flex-1 gap-4">
          <Input
            placeholder="搜索资源名称..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="max-w-xs"
          />

          {/* 资源类型筛选 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <ListFilter className="h-4 w-4" />
                <span>类型</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>筛选资源类型</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={typeFilter === "all"}
                onCheckedChange={() => {
                  setTypeFilter("all")
                  setPage(1)
                }}
              >
                全部
              </DropdownMenuCheckboxItem>
              {resourceTypes.map((type) => (
                <DropdownMenuCheckboxItem
                  key={type.value}
                  checked={typeFilter === type.value}
                  onCheckedChange={() => {
                    setTypeFilter(type.value)
                    setPage(1)
                  }}
                >
                  {type.label}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 状态筛选 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <ListFilter className="h-4 w-4" />
                <span>状态</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>筛选状态</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={statusFilter === "all"}
                onCheckedChange={() => {
                  setStatusFilter("all")
                  setPage(1)
                }}
              >
                全部
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "enabled"}
                onCheckedChange={() => {
                  setStatusFilter("enabled")
                  setPage(1)
                }}
              >
                启用
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "disabled"}
                onCheckedChange={() => {
                  setStatusFilter("disabled")
                  setPage(1)
                }}
              >
                未启用
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* 角色筛选 */}
          {allRoles.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <ListFilter className="h-4 w-4" />
                  <span>角色</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>筛选角色</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={roleFilter === "all"}
                  onCheckedChange={() => {
                    setRoleFilter("all")
                    setPage(1)
                  }}
                >
                  全部
                </DropdownMenuCheckboxItem>
                {allRoles.map((role) => (
                  <DropdownMenuCheckboxItem
                    key={role}
                    checked={roleFilter === role}
                    onCheckedChange={() => {
                      setRoleFilter(role)
                      setPage(1)
                    }}
                  >
                    {role}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* 空间筛选 */}
          {allSpaces.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <ListFilter className="h-4 w-4" />
                  <span>空间</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>筛选空间</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={spaceFilter === "all"}
                  onCheckedChange={() => {
                    setSpaceFilter("all")
                    setPage(1)
                  }}
                >
                  全部
                </DropdownMenuCheckboxItem>
                {allSpaces.map((space) => (
                  <DropdownMenuCheckboxItem
                    key={space}
                    checked={spaceFilter === space}
                    onCheckedChange={() => {
                      setSpaceFilter(space)
                      setPage(1)
                    }}
                  >
                    {space}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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
                {column === "type" ? "类型" :
                  column === "name" ? "名称" :
                    column === "host" ? "地址" :
                      column === "port" ? "端口" :
                        column === "description" ? "描述" :
                          column === "role" ? "角色" :
                            column === "space" ? "空间" :
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
        <>
          <ResourceDataTable
            resources={filteredResources}
            visibleColumns={visibleColumns}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {/* 分页 */}
          {total > 0 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                共 {total} 条，第 {page} / {Math.ceil(total / pageSize)} 页
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(Math.ceil(total / pageSize), p + 1))}
                  disabled={page >= Math.ceil(total / pageSize)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 查看详情对话框 */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>资源详情</DialogTitle>
            <DialogDescription>
              {selectedResource && `类型: [${selectedResource.type}]`}
            </DialogDescription>
          </DialogHeader>
          {selectedResource && (
            <div className="grid gap-4 py-4">
              {getResourceFields(selectedResource.type).map((field) => (
                <div key={field.key} className="grid grid-cols-4 gap-4 items-center">
                  <Label className="text-right">{field.label}</Label>
                  <div className="col-span-3 text-sm">
                    {renderField(field, selectedResource[field.key])}
                  </div>
                </div>
              ))}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑资源</DialogTitle>
            <DialogDescription>
              {selectedResource && `类型: [${selectedResource.type}]`}
            </DialogDescription>
          </DialogHeader>
          {selectedResource && (
            <div className="grid gap-4 py-4">
              {getResourceFields(selectedResource.type).filter(f => f.key !== 'id' && f.key !== 'created_at' && f.key !== 'updated_at').map((field) => (
                <div key={field.key} className="grid grid-cols-4 gap-4 items-center">
                  <Label className="text-right">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="col-span-3">
                    {field.type === 'textarea' ? (
                      <textarea
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        rows={3}
                      />
                    ) : (
                      <Input
                        type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      />
                    )}
                  </div>
                </div>
              ))}
              {/* 角色选择 */}
              <div className="grid grid-cols-4 gap-4 items-center">
                <Label className="text-right">角色</Label>
                <div className="col-span-3">
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-white"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="">请选择角色（可选）</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name} - {role.desc || ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">为资源分配角色，用于权限控制</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditDialogOpen(false)
              setSelectedRole('')
            }}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 选择类型对话框 */}
      <Dialog open={addTypeDialogOpen} onOpenChange={setAddTypeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>选择资源类型</DialogTitle>
            <DialogDescription>请选择要创建的资源类型</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {resourceTypes.map((type) => (
              <Button
                key={type.value}
                variant="outline"
                onClick={() => handleTypeSelect(type.value)}
                className="h-20 flex flex-col items-center justify-center"
              >
                <span className="font-semibold">{type.label}</span>
                <span className="text-xs text-gray-500">[{type.value}]</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* 新增对话框 */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增资源</DialogTitle>
            <DialogDescription>
              {selectedType && `类型: [${selectedType}]`}
            </DialogDescription>
          </DialogHeader>
          {selectedType && (
            <div className="grid gap-4 py-4">
              {getResourceFields(selectedType).filter(f => f.key !== 'id' && f.key !== 'created_at' && f.key !== 'updated_at').map((field) => (
                <div key={field.key} className="grid grid-cols-4 gap-4 items-center">
                  <Label className="text-right">
                    {field.label}
                    {field.required && <span className="text-red-500">*</span>}
                  </Label>
                  <div className="col-span-3">
                    {field.type === 'textarea' ? (
                      <textarea
                        className="w-full px-3 py-2 border rounded-md"
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                        rows={3}
                      />
                    ) : (
                      <Input
                        type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
                        value={formData[field.key] || ''}
                        onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                      />
                    )}
                  </div>
                </div>
              ))}
              {/* 角色选择 */}
              <div className="grid grid-cols-4 gap-4 items-center">
                <Label className="text-right">角色</Label>
                <div className="col-span-3">
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-white"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                  >
                    <option value="">请选择角色（可选）</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.name}>
                        {role.name} - {role.desc || ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">为资源分配角色，用于权限控制</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddDialogOpen(false)
              setFormData({})
              setSelectedType('')
              setSelectedRole('')
            }}>取消</Button>
            <Button onClick={handleSave}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
