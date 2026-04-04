# 源码泄露暴露的安全漏洞：我们能学到什么？

> 阅读时长：5分钟
>
> PLAN 文件绕过、符号链接逃逸，这些坑别踩。

---

## 四层权限系统也有漏洞

上一篇介绍了 Claude Code 的四层权限系统。

**但泄露的源码显示，这个系统也有安全漏洞。**

这些漏洞不是"致命"的，但暴露了权限设计中的常见陷阱。

---

## 漏洞 1：PLAN 文件权限绕过

### 问题代码

```typescript
// 源码中的文件名匹配逻辑
function isAllowedFile(filename: string): boolean {
  const allowedPrefix = '.claude/plans/';
  
  // 问题：使用 startsWith 匹配
  if (filename.startsWith(allowedPrefix)) {
    return true;
  }
  
  return false;
}
```

### 漏洞分析

**`startsWith` 的问题：**

```
允许的文件：.claude/plans/my-plan.md
攻击文件：.claude/plans-evil/attack.md
```

`.claude/plans-evil/attack.md` 也会被匹配为允许文件！

因为 `.claude/plans-evil/` 也以 `.claude/plans` 开头。

### 修复方法

```typescript
// 正确的做法：精确匹配
function isAllowedFile(filename: string): boolean {
  const allowedDir = '.claude/plans/';
  
  // 使用路径解析，确保是子目录
  const resolved = path.resolve(filename);
  const allowedResolved = path.resolve(allowedDir);
  
  return resolved.startsWith(allowedResolved + path.sep);
}
```

### 启发

**文件路径匹配要小心：**

- `startsWith` 不够精确
- 使用 `path.resolve` 解析完整路径
- 考虑符号链接、`../` 等路径穿越

---

## 漏洞 2：符号链接处理不完整

### 问题代码

```typescript
// 源码中的符号链接处理
function resolveSymlink(filepath: string): string {
  // 问题：只处理一层符号链接
  if (fs.lstatSync(filepath).isSymbolicLink()) {
    return fs.readlinkSync(filepath);
  }
  return filepath;
}
```

### 漏洞分析

**多层符号链接可以"穿透"：**

```
/link1 → /link2
/link2 → /etc/passwd

resolveSymlink('/link1')
  → 只解析一层
  → 返回 '/link2'
  → 但 '/link2' 还是指向 '/etc/passwd' 的链接
```

### 攻击场景

1. 创建多层符号链接
2. 外层链接指向项目内（允许访问）
3. 内层链接指向敏感文件（不允许访问）
4. 绕过权限检查

### 修复方法

```typescript
// 正确的做法：递归解析所有符号链接
function resolveSymlink(filepath: string): string {
  const visited = new Set<string>();
  let current = filepath;
  
  while (fs.lstatSync(current).isSymbolicLink()) {
    // 防止循环链接
    if (visited.has(current)) {
      throw new Error('循环符号链接');
    }
    visited.add(current);
    
    // 解析一层
    current = fs.readlinkSync(current);
    
    // 转换为绝对路径
    if (!path.isAbsolute(current)) {
      current = path.resolve(path.dirname(filepath), current);
    }
  }
  
  return current;
}
```

### 启发

**符号链接是权限系统的"后门"：**

- 必须递归解析所有层
- 防止循环链接导致的死循环
- 最终路径要重新检查权限

---

## 漏洞 3：WebSocket 重连逻辑不一致

### 问题代码

```typescript
// Node.js 环境
function handleReconnect_Node() {
  // 问题：重连后不回放消息
  socket.on('connect', () => {
    console.log('重连成功');
    // 没有回放之前发送的消息
  });
}

// Bun 环境
function handleReconnect_Bun() {
  // 问题：重连后自动回放消息
  socket.on('connect', () => {
    console.log('重连成功');
    // 自动回放之前发送的消息
  });
}
```

### 漏洞分析

**不同运行时行为不一致：**

- Node.js：重连后不回放消息
- Bun：重连后自动回放消息

**可能导致：**

- 消息丢失
- 消息重复
- 难以调试的行为不一致

### 启发

**跨运行时代码要测试：**

