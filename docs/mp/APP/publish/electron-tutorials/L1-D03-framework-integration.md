# Electron + 前端框架集成实战：React/Vue/Svelte 全覆盖

> **阅读时长**：约 20 分钟 | **难度**：⭐⭐ 进阶 | **本系列**：L1/Day 3
> **前置知识**：Day 1 基础架构 + Day 2 Preload/IPC

前两天我们用纯 HTML/CSS/JS 搭建了 Electron 应用。但现实是，现代前端项目几乎都会用框架——React、Vue、Svelte、Solid……今天就来解决这个刚需：**如何把前端框架优雅地接入 Electron？**

---

## 一、为什么需要框架集成？

### 1.1 纯原生 vs 框架开发对比

| 维度 | 纯 HTML/CSS/JS | React/Vue 等框架 |
|:---|:---|:---|
| **状态管理** | 手动操作 DOM，易出错 | 响应式数据绑定，自动更新 UI |
| **组件复用** | 困难，靠复制粘贴 | 组件化，props/state 清晰 |
| **生态支持** | 无 | 路由、状态管理、UI 库丰富 |
| **TypeScript** | 需要额外配置 | 原生支持或无缝集成 |
| **适合场景** | 极简工具（<500行代码） | 中大型应用（主流选择） |

### 1.2 主流 Electron 应用用了什么框架？

