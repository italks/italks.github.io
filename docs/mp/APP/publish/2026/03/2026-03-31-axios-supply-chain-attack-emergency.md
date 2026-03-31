# 紧急预警 | axios 遭供应链投毒！周下载 3 亿次的 npm 包中招，立即检查你的项目

> **摘要：** 2026年3月31日凌晨，npm 生态爆发严重供应链安全事件——JavaScript 生态最热门 HTTP 请求库 axios 的两个版本遭恶意投毒，植入跨平台远程访问木马（RAT）。受影响版本为 `axios@1.14.1` 和 `axios@0.30.4`，安全版本为 `axios@1.14.0` 和 `axios@0.30.3`。**所有使用 axios 的项目，请立刻执行本文检查步骤。**
>
> 📖 **阅读时长：** 约 6 分钟 | ⚠️ **紧急程度：** 高

---

## 一、这次事件有多严重？

axios——这个几乎出现在**每一个 JavaScript 项目**里的 HTTP 请求库，今天凌晨中招了。

**数字告诉你规模：**

- 📦 npm 月下载量：**超过 3 亿次**
- ⭐ GitHub Star：**106,000+**
- 💻 被依赖的项目数：**数以百万计**（包括几乎所有 React、Vue、Node.js 项目）

2026年3月31日 **00:21 UTC**，安全公司 StepSecurity 发出紧急警报：攻击者劫持了 axios 核心维护者 `jasonsaayman` 的 npm 账号，发布了两个携带**跨平台远程访问木马（RAT）**的恶意版本。

这不是理论上的漏洞，是**正在活跃运行的后门**。

---

## 二、受影响版本 vs 安全版本

| 状态 | 版本号 | 分支 | 说明 |
|:---:|:---:|:---:|:---|
| ❌ **恶意版本** | `axios@1.14.1` | 1.x（主线） | 含 RAT，立即停用 |
| ❌ **恶意版本** | `axios@0.30.4` | 0.x（旧版） | 含 RAT，立即停用 |
| ✅ **安全版本** | `axios@1.14.0` | 1.x（主线） | 降级至此 |
| ✅ **安全版本** | `axios@0.30.3` | 0.x（旧版） | 降级至此 |
| ✅ **安全版本** | `<= axios@1.14.0` | 1.x 所有旧版 | 均安全 |

> ⚠️ **特别注意：** 如果你在 `package.json` 中写的是 `"axios": "^1.14.0"`，那在攻击窗口期间执行 `npm install` 时，`^` 符号会允许自动升级到 1.14.1，**可能已经中招**！

---

## 三、攻击是怎么实施的？

这次攻击的设计相当隐蔽。攻击者**没有直接修改 axios 源代码**，而是采用了更难察觉的手段：

### 第一步：账号劫持
攻击者通过不明手段获取了 axios 核心维护者的 npm 账户访问权限，绕过 CI/CD 审查，**直接发布了恶意版本**。

### 第二步：植入恶意依赖
在恶意版本的 `package.json` 中，新增了一个看似无害的依赖：

```json
"dependencies": {
  "plain-crypto-js": "4.2.1"  // 伪装成 crypto-js 的恶意包
}
```

### 第三步：postinstall 钩子触发木马
`plain-crypto-js@4.2.1` 包含一个 `postinstall` 钩子，在包安装完成后**自动执行** `node setup.js`，启动攻击链。

```
npm install axios  
  → 安装 plain-crypto-js@4.2.1  
    → 触发 postinstall  
      → 执行 setup.js（双重混淆：反向Base64 + XOR加密）  
        → 连接 C2 服务器 sfrclak[.]com:8000 (142.11.206.73)  
          → 下载平台特定 RAT  
            → 建立持久化后门
```

### 第四步：多平台 RAT 落地

攻击脚本会先检测操作系统，然后部署针对性的后门：

