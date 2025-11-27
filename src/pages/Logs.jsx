import { useState, useEffect } from 'react'
import { api } from '../api/roma'

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [logType, setLogType] = useState('audit')

  useEffect(() => {
    loadLogs()
  }, [logType])

  const loadLogs = async () => {
    try {
      setLoading(true)
      let data
      if (logType === 'audit') {
        data = await api.getAuditLogs()
        setLogs(data?.logs || [])
      } else if (logType === 'access') {
        data = await api.getAccessLogs()
        setLogs(data?.logs || [])
      } else {
        data = await api.getCredentialLogs()
        setLogs(data?.logs || [])
      }
    } catch (error) {
      console.error('加载日志失败:', error)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    if (!timestamp) return '-'
    const date = new Date(timestamp)
    return date.toLocaleString('zh-CN')
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">审计日志</h1>
        <p className="mt-2 text-sm text-gray-600">查看系统高危操作和审计记录</p>
      </div>

      {/* 日志类型切换 */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setLogType('audit')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
            logType === 'audit'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          审计日志
        </button>
        <button
          onClick={() => setLogType('access')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
            logType === 'access'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          访问日志
        </button>
        <button
          onClick={() => setLogType('credential')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border ${
            logType === 'credential'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
          }`}
        >
          凭证日志
        </button>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  时间
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  用户
                </th>
                {logType === 'audit' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      操作
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      资源类型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      描述
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      状态
                    </th>
                  </>
                )}
                {logType === 'access' && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      资源
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      类型
                    </th>
                  </>
                )}
                {logType === 'credential' && (
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    操作
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  IP 地址
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={logType === 'audit' ? 7 : 5} className="px-6 py-4 text-center text-sm text-gray-500">
                    加载中...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={logType === 'audit' ? 7 : 5} className="px-6 py-4 text-center text-sm text-gray-500">
                    暂无日志记录
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {formatTime(log.timestamp || log.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                      {log.username}
                    </td>
                    {logType === 'audit' && (
                      <>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800">
                            {log.action}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {log.resource_type || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 max-w-md truncate">
                          {log.description || '-'}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                            log.status === 'success' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status === 'success' ? '成功' : '失败'}
                          </span>
                        </td>
                      </>
                    )}
                    {logType === 'access' && (
                      <>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          {log.resource_name || log.resource}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                          <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                            {log.resource_type}
                          </span>
                        </td>
                      </>
                    )}
                    {logType === 'credential' && (
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {log.action || log.operation}
                      </td>
                    )}
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {log.ip_address || log.ip || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


