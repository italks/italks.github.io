# WSL + Ubuntu 部署 Hermes Agent：一行命令，拥有一个"越用越聪明"的AI助手

> **摘要**：Hermes Agent 是由 Nous Research 开源的自进化 AI 智能体，支持跨会话持久记忆、自动提炼技能、接入 200+ 大模型。本文手把手教你如何在 WSL2 的 Ubuntu 环境中一键部署，从安装到配置到实战，20 分钟搞定你的专属 AI 助手。

**阅读时长**：约 12 分钟 | **难度等级**：⭐⭐ 入门级 | **适用环境**：Windows 10/11 + WSL2

---

## 为什么选择 Hermes Agent？

2026 年 AI Agent 赛道卷出了天际，但大多数产品要么收费昂贵，要么功能单一。**Hermes Agent** 的出现，给 Linux 用户带来了一个真正「免费+强大+开源」的选择。

它和普通聊天机器人的核心区别在于：**它会自己变聪明**。

### 核心特性一览

| 特性 | 说明 | 对比普通 ChatBot |
|:---|:---|:---|
| 🧠 自进化记忆 | 跨会话记住你的偏好和习惯 | ❌ 每次从头开始 |
| 🔧 自动技能提炼 | 常用操作自动沉淀为可复用技能 | ❌ 需要手动配置 |
| 🤖 多模型支持 | OpenRouter 接入 200+ 模型，支持国产大模型 | ⚠️ 通常只绑一家 |
| 💬 多平台集成 | Telegram / 飞书 / 企业微信 / Discord | ❌ 仅网页端 |
| 📦 完全开源 | MIT 协议，可自由修改和部署 | ❌ 闭源黑盒 |
| 🐧 Linux 原生 | 官方推荐 Ubuntu 部署 | ⚠️ Windows 适配差 |

> 💡 **一句话理解**：如果把 ChatGPT 比作一个健忘的客服，那 Hermes Agent 就是一个有笔记本的私人助理——它记得你说过的事，而且越合作越默契。

---

## 环境准备：WSL2 + Ubuntu

### 什么是 WSL？

**WSL（Windows Subsystem for Linux）** 是微软官方提供的 Windows 子系统 for Linux，让你在 Windows 上原生运行 Linux 环境。对于同时使用 Windows 和 Linux 的开发者来说，这是最佳方案。

**为什么选 WSL 而不是虚拟机？**

| 对比项 | WSL2 | VMware/VirtualBox |
|:---|:---|:---|
| 启动速度 | 秒开 | 1-3 分钟 |
| 内存占用 | 动态分配 | 固定占用 |
| 文件互通 | 直接访问 Windows 文件系统 | 需共享文件夹 |
| 性能损耗 | 接近原生 | 有一定开销 |
| 系统集成 | 与 Windows 终端无缝融合 | 独立窗口 |

### 安装 WSL2（以管理员身份运行 PowerShell）

```powershell
# 一键安装 WSL2，默认安装 Ubuntu
wsl --install
```

> ⚠️ **注意**：安装完成后**必须重启电脑**。重启后 Ubuntu 会自动弹出终端窗口，让你设置用户名和密码。

### 验证 WSL 环境

```bash
# 进入 WSL 终端后，检查版本（需要 WSL2）
wsl --version

# 查看 Ubuntu 版本（推荐 22.04 或更高）
lsb_release -a

# 确认网络连通性（后续下载依赖需要）
ping -c 3 github.com
```

预期输出类似：

```
WSL 版本：2.x.xxx.xx
Ubuntu 版本：22.04 LTS 或 24.04 LTS
```

> 💡 **小技巧**：如果你已经装了 WSL 但不确定是版本 1 还是版本 2，执行 `wsl -l -v` 查看所有发行版及其 WSL 版本。如果是 v1，可以用 `wsl --set-version Ubuntu 2` 升级。

---

## 一键部署 Hermes Agent

