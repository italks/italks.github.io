# 多窗口架构管理实战：从 VS Code 学会设计窗口体系

> **阅读时长**：约 20 分钟 | **难度**：⭐⭐⭐ 中级 | **本系列**：L2/Day 5
> **前置知识**：Day 4 IPC 通信

昨天我们搞懂了 IPC 通信的全部模式。但一个 Electron 应用通常不止一个窗口——主窗口、设置页、预览窗、调试面板……如何优雅地管理这些窗口？今天我们就来学习**多窗口架构设计**，参考 VS Code 的成熟方案。

---

## 一、多窗口场景全览

### 1.1 你的应用可能需要这些窗口

| 窗口类型 | 说明 | 参考案例 |
|:---|:---|:---|
| **主窗口（Main Window）** | 应用的核心界面 | 所有应用都有 |
| **偏好/设置窗口** | 用户配置界面 | VS Code、Slack |
| **子编辑器窗口** | 拖出的编辑器标签 | VS Code、Sublime Text |
| **预览窗口** | 图片/PDF 预览 | Figma、Notion |
| **模态对话框** | 确认操作、表单输入 | 通用 |
| **关于窗口** | 版本信息 | 通用 |
| **Splash Screen** | 启动加载画面 | VS Code、Discord |

### 1.2 多窗口带来的挑战

```
单窗口时代：
  一个 main.js → 创建一个 BrowserWindow → 完事 ✅

多窗口时代的噩梦：
  ❌ 谁负责创建？什么时候创建？
  ❌ 窗口之间怎么通信？
  ❌ 关闭一个不影响其他的？
  ❌ 如何记住每个窗口的位置大小？
  ❌ 主进程崩溃了所有窗口都挂？
  ❌ 内存占用随窗口数线性增长？
```

---

## 二、VS Code 的多窗口架构解析

### 2.1 VS Code 窗口模型

VS Code 是业界最复杂的多窗口 Electron 应用之一，它的设计值得深入研究：

```
VS Code 多窗口架构：

┌──────────────────────────────────────────────┐
│                 Main Process                  │
│                                              │
│   ┌─────────────┐    ┌──────────────────┐    │
│   │ Window A     │    │ Window B          │    │
│   │ (主工作区)     │    │ (第二工作区实例)     │    │
│   │              │    │                   │    │
│   │ ┌──────────┐ │    │ ┌─────────────┐  │    │
│   │ │ Editor    │ │    │ │ Editor       │  │    │
│   │ │ Group 1   │ │    │ │             │  │    │
│   │ ├──────────┤ │    │ ├─────────────┤  │    │
│   │ │ Editor    │ │    │ │ Preview      │  │    │
│   │ │ Group 2   │ │    │ │ Window       │  │    │
│   │ └──────────┘ │    │ └─────────────┘  │    │
│   │              │    │                   │    │
│   │ [Sidebar]    │    │                   │    │
│   │ [Panel]      │    │                   │    │
│   └─────────────┘    └──────────────────┘    │
│                                              │
│   ┌──────┐  ┌────────┐  ┌──────┐            │
│   │Search│  │Debug  │  │Output│  ...        │  ← Panel 可独立为窗口
│   └──────┘  └────────┘  └──────┘            │
│                                              │
│   ┌──────────────────────────┐               │
│   │ Settings UI (独立窗口)    │               │  ← 设置页也是独立窗口
│   └──────────────────────────┘               │
└──────────────────────────────────────────────┘
```

**核心设计原则**：
1. **每个工作区是一个独立的 BrowserWindow**
2. **Panel 可以"拆出"为独立窗口**
3. **设置页面是独立的轻量级窗口**
4. **所有窗口共享同一个主进程**

### 2.2 VS Code 的关键代码参考

```typescript
// VS Code src/vs/platform/window/electron-main/window.ts （简化版）

interface ICodeWindow {
  id: number;
  win: BrowserWindow;
  config: WindowConfiguration;
  
  // 窗口状态管理
  whenReady(): Promise<void>;
  focus(): void;
  close(): void;
  send(channel: string, ...args: any[]): void;
}

class WindowManager {
  private windows = new Map<number, ICodeWindow>();
  
  async open(config: WindowConfiguration): Promise<ICodeWindow> {
    // 复用已有或创建新窗口
    const existing = this.findReusableWindow(config);
    if (existing) return existing;
    
    return this.createNewWindow(config);
  }
}
```

