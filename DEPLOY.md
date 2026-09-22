# 部署指南 - SRX 个人观察站

> 本指南帮助您将 `D:\github resume\` 中的网站文件部署到 GitHub Pages。

---

## ⚠️ 当前环境说明

由于本机未安装 `git` 和 `gh` 命令行工具，**无法直接通过本会话完成推送**。
您需要在本地 PowerShell 或终端中手动执行以下命令。

---

## 📋 前置准备

1. **安装 Git**（如果尚未安装）
   - 下载：https://git-scm.com/download/win
   - 安装后重启 PowerShell

2. **配置 Git 用户信息**（首次使用）
   ```powershell
   git config --global user.name "Your Name"
   git config --global user.email "your-email@example.com"
   ```

3. **GitHub 账号**：您的仓库 https://github.com/srx20030317-arch/resume

---

## 🚀 部署步骤

### 步骤 1：清理临时文档（可选）

为了保持仓库整洁，建议将本目录下的参考性 .md 文档移到 `docs/` 子目录，或者删除它们。网站文件本身只需要：

```
✅ index.html              # 首页
✅ about.html              # 关于我（详细）
✅ projects.html           # 项目展示
✅ experience.html         # 经历时间线
✅ styles.css              # 样式
✅ script.js               # 交互脚本
✅ assets/photos/avatar.svg # 头像占位图
```

可以保留或删除的文档：
```
📄 README.md              # 项目说明（可选保留）
📄 DEPLOY.md              # 本文档（建议删掉或移到 docs/）
📄 data-files.md          # 数据结构参考（建议删掉）
📄 index.md               # 原 HXY 分析（建议删掉）
📄 styles.md              # 原 HXY 分析（建议删掉）
📄 script.md              # 原 HXY 分析（建议删掉）
📄 assets-photos.md       # 原 HXY 分析（建议删掉）
📄 assets-projects.md     # 原 HXY 分析（建议删掉）
📄 assets-audio.md        # 原 HXY 分析（建议删掉）
📄 script.js (备份副本)    # 已合并到主 script.js
```

### 步骤 2：进入项目目录

```powershell
cd "D:\github resume"
```

### 步骤 3：初始化 Git 仓库

```powershell
# 如果是新仓库
git init
git branch -M main

# 添加 GitHub 远程仓库
git remote add origin https://github.com/srx20030317-arch/resume.git

# 如果远程已有内容，先拉取
git pull origin main --allow-unrelated-histories
```

### 步骤 4：添加并提交文件

```powershell
# 添加所有网站文件
git add index.html about.html projects.html experience.html styles.css script.js assets/

# 提交
git commit -m "feat: initial commit of SRX personal observatory homepage"

# 如需同时推送参考文档
# git add .
# git commit -m "feat: initial commit"
```

### 步骤 5：推送到 GitHub

```powershell
git push -u origin main
```

> 推送时会要求您输入 GitHub 用户名和密码。
> 推荐使用 **Personal Access Token (PAT)** 代替密码：
> 1. 访问 https://github.com/settings/tokens
> 2. Generate new token (classic)
> 3. 勾选 `repo` 权限
> 4. 复制 token，作为密码使用

---

## 🌐 启用 GitHub Pages

推送成功后：

1. 打开 https://github.com/srx20030317-arch/resume
2. 进入 **Settings** → **Pages**
3. Source 选择：**Deploy from a branch**
4. Branch 选择：**main** / **(root)**
5. 点击 **Save**

等待 1-2 分钟后，您的网站将可以通过以下地址访问：

```
https://srx20030317-arch.github.io/resume/
```

> ⚠️ 如果仓库名是 `srx20030317-arch.github.io`，则访问地址为：
> `https://srx20030317-arch.github.io/`

---

## 🔄 后续更新流程

每次修改文件后：

```powershell
cd "D:\github resume"

# 查看修改状态
git status

# 添加修改
git add .

# 提交
git commit -m "描述你的修改"

# 推送
git push
```

GitHub Pages 会在 30 秒 - 2 分钟内自动重新部署。

---

## 🎨 自定义配置

### 1. 替换头像

将您自己的照片放到 `assets/photos/avatar.jpg`（建议 600×600 正方形），
然后编辑所有 HTML 中的 `src="assets/photos/avatar.svg"` 改为 `src="assets/photos/avatar.jpg"`。

### 2. 修改联系方式

编辑 `index.html` 中 `#contact` 区：
- 邮箱：将 `your-email@example.com` 替换为真实邮箱
- GitHub：已配置为 `srx20030317-arch`
- 社交账号：填充 `.contact-placeholder` 卡片的链接

### 3. 修改主题色

编辑 `styles.css` 的 `:root` 变量：
```css
:root {
  --purple: #7828d6;   /* 主紫色 */
  --pink:   #f24f9c;   /* 强调粉 */
}
```

### 4. 添加新页面

1. 复制 `about.html` 作为模板
2. 修改内容
3. 在所有页面的 `<nav class="site-nav">` 中添加链接
4. 推送到 GitHub

---

## 🆘 常见问题

### Q1：推送时提示 "Authentication failed"
A：GitHub 已不支持密码登录，请使用 Personal Access Token：
- https://github.com/settings/tokens → Generate new token

### Q2：推送时提示 "Permission denied"
A：检查远程仓库 URL 是否正确：
```powershell
git remote -v
# 应该显示 https://github.com/srx20030317-arch/resume.git
```

### Q3：GitHub Pages 404
A：
1. 确认仓库名与 URL 一致
2. 确认 `index.html` 在仓库根目录
3. 等待 5 分钟让 GitHub 完成构建

### Q4：网站样式没有加载
A：检查浏览器控制台（F12），通常是因为路径不对。`styles.css` 必须与 `index.html` 在同一目录。

### Q5：想使用自己的域名
A：在仓库根目录创建 `CNAME` 文件，写入您的域名（如 `resume.srx.com`），然后在域名服务商添加 CNAME 记录指向 `srx20030317-arch.github.io`。

---

## 📚 推荐资源

- [GitHub Pages 官方文档](https://docs.github.com/zh/pages)
- [Git 简明指南](https://rogerdudler.github.io/git-guide/index.zh.html)
- [Pro Git 中文版](https://git-scm.com/book/zh/v2)

---

部署完成后，欢迎在浏览器中打开您的个人主页！
