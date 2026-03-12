# OpenClaw Skill 开发完整指南：从零开始创建你的第一个技能

## 目录

1. [OpenClaw 是什么？](#1-openclaw-是什么)
2. [Skill 是什么？](#2-skill-是什么)
3. [开发环境准备](#3-开发环境准备)
4. [Skill 文件结构详解](#4-skill-文件结构详解)
5. [实战：创建你的第一个 Skill](#5-实战创建你的第一个-skill)
6. [测试与调试](#6-测试与调试)
7. [发布你的 Skill](#7-发布你的-skill)
8. [常见问题与最佳实践](#8-常见问题与最佳实践)

---

## 1. OpenClaw 是什么？

### 1.1 简介

OpenClaw 是一个开源的 AI 智能体（Agent）平台，它可以让 AI 自主执行各种真实工作任务，例如：

- 📁 文件操作（创建、编辑、删除文件）
- 🌐 浏览器控制（打开网页、填表、截图）
- 🤖 任务自动化（执行脚本、调用 API）
- 💻 代码编写与执行

与传统的 AI 聊天机器人不同，OpenClaw 不仅能"说"，还能"做"。它可以真正帮你完成实际工作，就像一个虚拟助手。

### 1.2 核心特点

- **本地运行**：数据安全，无需上传到云端
- **自主执行**：AI 可以自主决策并执行任务
- **可扩展**：通过 Skill 系统扩展功能
- **开源免费**：完全开源，社区驱动

### 1.3 应用场景

| 场景 | 示例 |
|------|------|
| 办公自动化 | 自动整理文档、生成报告 |
| 数据处理 | 抓取网页数据、分析表格 |
| 开发辅助 | 编写代码、调试程序 |
| 内容创作 | 写文章、制作演示文稿 |

---

## 2. Skill 是什么？

### 2.1 Skill 的概念

Skill（技能）是 OpenClaw 的扩展模块，就像浏览器的插件或手机的 App。每个 Skill 专注于一个特定领域，为 AI 提供专业知识和工作流程。

### 2.2 为什么需要 Skill？

虽然 OpenClaw 本身已经很强大，但它不可能精通所有领域。通过 Skill 系统：

- ✅ 让 AI 掌握专业知识（如 PDF 处理、Excel 操作）
- ✅ 定义标准工作流程（如日记记录、数据分析）
- ✅ 提供工具和资源（如模板、脚本）
- ✅ 共享给其他用户使用

### 2.3 Skill 能做什么？

一个 Skill 可以：

1. **定义触发词**：当用户说特定词汇时激活
2. **提供工作流程**：指导 AI 如何完成任务
3. **包含脚本**：提供可执行的代码工具
4. **引用资源**：提供文档、模板、示例

### 2.4 典型 Skill 示例

| Skill 名称 | 功能 | 触发词 |
|-----------|------|--------|
| PDF Editor | 处理 PDF 文件 | "编辑 PDF"、"合并 PDF" |
| Excel Master | 操作 Excel 表格 | "处理 Excel"、"分析数据" |
| Diary | 记录日记 | "帮我记一下"、"写日记" |
| Image Generator | 生成图片 | "生成图片"、"画一张图" |

---

## 3. 开发环境准备

### 3.1 安装 OpenClaw

首先，你需要在电脑上安装 OpenClaw：

**方式一：官方安装包**
1. 访问 OpenClaw 官网或 GitHub Releases 页面
2. 下载适合你系统的安装包（Windows/Mac/Linux）
3. 按提示完成安装

**方式二：源码编译**
```bash
git clone https://github.com/openclaw/openclaw.git
cd openclaw
npm install
npm run build
```

### 3.2 准备开发工具

你需要以下工具：

| 工具 | 用途 | 推荐版本 |
|------|------|---------|
| 文本编辑器 | 编写代码和文档 | VS Code、Sublime Text |
| Python | 编写脚本（可选） | 3.8+ |
| Git | 版本控制和发布 | 最新版 |

### 3.3 创建工作目录

```bash
# 创建你的 Skill 开发目录
mkdir my-skills
cd my-skills

# OpenClaw 的 Skill 目录通常位于
# Windows: C:\Users\<用户名>\.openclaw\skills\
# Mac/Linux: ~/.openclaw/skills/
```

---

## 4. Skill 文件结构详解

### 4.1 核心文件

一个完整的 Skill 包含以下文件：

```
my-skill/                 # Skill 根目录
├── SKILL.md             # 【必需】技能主文档
├── README.md            # 【推荐】用户说明文档
├── clawhub.json         # 【必需】发布配置文件
├── scripts/             # 【可选】可执行脚本
│   └── helper.py
├── references/          # 【可选】参考文档
│   └── guide.md
└── assets/              # 【可选】资源文件
    └── icon.svg
```

### 4.2 文件说明

#### 4.2.1 SKILL.md（必需）

这是最重要的文件，定义了 Skill 的所有信息：

**文件结构**：
```markdown
---
name: skill-name                    # 技能标识符（小写+连字符）
description: 技能的简短描述           # 用于技能市场的展示
---

# 技能标题

## 概述
技能的详细介绍...

## 使用场景
何时使用这个技能...

## 工作流程
如何执行任务...

## 示例
具体使用示例...
```

**关键要点**：
- 必须包含 YAML 头部（`---` 之间的部分）
- `name` 和 `description` 是必需字段
- 使用 Markdown 格式编写
- 内容越详细，AI 执行越准确

#### 4.2.2 clawhub.json（必需）

发布到技能市场时需要的配置文件：

```json
{
  "name": "skill-name",              // 同 SKILL.md 中的 name
  "version": "1.0.0",                // 版本号（语义化版本）
  "displayName": "Skill Display Name", // 显示名称
  "description": "技能描述",          // 英文描述
  "author": "your-username",         // 作者名
  "license": "MIT",                  // 许可证
  "keywords": ["tag1", "tag2"],      // 关键词
  "categories": ["productivity"],    // 分类
  "triggers": ["触发词1", "trigger2"], // 触发词
  "repository": {
    "type": "git",
    "url": "https://github.com/user/skill.git"
  },
  "readme": "README.md",             // README 文件
  "icon": "icon.svg",                // 图标文件
  "engines": {
    "openclaw": ">=1.0.0"            // 兼容的 OpenClaw 版本
  }
}
```

#### 4.2.3 README.md（推荐）

用户友好的说明文档：

```markdown
# Skill 名称

简短的技能介绍

## 功能特点

- 功能1
- 功能2

## 使用方法

详细的使用说明...

## 安装

如何安装这个技能...

## 示例

使用示例...

## 作者

你的名字

## 许可证

MIT
```

#### 4.2.4 scripts/（可选）

存放可执行脚本：

```
scripts/
├── helper.py        # Python 脚本
├── process.sh       # Shell 脚本
└── tool.js          # Node.js 脚本
```

**用途**：
- 复杂的数据处理
- 需要确定性执行的任务
- 可重复使用的工具

#### 4.2.5 references/（可选）

存放参考文档：

```
references/
├── api-docs.md      # API 文档
├── schemas.md       # 数据结构说明
└── examples.md      # 更多示例
```

**用途**：
- 详细的 API 说明
- 数据库表结构
- 公司内部规范
- 大型参考手册

#### 4.2.6 assets/（可选）

存放资源文件：

```
assets/
├── icon.svg         # 技能图标
├── template.docx    # 模板文件
└── logo.png         # Logo 图片
```

---

## 5. 实战：创建你的第一个 Skill

让我们创建一个实用的"番茄钟"技能，帮助用户进行时间管理。

### 5.1 创建目录结构

```bash
mkdir -p tomato-timer/{scripts,assets}
cd tomato-timer
```

### 5.2 编写 SKILL.md

创建文件 `SKILL.md`：

```markdown
---
name: tomato-timer
description: A productivity skill for Pomodoro Technique time management. Start focused work sessions with tomato timer.
---

# Tomato Timer Skill

## Overview

This skill helps users practice the Pomodoro Technique for better time management and productivity. It provides timed work and break sessions to maintain focus and avoid burnout.

## When to Use

This skill should trigger when users:

- Say "start tomato timer", "番茄钟", or "开始专注"
- Want to focus on work for a set period
- Need to manage work/break cycles
- Ask for productivity help

## Workflow

### 1. Start a Tomato Session

When the user says a trigger phrase:

1. Ask the user for the task they want to focus on
2. Set a 25-minute work timer
3. Notify the user when time is up
4. Suggest a 5-minute break
5. Repeat the cycle

### 2. Custom Duration

If the user specifies a duration:

```
User: "番茄钟 50分钟"
Action: Start a 50-minute focused work session
```

### 3. Break Timer

After each work session, automatically suggest or start a break timer (default 5 minutes).

## Examples

### Example 1: Basic Usage

```
User: 番茄钟
AI: I'll start a 25-minute Pomodoro session for you. What task will you be working on?

User: Writing documentation
AI: Great! I've started a 25-minute timer for "Writing documentation". 
    I'll notify you when it's time for a break. Stay focused! 🍅

[After 25 minutes]
AI: Time's up! Great work on "Writing documentation". 
    Take a 5-minute break to recharge. Say "start break" when ready.
```

### Example 2: Custom Duration

```
User: 开始专注 45分钟
AI: Starting a 45-minute focused work session. What's your task?

User: Coding the new feature
AI: 45-minute timer started for "Coding the new feature". Stay focused! 🍅
```

### Example 3: Check Remaining Time

```
User: 还有几分钟
AI: You have 12 minutes remaining in your current Pomodoro session.
```

## Technical Implementation

### Timer Management

Use Python script to manage timers:

```python
import time
import subprocess

def start_timer(minutes, task_name):
    seconds = minutes * 60
    time.sleep(seconds)
    # Send notification
    subprocess.run(['notify-send', 'Tomato Timer', 
                    f'Time\'s up! Task: {task_name}'])
```

### File Structure

```
tomato-timer/
├── SKILL.md
├── README.md
├── clawhub.json
├── scripts/
│   └── timer.py
└── assets/
    └── tomato-icon.svg
```

## Notes

- Default work duration: 25 minutes
- Default break duration: 5 minutes
- Long break every 4 Pomodoros: 15-30 minutes
- Log completed sessions for tracking
```

### 5.3 编写 clawhub.json

创建文件 `clawhub.json`：

```json
{
  "name": "tomato-timer",
  "version": "1.0.0",
  "displayName": "Tomato Timer",
  "description": "A productivity skill for Pomodoro Technique time management with customizable work and break sessions.",
  "author": "your-username",
  "license": "MIT",
  "keywords": [
    "pomodoro",
    "timer",
    "productivity",
    "focus",
    "time-management"
  ],
  "categories": [
    "productivity",
    "time-management"
  ],
  "triggers": [
    "番茄钟",
    "tomato timer",
    "start focus",
    "开始专注",
    "pomodoro"
  ],
  "repository": {
    "type": "git",
    "url": "https://github.com/your-username/tomato-timer.git"
  },
  "readme": "README.md",
  "icon": "tomato-icon.svg",
  "engines": {
    "openclaw": ">=1.0.0"
  }
}
```

### 5.4 编写 README.md

创建文件 `README.md`：

```markdown
# Tomato Timer

A productivity skill for Pomodoro Technique time management.

## Features

- 🍅 Standard 25-minute work sessions
- ☕ Automatic 5-minute break reminders
- ⏱️ Customizable duration
- 📊 Session tracking
- 🔔 Desktop notifications

## Installation

### Via Skill Center
Search for "Tomato Timer" in OpenClaw Skill Center and click Install.

### Manual Installation
```bash
cd ~/.openclaw/skills/
git clone https://github.com/your-username/tomato-timer.git
```

## Usage

### Start a Session

**Chinese:**
```
用户：番茄钟
AI：开始25分钟专注计时。你要完成什么任务？
```

**English:**
```
User: tomato timer
AI: Starting a 25-minute focus session. What task will you work on?
```

### Custom Duration

```
User: start focus 45 minutes
User: 开始专注 50分钟
```

### Check Remaining Time

```
User: 还有多少时间
User: how much time left
```

## The Pomodoro Technique

1. Choose a task to work on
2. Set a timer for 25 minutes (one "Pomodoro")
3. Work until the timer rings
4. Take a short 5-minute break
5. Every 4 Pomodoros, take a longer 15-30 minute break

## Configuration

You can customize default durations by editing `scripts/config.py`:

```python
WORK_DURATION = 25  # minutes
SHORT_BREAK = 5     # minutes
LONG_BREAK = 15     # minutes
```

## Tips

- Minimize distractions during work sessions
- Use breaks to stretch and hydrate
- Track completed sessions to measure productivity
- Adjust durations based on your preference

## License

MIT

## Author

your-username

## Support

Issues and suggestions: [GitHub Issues](https://github.com/your-username/tomato-timer/issues)
```

### 5.5 创建脚本（可选）

创建文件 `scripts/timer.py`：

```python
#!/usr/bin/env python3
"""
Tomato Timer Script
Manages Pomodoro work and break sessions
"""

import sys
import time
import json
from datetime import datetime, timedelta

def start_timer(minutes: int, task: str = "Work"):
    """
    Start a countdown timer
    
    Args:
        minutes: Duration in minutes
        task: Task name for the session
    """
    seconds = minutes * 60
    start_time = datetime.now()
    end_time = start_time + timedelta(seconds=seconds)
    
    print(f"🍅 Starting {minutes}-minute session for: {task}")
    print(f"End time: {end_time.strftime('%H:%M:%S')}")
    
    # Countdown
    remaining = seconds
    while remaining > 0:
        mins, secs = divmod(remaining, 60)
        print(f"\r⏱️  {mins:02d}:{secs:02d} remaining", end='', flush=True)
        time.sleep(1)
        remaining -= 1
    
    print(f"\n✅ Time's up! Session '{task}' completed.")
    
    # Return session info
    return {
        "task": task,
        "duration": minutes,
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "completed": True
    }

def log_session(session_data: dict, log_file: str = "sessions.json"):
    """
    Log completed session to file
    
    Args:
        session_data: Session information
        log_file: Path to log file
    """
    try:
        with open(log_file, 'r') as f:
            sessions = json.load(f)
    except FileNotFoundError:
        sessions = []
    
    sessions.append(session_data)
    
    with open(log_file, 'w') as f:
        json.dump(sessions, f, indent=2)

def main():
    """Command line entry point"""
    if len(sys.argv) < 2:
        print("Usage: python timer.py <minutes> [task_name]")
        print("Example: python timer.py 25 'Writing documentation'")
        sys.exit(1)
    
    minutes = int(sys.argv[1])
    task = sys.argv[2] if len(sys.argv) > 2 else "Work"
    
    session = start_timer(minutes, task)
    log_session(session)
    
    print("\n☕ Take a 5-minute break!")

if __name__ == '__main__':
    main()
```

### 5.6 创建图标（可选）

创建一个简单的 SVG 图标 `assets/tomato-icon.svg`：

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <!-- Tomato body -->
  <circle cx="50" cy="55" r="40" fill="#FF6347"/>
  
  <!-- Tomato stem -->
  <rect x="45" y="10" width="10" height="15" fill="#228B22" rx="2"/>
  
  <!-- Tomato leaf -->
  <ellipse cx="35" cy="18" rx="15" ry="8" fill="#32CD32" transform="rotate(-30 35 18)"/>
  <ellipse cx="65" cy="18" rx="15" ry="8" fill="#32CD32" transform="rotate(30 65 18)"/>
  
  <!-- Highlight -->
  <ellipse cx="40" cy="45" rx="8" ry="12" fill="#FF7F50" opacity="0.5"/>
</svg>
```

---

## 6. 测试与调试

### 6.1 本地测试

**步骤 1：放置 Skill 文件**

将你的 Skill 文件夹复制到 OpenClaw 的 skills 目录：

```bash
# Mac/Linux
cp -r tomato-timer ~/.openclaw/skills/

# Windows
xcopy tomato-timer C:\Users\<用户名>\.openclaw\skills\
```

**步骤 2：重启 OpenClaw**

重启 OpenClaw 应用，让它加载新的 Skill。

**步骤 3：测试触发**

在 OpenClaw 中输入触发词：

```
番茄钟
```

或

```
tomato timer
```

### 6.2 调试技巧

#### 技巧 1：查看日志

OpenClaw 会在日志中记录 Skill 的执行过程：

```bash
# 查看日志
tail -f ~/.openclaw/logs/openclaw.log
```

#### 技巧 2：验证文件格式

使用 JSON 验证器检查 `clawhub.json`：

```bash
# 使用 Python 验证 JSON
python -m json.tool clawhub.json
```

#### 技巧 3：测试脚本

单独测试 Python 脚本：

```bash
cd scripts
python timer.py 25 "Test task"
```

### 6.3 常见错误

| 错误 | 原因 | 解决方案 |
|------|------|---------|
| Skill not found | 文件夹位置错误 | 检查是否放在正确的 skills 目录 |
| Invalid YAML | SKILL.md 格式错误 | 检查 `---` 头部格式 |
| Trigger not working | 触发词未定义 | 检查 `triggers` 字段 |
| Script error | Python 脚本报错 | 检查 Python 版本和依赖 |

---

## 7. 发布你的 Skill

### 7.1 准备发布

#### 7.1.1 检查文件清单

确保包含所有必需文件：

```
✅ SKILL.md          # 必需
✅ clawhub.json      # 必需
✅ README.md         # 推荐
✅ scripts/          # 可选
✅ assets/           # 可选
```

#### 7.1.2 添加 .gitignore

创建 `.gitignore` 文件：

```
# Python
__pycache__/
*.py[cod]
*.pyo

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Build
*.zip
```

### 7.2 发布到 GitHub

**步骤 1：创建 GitHub 仓库**

1. 访问 https://github.com/new
2. 填写信息：
   - Repository name: `tomato-timer`
   - Description: `A productivity skill for Pomodoro Technique`
   - 选择 Public
   - 不要勾选 "Add a README file"（你已经有了）

**步骤 2：推送代码**

```bash
cd tomato-timer

# 初始化 Git
git init

# 添加所有文件
git add .

# 提交
git commit -m "feat: Initial release of Tomato Timer skill

- Implement Pomodoro timer functionality
- Support custom duration
- Add session logging
- Provide bilingual triggers (Chinese/English)"

# 添加远程仓库
git remote add origin https://github.com/your-username/tomato-timer.git

# 推送
git branch -M main
git push -u origin main
```

### 7.3 发布到 ClawHub

ClawHub 是 OpenClaw 的官方技能市场。

**步骤 1：访问 ClawHub**

访问 ClawHub 官网（通常是 `https://clawhub.io` 或类似地址）

**步骤 2：登录/注册**

使用 GitHub 账号登录

**步骤 3：提交 Skill**

填写表单：

| 字段 | 填写内容 |
|------|---------|
| **SLUG** | `tomato-timer` |
| **Display name** | `Tomato Timer` |
| **Repository URL** | `https://github.com/your-username/tomato-timer.git` |
| **License** | `MIT` |

**步骤 4：等待审核**

提交后，ClawHub 会验证你的仓库，审核通过后即可上线。

### 7.4 打包为 ZIP（可选）

如果需要直接上传 ZIP 文件：

```bash
# 打包（排除 Git 文件）
zip -r tomato-timer.zip tomato-timer/ -x "*.git*" -x "__pycache__/*"

# 查看包内容
unzip -l tomato-timer.zip
```

---

## 8. 常见问题与最佳实践

### 8.1 常见问题

#### Q1: 如何选择 Skill 名称？

**A:** 遵循以下规则：
- 使用小写字母
- 使用连字符分隔单词
- 简短且描述性
- 示例：`pdf-editor`, `excel-master`, `diary-writer`

#### Q2: SKILL.md 应该写多详细？

**A:** 越详细越好！AI 会根据你的描述执行任务。建议包含：
- 明确的触发条件
- 详细的工作流程
- 多个实际示例
- 特殊情况的处理方式

#### Q3: 什么时候需要写脚本？

**A:** 以下情况建议使用脚本：
- 需要精确控制（如计时器）
- 复杂的数据处理
- 可重复使用的工具
- 需要调用外部 API

#### Q4: 如何支持多语言？

**A:** 两种方式：
1. 在 `triggers` 中添加多语言触发词
2. 提供多语言 README（如 `README.md` 和 `README_CN.md`）

示例：
```json
"triggers": [
  "tomato timer",
  "番茄钟",
  "start focus",
  "开始专注"
]
```

#### Q5: Skill 更新后如何通知用户？

**A:** 
1. 更新 `clawhub.json` 中的 `version` 字段
2. 在 README 中添加更新日志
3. 重新推送到 GitHub
4. 如果发布到 ClawHub，用户会收到更新提示

### 8.2 最佳实践

#### 实践 1：清晰的文档结构

```
# 标准的 SKILL.md 结构

---
name: skill-name
description: Brief description
---

# Skill Name

## Overview
What this skill does

## Use Cases
When to use it

## Workflow
How it works

## Examples
Real usage examples

## Technical Details
Implementation notes

## Notes
Important notes
```

#### 实践 2：语义化版本控制

版本号格式：`主版本.次版本.补丁版本`

- **主版本**：不兼容的 API 修改
- **次版本**：向后兼容的功能新增
- **补丁版本**：向后兼容的问题修正

示例：
```
1.0.0 → 初始版本
1.1.0 → 添加新功能
1.1.1 → 修复 bug
2.0.0 → 重大重构
```

#### 实践 3：提供丰富的示例

在 SKILL.md 中提供多个实际使用示例：

```markdown
## Examples

### Example 1: Basic usage
...

### Example 2: Advanced usage
...

### Example 3: Edge cases
...
```

#### 实践 4：错误处理

在脚本中添加错误处理：

```python
try:
    # 主要逻辑
    result = process_data(data)
except FileNotFoundError:
    print("Error: File not found")
    sys.exit(1)
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
```

#### 实践 5：性能优化

- 避免在 SKILL.md 中包含过大的内容
- 将大型参考文档放在 `references/` 目录
- 使用脚本处理计算密集型任务

### 8.3 进阶技巧

#### 技巧 1：使用模板

创建 Skill 模板，加快开发速度：

```bash
# 创建模板目录
mkdir -p ~/.openclaw/skill-template/{scripts,references,assets}

# 复制模板
cp -r ~/.openclaw/skill-template my-new-skill
```

#### 技巧 2：自动化测试

为脚本编写测试：

```python
# test_timer.py
import timer

def test_start_timer():
    result = timer.start_timer(1, "Test")
    assert result['duration'] == 1
    assert result['task'] == "Test"
    assert result['completed'] == True

if __name__ == '__main__':
    test_start_timer()
    print("All tests passed!")
```

#### 技巧 3：持续集成

使用 GitHub Actions 自动测试：

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: 3.9
      - name: Run tests
        run: |
          cd scripts
          python -m pytest tests/
```

---

## 总结

恭喜你！现在你已经掌握了：

✅ OpenClaw 和 Skill 的基本概念  
✅ Skill 的文件结构和各文件的作用  
✅ 如何从零创建一个完整的 Skill  
✅ 如何测试和调试 Skill  
✅ 如何发布 Skill 到 GitHub 和 ClawHub  
✅ 最佳实践和常见问题解决方案  

### 下一步

1. **实践**：创建你自己的 Skill
2. **分享**：发布到社区，帮助其他人
3. **学习**：阅读其他人的 Skill 源码
4. **贡献**：为 OpenClaw 社区做贡献

### 资源链接

- OpenClaw 官网：https://openclaw.ai
- OpenClaw GitHub：https://github.com/openclaw
- ClawHub 技能市场：https://clawhub.io
- 社区论坛：https://community.openclaw.ai

---

**Happy Coding! 🎉**

如有问题，欢迎在 GitHub 上提交 Issue 或在社区论坛提问。
