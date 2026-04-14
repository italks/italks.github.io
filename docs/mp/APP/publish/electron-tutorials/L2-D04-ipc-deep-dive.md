# IPC 通信深度解析：四种模式 + 类型安全 + 设计模式

> **阅读时长**：约 22 分钟 | **难度**：⭐⭐⭐ 中级 | **本系列**：L2/Day 4
> **前置知识**：L1 阶段完成（基础架构、Preload、框架集成）

欢迎进入 **L2（进程架构与通信）** 阶段！如果说 L1 让你跑通了第一个应用，那 L2 将教你写出**真正可维护的 Electron 应用**。今天我们聚焦整个系列最核心的知识点之一——**IPC 通信**。

---

## 一、IPC 通信全景图

### 1.1 为什么 IPC 这么重要？

Electron 的渲染进程和主进程运行在**完全隔离的环境中**：

```
┌─────────────────────────────────────────────────────┐
│                    你的 Electron 应用                 │
│                                                       │
│   ┌──────────────┐         ┌──────────────┐          │
│   │  渲染进程 A    │         │  渲染进程 B    │          │
│   │  (窗口1)       │         │  (设置窗口)     │          │
│   │               │         │               │          │
│   │  只有浏览器能力 │         │  只有浏览器能力 │          │
│   │  ❌ 无文件访问  │  ────→  │  ❌ 无文件访问  │          │
│   │  ❌ 无系统API  │  IPC?   │  ❌ 无系统API  │          │
│   └──────┬────────┘         └──────┬────────┘          │
│          │                         │                   │
│          └──────────┬──────────────┘                   │
│                     ▼                                  │
│            ┌──────────────┐                            │
│            │   主进程      │ ← 唯一拥有完整 Node 能力     │
│            │              │   文件/网络/系统 API        │
│            └──────────────┘                            │
└─────────────────────────────────────────────────────┘
```

**IPC 就是连接这些孤岛的桥梁**。没有 IPC，你的 Electron 应用就只是一个套了壳的网页。

### 1.2 四种通信模式一览

| 模式 | API | 方向 | 返回值 | 类比 |
|:---|:---|:---|:---|:---|
| **请求-响应** | `invoke` / `handle` | 渲染→主→渲染 | ✅ Promise | HTTP GET/POST |
| **单向通知** | `send` / `on` | 渲染→主 | ❌ 无 | UDP 发包 |
| **主动推送** | `webContents.send` | 主→渲染 | ❌ 无 | WebSocket 推送 |
| **双向流式** | `MessagePort` | 任意方向 | ✅ 流数据 | WebSocket 双工 |

---

## 二、模式详解：请求-响应（invoke/handle）

这是**最常用**的模式，覆盖 80% 的场景。

### 2.1 基础用法

```typescript
// ==================== 主进程 ====================
import { ipcMain } from 'electron';

// 注册处理器（类似 Express 的路由）
ipcMain.handle('users:getAll', async () => {
  const db = await import('./database');
  return await db.users.findAll(); // 自动序列化返回给渲染进程
});

ipcMain.handle('users:getById', async (_event, id: string) => {
  const user = await db.users.findById(id);
  
  if (!user) {
    throw new Error('用户不存在'); // 错误会以 rejection 形式返回
  }
  
  return user;
});

// ==================== Preload ====================
contextBridge.exposeInMainWorld('api', {
  getUsers: () => ipcRenderer.invoke('users:getAll'),
  getUserById: (id: string) => ipcRenderer.invoke('users:getById', id),
});

// ==================== 渲染进程 (React) ====================
async function loadUsers() {
  try {
    const users = await window.api.getUsers();
    setUsers(users); // 类型安全 ✅
  } catch (err) {
    console.error('加载失败:', err);
  }
}
```

### 2.2 进阶：结构化错误处理

```typescript
// 定义统一的响应类型
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;  // 业务错误码
}

// 主进程中统一封装
function createHandler<T>(
  handler: (...args: any[]) => Promise<T>
): (_event: IpcMainInvokeEvent, ...args: any[]) => Promise<ApiResponse<T>> {
  return async (event, ...args) => {
    try {
      const data = await handler(...args);
      return { success: true, data };
    } catch (error: any) {
      // 区分业务错误和系统错误
      if (error.code === 'NOT_FOUND') {
        return { success: false, error: error.message, code: 'NOT_FOUND' };
      }
      
      console.error('[IPC Error]', error);
      return { 
        success: false, 
        error: '服务器内部错误',
        code: 'INTERNAL_ERROR' 
      };
    }
  };
}

// 使用示例
ipcMain.handle(
  'files:read', 
  createHandler(async (path: string) => {
    const content = await fs.readFile(path, 'utf-8');
    return { path, content };
  })
);

// 渲染进程使用
const result = await window.api.readConfig();
if (result.success) {
  // result.data 有完整类型提示
} else {
  // result.error 和 result.code 可用于 UI 展示
  showErrorToast(result.error, result.code);
}
```

