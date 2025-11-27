import { useState, useEffect, useMemo } from 'react'
import { api } from '../api/roma'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Plus, Users as UsersIcon, Trash2 } from 'lucide-react'
import { logger } from '@/utils/logger'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const initialFormState = {
  name: '',
  description: '',
}

export default function Spaces() {
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchFilter, setSearchFilter] = useState("")
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [memberDialogOpen, setMemberDialogOpen] = useState(false)
  const [selectedSpace, setSelectedSpace] = useState(null)
  const [formData, setFormData] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState({})
  const [formSubmitting, setFormSubmitting] = useState(false)

  const [users, setUsers] = useState([])
  const [memberFormData, setMemberFormData] = useState({ user_id: '' })
  const [userDetailDialogOpen, setUserDetailDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => {
    loadSpaces()
    loadUsers()
  }, [])

  const loadSpaces = async () => {
    try {
      setLoading(true)
      const data = await api.getSpaces()
      setSpaces(Array.isArray(data) ? data : [])
    } catch (error) {
      logger.error('加载空间失败:', error)
      setSpaces([])
    } finally {
      setLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const data = await api.getUsers()
      setUsers(Array.isArray(data) ? data : [])
    } catch (error) {
      logger.error('加载用户失败:', error)
    }
  }


  const filteredSpaces = useMemo(() => {
    return spaces.filter((space) => {
      const searchMatch = searchFilter === "" ||
        space.name?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        space.description?.toLowerCase().includes(searchFilter.toLowerCase())
      return searchMatch
    })
  }, [spaces, searchFilter])

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

  const openMemberDialog = (space) => {
    setSelectedSpace(space)
    setMemberFormData({ user_id: '' })
    setMemberDialogOpen(true)
  }

  const closeMemberDialog = () => {
    setMemberDialogOpen(false)
    setSelectedSpace(null)
    setMemberFormData({ user_id: '' })
  }

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[field]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.name || formData.name.trim() === '') {
      errors.name = '空间名称不能为空'
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreate = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setFormSubmitting(true)
      await api.createSpace({
        name: formData.name.trim(),
        description: formData.description.trim() || '',
      })
      await loadSpaces()
      closeCreateDialog()
    } catch (error) {
      logger.error('创建空间失败:', error)
      alert('创建失败: ' + (error.message || '未知错误'))
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleAddMember = async () => {
    if (!memberFormData.user_id) {
      alert('请选择用户')
      return
    }

    try {
      const result = await api.addSpaceMember(selectedSpace.id, {
        user_id: parseInt(memberFormData.user_id),
      })
      logger.debug('添加成员成功:', result)

      // 重新加载空间详情以更新成员列表
      try {
        const spaceDetail = await api.getSpaceById(selectedSpace.id)
        setSelectedSpace(spaceDetail)
        await loadSpaces()
        // 清空表单
        setMemberFormData({ user_id: '' })
      } catch (reloadError) {
        logger.error('重新加载空间详情失败:', reloadError)
        // 即使重新加载失败，也清空表单并提示用户手动刷新
        setMemberFormData({ user_id: '' })
        alert('成员已添加，但刷新列表失败，请手动刷新页面')
      }
    } catch (error) {
      logger.error('添加成员失败:', error)
      // 检查是否是重复添加的错误
      if (error.message && error.message.includes('UNIQUE constraint') || error.message.includes('duplicate')) {
        alert('该用户已经是空间成员')
      } else {
        alert('添加成员失败: ' + (error.message || '未知错误'))
      }
    }
  }

  const handleRemoveMember = async (spaceId, userId) => {
    if (!confirm('确定要移除该成员吗？')) {
      return
    }

    try {
      await api.removeSpaceMember(spaceId, { user_id: userId })
      // 如果对话框打开，更新选中的空间信息
      if (memberDialogOpen && selectedSpace && selectedSpace.id === spaceId) {
        const spaceDetail = await api.getSpaceById(spaceId)
        setSelectedSpace(spaceDetail)
      }
      await loadSpaces()
    } catch (error) {
      logger.error('移除成员失败:', error)
      alert('移除成员失败: ' + (error.message || '未知错误'))
    }
  }

  if (loading) {
    return <div className="p-6">加载中...</div>
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">空间管理</h1>
          <p className="mt-2 text-sm text-gray-600">管理系统空间和成员</p>
        </div>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          创建空间
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="搜索空间名称或描述..."
          value={searchFilter}
          onChange={(e) => setSearchFilter(e.target.value)}
          className="max-w-xs"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>名称</TableHead>
              <TableHead>描述</TableHead>
              <TableHead>成员</TableHead>
              <TableHead>状态</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead>操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSpaces.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500">
                  暂无空间数据
                </TableCell>
              </TableRow>
            ) : (
              filteredSpaces.map((space) => (
                <TableRow key={space.id}>
                  <TableCell className="font-medium">{space.name}</TableCell>
                  <TableCell>{space.description || '-'}</TableCell>
                  <TableCell>
                    {space.members && space.members.length > 0 ? (
                      <div className="border rounded-md p-2 min-h-[60px] max-h-32 overflow-y-auto">
                        <div className="flex flex-wrap gap-2">
                          {space.members.map((member) => (
                            <button
                              key={member.id}
                              onClick={async () => {
                                try {
                                  const userDetail = await api.getUserById(member.user_id)
                                  setSelectedUser(userDetail)
                                  setUserDetailDialogOpen(true)
                                } catch (error) {
                                  logger.error('获取用户详情失败:', error)
                                  // 如果获取失败，使用已有信息
                                  setSelectedUser(member.user)
                                  setUserDetailDialogOpen(true)
                                }
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 transition-colors cursor-pointer"
                              title="点击查看用户详情"
                            >
                              {member.user?.username || member.user?.name || `用户${member.user_id}`}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-400">暂无成员</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${space.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                      {space.is_active ? '启用' : '禁用'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {space.created_at ? new Date(space.created_at).toLocaleString('zh-CN') : '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openMemberDialog(space)}
                        className="flex items-center gap-1"
                      >
                        <UsersIcon className="h-4 w-4" />
                        成员
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* 创建空间对话框 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建空间</DialogTitle>
            <DialogDescription>创建一个新的空间</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">空间名称 *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="例如: production"
                className={formErrors.name ? 'border-red-500' : ''}
              />
              {formErrors.name && (
                <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>
              )}
            </div>
            <div>
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="空间描述信息"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeCreateDialog}>
              取消
            </Button>
            <Button onClick={handleCreate} disabled={formSubmitting}>
              {formSubmitting ? '创建中...' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 添加成员对话框 */}
      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>管理成员 - {selectedSpace?.name}</DialogTitle>
            <DialogDescription>向空间添加成员并分配角色，或移除现有成员</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* 当前成员列表 */}
            {selectedSpace?.members && selectedSpace.members.length > 0 && (
              <div>
                <Label className="text-base font-semibold mb-3 block">当前成员 ({selectedSpace.members.length})</Label>
                <div className="border rounded-md divide-y">
                  {selectedSpace.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">
                          {member.user?.username || member.user?.name || `用户${member.user_id}`}
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {member.user?.email && <span>{member.user.email}</span>}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMember(selectedSpace.id, member.user_id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        移除
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 添加新成员 */}
            <div className="border-t pt-4">
              <Label className="text-base font-semibold mb-3 block">添加新成员</Label>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="user_id">用户 *</Label>
                  <Select
                    value={memberFormData.user_id}
                    onValueChange={(value) => setMemberFormData({ ...memberFormData, user_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="选择用户" />
                    </SelectTrigger>
                    <SelectContent>
                      {users
                        .filter((user) => !selectedSpace?.members?.some((m) => m.user_id === user.id))
                        .map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.username} {user.name && `(${user.name})`} {user.email && `- ${user.email}`}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {selectedSpace?.members && selectedSpace.members.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      已过滤已在空间中的用户。成员在空间中的权限基于用户本身的角色。
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeMemberDialog}>
              关闭
            </Button>
            <Button
              onClick={handleAddMember}
              disabled={!memberFormData.user_id}
            >
              添加成员
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 用户详情对话框 */}
      <Dialog open={userDetailDialogOpen} onOpenChange={setUserDetailDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>用户信息</DialogTitle>
            <DialogDescription>查看用户的基本信息</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 py-4">
              <div>
                <Label className="text-sm font-semibold text-gray-700">用户名</Label>
                <div className="mt-1 text-sm text-gray-900">{selectedUser.username || '-'}</div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">姓名</Label>
                <div className="mt-1 text-sm text-gray-900">{selectedUser.name || '-'}</div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">昵称</Label>
                <div className="mt-1 text-sm text-gray-900">{selectedUser.nickname || '-'}</div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">邮箱</Label>
                <div className="mt-1 text-sm text-gray-900">{selectedUser.email || '-'}</div>
              </div>
              <div>
                <Label className="text-sm font-semibold text-gray-700">用户ID</Label>
                <div className="mt-1 text-sm text-gray-900">{selectedUser.id || '-'}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setUserDetailDialogOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

