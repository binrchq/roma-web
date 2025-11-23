import { useEffect, useState } from 'react'
import { api } from '../api/roma'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  Server,
  Users,
  Shield,
} from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalResources: 0,
    resources: {},
    totalUsers: 0,
    totalRoles: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSystemInfo()
  }, [])

  const loadSystemInfo = async () => {
    try {
      const data = await api.getSystemInfo()
      if (data.statistics) {
        setStats(data.statistics)
      }
    } catch (error) {
      console.error('加载系统信息失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 黑白灰色调
  const GRAY_SCALE = ['#000000', '#404040', '#808080', '#a0a0a0', '#c0c0c0']

  const resourceDistribution = [
    { name: 'Linux', value: stats.resources?.linux || 0 },
    { name: 'Windows', value: stats.resources?.windows || 0 },
    { name: 'Docker', value: stats.resources?.docker || 0 },
    { name: '数据库', value: stats.resources?.database || 0 },
    { name: '网络设备', value: (stats.resources?.router || 0) + (stats.resources?.switch || 0) },
  ].filter(item => item.value > 0)

  const resourceStats = [
    { name: 'Linux', count: stats.resources?.linux || 0 },
    { name: 'Windows', count: stats.resources?.windows || 0 },
    { name: 'Docker', count: stats.resources?.docker || 0 },
    { name: '数据库', count: stats.resources?.database || 0 },
    { name: '网络设备', count: (stats.resources?.router || 0) + (stats.resources?.switch || 0) },
  ]

  const statCards = [
    { name: '总资源数', value: stats.totalResources, icon: Server },
    { name: '用户数', value: stats.totalUsers, icon: Users },
    { name: '角色数', value: stats.totalRoles, icon: Shield },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500 text-sm">加载中...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
        <p className="mt-1 text-xs text-gray-600">欢迎使用 ROMA 跳板机管理系统</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.name}
              className="overflow-hidden rounded-lg bg-white shadow hover:shadow-md transition-shadow border border-gray-200"
            >
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">{stat.name}</p>
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                  </div>
                  <div className="rounded-lg p-2 bg-gray-100">
                    <Icon className="h-5 w-5 text-gray-700" />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        {/* Resource Distribution Pie Chart */}
        <div className="rounded-lg bg-white p-4 shadow border border-gray-200">
          <h2 className="text-sm font-medium text-gray-900 mb-3">资源类型分布</h2>
          {resourceDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={resourceDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {resourceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GRAY_SCALE[index % GRAY_SCALE.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-xs text-gray-500">
              暂无数据
            </div>
          )}
        </div>

        {/* Resource Stats Bar Chart */}
        <div className="rounded-lg bg-white p-4 shadow border border-gray-200">
          <h2 className="text-sm font-medium text-gray-900 mb-3">资源统计</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={resourceStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
              <YAxis stroke="#6b7280" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#000000">
                {resourceStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={GRAY_SCALE[index % GRAY_SCALE.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Resource Details */}
      <div className="rounded-lg bg-white p-4 shadow border border-gray-200">
        <h2 className="text-sm font-medium text-gray-900 mb-3">资源详情</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {resourceStats.map((item) => (
            <div key={item.name} className="text-center p-3 rounded-lg border border-gray-200 bg-gray-50">
              <div className="text-xl font-bold text-gray-900 mb-1">
                {item.count}
              </div>
              <div className="text-xs text-gray-600">
                {item.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
