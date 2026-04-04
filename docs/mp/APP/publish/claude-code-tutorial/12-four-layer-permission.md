# 四层权限系统：Claude Code 如何防止 AI "乱来"？

> 阅读时长：6分钟
>
> 从源码泄露看 AI 工具的安全设计。

---

## AI 工具的最大风险：AI 可能"乱来"

想象一下：

```
你：帮我清理一下临时文件

AI：好的
    → 执行 rm -rf /
    → 删除了整个系统
```

**这是 AI 工具最大的风险：AI 可能执行危险操作。**

Claude Code 是如何防止的？

答案：**四层权限系统。**

---

## 为什么 AI 工具需要权限系统？

### 传统软件 vs AI 工具

| 维度 | 传统软件 | AI 工具 |
|---|---|---|
| 操作来源 | 用户明确点击 | AI 自主决定 |
| 可预测性 | 高 | 低 |
| 风险 | 用户误操作 | AI "误解"后乱来 |

**AI 工具的风险更高，因为操作不是用户直接触发的。**

### 权限系统的目标

1. **防止误操作**：AI 理解错误导致的危险行为
2. **防止恶意指令**：用户被诱导输入危险命令
3. **提供可控性**：用户可以审查、拒绝操作
4. **记录可追溯**：所有操作有日志

---

## 四层权限系统架构

```
┌─────────────────────────────────────────┐
│ 第四层：AI 审查（最高层）                │
│ - 复杂情况的人工判断                     │
│ - 需要 AI 生成审查报告                   │
└─────────────────────────────────────────┘
                ↓ 拒绝
┌─────────────────────────────────────────┐
│ 第三层：白名单匹配                       │
│ - 明确允许的操作                         │
│ - 如：读取项目内文件                     │
└─────────────────────────────────────────┘
                ↓ 拒绝
┌─────────────────────────────────────────┐
│ 第二层：风险过滤                         │
│ - 识别潜在危险操作                       │
│ - 如：删除文件、执行 Shell 命令          │
└─────────────────────────────────────────┘
                ↓ 拒绝
┌─────────────────────────────────────────┐
│ 第一层：规则匹配（最快）                 │
│ - 快速放行低风险操作                     │
│ - 如：读取文件、搜索内容                 │
└─────────────────────────────────────────┘
                ↓ 拒绝
              阻止操作
```

---

## 第一层：规则匹配 —— 快速放行

### 目标

**快速识别低风险操作，直接放行。**

### 规则示例

```typescript
const lowRiskRules = [
  // 读取操作
  { action: 'read', target: 'project_files', risk: 'low' },
  
  // 搜索操作
  { action: 'grep', risk: 'low' },
  { action: 'find', risk: 'low' },
  
  // 查看操作
  { action: 'ls', risk: 'low' },
  { action: 'cat', risk: 'low' },
  
  // 测试操作
  { action: 'test', risk: 'low' },
];
```

### 处理逻辑

```typescript
function ruleMatch(action: Action): boolean {
  // 检查是否匹配低风险规则
  const matched = lowRiskRules.find(
    rule => rule.action === action.type
  );
  
  if (matched && matched.risk === 'low') {
    return true; // 放行
  }
  
  return false; // 进入下一层
}
```

**特点：**

- 速度快：简单匹配即可
- 覆盖大部分日常操作
- 不需要 AI 判断

---

## 第二层：风险过滤 —— 识别危险

### 目标

**识别潜在危险操作，需要用户确认。**

### 风险等级

| 风险等级 | 操作类型 | 示例 |
|---|---|---|
| **高** | 删除文件 | rm, del |
| **高** | 修改系统文件 | /etc/, /usr/ |
| **中** | 执行 Shell 命令 | npm install, git push |
| **中** | 网络请求 | wget, curl |
| **低** | 创建文件 | 新建源码文件 |

### 处理逻辑

```typescript
function riskFilter(action: Action): RiskLevel {
  // 检查危险关键词
  const dangerousKeywords = ['rm', 'del', 'format', 'drop'];
  if (dangerousKeywords.some(kw => action.command.includes(kw))) {
    return 'high';
  }
  
  // 检查敏感路径
  const sensitivePaths = ['/etc/', '/usr/', '~/.ssh/'];
  if (sensitivePaths.some(path => action.target.includes(path))) {
    return 'high';
  }
  
  // 检查网络操作
  if (action.type === 'network') {
    return 'medium';
  }
  
  return 'low';
}
```

### 用户确认

高风险操作需要用户明确确认：

```
AI 想要执行：
  rm -rf node_modules/

⚠️ 这是高风险操作，是否允许？
[允许] [拒绝] [修改命令]
```