---

## 三、构建你的 WindowManager 类

下面是一个生产级别的 WindowManager 实现，融合了 VS Code 和 Obsidian 的设计思想。

### 3.1 核心实现

```typescript
// src/main/services/WindowManager.ts
import {
  app,
  BrowserWindow,
  BrowserWindowConstructorOptions,
  screen,
} from 'electron';
import * as path from 'path';

/** 窗口类型枚举 */
export enum WindowType {
  MAIN = 'main',           // 主窗口
  SETTINGS = 'settings',   // 设置窗口
  PREVIEW = 'preview',     // 预览窗口
  MODAL = 'modal',         // 模态对话框
  ABOUT = 'about',         // 关于窗口
  SPLASH = 'splash',       // 启动画面
}

/** 窗口配置接口 */
export interface WindowConfig extends BrowserWindowConstructorOptions {
  type: WindowType;                    // 窗口类型
  id?: string;                         // 唯一标识（用于复用）
  route?: string;                      // 渲染进程路由路径
  parent?: BrowserWindow;              // 父窗口（模态窗口用）
  singleton?: boolean;                 // 是否单例（同一 ID 只创建一次）
  persistState?: boolean;              // 是否持久化位置大小
}

/** 窗口包装器 */
interface ManagedWindow {
  config: WindowConfig;
  win: BrowserWindow;
  createdAt: number;
  lastFocusedAt: number;
}

/**
 * WindowManager — 统一管理所有窗口的创建、查找、销毁和状态持久化
 */
class WindowManager {
  private windows = new Map<string, ManagedWindow>();
  private mainWindowId: string | null = null;

  /**
   * 创建或获取窗口
   */
  async createOrGet(config: WindowConfig): Promise<BrowserWindow> {
    // 单例模式：如果已存在则聚焦并返回
    if (config.singleton && config.id) {
      const existing = this.get(config.id);
      if (existing) {
        existing.win.focus();
        return existing.win;
      }
    }

    const win = await this.createWindow(config);
    this.windows.set(config.id || `win_${Date.now()}`, {
      config,
      win,
      createdAt: Date.now(),
      lastFocusedAt: Date.now(),
    });

    // 记录主窗口引用
    if (config.type === WindowType.MAIN) {
      this.mainWindowId = config.id || `main_${Date.now()}`;
    }

    return win;
  }

  /**
   * 创建窗口的核心方法
   */
  private async createWindow(config: WindowConfig): Promise<BrowserWindow> {
    // 合并默认配置
    const defaults = this.getDefaultOptionsByType(config);
    const options: BrowserWindowConstructorOptions = {
      ...defaults,
      ...config,
      webPreferences: {
        ...(defaults.webPreferences as any),
        ...(config.webPreferences as any),
        preload: path.join(__dirname, '../preload/index.js'),
      },
    };

    const win = new BrowserWindow(options);

    // 加载页面
    if (process.env['ELECTRON_RENDERER_URL']) {
      const baseUrl = process.env['ELECTRON_RENDERER_URL'];
      win.loadURL(
        config.route ? `${baseUrl}/${config.route}` : baseUrl
      );
    } else {
      win.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // 事件监听
    this.setupWindowEvents(win, config);

    return win;
  }

  /**
   * 根据窗口类型返回默认配置
   */
  private getDefaultOptionsByType(config: WindowConfig): Partial<WindowConfig> {
    const { type } = config;
    const display = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = display.workAreaSize;

    switch (type) {
      case WindowType.MAIN:
        return {
          width: Math.min(1280, Math.floor(screenWidth * 0.85)),
          height: Math.min(800, Math.floor(screenHeight * 0.85)),
          minWidth: 900,
          minHeight: 600,
          show: false,         // 就绪后再显示
          autoHideMenuBar: true,
        };

      case WindowType.SETTINGS:
        return {
          width: 720,
          height: 560,
          resizable: false,
          minimizable: false,
          maximizable: false,
          parent: config.parent,
          modal: !!config.parent,
          show: false,
          autoHideMenuBar: true,
        };

      case WindowType.PREVIEW:
        return {
          width: 640,
          height: 480,
          minWidth: 400,
          minHeight: 300,
          show: false,
        };

      case WindowType.MODAL:
        return {
          width: 480,
          height: 320,
          resizable: false,
          parent: config.parent,
          modal: true,          // 模态！阻塞父窗口
          show: false,
        };

      case WindowType.ABOUT:
        return {
          width: 420,
          height: 360,
          resizable: false,
          minimizable: false,
          maximizable: false,
          parent: config.parent,
          modal: false,
          show: false,
        };

      case WindowType.SPLASH:
        return {
          width: 400,
          height: 220,
          frame: false,        // 无边框
          transparent: true,
          alwaysOnTop: true,
          resizable: false,
          minimizable: false,
          maximizable: false,
          skipTaskbar: true,   // 不在任务栏显示
          show: false,
        };

      default:
        return { width: 800, height: 600 };
    }
  }

  /**
   * 为窗口绑定事件
   */
  private setupWindowEvents(win: BrowserWindow, config: WindowConfig) {
    // 页面就绪后显示（避免白屏）
    win.once('ready-to-show', () => {
      if (config.type !== WindowType.SPLASH) {
        win.show();
      }
    });

    // 记录最后聚焦时间
    win.on('focus', () => {
      const managed = this.findByWin(win);
      if (managed) managed.lastFocusedAt = Date.now();
    });

    // 清理关闭的窗口
    win.on('closed', () => {
      for (const [id, mw] of this.windows.entries()) {
        if (mw.win === win) {
          this.windows.delete(id);
          
          // 如果是主窗口关闭，清理其他窗口（可选）
          if (config.type === WindowType.MAIN && !app.isQuitting) {
            // macOS 上不退出，其他平台可选
            if (process.platform !== 'darwin') {
              app.quit(); // 或只关闭其他非必要窗口
            }
          }
          break;
        }
      }
    });
  }

  // ==================== 查询方法 ====================

  /** 通过 ID 获取窗口 */
  get(id: string): ManagedWindow | undefined {
    return this.windows.get(id);
  }

  /** 通过 BrowserWindow 实例获取 */
  findByWin(win: BrowserWindow): ManagedWindow | undefined {
    for (const mw of this.windows.values()) {
      if (mw.win === win) return mw;
    }
    return undefined;
  }

  /** 获取主窗口 */
  getMainWindow(): BrowserWindow | null {
    if (!this.mainWindowId) return null;
    const mw = this.windows.get(this.mainWindowId);
    return mw?.win || null;
  }

  /** 获取某类型的所有窗口 */
  getByType(type: WindowType): ManagedWindow[] {
    return Array.from(this.windows.values()).filter(mw => mw.config.type === type);
  }

  /** 获取所有窗口 */
  getAll(): ManagedWindow[] {
    return Array.from(this.windows.values());
  }

  /** 窗口总数 */
  count(): number {
    return this.windows.size;
  }

  // ==================== 操作方法 ====================

  /** 聚焦指定窗口 */
  focus(id: string) {
    this.windows.get(id)?.win.focus();
  }

  /** 关闭指定窗口 */
  close(id: string) {
    this.windows.get(id)?.win.close();
  }

  /** 关闭所有窗口 */
  closeAll() {
    for (const [, mw] of this.windows) {
      if (!mw.win.isDestroyed()) {
        mw.win.close();
      }
    }
  }

  /** 广播消息到所有窗口 */
  broadcast(channel: string, ...args: any[]) {
    for (const [, mw] of this.windows) {
      if (!mw.win.isDestroyed() && !mw.win.webContents.isDestroyed()) {
        mw.win.webContents.send(channel, ...args);
      }
    }
  }
}

// 导出单例
export const windowManager = new WindowManager();
```

