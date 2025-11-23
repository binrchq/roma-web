import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SplitLoginCard from '@/components/ui/split-login-card'
import { api } from '@/api/roma'

export default function Login() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async ({ username, password }) => {
    setError('')
    setLoading(true)

    try {
      // 验证输入
      if (!username || !password) {
        setError('请输入用户名和密码')
        setLoading(false)
        return
      }

      // 调用登录接口
      try {
        const response = await api.login({ username, password })

        // 登录成功，保存 token 或 API Key
        // 根据后端返回的数据结构保存认证信息
        if (response.token) {
          localStorage.setItem('token', response.token)
        }
        if (response.apiKey) {
          localStorage.setItem('apiKey', response.apiKey)
        }
        if (response.user) {
          localStorage.setItem('username', response.user.username || username)
          if (response.user.email) {
            localStorage.setItem('email', response.user.email)
          }
        } else {
          localStorage.setItem('username', username)
        }

        // 登录成功，跳转到仪表盘
        // 使用 window.location.href 强制刷新页面，确保认证状态更新
        window.location.href = '/dashboard'
      } catch (err) {
        // 如果后端没有登录接口，尝试使用用户名密码生成 API Key 的逻辑
        // 或者显示错误信息
        const errorMessage = err.message || err.data?.msg || '登录失败，请检查用户名和密码'
        setError(errorMessage)
        localStorage.removeItem('apiKey')
        localStorage.removeItem('token')
        localStorage.removeItem('username')
        localStorage.removeItem('email')
      }
    } catch (err) {
      setError('登录失败，请检查网络连接')
      localStorage.removeItem('apiKey')
      localStorage.removeItem('token')
      localStorage.removeItem('username')
      localStorage.removeItem('email')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <SplitLoginCard onLogin={handleLogin} loading={loading} error={error} />
    </div>
  )
}
