# Electron 从入门到精通 — 完整学习路线图

> **适用人群**：有一定 JavaScript/Node.js 基础，想开发跨平台桌面应用的开发者
> **参考项目**：VS Code、Discord、Slack、Figma、Obsidian、Notion 等主流 Electron 应用

---

## 📖 教程总览

| 阶段 | 主题 | 预计时长 | 难度 |
|:---:|:---|:---:|:---:|
| L1 | Electron 基础入门 | 3 天 | ⭐ |
| L2 | 进程架构与通信 | 4 天 | ⭐⭐ |
| L3 | 窗口管理与 UI 构建 | 5 天 | ⭐⭐ |
| L4 | 系统能力与原生集成 | 5 天 | ⭐⭐⭐ |
| L5 | 性能优化与调试 | 4 天 | ⭐⭐⭐ |
| L6 | 安全、打包与分发 | 4 天 | ⭐⭐⭐ |
| L7 | 工程化与架构实战 | 5 天 | ⭐⭐⭐⭐ |

---

## L1：Electron 基础入门（第1-3天）

### Day 1：认识 Electron

#### 1.1 什么是 Electron
- Electron 的历史与发展（GitHub 开源，2013年至今）
- **核心原理**：Chromium + Node.js = 跨平台桌面应用
- 与其他跨方案对比：
  - **Electron** vs Tauri vs Flutter Desktop vs Qt
