> **摘要：** 2026年3月31日，Anthropic 的 AI 编程助手 Claude Code 因 npm 包中遗留的 source map 文件，意外泄露了 1906 个文件、51.2 万行 TypeScript 源码。这不是 Anthropic 第一次犯同样的错——2025年2月就因此"翻车"过。本文从事件始末讲起，深入解析 source map 的工作原理、安全风险，以及开发者如何在自己的项目中规避此类泄露。
>
> 📖 **阅读时长：** 约 8 分钟

---

## 一、事件回顾：51 万行代码，一夜"开源"

2026年3月31日，安全研究员 Chaofan Shou（@shoucccc）在 X 上发了一条推文：

> "Claude Code's source code has been leaked via a map file in their npm package..."

**发生了什么？**

Anthropic 官方发布到 npm registry 的 `@anthropic-ai/claude-code` 包（版本 v2.1.88），意外携带了一个约 **60MB** 的 `cli.js.map` 文件。

这个 source map 文件里，包含了完整的、未混淆的 TypeScript 源码映射信息。任何人只需下载 npm 包，就能通过工具**一键还原出原始源码**。

**泄露规模：**
- 📁 文件数：**1906 个 TypeScript 文件**
- 📝 代码行数：**512,000+ 行**
- 📦 包大小：约 **60MB**（仅 source map 文件）

**更尴尬的是：**
这不是 Anthropic 第一次因此"翻车"。早在 **2025年2月**，Claude Code 就因同样原因泄露过源码。一年后，同样的配置失误再次发生。

---

## 二、Source Map 是什么？为什么会泄露源码？

### 2.1 Source Map 的本意：帮助调试

现代前端/Node.js 项目通常会对代码进行：

1. **编译**（TypeScript → JavaScript）
2. **压缩**（删除空白、缩短变量名）
3. **混淆**（进一步保护代码逻辑）

这些操作会让代码体积更小、执行更快，但**可读性几乎为零**。压缩后的代码长这样：

```javascript
// 原始 TypeScript
async function fetchUserData(userId: string): Promise<User> {
  const response = await api.get(`/users/${userId}`);
  return response.data;
}

// 压缩混淆后
async function t(e){const n=await a.get(`/users/${e}`);return n.data}
```

当生产环境报错时，开发者看到的是 `t is not a function`，完全无法定位问题。

**Source Map 就是桥梁。**

它是一个 JSON 文件，记录了压缩后代码与原始代码的**位置映射关系**：

```json
{
  "version": 3,
  "sources": ["../src/api/user.ts", "../src/utils/request.ts"],
  "names": ["fetchUserData", "userId", "response", "api", "get", "data"],
  "mappings": "AAAA,OAASA,WAAW,CAAG...",
  "file": "bundle.js",
  "sourceRoot": ""
}
```

有了 source map，浏览器/Node.js 就能在报错时：

- 显示**原始文件名**和**行号**（而非压缩后位置）
- 展示**原始变量名**（而非混淆后的 `a`, `b`, `c`）

### 2.2 泄露原理：映射是双向的

问题在于，**source map 的映射是双向的**。

它不仅能将压缩后位置 → 原始位置，也能**逆向还原**原始源码。

只要有 `.map` 文件，任何人都可以还原出完整源码。

---

## 2.3 实操：从 Source Map 还原源码

下面演示几种常见的还原方法。

> ⚠️ **声明：** 以下内容仅供安全研究和自查使用，请勿用于非法获取他人源码。

### 方法一：直接读取 `sourcesContent` 字段

最简单的方式——很多 source map 文件**直接包含源码**。

打开 `cli.js.map`，你会看到类似结构：

```json
{
  "version": 3,
  "sources": [
    "../src/cli/index.ts",
    "../src/tools/BashTool.ts",
    "../src/core/agent.ts"
  ],
  "sourcesContent": [
    "// 这里就是完整的原始源码\nimport { Agent } from './agent';\n...",
    "// BashTool.ts 源码\n...",
    "// agent.ts 源码\n..."
  ],
  "mappings": "AAAA,OAASA...",
  "names": ["Agent", "BashTool", "config"]
}
```