| 操作系统 | 恶意文件路径 | 伪装方式 |
|:---:|:---|:---|
| macOS | `/Library/Caches/com.apple.act.mond` | 伪装成苹果系统缓存 |
| Windows | `%PROGRAMDATA%\wt.exe` | 伪装成 Windows Terminal |
| Linux | `/tmp/ld.py` | Python RAT，后台静默运行 |

**RAT 具备的能力：**
- 📡 定期向 C2 服务器发送信标（心跳）
- 💻 远程执行任意代码/Shell 命令
- 📂 文件系统枚举和数据外传
- 🔑 窃取系统凭证（API 密钥、SSH 密钥等）

---

## 四、谁最需要紧张？

### 🔴 高危：可能已经中招
符合以下任一条件，需立即进入应急响应流程：

1. **在 2026-03-31 00:21 UTC 至 03:29 UTC 之间**，在任何环境执行了 `npm install` 或 `npm update`
2. 项目使用 `^` 或 `~` 语义化版本控制，且在上述时间窗口内有 CI/CD 构建记录
3. 使用了 `@qqbrowser/openclaw-qbot@0.0.130` 或 `@shadanai/openclaw`（同样被植入相同恶意依赖）

### 🟡 需要检查：不确定
- 使用锁文件（`package-lock.json` / `yarn.lock`）但**不确定**锁文件是否在攻击窗口前已提交

### 🟢 相对安全
- 锁文件在攻击时间窗口**之前**已提交且未更新
- CI/CD 使用 `npm ci`（从锁文件精确安装，不升级版本）
- 明确固定版本号（`"axios": "1.14.0"` 而非 `"^1.14.0"`）

---

## 五、立即执行：3 步检查清单

### 第 1 步：检测项目是否受影响

```bash
# 检查是否安装了恶意版本
npm list axios 2>/dev/null | grep -E "1\.14\.1|0\.30\.4"

# 检查锁文件中是否存在恶意版本
grep -E '"axios"' package-lock.json | grep -E '1\.14\.1|0\.30\.4'

# 检查是否存在恶意依赖包
ls node_modules/plain-crypto-js 2>/dev/null && echo "⚠️ 存在恶意包！"

# 或者用 npm ls 检查依赖树
npm ls plain-crypto-js
```

### 第 2 步：检查系统是否已被入侵（IOC 检测）

```bash
# macOS - 检查恶意文件
ls -la /Library/Caches/com.apple.act.mond 2>/dev/null && echo "⚠️ 发现恶意文件！"

# Linux - 检查恶意脚本
ls -la /tmp/ld.py 2>/dev/null && echo "⚠️ 发现恶意脚本！"

# Windows PowerShell - 检查恶意文件
Test-Path "$env:PROGRAMDATA\wt.exe" -and (Write-Host "⚠️ 发现恶意文件！" -ForegroundColor Red)

# 检查是否有与 C2 服务器的网络连接
netstat -an | grep "142.11.206.73"
```

### 第 3 步：根据检测结果执行对应操作

**✅ 未受影响 → 立即加固**

```bash
# 降级并固定版本（1.x 用户）
npm install axios@1.14.0

# 降级并固定版本（0.x 用户）
npm install axios@0.30.3

# 修改 package.json，移除 ^ 符号，固定版本
# "axios": "1.14.0"  而非  "axios": "^1.14.0"

# 提交更新后的锁文件
git add package-lock.json package.json
git commit -m "security: pin axios to 1.14.0 (supply chain attack mitigation)"
```

**❌ 已受影响 → 应急响应（假定已失陷）**

> 受影响系统应视为**完全失陷**，清理文件**远远不够**，必须完整执行以下步骤：

