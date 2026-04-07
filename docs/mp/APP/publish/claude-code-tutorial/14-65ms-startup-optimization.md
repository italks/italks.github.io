# 启动只要 65 毫秒：Claude Code 的性能优化秘诀

> 阅读时长：6分钟
>
> 从源码里学到的启动速度优化技巧。

---

## 65 毫秒有多快？

**Claude Code 的启动时间是 65 毫秒。**

对比一下：

| 工具 | 启动时间 |
|---|---|
| Claude Code | 65ms |
| 典型 CLI 工具 | 200-500ms |
| Electron 应用 | 1-3s |

**为什么这么快？**

从泄露的源码中，我们找到了答案。

---

## 为什么启动速度重要？

### 用户体验

- **快**：用户愿意频繁使用
- **慢**：用户会尽量避免启动

### 开发效率

开发者每天可能启动工具几十次：

- 每次省 1 秒
- 每天省 1 分钟
- 每月省 30 分钟

**启动速度，决定了工具的"存在感"。**

---

## 秘诀 1：并行预加载

### 问题：串行初始化太慢

```typescript
// 传统做法：串行初始化
async function init() {
  await loadConfig();        // 30ms
  await loadKeychain();      // 20ms
  await loadMemory();        // 15ms
  // 总计：65ms
}
```

### 优化：并行初始化

```typescript
// Claude Code 的做法：并行初始化
async function init() {
  await Promise.all([
    loadConfig(),      // ┐
    loadKeychain(),    // ├─ 并行执行
    loadMemory(),      // ┘
  ]);
  // 总计：30ms（取决于最慢的那个）
}
```

**节省时间：35ms**

### 源码实现

```typescript
// main.tsx 导入前阶段
async function preInit() {
  // 并行触发两件事
  await Promise.all([
    readMDMConfig(),        // MDM 配置预读取
    macOSKeychainPrefetch() // 钥匙串预取
  ]);
  
  // 节省约 65ms 启动时间
}
```

---

## 秘诀 2：懒加载重型模块

### 问题：首屏加载太多

```typescript
// 传统做法：全部导入
import { OpenTelemetry } from '@opentelemetry/api';  // 400KB
import { grpc } from '@grpc/grpc-js';                // 700KB
// 首屏加载：1.1MB
```

### 优化：按需导入

```typescript
// Claude Code 的做法：动态导入
async function getOpenTelemetry() {
  const { OpenTelemetry } = await import('@opentelemetry/api');
  return OpenTelemetry;
}

async function getGrpc() {
  const { grpc } = await import('@grpc/grpc-js');
  return grpc;
}
```

**首屏加载减少 1.1MB。**

### 什么时候加载？

```typescript
// 用户需要时才加载
if (userNeedsTracing) {
  const otel = await getOpenTelemetry();
  // 开始追踪
}
```

### 哪些模块需要懒加载？

| 模块 | 大小 | 用途 | 加载时机 |
|---|---|---|---|
| OpenTelemetry | 400KB | 链路追踪 | 需要调试时 |
| gRPC | 700KB | 远程调用 | 需要网络请求时 |
| 大型 UI 库 | 500KB+ | 终端 UI | 用户交互时 |

---

## 秘诀 3：选择 Bun 而非 Node.js

### 为什么是 Bun？

| 对比项 | Node.js | Bun |
|---|---|---|
| 启动速度 | 较慢（~100ms） | 快（~10ms） |
| 模块解析 | CommonJS + ESM | ESM 优先 |
| TypeScript | 需要编译 | 原生支持 |
| 包管理 | npm/yarn/pnpm | 内置 |

### Bun 的优势

```typescript
// Node.js：需要编译 TypeScript
// tsconfig.json → tsc → dist/ → node dist/cli.js

// Bun：直接运行
bun run cli.ts
```

**省去了编译步骤，启动更快。**

### 源码中的 Bun 特性使用

```typescript
// 使用 Bun 的原生 API
import { file } from 'bun';

// Bun 优化的文件读取
const content = await file('package.json').text();

// Bun 的 HTTP 客户端
const response = await fetch('https://api.example.com');
```