**`sourcesContent` 数组中，每个元素就是对应文件的完整源码！**

手动提取脚本：

```javascript
// extract-sources.js
const fs = require('fs');
const path = require('path');

// 读取 source map 文件
const sourceMap = JSON.parse(fs.readFileSync('cli.js.map', 'utf-8'));

// 创建输出目录
const outputDir = './extracted-sources';
fs.mkdirSync(outputDir, { recursive: true });

// 遍历所有源文件
sourceMap.sources.forEach((sourcePath, index) => {
  const content = sourceMap.sourcesContent?.[index];
  
  if (content) {
    // 清理路径（移除 ../ 前缀）
    const cleanPath = sourcePath.replace(/^\.\.\//, '');
    const outputPath = path.join(outputDir, cleanPath);
    
    // 确保目录存在
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    
    // 写入源码
    fs.writeFileSync(outputPath, content, 'utf-8');
    console.log(`✅ 提取: ${cleanPath}`);
  }
});

console.log(`\n🎉 完成！共提取 ${sourceMap.sources.length} 个文件`);
```

运行：

```bash
node extract-sources.js
```

输出：

```
✅ 提取: src/cli/index.ts
✅ 提取: src/tools/BashTool.ts
✅ 提取: src/core/agent.ts
...
🎉 完成！共提取 1906 个文件
```

### 方法二：使用 source-map 库（无 sourcesContent 时）

如果 source map 未包含 `sourcesContent`（部分配置会移除），可以通过映射表**逐字符还原**：

```javascript
// restore-from-mappings.js
const { SourceMapConsumer } = require('source-map');
const fs = require('fs');

async function restoreSource(mapPath, generatedCodePath, outputDir) {
  const sourceMap = JSON.parse(fs.readFileSync(mapPath, 'utf-8'));
  const generatedCode = fs.readFileSync(generatedCodePath, 'utf-8');
  
  const consumer = await new SourceMapConsumer(sourceMap);
  
  // 获取所有源文件
  const sources = consumer.sources;
  console.log(`发现 ${sources.length} 个源文件`);
  
  // 为每个源文件创建缓冲区
  const sourceBuffers = {};
  sources.forEach(src => {
    sourceBuffers[src] = [];
  });
  
  // 遍历生成的代码，反向映射每个位置
  const lines = generatedCode.split('\n');
  
  lines.forEach((line, lineIndex) => {
    for (let col = 0; col < line.length; col++) {
      const pos = consumer.originalPositionFor({
        line: lineIndex + 1,
        column: col
      });
      
      if (pos.source && pos.line && pos.column) {
        // 将字符映射回原始位置
        if (!sourceBuffers[pos.source][pos.line - 1]) {
          sourceBuffers[pos.source][pos.line - 1] = [];
        }
        sourceBuffers[pos.source][pos.line - 1][pos.column] = line[col];
      }
    }
  });
  
  // 写入文件
  fs.mkdirSync(outputDir, { recursive: true });
  
  sources.forEach(src => {
    const cleanPath = src.replace(/^\.\.\//, '');
    const outputPath = path.join(outputDir, cleanPath);
    const content = sourceBuffers[src].map(row => (row || []).join('')).join('\n');
    
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, content);
    console.log(`✅ 还原: ${cleanPath}`);
  });
  
  consumer.destroy();
}

restoreSource('cli.js.map', 'cli.js', './restored-sources/');
```

### 方法三：使用现成工具

社区已有多个开源工具：

**1. source-map-cli**

```bash
# 安装
npm install -g source-map-cli

# 还原单个位置
source-map lookup cli.js.map 1 100
# 输出：src/cli/index.ts:42:15

# 批量还原
source-map-restore cli.js.map -o ./output/
```

**2. sourcemap-to-sources**

```bash
npm install -g sourcemap-to-sources

sourcemap-to-sources cli.js.map -o ./extracted/
```

**3. 在线工具**

如果只是快速查看，可以用在线工具：
- https://sokra.github.io/source-map-visualization/
- 上传 `.map` 文件，可视化查看映射关系和源码