### 2.3 进阶：超时控制

```typescript
// Preload 中为 invoke 添加超时保护
function invokeWithTimeout<T>(
  channel: string,
  timeoutMs: number,
  ...args: any[]
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`IPC 调用超时: ${channel} (${timeoutMs}ms)`));
    }, timeoutMs);

    ipcRenderer
      .invoke(channel, ...args)
      .then(resolve)
      .catch(reject)
      .finally(() => clearTimeout(timer));
  });
}

// 使用
const data = await invokeWithTimeout('heavy:task', 5000); // 5秒超时
```

---

## 三、模式详解：单向通知（send/on）

适合"发了就不管"的场景，比如日志、状态通知、窗口控制。

### 3.1 典型场景

```typescript
// ========== 窗口控制类（不需要返回值）==========

// 主进程
ipcMain.on('window:minimize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.minimize();
});

ipcMain.on('window:maximize', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) {
    win.isMaximized() ? win.unmaximize() : win.maximize();
  }
});

ipcMain.on('window:close', (event) => {
  const win = BrowserWindow.fromWebContents(event.sender);
  if (win) win.close();
});

// ========== 日志上报类 ==========

// 创建主进程日志收集器
class Logger {
  private logFile: fs.WriteStream;

  constructor() {
    this.logFile = fs.createWriteStream(app.getPath('logs') + '/app.log');
    
    ipcMain.on('log:info', (_event, msg) => this.write('INFO', msg));
    ipcMain.on('log:error', (_event, msg) => this.write('ERROR', msg));
    ipcMain.on('log:warn', (_event, msg) => this.write('WARN', msg));
  }

  private write(level: string, msg: string) {
    const timestamp = new Date().toISOString();
    this.logFile.write(`[${timestamp}] [${level}] ${msg}\n`);
  }
}

// Preload 暴露
contextBridge.exposeInMainWorld('logger', {
  info: (msg: string) => ipcRenderer.send('log:info', msg),
  error: (msg: string) => ipcRenderer.send('log:error', msg),
});
```

### 3.2 send vs invoke 怎么选？

```
需要返回结果吗？
│
├─ 是 → 用 invoke/handle
│
└─ 否 → 用 send/on
   │
   ├─ 需要确认对方收到了吗？
   │  └─ 是 → 还是考虑 invoke（至少知道成功/失败）
   │
   └─ 完全不在乎（纯通知）
      └─ 用 send/on（如日志、统计打点）
```

---

## 四、模式详解：主动推送（webContents.send）

主进程主动向渲染进程发送消息，典型场景包括：文件变化通知、下载进度、更新可用提醒等。

### 4.1 文件监听器实战

```typescript
// src/main/services/FileWatcher.ts
import chokidar from 'chokidar';
import { BrowserWindow } from 'electron';

interface FileChangeEvent {
  type: 'add' | 'change' | 'unlink';
  path: string;
  stats?: any; // fs.Stats
}

export class FileWatcherService {
  private watcher: chokidar.FSWatcher | null = null;

  watch(dirPath: string, targetWindow: BrowserWindow) {
    // 先清理旧的
    this.dispose();

    this.watcher = chokidar.watch(dirPath, {
      ignored: /(^|[\/\\])\../,  // 忽略隐藏文件
      persistent: true,
      ignoreInitial: false,
      awaitWriteFinish: {
        stabilityThreshold: 500,  // 文件写入稳定后触发
        pollInterval: 100,
      },
    });

    // 监听各种文件事件并推送到渲染进程
    this.watcher.on('all', (event: string, filePath: string, stats?: any) => {
      targetWindow.webContents.send('fs:watcher:event', {
        type: event as FileChangeEvent['type'],
        path: filePath,
        stats,
      } as FileChangeEvent);
    });

    this.watcher.on('ready', () => {
      targetWindow.webContents.send('fs:watcher:ready');
    });

    this.watcher.on('error', (error: Error) => {
      targetWindow.webContents.send('fs:watcher:error', error.message);
    });
  }

  dispose() {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }
}
```

### 4.2 渲染进程接收推送

