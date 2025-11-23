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

const allColumns = ["name", "host", "port", "description", "createdAt", "status", "actions"]

const getResourceFields = () => {
  return [
    { key: 'id', label: 'ID', type: 'number', group: '基础信息' },
    { key: 'switch_name', label: '交换机名称', type: 'text', required: true, placeholder: '例如: access-switch-01', description: '交换机的名称或标识', group: '基础信息' },
    { key: 'port', label: 'SSH端口', type: 'number', placeholder: '22', description: '默认SSH端口号，通常为22', group: '连接信息' },
    { key: 'port_actual', label: '实际SSH端口', type: 'number', placeholder: '22', description: '实际使用的SSH端口号，可能与默认端口不同', group: '连接信息' },
    { key: 'ipv4_pub', label: '公网IPv4地址', type: 'text', placeholder: '例如: 203.0.113.1', description: '交换机的公网IPv4地址', group: '连接信息' },
    { key: 'ipv4_priv', label: '内网IPv4地址', type: 'text', placeholder: '例如: 192.168.1.2', description: '交换机的内网IPv4地址', group: '连接信息' },
    { key: 'ipv6', label: 'IPv6地址', type: 'text', placeholder: '例如: 2001:db8::1', description: '交换机的IPv6地址（可选）', group: '连接信息' },
    { key: 'port_ipv6', label: 'IPv6端口', type: 'number', placeholder: '22', description: 'IPv6连接的SSH端口号', group: '连接信息' },
    { key: 'username', label: 'SSH用户名', type: 'text', placeholder: '例如: admin', description: '用于SSH登录的用户名', group: '认证信息' },
    { key: 'password', label: 'SSH密码', type: 'password', placeholder: '输入密码', description: '用于SSH登录的密码', group: '认证信息' },
    { key: 'description', label: '描述', type: 'text', placeholder: '例如: 接入层交换机', description: '资源的描述信息，便于识别和管理', group: '其他信息' },
    { key: 'created_at', label: '创建时间', type: 'datetime', group: '其他信息' },
    { key: 'updated_at', label: '更新时间', type: 'datetime', group: '其他信息' },
  ]
}

