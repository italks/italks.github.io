# WSL 终端美化大作战：Oh My Posh + 字体 + 主题

> **阅读时长**：约 11 分钟 | **难度等级**：⭐⭐☆☆☆ 入门进阶
> **本篇关键词**：终端美化 / Oh My Posh / Windows Terminal / Nerd Font / 主题配色
>
> 一个漂亮的终端不仅赏心悦目，还能提升工作效率——Git 分支、Python 版本、错误码一目了然。手把手教你打造一个让人羡慕的开发者终端。

---

## 为什么要美化终端？

### Before & After

```
Before（默认终端）：
zhangsan@DESKTOP:~/projects/my-app$

After（美化后）：
┌─────────────────────────────────────────────────────┐
│  via 🐍 v3.12                                        │
│  ❯ ~/projects/my-app on main ±1 !2 *5              │
│  ❯ git push origin main                              │
│                                                       │
│  显示信息：                                           │
│  · 当前 Python 版本 (🐍 v3.12)                       │
│  · Git 分支 (main)                                   │
│  · 文件变更数 (±1: 新增1个文件变更)                    │
│  · 未提交 (!2: 2个未提交的修改)                        │
│  · 后台任务 (*5: 5个后台进程)                          │
│  · 上一条命令执行时间 (128ms)                          │
└─────────────────────────────────────────────────────┘

→ 不用敲命令就能掌握项目状态！
```

---

## 第一步：安装 Nerd Font 字体（基础中的基础）

终端图标和符号需要 **Nerd Font** 支持，否则会显示为乱码方块。

### 下载与安装

```
1. 访问 https://www.nerdfonts.com/
2. 点击 "Download Fonts"
3. 推荐选择以下之一（二选一即可）：

   ┌────────────────┬──────────────────┐
   │ JetBrains Mono │ 代码专用等宽字体   │ ← 推荐！
   │ CascadiaCode    │ 微软出品 VS Code 默认字体
   └────────────────┴──────────────────┘

4. 下载后解压 → 右键 .ttf 文件 → "为所有用户安装"
5. 重启 Windows Terminal
```

```powershell
# 或者用 winget 快速安装（管理员 PowerShell）
winget install Dev86.JetBrainsMonoNerdFont -s winget
# 或
winget install DEVCOM.JetBrainsMonoNerdFont
```

### 验证字体安装

打开 Windows Terminal，输入：
```
   󰊬      󰇐
```
如果能看到各种图标符号而不是方块 ✅，说明字体安装成功。

---

## 第二步：Oh My Posh — 终极提示符引擎

### 安装 Oh My Posh

```bash
# 方法一：官方脚本安装（推荐）
wget https://github.com/JanDeDobbeleer/oh-my-posh/releases/latest/download/posh-linux-amd64 -O /usr/local/bin/oh-my-posh
chmod +x /usr/local/bin/oh-my-posh

# 验证
oh-my-posh --version
```

### 初始化到 Shell

```bash
# 将以下内容写入 ~/.bashrc
echo 'eval "$(oh-my-posh init bash)"' >> ~/.bashrc

# 重载配置
source ~/.bashrc
```

此时你的提示符应该已经变化了！

### 查看所有可用主题

```bash
oh-my-posh get themes
# 会列出 100+ 个内置主题名称
```

### 预览主题效果

```bash
# 方式一：预览单个主题
oh-my-posh init bash --config $(oh-my-posh config get atomic)

# 方式二：交互式浏览主题库
# 浏览器访问 https://ohmyposh.dev/docs/themes
# 每个主题都有截图预览
```

---

## 第三步：推荐主题精选

根据不同使用场景推荐：

### 🏆 日常开发首选

