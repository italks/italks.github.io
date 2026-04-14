# L2 毕业项目：从零打造简易记事本（完整可运行项目）

> **阅读时长**：约 35 分钟 | **难度**：⭐⭐⭐⭐ 实战 | **本系列**：L2/Day 7（L2 阶段毕业项目）
> **前置要求**：完成 L1 全部 + Day 2-6 的内容
> **最终产出**：一个完整的多标签编辑器应用

欢迎来到 L2 的最后一天！前六天我们学习了 Electron 的核心架构、IPC 通信、多窗口管理、高级通信模式。今天要把所有知识融会贯通，**从零构建一个真正可以使用的简易记事本应用**——它将具备 VS Code 编辑器组的雏形。

---

## 项目概览

### 功能清单

| 功能模块 | 具体功能 |
|:---|:---|
| 📝 **多标签编辑** | 打开/关闭/切换多个文件标签页 |
| 💾 **文件操作** | 新建、打开、保存、另存为 |
| 🔍 **文件浏览** | 左侧目录树 + 文件列表 |
| ⌨️ **快捷键** | Ctrl+N/S/O/W 等常用快捷键 |
| ⚙️ **设置窗口** | 独立设置窗口（主题/字体/编辑器选项） |
| 📊 **状态栏** | 行列信息、编码、文件大小、修改状态 |
| 💾 **自动保存** | 可选的定时自动保存功能 |
| 🔄 **外部变更检测** | 文件被外部修改时提示重新加载 |
| 🪟 **窗口管理** | 多窗口支持 + 位置记忆 |

### 技术栈

- **构建工具**：electron-vite
- **前端框架**：React + TypeScript
- **UI 方案**：Tailwind CSS（原子化）
- **状态管理**：Zustand（轻量级）
- **图标**：lucide-react

---

## 第一步：项目初始化

### 1.1 创建项目

```bash
# 使用 electron-vite React+TS 模板创建
npm create electron-app@latest my-notepad -- --template=react-ts
cd my-notepad

# 安装额外依赖
npm install zustand lucide-react chokidar electron-store
npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms

# 初始化 Tailwind
npx tailwindcss init -p
```

### 1.2 配置 Tailwind CSS

```javascript
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/renderer/**/*.{html,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: '#1a1d27',
          raised: '#22263a',
          overlay: '#2a2e42',
        },
        accent: {
          DEFAULT: '#58a6ff',
          hover: '#79b8ff',
          muted: 'rgba(88,166,255,0.15)',
        },
        text: {
          primary: '#e1e4e8',
          secondary: '#8b949e',
          muted: '#636c7a',
        }
      }
    },
  },
  plugins: [],
};
```

```css
/* src/renderer/src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
}

body {
  margin: 0;
  background: #0f1117;
  color: #e1e4e8;
  overflow: hidden;
}

/* 自定义滚动条 */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #333848; border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: #454c5c; }

/* 编辑器文本域样式 */
.editor-textarea {
  tab-size: 2;
  line-height: 1.7;
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace;
  resize: none;
  outline: none;
  border: none;
  background: transparent;
  width: 100%;
  height: 100%;
  padding: 16px 20px;
  color: inherit;
  font-size: 14px;
}
```

---

## 第二步：主进程架构

### 2.1 主入口 `src/main/index.ts`

```typescript
import { app, BrowserWindow, shell } from 'electron';
import { join } from 'path';
import { is } from '@electron-toolkit/utils';

// 服务导入
import { WindowManager, WindowType } from './services/WindowManager';
import { registerAllHandlers } from './ipc/handlers';
import { FileWatcherService } from './services/FileWatcher';
import { AutoSaveService } from './services/AutoSave';

// 单例实例
const windowManager = new WindowManager();
const fileWatcher = new FileWatcherService(windowManager);
const autoSaveService = new AutoSaveService();

function createMainWindow(): BrowserWindow {
  return windowManager.createOrGetSync({
    type: WindowType.MAIN,
    id: 'main',
    singleton: true,
    persistState: true,
    minWidth: 800,
    minHeight: 500,
    width: 1100,
    height: 720,
  });
}

app.whenReady().then(() => {
  // 注册所有 IPC handlers
  registerAllHandlers(windowManager);

  const mainWindow = createMainWindow();

  // 外部链接用系统浏览器打开
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // macOS Dock 点击重建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });

  // 启动服务
  fileWatcher.start(app.getPath('documents'));
  autoSaveService.start(30000); // 30秒自动保存
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    // 清理
    fileWatcher.dispose();
    autoSaveService.stop();
    app.quit();
  }
});
```

