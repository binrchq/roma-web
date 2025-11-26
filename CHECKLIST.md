# 🔍 部署检查清单

## 开发环境检查

- [ ] 运行 `npm run dev`
- [ ] 打开浏览器控制台
- [ ] 确认看到：`[env] 开发环境，使用代理模式: /api`
- [ ] 测试 API 请求是否正常

---

## 生产环境检查（K8s）

### 1. 构建前检查

- [ ] 确认 `vite.config.js` 中没有硬编码后端地址
- [ ] 确认 `src/utils/env.js` 使用占位符逻辑

### 2. K8s 配置检查

编辑 `deployment/k8s-deployment.yaml`：

```yaml
env:
  - name: VITE_ENV
    value: "prod"  # ✅ 必填
  - name: VITE_API_BASE_URL
    value: "https://your-api-domain.com/api/v1"  # ✅ 必填
```

- [ ] 已配置 `VITE_ENV`
- [ ] 已配置 `VITE_API_BASE_URL`（完整 URL）
- [ ] API URL 末尾无多余斜杠

### 3. 部署后检查

```bash
# 进入容器
kubectl exec -it <pod-name> -n roma -- sh

# 检查环境变量
echo $VITE_API_BASE_URL
echo $VITE_ENV
```

- [ ] 环境变量已正确设置
- [ ] 容器日志显示替换成功

### 4. 验证占位符替换

```bash
# 检查是否还有占位符（应该为空）
grep -r "VITE_API_BASE_URL_PLACEHOLDER" /usr/share/nginx/html/assets/
grep -r "VITE_ENV_PLACEHOLDER" /usr/share/nginx/html/assets/
```

- [ ] 无占位符残留

### 5. 浏览器测试

- [ ] 打开前端页面
- [ ] 打开浏览器控制台
- [ ] 确认看到：`[env] 生产环境，使用运行时注入的 API 地址: https://...`
- [ ] 测试 API 请求是否正常
- [ ] 检查网络面板中的请求 URL 是否正确

---

## 常见问题排查

### ❌ 浏览器显示：`生产环境缺少 VITE_API_BASE_URL 运行时注入`

**原因**：K8s 环境变量未配置

**解决**：
1. 编辑 `deployment/k8s-deployment.yaml`
2. 添加 `VITE_API_BASE_URL` 环境变量
3. 重新部署：`kubectl apply -f deployment/k8s-deployment.yaml`

---

### ❌ 容器日志显示：`仍有 X 个文件包含占位符`

**原因**：占位符替换失败

**排查**：
1. 检查 `docker-entrypoint.sh` 是否正确
2. 确认环境变量在容器中生效：`kubectl exec -it <pod> -- env | grep VITE`
3. 检查文件权限：`ls -la /usr/share/nginx/html/assets/`

---

### ❌ API 请求 404 或跨域错误

**原因**：后端 URL 配置错误

**排查**：
1. 确认 `VITE_API_BASE_URL` 格式正确（包含协议、域名、路径）
2. 确认后端支持 CORS（如果需要）
3. 检查浏览器网络面板中的实际请求 URL

---

### ❌ 开发环境请求失败

**原因**：本地后端未启动或代理配置错误

**排查**：
1. 确认后端服务运行在 `http://localhost:6999`
2. 或设置环境变量：`VITE_API_BASE_URL=http://localhost:8080 npm run dev`
3. 检查 `vite.config.js` 代理配置

---

## 🎉 全部通过？

恭喜！你的配置已正确完成。

如需更多信息，请参考：
- [DEPLOYMENT.md](./DEPLOYMENT.md) - 详细部署指南
- [CONFIG_SUMMARY.md](./CONFIG_SUMMARY.md) - 配置修改总结