### 3.2 在主进程中使用 WindowManager

```typescript
// src/main/index.ts
import { app, BrowserWindow } from 'electron';
import { windowManager, WindowType } from './services/WindowManager';
import './ipc/handlers';  // 注册 IPC handlers

app.whenReady().then(async () => {
  // 1. 创建主窗口
  const mainWindow = await windowManager.createOrGet({
    type: WindowType.MAIN,
    id: 'main',
    singleton: true,
    persistState: true,
  });

  // macOS Dock 点击重建窗口
  app.on('activate', () => {
    windowManager.createOrGet({
      type: WindowType.MAIN,
      id: 'main',
      singleton: true,
    });
  });
});

// 注册打开设置的 IPC handler
import { ipcMain } from 'electron';

ipcMain.handle('window:openSettings', async (event) => {
  const parentWin = BrowserWindow.fromWebContents(event.sender);
  
  return windowManager.createOrGet({
    type: WindowType.SETTINGS,
    id: 'settings',
    singleton: true,
    parent: parentWin ?? windowManager.getMainWindow() ?? undefined,
  });
});

ipcMain.handle('window:openPreview', async (_event, filePath: string) => {
  // 预览窗口不是单例，每次创建新的
  return windowManager.createOrGet({
    type: WindowType.PREVIEW,
    id: `preview_${Date.now()}`,  // 每个 ID 不同
    singleton: false,
    route: `/preview?file=${encodeURIComponent(filePath)}`,
  });
});
```