### 2.2 WindowManager（简化版）

```typescript
// src/main/services/WindowManager.ts
import {
  app, BrowserWindow, screen, ipcMain
} from 'electron';
import * as path from 'path';
import Store from 'electron-store';
import windowStateKeeper from 'electron-window-state';

const store = new Store({ name: 'window-states' });

export enum WindowType { MAIN, SETTINGS }

interface WindowEntry {
  win: BrowserWindow;
  type: WindowType;
  id: string;
}

export class WindowManager {
  private windows = new Map<string, WindowEntry>();

  /** 创建或获取窗口 */
  createOrGet(config: {
    type: WindowType; id: string; singleton?: boolean;
    persistState?: boolean;
  } & Partial<Electron.BrowserWindowConstructorOptions>): BrowserWindow {
    
    if (config.singleton && this.windows.has(config.id)) {
      const entry = this.windows.get(config.id)!;
      entry.win.focus();
      return entry.win;
    }

    const state = config.persistState ? this.restoreState(config.id) : null;

    const win = new BrowserWindow({
      ...(state ? { x: state.x, y: state.y, width: state.width, height: state.height } : {}),
      show: false,
      frame: config.type === WindowType.MAIN ? undefined : false,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, '../preload/index.js'),
        sandbox: true,
        contextIsolation: true,
        nodeIntegration: false,
      },
      ...config,
    });

    if (state?.isMaximized) win.maximize();

    // 加载页面
    if (process.env['ELECTRON_RENDERER_URL']) {
      const baseUrl = process.env['ELECTRON_RENDERER_URL'];
      win.loadURL(config.type === WindowType.SETTINGS 
        ? `${baseUrl}/#/settings` : baseUrl);
    } else {
      win.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // 事件绑定
    win.once('ready-to-show', () => win.show());
    
    if (state && config.persistState) state.manage(win);

    win.on('closed', () => {
      for (const [k, v] of this.windows) {
        if (v.win === win) { this.windows.delete(k); break; }
      }
    });

    this.windows.set(config.id, { win, type: config.type, id: config.id });
    return win;
  }

  /** 同步版本（用于 app.whenReady 中） */
  createOrGetSync(...args: Parameters<WindowManager['createOrGet']>) {
    return this.createOrGet(...args);
  }

  get(id: string): BrowserWindow | undefined {
    return this.windows.get(id)?.win;
  }

  getAll(): BrowserWindow[] {
    return Array.from(this.windows.values()).map(w => w.win);
  }

  broadcast(channel: string, ...args: any[]) {
    this.getAll().forEach(win => {
      if (!win.isDestroyed() && !win.webContents.isDestroyed()) {
        win.webContents.send(channel, ...args);
      }
    });
  }

  private restoreState(key: string) {
    const saved = store.get(key) as any;
    if (!saved) return null;
    
    // 屏幕边界校验
    const displays = screen.getAllDisplays();
    const visible = displays.some(d => {
      const a = d.workArea;
      return saved.x >= a.x && saved.y >= a.y && saved.x < a.x + a.width && saved.y < a.y + a.height;
    });
    
    if (!visible) return null;

    return windowStateKeeper({ defaultWidth: 1000, defaultHeight: 700 });
  }
}
```

### 2.3 IPC Handlers 注册中心

```typescript
// src/main/ipc/handlers.ts — 所有 IPC handler 在这里注册
import { ipcMain, dialog, BrowserWindow, app } from 'electron';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { WindowManager } from '../services/WindowManager';
import chokidar from 'chokidar';

/** 安全路径清理 */
function safePath(input: string, base?: string): string {
  const resolved = path.resolve(input);
  if (base && !resolved.startsWith(path.resolve(base))) {
    throw new Error('访问被拒绝');
  }
  return resolved;
}

