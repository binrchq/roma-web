import { Outlet, Link, useLocation } from 'react-router-dom'
import * as React from 'react'
import { api } from '../api/roma'
import { isProduction } from '@/utils/env'
import { logger } from '@/utils/logger'
import RomaLogo from "@/components/ui/roma-logo"
import {
  Sidebar,
  SidebarProvider,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from "@/components/blocks/sidebar"
import {
  Home,
  Server,
  Users,
  Shield,
  FileText,
  Settings,
  User,
  ChevronsUpDown,
  Github,
  BookOpen,
  Rocket,
  ArrowRightIcon,
  Star,
  ChevronDown,
  ChevronRight,
  Database,
  Container,
  Router,
  Network,
  LogOut,
  Key,
  UserCircle,
  Folder,
  Ban,
} from "lucide-react"
import { FaGithub } from "react-icons/fa"
import { FaArrowCircleRight } from "react-icons/fa";
import { Banner } from "@/components/ui/banner"
import { Button } from "@/components/ui/button"
import { BoltNewBadge } from "@/components/ui/bolt-new-badge"
import { GlowEffect } from "@/components/ui/glow-effect"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

const getNavigation = (isSuper, isSystem) => [
  { name: '仪表盘', href: '/dashboard', icon: Home },
  {
    name: '资源管理',
    icon: Server,
    children: [
      { name: 'Linux 服务器', href: '/resources/linux', icon: Server },
      { name: 'Windows 服务器', href: '/resources/windows', icon: Server },
      { name: 'Docker 容器', href: '/resources/docker', icon: Container },
      { name: '数据库', href: '/resources/database', icon: Database },
      { name: '路由器', href: '/resources/router', icon: Router },
      { name: '交换机', href: '/resources/switch', icon: Network },
    ]
  },
  ...(isSuper || isSystem ? [
    { name: '空间管理', href: '/spaces', icon: Folder },
    { name: '用户管理', href: '/users', icon: Users },
    { name: '角色管理', href: '/roles', icon: Shield },
    { name: 'IP黑名单', href: '/blacklist', icon: Ban },
    { name: '审计日志', href: '/logs', icon: FileText },
  ] : []),
  { name: '系统设置', href: '/settings', icon: Settings },
]

const getBook = (isSuper) => [
  { name: 'API使用教程', href: '/docs/api', icon: BookOpen },
  { name: 'MCP使用教程', href: '/docs/mcp', icon: BookOpen },
]

export default function Layout() {
  const location = useLocation()
  const username = localStorage.getItem('username') || '管理员'
  const email = localStorage.getItem('email') || 'admin@roma.io'
  const [showBanner, setShowBanner] = React.useState(true)
  const [githubData, setGithubData] = React.useState({ stars: 0, loading: true })
  const [expandedMenus, setExpandedMenus] = React.useState(new Set())
  const [isSuperRole, setIsSuperRole] = React.useState(false)
  const [isSystemRole, setIsSystemRole] = React.useState(false)
  const [rolesLoading, setRolesLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchGithubData = async () => {
      // 仅在开发环境获取 GitHub 数据
      if (isProduction()) {
        setGithubData({ stars: 0, loading: false })
        return
      }

      try {
        const response = await fetch('https://api.github.com/repos/binrchq/roma')
        if (response.ok) {
          const data = await response.json()
          setGithubData({ stars: data.stargazers_count || 0, loading: false })
        } else {
          setGithubData({ stars: 0, loading: false })
        }
      } catch (error) {
        logger.debug('Failed to fetch GitHub data:', error)
        setGithubData({ stars: 0, loading: false })
      }
    }

    const fetchUserRoles = async () => {
      try {
        setRolesLoading(true)
        const data = await api.getCurrentUser()
        logger.debug('GetCurrentUser response:', JSON.stringify(data, null, 2))

        // 后端返回格式: { user: {...}, roles: [...] }
        // 但 API 封装可能返回的是 data 字段，需要检查实际结构
        let roles = null
        if (data && data.roles) {
          roles = data.roles
        } else if (data && data.data && data.data.roles) {
          // 如果 API 返回的是 { code: 200, data: { user: {...}, roles: [...] } }
          roles = data.data.roles
        }

        if (roles && Array.isArray(roles)) {
          logger.debug('User roles:', roles)
          const hasSuperRole = roles.some(role => {
            const roleName = (role.name || role.Name || '').toLowerCase()
            return roleName === 'super'
          })
          const hasSystemRole = roles.some(role => {
            const roleName = (role.name || role.Name || '').toLowerCase()
            return roleName === 'system'
          })
          logger.debug('Is super role:', hasSuperRole, 'Is system role:', hasSystemRole)
          setIsSuperRole(hasSuperRole)
          setIsSystemRole(hasSystemRole)
        } else {
          logger.warn('No roles found in response or roles is not an array. Data:', data)
          setIsSuperRole(false)
          setIsSystemRole(false)
        }
      } catch (error) {
        logger.error('Failed to fetch user roles:', error)
        setIsSuperRole(false)
        setIsSystemRole(false)
      } finally {
        setRolesLoading(false)
      }
    }

    fetchGithubData()
    fetchUserRoles()
  }, [])

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <div className="relative rounded-md p-1 w-full mb-5">
              <GlowEffect
                colors={['#0894FF', '#C959DD', '#FF2E54', '#FF9004']}
                mode="static"
                blur="medium"
                scale={1}
              />
              <div className="relative font-bold text-xs text-white dark:text-black bg-[#131313] dark:bg-white rounded-md px-3 py-2 z-10 text-center w-full">
                <RomaLogo size="medium" className=" text-center mx-auto" />
                <span className="text-center">ROMA 堡垒机</span>
              </div>
            </div>
            <SidebarGroupContent>
              <SidebarMenu>
                {getNavigation(isSuperRole, isSystemRole).map((item) => {
                  if (item.children) {
                    const isExpanded = expandedMenus.has(item.name)
                    const hasActiveChild = item.children.some(child => location.pathname === child.href)
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          tooltip={item.name}
                          isActive={hasActiveChild}
                          onClick={() => {
                            const newExpanded = new Set(expandedMenus)
                            if (isExpanded) {
                              newExpanded.delete(item.name)
                            } else {
                              newExpanded.add(item.name)
                            }
                            setExpandedMenus(newExpanded)
                          }}
                        >
                          <item.icon />
                          <span>{item.name}</span>
                          {isExpanded ? <ChevronDown className="ml-auto h-4 w-4" /> : <ChevronRight className="ml-auto h-4 w-4" />}
                        </SidebarMenuButton>
                        {isExpanded && (
                          <SidebarMenuSub>
                            {item.children.map((child) => {
                              const isActive = location.pathname === child.href
                              return (
                                <SidebarMenuSubItem key={child.name}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isActive}
                                  >
                                    <Link to={child.href}>
                                      <child.icon className="h-4 w-4" />
                                      <span>{child.name}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              )
                            })}
                          </SidebarMenuSub>
                        )}
                      </SidebarMenuItem>
                    )
                  } else {
                    const isActive = location.pathname === item.href
                    return (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.name}
                          isActive={isActive}
                        >
                          <Link to={item.href}>
                            <item.icon />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  }
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

        </SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel
            className="text-sm font-bold text-sidebar-foreground/70"
          >
            相关文档...
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {getBook(isSuperRole).map((item) => {
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild>
                      <Link to={item.href}>
                        <item.icon />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter>
          <SidebarGroup>
            <UserMenu username={username} email={email} />
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="px-4 py-2 border-b flex items-center justify-between">
          <SidebarTrigger className="h-4 w-4 mt-2" />
          {!isProduction() && (
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/binrchq/roma"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-900 dark:bg-gray-800 text-white hover:bg-gray-800 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                title="Star on GitHub"
              >
                <FaGithub className="h-4 w-4" />
                <span className="hidden sm:inline">Star</span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current" />
                  <span>{githubData.loading ? '...' : githubData.stars}</span>
                </div>
              </a>
              <Button
                onClick={() => window.open('https://github.com/binrchq/roma#quick-start', '_blank')}
                className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-1.5 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-lg"
              >
                <Rocket className="h-4 w-4" />
                快速部署
                <ArrowRightIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <div className="p-6">
          <Outlet />
        </div>

        {/* Floating Banner in bottom right - 仅非生产环境显示 */}
        {!isProduction() && (
          <div className="fixed bottom-6 right-6 z-50 max-w-sm">
            <Banner
              show={showBanner}
              onHide={() => setShowBanner(false)}
              variant="premium"
              title="快速部署"
              description="立即访问 GitHub 获取完整项目源码和部署文档"
              showShade={true}
              closable={true}
              icon={<Rocket className="h-5 w-5" />}
              size="default"
              action={
                <Button
                  onClick={() => window.open('https://github.com/binrchq/roma#quick-start', '_blank')}
                  className="inline-flex items-center gap-1.5 rounded-md bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 text-xs font-medium text-white transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-lg"
                  variant="ghost"
                >
                  立即部署
                  <FaArrowCircleRight className="h-4 w-4" />
                </Button>
              }
            />
          </div>
        )}

      </SidebarInset>
    </SidebarProvider>
  )
}

// UserMenu 用户菜单组件
function UserMenu({ username, email }) {
  const [showUserInfo, setShowUserInfo] = React.useState(false)
  const [userInfo, setUserInfo] = React.useState(null)
  const [sshKey, setSshKey] = React.useState(null)
  const [showPublicKeyDialog, setShowPublicKeyDialog] = React.useState(false)
  const [showGenerateDialog, setShowGenerateDialog] = React.useState(false)
  const [newPublicKey, setNewPublicKey] = React.useState('')
  const [newPrivateKey, setNewPrivateKey] = React.useState('')
  const [generatedKey, setGeneratedKey] = React.useState(null)

  const loadUserInfo = async () => {
    try {
      const data = await api.getCurrentUser()
      const user = data?.user || data
      setUserInfo(user)

      // 加载SSH密钥
      try {
        const keyData = await api.getMySSHKey()
        setSshKey(keyData)
      } catch (error) {
        logger.error('获取SSH密钥失败:', error)
      }
    } catch (error) {
      logger.error('获取用户信息失败:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('apiKey')
    localStorage.removeItem('username')
    localStorage.removeItem('email')
    window.location.href = '/login'
  }

  const handleUploadPublicKey = async () => {
    if (!newPublicKey.trim()) {
      alert('请输入公钥')
      return
    }
    if (!newPrivateKey.trim()) {
      alert('请输入私钥（PEM 格式）')
      return
    }
    try {
      await api.uploadSSHKey({
        public_key: newPublicKey.trim(),
        private_key: newPrivateKey.trim()
      })
      alert('SSH密钥上传成功')
      setShowPublicKeyDialog(false)
      setNewPublicKey('')
      setNewPrivateKey('')
      loadUserInfo()
    } catch (error) {
      logger.error('上传SSH密钥失败:', error)
      alert('上传SSH密钥失败: ' + (error.message || '未知错误'))
    }
  }

  const handleGenerateKey = async () => {
    if (!confirm('生成新密钥将替换现有密钥，确定继续吗？')) {
      return
    }
    try {
      const result = await api.generateSSHKey()
      if (result?.private_key) {
        setGeneratedKey(result)
        setShowGenerateDialog(true)
        loadUserInfo()
      }
    } catch (error) {
      logger.error('生成SSH密钥失败:', error)
      alert('生成SSH密钥失败: ' + (error.message || '未知错误'))
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('已复制到剪贴板')
  }

  const downloadPrivateKey = (privateKeyPEM, filename = 'id_rsa') => {
    try {
      // 私钥已经是原始 PEM 格式，直接下载
      const blob = new Blob([privateKeyPEM], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      logger.error('下载私钥失败:', error)
      alert('下载私钥失败: ' + (error.message || '未知错误'))
    }
  }


  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <SidebarMenuButton className="w-full justify-between gap-3 h-12">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {username ? username.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{username}</span>
                <span className="text-xs text-muted-foreground">{email}</span>
              </div>
            </div>
            <ChevronsUpDown className="h-5 w-5 rounded-md" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>我的账户</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => {
            setShowUserInfo(true)
            loadUserInfo()
          }}>
            <UserCircle className="mr-2 h-4 w-4" />
            <span>查看信息</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            <span>登出</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 用户信息Modal */}
      <Dialog open={showUserInfo} onOpenChange={setShowUserInfo}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>我的信息</DialogTitle>
            <DialogDescription>
              查看和管理您的账户信息
            </DialogDescription>
          </DialogHeader>
          {userInfo && (
            <div className="space-y-6 py-4">
              {/* 基本信息 */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">基本信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>用户名</Label>
                    <p className="mt-1 text-sm text-gray-900">{userInfo.username || '-'}</p>
                  </div>
                  <div>
                    <Label>姓名</Label>
                    <p className="mt-1 text-sm text-gray-900">{userInfo.name || '-'}</p>
                  </div>
                  <div>
                    <Label>昵称</Label>
                    <p className="mt-1 text-sm text-gray-900">{userInfo.nickname || '-'}</p>
                  </div>
                  <div>
                    <Label>邮箱</Label>
                    <p className="mt-1 text-sm text-gray-900">{userInfo.email || '-'}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-medium text-gray-900">SSH 密钥</h3>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowPublicKeyDialog(true)}>
                      <Key className="mr-2 h-4 w-4" />
                      上传密钥
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleGenerateKey}>
                      <Key className="mr-2 h-4 w-4" />
                      生成密钥
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Label>公钥</Label>
                    <div className="mt-1">
                      <Textarea
                        readOnly
                        value={sshKey?.public_key || userInfo.public_key || '暂无公钥'}
                        className="font-mono text-xs"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 上传公钥Dialog */}
      <Dialog open={showPublicKeyDialog} onOpenChange={setShowPublicKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>上传 SSH 密钥</DialogTitle>
            <DialogDescription>
              上传您的 SSH 公钥和私钥（私钥为 PEM 格式）
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="public-key">公钥</Label>
              <Textarea
                id="public-key"
                value={newPublicKey}
                onChange={(e) => setNewPublicKey(e.target.value)}
                placeholder="ssh-rsa AAAAB3NzaC1yc2E..."
                className="mt-1 font-mono text-xs"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="private-key">私钥（PEM 格式）</Label>
              <Textarea
                id="private-key"
                value={newPrivateKey}
                onChange={(e) => setNewPrivateKey(e.target.value)}
                placeholder="-----BEGIN RSA PRIVATE KEY-----&#10;...&#10;-----END RSA PRIVATE KEY-----"
                className="mt-1 font-mono text-xs"
                rows={5}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowPublicKeyDialog(false)}>取消</Button>
              <Button onClick={handleUploadPublicKey}>上传</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 生成密钥Dialog */}
      <Dialog open={showGenerateDialog} onOpenChange={setShowGenerateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>SSH 密钥生成成功</DialogTitle>
            <DialogDescription>
              请妥善保管您的私钥，此密钥只显示一次！
            </DialogDescription>
          </DialogHeader>
          {generatedKey && (
            <div className="space-y-4 py-4">
              <div>
                <Label>公钥</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Textarea
                    readOnly
                    value={generatedKey.public_key || ''}
                    className="font-mono text-xs"
                    rows={3}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(generatedKey.public_key || '')}
                  >
                    复制
                  </Button>
                </div>
              </div>
              <div>
                <Label>私钥</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Textarea
                    readOnly
                    value={generatedKey.private_key || ''}
                    className="font-mono text-xs"
                    rows={8}
                  />
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedKey.private_key || '')}
                    >
                      复制
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => downloadPrivateKey(generatedKey.private_key || '', 'id_rsa')}
                    >
                      下载
                    </Button>
                  </div>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ 警告：请立即保存私钥，关闭此对话框后将无法再次查看！
                </p>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setShowGenerateDialog(false)}>已保存</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