| 应用 | 框架 | 说明 |
|:---|:---|:---|
| [VS Code](https://github.com/microsoft/vscode) | 自定义框架 | 基于 TypeScript 的自定义 MV* 框架 |
| [Discord](https://github.com/discord/discord) | React | Desktop 版用 Electron + React |
| [Slack](https://slack.com/) | React | 同样是 Electron + React |
| [Notion Web Clipper](https://github.com/notion-enhancer/notion-enhancer) | React | 浏览器扩展 + Electron |
| [Mattermost Desktop](https://github.com/mattermost/desktop) | React + TypeScript | 开源 Slack 替代品 |
| [Obsidian](https://github.com/obsidianmd/obsidian-md) | 自定义 | 自研框架，但插件可用 React |

结论：**React 是 Electron 项目中最流行的框架选择**，其次是 Vue。

---

## 二、构建工具选型

在开始之前，先搞清楚一个关键问题：**用什么工具来构建你的 Electron + 框架项目？**

### 2.1 主流方案对比

| 工具 | 特点 | 社区活跃度 | 推荐度 |
|:---|:---|:---:|:---:|
| **[electron-vite](https://electron-vite.org/)** ⭐ | Vite 加速 + 多进程构建 + 开箱即用 | ★★★★★ | 🔥 **首选推荐** |
| [electron-forge](https://www.electronforge.io/) | 官方脚手架 | ★★★★☆ | ✅ 备选 |
| [electron-builder](https://www.electron.build/) | 只负责打包（不负责开发构建） | ★★★★☆ | — 配合其他工具使用 |
| webpack + 手动配置 | 最灵活但最复杂 | ★★☆☆☆ | ❌ 新手不推荐 |
| [nx](https://nx.dev/) | Monorepo 工作区管理 | ★★★☆☆ | ✅ 大型项目考虑 |

### 2.2 为什么推荐 electron-vite？

```
传统方案的问题：
┌──────────┐    ┌──────────┐    ┌──────────┐
│ webpack   │ →  │ 等待编译 │ →  │ 刷新页面  │
│ 全量编译  │    │ 5-30秒   │    │          │
└──────────┘    └──────────┘    └──────────┘

electron-vite 的优势：
┌──────────┐    ┌──────────┐    ┌──────────┐
│ Vite HMR │ →  │ <100ms   │ →  │ 瞬间热更新 │
│ 按需编译  │    │ 极速     │    │          │
└──────────┘    └──────────┘    └──────────┘
```

核心优势：
- 🚀 **极速启动**：Vite 的 ESM 原生开发服务器
- 🔥 **HMR 热更新**：改代码秒级反映到窗口
- 📦 **多进程构建**：自动处理 main / preload / renderer 三种入口
- 🎯 **开箱即用的 TypeScript 支持**
- 📝 **零配置即可使用**

---

## 三、Electron + React 完整教程（主推）

这是最主流的组合，我们将从零搭建一个完整的 React + Electron 项目。

### 3.1 快速创建项目

```bash
# 使用 electron-vite 创建 React + TypeScript 项目
npm create electron-app@latest my-react-app -- --template=react-ts

cd my-react-app
npm run dev
```

生成的标准结构：

```
my-react-app/
├── electron.vite.config.ts        # ⚙️ 构建配置
├── package.json
├── tsconfig.json
├── src/
│   ├── main/                      # 🖥️ 主进程
│   │   └── index.ts               #    入口 + 窗口创建
│   ├── preload/                   # 🔗 Preload
│   │   └── index.ts               #    contextBridge 暴露 API
│   └── renderer/                  # 🎨 渲染进程 (React)
│       ├── src/
│       │   ├── App.tsx            #    根组件
│       │   ├── main.tsx           #    React 入口
│       │   └── components/        #    你的组件们...
│       ├── index.html             #    HTML 模板
│       └── ...                    #    标准 React 项目结构
```

### 3.2 核心文件详解

#### `src/main/index.ts` — 主进程

```typescript
import { app, BrowserWindow, shell } from 'electron';
import { join } from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,           // 页面准备好再显示，避免白屏
    autoHideMenuBar: true, // 自动隐藏菜单栏（Windows/Linux）
    
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,       // ✅ 开启沙箱
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();     // 页面渲染完成后显示窗口
  });

  // 加载 React 应用的入口 URL
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'));
  }

  // 外部链接在系统浏览器中打开（而不是应用内打开）
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });
}

// Electron 生命周期
app.whenReady().then(() => {
  // 设置应用模型 ID（Windows）
  electronApp.setAppUserModelId('com.myapp');

  // 默认打开 DevTools（仅开发环境）
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

#### `src/preload/index.ts` — 安全桥梁

```typescript
import { contextBridge, ipcRenderer } from 'electron';

// 定义暴露给渲染进程的 API 类型
const api = {
  // 平台信息
  platform: process.platform,
  
  // 文件操作示例
  readFile: (path: string) => ipcRenderer.invoke('fs:read', path),
  writeFile: (path: string, data: string) => ipcRenderer.invoke('fs:write', path, data),
  
  // 窗口控制
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  
  // 事件监听
  onUpdateAvailable: (callback: (info: any) => void) => {
    const handler = (_event: any, info: any) => callback(info);
    ipcRenderer.on('update:available', handler);
    return () => ipcRenderer.removeListener('update:available', handler);
  },
};

contextBridge.exposeInMainWorld('electronAPI', api);

export type ElectronAPI = typeof api;
```

#### `src/renderer/src/App.tsx` — React 根组件

```tsx
import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [platform, setPlatform] = useState<string>('加载中...');
  const [fileContent, setFileContent] = useState<string>('');
  const [status, setStatus] = useState<string>('就绪');

  useEffect(() => {
    // 通过 preload 暴露的 API 获取平台信息
    if (window.electronAPI) {
      setPlatform(window.electronAPI.platform);
      
      // 监听更新事件
      window.electronAPI.onUpdateAvailable((info) => {
        setStatus(`发现新版本 ${info.version}`);
      });
    }
  }, []);

  const handleReadFile = async () => {
    setStatus('读取中...');
    try {
      const result = await window.electronAPI.readFile('/tmp/test.txt');
      setFileContent(result as string);
      setStatus('✅ 读取成功');
    } catch (err) {
      setStatus(`❌ 读取失败: ${String(err)}`);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🚀 My React-Electron App</h1>
        <span className="badge">Platform: {platform}</span>
      </header>
      
      <main className="app-main">
        <section className="card">
          <h2>📂 文件操作演示</h2>
          <button onClick={handleReadFile}>读取测试文件</button>
          
          {fileContent && (
            <pre className="file-content">{fileContent}</pre>
          )}
        </section>

        <section className="card">
          <h2>⚙️ IPC 通信测试</h2>
          <p>Status: <strong>{status}</strong></p>
        </section>
      </main>

      <footer className="app-footer">
        Built with ❤️ using React + Electron + electron-vite
      </footer>
    </div>
  );
}

export default App;
```

### 3.3 关键配置文件

**`electron.vite.config.ts`**：

```typescript
import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer/src'),
      },
    },
    plugins: [react()],
  },
});
```

### 3.4 类型声明（全局增强）

创建 `src/renderer/src/types/electron-api.d.ts`：

```typescript
import type { ElectronAPI } from '../../preload';

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
```

这样在 React 组件中使用 `window.electronAPI` 时就有完整的类型提示和补全了！

---

## 四、Electron + Vue 教程

如果你更熟悉 Vue，这里有一份快速指南：

### 4.1 创建项目

```bash
# 方式一：electron-vite Vue 模板（推荐）
npm create electron-app@latest my-vue-app -- --template=vue-ts

# 方式二：手动搭建（vue-cli-plugin 方式）
vue create my-vue-app --default
cd my-vue-app
vue add electron-builder
```

### 4.2 Vue 组件中使用 Electron API

```vue
<!-- src/renderer/src/components/FileExplorer.vue -->
<template>
  <div class="file-explorer">
    <h3>📁 文件浏览器</h3>
    
    <button @click="openDialog">打开文件</button>
    
    <div v-if="content" class="preview">
      <pre>{{ content }}</pre>
    </div>
    
    <p class="platform">运行于: {{ platform }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

const content = ref('');
const platform = ref('');

onMounted(() => {
  if (window.electronAPI) {
    platform.value = window.electronAPI.platform;
  }
});

async function openDialog() {
  if (!window.electronAPI) return;
  
  const filePath = await window.electronAPI.showOpenDialog?.();
  if (filePath) {
    content.value = await window.electronAPI.readFile(filePath);
  }
}
</script>
```

---

## 五、Electron + Svelte（轻量之选）

Svelte 的编译时特性使其打包体积极小，非常适合追求轻量的 Electron 应用。

### 5.1 创建项目

```bash
npm create electron-app@latest my-svelte-app -- --template=svelte-ts
```

### 5.2 Svelte 组件示例

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  let platform = '';
  let status = '就绪';

  onMount(() => {
    if (window.electronAPI) {
      platform = window.electronAPI.platform;
    }
  });

  async function handleAction() {
    status = '处理中...';
    // 调用 Electron API
    await new Promise(r => setTimeout(r, 1000));
    status = '✅ 完成';
  }
</script>

<main>
  <h1>Svelte + Electron</h1>
  <p>Platform: {platform}</p>
  <button on:click={handleAction}>执行操作</button>
  <p>{status}</p>
</main>
```

---

## 六、三种框架对比总结

| 对比维度 | React | Vue | Svelte |
|:---|:---|:---|:---|
| **学习曲线** | 中等（JSX + Hooks） | 低（模板语法） | 低（类似 HTML） |
| **打包体积** | 较大（~130KB gzipped） | 中等（~45KB gzipped） | 最小（~10KB gzipped） |
| **性能** | 好 | 很好 | 最好（编译时优化） |
| **生态系统** | 最丰富 | 丰富 | 成长中 |
| **TypeScript** | 原生支持好 | 支持良好 | 支持 |
| **社区案例** | Discord、Slack、Mattermost | 各类工具 | Obsidian 插件常用 |
| **适用场景** | 大型复杂应用 | 快速原型到中型应用 | 追求极致轻量 |

### 怎么选？

```
你的需求是什么？
│
├─ 大型应用（功能复杂、多人协作）
│  └─→ React（生态成熟、人才多）
│
├─ 中型应用（快速开发、团队熟悉 Vue）
│  └─→ Vue（上手快、中文文档好）
│
├─ 轻量工具（追求小体积、快速启动）
│  └─→ Svelte（编译时魔法、体积最小）
│
└─ 不确定？
   └─→ 选 React（资料最多、坑最少人踩过）
```

---

## 七、通用最佳实践（所有框架共用）

### 7.1 开发体验优化

```typescript
// 1. 开发模式下自动刷新
if (is.dev) {
  // electron-vite 已内置 HMR，无需额外配置
  
  // 如果使用 webpack，可以添加：
  // mainWindow.webContents.openDevTools();
}

// 2. 生产环境禁用 DevTools
if (!app.isPackaged) {
  mainWindow.webContents.openDevTools();
}
```

### 7.2 路由处理（React/Vue 都适用）

```tsx
// React Router 示例
import { BrowserRouter } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/editor/:id" element={<Editor />} />
      </Routes>
    </BrowserRouter>
  );
}
```

> 💡 **注意**：Electron 中使用 BrowserRouter 时，需要在主进程中拦截导航：
> ```javascript
> mainWindow.webContents.on('will-navigate', (event, url) => {
>   // 允许内部路由，阻止外部跳转
>   if (!url.startsWith('http://localhost')) {
>     event.preventDefault();
>     shell.openExternal(url); // 用系统浏览器打开外部链接
>   }
> });
> ```

### 7.3 CSS 方案建议

| 方案 | 适用场景 | 推荐指数 |
|:---|:---|:---:|
| **Tailwind CSS** | 快速开发、原子化 CSS | ⭐⭐⭐⭐⭐ |
| **CSS Modules** | 组件隔离、中小项目 | ⭐⭐⭐⭐ |
| **styled-components** | React 生态、动态样式 | ⭐⭐⭐⭐ |
| **UnoCSS** | 比 Tailwind 更快、原子化 | ⭐⭐⭐⭐ |
| **普通 CSS/SCSS** | 简单项目 | ⭐⭐⭐ |

---

## 八、今日总结

| 要点 | 内容 |
|:---|:---|
| **推荐构建工具** | electron-vite（基于 Vite，极速 HMR） |
| **首选框架组合** | React + TypeScript + Tailwind CSS |
| **核心架构** | main（主进程）+ preload（安全桥）+ renderer（框架应用） |
| **类型安全** | 全局 `window.electronAPI` 类型声明 |
| **开发模式** | `npm run dev` 启动，自动热更新 |
| **路由** | 内部路由正常使用，外部链接用系统浏览器打开 |

### 下节预告：Day 4 进入 L2 阶段 —— IPC 通信深度解析

明天开始第二阶段的学习，深入探索：
- invoke/handle/send/on 四种模式的完整用法
- **类型安全的 IPC**（TypeScript 双向类型推导）
- IPC 通道设计模式（RESTful 风格命名）
- 错误处理与超时机制
- 大数据传输优化技巧

---

> 💬 你平时开发更喜欢用哪个框架？评论区聊聊！
> 👨‍💻 **系列教程持续更新**，关注「APP移动开发」不错过。
> ❤️ 觉得有用？"在看"走一波 👇