export function registerAllHandlers(wm: WindowManager) {

  // ──── 文件读取 ────
  ipcMain.handle('fs:read', async (_evt, filePath: string) => {
    try {
      const p = safePath(filePath);
      const content = await fs.readFile(p, 'utf-8');
      const stat = await fs.stat(p);
      return { ok: true, data: content, stat: { size: stat.size, mtime: stat.mtimeMs } };
    } catch (e: any) { return { ok: false, error: e.message }; }
  });

  // ──── 文件写入 ────
  ipcMain.handle('fs:write', async (_evt, filePath: string, content: string) => {
    try {
      const p = safePath(filePath);
      await fs.writeFile(p, content, 'utf-8');
      return { ok: true };
    } catch (e: any) { return { ok: false, error: e.message }; }
  });

  // ──── 打开文件对话框 ────
  ipcMain.handle('dialog:open', async (event) => {
    const parent = BrowserWindow.fromWebContents(event.sender);
    const result = await dialog.showOpenDialog(parent ?? wm.get('main'), {
      properties: ['openFile'],
      filters: [
        { name: '文本 & Markdown', extensions: ['txt', 'md', 'markdown'] },
        { name: '代码文件', extensions: ['js', 'ts', 'py', 'go', 'json', 'yaml', 'html', 'css'] },
        { name: '所有文件', extensions: ['*'] },
      ],
    });
    if (result.canceled || !result.filePaths[0]) return null;
    return result.filePaths[0];
  });

  // ──── 保存文件对话框 ────
  ipcMain.handle('dialog:save', async (event) => {
    const parent = BrowserWindow.fromWebContents(event.sender);
    const result = await dialog.showSaveDialog(parent ?? wm.get('main'), {
      filters: [
        { name: 'Markdown', extensions: ['md'] },
        { name: '文本文件', extensions: ['txt'] },
      ],
    });
    return result.canceled ? null : result.filePath;
  });

  // ──── 列出目录 ────
  ipcMain.handle('fs:listDir', async (_evt, dirPath: string) => {
    try {
      const p = safePath(dirPath);
      const entries = await fs.readdir(p, { withFileTypes: true });
      return entries.map(e => ({
        name: e.name, isDir: e.isDirectory(), isFile: e.isFile(),
      }));
    } catch (e: any) { return []; }
  });

  // ──── 获取用户文档目录 ────
  ipcMain.handle('app:getDocumentsPath', () => app.getPath('documents'));

  // ──── 打开设置窗口 ────
  ipcMain.handle('win:openSettings', (event) => {
    const mainWin = wm.get('main');
    return wm.createOrGet({
      type: 'SETTINGS' as any,
      id: 'settings',
      singleton: true,
      width: 600,
      height: 480,
      resizable: false,
      parent: mainWin ?? undefined,
      modal: !!mainWin,
    });
  });

  // ──── 窗口控制 ────
  ipcMain.on('win:minimize', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.minimize();
  });
  ipcMain.on('win:maximize', (event) => {
    const w = BrowserWindow.fromWebContents(event.sender);
    if (w?.isMaximized()) w.unmaximize(); else w?.maximize();
  });
  ipcMain.on('win:close', (event) => {
    BrowserWindow.fromWebContents(event.sender)?.close();
  });

  console.log('[IPC] All handlers registered');
}
```

### 2.4 辅助服务

```typescript
// src/main/services/FileWatcher.ts
import chokidar from 'chokidar';
import { WindowManager } from './WindowManager';

export class FileWatcherService {
  private watcher: chokidar.FSWatcher | null = null;

  constructor(private wm: WindowManager) {}

  start(watchPath: string) {
    this.watcher = chokidar.watch(watchPath, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true,
      awaitWriteFinish: { stabilityThreshold: 300, pollInterval: 100 },
    });

    this.watcher.on('all', (event, filePath) => {
      this.wm.broadcast('fs:externalChange', { event, path: filePath });
    });
  }

  dispose() { this.watcher?.close(); this.watcher = null; }
}

// src/main/services/AutoSaveService.ts
import { BrowserWindow } from 'electron';
import { WindowManager } from './WindowManager';

export class AutoSaveService {
  private timer: NodeJS.Timeout | null = null;

  constructor(private wm: WindowManager) {}

  start(intervalMs: number) {
    this.timer = setInterval(() => {
      this.wm.broadcast('auto-save:tick');
    }, intervalMs);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }
}
```

---

## 第三步：Preload 安全桥梁

```typescript
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

