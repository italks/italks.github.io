# 那些没发布的功能：KAIROS 和 BUDDY 是什么？

> 阅读时长：5分钟
>
> 源码泄露暴露的隐藏彩蛋。

---

## 源码泄露，暴露了什么？

51 万行代码，不只是已发布的功能。

还有 **44 个 Feature Flags（功能开关）**，控制着一些"隐藏功能"。

这些功能，有的还在开发中，有的是内部专用，有的可能永远不会发布。

但它们揭示了：**Claude Code 背后的产品设计思路。**

---

## 44 个 Feature Flags：隐藏功能的开关

### 什么是 Feature Flags？

Feature Flags 是一种开发模式：

```typescript
if (featureFlags.ENABLE_KAIROS) {
  // 开启 KAIROS 功能
}
```

**特点：**

- 不用修改代码，只需改配置
- 可以动态开启/关闭
- 可以针对不同用户开放不同功能

### 源码中的 Feature Flags

```typescript
const featureFlags = {
  // 核心功能
  ENABLE_MEMORY_SYSTEM: true,
  ENABLE_CONTEXT_COMPRESSION: true,
  
  // 隐藏功能
  ENABLE_KAIROS: false,       // 后台守护进程
  ENABLE_BUDDY: false,        // 终端宠物
  ENABLE_VOICE_MODE: false,   // 语音输入
  ENABLE_UNDERCOVER: false,   // 隐身模式
  
  // 实验功能
  ENABLE_MULTI_AGENT: true,   // 多 Agent 协作
  ENABLE_WORKTREE: true,      // Worktree 模式
  
  // ... 更多
};
```

---

## 🔮 KAIROS：后台守护进程

### 这是什么？

**KAIROS 是 Claude Code 的"持续学习模式"。**

传统 AI：你问我答，被动响应
KAIROS：后台运行，主动学习

### 功能描述

从源码中可以看到：

```typescript
// KAIROS 核心逻辑
async function runKAIROS() {
  while (true) {
    // 1. 监听用户操作
    const observations = await observeUserActions();
    
    // 2. 分析是否有可提取的知识
    const knowledge = await extractKnowledge(observations);
    
    // 3. 写入记忆文件
    if (knowledge) {
      await writeToMemory(knowledge);
    }
    
    // 4. 等待下次观察
    await sleep(60000); // 每分钟检查一次
  }
}
```

**核心能力：**

- 监听用户的操作习惯
- 自动提取可复用的知识
- 写入 MEMORY.md 或 CLAUDE.md
- 让 AI "越来越懂你"

### 引用次数：150+ 次

**这意味着 KAIROS 是隐藏功能中工程量最大的模块。**

### 为什么没发布？

可能原因：

1. **隐私顾虑**：后台监听可能引发用户担忧
2. **效果不稳定**：自动提取的知识质量难保证
3. **产品定位**：可能还是"实验室功能"

---

## 🐾 BUDDY：终端宠物系统

### 这是什么？

**BUDDY 是一个"终端宠物"彩蛋。**

包含 18 个 ASCII 物种，每个有自己的属性：

```typescript
const buddySpecies = [
  {
    name: 'capybara',
    ascii: `
    ╭━━━━╮
    ┃● ‿ ●┃
    ╰━━━━╯
    `,
    attributes: {
      DEBUGGING: 5,    // 调试能力
      PATIENCE: 10,    // 耐心值
      CODING: 3,       // 编程能力
    }
  },
  // ... 更多物种
];
```

### 属性系统

每个宠物有属性：

| 属性 | 说明 |
|---|---|
| DEBUGGING | 调试能力 |
| PATIENCE | 耐心值 |
| CODING | 编程能力 |
| CREATIVITY | 创造力 |

### 互动方式

```typescript
// 宠物互动
async function interactWithBuddy() {
  // 1. 显示宠物
  displayBuddy();
  
  // 2. 根据用户操作改变状态
  if (userAction === 'fix_bug') {
    buddy.attributes.DEBUGGING += 1;
    buddy.mood = 'happy';
  }
  
  // 3. 显示心情
  displayMood(buddy.mood);
}
```

### 为什么是愚人节彩蛋？

**很可能。**

- 功能有趣但不实用
- 代码质量不高（像快速原型）
- 没有和核心功能整合

**但体现了产品设计的趣味性探索。**

---

## 🎤 VOICE_MODE：语音输入

### 这是什么？