---

## 四、窗口状态持久化

用户最讨厌的就是：**每次打开窗口都要重新调位置和大小**。VS Code 和 Obsidian 都很好地解决了这个问题。

### 4.1 使用 electron-store + electron-window-state

```bash
npm install electron-store electron-window-state
```

```typescript
// src/main/services/WindowStateService.ts
import Store from 'electron-store';
import windowStateKeeper from 'electron-window-state';
import { BrowserWindow, screen, app } from 'electron';

interface WindowStateData {
  x?: number;
  y?: number;
  width: number;
  height: number;
  isMaximized: boolean;
  isFullscreen: boolean;
}

const store = new Store({
  name: 'window-states',  // 存储文件名
  defaults: {},
});

/**
 * 管理窗口状态的保存与恢复
 */
export class WindowStateService {

  /**
   * 为窗口恢复状态
   */
  restore(windowKey: string, defaultWidth = 1000, defaultHeight = 700) {
    const savedState = store.get(windowKey) as WindowStateData | undefined;
    
    let state;
    
    if (savedState) {
      // 检查屏幕边界（防止在断开显示器后恢复到不可见区域）
      const validated = this.validateBounds(savedState);
      
      state = windowStateKeeper({
        defaultWidth: validated.width || defaultWidth,
        defaultHeight: validated.height || defaultHeight,
        x: validated.x,
        y: validated.y,
        file: undefined,  // 不使用文件存储，改用我们的 store
      });
    } else {
      state = windowStateKeeper({
        defaultWidth,
        defaultHeight,
        file: undefined,
      });
    }

    return state;
  }

  /**
   * 保存窗口状态
   */
  save(windowKey: string, win: BrowserWindow) {
    const bounds = win.getBounds();
    
    store.set(windowKey, {
      x: bounds.x,
      y: bounds.y,
      width: bounds.size[0],
      height: bounds.size[1],
      isMaximized: win.isMaximized(),
      isFullscreen: win.isFullScreen(),
    } as WindowStateData);
  }

  /**
   * 验证窗口位置是否在可见区域内
   */
  private validateBounds(state: WindowStateData): WindowStateData {
    const displays = screen.getAllDisplays();
    const hasVisibleDisplay = displays.some(display => {
      const area = display.workArea;
      return (
        state.x !== undefined &&
        state.y !== undefined &&
        state.x >= area.x &&
        state.y >= area.y &&
        state.x < area.x + area.width &&
        state.y < area.y + area.height
      );
    });

    if (!hasVisibleDisplay) {
      // 重置到主显示器居中
      const primary = screen.getPrimaryDisplay().workAreaSize;
      return {
        width: state.width || primary.width * 0.7,
        height: state.height || primary.height * 0.75,
        isMaximized: state.isMaximized,
        isFullscreen: false,
      };
    }

    return state;
  }
}

export const windowStateService = new WindowStateService();
```

