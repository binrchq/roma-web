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
    { key: 'hostname', label: '容器名称', type: 'text', required: true, placeholder: '例如: docker-container-01', description: 'Docker容器的名称或标识', group: '基础信息' },
    { key: 'port', label: 'SSH端口', type: 'number', placeholder: '22', description: '容器内SSH服务的端口号', group: '连接信息' },
    { key: 'ipv4_priv', label: '内网IPv4地址', type: 'text', placeholder: '例如: 172.17.0.2', description: '容器的内网IPv4地址（Docker网络）', group: '连接信息' },
    { key: 'ipv6', label: 'IPv6地址', type: 'text', placeholder: '例如: 2001:db8::1', description: '容器的IPv6地址（可选）', group: '连接信息' },
    { key: 'port_ipv6', label: 'IPv6端口', type: 'number', placeholder: '22', description: 'IPv6连接的SSH端口号', group: '连接信息' },
    { key: 'username', label: 'SSH用户名', type: 'text', placeholder: '例如: root', description: '用于SSH登录的用户名', group: '认证信息' },
    { key: 'password', label: 'SSH密码', type: 'password', placeholder: '输入密码', description: '用于SSH登录的密码（与私钥二选一）', group: '认证信息' },
    { key: 'private_key', label: 'SSH私钥', type: 'textarea', placeholder: '-----BEGIN RSA PRIVATE KEY-----...', description: 'SSH私钥内容（与密码二选一），支持RSA、ECDSA等格式', group: '认证信息' },
    { key: 'description', label: '描述', type: 'text', placeholder: '例如: 生产环境应用容器', description: '资源的描述信息，便于识别和管理', group: '其他信息' },
    { key: 'created_at', label: '创建时间', type: 'datetime', group: '其他信息' },
    { key: 'updated_at', label: '更新时间', type: 'datetime', group: '其他信息' },
  ]
}

export default function DockerResources() {
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
  const [spaces, setSpaces] = useState([])
  const [selectedSpace, setSelectedSpace] = useState('')

  useEffect(() => {
    loadResources()
    loadSpaces()
  }, [page])

  const loadResources = async () => {
    try {
      setLoading(true)
      const data = await api.getResources('docker', page, pageSize)
      const resourceList = Array.isArray(data) ? data : []
      const resourcesWithType = resourceList.map(resource => ({
        ...resource,
        type: 'docker'
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

  const loadSpaces = async () => {
    try {
      const data = await api.getSpaces()
      const spacesList = Array.isArray(data) ? data : []
      setSpaces(spacesList)
      if (!selectedSpace && spacesList.length > 0) {
        const defaultSpace = spacesList.find(s => s.name === 'default')
        if (defaultSpace) {
          setSelectedSpace(defaultSpace.id.toString())
        } else {
          setSelectedSpace(spacesList[0].id.toString())
        }
      }
    } catch (error) {
      console.error('加载空间列表失败:', error)
      setSpaces([])
    }
  }

  const filteredResources = useMemo(() => {
    let filtered = resources.filter((resource) => {
      const nameMatch = nameFilter === "" ||
        (resource.hostname || "").toLowerCase().includes(nameFilter.toLowerCase())

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
      const data = await api.getResourceById(resource.id, 'docker')
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
      const data = await api.getResourceById(resource.id, 'docker')
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
    if (confirm(`确定要删除资源 "${resource.hostname}" 吗？`)) {
      try {
        await api.deleteResource(resource.id, 'docker')
        await loadResources()
      } catch (error) {
        console.error('删除资源失败:', error)
        alert('删除失败')
      }
    }
  }

  const handleSave = async () => {
    try {
      // 转换数字字段
      const processedData = { ...formData }
      if (processedData.id) processedData.id = Number(processedData.id)
      if (processedData.port !== undefined && processedData.port !== '') processedData.port = Number(processedData.port)
      if (processedData.port_ipv6 !== undefined && processedData.port_ipv6 !== '') processedData.port_ipv6 = Number(processedData.port_ipv6)

      // 添加空间ID
      const requestData = { ...processedData, type: 'docker' }
      if (selectedSpace) {
        requestData.space_id = parseInt(selectedSpace)
      } else if (spaces.length > 0) {
        const defaultSpace = spaces.find(s => s.name === 'default')
        if (defaultSpace) {
          requestData.space_id = defaultSpace.id
        } else {
          requestData.space_id = spaces[0].id
        }
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
      setSelectedSpace('')
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
          <h1 className="text-3xl font-bold text-gray-900">Docker 容器</h1>
          <p className="mt-2 text-sm text-gray-600">管理 Docker 容器资源</p>
        </div>
        <Button onClick={() => {
          setFormData({ type: 'docker' })
          if (spaces.length > 0) {
            const defaultSpace = spaces.find(s => s.name === 'default')
            setSelectedSpace(defaultSpace ? defaultSpace.id.toString() : spaces[0].id.toString())
          }
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
            <DialogDescription>类型: [docker]</DialogDescription>
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
            <DialogDescription>类型: [docker]</DialogDescription>
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
              {/* 空间选择 */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">空间</h3>
                <div className="grid grid-cols-4 gap-4">
                  <Label className="text-right pt-2">空间</Label>
                  <div className="col-span-3 space-y-1">
                    <select
                      className="w-full px-3 py-2 border rounded-md bg-white"
                      value={selectedSpace}
                      onChange={(e) => setSelectedSpace(e.target.value)}
                    >
                      {spaces.map((space) => (
                        <option key={space.id} value={space.id.toString()}>
                          {space.name} {space.name === 'default' ? '(默认)' : ''}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 dark:text-gray-400">选择资源所属空间，不选择则使用默认空间</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditDialogOpen(false)
              setSelectedSpace('')
            }}>取消</Button>
            <Button onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新增资源</DialogTitle>
            <DialogDescription>类型: [docker]</DialogDescription>
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
            {/* 空间选择 */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 border-b pb-2">空间</h3>
              <div className="grid grid-cols-4 gap-4">
                <Label className="text-right pt-2">空间</Label>
                <div className="col-span-3 space-y-1">
                  <select
                    className="w-full px-3 py-2 border rounded-md bg-white"
                    value={selectedSpace}
                    onChange={(e) => setSelectedSpace(e.target.value)}
                  >
                    {spaces.map((space) => (
                      <option key={space.id} value={space.id.toString()}>
                        {space.name} {space.name === 'default' ? '(默认)' : ''}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">选择资源所属空间，不选择则使用默认空间</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setAddDialogOpen(false)
              setFormData({})
              setSelectedSpace('')
            }}>取消</Button>
            <Button onClick={handleSave}>创建</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