| 主题 | 特点 | 适合 |
|:---|:---|:---|
| **atomic** | 简洁现代、双行 | 全栈开发 ⭐⭐⭐⭐⭐ |
| **jandedobbeleer** | 经典双行、信息丰富 | 日常使用 ⭐⭐⭐⭐⭐ |
| **paradox** | 高级感强、单行 | 追求颜值 ⭐⭐⭐⭐⭐ |
| **robbyrussell** | 类 Oh-My-Zsh 经典风格 | Zsh 转过来的用户 ⭐⭐⭐⭐ |
| **night-owl** | 护眼暗色主题 | 长时间编码 ⭐⭐⭐⭐ |

### 设置主题

```bash
# 以 atomic 主题为例
echo 'eval "$(oh-my-posh init bash --config $(oh-my-posh config get atomic))"' >> ~/.bashrc
source ~/.bashrc
```

### 自定义主题（高级）

创建自己的主题 JSON：

```bash
mkdir -p ~/.poshthemes
cat > ~/.poshthemes/my-theme.omp.json << 'THEME'
{
  "$schema": "https://raw.githubusercontent.com/JanDeDobbeleer/oh-my-posh/main/themes/schema.json",
  "blocks": [
    {
      "type": "prompt",
      "alignment": "left",
      "segments": [
        {
          "type": "os",
          "style": "powerline",
          "powerline_symbol": "\uE0B0",
          "foreground": "#ffffff",
          "background": "#0077c2",
          "template": " {{.Icon}} "
        },
        {
          "type": "path",
          "style": "powerline",
          "powerline_symbol": "\uE0B0",
          "foreground": "#e5c07b",
          "background": "#313644",
          "properties": {
            "style": "full",
            "home_icon": "~"
          },
          "template": " \uF071 {{ .Path }}"
        },
        {
          "type": "git",
          "style": "powerline",
          "powerline_symbol": "\uE0B0",
          "foreground": "#98c379",
          "background": "#313644",
          "template": " {{ .HEAD }}{{ if or (.Working.Changed .Staged.Changed) }} \uF044 {{ .Working.String }}{{ end }}{{ if gt .Behind 1 }} \uF044 {{ .Behind }}{{ end }}{{ if gt .Ahead 1 }} \uF044 {{ .Ahead }}{{ end }} "
        }
      ]
    },
    {
      "type": "prompt",
      "alignment": "right",
      "segments": [
        {
          "type": "python",
          "style": "plain",
          "foreground": "#61afef",
          "template": "{{ .Full }} ",
          "properties": {
            "display_version": true
          }
        },
        {
          "type": "executiontime",
          "style": "plain",
          "foreground": "#c678dd",
          "template": "{{ .FormattedMs }}ms ",
          "properties": {
            "threshold": 500,
            "style": "roundrock"
          }
        }
      ]
    },
    {
      "type": "newline"
    },
    {
      "type": "prompt",
      "alignment": "left",
      "segments": [
        {
          "type": "text",
          "style": "plain",
          "foreground": "#abb2bf",
          "template": "\u276F "
        }
      ],
      "newline": true
    }
  ],
  "version": 2
}
THEME

# 使用自定义主题
echo 'eval "$(oh-my-posh init bash --config ~/.poshthemes/my-theme.omp.json)"' >> ~/.bashrc
source ~/.bashrc
```

---

## 第四步：Windows Terminal 配色方案

### 打开设置

Windows Terminal 中按 `Ctrl + ,` 打开 settings.json。

### 推荐完整配置

