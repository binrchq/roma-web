import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Resources from './pages/Resources'
import LinuxResources from './pages/LinuxResources'
import WindowsResources from './pages/WindowsResources'
import DockerResources from './pages/DockerResources'
import DatabaseResources from './pages/DatabaseResources'
import RouterResources from './pages/RouterResources'
import SwitchResources from './pages/SwitchResources'
import Users from './pages/Users'
import Roles from './pages/Roles'
import Spaces from './pages/Spaces'
import Blacklist from './pages/Blacklist'
import Logs from './pages/Logs'
import Settings from './pages/Settings'
import ApiTutorial from './pages/ApiTutorial'
import McpTutorial from './pages/McpTutorial'

function App() {
  const isAuthenticated = () => {
    // 检查是否有 token 或 apiKey
    return localStorage.getItem('token') !== null || localStorage.getItem('apiKey') !== null
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            isAuthenticated() ? <Layout /> : <Navigate to="/login" replace />
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="resources" element={<Resources />} />
          <Route path="resources/linux" element={<LinuxResources />} />
          <Route path="resources/windows" element={<WindowsResources />} />
          <Route path="resources/docker" element={<DockerResources />} />
          <Route path="resources/database" element={<DatabaseResources />} />
          <Route path="resources/router" element={<RouterResources />} />
          <Route path="resources/switch" element={<SwitchResources />} />
          <Route path="users" element={<Users />} />
          <Route path="roles" element={<Roles />} />
          <Route path="spaces" element={<Spaces />} />
          <Route path="blacklist" element={<Blacklist />} />
          <Route path="logs" element={<Logs />} />
          <Route path="settings" element={<Settings />} />
          <Route path="docs/api" element={<ApiTutorial />} />
          <Route path="docs/mcp" element={<McpTutorial />} />
        </Route>
      </Routes>
    </Router>
  )
}

export default App

