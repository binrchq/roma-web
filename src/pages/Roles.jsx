import { useState, useEffect } from 'react'
import { api } from '../api/roma'

export default function Roles() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadRoles()
  }, [])

  const loadRoles = async () => {
    try {
      setLoading(true)
      const data = await api.getRoles()
      setRoles(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('加载角色失败:', error)
      setRoles([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">角色管理</h1>
          <p className="mt-2 text-sm text-gray-600">管理用户角色和权限分配</p>
        </div>
        <button className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
          添加角色
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : roles.length === 0 ? (
          <div className="col-span-full rounded-lg bg-white p-12 text-center shadow">
            <h3 className="mt-2 text-sm font-medium text-gray-900">暂无角色</h3>
            <p className="mt-1 text-sm text-gray-500">开始创建您的第一个角色</p>
          </div>
        ) : (
          roles.map((role) => (
            <div
              key={role.id}
              className="rounded-lg bg-white p-6 shadow hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                  {role.desc ? (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">描述</p>
                      <p className="mt-1 text-sm text-gray-700 leading-relaxed">{role.desc}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-400 italic">暂无描述</p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}


