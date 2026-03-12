# OpenClaw 界面全解读,每个按钮都有用

> **核心问题**:界面上的东西都是干嘛的?
> 全面解读OpenClaw界面布局、配置文件详解、权限管理机制和日志排查方法，帮助用户深入了解工具配置与问题诊断，适合需要精细控制OpenClaw的用户。

**系列教程第 7 篇** | **阅读时长:8-10 分钟**

---

## 从陌生到熟悉

打开 OpenClaw,你可能会看到这样的界面:

```
┌─────────────────────────────────────────────────────┐
│  OpenClaw                              [设置] [帮助] │
├──────────────┬──────────────────────────────────────┤
│              │                                      │
│   技能列表    │         主工作区                      │
│              │                                      │
│   ├ pdf      │   [输入框:描述你的任务...]            │
│   ├ xlsx     │                                      │
│   ├ pptx     │   ─────────────────────────────      │
│   └ browser  │                                      │
│              │         执行结果                      │
│              │                                      │
├──────────────┴──────────────────────────────────────┤
│  日志输出                                            │
│  [2026-03-11 14:30] 任务开始: pdf extract            │
│  [2026-03-11 14:30] 读取文件: report.pdf             │
│  [2026-03-11 14:30] ✓ 任务完成                       │
└─────────────────────────────────────────────────────┘
```

这一篇,我们逐一解读每个区域和按钮的作用。

---

## 一、主界面布局:任务区、技能区、日志区

OpenClaw 界面分为三个主要区域:

### 1. 左侧:技能区

**功能**:展示已安装的技能列表

**包含内容**:
- 技能名称
- 技能状态(启用/禁用)
- 快速操作按钮

**常用操作**:
- 点击技能:查看技能详情
- 右键技能:启用/禁用/卸载
- 搜索框:快速查找技能

---

### 2. 中间:任务区(主工作区)

**功能**:任务输入和结果展示

**包含内容**:
- 输入框:描述你的任务
- 执行结果:显示任务输出
- 操作按钮:运行、停止、导出

**工作流程**:

```
输入任务 → 智能体理解 → 调用技能 → 执行操作 → 展示结果
```

---

### 3. 底部:日志区

**功能**:记录任务执行过程

**日志级别**:
- `INFO`:常规信息(任务开始、完成)
- `WARNING`:警告(非致命问题)
- `ERROR`:错误(任务失败)
- `DEBUG`:调试信息(详细执行过程)

**用途**:
- 任务失败时排查问题
- 了解执行细节
- 性能分析

---

## 二、配置文件详解:config.json 各字段含义

OpenClaw 的核心配置文件位于 `~/.openclaw/config.json`。

### 完整配置示例

```json
{
  "version": "1.0",
  "model": {
    "provider": "openai",
    "model": "gpt-4",
    "api_key": "sk-xxx",
    "base_url": "https://api.openai.com/v1",
    "temperature": 0.7,
    "max_tokens": 2000
  },
  "skills": [
    {
      "name": "pdf",
      "version": "latest",
      "enabled": true
    },
    {
      "name": "xlsx",
      "version": "1.1.5",
      "enabled": true
    }
  ],
  "permissions": {
    "file_access": ["~/Documents", "~/Downloads"],
    "network_access": true,
    "execute_commands": false
  },
  "storage": {
    "data_dir": "~/.openclaw/data",
    "cache_dir": "~/.openclaw/cache",
    "log_dir": "~/.openclaw/logs"
  },
  "ui": {
    "theme": "light",
    "language": "zh-CN",
    "show_notifications": true
  }
}
```

---

### 字段详解

#### 1. model 配置

| 字段 | 说明 | 示例 |
|------|------|------|
| provider | 模型提供商 | openai, anthropic, ollama |
| model | 模型名称 | gpt-4, claude-3, llama3 |
| api_key | API 密钥 | sk-xxx |
| base_url | API 地址 | 可自定义,用于代理或本地模型 |
| temperature | 创造性程度(0-1) | 0.7(默认),越高越随机 |
| max_tokens | 最大输出长度 | 2000 |

---

#### 2. skills 配置

| 字段 | 说明 | 示例 |
|------|------|------|
| name | 技能名称 | pdf, xlsx |
| version | 版本 | latest, 1.1.5 |
| enabled | 是否启用 | true/false |

---

#### 3. permissions 配置

| 字段 | 说明 | 默认值 |
|------|------|--------|
| file_access | 允许访问的目录 | ["~/Documents"] |
| network_access | 是否允许联网 | true |
| execute_commands | 是否允许执行系统命令 | false(安全考虑) |

