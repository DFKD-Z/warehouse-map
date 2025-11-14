# Git 推送指南

## ✅ 当前状态

- ✅ 远程仓库已关联：`https://github.com/DFKD-Z/warehouse-map.git`
- ✅ 本地分支：`main`
- ✅ 工作区干净，所有更改已提交

## 🚀 推送步骤

### 方法 1：使用 HTTPS（推荐）

1. **确保已登录 GitHub**
   - 访问 https://github.com
   - 确认已登录账户 `DFKD-Z`

2. **使用 Personal Access Token（推荐）**
   
   如果之前没有配置过，需要创建 Personal Access Token：
   
   - 访问：https://github.com/settings/tokens
   - 点击 "Generate new token" → "Generate new token (classic)"
   - 设置权限：至少勾选 `repo` 权限
   - 复制生成的 token
   
3. **推送代码**
   ```bash
   git push -u origin main
   ```
   
   当提示输入用户名时：
   - Username: `DFKD-Z`
   - Password: 输入刚才复制的 Personal Access Token（不是密码）

### 方法 2：使用 SSH

1. **检查 SSH 密钥**
   ```bash
   ls -la ~/.ssh
   ```

2. **如果没有 SSH 密钥，生成一个**
   ```bash
   ssh-keygen -t ed25519 -C "zhangyun@doorzo.cn"
   ```

3. **添加 SSH 密钥到 GitHub**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   
   复制输出的公钥，然后：
   - 访问：https://github.com/settings/keys
   - 点击 "New SSH key"
   - 粘贴公钥并保存

4. **更改远程 URL 为 SSH**
   ```bash
   git remote set-url origin git@github.com:DFKD-Z/warehouse-map.git
   ```

5. **推送代码**
   ```bash
   git push -u origin main
   ```

### 方法 3：使用 GitHub CLI

如果已安装 GitHub CLI (`gh`)：

```bash
gh auth login
git push -u origin main
```

## 📋 当前仓库信息

- **远程仓库**: https://github.com/DFKD-Z/warehouse-map.git
- **本地分支**: main
- **Git 用户**: zhangyun <zhangyun@doorzo.cn>
- **最新提交**: 9caa165 init

## 🔍 验证推送

推送成功后，访问以下 URL 查看：
https://github.com/DFKD-Z/warehouse-map

## ⚠️ 注意事项

1. **网络连接**：确保能正常访问 GitHub
2. **权限**：确保账户有仓库的写入权限
3. **认证**：推荐使用 Personal Access Token 或 SSH 密钥

## 🆘 常见问题

### 问题 1：认证失败
**解决**：使用 Personal Access Token 替代密码

### 问题 2：网络连接超时
**解决**：
- 检查网络连接
- 尝试使用代理
- 或使用 SSH 方式

### 问题 3：权限不足
**解决**：确保账户是仓库的 owner 或有写入权限

---

**提示**：如果遇到网络问题，可以稍后重试，或者使用代理/VPN。

