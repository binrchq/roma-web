# 🔒 前端日志管理

## 概述

为了保护生产环境的敏感信息，前端实现了条件化日志输出系统。

---

## 🎯 核心特性

### 1. **环境自动检测**
- ✅ **开发环境**：所有日志正常输出
- ✅ **生产环境**：默认隐藏调试日志，仅保留错误日志

### 2. **可控调试模式**
生产环境可以临时启用调试模式（用于问题排查）

### 3. **分类日志**
- `logger` - 通用日志
- `apiLogger` - API 请求日志
- `envLogger` - 环境配置日志

---

## 📋 日志输出规则

| 日志类型 | 开发环境 | 生产环境 | 调试模式 |
|---------|---------|---------|---------|
| `logger.log()` | ✅ 显示 | ❌ 隐藏 | ✅ 显示 |
| `logger.info()` | ✅ 显示 | ❌ 隐藏 | ✅ 显示 |
| `logger.warn()` | ✅ 显示 | ❌ 隐藏 | ✅ 显示 |
| `logger.debug()` | ✅ 显示 | ❌ 隐藏 | ✅ 显示 |
| `logger.error()` | ✅ 显示 | ✅ 显示 | ✅ 显示 |

---

## 🔧 使用方法

### 在代码中使用

```javascript
// 导入日志工具
import { logger, apiLogger, envLogger } from '@/utils/logger';

// 通用日志
logger.log('用户登录成功');
logger.info('加载配置完成');
logger.warn('Token 即将过期');
logger.debug('调试信息:', data);

// API 请求日志
apiLogger.log('Request:', method, url);
apiLogger.error('API 请求失败:', error);

// 环境配置日志
envLogger.log('✓ 使用运行时注入的 API 地址:', url);
envLogger.warn('⚠️  未设置环境变量');

// 错误日志（始终显示）
logger.error('发生错误:', error);
```

---

## 🐛 生产环境调试

### 方法 1：浏览器控制台

```javascript
// 启用调试模式
enableDebugMode();

// 刷新页面，现在可以看到所有日志

// 关闭调试模式
disableDebugMode();
```

### 方法 2：直接设置 localStorage

```javascript
// 启用
localStorage.setItem('DEBUG_MODE', 'true');
location.reload();

// 关闭
localStorage.removeItem('DEBUG_MODE');
location.reload();
```

---

## 📊 隐藏的敏感信息

以下信息在生产环境默认隐藏：

### 1. **API 请求详情**
```javascript
// 隐藏：请求 URL、方法、参数
apiLogger.log('Request:', method, fullUrl);  // ❌ 生产环境不显示

// 隐藏：重定向信息
apiLogger.debug('Redirected:', response.url);  // ❌ 生产环境不显示
```

### 2. **环境配置信息**
```javascript
// 隐藏：API 地址
envLogger.log('✓ 使用运行时注入的 API 地址:', runtimeApiBaseUrl);  // ❌ 生产环境不显示

// 隐藏：环境配置详情
envLogger.log('🌍 当前环境配置:', getEnvConfig());  // ❌ 生产环境不显示
```

### 3. **调试信息**
```javascript
// 隐藏：响应详情
apiLogger.debug('响应文本前200字符:', text.substring(0, 200));  // ❌ 生产环境不显示
apiLogger.debug('Content-Type:', contentType);  // ❌ 生产环境不显示
```

---

## ⚠️ 注意事项

### ✅ 推荐做法

```javascript
// 使用日志工具
import { apiLogger } from '@/utils/logger';
apiLogger.log('请求成功');

// 错误信息始终记录
logger.error('发生错误:', error);
```

### ❌ 避免做法

```javascript
// 不要直接使用 console.log
console.log('API URL:', url);  // ❌ 会暴露敏感信息

// 不要在错误日志中包含敏感信息
logger.error('登录失败:', { password: '123456' });  // ❌ 泄露密码
```

---

## 🛡️ 安全建议

1. **敏感数据脱敏**
   ```javascript
   // ✅ 好的做法
   logger.log('用户邮箱:', email.replace(/(.{3}).*(@.*)/, '$1***$2'));
   
   // ❌ 不好的做法
   logger.log('用户邮箱:', email);
   ```

2. **错误信息过滤**
   ```javascript
   // ✅ 好的做法
   logger.error('登录失败:', error.message);
   
   // ❌ 不好的做法
   logger.error('登录失败:', { username, password });
   ```

3. **生产环境验证**
   ```javascript
   // 部署前确认调试模式已关闭
   localStorage.getItem('DEBUG_MODE')  // 应该为 null
   ```

---

## 📝 迁移指南

如果你的代码中有 `console.log`，请按以下方式迁移：

```javascript
// 旧代码
console.log('[api] Request:', url);
console.error('Error:', error);

// 新代码
import { apiLogger } from '@/utils/logger';
apiLogger.log('Request:', url);
apiLogger.error('Error:', error);
```

---

## 🔍 调试场景

### 场景 1：生产环境 API 请求失败

```javascript
// 1. 打开浏览器控制台
// 2. 启用调试模式
enableDebugMode();

// 3. 刷新页面
location.reload();

// 4. 重现问题，查看详细日志
// 5. 问题解决后关闭调试模式
disableDebugMode();
```

### 场景 2：查看运行时配置

```javascript
// 启用调试模式
enableDebugMode();
location.reload();

// 查看环境配置（会在控制台显示）
// [env] ✓ 使用运行时注入的 API 地址: https://roma-api.c.binrc.com/api/v1
```

---

## 📚 相关文件

| 文件 | 说明 |
|------|------|
| `src/utils/logger.js` | 日志工具核心实现 |
| `src/utils/env.js` | 环境配置（已集成日志） |
| `src/api/roma-request.js` | API 请求（已集成日志） |

---

更新时间：2025-11-26

