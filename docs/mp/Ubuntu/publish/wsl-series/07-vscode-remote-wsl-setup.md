# VS Code + WSL = 完美开发环境？Remote 插件配置全攻略

> **阅读时长**：约 12 分钟 | **难度等级**：⭐⭐☆☆☆ 入门进阶
> **本篇关键词**：VS Code / Remote WSL / 开发环境 / 编辑器配置 / 效率提升
>
> VS Code Remote - WSL 是 WSL 开发的灵魂搭档。它让 VS Code 直接操作 Linux 文件系统中的代码，同时享受 Windows 的界面和体验。配置好之后，开发效率直接翻倍。

---

## 为什么要用 VS Code Remote - WSL？

### 传统方式 vs Remote 方式

```
❌ 传统方式（在 Windows 中编辑 /mnt/c/ 的文件）：
┌─────────────────────────────┐
│ VS Code（Windows 原生）      │
│ 编辑 /mnt/c/project/*.py    │
│ → 跨文件系统操作 → 🐢 很慢   │
→ Git 操作慢、扩展兼容性差     │
→ 终端用的是 Windows 的       │
└─────────────────────────────┘

✅ Remote - WSL 方式：
┌──────────────────────────────┐
│ VS Code（Windows 界面）       │
│  └── Remote 连接到 WSL        │
│     编辑 ~/project/*.py      │
│     → 原生 ext4 操作 → ⚡快   │
│     → Git 在 Linux 内运行    │
│     → 终端就是 WSL Bash      │
│     → 扩展安装在 WSL 内      │
└──────────────────────────────┘

界面是 Windows 的，但"大脑"完全在 Linux 里！
```

---

## 安装与连接

### Step 1：安装必要组件

```bash
# 确保已安装 Git（WSL 内）
sudo apt update && sudo apt install -y git curl wget ca-certificates
```

### Step 2：安装 VS Code

```powershell
# Windows 上安装 VS Code
# 方法一：Microsoft Store 搜索 "Visual Studio Code"
# 方法二：winget install Microsoft.VisualStudioCode
# 方法三：官网下载 https://code.visualstudio.com/
```

### Step 3：安装 Remote - WSL 扩展

```
1. 打开 VS Code
2. 按 Ctrl+Shift+X 打开扩展面板
3. 搜索 "Remote - WSL"
4. 找到微软发布的那个（ID: ms-vscode-remote.remote-wsl）
5. 点击 Install
```

> 💡 **顺便装上这两个**：`Remote - SSH` 和 `Remote - Containers`，后面可能用到。

### Step 4：连接到 WSL

三种方式，选你喜欢的：

```
方式一：命令面板（最常用）
1. Ctrl + Shift + P
2. 输入 "WSL"
3. 选择 "Remote-WSL: Connect to WSL"
4. 选择发行版（如 Ubuntu-24.04）
5. 新窗口打开 → 左下角显示 "WSL: Ubuntu-24.04"

方式二：左下角图标
1. 点击左下角的绿色图标 <>
2. 选择 "Connect to WSL"
3. 选择发行版

方式三：从 WSL 终端启动
$ code .
$ code ~/project/
$ code folder/
```

连接成功后，你会看到：

```
✅ 窗口底部状态栏显示 "WSL: Ubuntu-24.04"
✅ 左下角有 "SSH: WSL" 或 "WSL" 标识
✅ 终端自动变成了 WSL Bash
✅ 打开文件夹时默认定位到 Linux 文件系统
```

---

## 必装扩展推荐组合

### 核心扩展（每个开发者都需要）

| 扩展名 | ID | 用途 |
|:---|:---|:---|
| **Remote - WSL** | `ms-vscode-remote.remote-wsl` | 🔴 必须！远程连接核心 |
| **Chinese (Simplified)** | `MS-CEINTL.vscode-language-pack-zh-hans` | 中文界面 |
| **Pylance** | `ms-python.vscode-pylance` | Python 智能补全 |
| **ESLint** | `dbaeumer.vscode-eslint` | JavaScript 代码检查 |
| **GitLens** | `eamodio.gitlens` | Git 增强（ blame、历史等）|

### Python 开发者加装