### 方法四：浏览器开发者工具

如果你有访问网站权限，且网站加载了 source map：

1. 打开 Chrome DevTools（F12）
2. 进入 Sources 面板
3. 左侧文件树中找到原始源码文件（非压缩版）
4. 右键 → Save as...

**原理：** 浏览器会自动加载 `.map` 文件并解析源码。

### 实际案例：Claude Code 还原演示

Claude Code 泄露后，社区迅速进行了还原。GitHub 上出现了多个归档仓库：

```bash
# 克隆泄露的源码
git clone https://github.com/xxx/claude-code-leaked

# 目录结构
claude-code-leaked/
├── src/
│   ├── cli/
│   │   ├── index.ts           # 入口文件
│   │   ├── commands/          # 50+ 命令实现
│   │   │   ├── commit.ts
│   │   │   ├── review.ts
│   │   │   └── voice.ts       # 未发布的语音命令
│   ├── tools/                 # 40+ 工具模块
│   │   ├── BashTool.ts
│   │   ├── FileReadTool.ts
│   │   ├── GrepTool.ts
│   │   └── AgentTool.ts
│   ├── core/
│   │   ├── agent.ts           # Agent 核心逻辑
│   │   ├── permissions.ts     # 权限系统
│   │   └── config.ts
│   └── utils/
├── package.json
├── tsconfig.json
└── README.md
```

**从源码中发现的有趣细节：**

```typescript
// src/cli/index.ts
const voiceCommand = feature('VOICE_MODE') 
  ? require('./commands/voice/index.js').default 
  : null;

// src/core/agent.ts
const isInternal = process.env.USER_TYPE === 'ant';
if (isInternal) {
  // Anthropic 员工专用工具
  registerTool(new ConfigTool());
  registerTool(new TungstenTool());
}

// src/tools/BashTool.ts
const ALLOWED_COMMANDS = [
  'git', 'npm', 'node', 'ls', 'cat', 'grep', 'find'
];

// src/core/permissions.ts
// Bug: Plan 文件白名单过宽
if (filePath.startsWith(planDir)) {
  return true; // blue-fox-evil.md 可绕过
}
```

---

**完整的原始 TypeScript 源码，一个不漏。**

---

## 三、Claude Code 泄露了什么？

### 3.1 核心技术栈

从泄露的源码中，社区梳理出 Claude Code 的技术选型：

| 组件 | 技术选型 | 说明 |
|:---|:---|:---|
| 语言 | TypeScript | 全量 TS，无 JavaScript |
| 运行时 | Bun | 未使用 Node.js |
| 终端 UI | React + Ink | 用 React 组件渲染 CLI 界面 |
| CLI 解析 | Commander.js | 标准命令行解析库 |
| Schema 校验 | Zod v4 | 运行时类型校验 |

### 3.2 工具系统：40+ 独立模块

Claude Code 内置了 **40+ 个工具模块**，每个都有独立的：

- 输入 Schema（用 Zod 定义）
- 权限模型（读/写/执行）
- 执行逻辑

典型工具：

```
BashTool      → 执行 Shell 命令
FileReadTool  → 读取文件
GrepTool      → 代码搜索（基于 ripgrep）
AgentTool     → 派生子 Agent
WebFetchTool  → 抓取网页内容
```

### 3.3 命令系统：50+ 斜杠命令

泄露代码显示了 Claude Code 支持 **50+ 斜杠命令**：

```
/commit    → 自动生成 git commit
/review    → 代码审查
/vim       → 打开 Vim 编辑器
/doctor    → 环境诊断
/voice     → 语音命令（未发布）
```

### 3.4 Feature Flag：隐藏功能

代码中通过 **编译时常量** 控制功能开关：

```typescript
const voiceCommand = feature('VOICE_MODE') 
  ? require('./commands/voice/index.js').default 
  : null;
```

发现的隐藏 Flag：

| Flag | 推测功能 |
|:---|:---|
| `KAIROS` | 助手模式（主动建议？）|
| `PROACTIVE` | 主动执行任务 |
| `TORCH` | 未知 |
| `BUDDY` | ASCII 电子宠物（愚人节彩蛋）|

