export default function ApiTutorial() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">API 使用教程</h1>
        <p className="mt-2 text-sm text-gray-600">了解如何使用 ROMA 堡垒机的 REST API</p>
      </div>

      <div className="space-y-6">
        {/* 基础信息 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">基础信息</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>API 基础路径：</strong><code className="bg-gray-100 px-1 rounded">/api/v1</code></p>
            <p><strong>响应格式：</strong>所有 API 返回统一的 JSON 格式</p>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto mt-2">
{`{
  "code": 200,
  "msg": "success",
  "data": { ... }
}`}
            </pre>
          </div>
        </div>

        {/* 认证 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">认证方式</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">1. JWT Token 认证</h3>
              <p className="text-sm text-gray-600 mb-2">通过登录接口获取 JWT Token，在请求头中携带：</p>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`Authorization: Bearer <your-jwt-token>`}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">2. API Key 认证</h3>
              <p className="text-sm text-gray-600 mb-2">在请求头或查询参数中携带 API Key（需要 super 角色权限创建）：</p>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`apikey: <your-api-key>
# 或
?apikey=<your-api-key>`}
              </pre>
            </div>
          </div>
        </div>

        {/* 认证相关 API */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">认证相关 API</h2>
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">登录</h3>
              <p className="text-sm text-gray-600 mb-2"><code className="bg-gray-100 px-1 rounded">POST /api/v1/auth/login</code> - 用户登录（无需认证）</p>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`请求体:
{
  "username": "admin",
  "password": "password"
}

响应:
{
  "code": 200,
  "msg": "success",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}`}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">登出</h3>
              <p className="text-sm text-gray-600 mb-2"><code className="bg-gray-100 px-1 rounded">POST /api/v1/auth/logout</code> - 用户登出</p>
            </div>
          </div>
        </div>

        {/* 用户管理 API */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">用户管理 API</h2>
          <p className="text-sm text-gray-500 mb-3">需要 <code className="bg-gray-100 px-1 rounded">user</code> 相关权限（super 角色）</p>
          <div className="space-y-2 text-sm text-gray-600">
            <ul className="list-disc list-inside space-y-1">
              <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/users</code> - 获取用户列表（需要 list 权限）</li>
              <li><code className="bg-gray-100 px-1 rounded">POST /api/v1/users</code> - 创建用户（需要 add 权限）</li>
              <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/users/:id</code> - 获取用户详情（需要 get 权限）</li>
              <li><code className="bg-gray-100 px-1 rounded">PUT /api/v1/users/:id</code> - 更新用户（需要 update 权限）</li>
              <li><code className="bg-gray-100 px-1 rounded">DELETE /api/v1/users/:id</code> - 删除用户（需要 delete 权限）</li>
              <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/users/me</code> - 获取当前用户信息（需要 get 权限）</li>
              <li><code className="bg-gray-100 px-1 rounded">PUT /api/v1/users/me</code> - 更新当前用户资料（需要 update 权限）</li>
            </ul>
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-900 mb-2">创建用户示例：</h4>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`POST /api/v1/users
{
  "username": "newuser",
  "name": "新用户",
  "nickname": "New User",
  "password": "password123",
  "email": "user@example.com",
  "public_key": "ssh-rsa AAAAB3...",
  "role_ids": [1, 2]
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* 角色管理 API */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">角色管理 API</h2>
          <p className="text-sm text-gray-500 mb-3">需要 <code className="bg-gray-100 px-1 rounded">user</code> 相关权限（super 角色）</p>
          <div className="space-y-2 text-sm text-gray-600">
            <ul className="list-disc list-inside space-y-1">
              <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/roles</code> - 获取角色列表</li>
              <li><code className="bg-gray-100 px-1 rounded">POST /api/v1/roles</code> - 创建角色</li>
              <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/roles/:id</code> - 获取角色详情</li>
              <li><code className="bg-gray-100 px-1 rounded">PUT /api/v1/roles/:id</code> - 更新角色</li>
              <li><code className="bg-gray-100 px-1 rounded">DELETE /api/v1/roles/:id</code> - 删除角色</li>
            </ul>
          </div>
        </div>

        {/* 资源管理 API */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">资源管理 API</h2>
          <p className="text-sm text-gray-500 mb-3">需要 <code className="bg-gray-100 px-1 rounded">resource</code> 相关权限</p>
          <div className="space-y-2 text-sm text-gray-600">
            <ul className="list-disc list-inside space-y-1">
              <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/resources?type=linux</code> - 获取资源列表（需要 list 权限）</li>
              <li><code className="bg-gray-100 px-1 rounded">POST /api/v1/resources</code> - 创建资源（需要 add 权限，super/system 角色）</li>
              <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/resources/:id?type=linux</code> - 获取资源详情（需要 get 权限）</li>
              <li><code className="bg-gray-100 px-1 rounded">PUT /api/v1/resources/:id</code> - 更新资源（需要 update 权限，super/system 角色）</li>
              <li><code className="bg-gray-100 px-1 rounded">DELETE /api/v1/resources/:id</code> - 删除资源（需要 delete 权限，super/system 角色）</li>
            </ul>
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-900 mb-2">资源类型：</h4>
              <p className="text-sm text-gray-600">linux, windows, docker, database, router, switch</p>
            </div>
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-900 mb-2">创建资源示例：</h4>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`POST /api/v1/resources
{
  "type": "linux",
  "data": [{
    "hostname": "server1",
    "port": 22,
    "ipv4_pub": "192.168.1.100",
    "username": "root",
    "password": "password",
    "description": "Linux服务器"
  }]
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* 资源连接器 API */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">资源连接器 API</h2>
          <p className="text-sm text-gray-500 mb-3">需要 <code className="bg-gray-100 px-1 rounded">resource.use</code> 权限</p>
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">数据库连接</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/connectors/database/:id</code> - 获取数据库连接信息</li>
                <li><code className="bg-gray-100 px-1 rounded">POST /api/v1/connectors/database/:id/query</code> - 执行数据库查询</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Docker 连接</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/connectors/docker/:id</code> - 获取 Docker 连接信息</li>
                <li><code className="bg-gray-100 px-1 rounded">POST /api/v1/connectors/docker/:id/command</code> - 执行 Docker 命令</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Windows 连接</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/connectors/windows/:id</code> - 获取 Windows 连接信息</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">路由器连接</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/connectors/router/:id</code> - 获取路由器连接信息</li>
                <li><code className="bg-gray-100 px-1 rounded">POST /api/v1/connectors/router/:id/command</code> - 执行路由器命令</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">交换机连接</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/connectors/switch/:id</code> - 获取交换机连接信息</li>
                <li><code className="bg-gray-100 px-1 rounded">POST /api/v1/connectors/switch/:id/command</code> - 执行交换机命令</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 日志查询 API */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">日志查询 API</h2>
          <p className="text-sm text-gray-500 mb-3">需要 <code className="bg-gray-100 px-1 rounded">resource.list</code> 权限（所有角色都可以查看）</p>
          <div className="space-y-2 text-sm text-gray-600">
            <ul className="list-disc list-inside space-y-1">
              <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/logs/audit</code> - 获取审计日志（支持分页和过滤）</li>
              <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/logs/access</code> - 获取访问日志</li>
              <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/logs/credential</code> - 获取凭证日志</li>
            </ul>
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-900 mb-2">查询参数示例：</h4>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`GET /api/v1/logs/audit?page=1&pageSize=20&username=admin&action_type=high_risk`}
              </pre>
            </div>
          </div>
        </div>

        {/* 系统信息 API */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">系统信息 API</h2>
          <p className="text-sm text-gray-500 mb-3">所有角色都可以访问</p>
          <div className="space-y-2 text-sm text-gray-600">
            <ul className="list-disc list-inside space-y-1">
              <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/system/info</code> - 获取系统信息和统计</li>
              <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/system/health</code> - 健康检查</li>
            </ul>
          </div>
        </div>

        {/* API Key 管理 API */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">API Key 管理 API</h2>
          <p className="text-sm text-gray-500 mb-3">需要 <code className="bg-gray-100 px-1 rounded">user</code> 管理权限（super 角色，仅管理员）</p>
          <div className="space-y-2 text-sm text-gray-600">
            <ul className="list-disc list-inside space-y-1">
              <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/apikeys</code> - 获取所有 API Key 列表</li>
              <li><code className="bg-gray-100 px-1 rounded">POST /api/v1/apikeys</code> - 创建新的 API Key</li>
              <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/apikeys/:id</code> - 获取 API Key 详情</li>
              <li><code className="bg-gray-100 px-1 rounded">DELETE /api/v1/apikeys/:id</code> - 删除 API Key</li>
            </ul>
          </div>
        </div>

        {/* SSH 密钥管理 API */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">SSH 密钥管理 API</h2>
          <p className="text-sm text-gray-500 mb-3">用户自己的 SSH 密钥管理</p>
          <div className="space-y-2 text-sm text-gray-600">
            <ul className="list-disc list-inside space-y-1">
              <li><code className="bg-gray-100 px-1 rounded">GET /api/v1/ssh-keys/me</code> - 获取当前用户的 SSH 公钥（部分显示）</li>
              <li><code className="bg-gray-100 px-1 rounded">POST /api/v1/ssh-keys/me/upload</code> - 上传 SSH 密钥对</li>
              <li><code className="bg-gray-100 px-1 rounded">POST /api/v1/ssh-keys/me/generate</code> - 生成新的 SSH 密钥对</li>
            </ul>
            <div className="mt-3">
              <h4 className="text-sm font-medium text-gray-900 mb-2">上传密钥示例：</h4>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`POST /api/v1/ssh-keys/me/upload
{
  "public_key": "ssh-rsa AAAAB3NzaC1yc2E...",
  "private_key": "LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQ==..."
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* 示例代码 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">示例代码</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">使用 cURL</h3>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`# 1. 登录获取 Token
curl -X POST http://localhost:8080/api/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"password"}'

# 2. 使用 Token 获取资源列表
curl -X GET "http://localhost:8080/api/v1/resources?type=linux" \\
  -H "Authorization: Bearer <your-token>"

# 3. 使用 API Key
curl -X GET "http://localhost:8080/api/v1/resources?type=linux" \\
  -H "apikey: <your-api-key>"

# 4. 创建资源
curl -X POST http://localhost:8080/api/v1/resources \\
  -H "Authorization: Bearer <your-token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "type": "linux",
    "data": [{
      "hostname": "server1",
      "port": 22,
      "ipv4_pub": "192.168.1.100",
      "username": "root",
      "password": "password"
    }]
  }'`}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">使用 Python</h3>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`import requests

BASE_URL = "http://localhost:8080/api/v1"

# 登录
response = requests.post(f"{BASE_URL}/auth/login", 
  json={"username": "admin", "password": "password"})
data = response.json()
token = data["data"]["token"]

# 设置认证头
headers = {"Authorization": f"Bearer {token}"}

# 获取资源列表
resources = requests.get(
  f"{BASE_URL}/resources?type=linux", 
  headers=headers
).json()

# 创建资源
new_resource = requests.post(
  f"{BASE_URL}/resources",
  headers=headers,
  json={
    "type": "linux",
    "data": [{
      "hostname": "server1",
      "port": 22,
      "ipv4_pub": "192.168.1.100",
      "username": "root",
      "password": "password"
    }]
  }
).json()`}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">使用 JavaScript/Node.js</h3>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`const BASE_URL = "http://localhost:8080/api/v1";

// 登录
const loginResponse = await fetch(\`\${BASE_URL}/auth/login\`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    username: "admin",
    password: "password"
  })
});
const loginData = await loginResponse.json();
const token = loginData.data.token;

// 获取资源列表
const resourcesResponse = await fetch(
  \`\${BASE_URL}/resources?type=linux\`,
  {
    headers: { "Authorization": \`Bearer \${token}\` }
  }
);
const resources = await resourcesResponse.json();`}
              </pre>
            </div>
          </div>
        </div>

        {/* 权限说明 */}
        <div className="rounded-lg bg-white p-6 shadow border-l-4 border-blue-400">
          <h2 className="text-lg font-medium text-gray-900 mb-4">权限说明</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>ROMA 堡垒机使用基于角色的访问控制（RBAC）：</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>super</strong> - 超级管理员，拥有所有权限</li>
              <li><strong>system</strong> - 系统管理员，可以管理资源</li>
              <li><strong>ops</strong> - 运维人员，可以使用资源</li>
            </ul>
            <p className="mt-3">权限类型：</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code className="bg-gray-100 px-1 rounded">list</code> - 查看列表</li>
              <li><code className="bg-gray-100 px-1 rounded">get</code> - 查看详情</li>
              <li><code className="bg-gray-100 px-1 rounded">add</code> - 创建</li>
              <li><code className="bg-gray-100 px-1 rounded">update</code> - 更新</li>
              <li><code className="bg-gray-100 px-1 rounded">delete</code> - 删除</li>
              <li><code className="bg-gray-100 px-1 rounded">use</code> - 使用/连接</li>
            </ul>
          </div>
        </div>

        {/* 错误处理 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">错误处理</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>API 返回的错误格式：</p>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`{
  "code": 400,
  "msg": "error",
  "data": "错误信息"
}`}
            </pre>
            <p className="mt-3">常见 HTTP 状态码：</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code className="bg-gray-100 px-1 rounded">200</code> - 请求成功</li>
              <li><code className="bg-gray-100 px-1 rounded">400</code> - 请求参数错误</li>
              <li><code className="bg-gray-100 px-1 rounded">401</code> - 未认证或认证失败</li>
              <li><code className="bg-gray-100 px-1 rounded">403</code> - 权限不足</li>
              <li><code className="bg-gray-100 px-1 rounded">404</code> - 资源未找到</li>
              <li><code className="bg-gray-100 px-1 rounded">500</code> - 服务器内部错误</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