环境确认无误后，接下来就是见证奇迹的时刻——**真的只需要一行命令**。

### 第一步：安装前置依赖 Git

```bash
sudo apt update && sudo apt install -y git
```

这是唯一需要手动安装的工具，其余全部交给自动化脚本。

### 第二步：执行一键安装脚本

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

这个脚本会自动完成以下工作：

| 自动安装项 | 版本要求 | 用途说明 |
|:---|:---|:---|
| uv（Python 包管理器） | 最新版 | 高效管理 Python 依赖 |
| Python | 3.11 | 运行时核心环境 |
| Node.js | v22 | 前端工具链 |
| ripgrep (rg) | 最新版 | 高速文件搜索引擎 |
| ffmpeg | 最新版 | 音视频处理能力 |

> 🔒 **安全提示**：`curl | bash` 方式会直接执行远程脚本。如果你对安全有顾虑，可以先用 `git clone` 克隆仓库，审查 `scripts/install.sh` 内容后再手动执行。

### 第三步：刷新环境变量

```bash
source ~/.bashrc   # 如果你用的是 bash
source ~/.zshrc    # 如果你用的是 zsh
```

### 第四步：验证安装

```bash
# 环境健康检查
hermes doctor
```

如果一切正常，你会看到类似这样的输出：

```
✅ Python 3.11.x — 正常
✅ Node.js v22.x — 正常
✅ ripgrep — 正常
✅ ffmpeg — 正常
✅ 配置文件 — 已创建
⚠️ API Key — 未配置（需要下一步设置）
```

---

## 配置 API 密钥：让 Hermes "活"起来

Hermes Agent 本身只是一个框架，需要接入大模型的 API 才能展现智能。好消息是，它支持的模型平台非常多。

### 初始化向导（推荐新手）

```bash
hermes setup
```

这是一个交互式引导，会一步步问你：

1. **选择 LLM 提供商**（OpenAI / Anthropic / Google / OpenRouter / 自定义）
2. **输入 API Key**
3. **选择默认工具集**
4. **确认配置保存位置**

按提示操作即可，全程不超过 5 分钟。

### 手动配置（进阶用户）

如果向导方式不符合你的需求，可以直接编辑配置文件：

```bash
# 创建/编辑环境变量文件
nano ~/.hermes/.env
```

填入你的 API Key（至少填一个）：

```bash
# ========== 主流大模型平台 ==========
# OpenAI（GPT-4o 等）
OPENAI_API_KEY=sk-your-openai-key-here

# Anthropic（Claude 系列）
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here

# Google（Gemini 系列）
GOOGLE_API_KEY=your-google-api-key-here

# ========== 聚合平台 ==========
# OpenRouter（推荐！一个 Key 用 200+ 模型）
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key-here

# Nous Portal（官方推荐）
NOUS_API_KEY=your-nous-key-here

# ========== 国产大模型 ==========
# DeepSeek（通过自定义端点）
# 在 config.yaml 中配置 base_url 为 https://api.deepseek.com/v1
```

> 💡 **省钱建议**：对于个人用户，强烈推荐 **OpenRouter** 平台。注册后可以获得免费额度，而且一个 API Key 就能切换 200+ 模型（包括 DeepSeek、Llama、Mistral 等），性价比极高。

---

## 启动与初次对话

### 启动 Hermes

```bash
hermes
```

首次启动时，Hermes 会：
1. 加载配置文件
2. 连接你设置的 LLM 服务商
3. 初始化记忆数据库
4. 显示欢迎信息，进入交互模式

你将看到类似这样的界面：

```
╔═══════════════════════════════════════╗
║     🐎 Hermes Agent v2.x.x           ║
║     Self-improving AI Assistant      ║
╚═══════════════════════════════════════╝

模型：gpt-4o (via OpenRouter)
记忆状态：已就绪
技能数量：0（使用中将自动积累）

> 你好！我是 Hermes，你的自进化 AI 助手。
> 我会记住我们的对话，并在使用中不断学习和进步。
> 有什么我可以帮你的吗？
```