**语音输入模式，让用户可以"说"而不是"打"。**

### 状态：已灰度开放

源码显示：

```typescript
if (featureFlags.ENABLE_VOICE_MODE && userInBetaProgram) {
  // 开启语音输入
}
```

**2026 年 3 月已开始灰度测试。**

### 工作原理

```typescript
// 简化的语音输入逻辑
async function handleVoiceInput(): Promise<string> {
  // 1. 录音
  const audio = await recordAudio();
  
  // 2. 转文字（使用 Whisper API）
  const text = await transcribeAudio(audio);
  
  // 3. 返回文字
  return text;
}
```

### 适用场景

- 快速输入长指令
- 不方便打字时
- 辅助功能需求

---

## 🎭 Undercover Mode：隐身模式

### 这是什么？

**Anthropic 员工专用功能。**

在公共 GitHub 仓库操作时，自动隐藏 AI 痕迹。

### 为什么需要？

Anthropic 员工在开源项目使用 Claude Code 时，不希望被识别出"这是 Anthropic 的人在用"。

### 实现方式

```typescript
// 简化的隐身逻辑
if (process.env.USER_TYPE === 'ant') {
  // 开启隐身模式
  enableUndercoverMode();
}

function enableUndercoverMode() {
  // 1. 移除 commit message 中的 AI 生成标记
  removeAITags();
  
  // 2. 随机化操作风格
  randomizeStyle();
  
  // 3. 不记录到公开日志
  disablePublicLogging();
}
```

### 启发

**AI 工具的使用痕迹，可能成为"指纹"。**

未来可能需要关注：

- 如何保护用户隐私
- 如何让 AI 辅助不暴露身份

---

## 内部版特权：USER_TYPE === 'ant'

### 内部员工的特殊待遇

源码中通过环境变量区分内部员工：

```typescript
if (process.env.USER_TYPE === 'ant') {
  // 解锁内部工具
  unlockInternalTools();
  
  // 使用不同的策略
  applyInternalStrategy();
}
```

### 内部专属功能

| 功能 | 说明 |
|---|---|
| **ConfigTool** | 高级配置工具 |
| **TungstenTool** | 内部专用工具 |
| **REPLTool** | 交互式编程环境 |
| **强验证机制** | 完成后自动运行对抗性验证 |
| **注释策略** | 仅在必要时添加注释 |
| **输出风格** | 假设用户上下文丢失时的降级处理 |

### 启发

**AI 工具的用户分层：**

- 普通用户：基础功能
- 高级用户：更多配置选项
- 内部员工：专属工具和策略

---

## 这些功能为什么被隐藏？

### 1. 不够成熟

- KAIROS：效果不稳定
- BUDDY：只是彩蛋

### 2. 隐私顾虑

- KAIROS：后台监听
- Undercover：涉及身份隐藏

### 3. 产品定位

- VOICE_MODE：可能不是核心功能
- 内部工具：不对外开放

### 4. 合规问题

- 数据存储
- 隐私政策
- 功能披露

---

## 对普通用户的启发

### 1. AI 工具还在快速迭代

今天没有的功能，明天可能就有了。

### 2. 功能开关是常见做法

很多功能"存在但未开放"，这是正常的。

### 3. 隐藏功能暴露产品方向

- KAIROS：AI 持续学习
- VOICE_MODE：多模态输入
- Undercover：隐私保护

---

## 总结

**源码泄露暴露的隐藏功能：**

| 功能 | 状态 | 说明 |
|---|---|---|
| **KAIROS** | 隐藏 | 后台守护进程，持续学习 |
| **BUDDY** | 彩蛋 | 终端宠物，18 个物种 |
| **VOICE_MODE** | 灰度 | 语音输入，已开放测试 |
| **Undercover** | 内部 | 员工隐身模式 |

**核心启发：**

- AI 工具的能力远超已发布功能
- 功能开关是常见的产品策略
- 隐藏功能暴露了产品方向

---

## 下一步：安全设计

探索了隐藏功能，下一步是关注安全。

**下一篇：四层权限系统：Claude Code 如何防止 AI "乱来"？**

我将拆解：

- 四层权限校验的设计
- 如何防止 AI 执行危险操作
- 对开发者安全设计的启发

---

💡 **APP 开发者** | 资讯·工具·教程·社区

📱 关注我们，获取更多移动开发技术干货

💬 加入技术交流群，与全国开发者一起成长

❤️ 觉得有用？点个"在看"分享给更多人！