const api = {
  // 系统
  platform: process.platform,

  // 文件系统
  readFile: (p: string) => ipcRenderer.invoke('fs:read', p),
  writeFile: (p: string, c: string) => ipcRenderer.invoke('fs:write', p, c),
  listDir: (p: string) => ipcRenderer.invoke('fs:listDir', p),
  getDocsPath: () => ipcRenderer.invoke('app:getDocumentsPath'),

  // 对话框
  openDialog: () => ipcRenderer.invoke('dialog:open'),
  saveDialog: () => ipcRenderer.invoke('dialog:save'),

  // 窗口
  openSettings: () => ipcRenderer.invoke('win:openSettings'),
  minimize: () => ipcRenderer.send('win:minimize'),
  maximize: () => ipcRenderer.send('win:maximize'),
  close: () => ipcRenderer.send('win:close'),

  // 事件订阅
  onFsExternalChange: (fn: (data: any) => void) => {
    const h = (_e: any, d: any) => fn(d);
    ipcRenderer.on('fs:externalChange', h);
    return () => ipcRenderer.removeListener('fs:externalChange', h);
  },
  onAutoSaveTick: (fn: () => void) => {
    const h = () => fn();
    ipcRenderer.on('auto-save:tick', h);
    return () => ipcRenderer.removeListener('auto-save:tick', h);
  },
};

contextBridge.exposeInMainWorld('api', api);
export type ApiType = typeof api;
```

类型声明：

```typescript
// src/renderer/src/types/electron-api.d.ts
import type { ApiType } from '../../../preload';

declare global {
  interface Window {
    api?: ApiType;
  }
}
export {};
```

---

## 第四步：渲染进程 —— React 应用核心

### 4.1 状态管理（Zustand）

```typescript
// src/renderer/src/store/useNotepadStore.ts
import { create } from 'zustand';

export interface Tab {
  id: string;
  filePath: string | null;     // null 表示未保存的新文件
  fileName: string;
  content: string;
  isDirty: boolean;
  lastSavedContent: string;
  cursorLine?: number;
  cursorCol?: number;
}

interface NotepadState {
  tabs: Tab[];
  activeTabId: string | null;
  settings: Settings;
  
  // 操作
  openTab: (filePath: string, content: string) => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateContent: (id: string, content: string) => void;
  markClean: (id: string) => void;
  newUntitledTab: () => void;
  updateSettings: (s: Partial<Settings>) => void;
  
  // 计算属性
  activeTab: () => Tab | undefined;
}

export interface Settings {
  theme: 'dark' | 'light';
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  wordWrap: boolean;
  autoSaveInterval: number; // ms, 0 = off
  showLineNumbers: boolean;
}

export const useNotepadStore = create<NotepadState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  settings: {
    theme: 'dark',
    fontSize: 14,
    fontFamily: "'JetBrains Mono', monospace",
    tabSize: 2,
    wordWrap: true,
    autoSaveInterval: 0,
    showLineNumbers: false,
  },

  openTab: (filePath, content) => {
    const existing = get().tabs.find(t => t.filePath === filePath);
    if (existing) {
      set({ activeTabId: existing.id });
      return;
    }
    const fileName = filePath.split(/[/\\]/).pop() || 'untitled';
    const id = `tab_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    set(state => ({
      tabs: [...state.tabs, { id, filePath, fileName, content, isDirty: false, lastSavedContent: content }],
      activeTabId: id,
    }));
  },

  closeTab: (id) => set(state => {
    const idx = state.tabs.findIndex(t => t.id === id);
    const newTabs = state.tabs.filter(t => t.id !== id);
    let newActive = state.activeTabId;
    if (newActive === id) {
      newActive = newTabs[Math.min(idx, newTabs.length - 1)]?.id || null;
    }
    return { tabs: newTabs, activeTabId: newActive };
  }),

  setActiveTab: (id) => set({ activeTabId: id }),

  updateContent: (id, content) => set(state => ({
    tabs: state.tabs.map(t =>
      t.id === id ? { ...t, content, isDirty: content !== t.lastSavedContent } : t
    ),
  })),

  markClean: (id) => set(state => ({
    tabs: state.tabs.map(t =>
      t.id === id ? { ...t, lastSavedContent: t.content, isDirty: false } : t
    ),
  })),

  newUntitledTab: () => {
    const id = `tab_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    set(state => ({
      tabs: [...state.tabs, { id, filePath: null, fileName: 'untitled', content: '', isDirty: false, lastSavedContent: '' }],
      activeTabId: id,
    }));
  },

  updateSettings: (partial) => set(state => ({ settings: { ...state.settings, ...partial } })),

  activeTab: () => get().tabs.find(t => t.id === get().activeTabId),
}));
```

### 4.2 核心组件结构

```
src/renderer/src/
├── components/
│   ├── App.tsx              # 根组件（布局）
│   ├── TitleBar.tsx         # 自定义标题栏
│   ├── TabBar.tsx           # 标签页栏
│   ├── EditorArea.tsx       # 编辑器区域
│   ├── SideBar.tsx          # 侧边栏（文件树）
│   ├── StatusBar.tsx        # 底部状态栏
│   ├── SettingsPage.tsx     # 设置页面
│   └── ui/                  # UI 原子组件
│       ├── Button.tsx
│       ├── Modal.tsx
│       └── Toast.tsx
├── hooks/
│   ├── useFileSystem.ts     # 文件操作 hook
│   ├── useShortcuts.ts      # 快捷键 hook
│   ├── useAutoSave.ts       # 自动保存 hook
│   └── useExternalWatch.ts  # 外部变更监控 hook
├── store/
│   └── useNotepadStore.ts   # Zustand 状态
└── App.tsx                  # 入口
```

### 4.3 App.tsx — 应用布局

```tsx
// src/renderer/src/components/App.tsx
import { TitleBar } from './TitleBar';
import { TabBar } from './TabBar';
import { EditorArea } from './EditorArea';
import { SideBar } from './SideBar';
import { StatusBar } from './StatusBar';
import { useNotepadStore } from '../store/useNotepadStore';
import { useEffect } from 'react';