- 主流 Electron 应用一览：
  - [VS Code](https://github.com/microsoft/vscode) — 代码编辑器（~400MB 内存优化典范）
  - [Discord](https://github.com/discord/discord) — 社交平台
  - [Slack](https://slack.com/) — 企业协作
  - [Figma](https://www.figma.com/) — 设计工具（原生渲染+Electron壳）
  - [Obsidian](https://github.com/obsidianmd/obsidian-md) — 知识管理（轻量级标杆）
  - [Notion](https://www.notion.so/) — 笔记/协作
  - [Postman](https://www.postman.com/) — API 调试工具
  - [Bitwarden](https://github.com/bitwarden/clients) — 密码管理器

#### 1.2 环境搭建
```bash
# 要求：Node.js >= 16, npm >= 7
node -v   # v18+ 推荐
npm -v    # 9+ 推荐

# 方式一：快速脚手架
npm create electron-app@latest my-app -- --template=vite-typescript

# 方式二：手动创建
mkdir my-electron-app && cd my-electron-app
npm init -y
npm install electron --save-dev
npm install electron-builder --save-dev
```

#### 1.3 第一个 Electron 应用
```
my-electron-app/
├── package.json          # 入口配置 + scripts
├── main.js               # 主进程入口
├── preload.js            # 预加载脚本（安全桥梁）
└── index.html            # 渲染进程页面
```

**核心代码解析**：
- `BrowserWindow` 创建窗口
- `main.js` / `preload.js` / `index.html` 三件套
- `app.whenReady()` 生命周期
- `contextIsolation` 安全机制

### Day 2：核心概念深入

#### 2.1 主进程 vs 渲染进程
| 维度 | 主进程 (Main Process) | 渲染进程 (Renderer Process) |
|:---|:---|:---|
| 运行环境 | Node.js | Chromium（网页环境） |
| 数量 | 唯一一个 | 可有多个（多窗口） |
| 职责 | 窗口管理、系统API、原生功能 | UI渲染、用户交互 |
| 可用模块 | 全部 electron 模块 | 有限（需通过 preload 暴露） |
| 典型代码 | `main.js`, `preload.js` | `index.html`, React/Vue 组件 |

#### 2.2 Preload 脚本 — 安全的桥梁
```javascript
// preload.js —— 正确的安全实践
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // 只暴露必要的最小 API
  platform: process.platform,
  send: (channel, data) => {
    const validChannels = ['toMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    const validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});
```

**📌 案例：Obsidian 的安全策略**
- Obsidian 完全禁用了 `nodeIntegration`
- 通过 contextBridge 暴露文件读写等 API
- 所有 IPC 通信都经过白名单验证

### Day 3：前端框架集成

#### 3.1 Electron + React（最主流）
```
推荐模板：electron-vite
├── src/
│   ├── main/           # 主进程代码
│   │   └── index.ts
│   ├── preload/        # 预加载脚本
│   │   └── index.ts
│   └── renderer/       # React 应用
│       ├── App.tsx
│       └── index.html
├── electron.vite.config.ts
└── package.json
```

**参考项目**：
- VS Code 内部使用自定义框架，但社区版可用 react-electron 模板
- [Mattermost Desktop](https://github.com/mattermost/desktop) — React + TypeScript + Electron

#### 3.2 Electron + Vue
- [vue-cli-plugin-electron-builder](https://github.com/nickdejesus/vue-cli-plugin-electron-builder)
- [electron-vite-vue](https://github.com/alex8088/electron-vite/tree/main/templates/vue)

**参考项目**：
- [Notion Web Clipper](https://github.com/notion-enhancer/notion-enhancer) 相关生态

#### 3.2 Electron + Svelte/Solid
- 轻量级应用的优选方案
- 打包体积更小

---

## L2：进程架构与 IPC 通信（第4-7天）

### Day 4：IPC 通信详解

#### 4.1 IPC 通信模式全解

```
┌─────────────────────────────────────────────┐
│                   Main Process               │
│                                             │
│  ipcMain.handle() ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─→│ ipcRenderer.invoke()
│  ipcMain.on()      ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ →│ ipcRenderer.send()
│  ipcMain.send()    ─ ─ ─ ─ ─ ─ ─ ─ → ipcRenderer.on()
│                                             │
│  webContents.send()── ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─→│ 所有渲染进程
└─────────────────────────────────────────────┘
```

**通信模式对照表**：

| 场景 | 推荐方法 | 特点 |
|:---|:---|:---|
| 渲染→主进程请求并等待结果 | `invoke/handle` | Promise 风格，返回数据 |
| 渲染→主进程单向通知 | `send/on` | 不关心返回值 |
| 主进程→渲染进程推送 | `webContents.send/on` | 广播消息 |
| 主进程↔主进程 | `MessageChannel` | Electron 28+ 支持 |

#### 4.2 类型安全的 IPC（TypeScript 最佳实践）

**📌 参考：[electron-toolkit](https://github.com/nicepkg/electron-toolkit) / [electron-ts-ipc](https://github.com/nicedoc/electron-ts-ipc)**

```typescript
// types/electron-api.ts
export interface ElectronAPI {
  // 文件操作
  readFile: (path: string) => Promise<string>
  writeFile: (path: string, content: string) => Promise<void>
  // 窗口控制
  minimize: () => void
  maximize: () => void
  // 系统信息
  getAppVersion: () => Promise<string>
}

// 在 renderer 中使用时带完整类型提示
window.electronAPI.readFile('/etc/config.json').then(data => {
  console.log(data); // 自动推断为 string
})
```

### Day 5：多窗口架构

#### 5.1 多窗口管理策略
```javascript
// 参考：VS Code 的多窗口架构
class WindowManager {
  #windows = new Map<string, BrowserWindow>();

  create(id: string, options: BrowserWindowConstructorOptions) {
    const win = new BrowserWindow({
      ...options,
      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        preload: path.join(__dirname, 'preload.js'),
      }
    });
    this.#windows.set(id, win);
    return win;
  }

  get(id: string) { return this.#windows.get(id); }
  getAll() { return Array.from(this.#windows.values()); }
  closeAll() { this.#windows.forEach(win => win.destroy()); }
}
```

#### 5.2 经典多窗口模式
| 模式 | 说明 | 参考项目 |
|:---|:---|:---|
| 主+子窗口 | 主窗口 + 设置/偏好窗口 | VS Code、Slack |
| 多文档界面 | 每个文件独立窗口 | VS Code、Sublime Text |
| 浮动面板 | 工具面板可拖出为独立窗口 | Figma、DevTools |
| 弹窗/模态 | 临时性交互窗口 | 通用 |

### Day 6：高级通信模式

#### 6.1 MessagePort（Electron 28+ 新特性）
- 用于大量数据的传输（比 JSON 序列化高效）
- 支持流式传输大文件

```javascript
// 主进程
ipcMain.handle('get-data-stream', (event) => {
  const { port1, port2 } = new MessageChannel();
  
  // 将 port2 发送给渲染进程
  event.ports[0].postMessage({ type: 'stream-start' });
  
  // port1 在主进程中用于发送数据流
  return port2;
});
```

#### 6.2 跨窗口通信
- 通过主进程中转
- 使用 `BroadcastChannel`（Electron 28+）
- 或使用共享内存（`sharedArrayBuffer`，实验性）

### Day 7：L2 综合实战

**实战项目：简易记事本**
- 功能：
  - 多标签页编辑（类似 VS Code 的 Editor Group）
  - 文件保存/打开（IPC invoke/handle）
  - 快捷键绑定
  - 最近文件列表
- 技术点：
  - 完整的 IPC 通信体系
  - 多标签窗口管理
  - preload 安全暴露 API

---

## L3：窗口管理与 UI 构建（第8-12天）

### Day 8：窗口定制与美化

#### 8.1 自定义标题栏（Frameless Window）
```javascript
const win = new BrowserWindow({
  frame: false,                    // 无原生标题栏
  titleBarStyle: 'hidden',         // macOS 风格
  trafficLightPosition: { x: 10, y: 10 },  // macOS 窗口按钮位置
  
  // Windows 下需要额外配置
  titleBarOverlay: {
    color: '#2f3241',
    symbolColor: '#74b1be',
    height: 32,  // 需要 Electron 29+
  },
});
```

**📌 参考实现**：
- [VS Code 自定义标题栏](https://github.com/microsoft/vscode)：完整的拖拽区、图标按钮、菜单集成
- [Discord 标题栏](https://discord.com/)：服务器/频道导航 + 窗口控制
- [Figma](https://www.figma.com/)：完全无边框 + 自绘 UI

#### 8.2 窗口状态持久化
```typescript
// 参考：electron-store + electron-window-state
import Store from 'electron-store';
import windowStateKeeper from 'electron-window-state';

const mainWindowState = windowStateKeeper({
  defaultWidth: 1000,
  defaultHeight: 800,
});

const win = new BrowserWindow({
  x: mainWindowState.x,
  y: mainWindowState.y,
  width: mainWindowState.width,
  height: mainWindowState.height,
});

mainWindowState.manage(win);
```

### Day 9：UI 框架选择与实践

#### 9.1 Electron UI 框架对比
| 框架 | 特点 | 适用场景 | 参考项目 |
|:---|:---|:---|:---|
| **Material UI (MUI)** | Google Design 规范 | 企业应用、工具类 | Postman |
| **Ant Design** | 企业级组件库 | 后台管理系统 | 蚂蚁内部工具 |
| **Arco Design** | 字节出品，现代风格 | 通用 | 飞书/Lark |
| **shadcn/ui** | 可定制、Radix 原语 | 追求设计自由度 | 现代新项目 |
| **Tauri Style** | 极简 CSS | 轻量应用 | Obsidian 类 |
| **自定义 CSS** | 完全控制 | 设计驱动型 | Figma、Notion |

#### 9.2 Electron 专属 UI 库
- [photon](https://github.com/photonui/photon-core) — macOS 原生风格
- [electron-react-ui-components](https://github.com/tlenclos/electron-react-ui-components)
- [spectron](https://github.com/nicepkg/spectron) — 测试框架附带 UI 组件

### Day 10：菜单、托盘与快捷键

#### 10.1 应用菜单
```javascript
// 参考：VS Code 的完整菜单体系
const menuTemplate = [
  {
    label: '文件',
    submenu: [
      {
        label: '新建文件',
        accelerator: 'CmdOrCtrl+N',
        click: () => { /* IPC 通知渲染进程 */ }
      },
      { type: 'separator' },
      {
        label: '退出',
        role: 'quit',
      },
    ],
  },
  // macOS 特有
  ...(process.platform === 'darwin' ? [{
    label: app.name,
    submenu: [{ role: 'about' }, { type: 'separator' }, { role: 'quit' }]
  }] : []),
];
```

#### 10.2 系统托盘（Tray）
```javascript
const tray = new Tray(path.join(__dirname, 'icon.png'));
const contextMenu = Menu.buildFromTemplate([
  { label: '显示窗口', click: () => win.show() },
  { type: 'separator' },
  { label: '退出', click: () => app.quit() },
]);
tray.setContextMenu(contextMenu);
tray.setToolTip('我的 Electron 应用');
```

**📌 托盘使用案例**：
- Discord：最小化到托盘 + 未读消息气泡通知
- Slack：统一通知中心
- Bitwarden：后台运行守护密码填充

#### 10.3 全局快捷键
```javascript
// 注册全局快捷键（即使不在前台也生效）
globalShortcut.register('CommandOrControl+Shift+D', () => {
  // 截屏、开发者工具、快速搜索等
  win.show();
});

// 务必在 app will-quit 时注销所有快捷键
app.on('will-quit', () => globalShortcut.unregisterAll());
```

### Day 11-12：L3 综合实战 — 打造类 VS Code 编辑器外壳

**实战目标**：构建一个具有以下特性的编辑器框架：
- ✅ 自定义标题栏（含面包屑导航、分支切换）
- ✅ 侧边栏 + 活动栏（Activity Bar）
- ✅ 面板系统（终端、输出、问题）
- ✅ 命令面板（Ctrl+Shift+P）
- ✅ 多标签页编辑器组
- ✅ 状态栏
- ✅ 窗口状态持久化

---

## L4：系统能力与原生集成（第13-17天）

### Day 13：文件系统集成

#### 13.1 文件对话框
```javascript
// 打开文件
const result = await dialog.showOpenDialog(mainWindow, {
  properties: ['openFile', 'multiSelections'],
  filters: [
    { name: 'Markdown', extensions: ['md'] },
    { name: '文本文件', extensions: ['txt', 'json'] },
    { name: '所有文件', extensions: ['*'] },
  ],
});

// 保存文件
const saveResult = await dialog.showSaveDialog(mainWindow, {
  defaultPath: 'untitled.md',
  filters: [{ name: 'Markdown', extensions: ['md'] }],
});
```

#### 13.2 文件监听（watchdog）
```javascript
const chokidar = require('chokidar'); // 比 fs.watch 更可靠

chokidar.watch('./workspace', {
  ignored: /(^|[\/\\])\../,
  persistent: true,
}).on('change', (path) => {
  mainWindow.webContents.send('file-changed', path);
});
```

**📌 案例：Obsidian 的文件系统**
- 本地 Markdown 文件实时监控
- 双向链接引用追踪
- 文件冲突检测与合并
- 使用 chokidar 监听 + 自定义格式解析

### Day 14：原生模块调用

#### 14.1 N-API 与 node-addon-api
```cpp
// native_module.cc — C++ 原生模块示例
#include <napi.h>

Napi::Value GetSystemInfo(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();
  Napi::Object obj = Napi::Object::New(env);
  
  obj.Set("cpuCount", Napi::Number::New(env, GetCPUCount()));
  obj.Set("totalMemory", Napi::Number::New(env, GetTotalMemory()));
  return obj;
}

NODE_API_MODULE(native_module, Init);
```

#### 14.2 常用原生场景
| 需求 | 推荐方案 | 备选 |
|:---|:---|:---|
| 文件加密 | n-api + OpenSSL | crypto-js（纯 JS） |
| USB 通信 | node-hid / usb | electron-usb |
| 串口通信 | serialport | — |
| SQLite 数据库 | better-sqlite3（原生编译） | sql.js（WASM） |
| 图像处理 | sharp（libvips） | jimp（纯 JS） |
| FFmpeg 视频 | fluent-ffmpeg | @ffmpeg/ffmpeg（WASM） |
| 系统通知 | Electron Notification | node-notifier |
| 系统托盘动画 | Tray 图标切换 | — |

### Day 15：操作系统深度集成

#### 15.1 Windows 集成
```javascript
// 任务栏进度条
win.setProgressBar(0.5); // 0-1 范围

// 跳转列表 (Jump List)
app.setUserTasks([
  {
    program: process.execPath,
    arguments: '--new-file',
    iconIndex: 0,
    title: '新建文件',
    description: '创建一个新文件',
  },
]);

// 缩略图工具栏 (Thumbnail Toolbar)
win.setThumbnailToolbar([
  {
    tooltip: '播放',
    icon: nativeImage.createFromPath('play.png'),
    click: () => { /* */ },
  },
]);
```

#### 15.2 macOS 集成
```javascript
// Dock 图标跳动（下载完成提醒）
app.dock.bounce('critical');

// Dock 菜单
app.dock.setMenu(Menu.buildFromTemplate([
  { label: '新建窗口', click: () => createWindow() },
]));

// Touch Bar 支持（MacBook Pro）
if (process.platform === 'darwin') {
  // electron-touch-bar 或原生 TouchBar API
}

// Share Menu（原生分享）
// Universal Links 支持
// Handoff（接力）支持
```

#### 15.3 Linux 集成
```javascript
// D-Bus 通信（Linux 特有）
// MPRIS 协议（媒体控制）
// AppImage / Snap / Flatpak 打包适配
// .desktop 文件配置
```

### Day 16：网络与存储

#### 16.1 存储方案选型
| 方案 | 特点 | 适用场景 | 参考 |
|:---|:---|:---|:---|
| **electron-store** | 基于 JSON 的简单 KV 存储 | 用户设置 | 大量项目使用 |
| **better-sqlite3** | 原生 SQLite，高性能 | 结构化数据 | Obsidian |
| **IndexedDB** | 浏览器标准 API | 渲染端缓存 | 通用 |
| **LevelDB** | 键值数据库，高性能 | 大量小数据 | — |
| **nedb** | MongoDB 风格嵌入式 DB | 轻量级需求 | — |

#### 16.2 网络请求
```javascript
// 主进程中使用 net 模块（比 fetch 更强大）
const { net } = require('electron');

const request = net.request({
  method: 'GET',
  url: 'https://api.example.com/data',
});

request.on('response', (response) => {
  response.on('data', (chunk) => {
    mainWindow.webContents.send('api-response', chunk.toString());
  });
});
request.end();
```

### Day 17：L4 综合实战

**实战：本地文件管理器 + 预览器**
- 功能：
  - 文件树浏览（递归扫描 + 虚拟滚动）
  - 文件类型图标识别
  - 图片/PDF/视频预览
  - 文件拖拽支持
  - 剪贴板操作
  - 外部应用关联打开
- 技术点：
  - 原生文件 API + chokidar 监听
  - shell.openPath() 外部打开
  - ThumbnailToolbar 预览控制

---

## L5：性能优化与调试（第18-21天）

### Day 18：性能分析基础

#### 18.1 Electron 性能瓶颈全景
```
┌─────────────────────────────────────────────────┐
│                  性能瓶颈层级                     │
├─────────────────────────────────────────────────┤
│ Layer 1: 启动性能                                │
│  └── 主进程初始化 → 窗口创建 → 页面加载            │
│                                                 │
│ Layer 2: 运行时内存                               │
│  └── V8 堆内存 + Chromium GPU 进程 + 各渲染进程   │
│                                                 │
│ Layer 3: 渲染性能                                 │
│  └── DOM 操作 → 重排重绘 → 合成层                 │
│                                                 │
│ Layer 4: IPC 通信开销                             │
│  └── 序列化/反序列化 → 进程间拷贝                  │
│                                                 │
│ Layer 5: I/O 与网络                               │
│  └── 文件读写 → 网络请求 → 数据库查询              │
└─────────────────────────────────────────────────┘
```

#### 18.2 Chrome DevTools 性能分析
```javascript
// 在主进程中启用 DevTools
win.webContents.openDevTools();

// 性能标记（Performance Mark API）
performance.mark('render-start');
// ... 渲染逻辑 ...
performance.mark('render-end');
performance.measure('render', 'render-start', 'render-end');
```

### Day 19：启动速度优化

#### 19.1 优化策略总表
| 优化项 | 预期收益 | 难度 | 参考 |
|:---|:---|:---|:---|
| `--enable-features=PlzAutoupdate` | 减少启动时间 ~15% | 低 | VS Code |
| `backgroundThrottling: false` | 后台窗口不降速 | 低 | 通用 |
| `v8CacheOptions: 'code'` | 启用字节码缓存 | 低 | 通用 |
| `sandbox: true` + 优化 preload | 减少 unsafe eval | 中 | 安全+性能 |
| 延迟加载非关键模块 | 减少初始加载量 | 中 | Slack |
| 使用 Service Worker 缓存静态资源 | 二次启动加速 | 中 | 通用 |
| `app.disableHardwareAcceleration()` | 低配设备提升 | 低（但降低渲染质量） | 通用 |

#### 19.2 VS Code 的启动优化秘籍
- **延迟加载扩展**：核心先加载，扩展异步激活
- **虚拟化文件系统**：远程开发时不阻塞 UI
- **增量式 UI 构建**：侧边栏按需展开
- **Splash Screen**：优雅地掩盖加载时间
- **V8 代码缓存**：预热常用脚本路径

### Day 20：内存优化

#### 20.1 Electron 内存模型理解
```
典型 Electron 应用的内存分布（以 VS Code 为例）：

┌──────────────────────────────────────────┐
│  GPU Process     ~100-200MB             │  ← GPU 合成、硬件加速
├──────────────────────────────────────────┤
│  Main Process    ~50-100MB              │  ← Node.js + 业务逻辑
├──────────────────────────────────────────┤
│  Renderer #1     ~150-300MB             │  ← 主窗口 UI
├──────────────────────────────────────────┤
│  Renderer #2     ~50-100MB              │  ← 设置页/Webview
├──────────────────────────────────────────┤
│  Renderer #N     ~30-80MB each          │  ← 预览窗/Webview
├──────────────────────────────────────────┤
│  Utility Process ~20-40MB               │  ← 网络服务/解码
├──────────────────────────────────────────┤
│  Plugin Process  ~30-50MB               │  ← PPAPI 插件
└──────────────────────────────────────────┘
总计：约 500MB - 1GB+ （取决于窗口数量和内容复杂度）
```

#### 20.2 内存优化技术清单
| 技术 | 说明 | 效果 |
|:---|:---|:---|
| **WebContents 回收** | 关闭不可见的 WebContents | 显著减少空闲内存 |
| **V8 垃圾回收调优** | `--max-old-space-size` | 防止 OOM |
| **图片懒加载/压缩** | 仅视口内加载，WebP 格式 | 减少 60%+ 图片内存 |
| **虚拟列表 (Virtual List)** | 大数据集只渲染可视区域 | DOM 节点从 10000→50 |
| **对象池模式** | 复用频繁创建销毁的对象 | 减少 GC 压力 |
| **避免内存泄漏** | WeakMap/WeakRef，及时解除事件监听 | 防止持续增长 |
| **隐藏而非关闭窗口** | 配合 `show: false` 复用 | 避免重复创建开销 |
| **`--js-flags` 微调** | V8 引擎参数调优 | 边际改善 |

#### 20.3 虚拟列表实战
```tsx
// 使用 @tanstack/react-virtual 或 react-virtuoso
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualFileList({ files }) {
  const parentRef = useRef();
  const virtualizer = useVirtualizer({
    count: files.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35, // 每行预估高度
    overscan: 5, // 预渲染上下各5项
  });

  return (
    <div ref={parentRef} style={{ height: '500px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px`, position: 'relative' }}>
        {virtualizer.getVirtualItems().map((item) => (
          <div key={item.key}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', transform: `translateY(${item.start}px)` }}
          >
            <FileItem file={files[item.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Day 21：调试技巧

#### 21.1 主进程调试
```bash
# 方式一：VS Code launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Electron: Main",
  "runtimeExecutable": "electron",
  "program": "${workspaceFolder}/dist/main/index.js"
}

# 方式二：命令行
electron --inspect=9229 ./dist/main/index.js
# 然后 chrome://inspect 连接
```

#### 21.2 渲染进程调试
```javascript
// 直接打开 DevTools（仅开发环境）
if (!app.isPackaged) {
  mainWindow.webContents.openDevTools();
}
```

#### 21.3 高级调试工具
| 工具 | 用途 | 安装 |
|:---|:---|:---|
| `electron-inspector` | 主进程 CPU Profile | npm 包 |
| `devtron` | Electron 专用 DevTools 扩展（已弃用，用内置替代） | — |
| `spectron` | E2E 测试 + 调试 | npm 包 |
| `chrome://tracing` | GPU/渲染线程追踪 | 内置 |
| `chrome://gpu` | GPU 信息诊断 | 内置 |
| `--enable-logging` | 详细日志输出 | CLI 参数 |
| `ELECTRON_LOG_FILE` | 日志写入文件 | 环境变量 |

---

## L6：安全、打包与分发（第22-25天）

### Day 22：Electron 安全完全指南

#### 22.1 安全威胁模型
```
攻击面分析：

┌──────────────────────────────────────────────┐
│                攻击向量                        │
├──────────────────────────────────────────────┤
│ 1. XSS 注入（渲染进程被注入恶意脚本）            │
│    → 解决：CSP + contextIsolation + sandbox   │
│                                              │
│ 2. RCE 远程代码执行                            │
│    → 解决：禁用 nodeIntegration，preload 白名单 │
│                                              │
│ 3. 加载外部不可信内容                           │
│    → 解决：限制 navigation + BFCache 策略       │
│                                              │
│ 4. 预加载脚本泄露                              │
│    → 解决：最小权限原则                         │
│                                              │
│ 5. 依赖供应链攻击                              │
│    → 解决：npm audit + SRI + 锁定依赖版本       │
│                                              │
│ 6. 原生模块漏洞                                │
│    → 解决：审计 + 沙箱隔离                      │
└──────────────────────────────────────────────┘
```

#### 22.2 安全检查清单（Security Checklist）
```javascript
const secureOptions = {
  webPreferences: {
    // ✅ 必须开启
    contextIsolation: true,        // 隔离渲染进程 JS 环境
    sandbox: true,                 // 渲染进程沙箱
    nodeIntegration: false,        // 禁止渲染进程直接访问 Node
    
    // ⚠️ 强烈建议
    preload: path.join(__dirname, 'preload.js'),
    
    // 🔒 内容安全
    enableBlinkFeatures: '',       // 禁用实验性特性
    allowRunningInsecureContent: false,  // HTTPS 页面禁止 HTTP 资源
    
    // ⚡ 性能与安全平衡
    worldSafeExecuteJavaScript: true,
  },
};

// Content Security Policy（必须在 HTML head 中）
// <meta http-equiv="Content-Security-Policy" 
//      content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'">
```

#### 22.3 electron-security 实战案例
- **[electron-rebuild](https://github.com/nicepkg/electron-rebuild)**：确保原生模块安全
- **[electron-notarize](https://github.com/nicepkg/electron-notarize)**：macOS 公证
- **[electronegativity](https://github.com/nicepkg/electronegativity)**：安全检测工具
- **[Electron Fiddle](https://www.electronfiddle.org/)**：安全配置测试

### Day 23：应用打包（Build）

#### 23.1 electron-builder 完整配置
```javascript
// electron-builder.yml
appId: com.mycompany.myapp
productName: MyElectronApp
directories:
  output: release
  buildResources: build

files:
  - dist/**/*
  - "!node_modules/**/*"

# macOS 配置
mac:
  category: public.app-category.productivity
  target:
    - target: dmg
      arch: [x64, arm64]
    - target: zip
  hardenedRuntime: true
  gatekeeperAssess: false
  entitlements: build/entitlements.mac.plist
  entitlementsInherit: build/entitlements.mac.plist
  notarize: true

# Windows 配置
win:
  target:
    - target: nsis
      arch: [x64]
    - target: portable
  certificateSubjectName: 'My Company'
  certificatePassword: '${WIN_CERT_PASSWORD}'
  requestedExecutionLevel: asInvoker  # UAC 级别

# Linux 配置
linux:
  category: Development
  target:
    - target: AppImage
    - target: deb
    - target: rpm
  maintainer: ElectronDocs <dev@example.com>
  desktop:
    Name: MyElectronApp
    Comment: My awesome Electron application
    Categories: Utility;Development;

nsis:
  oneClick: false
  perMachine: false
  allowToChangeInstallationDirectory: true
  installerIcon: build/icon.ico
  uninstallerIcon: build/icon.ico
  installerHeaderIcon: build/installerHeaderIcon.ico
  createDesktopShortcut: true
  createStartMenuShortcut: true
  shortcutName: MyElectronApp

publish:
  provider: github
  owner: myorg
  repo: myapp
```

#### 23.2 打包体积优化
| 优化手段 | 预期效果 | 方法 |
|:---|:---|:---|
| **asar 优化** | 减少文件数量 | 默认已启用 |
| **去除未使用依赖** | -20%~50% | `files` 字段精确匹配 |
| **动态下载依赖** | 减小安装包 | `electron-builder` remote artifacts |
| **native-image 压缩** | -10% | `compression: maximum` |
| **按架构拆分** | 单个包减小一半 | 分别构建 x64/arm64 |
| **精简 Chromium 特性** | -5%~10% | `--disable-features` |
| **Tree Shaking** | 取决于项目 | ESModule + webpack/rollup |
| **资源外置/CDN** | 显著减小 | 首次运行时下载 |

### Day 24：自动更新与签名

#### 24.1 autoUpdater 实现
```javascript
// 参考：VS Code / Discord / Slack 的更新机制
import { autoUpdater } from 'electron-updater';

export function setupAutoUpdater(mainWindow: BrowserWindow) {
  // 检查更新
  autoUpdater.autoDownload = false; // 先让用户确认
  autoUpdater.autoInstallOnAppQuit = true;
  
  autoUpdater.on('update-available', (info) => {
    // 通知渲染进程显示更新弹窗
    mainWindow.webContents.send('update-available', {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });
  
  autoUpdater.on('download-progress', (progress) => {
    mainWindow.webContents.send('download-progress', progress);
  });
  
  autoUpdater.on('update-downloaded', () => {
    mainWindow.webContents.send('update-downloaded');
  });
  
  // 渲染进程触发下载
  ipcMain.handle('download-update', () => autoUpdater.downloadUpdate());
  
  // 渲染进程触发安装重启
  ipcMain.handle('install-update', () => autoUpdater.quitAndInstall());
}
```

#### 24.2 代码签名
```bash
# Windows 代码签名（需要 EV 证书）
# 方式一：electron-builder 自动签名（推荐）
WIN_CERT_PATH="./cert.pfx" WIN_CERT_PASSWORD="xxx" npm run build:win

# 方式二：signtool 手动签名
signtool sign /f cert.pfx /p password /t http://timestamp.digicert.com /fd SHA256 app.exe

# macOS 代码签名 + 公证
codesign --deep --force --verify --verbose --sign "Developer ID Application: Your Name" MyApp.app

# Apple 公证（macOS 10.14.5+ 必要）
xcrun altool --notarize-app --primary-bundle-id "com.myapp" \
  --username "apple@id.com" --password "@keychain:AC_PASSWORD" \
  --file MyApp.dmg
```

### Day 25：分发渠道

#### 25.1 分发方式对比
| 渠道 | 平台 | 优缺点 | 适用场景 |
|:---|:---|:---|:---|
| **GitHub Releases** | 全平台 | 免费、开源友好 | 开源项目首选 |
| **自家 CDN/OSS** | 全平台 | 完全可控 | 商业产品 |
| **微软商店 (MSIX)** | Windows | 自动更新、信任度高 | 企业/面向大众 |
| **Mac App Store** | macOS | 审核严格、分成30% | 大众市场 |
| **Snap Store** | Linux Ubuntu | 自动更新、沙箱 | Linux 发行版 |
| **Flathub** | Linux 通用 | Flatpak 格式 | 跨发行版 |
| **AUR** | Linux Arch | Arch 用户群 | Arch/Manjaro |

#### 25.2 CI/CD 自动发布流程
```yaml
# GitHub Actions 示例
name: Build & Release
on:
  push:
    tags: ['v*']

jobs:
  build:
    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]
    runs-on: ${{ matrix.os }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      
      - run: pnpm install
      - run: pnpm run build
      
      - name: Build Electron App
        uses: nick-fields/retry@v3
        with:
          timeout_minutes: 30
          max_attempts: 3
          command: pnpm run dist
        
      - name: Upload Release Assets
        uses: softprops/action-gh-release@v1
        with:
          files: release/*.exe,release/*.dmg,release/*.AppImage,release/*.deb,release/*.rpm
```

---

## L7：工程化与架构实战（第26-30天）

### Day 26：大型项目架构设计

#### 26.1 参考架构：VS Code 的分层设计
```
vscode/src/
├── vs/base/              # 基础层：公共工具、事件总线、生命周期
├── vs/platform/          # 平台服务层：日志、配置、存储、环境检测
├── vs/editor/            # Monaco 编辑器核心
├── vs/workbench/         # 工作台 Shell：窗口、面板、布局引擎
├── vs/workbench/apps/    # 入口点：workbench.desktop.main.ts
├── vs/code/              # Electron 主进程入口
└── extensions/           # 内置扩展
```

**架构原则提炼**：
1. **关注点分离**：Base → Platform → Workbench → Extensions
2. **依赖注入**：通过 ServiceCollection 管理依赖关系
3. **事件驱动**：EventBus 解耦模块间通信
4. **渐进式加载**：按需激活服务和扩展

#### 26.2 推荐的项目结构
```
my-large-electron-app/
├── packages/
│   ├── shared/           # 共享类型、常量、utils
│   ├── main/             # 主进程（纯 Node.js 逻辑）
│   │   ├── services/     # 服务层（文件系统、网络、数据库）
│   │   ├── windows/      # 窗口管理
│   │   └── ipc/          # IPC handlers 注册
│   ├── preload/          # 预加载脚本
│   └── renderer/         # 前端应用（React/Vue）
│       ├── pages/        # 页面路由
│       ├── components/   # UI 组件库
│       ├── stores/       # 状态管理
│       └── hooks/        # 自定义 hooks
├── electron/             # Electron 专用配置
│   ├── main.ts           # 入口
│   └── config.ts         # 窗口/应用配置
├── resources/            # 静态资源（图标、模板）
├── build/                # 构建配置
│   ├── electron-builder.yml
│   └── vite.config.ts    # electron-vite 配置
├── tests/
│   ├── e2e/              # 端到端测试
│   ├── unit/             # 单元测试
│   └── integration/      # 集成测试
└── scripts/              # 构建辅助脚本
```

### Day 27：测试策略

#### 27.1 Electron 测试金字塔
```
                    ╱╲
                   ╱ E2E╲          ← Playwright / Spectron / WDIO
                  ╱──────╲
                 ╱ Integration╲    ← 主进程+渲染进程联合测试
                ╱──────────────╲
               ╱    Unit Tests   ╲  ← Vitest / Jest
              ╱────────────────────╲
```

#### 27.2 各层测试方案
| 层级 | 工具 | 测试对象 | 速度 |
|:---|:---|:---|:---:|
| 单元测试 | Vitest / Jest | 纯函数、工具类 | ⚡ ms |
| 组件测试 | Testing Library | React/Vue 组件 | ⚡ ms |
| 主进程单元 | Vitest (with jsdom) | IPC handlers、Services | ~ms |
| 集成测试 | Playwright + electron | IPC 往返、窗口行为 | ~秒 |
| E2E 测试 | Playwright | 完整用户流程 | 秒~分钟 |
| 视觉回归 | Percy / Applitools | UI 截图对比 | 分钟 |

#### 27.3 Playwright + Electron 测试示例
```typescript
import { _electron as electron } from 'playwright';
import test from '@playwright/test';

test.describe('Application', () => {
  let app;
  
  test.beforeAll(async () => {
    app = await electron.launch({
      args: ['.'],
      env: { NODE_ENV: 'test', ...process.env },
    });
  });

  test.afterAll(async () => await app.close());

  test('creates and opens a new window', async () => {
    const window = app.firstWindow();
    await window.waitForLoadState('domcontentloaded');
    
    // 断言
    const title = await window.title();
    expect(title).toBe('My Electron App');
    
    // 截图
    await window.screenshot({ path: 'home-page.png' });
  });

  test('menu items work correctly', async () => {
    const isMac = process.platform === 'darwin';
    // 测试菜单点击后的行为
  });
});
```

### Day 28：插件/扩展系统

#### 28.1 扩展架构设计
```
┌────────────────────────────────────────────────┐
│                  Host Application               │
│                                                │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐    │
│  │ Extension │  │ Extension │  │ Extension  │    │
│  │   A       │  │   B       │  │    C       │    │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘    │
│        │             │              │            │
│  ┌─────▼─────────────▼──────────────▼─────────┐ │
│  │          Extension Host (Sandboxed)        │ │
│  │  ┌──────────────────────────────────────┐  │ │
│  │  │   Extension API (contribution points) │  │ │
│  │  │   - commands                         │  │ │
│  │  │   - menus                            │  │ │
│  │  │   - views/sidebar/panel              │  │ │
│  │  │   - languages/theme/icons            │  │ │
│  │  │   - keybindings                      │  │ │
│  │  └──────────────────────────────────────┘  │ │
│  └───────────────────────────────────────────┘ │
└────────────────────────────────────────────────┘
```

**📌 参考实现**：
- **VS Code 扩展系统**：业界最成熟的扩展架构
  - `package.json` 中的 `contributes` 声明式注册
  - Extension Host 沙箱隔离
  - API 表面积严格控制
  - 生命周期管理（activate/deactivate）
- **Obsidian 插件系统**：社区驱动的插件生态
  - `community-plugins.json` 管理
  - API 相对简单易上手

#### 28.2 最简扩展宿主实现
```typescript
// extension-host.ts
interface ExtensionManifest {
  id: string;
  name: string;
  version: string;
  main?: string;          // 入口文件
  contributes?: {         // 声明式贡献点
    commands?: CommandContribution[];
    menus?: MenuContribution[];
    views?: ViewContribution[];
  };
}

class ExtensionHost {
  #extensions = new Map<string, LoadedExtension>();
  #api: ExtensionAPI;
  
  constructor(api: ExtensionAPI) { this.#api = api; }
  
  async load(extensionPath: string) {
    const manifest = JSON.parse(
      await fs.readFile(path.join(extensionPath, 'package.json'), 'utf-8')
    );
    
    // 1. 注册声明式贡献（menus、commands、views）
    this.registerContributions(manifest.contributes);
    
    // 2. 激活扩展入口（如果有）
    if (manifest.main) {
      const entryPoint = path.join(extensionPath, manifest.main);
      const extensionModule = require(entryPoint);
      const activate = extensionModule.activate || extensionModule.default;
      if (typeof activate === 'function') {
        await activate(this.#api);  // 传入受限 API 对象
      }
    }
  }
}
```

### Day 29：国际化（i18n）

#### 29.1 国际化方案
```typescript
// 方案：i18next（最流行）
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

i18next.use(initReactI18next).init({
  lng: app.getLocale() || 'zh-CN',  // 读取系统语言
  fallbackLng: 'en',
  resources: {
    'zh-CN': { translation: zhCN },
    'en': { translation: enUS },
    'ja': { translation: jaJP },
  },
});

// Electron 语言变化监听
app.on('locale-updated', () => {
  i18next.changeLanguage(app.getLocale());
});

// macOS 语言偏好变化
app.on('language-updated', () => {
  // 刷新 UI
});
```

#### 29.2 Electron 特有的 i18n 注意事项
| 项目 | 说明 |
|:---|:---|
| 菜单国际化 | `Menu.buildFromTemplate()` 需要重新构建 |
| 系统对话框 | `dialog.showOpenDialog` 的 `title` 参数 |
| 通知内容 | `Notification` body 文本 |
| 应用名称 | 不同语言可能需要不同名称 |
| RTL 布局 | Arabic/Hebrew 需要从右到左布局 |
| 数字/日期格式 | 使用 Intl API 或 dayjs/locale |

### Day 30：毕业项目 — 从零打造你的 Electron 应用

#### 30.1 项目选项（任选其一或自定）
| 项目 | 难度 | 涉及技术点 |
|:---|:---:|:---|
| **类 Notion 笔记应用** | ⭐⭐⭐⭐ | 文件系统、SQLite、搜索、导出、同步 |
| **类 Postman API 工具** | ⭐⭐⭐⭐ | HTTP 客户端、环境变量、集合管理、历史记录 |
| **本地 Git GUI 客户端** | ⭐⭐⭐⭐⭐ | git 原生调用、diff 查看、分支可视化、提交管理 |
| **密码管理器（类 Bitwarden）** | ⭐⭐⭐⭐⭐ | 加密存储、自动填充、云同步、生物识别解锁 |
| **Markdown 博客写作工具** | ⭐⭐⭐ | 实时预览、图床上传、SEO 检查、一键发布 |

#### 30.2 满分交付标准
- [ ] 完整的多窗口架构
- [ ] 类型安全的 IPC 通信体系
- [ ] 自定义标题栏 + 窗口状态持久化
- [ ] 至少集成一项系统能力（文件/通知/托盘/快捷键）
- [ ] 安全检查全部通过
- [ ] 跨平台打包（Windows + macOS + Linux 至少两个）
- [ ] 自动更新机制
- [ ] CI/CD 自动构建发布
- [ ] 单元测试覆盖率 > 70%
- [ ] E2E 测试覆盖核心流程
- [ ] 国际化至少支持中文+英文
- [ ] 完整的 README + 用户文档

---

## 📚 附录

### A. 推荐学习资源

| 资源 | 类型 | 链接 | 说明 |
|:---|:---|:---|:---|
| Electron 官方文档 | 官方 | https://www.electronjs.org/docs/latest | 最权威的资料 |
| Electron Fiddle | 工具 | https://www.electronfiddle.org/ | 实时试玩 Electron API |
| VS Code 源码 | 开源项目 | https://github.com/microsoft/vscode | 学习架构设计的最佳范本 |
| Electron Weekly | 周刊 | https://electronweekly.com/ | 行业动态 |
| Awesome Electron | 合集 | https://github.com/sindresorhus/awesome-electron | 资源大全 |

### B. 常用第三方库索引

| 分类 | 库名 | 用途 | Stars |
|:---|:---|:---|---:|
| 构建工具 | electron-vite | 开发构建一体化 | ⭐ 5k+ |
| 构建工具 | electron-forge | 官方脚手架 | ⭐ 12k+ |
| 构建工具 | electron-builder | 打包分发 | ⭐ 14k+ |
| 更新 | electron-updater | 自动更新 | ⭐ 1.5k+ |
| 存储 | electron-store | 简单持久化 | ⭐ 4k+ |
| 数据库 | better-sqlite3 | 同步 SQLite | ⭐ 12k+ |
| 日志 | electron-log | 日志管理 | ⭐ 3k+ |
| 菜单 | electron-context-menu | 右键菜单 | ⭐ 800+ |
| 调试 | electron-debug | 开发辅助 | ⭐ 600+ |
| 安全 | electron-is-dev | 环境判断 | ⭐ 200+ |
| DnD | electron-drag | 拖拽增强 | ⭐ 400+ |
| 窗口 | electron-window-state | 窗口状态恢复 | ⭐ 700+ |
| 跨域 | CORS | 主进程代理 | — |
| UI | electron-log | 日志查看器 | — |

### C. 版本兼容性速查

| Electron | Chromium | Node.js | 发布时间 | 状态 |
|:---:|:---:|:---:|:---:|:---:|
| 33 | 133+ | 22.x | 2025 Q1 | 当前稳定 |
| 32 | 130+ | 22.x | 2024 Q4 | LTS |
| 31 | 128+ | 20.x | 2024 Q3 | 维护 |
| 30 | 124+ | 20.x | 2024 Q2 | EOL |
| 28 | 120+ | 18.x | 2024 Q1 | EOL |
| 27 | 118+ | 18.x | 2023 Q4 | EOL |
| 26 | 116+ | 18.x | 2023 Q3 | EOL |
| 25 | 114+ | 18.x | 2023 Q2 | EOL |

### D. Electron 替代方案对比

| 方案 | 语言 | 包大小 | 内存占用 | 生态成熟度 | 适合场景 |
|:---|:---|:---|:---|:---|:---:|:---|
| **Electron** | JS/TS | ~150MB+ | 高 (~200MB+) | ★★★★★ | 功能丰富的大型应用 |
| **Tauri 2.0** | Rust + 前端 | ~5MB | 低 (~30MB) | ★★★☆☆ | 轻量级、注重性能的应用 |
| **Flutter Desktop** | Dart | ~50MB | 中 | ★★★★☆ | 移动端优先的跨平台 |
| **.NET MAUI** | C#/XAML | ~80MB | 中 | ★★★☆☆ | 企业级 Windows 应用 |
| **Qt/QML** | C++/QML | ~30MB | 低 | ★★★★★ | 嵌入式/工业软件 |
| **PWA + TWA** | Web 技术 | 0 | 浏览器 | ★★☆☆☆ | 轻量级工具型 |

---

> **最后更新时间**：2026年4月
> 
> 📌 本大纲由 APP移动开发公众号整理制作，欢迎关注获取更多跨平台开发干货！
