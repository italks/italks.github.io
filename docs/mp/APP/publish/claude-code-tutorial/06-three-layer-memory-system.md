# Claude Code 如何让 AI "记住" 你的项目？三层记忆系统揭秘

> 阅读时长：6分钟
>
> 从源码里学到的工业级记忆管理方案。

---

## 问题：AI 怎么才能"记住"整个项目？

一个中大型项目，代码量轻松超过 10 万行。

Claude 的上下文窗口是 20 万 Token，看起来够用。

但问题是：

- **代码只是项目的一部分**
- 还有对话历史、错误信息、API 文档
- 全部塞进去，窗口很快就爆

**Claude Code 的解法：分层管理。**

---

## 三层记忆系统架构

从泄露的源码中，我们看到了清晰的三层设计：

```
┌─────────────────────────────────────┐
│ 第一层：MEMORY.md（轻量索引）         │  始终在上下文中
│ - 每行 ≤ 150 字符                    │
│ - 项目关键信息摘要                    │
└─────────────────────────────────────┘
            ↓ 按需加载
┌─────────────────────────────────────┐
│ 第二层：CLAUDE.md（项目说明书）        │  需要时读取
│ - 技术栈、代码规范、已知坑            │
│ - 可引用外部文件                     │
└─────────────────────────────────────┘
            ↓ 动态更新
┌─────────────────────────────────────┐
│ 第三层：会话上下文（工作记忆）         │  当前对话
│ - 当前任务、最近的代码变更            │
│ - 超窗口后自动压缩                   │
└─────────────────────────────────────┘
```

---

## 第一层：MEMORY.md —— 轻量索引

### 设计原则

- **始终在上下文中**：不受窗口压缩影响
- **每行 ≤ 150 字符**：强制精炼
- **只放关键信息**：不是详细文档，而是索引

### 源码中的实现

```typescript
// 源码中的 MEMORY.md 处理逻辑
const MEMORY_FILE = 'MEMORY.md';
const MAX_LINE_LENGTH = 150;

function loadMemory(): string {
  if (!fs.existsSync(MEMORY_FILE)) return '';
  
  const content = fs.readFileSync(MEMORY_FILE, 'utf-8');
  const lines = content.split('\n');
  
  // 强制截断超过 150 字符的行
  const truncated = lines.map(line => 
    line.length > MAX_LINE_LENGTH 
      ? line.substring(0, MAX_LINE_LENGTH) 
      : line
  );
  
  return truncated.join('\n');
}
```

**150 字符限制的意义：**

- 强制开发者提炼核心信息
- 避免无节制堆内容
- 保证始终能放在上下文中

### 实际例子

```markdown
# 项目记忆

## 技术栈
React 18 + TypeScript + Vite

## 关键文件
- src/App.tsx：应用入口
- src/router/：路由配置

## 已知坑
- Ant Design Table 虚拟滚动需要手动开启
- Zustand 持久化有 5MB 限制

## 最近变更
- 2026-04-01：新增用户认证模块
```

**简洁、精准、始终可见。**

---

## 第二层：CLAUDE.md —— 项目说明书

### 设计原则

- **按需加载**：不是每次都读取
- **可以详细**：不受 150 字符限制
- **可引用外部文件**：支持相对路径引用

### 源码中的实现

```typescript
// 源码中的 CLAUDE.md 处理逻辑
const CLAUDE_FILE = 'CLAUDE.md';

function loadClaudeContext(): string {
  if (!fs.existsSync(CLAUDE_FILE)) return '';
  
  const content = fs.readFileSync(CLAUDE_FILE, 'utf-8');
  
  // 解析引用的外部文件
  const references = parseReferences(content);
  const externalContent = references.map(ref => {
    const filePath = path.resolve(path.dirname(CLAUDE_FILE), ref);
    return fs.readFileSync(filePath, 'utf-8');
  });
  
  return content + '\n' + externalContent.join('\n');
}

// 支持语法：@file:./path/to/file.md
function parseReferences(content: string): string[] {
  const regex = /@file:\.\/([^\s]+)/g;
  const matches = [];
  let match;
  while ((match = regex.exec(content)) !== null) {
    matches.push(match[1]);
  }
  return matches;
}
```

**支持引用外部文件的好处：**

- CLAUDE.md 保持简洁
- 详细文档可以放在 `docs/` 目录
- 需要时按需加载

### 实际例子

```markdown
# 项目说明书

## 技术栈
- React 18 + TypeScript
- Vite 构建工具
- Ant Design 5.x

## 代码组织
详见 @file:./docs/architecture.md

## API 文档
详见 @file:./docs/api.md

## 开发规范
详见 @file:./docs/conventions.md
```

