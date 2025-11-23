import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import RomaLogo from "@/components/ui/roma-logo"

export default function SplitLoginCard({ onLogin, loading, error }) {
  const [username, setUsername] = React.useState("")
  const [password, setPassword] = React.useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onLogin) {
      onLogin({ username, password })
    }
  }

  return (
    <div className="flex flex-col md:flex-row w-full max-w-4xl mx-auto shadow-lg rounded-lg overflow-hidden bg-white border dark:bg-gray-800">
      {/* Left Side: ROMA Logo + Welcome */}
      <div className="md:w-1/2 bg-gradient-to-br from-[#8371F5] to-[#6B5CE6] dark:from-blue-600 dark:to-blue-800 text-white flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-1/2 translate-y-1/2"></div>
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {/* ROMA Logo SVG */}
          <div className="">
            <RomaLogo size="large" />
          </div>

          {/* ASCII Art 风格的文字展示 */}
          <div className="font-mono text-xs text-white/90 mb-20 text-left leading-tight bg-black/20 p-4 rounded-lg backdrop-blur-sm">
            <div className="whitespace-pre text-[12px] py-5">
              {`       ______
      /\\     \\
     />.\\_____\\
   __\\  /  ___/__        _ROMA__
  /\\  \\/__/\\     \\  ____/  [A seamless solution
 /O \\____/*?\\_____\\          for remote access, ensuring 
 \\  /    \\  /     /              both efficiency and security.]
  \\/_____/\\/_____/`}
            </div>
          </div>

          <h2 className="text-xl font-bold mb-4">欢迎访问您的堡垒机</h2>
          <p className="text-center text-white/90 max-w-xs mb-2 text-sm">
            AI MCP驱动的智能堡垒机，自动化运维的顶级助手
          </p>
          <p className="text-center text-white/70 text-xs">
            <a
              href="https://www.binrc.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-white transition-colors"
            > ©binrc 提供技术支持
            </a>
          </p>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="md:w-1/2 p-8 flex flex-col justify-center">
        <h3 className="text-2xl font-semibold mb-6">登录</h3>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="username">用户名</Label>
            <Input
              id="username"
              type="text"
              placeholder="请输入用户名"
              className="mt-1"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div>
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="请输入密码"
              className="mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            className="mt-6 w-full"
            disabled={loading}
          >
            {loading ? "登录中..." : "登录"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-300 text-center">
          没有账户？{" "}
          <a href="#" className="text-primary-600 hover:underline">
            联系管理员
          </a>
        </p>
      </div>
    </div>
  )
}