export default function App() {
  const { newUntitledTab, settings } = useNotepadStore();

  useEffect(() => {
    // 启动时打开一个空白标签
    newUntitledTab();
  }, []);

  return (
    <div className={`flex flex-col h-screen ${settings.theme}`} style={{
      fontSize: `${settings.fontSize}px`,
      fontFamily: settings.fontFamily,
    }}>
      {/* 自定义标题栏 */}
      <TitleBar />

      {/* 主体区域 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 左侧边栏 */}
        <SideBar />

        {/* 右侧编辑区 */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* 标签栏 */}
          <TabBar />

          {/* 编辑器区域 */}
          <EditorArea />
        </div>
      </div>

      {/* 状态栏 */}
      <StatusBar />
    </div>
  );
}
```

### 4.4 TabBar 组件

```tsx
// src/renderer/src/components/TabBar.tsx
import { X, FileText, Circle } from 'lucide-react';
import { useNotepadStore } from '../store/useNotepadStore';

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, activeTab } = useNotepadStore();
  const current = activeTab();

  return (
    <div className="flex items-center bg-surface-raised border-b border-white/5 shrink-0 overflow-x-auto">
      {tabs.map(tab => (
        <div
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`
            group flex items-center gap-1.5 px-3 py-2 text-xs cursor-pointer
            border-r border-white/5 min-w-[120px] max-w-[180px]
            transition-colors duration-150 select-none
            ${activeTabId === tab.id 
              ? 'bg-surface text-text-primary' 
              : 'text-text-secondary hover:bg-surface-overlay'}
          `}
        >
          <FileText size={13} className="shrink-0" />
          
          <span className="truncate flex-1">{tab.fileName}</span>
          
          {/* 未保存指示 */}
          {tab.isDirty && (
            <Circle size={7} fill="#f0b72f" className="shrink-0 text-[#f0b72f]" />
          )}
          
          {/* 关闭按钮 */}
          <button
            onClick={(e) => { e.stopPropagation(); closeTab(tab.id); }}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 transition-opacity"
          >
            <X size={12} />
          </button>
        </div>
      ))}

      {/* 新建标签按钮 */}
      <button
        onClick={() => useNotepadStore.getState().newUntitledTab()}
        className="px-2 py-2 text-text-muted hover:text-text-secondary hover:bg-surface-overlay transition-colors"
      >
        <X size={14} className="rotate-45" />
      </button>
    </div>
  );
}
```

### 4.5 EditorArea 组件

```tsx
// src/renderer/src/components/EditorArea.tsx
import { useEffect, useCallback, useRef } from 'react';
import { useNotepadStore } from '../store/useNotepadStore';
import { useFileSystem } from '../hooks/useFileSystem';
import { Save, FolderOpen, AlertCircle } from 'lucide-react';

