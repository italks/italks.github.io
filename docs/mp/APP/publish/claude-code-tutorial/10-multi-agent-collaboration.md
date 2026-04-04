# 多 Agent 协作：Claude Code 的"团队模式"怎么用？

> 阅读时长：6分钟
>
> 一个人也能拥有"开发团队"。

---

## 一个 AI，还是多个 AI？

传统 AI 编程工具，是一个 AI 处理所有任务：

```
你 → AI → 完成任务
```

问题：**有些任务需要并行处理。**

比如：

- 同时搜索多个文件
- 同时修改不同模块
- 需要协调的复杂任务

**Claude Code 的解法：多 Agent 协作。**

```
你 → 主 Agent → 子 Agent 1
              → 子 Agent 2
              → 子 Agent 3
```

**一个人，也能拥有"开发团队"。**

---

## 三种协作模式

从泄露的源码中，我们看到了三种模式：

| 模式 | 适用场景 | 特点 |
|---|---|---|
| **Fork** | 并行读操作 | 字节级副本，复用 prompt cache |
| **Teammate** | 需协调的独立任务 | 文件系统通信，独立终端面板 |
| **Worktree** | 可能冲突的并行修改 | 独立 git 分支，物理隔离 |

---

## 模式 1：Fork —— 并行读操作

### 适用场景

- 同时搜索多个文件
- 同时分析多个模块
- 不修改代码，只读取信息

### 工作原理

```
主 Agent
  ├─ Fork 1：搜索 src/components/
  ├─ Fork 2：搜索 src/utils/
  └─ Fork 3：搜索 src/api/
```

**关键特点：**

- **字节级副本**：Fork 出的 Agent 共享主 Agent 的 prompt cache
- **只读操作**：不会修改文件，避免冲突
- **高效并行**：多个任务同时执行

### 源码实现

```typescript
// 简化的 Fork 逻辑
function forkAgent(context: AgentContext): Agent[] {
  const forks: Agent[] = [];
  
  for (const task of tasks) {
    // 创建字节级副本
    const forkContext = {
      ...context,
      // 共享 prompt cache
      promptCache: context.promptCache,
      // 只读权限
      permissions: ['read']
    };
    
    forks.push(new Agent(forkContext));
  }
  
  return forks;
}
```

### 实际例子

```
你：帮我分析项目中所有的 API 请求

主 Agent：
  ├─ Fork 1：分析 src/api/auth.ts
  ├─ Fork 2：分析 src/api/users.ts
  └─ Fork 3：分析 src/api/products.ts

汇总：
- 共 15 个 API 请求
- 使用 axios 库
- 统一的错误处理
```

---

## 模式 2：Teammate —— 需协调的独立任务

### 适用场景

- 不同模块的并行开发
- 需要协调但不会直接冲突
- 独立的子任务

### 工作原理

```
主 Agent（协调者）
  ├─ Teammate 1：开发搜索功能
  └─ Teammate 2：开发登录功能
```

**关键特点：**

- **文件系统通信**：通过文件"邮箱"传递消息
- **独立终端面板**：每个 Teammate 有自己的输出
- **需要协调**：主 Agent 负责调度和合并

### 源码实现

```typescript
// 简化的 Teammate 逻辑
class TeammateAgent {
  private mailbox: string;
  
  constructor(task: Task) {
    // 创建通信邮箱
    this.mailbox = `.claude/mailbox/${task.id}.md`;
  }
  
  // 发送消息
  sendMessage(message: string): void {
    fs.writeFileSync(this.mailbox, message);
  }
  
  // 接收消息
  receiveMessage(): string {
    return fs.readFileSync(this.mailbox, 'utf-8');
  }
}
```

### 实际例子

```
你：帮我开发搜索和登录功能

主 Agent：
  ├─ Teammate 1：开发搜索功能
  │   - 创建 SearchBar.tsx
  │   - 完成，通知主 Agent
  │
  └─ Teammate 2：开发登录功能
      - 创建 LoginForm.tsx
      - 完成，通知主 Agent

主 Agent 汇总：
- 搜索功能：SearchBar.tsx 已创建
- 登录功能：LoginForm.tsx 已创建
- 需要集成到 App.tsx
```

---

## 模式 3：Worktree —— 可能冲突的并行修改

### 适用场景

- 同时修改同一文件的不同部分
- 需要独立 git 历史
- 物理隔离避免冲突

### 工作原理

```
主 Agent（主工作区）
  ├─ Worktree 1：feature-search 分支
  └─ Worktree 2：feature-login 分支
```

**关键特点：**

