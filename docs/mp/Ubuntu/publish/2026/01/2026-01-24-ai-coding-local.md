# 彻底解放生产力：在 Ubuntu 上用 CC Switch + Ollama 打造全能 AI 编程工作流

> **摘要：** 告别 API 账单！教你在 Ubuntu 上用 DeepSeek "伪装" Claude，打造零延迟、全隐私的本地 AI 编程工作流，代码安全自己掌控。

> 🚀 **难度等级：** 进阶
> ⏱️ **预计耗时：** 20 分钟
> 💻 **适用版本：** Ubuntu 22.04 LTS / 24.04 LTS / 26.04 (Preview)

各位 UbuntuNews 的极客朋友们，大家好！

在 AI 编程工具层出不穷的今天，我们往往面临一个幸福的烦恼：工具太多，钱包太瘪。Claude Code 强在架构设计，Codex 胜在代码补全，Gemini 拥有超长上下文。但它们通常都依赖云端 API，不仅通过网络延迟高，而且数据隐私始终是个隐患。

有没有一种方法，既能使用这些优秀的 CLI 客户端体验，又能后端对接我们本地强大的开源模型（如 DeepSeek-V3, Qwen 2.5）？

答案是肯定的。今天，我们就来教大家如何在 Ubuntu 上通过 **Ollama** + **CC Switch**，构建一套完全私有、免费且强大的 AI 编程环境。

---

## 🏗️ 第一步：基石 —— Ubuntu 安装 Ollama 及模型准备

Ollama 是我们本地的 AI 引擎。

### 1. 安装 Ollama
如果你还没安装，请在终端执行官方一键脚本：

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### 2. 配置外部访问（关键步骤）
为了让后续的 CC Switch 能够通过网络协议转发请求，我们需要确保 Ollama 监听所有接口，或者至少明确指定端口。

编辑 systemd 服务文件：

```bash
sudo systemctl edit ollama.service
```

在打开的编辑器中添加环境变量配置：

```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_ORIGINS=*"
```

保存并重启服务：

```bash
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

### 3. 下载并运行模型
Ollama 支持 GGUF 格式的模型。对于编程任务，我们强烈推荐 **DeepSeek-Coder-V2** 或 **Qwen2.5-Coder**。

```bash
# 下载并运行 Qwen2.5 Coder 32B (推荐显存 24G+)
ollama run qwen2.5-coder:32b

# 或者 DeepSeek R1 (强推理)
ollama run deepseek-r1:14b
```

---

## 🛠️ 第二步：利器 —— 安装 AI CLI 客户端

我们需要安装这些大厂的“壳”，稍后我们将把它们的“魂”（后端）换成本地的 Ollama。

确保你已经安装了 Node.js (v18+) 和 npm。

### 1. 安装 Claude Code (CLI)
Anthropic 官方推出的强大终端编码助手。

```bash
npm install -g @anthropic-ai/claude-code
```

### 2. 安装 Codex CLI (Code X)
OpenAI 的编程助手 CLI（注意：这里指社区兼容版或官方 Codex CLI）。

```bash
npm install -g @openai/codex
```

### 3. 安装 Gemini CLI
Google 的 AI 助手命令行版。

```bash
npm install -g gemini-chat-cli
```

*注：此时直接运行这些命令会要求你登录或输入 API Key，先别急，我们马上通过 CC Switch 来“接管”它们。*

---

## 🎛️ 第三步：枢纽 —— 安装与配置 CC Switch

**CC Switch** (Claude Code Switch) 是一个强大的开源工具，它不仅可以管理多个 API 配置，更重要的是它内置了一个**终端代理路由器**，可以将 Claude Code、Codex 等工具的流量拦截并转发到兼容 OpenAI 格式的后端（如 Ollama）。

### 1. 安装 CC Switch
从 GitHub Releases 下载最新的 Linux 二进制文件，或者使用 npm 安装（推荐）：

```bash
npm install -g @songhe/cc-switch
# 或者如果你使用 desktop 版本工具
# wget https://github.com/farion1231/cc-switch/releases/download/v3.10.0/CC-Switch-v3.10.0-linux-amd64.tar.gz
```

这里我们以 CLI 版本为例。

### 2. 添加 Ollama 服务
我们需要告诉 CC Switch，本地有一个 Ollama 服务在运行。

```bash
# 添加一个新的配置，命名为 local-ollama
ccs new local-ollama
```

在交互式配置中：
*   **Provider Type:** 选择 `OpenAI Compatible` (Ollama 兼容 OpenAI 接口)
*   **Base URL:** 输入 `http://localhost:11434/v1`
*   **API Key:** 输入 `ollama` (Ollama 通常不需要 key，但这里随便填一个占位)
*   **Model:** 输入你刚才下载的模型名，例如 `qwen2.5-coder:32b`

### 3. 启动终端代理与转发
现在，我们要激活这个环境。CC Switch 会自动设置环境变量（如 `https_proxy`, `HTTP_PROXY`, `CLAUDE_BASE_URL` 等），欺骗客户端连接到本地。

```bash
# 切换到 local-ollama 配置
ccs switch local-ollama

# 启动代理模式 (对于部分客户端需要显式代理)
ccs proxy start
```

此时，CC Switch 会在后台启动一个转发服务。

---

## 🚀 最终测试：见证奇迹

现在，让我们再次运行 **Claude Code**，但这次它将由本地的 Ollama 驱动！

```bash
claude
```

你会发现，不再需要登录 Anthropic 账号（或者流量走了本地），你输入的 prompt：
`>>> 帮我用 Python 写一个贪吃蛇游戏`

后台的 Ollama 终端开始疯狂刷屏推理，几秒钟后，Claude CLI 就在你的终端里优雅地输出了代码。

### 进阶技巧
*   **混合双打：** 你可以配置多个 profile，通过 `ccs switch` 快速在 "Local-DeepSeek" 和 "Cloud-Claude-3.5" 之间切换。处理敏感数据切本地，处理超难逻辑切云端。
*   **模型热切换：** 在 CC Switch 中修改配置，即可瞬间让 Claude CLI 变成 "DeepSeek CLI" 或 "Llama CLI"。

---

**总结：**
通过 **Ubuntu + Ollama + CC Switch** 的组合，我们成功把“大厂的优良交互”与“开源的自由灵魂”结合在了一起。这不仅省下了昂贵的 API 订阅费，更重要的是，你完全掌握了自己的代码隐私。

Happy Coding with Local AI! 🐧✨

---

### 💬 加入 Ubuntu AI 极客群

独行快，众行远。

如果你在配置 **CC Switch** 时遇到报错，或者想分享你的 **DeepSeek** 调教心得，欢迎加入我们的 **Ubuntu x AI 技术交流群**。

👉 **入群方式：**
关注公众号，后台回复关键词 **「AI」**，即可获取入群二维码。

在这里，我们不聊虚的，只谈技术落地。