```tsx
// React 组件中接收主进程推送
function FileExplorer() {
  const [events, setEvents] = useState<FileChangeEvent[]>([]);

  useEffect(() => {
    if (!window.electronAPI?.onFsEvent) return;

    // 订阅文件变化
    const unsubscribe = window.electronAPI.onFsEvent((event) => {
      setEvents(prev => [event, ...prev].slice(0, 100)); // 保留最近100条
    
      // 根据事件类型做不同处理
      switch (event.type) {
        case 'change':
          showToast(`文件已更新: ${event.path}`);
          break;
        case 'add':
          showToast(`新文件: ${event.path}`);
          break;
        case 'unlink':
          showToast(`文件已删除: ${event.path}`, 'warning');
          break;
      }
    });

    // 组件卸载时取消订阅（防内存泄漏！）
    return unsubscribe;
  }, []);

  return <div>{/* 渲染事件列表 */}</div>;
}
```

### 4.3 广播 vs 定向发送

```typescript
// 方式一：广播到所有窗口
BrowserWindow.getAllWindows().forEach(win => {
  win.webContents.send('global:notification', {
    title: '新消息',
    body: '您有新的通知',
  });
});

// 方式二：只发给特定窗口的特定 webContents
mainWindow.webContents.send('private:update', data);

// 方式三：只发给某个 frame（iframe 内嵌页面）
mainWindow.webContents.mainFrame.frames.forEach(frame => {
  if (frame.url.includes('/settings')) {
    frame.send('settings:updated', config);
  }
});
```

---

## 五、模式详解：双向流式通信（MessagePort）

**Electron 28+ 新特性**，适合传输大块数据（比 JSON 序列化高效得多）。

### 5.1 什么是 MessagePort？

```
传统 IPC（JSON 序列化）：
  数据 → JSON.stringify() → 跨进程拷贝 → JSON.parse() → 数据
  ⚠️ 大对象时性能差，无法传输 Stream/ArrayBuffer

MessagePort（结构化克隆）：
  数据 → 结构化克隆 → 直接传递到目标端口
  ✅ 支持 ArrayBuffer、Transferable、更高效
  ✅ 支持流式传输
  ✅ 可传输 ownership（零拷贝）
```

### 5.2 基础用法

```typescript
// ========== 主进程 ==========
import { MessageChannelMain, utilityProcess } from 'electron';

ipcMain.handle('get-data-stream', (event) => {
  // 创建一个消息通道（两个端口）
  const { port1, port2 } = new MessageChannelMain();

  // port2 通过 IPC 发送给渲染进程（Transferable！）
  event.startReply(); // 开始回复
  event.ports[0].postMessage({ status: 'stream-ready' });
  event.reply(port2);

  // port1 留在主进程中，用于发送数据
  port1.onmessage = (msgEvent) => {
    if (msgEvent.data.action === 'request-chunk') {
      // 发送下一块数据
      const chunk = getNextDataChunk();
      port1.postMessage({ chunk, index: currentChunkIndex++ });
      
      if (isFinished) {
        port1.postMessage({ done: true });
        port1.close();
      }
    }

    port1.onmessageerror = (err) => {
      console.error('Port error:', err);
    };
  };

  // 返回一个初始元信息即可（port2 会自动传过去）
  return { totalChunks: estimatedTotalCount };
});

// ========== 渲染进程 ==========
async function startDataStream() {
  // 触发获取流通道
  const meta = await window.electronAPI.getDataStream();

  // 从 reply 中获取 port2
  // （这需要特殊处理，详见 electron-vite 的实现）
  const streamPort = await createPortFromReply(meta);

  // 使用 port2 接收数据流
  streamPort.postMessage({ action: 'request-chunk' });

  streamPort.onmessage = (e) => {
    const { chunk, done } = e.data;

    if (!done) {
      appendChunkToUI(chunk);  // 增量更新 UI
      streamPort.postMessage({ action: 'request-chunk' }); // 请求下一块
    } else {
      streamPort.close();  // 完成！
      showCompleteUI();
    }
  };
}
```

### 5.3 适用场景

| 场景 | 传统 IPC | MessagePort |
|:---|:---|:---|
| 读取小配置文件（<100KB） | ✅ 够用 | 杀鸡用牛刀 |
| 读取大文件（10MB+） | ❌ 卡顿/内存溢出 | ✅ 分块流式 |
| 实时视频帧传输 | ❌ 不可能 | ✅ Transferable 零拷贝 |
| WebSocket 数据桥接 | ❌ 效率低 | ✅ 高吞吐量 |
| 多 Worker 并行计算结果收集 | ❌ 复杂 | ✅ 天然适配 |

---

## 六、IPC 通道设计规范（RESTful 风格命名）