| 扩展名 | 用途 |
|:---|:---|
| **Python** (`ms-python.python`) | 调试、运行、虚拟环境管理 |
| **Black Formatter** (`ms-python.black-formatter`) | 代码格式化 |
| **isort** (`ms-python.isort`) | import 排序 |
| **Jupyter** (`ms-toolsai.jupyter`) | Notebook 支持 |

### JavaScript/TypeScript 开发者加装

| 扩展名 | 用途 |
|:---|:---|
| **JavaScript Booster** | JS 快速修复 |
| **Tailwind CSS IntelliSense** | Tailwind 补全 |
| **Error Lens** | 行内错误提示 |

### 通用效率扩展

| 扩展名 | 用途 |
|:---|:---|
| **Material Icon Theme** | 漂亮的文件图标 |
| **One Dark Pro** | 经典暗色主题 |
| **Bracket Pair Colorizer 2** | 彩虹括号匹配 |
| **Auto Rename Tag** | HTML/XML 标签同步修改 |
| **Path Intellisense** | 路径自动补全 |

### 一键批量安装（在 WSL 中执行）

```bash
# 创建扩展列表文件
cat > recommended-extensions.json << 'EOF'
{
  "recommendations": [
    "ms-python.vscode-pylance",
    "ms-python.python",
    "ms-python.black-formatter",
    "dbaeumer.vscode-eslint",
    "eamodio.gitlens",
    "PKief.material-icon-theme",
    "bradlc.vscode-tailwindcss",
    "usernamehw.errorlens",
    "CoenraadS.bracket-pair-colorizer-2",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "MS-CEINTL.vscode-language-pack-zh-hans"
  ]
}
EOF

# 在 VS Code 中按 Ctrl+Shift+P → 输入 "Extensions: Show Recommended Extensions"
# 或者命令行安装：
code --install-extension ms-python.pylance
code --install-extension ms-python.python
# ... （逐个或写脚本循环安装）
```

---

## settings.json 最佳配置

### 打开设置文件

在 VS Code Remote - WSL 模式下，按 `Ctrl+Shift+P` → 输入 "Open User Settings (JSON)"

### 推荐完整配置

```json
{
    // ====== 编辑器基础设置 ======
    "editor.fontSize": 14,
    "editor.fontFamily": "'JetBrains Mono', 'Cascadia Mono', 'Fira Code', Consolas, monospace",
    "editor.fontLigatures": true,
    "editor.renderWhitespace": "boundary",
    "editor.minimap.enabled": false,
    "editor.formatOnSave": true,
    "editor.formatOnPaste": true,
    "editor.guides.bracketPairs": "active",
    "editor.linkedEditing": true,
    "editor.suggestSelection": "first",
    
    // ====== 文件设置（WSL 关键！）=====
    "files.eol": "\n",
    "files.insertFinalNewline": true,
    "files.trimTrailingWhitespace": true,
    "files.autoGuessEncoding": true,
    "files.autoSave": "afterDelay",
    "files.autoSaveDelay": 1000,
    
    // ====== 终端设置 ======
    "terminal.integrated.defaultProfile.linux": "bash",
    "terminal.integrated.fontSize": 13,
    "terminal.integrated.cursorBlinking": true,
    "terminal.integrated.scrollback": 5000,
    
    // ====== Python 设置 ======
    "[python]": {
        "editor.defaultFormatter": "ms-python.black-formatter",
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
            "source.organizeImports": "explicit"
        }
    },
    "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
    
    // ====== JavaScript/TypeScript ======
    "[javascript]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[typescript]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    "[json]": {
        "editor.defaultFormatter": "esbenp.prettier-vscode"
    },
    
    // ====== Git 设置 ======
    "git.enableSmartCommit": true,
    "git.autofetch": true,
    "git.confirmSync": false,
    "git.detectSubmodulesLimit": 10,
    
    // ====== 搜索设置 ======
    "search.include": {
        "**/*.ts": true,
        "***.js": true,
        "***.py": true
    },
    
    // ====== WSL 特定优化 ======
    "remote.WSL.fileWatcher.polling": true,
    "remote.autoForwardPorts": true,
    "remote.restoreForwardedPorts": true,
    
    // ====== 外观 ======
    "workbench.colorTheme": "One Dark Pro",
    "workbench.iconTheme": "material-icon-theme",
    "workbench.editor.labelFormat": "short",
    "window.titleBarStyle": "native"
}
```

