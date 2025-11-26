import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development'
  const devBackendTarget = process.env.VITE_API_BASE_URL || 'http://localhost:6999'

  return {
    base: '/',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 3021,
      host: true,
      ...(isDev && {
        proxy: {
          '/api': {
            target: devBackendTarget,
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, '/api')
          }
        }
      })
    },
    build: {
      target: ['es2015', 'chrome63'],
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    },
    envDir: '.',
    envPrefix: 'VITE_',
  }
})