---

## 秘诀 4：React + Ink 的终端 UI 优化

### 什么是 Ink？

**Ink 是一个用 React 写命令行界面的框架。**

```typescript
import React from 'react';
import { render, Text } from 'ink';

const App = () => (
  <Text color="green">
    Hello, CLI!
  </Text>
);

render(<App />);
```

### 为什么用 React？

| 优势 | 说明 |
|---|---|
| 组件化 | 复用 UI 组件 |
| 状态管理 | React Hooks |
| 生态 | 大量现成组件 |

### 性能优化点

```typescript
// 使用 React.memo 减少重渲染
const SearchBar = React.memo(({ query, onChange }) => (
  <Text>
    Search: {query}
  </Text>
));

// 使用 useMemo 缓存计算结果
const filteredList = useMemo(
  () => list.filter(item => item.includes(query)),
  [list, query]
);
```

---

## 秘诀 5：最小化依赖树

### 问题：依赖太重

```
项目依赖 → 传递依赖 → 更多依赖
├─ react → 3 个依赖
├─ ink → 5 个依赖
├─ commander → 0 个依赖
└─ zod → 1 个依赖

总计：可能上百个依赖
```

### 优化：选择轻量依赖

```typescript
// ❌ 重型依赖
import lodash from 'lodash';  // 70KB minified

// ✅ 轻量替代
import { debounce } from 'lodash-es';  // 按需导入
// 或自己实现
function debounce(fn, delay) { ... }
```

### Claude Code 的做法

- 使用 `commander`（轻量 CLI 解析）
- 使用 `zod`（轻量 Schema 校验）
- 避免大型通用库

---

## 性能优化清单

### 启动阶段

| 优化点 | 方法 | 效果 |
|---|---|---|
| 并行初始化 | Promise.all | -35ms |
| 懒加载模块 | 动态 import | -1.1MB |
| 选择 Bun | 原生 TS | -90ms |
| 最小依赖 | 轻量库 | -50ms |

### 运行时

| 优化点 | 方法 |
|---|---|
| React.memo | 减少重渲染 |
| useMemo | 缓存计算 |
| 虚拟列表 | 大数据量渲染 |

---

## 普通项目能借鉴什么？

### 1. 分析启动瓶颈

```bash
# Node.js
node --require perf-hooks script.js

# Bun
bun --bun script.js
```

### 2. 并行化初始化

```typescript
// 找出可以并行的步骤
await Promise.all([
  initConfig(),
  initDatabase(),
  initCache(),
]);
```

### 3. 懒加载非必要模块

```typescript
// 大型库按需导入
const heavyLib = await import('heavy-lib');
```

### 4. 选择轻量依赖

```bash
# 分析依赖大小
npm install -g cost-of-modules
cost-of-modules
```

### 5. 考虑 Bun

```bash
# 如果项目适合，迁移到 Bun
bun init
bun add react ink
```

---

## 总结

**65 毫秒的启动速度，来自这些优化：**

| 秘诀 | 效果 |
|---|---|
| 并行预加载 | -35ms |
| 懒加载重型模块 | -1.1MB |
| 选择 Bun | -90ms |
| React + Ink 优化 | 更流畅 |
| 最小化依赖 | -50ms |

**核心原则：**

- 能并行的不要串行
- 能懒加载的不要首屏加载
- 能轻量的不要重型

**性能优化不是"做完"的事，而是持续的过程。**

---

## 下一步：工程思维总结

学会了性能优化，下一步是总结升华。

**下一篇：从 Claude Code 学工程思维：好架构不是堆功能**

我将总结：

- 工具简单，调度复杂
- 安全是设计出来的
- 约束驱动设计
- 给开发者的最后建议

---

💡 **APP 开发者** | 资讯·工具·教程·社区

📱 关注我们，获取更多移动开发技术干货

💬 加入技术交流群，与全国开发者一起成长

❤️ 觉得有用？点个"在看"分享给更多人！
