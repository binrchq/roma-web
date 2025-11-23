export default function McpTutorial() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">MCP 使用教程</h1>
        <p className="mt-2 text-sm text-gray-600">了解如何通过 MCP 协议使用 ROMA 堡垒机</p>
      </div>

      <div className="space-y-6">
        {/* MCP 简介 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">什么是 MCP？</h2>
          <p className="text-sm text-gray-600 mb-4">
            MCP (Model Context Protocol) 是一个标准协议，允许 AI 助手通过统一的接口与外部系统交互。
            ROMA MCP Bridge 是一个轻量级桥接器（~8MB），通过 SSH 连接到 ROMA 跳板机，使 AI 助手能够安全地管理系统资源。
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mt-4">
            <p className="text-sm text-blue-800">
              <strong>核心优势：</strong>完全复用 ROMA 的权限检查、审计日志和凭证管理，无需额外维护。
            </p>
          </div>
        </div>

        {/* 架构说明 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">架构说明</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="bg-gray-50 p-4 rounded">
              <pre className="whitespace-pre-wrap font-mono text-xs">
{`Claude Desktop / Cursor
      ↓ stdio (JSON-RPC)
ROMA MCP Bridge (~8MB)
      ↓ SSH 连接（端口 2200）
ROMA 跳板机 (SSH Server)
      ├─ 执行 ROMA 命令：ln, ls, whoami, etc.
      ├─ 权限检查 ✅
      ├─ 审计日志 ✅
      └─ SSH 到目标服务器
            ↓
      目标服务器 / 数据库 / 网络设备`}
              </pre>
            </div>
            <p className="mt-3">
              <strong>工作流程：</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>AI 助手通过 MCP 协议调用工具</li>
              <li>MCP Bridge 将工具调用转换为 ROMA SSH 命令</li>
              <li>ROMA 跳板机执行命令，进行权限检查和审计记录</li>
              <li>ROMA 连接到目标服务器执行实际操作</li>
              <li>结果返回给 AI 助手</li>
            </ol>
          </div>
        </div>

        {/* 下载和安装 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">下载和安装</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">方式一：从 GitHub 下载二进制文件（推荐）</h3>
              <p className="text-sm text-gray-600 mb-2">访问 ROMA 项目的 GitHub Releases 页面下载对应平台的二进制文件：</p>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`# macOS (Intel)
wget https://github.com/binrchq/roma/releases/latest/download/roma-mcp-bridge-darwin-amd64
chmod +x roma-mcp-bridge-darwin-amd64
mv roma-mcp-bridge-darwin-amd64 /usr/local/bin/roma-mcp-bridge

# macOS (Apple Silicon)
wget https://github.com/binrchq/roma/releases/latest/download/roma-mcp-bridge-darwin-arm64
chmod +x roma-mcp-bridge-darwin-arm64
mv roma-mcp-bridge-darwin-arm64 /usr/local/bin/roma-mcp-bridge

# Linux (amd64)
wget https://github.com/binrchq/roma/releases/latest/download/roma-mcp-bridge-linux-amd64
chmod +x roma-mcp-bridge-linux-amd64
mv roma-mcp-bridge-linux-amd64 /usr/local/bin/roma-mcp-bridge

# Linux (arm64)
wget https://github.com/binrchq/roma/releases/latest/download/roma-mcp-bridge-linux-arm64
chmod +x roma-mcp-bridge-linux-arm64
mv roma-mcp-bridge-linux-arm64 /usr/local/bin/roma-mcp-bridge

# Windows
# 下载 roma-mcp-bridge-windows-amd64.exe 并重命名为 roma-mcp-bridge.exe`}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">方式二：从源码编译</h3>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`cd /usr/sourcecode/roma/mcp/bridge
go mod tidy
go build -o roma-mcp-bridge

# 查看大小（预期 ~8-10MB）
ls -lh roma-mcp-bridge`}
              </pre>
            </div>
          </div>
        </div>

        {/* 准备 SSH 密钥 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">准备 SSH 密钥</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>1. 生成 SSH 密钥对（如果还没有）：</p>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`ssh-keygen -t rsa -b 4096 -f ~/.ssh/roma_mcp_key`}
            </pre>
            <p>2. 将公钥添加到 ROMA：</p>
            <p className="text-sm text-gray-500 ml-4">
              在 ROMA Web UI 的"我的信息"中上传公钥，或联系管理员将公钥添加到您的用户配置中。
            </p>
          </div>
        </div>

        {/* 配置环境变量 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">配置环境变量</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>MCP Bridge 需要以下环境变量：</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><code className="bg-gray-100 px-1 rounded">ROMA_SSH_HOST</code> - ROMA 跳板机地址（必需）</li>
              <li><code className="bg-gray-100 px-1 rounded">ROMA_SSH_PORT</code> - ROMA SSH 端口（默认 2200）</li>
              <li><code className="bg-gray-100 px-1 rounded">ROMA_SSH_USER</code> - ROMA 用户名（必需）</li>
              <li><code className="bg-gray-100 px-1 rounded">ROMA_SSH_KEY</code> - SSH 私钥内容（必需）</li>
              <li><code className="bg-gray-100 px-1 rounded">ROMA_SSH_KEY_FILE</code> - 或使用私钥文件路径（可选）</li>
            </ul>
            <div className="mt-3">
              <p className="mb-2">示例配置：</p>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`export ROMA_SSH_HOST="10.2.2.230"
export ROMA_SSH_PORT="2200"
export ROMA_SSH_USER="super"
export ROMA_SSH_KEY="$(cat ~/.ssh/roma_mcp_key)"`}
              </pre>
            </div>
          </div>
        </div>

        {/* 配置 Claude Desktop */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">配置 Claude Desktop</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">1. 编辑配置文件</h3>
              <p className="text-sm text-gray-600 mb-2">编辑 Claude Desktop 配置文件：</p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside ml-4 mb-3">
                <li><strong>macOS:</strong> <code className="bg-gray-100 px-1 rounded">~/Library/Application Support/Claude/claude_desktop_config.json</code></li>
                <li><strong>Windows:</strong> <code className="bg-gray-100 px-1 rounded">%APPDATA%\\Claude\\claude_desktop_config.json</code></li>
                <li><strong>Linux:</strong> <code className="bg-gray-100 px-1 rounded">~/.config/Claude/claude_desktop_config.json</code></li>
              </ul>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`{
  "mcpServers": {
    "roma": {
      "command": "/usr/local/bin/roma-mcp-bridge",
      "env": {
        "ROMA_SSH_HOST": "10.2.2.230",
        "ROMA_SSH_PORT": "2200",
        "ROMA_SSH_USER": "super",
        "ROMA_SSH_KEY": "-----BEGIN OPENSSH PRIVATE KEY-----\\n您的私钥内容\\n-----END OPENSSH PRIVATE KEY-----"
      }
    }
  }
}`}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">2. 使用私钥文件（推荐）</h3>
              <p className="text-sm text-gray-600 mb-2">如果不想在配置文件中直接写入私钥，可以使用文件路径：</p>
              <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`{
  "mcpServers": {
    "roma": {
      "command": "/usr/local/bin/roma-mcp-bridge",
      "env": {
        "ROMA_SSH_HOST": "10.2.2.230",
        "ROMA_SSH_PORT": "2200",
        "ROMA_SSH_USER": "super",
        "ROMA_SSH_KEY_FILE": "/home/user/.ssh/roma_mcp_key"
      }
    }
  }
}`}
              </pre>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">3. 重启 Claude Desktop</h3>
              <p className="text-sm text-gray-600">
                完全退出并重新启动 Claude Desktop，MCP Bridge 会自动启动。您应该能在 Claude 中看到 ROMA 的工具。
              </p>
            </div>
          </div>
        </div>

        {/* 可用工具 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">可用的 MCP 工具</h2>
          <div className="space-y-4">
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>重要：</strong>工具分为两大类，请严格区分：
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">1. ROMA 资源信息查询工具 🔍</h3>
              <p className="text-sm text-gray-600 mb-2">查询 ROMA 跳板机中管理的资源信息（配置、元数据等）：</p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside ml-4">
                <li><code className="bg-gray-100 px-1 rounded">list_resources</code> - 列出指定类型的所有资源（ROMA 命令：<code className="bg-gray-100 px-1 rounded">ls</code>）</li>
                <li><code className="bg-gray-100 px-1 rounded">get_resource_info</code> - 获取资源的详细信息（ROMA 命令：<code className="bg-gray-100 px-1 rounded">ls -l</code>）</li>
                <li><code className="bg-gray-100 px-1 rounded">get_current_user</code> - 获取当前用户信息和权限（ROMA 命令：<code className="bg-gray-100 px-1 rounded">whoami</code>）</li>
                <li><code className="bg-gray-100 px-1 rounded">get_command_history</code> - 获取命令历史记录（ROMA 命令：<code className="bg-gray-100 px-1 rounded">history</code>）</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">2. 实际数据查询工具 💻</h3>
              <p className="text-sm text-gray-600 mb-2">查询实际服务器/数据库的数据：</p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside ml-4">
                <li><code className="bg-gray-100 px-1 rounded">execute_command</code> - 在服务器上执行 Shell 命令</li>
                <li><code className="bg-gray-100 px-1 rounded">execute_database_query</code> - 在数据库上执行 SQL 查询</li>
                <li><code className="bg-gray-100 px-1 rounded">execute_commands</code> - 执行多个命令</li>
                <li><code className="bg-gray-100 px-1 rounded">copy_file_to_resource</code> - 上传文件到资源（SCP）</li>
                <li><code className="bg-gray-100 px-1 rounded">copy_file_from_resource</code> - 从资源下载文件（SCP）</li>
                <li><code className="bg-gray-100 px-1 rounded">get_disk_usage</code> - 获取磁盘使用情况</li>
                <li><code className="bg-gray-100 px-1 rounded">get_process_list</code> - 获取进程列表</li>
                <li><code className="bg-gray-100 px-1 rounded">get_memory_usage</code> - 获取内存使用情况</li>
                <li><code className="bg-gray-100 px-1 rounded">get_cpu_info</code> - 获取 CPU 信息</li>
                <li><code className="bg-gray-100 px-1 rounded">get_network_info</code> - 获取网络信息</li>
                <li><code className="bg-gray-100 px-1 rounded">get_uptime</code> - 获取运行时间和负载</li>
                <li><code className="bg-gray-100 px-1 rounded">get_system_info</code> - 获取系统详细信息</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-3 rounded mt-3">
              <p className="text-sm text-blue-800">
                <strong>使用建议：</strong>
              </p>
              <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside ml-4 mt-2">
                <li>想查看有哪些资源可用 → 使用 <code className="bg-blue-100 px-1 rounded">list_resources</code>（ROMA 资源信息）</li>
                <li>想查看资源的配置信息 → 使用 <code className="bg-blue-100 px-1 rounded">get_resource_info</code>（ROMA 资源信息）</li>
                <li>想查看服务器上的日志 → 使用 <code className="bg-blue-100 px-1 rounded">execute_command</code>（实际数据）</li>
                <li>想查询数据库数据 → 使用 <code className="bg-blue-100 px-1 rounded">execute_database_query</code>（实际数据）</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 使用示例 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">使用示例</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">示例 1：查看可用资源</h3>
              <p className="text-sm text-gray-600 mb-2">在 Claude 中说：</p>
              <div className="bg-gray-50 p-3 rounded text-sm italic mb-2">
                "列出所有 Linux 服务器资源"
              </div>
              <p className="text-sm text-gray-600">Claude 会自动调用 <code className="bg-gray-100 px-1 rounded">list_resources</code> 工具。</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">示例 2：执行命令</h3>
              <p className="text-sm text-gray-600 mb-2">在 Claude 中说：</p>
              <div className="bg-gray-50 p-3 rounded text-sm italic mb-2">
                "查看 server1 的磁盘使用情况"
              </div>
              <p className="text-sm text-gray-600">Claude 会自动调用 <code className="bg-gray-100 px-1 rounded">get_disk_usage</code> 或 <code className="bg-gray-100 px-1 rounded">execute_command</code> 工具。</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">示例 3：文件传输</h3>
              <p className="text-sm text-gray-600 mb-2">在 Claude 中说：</p>
              <div className="bg-gray-50 p-3 rounded text-sm italic mb-2">
                "将本地文件 1.1 上传到服务器 server1 的 /tmp 目录"
              </div>
              <p className="text-sm text-gray-600">Claude 会自动调用 <code className="bg-gray-100 px-1 rounded">copy_file_to_resource</code> 工具。</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">示例 4：数据库查询</h3>
              <p className="text-sm text-gray-600 mb-2">在 Claude 中说：</p>
              <div className="bg-gray-50 p-3 rounded text-sm italic mb-2">
                "查询 links-mysql 数据库中的所有表"
              </div>
              <p className="text-sm text-gray-600">Claude 会自动调用 <code className="bg-gray-100 px-1 rounded">execute_database_query</code> 工具。</p>
            </div>
          </div>
        </div>

        {/* ROMA 命令支持 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">ROMA 命令支持</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>MCP Bridge 通过 SSH 执行 ROMA 的非交互式命令：</p>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`# 列出资源
ssh super@roma -p 2200 "ls linux"

# 在服务器上执行命令
ssh super@roma -p 2200 'ln -t linux server1 "df -h"'

# 查看当前用户
ssh super@roma -p 2200 "whoami"`}
            </pre>
            <p className="mt-3">
              <strong>工作流程：</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>ROMA 检测到有命令传入（非交互式模式）</li>
              <li>执行命令并输出结果</li>
              <li>自动退出（不进入交互式 TUI）</li>
            </ol>
          </div>
        </div>

        {/* 故障排查 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">故障排查</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">问题 1：SSH 连接失败</h3>
              <p className="text-sm text-gray-600 mb-2">错误信息：<code className="bg-gray-100 px-1 rounded">ERROR 连接 ROMA 失败: SSH 连接失败</code></p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside ml-4">
                <li>检查 ROMA 跳板机是否可达：<code className="bg-gray-100 px-1 rounded">telnet ROMA_SSH_HOST ROMA_SSH_PORT</code></li>
                <li>检查防火墙规则</li>
                <li>确认 ROMA SSH 服务正在运行</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">问题 2：认证失败</h3>
              <p className="text-sm text-gray-600 mb-2">错误信息：<code className="bg-gray-100 px-1 rounded">ssh: handshake failed</code></p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside ml-4">
                <li>检查私钥格式是否正确</li>
                <li>确认公钥已添加到 ROMA 用户配置中</li>
                <li>检查私钥权限：<code className="bg-gray-100 px-1 rounded">chmod 600 ~/.ssh/roma_key</code></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">问题 3：权限不足</h3>
              <p className="text-sm text-gray-600 mb-2">错误信息：<code className="bg-gray-100 px-1 rounded">permission denied</code></p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside ml-4">
                <li>在 ROMA 中检查用户角色和权限</li>
                <li>使用 <code className="bg-gray-100 px-1 rounded">get_current_user</code> 工具查看当前权限</li>
                <li>联系管理员分配资源权限</li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">问题 4：资源未找到</h3>
              <p className="text-sm text-gray-600 mb-2">错误信息：<code className="bg-gray-100 px-1 rounded">resource not found</code></p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside ml-4">
                <li>使用 <code className="bg-gray-100 px-1 rounded">list_resources</code> 确认资源存在</li>
                <li>检查资源标识符是否正确</li>
                <li>确认资源状态是否 running</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 测试运行 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">测试运行</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>在配置 Claude Desktop 之前，可以先手动测试 MCP Bridge：</p>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`# 设置环境变量
export ROMA_SSH_HOST="10.2.2.230"
export ROMA_SSH_PORT="2200"
export ROMA_SSH_USER="super"
export ROMA_SSH_KEY="$(cat ~/.ssh/roma_mcp_key)"

# 运行 MCP Bridge
./roma-mcp-bridge

# 应该看到：
# INFO 已连接到 ROMA 跳板机 host=10.2.2.230 port=2200 user=super
# INFO 已注册 12 个 MCP 工具
# INFO 等待来自 Claude Desktop 的连接...`}
            </pre>
            <p className="mt-3">也可以手动测试 ROMA 命令：</p>
            <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
{`# 测试列出资源
ssh super@10.2.2.230 -p 2200 -i ~/.ssh/roma_key "ls linux"

# 测试执行命令
ssh super@10.2.2.230 -p 2200 -i ~/.ssh/roma_key 'ln -t linux server1 "uptime"'`}
            </pre>
          </div>
        </div>

        {/* 安全性 */}
        <div className="rounded-lg bg-white p-6 shadow border-l-4 border-green-400">
          <h2 className="text-lg font-medium text-gray-900 mb-4">安全性</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>✅ SSH Key 认证（比 API Key 更安全）</li>
              <li>✅ 所有操作都经过 ROMA 的权限检查</li>
              <li>✅ 统一的审计日志（在 ROMA 中）</li>
              <li>✅ 不直接访问目标服务器（通过 ROMA 跳板）</li>
              <li>✅ 不需要存储数据库凭证（ROMA 管理）</li>
              <li>✅ 不需要存储目标服务器凭证（ROMA 管理）</li>
            </ul>
            <div className="bg-green-50 p-3 rounded mt-3">
              <p className="text-sm text-green-800">
                <strong>认证链：</strong>
              </p>
              <ol className="text-sm text-green-800 space-y-1 list-decimal list-inside ml-4 mt-2">
                <li>Claude Desktop → MCP Bridge（本地进程，stdio 通信）</li>
                <li>MCP Bridge → ROMA（SSH Key 认证，私钥存储在本地）</li>
                <li>ROMA → 目标服务器（ROMA 管理的凭证，加密存储）</li>
              </ol>
            </div>
          </div>
        </div>

        {/* 性能 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">性能</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>连接建立：</strong>~100ms</li>
              <li><strong>命令执行：</strong>取决于目标服务器响应时间</li>
              <li><strong>内存占用：</strong>~10-20MB</li>
              <li><strong>CPU 占用：</strong>几乎为 0（空闲时）</li>
              <li><strong>二进制大小：</strong>~8-10MB</li>
            </ul>
          </div>
        </div>

        {/* 其他 AI 助手 */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">其他 AI 助手</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>除了 Claude Desktop，您也可以在其他支持 MCP 的 AI 助手中使用：</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Cursor：</strong>在设置中配置 MCP 服务器</li>
              <li><strong>Ollama + Python 脚本：</strong>参考 <code className="bg-gray-100 px-1 rounded">mcp/bridge/test_with_ollama.py</code></li>
              <li><strong>其他支持 MCP 的客户端：</strong>按照 MCP 标准协议配置</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