> ⚠️ **安全提示**:谨慎开放 `execute_commands` 权限,可能导致安全风险

---

#### 4. storage 配置

| 字段 | 说明 |
|------|------|
| data_dir | 数据存储目录 |
| cache_dir | 缓存目录 |
| log_dir | 日志目录 |

---

#### 5. ui 配置

| 字段 | 说明 | 可选值 |
|------|------|--------|
| theme | 界面主题 | light, dark |
| language | 界面语言 | zh-CN, en-US |
| show_notifications | 是否显示通知 | true/false |

---

## 三、权限管理:给技能正确的"通行证"

### 为什么需要权限管理?

技能在执行任务时,可能需要:
- 访问文件系统
- 连接网络
- 执行系统命令

如果无限制,可能带来安全风险。权限管理就是给技能"最小必要权限"。

---

### 权限类型

| 权限类型 | 说明 | 风险等级 |
|---------|------|---------|
| 文件读取 | 读取指定目录文件 | 低 |
| 文件写入 | 创建/修改文件 | 中 |
| 网络访问 | 连接互联网 | 中 |
| 命令执行 | 执行 shell 命令 | 高 |

---

### 如何配置权限

**方式一:全局配置**

在 `config.json` 中设置:

```json
{
  "permissions": {
    "file_access": ["~/Documents", "~/Downloads"],
    "network_access": true,
    "execute_commands": false
  }
}
```

**方式二:技能级配置**

某些技能可能需要特殊权限,安装时会提示:

```bash
openclaw skill install browser
```

输出:

```
⚠ 技能 browser 需要以下权限:
  - 网络访问:访问网页
  - 文件写入:保存截图、下载文件

是否同意? (y/n)
```

输入 `y` 后,权限会被记录到技能配置中。

---

### 查看技能权限

```bash
openclaw skill permissions browser
```

输出:

```
技能: browser
─────────────────────────────
权限列表:
  ✓ 文件读取:~/Downloads
  ✓ 文件写入:~/Downloads
  ✓ 网络访问:所有网站
  ✗ 命令执行:未授权
```

---

## 四、日志查看:任务失败了怎么排查

当任务执行失败时,日志是最好的排查工具。

### 查看实时日志

在界面底部日志区,或命令行:

```bash
openclaw logs follow
```

实时输出任务执行过程。

---

### 查看历史日志

```bash
# 查看最近 100 行
openclaw logs show --lines 100

# 查看特定时间段
openclaw logs show --since "2026-03-11 14:00" --until "2026-03-11 15:00"

# 只看错误日志
openclaw logs show --level ERROR
```

---

### 日志文件位置

日志保存在 `~/.openclaw/logs/` 目录:

```
~/.openclaw/logs/
├── openclaw.log      # 主日志
├── tasks.log         # 任务日志
├── skills.log        # 技能日志
└── errors.log        # 错误日志
```

---

### 典型排查流程

**场景:任务执行失败**

1. 查看错误信息:

```bash
openclaw logs show --level ERROR --lines 10
```

输出:

```
[ERROR] 2026-03-11 14:35:12 - pdf.extract
文件不存在: ~/Documents/reprot.pdf
(你是否想访问 report.pdf?)
```

2. 根据提示修正:

原来是文件名拼写错误:`reprot.pdf` → `report.pdf`

3. 重新执行任务。

---

## 五、常用快捷操作

### 界面快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl/Cmd + N` | 新建任务 |
| `Ctrl/Cmd + Enter` | 执行任务 |
| `Ctrl/Cmd + S` | 保存配置 |
| `Ctrl/Cmd + L` | 清空日志 |
| `Ctrl/Cmd + ,` | 打开设置 |
| `Ctrl/Cmd + Q` | 退出程序 |

---

### 命令行快捷命令

```bash
# 快速执行任务
openclaw run <skill> <command>

# 快速查看帮助
openclaw help <skill>

# 快速安装技能
openclaw install <skill>

# 快速查看状态
openclaw status
```

---

## 小结

这一篇,你学会了:

1. ✅ 主界面三大区域:技能区、任务区、日志区
2. ✅ 配置文件各字段含义
3. ✅ 权限管理的原理和配置方法
4. ✅ 通过日志排查问题
5. ✅ 常用快捷键和命令

现在,你已经熟悉 OpenClaw 的界面和配置,可以更自如地使用了。

---

## 下篇预告

基础配置掌握后,下一篇我们进入进阶阶段:深入使用文档处理技能,实现 PDF、Word、Excel 的全面自动化。

> **下一篇**:文档处理三部曲:PDF、Word、Excel 一网打尽

---