export function EditorArea() {
  const { activeTab, updateContent, tabs } = useNotepadStore();
  const current = activeTab();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { saveFile, saveAsFile } = useFileSystem();

  const handleInput = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!current) return;
    updateContent(current.id, e.target.value);
  }, [current?.id, updateContent]);

  // 同步内容到 textarea
  useEffect(() => {
    if (textareaRef.current && current) {
      // 只在非用户编辑时同步（避免光标跳动）
      if (textareaRef.current !== document.activeElement) {
        textareaRef.current.value = current.content;
      }
    }
  }, [current?.id]); // 仅在切换标签时同步

  // 无标签时显示空状态
  if (!current || tabs.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface">
        <div className="text-center text-text-muted space-y-3">
          <FileText size={48} strokeWidth={1} className="mx-auto opacity-30" />
          <p className="text-sm">没有打开的文件</p>
          <p className="text-xs opacity-60">使用 Ctrl+N 新建 或 Ctrl+O 打开</p>
        </div>
      </div>
    );
  }

  // 未保存的新文件提示
  if (current.filePath === null && current.content === '') {
    return (
      <div className="flex-1 flex items-center justify-center bg-surface">
        <div className="space-y-4">
          <h2 className="text-lg text-text-primary">📝 新文件</h2>
          <p className="text-sm text-text-secondary max-w-md text-center">
            开始输入内容，或点击下方按钮选择已有文件
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={saveAsFile} className="btn btn-primary">
              <Save size={14} /> 保存为...
            </button>
            <button onClick={useFileSystem.getState().openFile} className="btn btn-default">
              <FolderOpen size={14} /> 打开文件
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative bg-surface">
      {/* 编辑器文本域 */}
      <textarea
        ref={textareaRef}
        key={current.id}  // 切换标签时重建 DOM
        defaultValue={current.content}
        onChange={handleInput}
        className="editor-textarea"
        spellCheck={false}
        style={{ whiteSpace: useNotepadStore.getState().settings.wordWrap ? 'pre-wrap' : 'pre' }}
      />

      {/* 外部变更提示 */}
      {false && ( /* 由 hook 控制 */ )}
    </div>
  );
}
```

### 4.6 关键 Hooks

```typescript
// src/renderer/src/hooks/useFileSystem.ts
import { useCallback } from 'react';
import { useNotepadStore } from '../store/useNotepadStore';

export function useFileSystem() {
  const { openTab, markClean, activeTab } = useNotepadStore();

  const openFile = useCallback(async () => {
    if (!window.api) return;
    const filePath = await window.api.openDialog();
    if (!filePath) return;

    const result = await window.api.readFile(filePath);
    if (result.ok) {
      openTab(filePath, result.data);
    } else {
      alert(`打开失败: ${result.error}`);
    }
  }, [openTab]);

  const saveCurrent = useCallback(async () => {
    const tab = activeTab();
    if (!tab || !window.api) return false;

    let savePath = tab.filePath;
    if (!savePath) {
      savePath = await window.api.saveDialog();
      if (!savePath) return false;
    }

    const result = await window.api.writeFile(savePath, tab.content);
    if (result.ok) {
      markClean(tab.id);
      return true;
    }
    alert(`保存失败: ${result.error}`);
    return false;
  }, [activeTab, markClean]);

  const saveAsFile = useCallback(async () => {
    const tab = activeTab();
    if (!tab || !window.api) return;

    const filePath = await window.api.saveDialog();
    if (!filePath) return;

    const result = await window.api.writeFile(filePath, tab.content);
    if (result.ok) {
      // 更新标签的文件路径和名称
      useNotepadStore.getState().openTab(filePath, tab.content);
      markClean(useNotepadStore.getState().tabs.find(t => t.content === tab.content)?.id || tab.id);
    }
  }, [activeTab, markClean]);

  return { openFile, saveCurrent, saveAsFile };
}
```

```typescript
// src/renderer/src/hooks/useShortcuts.ts
import { useEffect } from 'react';
import { useNotepadStore } from '../store/useNotepadStore';
import { useFileSystem } from './useFileSystem';

export function useShortcuts() {
  const { newUntitledTab, closeTab, activeTabId, tabs, openSettings } = useNotepadStore();
  const { openFile, saveCurrent, saveAsFile } = useFileSystem();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrlOrCmd = e.ctrlKey || e.metaKey;

      if (ctrlOrCmd && e.key === 'n') {
        e.preventDefault();
        newUntitledTab();
      }
      if (ctrlOrCmd && e.key === 'o') {
        e.preventDefault();
        openFile();
      }
      if (ctrlOrCmd && e.key === 's') {
        e.preventDefault();
        saveCurrent();
      }
      if (ctrlOrCmd && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        saveAsFile();
      }
      if (ctrlOrCmd && e.key === 'w') {
        e.preventDefault();
        if (activeTabId) closeTab(activeTabId);
      }
      if (ctrlOrCmd && e.key === ',') {
        e.preventDefault();
        window.api?.openSettings();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTabId, tabs.length]);
}
```

```typescript
// src/renderer/src/hooks/useExternalWatch.ts
import { useEffect } from 'react';
import { useNotepadStore } from '../store/useNotepadStore';