### 3.5 内部用户识别

泄露代码暴露了一个有趣的逻辑：

```typescript
// 识别 Anthropic 内部员工
const isInternal = process.env.USER_TYPE === 'ant';

if (isInternal) {
  // 开放额外工具：ConfigTool, TungstenTool 等
}
```

Anthropic 内部员工会获得更多权限和工具。

---

## 四、Source Map 的安全风险

### 4.1 风险一：源码泄露

这是最直接的风险。泄露内容包括：

- ✅ **业务逻辑**：核心算法、数据处理流程
- ✅ **API 密钥/配置**：硬编码的密钥（虽然不该这么做）
- ✅ **内部命名**：未发布的特性、代号
- ✅ **架构细节**：模块划分、依赖关系

**对闭源项目：** 这是严重的安全事故。

### 4.2 风险二：攻击面扩大

泄露的源码可能包含：

- 未修复的漏洞细节
- 权限绕过逻辑
- 加密/认证实现

攻击者可以**定向审计**，而非盲目黑盒测试。

Claude Code 泄露代码中就发现了多个安全问题：

**Bug 1：Plan 文件白名单过宽**

```typescript
// 问题代码
if (filePath.startsWith(planDir)) {
  // 认为是合法 Plan 文件
}
```

攻击者可以构造 `blue-fox-evil.md` 这样的文件名，绕过权限检查。

**Bug 2：多级符号链接处理不完整**

```typescript
// 仅调用一次 readlinkSync
const target = readlinkSync(filePath);
```

多级符号链接（`link1 → link2 → target`）可能破坏安全约束。

### 4.3 风险三：供应链攻击

泄露的 `package.json` 和依赖列表，可以帮助攻击者：

- 识别可攻击的依赖版本
- 构造针对性的供应链攻击

---

## 五、如何规避 Source Map 泄露？

### 5.1 核心原则：生产环境不发布 source map

#### 方法一：`.npmignore` 排除

```gitignore
# .npmignore
*.map
**/*.map

# 或者更精确
dist/**/*.map
```

#### 方法二：`package.json` 的 `files` 字段白名单

```json
{
  "name": "my-package",
  "files": [
    "dist/index.js",
    "dist/lib/**/*.{js,d.ts}",
    "!dist/**/*.map"
  ]
}
```

> ⚠️ **注意：** `.npmignore` 和 `files` 字段是**互斥**的：
> - 有 `files` 字段时，只有列表中的文件会被打包
> - 无 `files` 字段时，才读取 `.npmignore` 排除规则

#### 方法三：构建配置剔除

**TypeScript（tsconfig.json）：**

```json
{
  "compilerOptions": {
    "sourceMap": false  // 不生成 source map
  }
}
```

**esbuild：**

```javascript
// esbuild.config.js
require('esbuild').build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/bundle.js',
  sourcemap: false,  // 不生成 source map
  // 或仅生成外部文件但不发布
  sourcemap: 'external',
});
```

**Webpack：**

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  devtool: false,  // 不生成 source map
};
```

### 5.2 发布前检查：务必执行

**步骤一：本地模拟打包**

```bash
# 模拟 npm pack，查看会包含哪些文件
npm pack --dry-run
```

输出示例：

```
npm notice 
npm notice 📦  my-package@1.0.0
npm notice 
npm notice === Tarball Contents === 
npm notice 1.2kB dist/index.js
npm notice 0.5kB dist/index.d.ts
npm notice 60MB dist/index.js.map  ⚠️ 危险！
npm notice 
npm notice === Tarball Details === 
npm notice name:          my-package                        
npm notice version:       1.0.0
```

看到 `.map` 文件？立即修复！

**步骤二：检查已发布包**

```bash
# 下载并解包检查
npm pack my-package
tar -tzf my-package-1.0.0.tgz | grep "\.map$"
```

有输出？说明已发布版本存在泄露风险。

**步骤三：CI/CD 自动检查**

```yaml
# .github/workflows/publish.yml
name: Publish