### 来试几个实用场景

#### 场景一：代码助手

```
你：帮我写一个 Python 脚本，监控 Ubuntu 系统 CPU 使用率，超过 80% 时发送告警

Hermes：（生成完整代码 + 解释 + 使用方法）
```

#### 场景二：Linux 运维

```
你：我的 WSL Ubuntu 磁盘空间不够了，帮我分析哪些目录占用最大

Hermes：（调用系统命令分析磁盘占用，给出清理建议）
```

#### 场景三：学习助手

```
你：用通俗易懂的方式解释 Linux 权限管理中的 setuid 和 sticky bit

Hermes：（结合生活类比 + 图文解释 + 示例演示）
```

---

## 进阶玩法：释放 Hermes 的全部实力

### 1. 安装扩展功能包

Hermes 支持模块化扩展，按需安装：

```bash
# 语音交互（语音输入 + Whisper 识别）
pip install "hermes-agent[voice]"

# 消息平台接入（Telegram / Discord / Slack / WhatsApp）
pip install "hermes-agent[messaging]"

# 浏览器自动化（Playwright）
pip install "hermes-agent[browser]"

# 图片生成（Stable Diffusion / DALL-E）
pip install "hermes-agent[image]"

# 向量数据库增强记忆（ChromaDB / Qdrant）
pip install "hermes-agent[vector]"

# 全部功能一步到位
pip install "hermes-agent[all]"
```

**各扩展包能力对比**：

| 扩展包 | 功能 | 适用场景 |
|:---|:---|:---|
| voice | 语音识别 + TTS | 解放双手，开车时也能用 |
| messaging | 多平台消息接入 | 团队协作、客服机器人 |
| browser | 浏览器自动化 | 网页抓取、自动化测试 |
| image | AI 图片生成 | 内容创作、设计辅助 |
| vector | 向量存储增强记忆 | 长期使用、大量知识积累 |

### 2. 接入国产大模型 DeepSeek

对于关注数据主权或成本的用户，接入 DeepSeek 是绝佳选择：

```bash
# 编辑配置文件
nano ~/.hermes/config.yaml
```

添加以下内容：

```yaml
model:
  provider: "openai-compatible"
  model_id: "deepseek-chat"
  api_base: "https://api.deepseek.com/v1"
  api_key: "${DEEPSEEK_API_KEY}"
```

然后在 `.env` 文件中添加：

```bash
DEEPSEEK_API_KEY=sk-your-deepseek-key-here
```

重启 Hermes 即可生效：

```bash
# 退出当前会话（Ctrl+C 或输入 exit）
hermes
```

### 3. 接入飞书/企业微信（办公神器）

想让同事也能用上你的 Hermes？接入企业通讯工具就行：

```bash
# 安装消息扩展
pip install "hermes-agent[messaging]"
```

以飞书为例：