export function useExternalWatch() {
  const { tabs, updateContent } = useNotepadStore();

  useEffect(() => {
    if (!window.api) return;

    const unsub = window.api.onFsExternalChange(async ({ path: changedPath }: any) => {
      // 找到对应标签
      const targetTab = tabs.find(t => t.filePath === changedPath);
      if (!targetTab) return;

      // 如果当前标签的内容与上次保存的不同（即有未保存修改），提示用户
      if (targetTab.isDirty) {
        const reload = confirm(
          `${targetTab.fileName}\n已被外部程序修改。\n\n是否放弃本地修改并重新加载？\n\n[确定] 重新加载  [取消] 保留本地修改`
        );
        if (!reload) return; // 用户选择保留自己的版本
      }

      // 重新读取文件
      if (window.api) {
        const result = await window.api.readFile(changedPath);
        if (result.ok) {
          updateContent(targetTab.id, result.data);
          useNotepadStore.getState().markClean(targetTab.id);
        }
      }
    });

    return unsub;
  }, [tabs]);
}
```

### 4.7 StatusBar 和 TitleBar

```tsx
// src/renderer/src/components/StatusBar.tsx
import { useNotepadStore } from '../store/useNotepadStore';
import { Clock } from 'lucide-react';

export function StatusBar() {
  const { activeTab, settings } = useNotepadStore();
  const tab = activeTab();

  // 简单计算行列号
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });

  useEffect(() => {
    const handleCursorUpdate = () => {
      const ta = document.querySelector('.editor-textarea') as HTMLTextAreaElement;
      if (!ta) return;
      const pos = ta.selectionStart;
      const text = ta.value.substring(0, pos);
      const lines = text.split('\n');
      setCursorPos({ line: lines.length, col: lines[lines.length - 1].length + 1 });
    };

    document.addEventListener('keyup', handleCursorUpdate);
    document.addEventListener('click', handleCursorUpdate);
    return () => {
      document.removeEventListener('keyup', handleCursorUpdate);
      document.removeEventListener('click', handleCursorUpdate);
    };
  }, [tab?.id]);

  const now = new Date().toLocaleTimeString('zh-CN', { hour12: false });

  return (
    <div className="flex items-center justify-between px-3 py-1 bg-surface-raised border-t border-white/5 text-xs text-text-muted select-none">
      <div className="flex items-center gap-4">
        <span>Ln {cursorPos.line}, Col {cursorPos.col}</span>
        <span>UTF-8</span>
        <span>{settings.wordWrap ? '软换行' : '无换行'}</span>
        {tab?.isDirty && <span className="text-[#f0b72f]">● 已修改</span>}
      </div>
      <div className="flex items-center gap-4">
        {tab?.filePath && <span className="max-w-[300px] truncate">{tab.filePath}</span>}
        <span className="flex items-center gap-1"><Clock size={11} /> {now}</span>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Minus, Square, X, Maximize2, Minus2 } from 'lucide-react';

