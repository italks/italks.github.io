---
title: 紧急预警！axios npm被投毒，3亿周下载量库遭供应链攻击
date: 2026-04-03
category: Security
tags: [Security, npm, axios, SupplyChain, Linux, Ubuntu]
cover: ../imgs/2026-04-03-axios-supply-chain-attack.svg
summary: npm生态遭遇重大供应链攻击：axios核心维护者账号被劫持，两个恶意版本植入远程访问木马。本文详解攻击时间线、排查方法、修复方案和安全建议。
---

# 紧急预警！axios npm被投毒，3亿周下载量库遭供应链攻击

**2026年3月31日，JavaScript生态遭遇重大供应链安全事件。**

安全公司 StepSecurity 监测发现，npm 上下载量最大的 HTTP 客户端库之一 **axios**，其核心维护者账号被攻击者劫持，发布了两个携带远程访问木马（RAT）的恶意版本。

这意味着：**任何在特定时间窗口内执行 `npm install axios` 的项目，都可能已被植入后门。**

---

## 事件概述

### 攻击目标

- **axios**：JavaScript 生态中最流行的 HTTP 客户端库
- **周下载量**：超过 3 亿次
- **npm 排名**：前十核心库之一
- **影响范围**：前端项目、Node.js 服务、CI/CD 流水线、Docker 构建等

### 恶意版本

| 版本 | 分支 | SHA |
|:---|:---|:---|
| `axios@1.14.1` | 现代 1.x | `2553649f232204966871cea80a5d0d6adc700ca` |
| `axios@0.30.4` | 遗留 0.x | `d6f3f62fd3b9f5432f5782b62d8cfd5247d5ee71` |

**攻击载体**：`plain-crypto-js@4.2.1`（隐藏恶意依赖）

---

## 攻击时间线（UTC）

| 时间 | 事件 |
|:---|:---|
| 03-30 05:57 | 攻击者发布诱饵包 `plain-crypto-js@4.2.0`（建立发布历史） |
| 03-30 23:59 | 发布恶意包 `plain-crypto-js@4.2.1`（植入恶意脚本） |
| 03-31 00:21 | 发布 `axios@1.14.1`（依赖恶意包） |
| 03-31 01:00 | 发布 `axios@0.30.4`（覆盖遗留用户） |

**关键点**：恶意版本在 GitHub 仓库中没有对应提交记录——这是"幽灵发布"的典型特征。

---

## 攻击技术分析

### 账号劫持

攻击者获取了 axios 主要维护者 `jasonsaayman` 的长期有效的 classic npm token，绕过了基于 OIDC 的 GitHub Actions 自动发布流程。

### 恶意载荷

恶意依赖 `plain-crypto-js@4.2.1` 在 `postinstall` 钩子中执行恶意脚本：

```bash
# 安装时自动执行
node setup.js
```

脚本会根据操作系统下载特定的第二阶段 Payload：

| 操作系统 | 后门文件路径 |
|:---|:---|
| Windows | `%PROGRAMDATA%\wt.exe` |
| macOS | `/Library/Caches/com.apple.act.mond` |
| Linux | `/tmp/ld.py` |

### 木马能力

- **跨平台支持**：Windows、macOS、Linux
- **远程控制**：攻击者可获得设备完全控制权
- **凭证窃取**：窃取环境变量和本地凭据
- **反取证**：执行后自动删除恶意脚本并替换 `package.json`

### C2 服务器

- `142.11.206.73:8000`
- `sfrclak.com`
- `http://sfrclak.com:8000/6202033`

---

## 紧急排查指南

### 一、检查 axios 版本

```bash
# 检查当前项目
npm list axios 2>/dev/null | grep -E "1\.14\.1|0\.30\.4"

# 检查 package-lock.json
grep -A1 '"axios"' package-lock.json | grep -E "1\.14\.1|0\.30\.4"
```

**有输出 = 可能受影响**

### 二、检查恶意依赖目录

```bash
# 检查 node_modules 中是否存在恶意依赖
ls node_modules/plain-crypto-js 2>/dev/null && echo "⚠️ 风险：恶意依赖存在"
```

### 三、检查系统后门文件

**macOS**：
```bash
ls -la /Library/Caches/com.apple.act.mond 2>/dev/null && echo "⚠️ 已感染"
```