1. 访问 [飞书开放平台](https://open.feishu.cn/)，创建机器人应用
2. 获取 App ID 和 App Secret
3. 配置事件订阅回调地址
4. 在 Hermes 配置中启用 Feishu 适配器

完成后，同事在飞书中 @你的机器人就能直接和 Hermes 对话了！

### 4. Docker 部署（服务器场景）

如果你想在一台云服务器上长期运行 Hermes，Docker 是更好的选择：

```bash
# 拉取官方镜像
docker pull nousresearch/hermes-agent:latest

# 启动容器
docker run -it \
  --name hermes \
  -v ~/.hermes:/root/.hermes \
  -e OPENROUTER_API_KEY=your_key_here \
  nousresearch/hermes-agent:latest
```

> 💡 **腾讯云/阿里云用户提示**：国内服务器访问 GitHub 可能有速度问题，建议配置代理或使用镜像加速。

---

## 常见问题排查（FAQ）

### Q1：提示 `hermes: command not found`？

**原因**：环境变量未生效或 PATH 未正确设置。

**解决方案**：
```bash
# 重新加载环境变量
source ~/.bashrc

# 如果还不行，检查 hermes 是否正确安装
which hermes
ls -la $(which hermes)
```

### Q2：Python 版本报错？

**原因**：Hermes 要求 Python 3.11，系统可能安装了其他版本。

**解决方案**：
```bash
# 用 uv 强制安装正确的 Python 版本
uv python install 3.11
uv venv .venv --python 3.11
source .venv/bin/activate
```

### Q3：连接超时或 API 调用失败？

**原因**：国内网络访问 OpenAI / Anthropic 等服务可能不稳定。

**解决方案**：
1. 配置 HTTP 代理：在 `.env` 中添加 `HTTPS_PROXY=http://your-proxy:port`
2. 使用国内可用的大模型（如 DeepSeek）
3. 通过 OpenRouter 中转（通常更稳定）

### Q4：如何更新到最新版本？

```bash
# 更新 Hermes Agent
hermes update

# 或者重新执行安装脚本
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
```

### Q5：WSL 中无法使用麦克风/摄像头？

**原因**：WSL2 对硬件设备的支持有限制。

**解决方案**：
- **WSLg 支持**：Windows 11 的 WSLg 已经支持部分设备转发
- **替代方案**：使用 Windows 端录制音频，然后传到 WSL 中处理
- **最简方案**：暂时不使用 voice 相关功能，纯文字交互完全够用

### Q6：记忆和技能数据存在哪里？

**答案**：所有数据都在 `~/.hermes/` 目录下：

```
~/.hermes/
├── skills/        # 自动积累的技能文件
├── memory/        # 持久记忆数据库
├── personas/      # 人格/角色配置
├── logs/          # 运行日志
├── .env           # API 密钥（注意保护！）
└── config.yaml    # 主配置文件
```

> ⚠️ **备份建议**：定期备份整个 `~/.hermes/` 目录，这是你的 Hermes "大脑"，丢了就意味着重新开始。

---

## 总结：从零到上手，你只需要这 6 步

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│  ① 安装 WSL2 + Ubuntu       wsl --install          │
│         ↓                                           │
│  ② 安装 Git                sudo apt install git    │
│         ↓                                           │
│  ③ 一键安装 Hermes Agent   curl ... | bash          │
│         ↓                                           │
│  ④ 刷新环境变量             source ~/.bashrc         │
│         ↓                                           │
│  ⑤ 配置 API Key            hermes setup            │
│         ↓                                           │
│  ⑥ 启动使用！              hermes                   │
│                                                     │
│         总耗时 ≈ 15-20 分钟                          │
└─────────────────────────────────────────────────────┘
```

Hermes Agent 的最大魅力在于它的**成长性**。第一次使用时它可能只是个普通的 AI 助手，但随着你不断使用，它会记住你的偏好、积累常用操作的技能、越来越懂你的需求。这才是真正的"AI Agent"，而不是套壳的聊天机器人。

对于 Ubuntu/Linux 用户来说，WSL + Hermes 的组合是一个低门槛、高回报的选择——不需要额外的硬件投入，不需要复杂的环境配置，一台能跑 Windows 的电脑就够了。

---

**🎯 今日互动话题**：

你在用 AI 工具时最在意什么？是**隐私安全**、**响应速度**、还是**免费额度**？欢迎在评论区分享你的看法！

如果这篇文章对你有帮助，别忘了点个**"在看"**分享给更多 Ubuntu 爱好者~

---

💡 **UbuntuNews** | 资讯·工具·教程·社区

🐧 关注我们，获取更多 Ubuntu/Linux 技术干货

💬 加入 QQ群/频道，与全国爱好者交流成长

❤️ 觉得有用？点个"在看"分享给更多人！
