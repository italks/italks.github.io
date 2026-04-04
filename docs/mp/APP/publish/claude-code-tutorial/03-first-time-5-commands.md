# 第一次用 Claude Code？这 5 个命令让你效率翻倍

> 阅读时长：5分钟
>
> 别只会打字提问，斜杠命令才是正确打开方式。

---

## 你可能一直在"错误"地用 Claude Code

很多人用 Claude Code，就像用 ChatGPT 一样：

> "帮我看看这段代码有没有问题"
> "帮我写个测试"
> "帮我提交代码"

**不是不行，而是效率太低。**

Claude Code 提供了 50+ 斜杠命令，专门为开发场景优化。

**用对命令，效率翻倍。**

---

## 命令 1：/commit —— 让 AI 帮你写提交信息

### 传统方式

写完代码 → 打开终端 → `git add .` → `git commit -m "..."`

然后开始纠结：这个提交信息怎么写？

### Claude Code 方式

```
/commit
```

AI 会：
1. 分析当前变更
2. 自动生成符合规范的提交信息
3. 直接提交

**示例：**

```bash
# 你执行
/commit

# AI 生成
feat(auth): add password strength validation

- Add regex pattern for password validation
- Update login form with strength indicator
- Add unit tests for validation logic
```

**为什么高效？**
- 不用纠结怎么写提交信息
- 自动符合 Conventional Commits 规范
- 变更内容自动分析，不会遗漏

---

## 命令 2：/review —— 提交前的代码审查

### 传统方式

写完代码 → 自我审查 → 可能遗漏问题 → 被同事 Code Review 发现

### Claude Code 方式

```
/review
```

AI 会：
1. 分析当前变更
2. 检查常见问题（安全、性能、代码风格）
3. 给出修改建议

**示例输出：**

```
## 代码审查结果

### 潜在问题
1. **安全风险**：用户输入未转义，存在 XSS 风险
   - 文件：src/components/Login.tsx
   - 行号：42
   - 建议：使用 DOMPurify 转义用户输入

2. **性能问题**：循环中重复创建对象
   - 文件：src/utils/formatter.ts
   - 行号：18
   - 建议：将对象创建移到循环外部

### 改进建议
- 添加错误边界处理
- 补充单元测试覆盖
```

**为什么高效？**
- 提交前发现问题，减少返工
- 覆盖安全、性能、代码风格多个维度
- 具体到文件和行号，直接定位问题

---

## 命令 3：/doctor —— 解决"在我电脑上跑不起来"

### 传统方式

同事说："在我电脑上能跑，你那里不行？"

然后开始排查：
- Node 版本不对？
- 依赖没装？
- 环境变量没配？

### Claude Code 方式

```
/doctor
```

AI 会自动检查：

```bash
# 环境诊断报告

## 系统信息
- Node.js：v22.12.0 ✅
- pnpm：v8.15.0 ✅
- 操作系统：macOS 14.3 ✅

## 项目配置
- package.json：存在 ✅
- node_modules：存在 ✅
- .env 文件：缺失 ⚠️

## 发现的问题
1. 缺少 .env 文件
   - 需要配置：DATABASE_URL、API_KEY
   - 参考 .env.example

2. 端口 3000 被占用
   - 运行：lsof -i :3000
   - 或修改端口：PORT=3001 npm run dev
```

**为什么高效？**
- 自动诊断常见环境问题
- 给出具体修复步骤
- 减少"在我电脑上能跑"的扯皮时间

---

## 命令 4：/test —— 自动生成测试用例

### 传统方式

写完功能 → 想写测试但不知道测什么 → 放弃 → 被后续 Bug 打脸

### Claude Code 方式

```
/test
```

AI 会：
1. 分析当前代码
2. 生成测试用例
3. 运行测试

**示例：**

```typescript
// 你写的代码
export function validateEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// AI 生成的测试
describe('validateEmail', () => {
  it('should return true for valid email', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should return false for invalid email', () => {
    expect(validateEmail('invalid-email')).toBe(false);
  });

  it('should return false for empty string', () => {
    expect(validateEmail('')).toBe(false);
  });
});
```

**为什么高效？**
- 不用想测试用例，AI 帮你生成
- 覆盖正常、异常、边界情况
- 自动运行，立即知道结果

---

## 命令 5：/diff —— 比 git diff 更智能的变更查看

### 传统方式

```bash
git diff
```

看到的是一堆 `+` 和 `-` 的文本对比。

### Claude Code 方式

```
/diff
```

AI 会：
1. 分析变更
2. 用自然语言解释改了什么
3. 标注关键修改点

**示例输出：**

```
## 本次变更摘要

### 修改范围
- 文件数：3
- 新增行：45
- 删除行：12

### 主要改动

1. **新增密码强度验证**（src/components/Login.tsx）
   - 添加正则验证逻辑
   - 更新 UI 显示强度指示器

2. **修复 XSS 漏洞**（src/utils/sanitize.ts）
   - 使用 DOMPurify 转义用户输入
   - 替换原有的简单 replace 方案

3. **补充单元测试**（tests/auth.test.ts）
   - 新增 5 个测试用例
   - 覆盖率从 60% 提升到 85%
```

**为什么高效？**
- 不用看代码对比，直接看自然语言总结
- 快速理解改动的影响范围
- 提交前自查更方便

---

## 5 个命令的组合使用场景

### 场景 1：日常开发流程

```
1. 写代码
2. /diff      → 确认改动
3. /review    → 代码审查
4. /test      → 运行测试
5. /commit    → 提交代码
```

### 场景 2：接手别人的项目

```
1. /doctor    → 诊断环境问题
2. /diff      → 理解当前改动
3. /review    → 检查潜在问题
```

### 场景 3：快速修复 Bug

```
1. 修复代码
2. /test      → 确保修复有效
3. /commit    → 提交修复
```

---

## 总结：5 个命令，足够日常使用

| 命令 | 作用 | 适用场景 |
|---|---|---|
| `/commit` | 自动生成提交信息 | 每次提交代码 |
| `/review` | 代码审查 | 提交前自查 |
| `/doctor` | 环境诊断 | 环境问题排查 |
| `/test` | 生成测试 | 写完功能后 |
| `/diff` | 智能变更查看 | 理解改动内容 |

**这 5 个命令，覆盖了 80% 的日常开发场景。**

掌握它们，你的效率至少翻倍。

---

## 下一步：让 AI 真正理解你的项目

会用命令了，但 AI 还是不够"懂"你的项目？

**下一篇：我的 CLAUDE.md 模板——让 AI 从第一天就懂你的项目**

我会给你一个可以直接复制粘贴的模板，让 AI 真正理解：
- 你的技术栈
- 你的代码组织方式
- 你踩过的坑

---

💡 **APP 开发者** | 资讯·工具·教程·社区

📱 关注我们，获取更多移动开发技术干货

💬 加入技术交流群，与全国开发者一起成长

❤️ 觉得有用？点个"在看"分享给更多人！