**Linux**：
```bash
ls -la /tmp/ld.py 2>/dev/null && echo "⚠️ 已感染"
```

**Windows（CMD）**：
```cmd
dir "%PROGRAMDATA%\wt.exe" 2>nul && echo COMPROMISED
```

### 四、审查 CI/CD 日志

检查构建日志，确认在攻击时间窗口内（3月31日00:21-01:00 UTC）是否执行了 `npm install axios`。

---

## 紧急修复方案

### 步骤一：降级到安全版本

```bash
# 1.x 分支
npm install axios@1.14.0

# 0.x 分支
npm install axios@0.30.3
```

**在 `package.json` 中强制锁定**：

```json
{
  "dependencies": {
    "axios": "1.14.0"
  },
  "overrides": {
    "axios": "1.14.0"
  },
  "resolutions": {
    "axios": "1.14.0"
  }
}
```

### 步骤二：清理恶意依赖

```bash
# 删除恶意依赖
rm -rf node_modules/plain-crypto-js

# 忽略脚本重新安装
npm install --ignore-scripts

# 或完全清理后重装
rm -rf node_modules package-lock.json
npm ci --ignore-scripts
```

### 步骤三：凭证轮换（最关键！）

木马会窃取环境变量和本地凭据，**必须立即轮换**：

- AWS/Azure/GCP 云服务密钥
- SSH 私钥
- CI/CD 系统中的所有 Secret
- `.env` 文件中的环境变量
- API Tokens、数据库密码等

### 步骤四：环境重构（严重情况）

如果发现系统中有后门文件残留，**强烈建议重新部署整个环境**：

1. 从干净的镜像重新部署
2. 从干净的备份恢复代码
3. 使用安全版本重新构建

---

## 安全防护建议

### 对开发者

1. **锁定依赖版本**
   ```json
   {
     "dependencies": {
       "axios": "1.14.0"  // 使用精确版本号，避免 ^ 或 ~
     }
   }
   ```

2. **使用 Lock 文件**
   ```bash
   # 提交 package-lock.json
   # CI/CD 中使用 npm ci 而非 npm install
   npm ci --ignore-scripts
   ```

3. **定期审计依赖**
   ```bash
   npm audit
   ```

### 对企业

1. **CI/CD 中禁用安装脚本**
   ```bash
   npm ci --ignore-scripts
   ```

2. **网络出口过滤**
   ```bash
   # 阻断已知 C2 服务器
   iptables -A OUTPUT -d 142.11.206.73 -j DROP
   echo "0.0.0.0 sfrclak.com" | sudo tee -a /etc/hosts
   ```

3. **使用供应链安全工具**
   - Socket
   - Snyk
   - StepSecurity Harden-Runner

### 对开源维护者

1. **启用 npm 双因素认证（2FA）**
2. **使用 OIDC Trusted Publisher 替代 classic token**
3. **监控账号异常活动**

---

## 安全版本对照表

| 分支 | 安全版本 | 恶意版本 | 状态 |
|:---|:---|:---|:---|
| 1.x | ≤1.14.0 | 1.14.1 | ✅ 安全 |
| 1.x | ≥1.14.2 | - | ✅ 安全（待官方发布） |
| 0.x | ≤0.30.3 | 0.30.4 | ✅ 安全 |

---

## 总结

这次 axios 供应链攻击事件再次敲响了开源生态安全的警钟：

1. **核心库不等于绝对安全**：即使是下载量超过 3 亿的顶级库，也可能成为攻击目标
2. **维护者账号是关键弱点**：一个 classic token 泄露，就能影响整个生态
3. **锁定版本是第一道防线**：使用精确版本号 + lock 文件 + `npm ci`
4. **禁用脚本是最有效防护**：CI/CD 中使用 `--ignore-scripts` 可阻止大多数供应链攻击

**立即行动**：检查你的项目是否使用了 `axios@1.14.1` 或 `axios@0.30.4`，如有，立即执行排查和修复流程。

---

💡 **UbuntuNews** | 资讯·工具·教程·社区

🐧 关注我们，获取更多Ubuntu/Linux技术干货

💬 加入QQ群/频道，与全国爱好者交流成长

❤️ 觉得有用？点个"在看"分享给更多人！