好的 IPC 通道命名能大幅提升代码可读性和可维护性。

### 6.1 命名约定

```
格式：资源域:操作[:修饰]

资源域（Domain）:
  app:*       — 应用级操作
  fs:*        — 文件系统操作
  win:*       — 窗口控制
  user:*      — 用户相关
  settings:*  — 设置项
  update:*    — 更新相关
  db:*        — 数据库操作
  net:*       — 网络请求

操作（Action）:
  get         — 获取单个/列表
  getAll      — 获取全部列表
  create      — 创建
  update      — 更新
  delete      — 删除
  search      — 搜索
  export      — 导出
  import      — 导入

示例：
  app:getVersion          → 应用版本号
  fs:read                → 读文件
  fs:write               → 写文件
  fs:listDir             → 列出目录
  fs:watch               → 监听文件
  win:minimize           → 最小化
  settings:get           → 读取设置
  settings:set           → 写入设置
  user:login             → 用户登录
  update:check           → 检查更新
  update:download        → 下载更新
  db:query               — 数据库查询
```

### 6.2 统一的 IPC Router 架构

参考 Express/Koa 的路由设计思想，组织大型应用的 IPC：

```typescript
// src/main/ipc/router.ts
import { ipcMain, IpcMainInvokeEvent } from 'electron';
type HandlerFn = (event: IpcMainInvokeEvent, ...args: any[]) => Promise<any>;

class IpcRouter {
  private routes = new Map<string, HandlerFn>();

  /**
   * 注册路由
   * @example router.handle('fs:read', async (event, path) => { ... })
   */
  handle(channel: string, handler: HandlerFn): this {
    if (this.routes.has(channel)) {
      console.warn(`[IPC] Route "${channel}" already registered, will override.`);
    }
    this.routes.set(channel, handler);
    ipcMain.handle(channel, handler);
    return this;
  }

  /**
   * 批量注册（按域分组）
   */
  namespace(domain: string, handlers: Record<string, HandlerFn>): this {
    for (const [action, handler] of Object.entries(handlers)) {
      this.handle(`${domain}:${action}`, handler);
    }
    return this;
  }

  /** 列出所有已注册路由 */
  listRoutes(): string[] {
    return Array.from(this.routes.keys());
  }
}

// 使用示例
const router = new IpcRouter();

router
  // 文件系统模块
  .namespace('fs', {
    read: async (_event, path) => readFileSafe(path),
    write: async (_event, path, data) => writeFileSafe(path, data),
    listDir: async (_event, dir) => listDirectorySafe(dir),
    delete: async (_event, path) => deleteFile(path),
  })
  // 设置模块
  .namespace('settings', {
    get: async (_event, key) => store.get(key),
    set: async (_event, key, value) => store.set(key, value),
    reset: async () => store.clear(),
  })
  // 更新模块
  .namespace('update', {
    check: async () => autoUpdater.checkForUpdates(),
    download: async () => autoUpdater.downloadUpdate(),
    install: async () => autoUpdater.quitAndInstall(),
  });

console.log('Registered IPC routes:', router.listRoutes());
// 输出: ['fs:read', 'fs:write', 'fs:listDir', ..., 'settings:get', ...]
```

---

## 七、类型安全的完整方案

这是让 TypeScript 在 IPC 通信两端都有完整类型提示的方法。

### 7.1 双向类型定义

```typescript
// src/shared/ipc/types.ts — 共享类型定义

// === 所有 IPC 通道名（单一来源）===
export const IPC_CHANNELS = {
  // 文件系统
  FS_READ: 'fs:read',
  FS_WRITE: 'fs:write',
  FS_LIST_DIR: 'fs:listDir',
  FS_WATCH_EVENT: 'fs:watcher:event',

  // 窗口控制
  WIN_MINIMIZE: 'window:minimize',
  WIN_MAXIMIZE: 'window:maximize',
  WIN_CLOSE: 'window:close',

  // 设置
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
} as const;

// === 请求参数类型 ===
export interface FsReadArgs {
  path: string;
  encoding?: string;
}

export interface FsWriteArgs {
  path: string;
  content: string;
}

// === 响应类型 ===
export interface FsReadResult {
  content: string;
  size: number;
  lastModified: number;
}

// === Channel ↔ 参数/返回值的映射表 ===
export interface IpcChannelMap {
  [IPC_CHANNELS.FS_READ]: { args: FsReadArgs; result: FsReadResult };
  [IPC_CHANNELS.FS_WRITE]: { args: FsWriteArgs; result: void };
  [IPC_CHANNELS.SETTINGS_GET]: { args: { key: string }; result: unknown };
  [IPC_CHANNELS.SETTINGS_SET]: { args: { key: string; value: unknown }; result: void };
}
```