---

## 第三层：会话上下文 —— 工作记忆

### 设计原则

- **动态更新**：随着对话实时变化
- **自动压缩**：超窗口后自动摘要
- **保留关键信息**：用户意图、错误记录、待办事项

### 源码中的压缩策略

```typescript
// 源码中的上下文压缩逻辑
const CONTEXT_LIMIT = 200000; // 20万 Token

async function compressContext(messages: Message[]): Promise<Message[]> {
  if (estimateTokens(messages) < CONTEXT_LIMIT) {
    return messages;
  }
  
  // 9段式压缩策略
  const summary = {
    userIntent: extractUserIntent(messages),
    errorRecords: extractErrors(messages),
    pendingTasks: extractTasks(messages),
    codeChanges: extractChanges(messages),
    // ...更多字段
  };
  
  // 生成结构化摘要
  const compressed = await generateSummary(summary);
  
  return [compressed, ...recentMessages];
}
```

**9 段式压缩字段：**

| 字段 | 说明 |
|---|---|
| userIntent | 用户的原始意图 |
| errorRecords | 错误修复记录 |
| pendingTasks | 待办任务 |
| codeChanges | 项目结构变更 |
| decisionsMade | 已做出的决策 |
| assumptions | 当前假设 |
| constraints | 已知约束 |
| contextFiles | 已读取的文件 |
| recentInteractions | 最近交互摘要 |

---

## 三层如何协同工作？

### 场景 1：启动项目

```
1. 读取 MEMORY.md → 放入上下文（始终可见）
2. 读取 CLAUDE.md → 按需加载（理解项目背景）
3. 初始化会话上下文 → 准备接收用户指令
```

### 场景 2：用户提问

```
用户：帮我添加一个搜索功能

1. AI 检查 MEMORY.md → 了解技术栈（React + TypeScript）
2. AI 检查 CLAUDE.md → 了解代码组织结构
3. AI 更新会话上下文 → 记录用户意图
4. AI 执行任务 → 修改代码、创建文件
```

### 场景 3：对话过长

```
1. 检测到上下文接近窗口限制
2. 触发压缩机制
3. 保留 MEMORY.md（不受影响）
4. 压缩会话上下文 → 生成结构化摘要
5. 继续对话
```

---

## 为什么这个设计比单纯扩大窗口更聪明？

### 对比

| 方案 | 问题 |
|---|---|
| 扩大窗口 | 成本高、速度慢、AI 容易迷失 |
| 三层管理 | 按重要性分层、始终保留关键信息 |

### 核心思想

**不是"装多少"，而是"装什么"。**

- 关键信息（MEMORY.md）：始终可见
- 详细文档（CLAUDE.md）：按需加载
- 对话历史：动态压缩

**类比人类记忆：**

- 工作记忆（当前任务）→ 会话上下文
- 长期记忆（知识库）→ CLAUDE.md
- 快速索引（随时可查）→ MEMORY.md

---

## 普通用户能学到什么？

### 1. 建立自己的记忆系统

在项目中创建：
- `MEMORY.md`：关键信息索引
- `CLAUDE.md`：项目说明书

### 2. 控制信息量

- 重要信息 ≤ 150 字符/行
- 详细文档放在外部文件，按需引用

### 3. 定期更新

- 项目变更后，更新 MEMORY.md
- 发现新坑，补充到 CLAUDE.md

### 4. 分层思维

不是所有信息都同等重要，学会分级管理。

---

## 总结

Claude Code 的三层记忆系统：

| 层级 | 文件 | 作用 | 特点 |
|---|---|---|---|
| 第一层 | MEMORY.md | 轻量索引 | 始终可见，≤150字符/行 |
| 第二层 | CLAUDE.md | 项目说明书 | 按需加载，可引用外部文件 |
| 第三层 | 会话上下文 | 工作记忆 | 动态更新，自动压缩 |

**核心思想：按重要性分层管理，而非无差别堆内容。**

这个设计，比单纯扩大窗口更聪明、更实用。

---

## 下一步：上下文压缩的 9 段式策略

知道了三层架构，下一步是理解：**压缩时保留什么、舍弃什么？**

**下一篇：上下文压缩：AI 是怎么"断舍离"的？**

我将从源码中拆解：
- 9 段式压缩策略的详细字段
- 保留什么、舍弃什么
- 对普通人进行长对话的启发

---

💡 **APP 开发者** | 资讯·工具·教程·社区

📱 关注我们，获取更多移动开发技术干货

💬 加入技术交流群，与全国开发者一起成长

❤️ 觉得有用？点个"在看"分享给更多人！
