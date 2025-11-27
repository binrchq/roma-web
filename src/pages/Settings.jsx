import { useState, useEffect } from 'react'
import { api } from '../api/roma'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Settings() {
  const [systemInfo, setSystemInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSuper, setIsSuper] = useState(false)
  const [apiKeys, setApiKeys] = useState([])
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newKeyDescription, setNewKeyDescription] = useState('')

  useEffect(() => {
    loadSystemInfo()
    checkUserRole()
    if (isSuper) {
      loadApiKeys()
    }
  }, [isSuper])

  const loadSystemInfo = async () => {
    try {
      setLoading(true)
      const data = await api.getSystemInfo()
      setSystemInfo(data)
    } catch (error) {
      console.error('加载系统信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkUserRole = async () => {
    try {
      const userData = await api.getCurrentUser()
      if (userData?.roles) {
        const hasSuper = userData.roles.some(role => role.name === 'super')
        setIsSuper(hasSuper)
      }
    } catch (error) {
      console.error('获取用户角色失败:', error)
    }
  }

  const loadApiKeys = async () => {
    try {
      const data = await api.getApiKeys()
      setApiKeys(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('加载API Key列表失败:', error)
      setApiKeys([])
    }
  }

  const handleCreateApiKey = async () => {
    try {
      const result = await api.createApiKey()
      if (result?.api_key) {
        alert(`API Key创建成功: ${result.api_key}\n请妥善保管，此密钥只显示一次！`)
        setShowCreateDialog(false)
        setNewKeyDescription('')
        loadApiKeys()
      } else if (result?.message) {
        alert(`API Key创建成功: ${result.api_key || '请查看返回结果'}\n请妥善保管，此密钥只显示一次！`)
        setShowCreateDialog(false)
        setNewKeyDescription('')
        loadApiKeys()
      }
    } catch (error) {
      console.error('创建API Key失败:', error)
      alert('创建API Key失败: ' + (error.message || '未知错误'))
    }
  }

  const handleDeleteApiKey = async (id) => {
    if (!confirm('确定要删除这个API Key吗？')) {
      return
    }
    try {
      await api.deleteApiKey(id)
      alert('API Key删除成功')
      loadApiKeys()
    } catch (error) {
      console.error('删除API Key失败:', error)
      alert('删除API Key失败: ' + (error.message || '未知错误'))
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN')
  }

  const isExpired = (expiresAt) => {
    if (!expiresAt) return false
    return new Date(expiresAt) < new Date()
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">系统设置</h1>
        <p className="mt-2 text-sm text-gray-600">查看系统信息和配置</p>
      </div>

      <div className="space-y-6">
        {/* 系统信息 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">系统信息</h2>
          {loading ? (
            <div className="text-sm text-gray-500">加载中...</div>
          ) : systemInfo ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">系统名称</label>
                  <p className="mt-1 text-sm text-gray-900">{systemInfo.system?.name || 'ROMA 堡垒机'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">版本</label>
                  <p className="mt-1 text-sm text-gray-900">{systemInfo.system?.version || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Go 版本</label>
                  <p className="mt-1 text-sm text-gray-900">{systemInfo.system?.go_version || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">操作系统</label>
                  <p className="mt-1 text-sm text-gray-900">{systemInfo.system?.os || '-'} / {systemInfo.system?.arch || '-'}</p>
                </div>
              </div>
              {systemInfo.statistics && (
                <div className="mt-4 pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">统计信息</label>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">总资源数:</span>
                      <span className="ml-2 font-medium text-gray-900">{systemInfo.statistics.total_resources || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">总用户数:</span>
                      <span className="ml-2 font-medium text-gray-900">{systemInfo.statistics.total_users || 0}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">总角色数:</span>
                      <span className="ml-2 font-medium text-gray-900">{systemInfo.statistics.total_roles || 0}</span>
                    </div>
                  </div>
                </div>
              )}
              {systemInfo.ssh_service && (
                <div className="mt-4 pt-4 border-t">
                  <label className="block text-sm font-medium text-gray-700 mb-2">SSH 服务信息</label>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">连接地址:</span>
                      <span className="ml-2 font-mono font-medium text-gray-900">
                        {(() => {
                          // 从当前 URL 提取域名
                          const hostname = window.location.hostname
                          const port = systemInfo.ssh_service.port || '2200'
                          return `${hostname}:${port}`
                        })()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">端口:</span>
                      <span className="ml-2 font-mono text-gray-900">{systemInfo.ssh_service.port || '-'}</span>
                    </div>
                    {systemInfo.ssh_service.public_key && (
                      <div>
                        <span className="text-gray-500">主机公钥:</span>
                        <div className="mt-1 p-2 bg-gray-50 rounded border border-gray-200">
                          <code className="text-xs font-mono text-gray-800 break-all">
                            {systemInfo.ssh_service.public_key}
                          </code>
                          <button
                            className="ml-2 text-xs text-blue-600 hover:text-blue-800"
                            onClick={() => {
                              navigator.clipboard.writeText(systemInfo.ssh_service.public_key)
                              alert('公钥已复制到剪贴板')
                            }}
                          >
                            复制
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                          此公钥可用于新增资源时配置服务器的主机密钥验证
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-500">无法加载系统信息</div>
          )}
        </div>

        {/* 安全设置 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">安全设置</h2>
          <div className="space-y-4">
            {isSuper && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">API Key 管理</h3>
                    <p className="text-sm text-gray-500">管理系统的API访问密钥</p>
                  </div>
                  <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">创建 API Key</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>创建 API Key</DialogTitle>
                        <DialogDescription>
                          创建一个新的API Key用于系统访问
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <Label htmlFor="description">描述</Label>
                          <Input
                            id="description"
                            value={newKeyDescription}
                            onChange={(e) => setNewKeyDescription(e.target.value)}
                            placeholder="API Key描述（可选）"
                            className="mt-1"
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" onClick={() => setShowCreateDialog(false)}>取消</Button>
                          <Button onClick={handleCreateApiKey}>创建</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">API Key</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">描述</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">创建时间</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">过期时间</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">状态</th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">操作</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {apiKeys.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-4 py-4 text-center text-sm text-gray-500">
                            暂无 API Key
                          </td>
                        </tr>
                      ) : (
                        apiKeys.map((key) => (
                          <tr key={key.id} className="hover:bg-gray-50">
                            <td className="px-4 py-4 text-sm font-mono text-gray-900">
                              {key.api_key || key.apikey || '-'}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {key.description || '-'}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {formatTime(key.created_at)}
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-500">
                              {formatTime(key.expires_at)}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              {isExpired(key.expires_at) ? (
                                <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                                  已过期
                                </span>
                              ) : (
                                <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                                  有效
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-sm">
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteApiKey(key.id)}
                              >
                                删除
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            {!isSuper && (
              <div className="text-sm text-gray-500">
                仅超级管理员可以管理 API Key
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