```bash
# 1. 立即隔离受影响机器（断网或隔离网络）

# 2. 轮换所有凭证（优先级从高到低）
# - npm access tokens (登录 npmjs.com → Access Tokens → 吊销重建)
# - AWS / 云服务 Access Key（立即禁用，重新生成）
# - SSH 私钥（生成新密钥对，更新所有服务器授权）
# - 数据库密码、第三方 API Key
# - GitHub / GitLab Personal Access Token

# 3. 审查 CI/CD 构建日志
# 确认哪些流水线在 2026-03-31 00:21-03:29 UTC 之间运行了 npm install

# 4. 从干净的镜像/快照重建环境（不要尝试"清理"被感染的机器）

# 5. 审查网络日志，查找与 C2 服务器的通信记录
# C2 地址：sfrclak[.]com / 142.11.206.73:8000
```

---

## 六、后续防护：4 个工程实践

这次攻击再次证明，依赖供应链安全是每个团队都绕不过去的课题。

### 1. 在 CI/CD 中使用 `npm ci --ignore-scripts`

```yaml
# .github/workflows/build.yml
- name: Install dependencies
  run: npm ci --ignore-scripts
  # --ignore-scripts 可阻止 postinstall 等钩子执行
```

> ⚠️ 注意：部分合法依赖也依赖 `postinstall` 脚本（如 node-gyp），需要测试验证。

### 2. 锁定依赖版本，始终提交锁文件

```json
// package.json - 使用精确版本而非范围版本
{
  "dependencies": {
    "axios": "1.14.0"    // ✅ 精确固定
    // "axios": "^1.14.0"  ❌ 不推荐，允许自动升级
  }
}
```

```bash
# CI/CD 始终使用 npm ci 而非 npm install
# npm ci 严格按照 package-lock.json 安装，不会自动升级
```

### 3. 接入依赖安全扫描

```bash
# 方案一：GitHub Dependabot（免费）
# 在 GitHub 仓库 Settings → Security → Enable Dependabot alerts

# 方案二：Snyk（有免费额度）
npx snyk test

# 方案三：npm audit（内置）
npm audit
npm audit --audit-level=high  # 只报告 high/critical
```

### 4. 启用 npm 二因素认证（2FA）

维护 npm 包？立即开启 2FA：
1. 登录 npmjs.com → Profile → Account Settings
2. 开启 **Two-Factor Authentication**（推荐使用 TOTP，如 Google Authenticator）
3. 对发布操作单独要求 2FA 验证

---

## 七、时间线

| 时间（UTC） | 事件 |
|:---|:---|
| 2026-03-31 00:21 | 攻击者发布 `axios@1.14.1`（主线恶意版本）|
| 2026-03-31 约 01:xx | 攻击者发布 `axios@0.30.4`（旧版恶意版本）|
| 2026-03-31 03:29 | StepSecurity 发现并发出警报 |
| 2026-03-31 03:29+ | npm 官方下架恶意版本，社区紧急响应 |
| 2026-03-31 08:00+ | 各大安全媒体（Snyk、The Hacker News 等）发出警告 |

**攻击活跃窗口：约 3 小时 8 分钟**

在这短短 3 小时内，全球有无数 CI/CD 流水线和开发环境在自动运行，潜在受影响面极大。

---

## 八、写在最后

npm 生态的开放性是它最大的优势，但也是最大的攻击面。这次 axios 被投毒，不是第一次，也不会是最后一次。

**真正的问题不是"会不会发生"，而是"发生时你的项目有没有防线"。**

三件事，从今天开始做：
1. **锁定版本**：提交 `package-lock.json`，CI/CD 用 `npm ci`
2. **审查 postinstall**：不明来源的包，先 `--ignore-scripts` 再说
3. **接入安全扫描**：Snyk、GitHub Dependabot，至少选一个

现在去检查你的项目吧。

---

💡 **AppTalks** | 资讯·工具·教程·社区

🤖 关注我们，第一时间获取 APP 开发安全预警和技术干货

💬 加入社群，与全国开发者交流成长

❤️ 觉得有用？点个「在看」，帮更多开发者看到这条预警！