export function TitleBar() {
  return (
    <div className="-drag flex items-center justify-between h-9 px-3 bg-surface-raised border-b border-white/5 select-none shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-text-primary">✏️ MyNotepad</span>
        <span className="text-xs text-text-muted">— 简易记事本</span>
      </div>

      {/* 窗口控制按钮 */}
      <div className="-no-drag flex items-center">
        <button onClick={() => window.api?.minimize()} className="titlebar-btn" title="最小化">
          <Minus size={14} />
        </button>
        <button onClick={() => window.api?.maximize()} className="titlebar-btn" title="最大化">
          <Square size={11} strokeWidth={1.5} />
        </button>
        <button onClick={() => window.api?.close()} className="titlebar-btn hover:!bg-red-500/80" title="关闭">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
```

### 4.8 设置页面

```tsx
// src/renderer/src/components/SettingsPage.tsx
import { useState, useEffect } from 'react';
import { useNotepadStore, Settings } from '../store/useNotepadStore';
import { ArrowLeft } from 'lucide-react';

export function SettingsPage() {
  const { settings, updateSettings } = useNotepadStore();
  const [local, setLocal] = useState<Settings>(settings);

  useEffect(() => { setLocal(settings); }, []);

  const applyAndClose = () => {
    updateSettings(local);
    window.close(); // 关闭设置窗口
  };

  return (
    <div className="min-h-screen bg-surface text-text-primary p-8">
      <div className="max-w-xl mx-auto space-y-8">
        <div>
          <h1 className="text-xl font-bold mb-1">设置</h1>
          <p className="text-xs text-text-muted">自定义你的编辑器偏好</p>
        </div>

        {/* 字体大小 */}
        <SettingRow label="字体大小" description="编辑器文字大小">
          <input
            type="range" min="10" max="24"
            value={local.fontSize}
            onChange={e => setLocal(s => ({ ...s, fontSize: Number(e.target.value) }))}
          />
          <span className="ml-3 text-accent w-8 text-right">{local.fontSize}px</span>
        </SettingRow>

        {/* 自动保存 */}
        <SettingRow label="自动保存" description="间隔 0 表示关闭">
          <select value={String(local.autoSaveInterval)} onChange={e =>
            setLocal(s => ({ ...s, autoSaveInterval: Number(e.target.value) }))
          }>
            <option value="0">关闭</option>
            <option value="15000">15 秒</option>
            <option value="30000">30 秒</option>
            <option value="60000">1 分钟</option>
            <option value="300000">5 分钟</option>
          </select>
        </SettingRow>

        {/* 自动换行 */}
        <SettingRow label="自动换行" description="长行自动折行显示">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={local.wordWrap} onChange={e =>
              setLocal(s => ({ ...s, wordWrap: e.target.checked }))
            } className="sr-only peer" />
            <div className="w-9 h-5 bg-surface-overlay rounded-full peer peer-checked:bg-accent after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-full"/>
          </label>
        </SettingRow>

        <hr className="border-white/10" />

        <button onClick={applyAndClose} className="btn btn-primary w-full py-2.5">
          保存设置并关闭
        </button>
      </div>
    </div>
  );
}

function SettingRow({ label, description, children }: { label: string; description: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-text-muted mt-0.5">{description}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}
```

---

## 第五步：路由配置

```tsx
// src/renderer/src/AppRouter.tsx（在 main.tsx 中使用）
import { HashRouter, Routes, Route } from 'react-router-dom';
import App from './components/App';
import SettingsPage from './components/SettingsPage';

function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </HashRouter>
  );
}

export default AppRouter;
```

---

## 第六步：运行与测试

```bash
# 开发模式运行
npm run dev

# 你应该能看到：
# ✅ 一个自定义标题栏的窗口
# ✅ 一个空白的标签页
# ✅ 可以输入文字
# ✅ Ctrl+N 新建、Ctrl+O 打开、Ctrl+S 保存
# ✅ Ctrl+, 打开独立设置窗口
# ✅ 关闭标签、新建标签
# ✅ 底部状态栏显示行列号和时间
```

---

## 项目总结：我们学到了什么？

通过这个记事本项目，我们把 L1 和 L2 阶段的所有知识点串了起来：

| 知识点 | 在项目中的体现 |
|:---|:---|
| **Electron 基础架构** | main / preload / renderer 三件套分离 |
| **Preload 安全模型** | 白名单 API 暴露 + contextBridge |
| **IPC 通信体系** | invoke/handle（读写文件） + send/on（窗口控制） + broadcast（文件变化通知） |
| **多窗口架构** | WindowManager 类统一管理主窗口 + 设置模态窗口 |
| **窗口状态持久化** | electron-window-state 记住位置大小 |
| **React + TypeScript** | 完整的类型安全开发体验 |
| **状态管理** | Zustand 轻量级全局状态（标签页数据） |
| **Hooks 封装** | useFileSystem / useShortcuts / useExternalWatch 等 |
| **文件系统集成** | 读写 + 对话框 + 外部变更监听 |
| **快捷键系统** | 全局键盘事件拦截处理 |

### 下一步预告：L3 阶段 —— 窗口管理与 UI 构建

进入 L3 后我们将深入：
- **自定义无边框标题栏**的高级实现（拖拽区、双击最大化工）
- **菜单、托盘、全局快捷键**
- **UI 框架选型深度对比**（MUI / Ant Design / shadcn/ui / Arco Design）
- **VS Code 级别的面板系统**

---

> 🎉 **恭喜你完成了 L1 + L2 全部 7 天的学习！**
> 
> 你已经具备了从零搭建中等复杂度 Electron 应用的能力。
> 
> 💬 这个记事本项目你跑起来了吗？有什么问题评论区交流！
> 👨‍💻 **系列教程持续更新**，关注「APP移动开发」不错过 L3。
> ❤️ 觉得有帮助？"在看"+"分享"，让更多开发者看到！