export default function SwitchResources() {
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [nameFilter, setNameFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [visibleColumns, setVisibleColumns] = useState(new Set(allColumns))

  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)

  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState(null)
  const [formData, setFormData] = useState({})

  useEffect(() => {
    loadResources()
  }, [page])

  const loadResources = async () => {
    try {
      setLoading(true)
      const data = await api.getResources('switch', page, pageSize)
      const resourceList = Array.isArray(data) ? data : []
      const resourcesWithType = resourceList.map(resource => ({
        ...resource,
        type: 'switch'
      }))
      setResources(resourcesWithType)
      setTotal(resourceList.length)
    } catch (error) {
      console.error('加载资源失败:', error)
      setResources([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const filteredResources = useMemo(() => {
    let filtered = resources.filter((resource) => {
      const nameMatch = nameFilter === "" ||
        (resource.switch_name || "").toLowerCase().includes(nameFilter.toLowerCase())

      const isEnabled = !resource.deleted_at
      const statusMatch = statusFilter === "all" ||
        (statusFilter === "enabled" && isEnabled) ||
        (statusFilter === "disabled" && !isEnabled)

      return nameMatch && statusMatch
    })

    const start = (page - 1) * pageSize
    const end = start + pageSize
    setTotal(filtered.length)
    return filtered.slice(start, end)
  }, [resources, nameFilter, statusFilter, page, pageSize])

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
      const data = await api.getResourceById(resource.id, 'switch')
      setSelectedResource(data)
      setViewDialogOpen(true)
    } catch (error) {
      console.error('获取资源详情失败:', error)
      setSelectedResource(resource)
      setViewDialogOpen(true)
    }
  }

  const handleEdit = async (resource) => {
    try {
      const data = await api.getResourceById(resource.id, 'switch')
      setSelectedResource(data)
      setFormData(data)
      setEditDialogOpen(true)
    } catch (error) {
      console.error('获取资源详情失败:', error)
      setSelectedResource(resource)
      setFormData(resource)
      setEditDialogOpen(true)
    }
  }

  const handleDelete = async (resource) => {
    if (confirm(`确定要删除资源 "${resource.switch_name}" 吗？`)) {
      try {
        await api.deleteResource(resource.id, 'switch')
        await loadResources()
      } catch (error) {
        console.error('删除资源失败:', error)
        alert('删除失败')
      }
    }
  }

  const handleSave = async () => {
    try {
      if (selectedResource) {
        await api.updateResource(selectedResource.id, { ...formData, type: 'switch' })
      } else {
        await api.createResource({ ...formData, type: 'switch' })
      }
      await loadResources()
      setEditDialogOpen(false)
      setAddDialogOpen(false)
      setFormData({})
      setSelectedResource(null)
    } catch (error) {
      console.error('保存资源失败:', error)
      alert('保存失败: ' + (error.message || '未知错误'))
    }
  }

  const renderField = (field, value) => {
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
          <h1 className="text-3xl font-bold text-gray-900">交换机</h1>
          <p className="mt-2 text-sm text-gray-600">管理交换机资源</p>
        </div>
        <Button onClick={() => {
          setFormData({ type: 'switch' })
          setAddDialogOpen(true)
        }} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          新增
        </Button>
      </div>

      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center">
        <div className="flex flex-1 gap-4">
          <Input
            placeholder="搜索主机名..."
            value={nameFilter}
            onChange={(e) => setNameFilter(e.target.value)}
            className="max-w-xs"
          />

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
        </div>

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
                {column === "name" ? "名称" :
                  column === "host" ? "地址" :
                    column === "port" ? "端口" :
                      column === "description" ? "描述" :
                        column === "createdAt" ? "创建时间" :
                          column === "status" ? "状态" :
                            column === "actions" ? "操作" : column}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

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

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>资源详情</DialogTitle>
            <DialogDescription>类型: [switch]</DialogDescription>
          </DialogHeader>
          {selectedResource && (
            <div className="grid gap-6 py-4">
              {(() => {
                const fields = getResourceFields()
                const groups = {}
                fields.forEach(field => {
                  const group = field.group || '其他'
                  if (!groups[group]) groups[group] = []
                  groups[group].push(field)
                })
                return Object.entries(groups).map(([groupName, groupFields]) => (
                  <div key={groupName} className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">{groupName}</h3>
                    {groupFields.map((field) => (
                      <div key={field.key} className="grid grid-cols-4 gap-4">
                        <Label className="text-right pt-2">{field.label}</Label>
                        <div className="col-span-3 text-sm space-y-1">
                          <div>{renderField(field, selectedResource[field.key])}</div>
                          {field.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{field.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              })()}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>编辑资源</DialogTitle>
            <DialogDescription>类型: [switch]</DialogDescription>
          </DialogHeader>
          {selectedResource && (
            <div className="grid gap-6 py-4">
              {(() => {
                const fields = getResourceFields().filter(f => f.key !== 'id' && f.key !== 'created_at' && f.key !== 'updated_at')
                const groups = {}
                fields.forEach(field => {
                  const group = field.group || '其他'
                  if (!groups[group]) groups[group] = []
                  groups[group].push(field)
                })
                return Object.entries(groups).map(([groupName, groupFields]) => (
                  <div key={groupName} className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">{groupName}</h3>
                    {groupFields.map((field) => (
                      <div key={field.key} className="grid grid-cols-4 gap-4">
                        <Label className="text-right pt-2">
                          {field.label}
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </Label>
                        <div className="col-span-3 space-y-1">
                          {field.type === 'textarea' ? (
                            <textarea
                              className="w-full px-3 py-2 border rounded-md"
                              value={formData[field.key] || ''}
                              onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                              placeholder={field.placeholder}
                              rows={4}
                            />
                          ) : (
                            <Input
                              type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
                              value={formData[field.key] || ''}
                              onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                              placeholder={field.placeholder}
                            />
                          )}
                          {field.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">{field.description}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              })()}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增资源</DialogTitle>
            <DialogDescription>类型: [switch]</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {(() => {
              const fields = getResourceFields().filter(f => f.key !== 'id' && f.key !== 'created_at' && f.key !== 'updated_at')
              const groups = {}
              fields.forEach(field => {
                const group = field.group || '其他'
                if (!groups[group]) groups[group] = []
                groups[group].push(field)
              })
              return Object.entries(groups).map(([groupName, groupFields]) => (
                <div key={groupName} className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">{groupName}</h3>
                  {groupFields.map((field) => (
                    <div key={field.key} className="grid grid-cols-4 gap-4">
                      <Label className="text-right pt-2">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </Label>
                      <div className="col-span-3 space-y-1">
                        {field.type === 'textarea' ? (
                          <textarea
                            className="w-full px-3 py-2 border rounded-md"
                            value={formData[field.key] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                            placeholder={field.placeholder}
                            rows={4}
                          />
                        ) : (
                          <Input
                            type={field.type === 'password' ? 'password' : field.type === 'number' ? 'number' : 'text'}
                            value={formData[field.key] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                            placeholder={field.placeholder}
                          />
                        )}
                        {field.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{field.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddDialogOpen(false)
              setFormData({})
            }}>取消</Button>
            <Button onClick={handleSave}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >
    </div >
  )
}