### 7.2 类型化的 invoke 封装

```typescript
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS, IpcChannelMap } from '../shared/ipc/types';

/**
 * 类型安全的 invoke 包装器
 * 自动从 IpcChannelMap 推导参数类型和返回值类型
 */
function typedInvoke<K extends keyof IpcChannelMap>(
  channel: K,
  ...args: IpcChannelMap[K]['args'] extends never ? [] : [IpcChannelMap[K]['args']]
): Promise<IpcChannelMap[K]['result']> {
  return ipcRenderer.invoke(channel, ...(args as any));
}

const api = {
  // 平台信息（静态）
  platform: process.platform,

  // 类型安全的 IPC 方法
  fs: {
    read: (args: IpcChannelMap[typeof IPC_CHANNELS.FS_READ]['args']) =>
      typedInvoke(IPC_CHANNELS.FS_READ, args),
    write: (args: IpcChannelMap[typeof IPC_CHANNELS.FS_WRITE]['args']) =>
      typedInvoke(IPC_CHANNELS.FS_WRITE, args),
  },

  settings: {
    get: (key: string) =>
      typedInvoke(IPC_CHANNELS.SETTINGS_GET, { key }),
    set: (key: string, value: unknown) =>
      typedInvoke(IPC_CHANNELS.SETTINGS_SET, { key, value }),
  },
};

contextBridge.exposeInMainWorld('api', api);
export type ElectronApiType = typeof api;
```

### 7.3 渲染进程中使用效果

```tsx
// 现在 TypeScript 能提供完整的类型检查和补全！

// ✅ 参数类型正确，有补全
const result = await window.api.fs.read({ path: '/tmp/test.txt' });
// result.content 是 string ✅
// result.size 是 number ✅
// result.lastModified 是 number ✅

// ❌ 参数类型错误会被捕获
await window.api.fs.read({ path: 123 });  // Type Error! path must be string

// ❌ 返回值类型不匹配会被检测
const size: boolean = result.size;  // Type Error! size is number, not boolean
```

---

## 八、性能优化建议

### 8.1 减少 IPC 频率（批量请求）

```typescript
// ❌ 差：频繁调用
for (const file of files) {
  await window.api.fs.getMeta(file.path); // N 次 IPC 往返
}

// ✅ 好：一次批量请求
const results = await window.api.fs.batchGetMeta(files.map(f => f.path)); // 1 次 IPC
```

### 8.2 减少数据量（按需取字段）

```typescript
// ❌ 差：返回完整对象（可能包含大量字段）
ipcMain.handle('db:getUser', () => db.user.findFirst());

// ✅ 好：只返回需要的字段
ipcMain.handle('db:getUserProfile', () => db.user.findFirst({
  select: { id: true, name: true, avatar: true },  // 只要 3 个字段
}));
```

### 8.3 缓存策略

```typescript
// 主进程中添加缓存层
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 5000; // 5秒缓存

ipcMain.handle('data:frequentlyAccessed', (event, key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) {
    return cached.data; // 缓存命中，直接返回
  }
  
  const data = await expensiveQuery(key);
  cache.set(key, { data, ts: Date.now() });
  return data;
});
```

---

## 九、今日总结

| 要点 | 关键内容 |
|:---|:---|
| **四种 IPC 模式** | invoke/handle（请求-响应）> send/on（单向通知）> webContents.send（主动推送）> MessagePort（流式大数据） |
| **选择原则** | 需要返回值用 invoke，纯通知用 send，主进程推送用 webContents.send，大数据用 MessagePort |
| **命名规范** | 资源域:操作（RESTful 风格）：`fs:read`, `user:login`, `settings:set` |
| **统一路由** | 用 IpcRouter 类管理所有 IPC handler，支持 namespace 分组 |
| **类型安全** | 共享类型定义 → typedInvoke 包装 → 两端自动推导 |
| **性能优化** | 批量请求、按需字段、缓存层、减少频率 |

### 下节预告：Day 5 —— 多窗口架构管理

明天我们将学习 VS Code 风格的多窗口管理体系：
- WindowManager 类的设计与实现
- 窗口间数据共享策略
- 子窗口 / 模态窗口 / 弹窗的最佳实践
- 窗口状态持久化（记住位置大小）

---

> 💬 你在项目中遇到过哪些 IPC 通信的坑？评论区分享！
> 👨‍💻 **系列教程持续更新**，关注「APP移动开发」不错过。
> ❤️ 觉得有帮助？点个"在看" 👇