### 4.2 集成到 WindowManager

```typescript
// 在 createWindow 方法中集成状态恢复
private async createWindow(config: WindowConfig): Promise<BrowserWindow> {
  const windowKey = config.id || `unknown`;
  const state = config.persistState 
    ? windowStateService.restore(windowKey)
    : null;

  const defaults = this.getDefaultOptionsByType(config);

  // 如果有保存的状态，合并进去
  const options: BrowserWindowConstructorOptions = {
    ...defaults,
    ...config,
    ...(state ? {
      x: state.x,
      y: state.y,
      width: state.width,
      height: state.height,
    } : {}),
    webPreferences: {
      ...(defaults.webPreferences as any),
      ...(config.webPreferences as any),
      preload: path.join(__dirname, '../preload/index.js'),
    },
  };

  const win = new BrowserWindow(options);

  // 如果之前是最大化状态
  if (state?.isMaximized) {
    win.maximize();
  }

  // 监听变化并保存
  if (config.persistState) {
    // 使用 windowStateKeeper 的管理
    if (state) {
      state.manage(win);
    }
    
    // 定期保存额外状态
    const saveInterval = setInterval(() => {
      if (!win.isDestroyed()) {
        windowStateService.save(windowKey, win);
      } else {
        clearInterval(saveInterval);
      }
    }, 2000);  // 每 2 秒保存一次
  }

  return win;
}
```

---

## 五、窗口间通信方案

多个窗口之间怎么交换数据？这里有几种策略。

### 5.1 方案对比

| 方案 | 适用场景 | 复杂度 |
|:---|:---|:---:|
| **通过主进程中转** | 最通用，推荐 | ⭐⭐ |
| **BroadcastChannel** | Electron 28+，同源渲染进程间 | ⭐ |
| **共享数据层（Store）** | 全局状态同步 | ⭐⭐⭐ |
| **MessagePort** | 大数据量传输 | ⭐⭐⭐ |

### 5.2 推荐：主进程广播模式

```typescript
// 在 WindowManager 中已有 broadcast 方法
// 使用方式：

// 窗口 A 触发事件 → 主进程 → 广播给所有窗口

// 窗口 A（发送方）
await window.api.triggerGlobalEvent('theme-changed', { theme: 'dark' });

// 主进程 handler
ipcMain.handle('app:broadcast', (event, channel, data) => {
  windowManager.broadcast(channel, data);  // 发给除发送者外的所有窗口
  return true;
});

// 窗口 B / C / D（接收方）
useEffect(() => {
  const unsub = window.electronAPI.on('theme-changed', ({ theme }) => {
    setTheme(theme);  // 自动更新 UI
  });
  return unsub;
}, []);
```

### 5.3 共享 Store 模式（高级）

```typescript
// src/main/services/SharedStore.ts — 进程间共享状态
import { BrowserWindow } from 'electron';
import { windowManager } from './WindowManager';

type StoreListener = (key: string, value: any, oldValue: any) => void;

class SharedStore {
  private data = new Map<string, any>();
  private listeners = new Set<StoreListener>();

  set(key: string, value: any) {
    const oldValue = this.data.get(key);
    this.data.set(key, value);
    
    // 通知所有监听者（包括跨窗口）
    this.listeners.forEach(fn => fn(key, value, oldValue));
    
    // 广播到所有渲染进程
    windowManager.broadcast('store:changed', { key, value, oldValue });
  }

  get(key: string): any {
    return this.data.get(key);
  }

  subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getAll(): Record<string, any> {
    return Object.fromEntries(this.data);
  }
}

export const sharedStore = new SharedStore();

// 使用示例
sharedStore.set('user.name', 'Alice');
sharedStore.set('app.theme', 'dark');
sharedStore.subscribe((key, value, old) => {
  console.log(`[${key}] ${JSON.stringify(old)} → ${JSON.stringify(value)}`);
});
```

---

## 六、Splash Screen（启动画面）实现

很多专业应用都有 Splash Screen 来掩盖启动加载时间。