```json
{
    "profiles": {
        "defaults": {
            "font": {
                "face": "JetBrainsMono Nerd Font",
                "size": 13,
                "ligatures": true
            },
            "colorScheme": "One Half Dark",
            "cursorShape": "filledBox",
            "cursorHeight": 25,
            "padding": "10, 8, 10, 8",
            "useAcrylic": true,
            "acrylicOpacity": 0.92,
            "scrollbarState": "visible",
            "experimental.rainbowRendering": true
        }
    },

    "schemes": [
        // ===== One Half Dark（推荐主色）=====
        {
            "name": "One Half Dark",
            "background": "#282c34",
            "foreground": "#abb2bf",
            "black": "#282c34",
            "blue": "#61afef",
            "cyan": "#56b6c2",
            "green": "#98c379",
            "orange": "#d19a66",
            "purple": "#c678dd",
            "red": "#e06c75",
            "white": "#abb2bf",
            "yellow": "#e5c07b"
        },
        // ===== Tokyo Night（备选）=====
        {
            "name": "Tokyo Night",
            "background": "#1a1b26",
            "foreground": "#a9b1d6",
            "black": "#32344a",
            "blue": "#7aa2f7",
            "cyan": "#7dcfff",
            "green": "#9ece6a",
            "orange": "#ff9e64",
            "purple": "#bb9af7",
            "red": "#f7768e",
            "white": "#787c99",
            "yellow": "#e0af68"
        },
        // ===== Dracula（经典）=====
        {
            "name": "Dracula",
            "background": "#282a36",
            "foreground": "#f8f8f2",
            "black": "#21222c",
            "blue": "#bd93f9",
            "cyan": "#8be9fd",
            "green": "#50fa7b",
            "orange": "#ffb86c",
            "purple": "#ff79c6",
            "red": "#ff5555",
            "white": "#f8f8f2",
            "yellow": "#f1fa8c"
        }
    ],

    // ===== 窗口外观 =====
    "window": {
        "theme": "dark"
    }
}
```

---

## 第五步：ls 输出彩色化 + 常用别名

### 安装 color-dir 和 lsd（替代 ls）

```bash
# 方法一：使用 exa/rust 版（已停更但仍好用）
cargo install exa

# 方法二：使用 lsd（活跃维护）
sudo apt install lsd || cargo install lsd

# 方法三：简单方案 — 给 ls 加颜色
# 大多数发行版已经支持 --color=auto
alias ls='ls --color=auto'
alias ll='ls -alF --color=auto'
alias la='ls -A --color=auto'

# 写入 bashrc
cat >> ~/.bashrc << EOF

# ===== 彩色 ls 别名 =====
alias ls='ls --color=auto'
alias ll='ls -alF --color=auto'
alias la='ls -A --color=auto'
alias tree='tree -C'           # tree 也加颜色

# ===== 如果装了 lsd/exa =====
# alias ls='lsd'               # 用 lsd 替代 ls
# alias ll='lsd -la'           # 用 lsd 详细模式
EOF
source ~/.bashrc
```

### 效果对比

```
没有颜色:
drwxr-xr-x 2 user user 4096 Apr 14 src
-rw-r--r-- 1 user user  220 Apr 14 README.md

有颜色:
📁 drwxr-xr-x 2 user user 4096 Apr 14 src       ← 目录是蓝色/青色
📄 -rw-r--r-- 1 user user  220 Apr 14 README.md  ← 文件是白色
🔒 -rw------- 1 user user 1234 Apr 14 .env        ← 私密文件是红色
🔧 -rwxr-xr-x 1 user user  512 Apr 14 run.sh     ← 可执行文件是绿色
```

---

## 终端快捷键速查

| 快捷键 | 功能 |
|:---|:---|
| `Ctrl + Shift + T` | 新标签页 |
| `Ctrl + Shift + D` | 垂直分屏 |
| `Ctrl + Shift + 5` | 水平分屏 |
| `Alt+Shift+←/→` | 在分屏间切换 |
| `Ctrl + Shift + W` | 关闭当前标签页 |
| `Ctrl + ,` | 打开设置 |
| `Ctrl + Shift + P` | 命令面板 |
| `Ctrl + +/-` | 缩放字体 |
| `Ctrl + Shift + Space` | 默认配置下拉菜单 |

---

## 下期预告

下一篇：**《USB 设备连接 WSL？USB/IP 与硬件直通实战》**

- 🔌 USBIPD 协议详解
- 📱 Android ADB 通过 WSL 连接调试
- 🔌 串口设备连接方法
- 🎮 游戏手柄/外设使用
- 💾 U 盘自动挂载与管理

---

> **💡 你的终端是什么风格？截图分享一下？**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