- **独立 git 分支**：每个 Worktree 有自己的分支
- **物理隔离工作区**：不同目录，完全隔离
- **自动合并**：完成后合并回主分支

### 源码实现

```typescript
// 简化的 Worktree 逻辑
class WorktreeAgent {
  private worktreePath: string;
  private branch: string;
  
  constructor(task: Task) {
    this.branch = `feature/${task.name}`;
    this.worktreePath = `.claude/worktrees/${task.id}`;
    
    // 创建 git worktree
    execSync(`git worktree add ${this.worktreePath} -b ${this.branch}`);
  }
  
  // 完成后合并
  merge(): void {
    execSync(`git checkout main`);
    execSync(`git merge ${this.branch}`);
    execSync(`git worktree remove ${this.worktreePath}`);
  }
}
```

### 实际例子

```
你：同时开发搜索和登录功能，可能会有冲突

主 Agent：
  ├─ Worktree 1：feature-search 分支
  │   - 独立工作区：.claude/worktrees/search/
  │   - 修改 App.tsx（添加搜索路由）
  │
  └─ Worktree 2：feature-login 分支
      - 独立工作区：.claude/worktrees/login/
      - 修改 App.tsx（添加登录路由）

完成后：
- 合并 feature-search → main
- 合并 feature-login → main
- 处理冲突（如有）
```

---

## 什么时候用哪种模式？

### 决策树

```
任务类型？
├─ 只读操作（搜索、分析）
│   └─ 使用 Fork 模式
│
├─ 需要修改代码
│   ├─ 修改不同文件
│   │   └─ 使用 Teammate 模式
│   │
│   └─ 修改同一文件
│       └─ 使用 Worktree 模式
```

### 对比表

| 场景 | Fork | Teammate | Worktree |
|---|---|---|---|
| 搜索多个文件 | ✅ | ❌ | ❌ |
| 分析多个模块 | ✅ | ❌ | ❌ |
| 并行开发不同功能 | ❌ | ✅ | ✅ |
| 修改同一文件 | ❌ | ❌ | ✅ |
| 需要 git 历史 | ❌ | ❌ | ✅ |
| 需要协调 | ❌ | ✅ | ✅ |

---

## 普通人用得着吗？实际案例演示

### 案例 1：搜索项目中的所有 TODO

```
你：找出项目中所有的 TODO 注释

AI 使用 Fork 模式：
  ├─ Fork 1：搜索 src/
  ├─ Fork 2：搜索 tests/
  └─ Fork 3：搜索 docs/

结果：
- src/utils.ts:15: TODO: 优化性能
- src/api/auth.ts:42: TODO: 添加错误处理
- tests/auth.test.ts:8: TODO: 补充边界测试
```

### 案例 2：同时开发两个功能

```
你：帮我添加搜索和登录功能

AI 使用 Teammate 模式：
  ├─ Teammate 1：开发搜索功能
  │   - 创建 SearchBar.tsx
  │   - 创建 useSearch.ts
  │
  └─ Teammate 2：开发登录功能
      - 创建 LoginForm.tsx
      - 创建 useAuth.ts

结果：
- 搜索功能：已完成
- 登录功能：已完成
- 需要集成测试
```

### 案例 3：重构大型项目

```
你：重构整个项目的 API 层，支持缓存

AI 使用 Worktree 模式：
  ├─ Worktree 1：重构 auth API
  ├─ Worktree 2：重构 users API
  └─ Worktree 3：重构 products API

每个 Worktree：
- 独立分支
- 独立测试
- 完成后合并
```

---

## 总结

**多 Agent 协作，让一个人也能拥有"开发团队"。**

三种模式：

| 模式 | 适用场景 | 特点 |
|---|---|---|
| **Fork** | 并行读操作 | 字节级副本，高效并行 |
| **Teammate** | 独立任务 | 文件通信，需要协调 |
| **Worktree** | 并行修改 | 独立分支，物理隔离 |

**核心思想：**

- 不是所有任务都要串行
- 根据任务类型选择协作模式
- 让 AI 帮你并行处理

---

## 下一步：那些没发布的功能

学会了进阶功能，下一步是探索隐藏功能。

**下一篇：那些没发布的功能：KAIROS 和 BUDDY 是什么？**

我将拆解源码中发现的隐藏特性：

- 44 个 Feature Flags
- KAIROS：后台守护进程
- BUDDY：终端宠物系统
- Undercover Mode：隐身模式

---

💡 **APP 开发者** | 资讯·工具·教程·社区

📱 关注我们，获取更多移动开发技术干货

💬 加入技术交流群，与全国开发者一起成长

❤️ 觉得有用？点个"在看"分享给更多人！