---

## 第三层：白名单 —— 明确允许

### 目标

**用户明确允许的操作，不再确认。**

### 白名单配置

```json
{
  "allowedActions": [
    "read:*",
    "write:src/**",
    "bash:npm install",
    "bash:git commit",
    "bash:git push origin main"
  ],
  "deniedActions": [
    "bash:rm -rf /",
    "bash:rm -rf ~"
  ]
}
```

### 处理逻辑

```typescript
function whitelistMatch(action: Action): boolean {
  // 检查是否在白名单
  const isAllowed = config.allowedActions.some(
    pattern => matchPattern(action, pattern)
  );
  
  // 检查是否在黑名单
  const isDenied = config.deniedActions.some(
    pattern => matchPattern(action, pattern)
  );
  
  if (isDenied) return false;
  if (isAllowed) return true;
  
  return false; // 进入下一层
}
```

**特点：**

- 用户可自定义
- 常用操作不再确认
- 提高效率

---

## 第四层：AI 审查 —— 复杂情况判断

### 目标

**复杂情况，让 AI 生成审查报告，用户判断。**

### 适用场景

- 无法用规则覆盖的操作
- 需要理解上下文的操作
- 新类型的操作

### 处理逻辑

```typescript
async function aiReview(action: Action): Promise<ReviewResult> {
  // 让 AI 生成审查报告
  const report = await generateReviewReport(action);
  
  // 展示给用户
  console.log(`
## AI 审查报告

### 操作内容
${action.command}

### 风险评估
- 等级：${report.riskLevel}
- 原因：${report.reason}

### 可能的影响
${report.impacts.map(i => `- ${i}`).join('\n')}

### 建议
${report.suggestion}

是否允许？
  `);
  
  return await userConfirmation();
}
```

### 审查报告示例

```
## AI 审查报告

### 操作内容
npm install axios

### 风险评估
- 等级：低
- 原因：安装常用依赖包

### 可能的影响
- 在 package.json 中添加 axios 依赖
- 下载 axios 到 node_modules/
- 项目体积增加约 200KB

### 建议
允许执行，这是常见的依赖安装操作。

是否允许？ [允许] [拒绝]
```

---

## 熔断机制：异常行为的自动阻断

### 什么是熔断？

**连续多次被拒绝的操作，自动进入"冷却期"。**

### 实现逻辑

```typescript
class CircuitBreaker {
  private failureCount: number = 0;
  private threshold: number = 3;
  private cooldown: number = 60000; // 1分钟
  
  recordFailure(): void {
    this.failureCount++;
    
    if (this.failureCount >= this.threshold) {
      this.trip();
    }
  }
  
  trip(): void {
    console.log('⚠️ 检测到异常行为，已进入冷却期');
    setTimeout(() => this.reset(), this.cooldown);
  }
  
  isTripped(): boolean {
    return this.failureCount >= this.threshold;
  }
}
```

### 触发场景

- 连续 3 次被用户拒绝
- 连续 3 次触发高风险警告
- 尝试绕过权限系统

**熔断后，所有操作都需要用户确认。**

---

## 对开发者的启发

### 1. 权限设计要分层

不是所有操作都需要同等审查：

- 低风险：快速放行
- 中风险：规则过滤
- 高风险：用户确认
- 复杂情况：AI 审查

### 2. 白名单提高效率

常用操作加入白名单，减少确认次数。

### 3. 熔断机制防异常

连续失败自动熔断，防止恶意攻击。

### 4. 日志可追溯

所有操作记录日志，方便审计。

---

## 总结

**四层权限系统，防止 AI "乱来"。**

| 层级 | 功能 | 特点 |
|---|---|---|
| 第一层 | 规则匹配 | 快速放行低风险操作 |
| 第二层 | 风险过滤 | 识别危险操作 |
| 第三层 | 白名单 | 用户明确允许的操作 |
| 第四层 | AI 审查 | 复杂情况的人工判断 |

**核心思想：**

- 分层审查，不同风险不同对待
- 用户可控，所有危险操作需确认
- 异常熔断，防止恶意攻击

---

## 下一步：源码泄露暴露的安全漏洞

了解了权限系统，下一步是看它有什么漏洞。

**下一篇：源码泄露暴露的安全漏洞：我们能学到什么？**

我将拆解：

- PLAN 文件权限绕过
- 符号链接逃逸
- 对开发者的安全启示

---

💡 **APP 开发者** | 资讯·工具·教程·社区

📱 关注我们，获取更多移动开发技术干货

💬 加入技术交流群，与全国开发者一起成长

❤️ 觉得有用？点个"在看"分享给更多人！