### 关键配置说明

| 配置项 | 为什么重要 |
|:---|:---|
| `"files.eol": "\n"` | 强制 LF 换行符，避免 CRLF/LF 混乱 |
| `"remote.WSL.fileWatcher.polling": true` | 解决跨系统文件监听问题 |
| `"editor.formatOnSave": true` | 保存时自动格式化代码 |
| `"terminal.integrated.defaultProfile.linux": "bash"` | 确保 WSL 终端用 Bash |

---

## 高效工作流演示

### 工作流一：日常开发循环

```
1. 打开项目
   $ code ~/projects/my-app

2. VS Code 自动以 Remote-WSL 模式打开
   → 底部状态栏显示 "WSL: Ubuntu-24.04"

3. 编码（智能补全、语法高亮、错误提示全部来自 WSL 内的 LSP）

4. 终端中测试（集成的终端 = WSL Bash）
   $ python3 main.py
   $ npm test
   $ go run .

5. 提交代码（Source Control 面板 = WSL 的 Git）
   Ctrl+Enter 提交

6. 浏览器预览（localhost 直接访问）
   F5 启动调试 → 自动打开浏览器
```

### 工作流二：多窗口并行开发

```
窗口 A：VS Code Remote - WSL（编码 + 终端）
窗口 B：浏览器（预览 + 调试工具）
窗口 C：另一个 VS Code 窗口（查看文档或别的项目）

所有窗口共享同一个 WSL 实例
```

### 工作流三：端口自动转发

```bash
# WSL 终端中启动服务
python3 -m http.server 8000

# VS Code 右下角自动弹出提示：
# "Service available on port 8000"
# 点击即可在浏览器中打开！

# 或者在 PORTS 面板（左侧边栏）查看所有转发端口
```

### 工作流四：快捷键大全

| 快捷键 | 功能 |
|:---|:---|
| `Ctrl + Shift + P` | 命令面板（万能入口）|
| `Ctrl + \` | 切换集成终端 |
| `Ctrl + Shift + B` | 运行构建任务 |
| `F5` | 启动调试 |
| `Ctrl + Shift + E` | 资源管理器 |
| `Ctrl + Shift + G` | 源代码管理（Git）|
| `Ctrl + Shift + X` | 扩展面板 |
| `Ctrl + P` | 快速打开文件 |
| `Ctrl + Shift + F` | 全局搜索 |
| `Ctrl + ,` | 打开设置 |
| `K K`（快速连按两次 K）| 折叠当前代码块 |
| `Shift + Alt + F` | 格式化文档 |

---

## 常见问题 FAQ

### Q1：VS Code Server 安装失败？

```bash
# 手动清理后重连
rm -rf ~/.vscode-server
# 然后在 VS Code 中重新连接 WSL
# 会自动重新安装 server
```

### Q2：扩展安装很慢？

VS Code 扩展市场服务器在国外。可以设置镜像：

```json
// settings.json 中添加：
"extensions.autoUpdate": false,  // 关闭自动更新减少网络请求
// 或使用代理（如果有的话）
```

### Q3：中文输入法无法使用？

这是 WSLg 的已知限制。解决方案：

```
方案 A：在 Windows 侧输入中文，然后粘贴到 VS Code
方案 B：安装 fcitx5 输入法（较复杂，后续文章会详细讲）
方案 C：使用 Windows 版 VS Code 远程编辑（部分场景可行）
```

### Q4：怎么确认我在 Remote 模式？

看这几个地方：
- ✅ 状态栏底部显示 "WSL: Ubuntu-24.04"
- ✅ 终端提示符是 `user@pc:~$`（不是 PS/CMD）
- ✅ `ls ~` 显示的是 Linux 目录结构
- ✅ 扩展旁边有 "(WSL)" 小标记

---

## 下期预告

下一篇：**《Python 开发环境搭建：venv、conda、uv 怎么选？》**

- 🐍 Python 安装与版本管理
- 📦 三种包管理器对比与选择
- 🏗️ 虚拟环境最佳实践
- 📓 Jupyter Notebook 配置
- 🔧 常见依赖安装速查

---

> **💡 你的 VS Code 有什么独家配置？评论区分享一下！**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
>
> 💬 还想看哪个编辑器的 WSL 配置？（Vim/Neovim/WebStorm?）