on:
  push:
    tags: ['v*']

jobs:
  check-and-publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      
      - name: Build
        run: npm run build
      
      - name: Check for source maps
        run: |
          if npm pack --dry-run 2>&1 | grep -q "\.map"; then
            echo "❌ Source map files detected in package!"
            exit 1
          fi
          echo "✅ No source maps in package"
      
      - name: Publish
        run: npm publish
```

### 5.3 真的需要 Source Map？考虑替代方案

如果生产环境确实需要调试能力：

#### 方案一：Source Map 上传到私有服务

```javascript
// webpack.config.js
const { SourceMapUploader } = require('sourcemap-uploader');

module.exports = {
  devtool: 'hidden-source-map',  // 生成 source map 但不关联
  plugins: [
    new SourceMapUploader({
      endpoint: 'https://sourcemaps.your-company.com/upload',
      // source map 不会进入 npm 包
    }),
  ],
};
```

**效果：**
- 用户下载的包**不含** source map
- 内部可通过私有服务**关联调试**

#### 方案二：Sentry / Bugsnag 集成

```javascript
// 上传 source map 到 Sentry
npx @sentry/wizard@latest -i sourcemaps

// 构建后自动上传
npm run build && npx @sentry/cli releases files <release> upload-sourcemaps ./dist
```

Sentry 会存储 source map，仅用于错误追踪，**不对外暴露**。

---

## 六、事后补救：已经泄露了怎么办？

### 6.1 立即行动

1. **发布修复版本**
   ```bash
   # 移除 source map
   npm version patch
   npm publish
   ```

2. **联系 npm 下架受影响版本**
   ```
   发邮件至 support@npmjs.com
   说明：包名、版本号、安全原因
   ```

3. **审计泄露内容**
   - 检查是否有硬编码密钥
   - 评估业务逻辑暴露程度
   - 识别可被利用的漏洞

### 6.2 轮换凭证（如有泄露）

如果源码中包含：

- API 密钥
- 数据库凭证
- 第三方服务 Token

**立即轮换**，不要心存侥幸。

### 6.3 通知用户（如适用）

如果是开源项目或有公开用户：

- 发布安全公告
- 说明泄露范围和影响
- 提供升级/修复建议

---

## 七、工程化建议：从 Claude Code 事件学到什么？

### 7.1 Anthropic 犯的两个错误

| 错误 | 说明 |
|:---|:---|
| **配置缺失** | 未在 `.npmignore` 或 `files` 中排除 `.map` 文件 |
| **流程缺失** | 发布前未执行 `npm pack --dry-run` 检查 |

**更严重的是：** 同样的错误犯了两次（2025年2月 + 2026年3月）。

### 7.2 推荐的最佳实践

**开发环境：** 保留 source map

```json
// tsconfig.json
{
  "compilerOptions": {
    "sourceMap": true
  }
}
```

**生产发布：** 自动移除

```bash
# package.json
{
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "rm -rf dist/**/*.map && npm run build:prod"
  }
}
```

**CI/CD：** 强制检查

```yaml
- name: Verify no source maps
  run: |
    if find dist -name "*.map" | grep -q .; then
      echo "❌ Source maps found!"
      exit 1
    fi
```

---

## 八、写在最后

Claude Code 的源码泄露，不是因为复杂的 0-day 漏洞，而是因为一个**配置失误**。

这种低级错误，任何团队都可能犯。关键在于：

1. **建立检查流程**（`npm pack --dry-run`）
2. **自动化验证**（CI/CD 集成）
3. **团队意识培养**（source map = 源码）

你的项目里，有没有类似的"定时炸弹"？

现在就去检查吧。

---

```bash
# 一键检查你的 npm 包
npm pack --dry-run 2>&1 | grep "\.map"
```

---

💡 **AppTalks** | 资讯·工具·教程·社区

🤖 关注我们，第一时间获取 APP 开发安全预警和技术干货

💬 加入社群，与全国开发者交流成长

❤️ 觉得有用？点个「在看」，帮更多开发者避开这个坑！