- 不要假设所有环境行为一致
- 测试 Node.js 和 Bun 的差异
- 关键逻辑要有环境判断

---

## 漏洞 4：白名单过宽

### 问题代码

```typescript
// 源码中的白名单配置
const allowedCommands = [
  'npm install',
  'npm run',
  'npm test',
  // ...
];

function isAllowed(command: string): boolean {
  return allowedCommands.some(
    allowed => command.startsWith(allowed)
  );
}
```

### 漏洞分析

**`startsWith` 再次出问题：**

```
允许：npm install
攻击：npm install && rm -rf /
```

`npm install && rm -rf /` 以 `npm install` 开头，被允许！

### 修复方法

```typescript
// 正确的做法：精确匹配或解析命令
function isAllowed(command: string): boolean {
  // 解析命令
  const [cmd, ...args] = parseCommand(command);
  
  // 只检查第一个命令
  return allowedCommands.includes(cmd);
}

// 或者：禁止多命令
function isAllowed(command: string): boolean {
  if (command.includes('&&') || command.includes(';')) {
    return false; // 禁止多命令
  }
  
  return allowedCommands.some(
    allowed => command === allowed
  );
}
```

### 启发

**命令注入是经典漏洞：**

- `&&`, `;`, `|` 可以拼接多个命令
- 不要只检查开头，要解析完整命令
- 或直接禁止多命令语法

---

## 从漏洞中学到的安全设计原则

### 1. 精确匹配，不要模糊匹配

❌ `startsWith`
✅ 完整路径解析后比较

### 2. 递归处理，不要只处理一层

❌ 只解析一层符号链接
✅ 递归解析直到最终文件

### 3. 考虑所有环境

❌ 只测试 Node.js
✅ 测试所有支持的运行时

### 4. 禁止危险语法

❌ 允许 `&&` 等命令拼接
✅ 只允许单个命令

### 5. 深度防御

不要只依赖一层检查：

```
规则匹配 → 风险过滤 → 白名单 → AI 审查
```

每一层都要做检查，而不是"上一层通过了就不用检查"。

---

## 对开发者的实用建议

### 1. 文件路径处理

```typescript
// ✅ 正确
const resolved = path.resolve(filepath);
const normalized = path.normalize(filepath);

// ❌ 错误
const valid = filepath.startsWith('/project/');
```

### 2. 符号链接处理

```typescript
// ✅ 正确
const realPath = fs.realpathSync(filepath);

// ❌ 错误
if (fs.lstatSync(filepath).isSymbolicLink()) {
  return fs.readlinkSync(filepath);
}
```

### 3. 命令解析

```typescript
// ✅ 正确
const [cmd, ...args] = parseCommand(command);

// ❌ 错误
if (command.startsWith('npm')) { ... }
```

### 4. 环境判断

```typescript
// ✅ 正确
const runtime = process.versions.bun ? 'bun' : 'node';

// ❌ 错误
// 假设所有环境行为一致
```

---

## 总结

**源码泄露暴露的安全漏洞：**

| 漏洞 | 问题 | 修复 |
|---|---|---|
| PLAN 文件绕过 | `startsWith` 匹配不精确 | 完整路径解析 |
| 符号链接逃逸 | 只处理一层 | 递归解析所有层 |
| WebSocket 不一致 | 跨运行时行为不同 | 环境判断 + 测试 |
| 白名单过宽 | 允许命令拼接 | 精确匹配或禁止 |

**核心启发：**

- 精确匹配，不要模糊
- 递归处理，不要浅层
- 考虑所有环境
- 禁止危险语法
- 深度防御，多层检查

**安全不是"加上去"的功能，而是"设计出来"的。**

---

## 下一步：性能优化秘诀

了解了安全设计，下一步是学习性能优化。

**下一篇：启动只要 65 毫秒：Claude Code 的性能优化秘诀**

我将拆解：

- 预加载策略
- 懒加载重型模块
- Bun vs Node.js 的选择
- 普通项目能借鉴什么

---

💡 **APP 开发者** | 资讯·工具·教程·社区

📱 关注我们，获取更多移动开发技术干货

💬 加入技术交流群，与全国开发者一起成长

❤️ 觉得有用？点个"在看"分享给更多人！
