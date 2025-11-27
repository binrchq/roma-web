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
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { logger } from '@/utils/logger'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
// AlertDialog 组件如果不存在，使用 window.confirm 替代
import { Ban, Shield, MapPin, Globe, Trash2, Plus, Search, Info } from 'lucide-react'

const initialFormState = {
  ip: '',
  reason: '',
  duration: 0, // 0表示永久封禁，单位：秒
}

export default function Blacklist() {
  const [blacklists, setBlacklists] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchFilter, setSearchFilter] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize] = useState(20)
  const [total, setTotal] = useState(0)
  
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [detailDialogOpen, setDetailDialogOpen] = useState(false)
  const [selectedIP, setSelectedIP] = useState(null)
  const [selectedBlacklist, setSelectedBlacklist] = useState(null)
  const [ipInfo, setIpInfo] = useState(null)
  const [formData, setFormData] = useState(initialFormState)
  const [formSubmitting, setFormSubmitting] = useState(false)

  useEffect(() => {
    loadBlacklists()
  }, [page])

  const loadBlacklists = async () => {
    try {
      setLoading(true)
      const response = await api.getBlacklists(page, pageSize)
      // 后端返回格式: { code: 200, data: { list: [], total: 0, page: 1, page_size: 20 } }
      const data = response?.data || response
      if (data && data.list) {
        setBlacklists(Array.isArray(data.list) ? data.list : [])
        setTotal(data.total || data.list.length)
      } else if (Array.isArray(data)) {
        setBlacklists(data)
        setTotal(data.length)
      } else {
        setBlacklists([])
        setTotal(0)
      }
    } catch (error) {
      logger.error('加载黑名单失败:', error)
      window.alert('加载黑名单失败')
      setBlacklists([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }

  const filteredBlacklists = useMemo(() => {
    return blacklists.filter((bl) => {
      const searchMatch = searchFilter === "" ||
        bl.ip?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        bl.reason?.toLowerCase().includes(searchFilter.toLowerCase()) ||
        bl.source?.toLowerCase().includes(searchFilter.toLowerCase())
      return searchMatch
    })
  }, [blacklists, searchFilter])

  const handleCreate = () => {
    setFormData(initialFormState)
    setCreateDialogOpen(true)
  }

  const handleCreateSubmit = async () => {
    if (!formData.ip) {
      window.alert('请输入IP地址')
      return
    }

    try {
      setFormSubmitting(true)
      await api.addToBlacklist({
        ip: formData.ip.trim(),
        reason: formData.reason || '手动添加',
        duration: formData.duration || 0,
      })
      window.alert('添加黑名单成功')
      setCreateDialogOpen(false)
      setFormData(initialFormState)
      loadBlacklists()
    } catch (error) {
      logger.error('添加黑名单失败:', error)
      window.alert(error?.response?.data?.msg || error?.message || '添加黑名单失败')
    } finally {
      setFormSubmitting(false)
    }
  }

  const handleViewDetail = async (ip) => {
    setSelectedIP(ip)
    setDetailDialogOpen(true)
    setIpInfo(null)
    
    try {
      const response = await api.getBlacklistByIP(ip)
      // 后端返回格式: { code: 200, data: { blacklist: {...}, ip_info: {...} } }
      const data = response?.data || response
      if (data && data.blacklist) {
        setSelectedBlacklist(data.blacklist)
        if (data.ip_info) {
          setIpInfo(data.ip_info)
        }
      } else if (data && data.ip_info) {
        setIpInfo(data.ip_info)
        setSelectedBlacklist(null)
      }
    } catch (error) {
      logger.error('获取IP信息失败:', error)
      // 如果不在黑名单中，尝试获取IP信息
      try {
        const response = await api.getIPInfo(ip)
        const data = response?.data || response
        if (data) {
          setIpInfo(data)
        }
      } catch (err) {
        logger.error('获取IP信息失败:', err)
      }
    }
  }

  const handleDelete = async (ip) => {
    if (!window.confirm(`确定要解禁IP地址 ${ip} 吗？解禁后该IP将可以正常访问系统。`)) {
      return
    }

    try {
      await api.removeFromBlacklist(ip)
      window.alert('解禁成功')
      loadBlacklists()
    } catch (error) {
      logger.error('解禁失败:', error)
      window.alert(error?.response?.data?.msg || error?.message || '解禁失败')
    }
  }

  const formatDuration = (banUntil) => {
    if (!banUntil) return '永久封禁'
    const date = new Date(banUntil)
    const now = new Date()
    if (date < now) return '已过期'
    const diff = date - now
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) return `${days}天${hours}小时`
    if (hours > 0) return `${hours}小时${minutes}分钟`
    return `${minutes}分钟`
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const getSourceBadge = (source) => {
    const colors = {
      'api_auth_failure': 'destructive',
      'ssh_auth_failure': 'destructive',
      'manual': 'default',
    }
    const labels = {
      'api_auth_failure': 'API认证失败',
      'ssh_auth_failure': 'SSH认证失败',
      'manual': '手动添加',
    }
    return (
      <Badge variant={colors[source] || 'default'}>
        {labels[source] || source}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            IP黑名单管理
          </h1>
          <p className="text-muted-foreground mt-2">
            管理被封禁的IP地址，查看IP信息和手动解禁
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          添加黑名单
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="搜索IP、原因或来源..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>IP地址</TableHead>
              <TableHead>封禁原因</TableHead>
              <TableHead>来源</TableHead>
              <TableHead>解封时间</TableHead>
              <TableHead>创建时间</TableHead>
              <TableHead className="text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  加载中...
                </TableCell>
              </TableRow>
            ) : filteredBlacklists.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  暂无黑名单记录
                </TableCell>
              </TableRow>
            ) : (
              filteredBlacklists.map((bl) => (
                <TableRow key={bl.id || bl.ip}>
                  <TableCell className="font-mono">{bl.ip}</TableCell>
                  <TableCell>{bl.reason || '-'}</TableCell>
                  <TableCell>{getSourceBadge(bl.source)}</TableCell>
                  <TableCell>
                    <Badge variant={bl.ban_until ? 'secondary' : 'destructive'}>
                      {formatDuration(bl.ban_until)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(bl.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetail(bl.ip)}
                        className="gap-1"
                      >
                        <Info className="h-4 w-4" />
                        详情
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(bl.ip)}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        解禁
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {total > pageSize && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            共 {total} 条记录
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              上一页
            </Button>
            <span className="text-sm">
              第 {page} 页 / 共 {Math.ceil(total / pageSize)} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= Math.ceil(total / pageSize)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}

      {/* 添加黑名单对话框 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>添加IP到黑名单</DialogTitle>
            <DialogDescription>
              输入要封禁的IP地址、原因和封禁时长
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="ip">IP地址 *</Label>
              <Input
                id="ip"
                placeholder="例如: 192.168.1.1"
                value={formData.ip}
                onChange={(e) => setFormData({ ...formData, ip: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">封禁原因</Label>
              <Textarea
                id="reason"
                placeholder="例如: 多次认证失败"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">封禁时长（秒）</Label>
              <Input
                id="duration"
                type="number"
                placeholder="0表示永久封禁"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
              />
              <p className="text-xs text-muted-foreground">
                0 = 永久封禁，3600 = 1小时，86400 = 1天
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleCreateSubmit} disabled={formSubmitting}>
              {formSubmitting ? '添加中...' : '添加'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* IP详情对话框 */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>IP详情信息</DialogTitle>
            <DialogDescription>
              IP地址: {selectedIP}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedBlacklist && (
              <div className="space-y-2">
                <h3 className="font-semibold">黑名单信息</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">封禁原因:</span>
                    <p>{selectedBlacklist.reason || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">来源:</span>
                    <p>{getSourceBadge(selectedBlacklist.source)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">解封时间:</span>
                    <p>{formatDuration(selectedBlacklist.ban_until)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">创建时间:</span>
                    <p>{formatDate(selectedBlacklist.created_at)}</p>
                  </div>
                </div>
              </div>
            )}
            {ipInfo && (
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  IP地理位置信息
                </h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">国家/地区:</span>
                    <p>{ipInfo.country || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">省份:</span>
                    <p>{ipInfo.province || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">城市:</span>
                    <p>{ipInfo.city || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ISP:</span>
                    <p>{ipInfo.isp || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ASN:</span>
                    <p>{ipInfo.asn || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">CIDR:</span>
                    <p className="font-mono text-xs">{ipInfo.cidr || '-'}</p>
                  </div>
                  {ipInfo.latitude && ipInfo.longitude && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">坐标:</span>
                      <p className="font-mono text-xs">
                        {ipInfo.latitude}, {ipInfo.longitude}
                      </p>
                    </div>
                  )}
                  {ipInfo.additional && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">备注:</span>
                      <p>{ipInfo.additional}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {!selectedBlacklist && !ipInfo && (
              <div className="text-center py-8 text-muted-foreground">
                该IP不在黑名单中，且无法获取IP信息
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setDetailDialogOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}

