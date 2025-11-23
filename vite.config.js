import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig(({ mode }) => {
  // 根据环境获取API基础URL
  const getApiBaseUrl = () => {
    switch (mode) {
      case 'development':
        return process.env.VITE_API_BASE_URL || 'http://localhost:6999'
      case 'test':
        return process.env.VITE_API_BASE_URL || 'https://jump-test.meshwise.cn'
      case 'staging':
        return process.env.VITE_API_BASE_URL || 'https://jump-staging.meshwise.cn'
      case 'production':
        return process.env.VITE_API_BASE_URL || 'https://jump.meshwise.cn'
      default:
        return 'http://localhost:6999'
    }
  }

  const apiBaseUrl = getApiBaseUrl()
  const isDev = mode === 'development'

  return {
    base: './', // 关键配置，确保资源路径为相对路径
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3021,
      host: true,
      // 只在开发环境使用代理
      ...(isDev && {
        proxy: {
          '/api': {
            target: apiBaseUrl,
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, '/api')
          }
        }
      })
    },
    build: {
      target: ['es2015', 'chrome63'], // 默认是modules,百度说是更改这个会去输出兼容浏览器，尝试没啥作用，先配置吧
    },
    // 环境变量配置
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    // 根据模式加载对应的环境文件
    envDir: '.',
    envPrefix: 'VITE_',
  }
})