```typescript
// src/main/splash.ts
import { BrowserWindow } from 'electron';
import { windowManager, WindowType } from './services/WindowManager';

let splashWin: BrowserWindow | null = null;

export function showSplashScreen() {
  splashWin = new BrowserWindow({
    width: 420,
    height: 240,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
    },
  });

  // 开发环境
  if (process.env['ELECTRON_RENDERER_URL']) {
    splashWin.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/splash.html`);
  } else {
    splashWin.loadFile(path.join(__dirname, '../renderer/splash.html'));
  }

  splashWin.show();
}

export function hideSplashScreen() {
  if (splashWin && !splashWin.isDestroyed()) {
    splashWin.close();
    splashWin = null;
  }
}

// 在主入口中使用
// app.whenReady().then(() => {
//   showSplashScreen();
//
//   // 异步初始化完成后...
//   initDatabase().then(() => {
//     loadPlugins().then(() => {
//       createMainWindow().then(() => {
//         hideSplashScreen();  // 关闭启动画面，显示主窗口
//       });
//     });
//   });
// });
```

对应的 `splash.html`：

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      margin: 0; padding: 0;
      background: transparent;
      display: flex; align-items: center; justify-content: center;
      font-family: -apple-system, sans-serif;
      user-select: none;
    }
    .container {
      text-align: center;
      color: white;
    }
    .logo { font-size: 48px; margin-bottom: 16px; }
    .title { font-size: 22px; font-weight: 700; opacity: 0.9; }
    .subtitle { font-size: 13px; opacity: 0.5; margin-top: 8px; }
    .loader {
      width: 180px; height: 3px; background: rgba(255,255,255,0.15);
      border-radius: 2px; margin-top: 24px; overflow: hidden;
    }
    .bar {
      height: 100%; background: linear-gradient(90deg, #478cbf, #667eea);
      animation: loading 1.8s ease-in-out infinite;
      border-radius: 2px;
    }
    @keyframes loading {
      0% { width: 0%; transform: translateX(0); }
      50% { width: 60%; }
      100% { width: 100%; transform: translateX(0); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="logo">🚀</div>
    <div class="title">My App</div>
    <div class="subtitle">正在准备...</div>
    <div class="loader"><div class="bar"></div></div>
  </div>
</body>
</html>
```

---

## 七、常见问题排查

| 问题 | 原因 | 解决方案 |
|:---|:---|:---|
| 窗口白屏时间过长 | 页面资源大 | 用 ready-to-show 再 show；加 Splash Screen |
| 打开多个窗口后内存飙升 | 每个窗口有完整 Chromium | 及时 close 不用的窗口；考虑复用隐藏窗口 |
| 模态窗口没阻塞父窗口 | 缺少 `modal: true` | 配置项加上 `modal: true` + `parent` |
| 窗口位置恢复到屏幕外 | 外接显示器拔掉了 | validateBounds 检查并重置到主屏 |
| 子窗口关不掉 | 没正确处理 closed 事件 | 确保 WindowManager 清理了 map |

---

## 八、今日总结

| 要点 | 内容 |
|:---|:---|
| **WindowManager 类** | 统一管理窗口生命周期，支持按类型/ID 查找、创建、关闭、广播 |
| **窗口类型系统** | Main / Settings / Preview / Modal / About / Splash 各有不同的默认配置 |
| **状态持久化** | electron-window-state + 自定义验证（防止恢复到屏幕外） |
| **窗口间通信** | 主进程 broadcast 是最实用的方案 |
| **Splash Screen** | 无边框透明窗口 + 动画 loader，提升启动体验 |
| **VS Code 参考** | 每个工作区独立 BrowserWindow，Panel 可拆出 |

### 下节预告：Day 6 —— 高级通信模式（MessagePort 与跨窗口通信）

明天我们将深入 Electron 28+ 的新特性：
- MessagePort 双向流式传输
- BroadcastChannel 跨窗口通信
- Transferable 对象零拷贝传递
- 大文件的流式读写方案

---

> 💬 你在开发中遇到过多窗口管理的坑吗？评论区分享！
> 👨‍💻 **系列教程持续更新**，关注「APP移动开发」不错过。
> ❤️ 有帮助的话点个"在看"吧 👇
