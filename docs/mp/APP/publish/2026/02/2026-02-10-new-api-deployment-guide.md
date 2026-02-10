# 🚀 New API：下一代 LLM 网关与 AI 资产管理系统

> 在大模型百花齐放的今天，如何统一管理 OpenAI、Claude、Gemini 等各家 API？如何为团队或客户提供稳定、可计费的 AI 接口服务？**New API** 给出了完美的答案。

## 🌟 什么是 New API？

**New API** 是一个基于 One API 开发的开源 AI 模型集散与分发系统。它不仅继承了 One API 的强大功能，还进行了大量的 UI 优化和功能增强。

简单来说，New API 就是一个**通用的 AI 接口网关**。它可以：
*   🔄 **统一格式**：将 Claude、Gemini、讯飞星火、文心一言等各种非 OpenAI 格式的 API，统一转换为标准的 OpenAI 接口格式。
*   💰 **精细计费**：支持按次、按 Token 计费，内置在线充值系统（支持 EPay、Stripe 等）。
*   ⚖️ **智能分发**：支持多渠道轮询、权重分配、失败自动重试，确保服务的高可用性。
*   🛡️ **企业级管理**：提供完善的用户权限、Token 分组、额度限制等功能。

无论是个人开发者想聚合管理自己的 Key，还是企业想搭建内部的 AI 中台，New API 都是一个极佳的选择。

---

## ✨ 核心功能亮点

### 1. 🎨 现代化的 UI 设计
New API 采用了全新的界面设计，支持深色模式，操作体验更加流畅直观。数据看板可以清晰展示当前的请求量、消耗额度等关键指标。

### 2. 🌍 全球大模型支持
不仅支持 OpenAI 的 GPT 系列，还完美支持：
*   **Anthropic Claude** (支持 Messages API)
*   **Google Gemini** (支持 Pro/Flash/Thinking 等全系列)
*   **国产模型**：DeepSeek、通义千问、文心一言、讯飞星火、智谱 ChatGLM 等。
*   **绘图与音乐**：Midjourney-Proxy、Suno API 等。

### 3. 🧠 强大的推理与思考支持
针对最新的推理模型（Reasoning Models），New API 做了深度适配：
*   支持 OpenAI **o1/o3** 系列的推理工作量配置（High/Medium/Low）。
*   支持 **Claude 3.7 Thinking** 模式。
*   支持 **Gemini 2.5 Thinking** 模式及 Token 预算控制。

### 4. 💳 商业化运营能力
如果你想基于 API 做二传手或运营服务，New API 提供了完整的解决方案：
*   **在线充值**：对接易支付、Stripe 等支付渠道。
*   **兑换码系统**：可生成额度兑换码，方便分发。
*   **多种登录方式**：支持 GitHub、微信、Discord、Telegram、LinuxDO 等 OAuth 登录。

---

## 🛠️ 极速部署指南

最推荐使用 Docker Compose 进行一键部署，简单且易于维护。

### 1. 获取项目代码
首先，将项目克隆到你的服务器：

```bash
git clone https://github.com/QuantumNous/new-api.git
cd new-api
```

### 2. 配置 Docker Compose
编辑 `docker-compose.yml` 文件。默认配置使用 SQLite 数据库，适合中小型部署。

```yaml
version: '3.4'

services:
  new-api:
    image: calciumion/new-api:latest
    container_name: new-api
    restart: always
    command: --log-dir /data/logs
    ports:
      - "3000:3000"
    volumes:
      - ./data:/data
    environment:
      - TZ=Asia/Shanghai
      # 如果需要使用 MySQL，取消注释并修改下方配置
      # - SQL_DSN=root:123456@tcp(mysql:3306)/newapi
      # - NODE_TYPE=master
      # - CHANNEL_UPDATE_FREQUENCY=1440
      # - CHANNEL_TEST_FREQUENCY=1440
```

> **💡 小贴士**：
> *   数据会持久化保存在当前目录的 `data` 文件夹中。
> *   如果并发量较大，建议配置 Redis 和 MySQL 以获得更好的性能。

### 3. 启动服务
执行以下命令启动：

```bash
docker-compose up -d
```

启动完成后，访问 `http://你的IP:3000` 即可看到登录界面。
*   **默认账号**：`root`
*   **默认密码**：`123456`
*   **⚠️ 重要**：登录后请立即修改默认密码！

---

## 🔧 运营配置实战

部署只是第一步，如何用好 New API 才是关键。

### 1. 添加渠道 (Channels)
进入 **“渠道”** 页面，点击 **“添加新的渠道”**。
*   **类型**：选择你要接入的模型类型（如 OpenAI, Claude, DeepSeek）。
*   **模型**：选择该渠道支持的模型列表。New API 会自动重定向模型名称（例如将 `gpt-3.5-turbo` 映射到特定的渠道）。
*   **密钥**：填入上游服务商提供的 API Key。
*   **代理**：如果服务器在国内，可能需要配置代理地址。

### 2. 设置令牌 (Tokens)
进入 **“令牌”** 页面，为用户或应用生成访问令牌。
*   **额度**：可以限制该 Token 能消耗多少金额。
*   **过期时间**：设置 Token 的有效期。
*   可以勾选 **“无限额度”** 给管理员使用。

### 3. 配置倍率与定价
在 **“运营设置”** -> **“倍率设置”** 中，你可以精细控制成本和售价：
*   **模型倍率**：针对特定模型（如 GPT-4）设置倍率。例如上游成本是 GPT-3.5 的 20 倍，你可以设置为 20 或更高（赚取差价）。
*   **分组倍率**：可以为 VIP 用户设置更优惠的倍率，或为普通用户设置标准倍率。

### 4. 智能路由与高可用
为了保证服务不挂，建议为同一个模型配置多个渠道：
*   New API 会根据 **权重** 随机分发请求。
*   如果某个渠道报错（如 401, 429），系统会自动尝试下一个可用渠道，并在一段时间内禁用故障渠道。

---

## 🎯 结语

**New API** 以其强大的兼容性、稳定的性能和丰富的功能，成为了目前开源 LLM 网关中的佼佼者。无论你是想做一个简单的 API 转发，还是构建一个复杂的 AI 商业平台，它都能为你提供坚实的基础。

👉 **项目地址**：[https://github.com/QuantumNous/new-api](https://github.com/QuantumNous/new-api)

*本文仅供技术交流，请遵守相关法律法规，请勿将技术用于非法用途。*
