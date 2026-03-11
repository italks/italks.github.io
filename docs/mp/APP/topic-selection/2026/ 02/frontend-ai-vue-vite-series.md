# 系列教程策划：DeepSeek 时代的前端架构演进 (Vue 3.5 + Vite + AI Agent)

## 📌 系列定位与目标 (2.0 进阶版)
*   **核心主题**：**深度**结合 AI (DeepSeek/Ollama) 与现代前端工程化，拒绝“调包侠”，深入架构与原理。
*   **紧跟热点**：**DeepSeek-R1 (推理模型)**、**Vercel AI SDK**、**Tailwind CSS v4**、**Local LLM (本地大模型)**、**RAG (检索增强生成)**。
*   **目标受众**：中高级前端工程师、架构师、追求极致技术深度的全栈开发者。
*   **核心价值**：掌握“AI Native”应用开发范式，从“写页面”升级为“构建智能 Agent”。

## 📅 系列大纲一览

| 序号 | 标题 | 核心技术点 | 深度/亮点 |
| :--- | :--- | :--- | :--- |
| **01** | **工程化深水区：构建企业级 Monorepo 架构** | pnpm Workspace, TurboRepo, Biome | 抛弃单纯 CRA/Vite CLI，通过 Monorepo 管理多包架构，引入 Rust 工具链 (Biome) 替代 ESLint/Prettier。 |
| **02** | **Vite 进阶：自定义插件与构建性能极致压榨** | AST 转换, Rollup Plugin, 预构建策略 | 深入 Vite 源码机制，手写一个 Vite 插件，解决实际构建痛点。 |
| **03** | **Vue 3.5 高阶范式：响应式系统的底层艺术** | `defineModel`, `watchEffect` 源码, 泛型组件 | 深入 Vue 3.5 新特性，掌握编译器宏 (Compiler Macros) 与 TypeScript 深度整合技巧。 |
| **04** | **UI 工程化：Tailwind v4 前瞻与 AI 生成流** | Tailwind v4 (Rust引擎), Headless UI, Shadcn/ui | 结合 **v0.dev** / **Trae** 的 AI 生成流，探讨原子化 CSS 在 v4 版本的性能飞跃。 |
| **05** | **状态管理哲学：Pinia 架构模式与类型体操** | Setup Store, 依赖注入, 插件系统 | 拒绝面条代码，使用 Factory Pattern 封装 Store，实现极致的 TypeScript 类型推导。 |
| **06** | **AI Native 核心 (上)：Vercel AI SDK 与流式协议解密** | RSC (React Server Components) 概念迁移, Stream Data | 深入解析 **Stream Protocol**，手写流式解析器，完美适配 **DeepSeek-R1** 的“思考链”展示。 |
| **07** | **AI Native 核心 (下)：边缘计算与 Local LLM 实战** | Ollama, WebGPU, WebLLM | 不依赖 OpenAI！在浏览器端通过 **WebGPU** 运行本地模型，或连接本地 **Ollama** 实现隐私计算。 |
| **08** | **RAG 实战：基于 LangChain.js 的文档对话 Agent** | Vector Store (向量库), Embeddings, RAG | 以前端视角落地 RAG (检索增强生成)，实现“上传 PDF 即刻对话”的知识库功能。 |
| **09** | **全链路监控：性能指标与异常追踪体系** | Core Web Vitals, Sentry, SourceMap 安全 | 建立 FCP/LCP/CLS 性能监控看板，自动化上传 SourceMap 并处理敏感数据。 |
| **10** | **DevOps 交付：Docker 极致瘦身与 Edge 部署** | Multi-stage Build, Nginx 配置, Edge Functions | 将 Vue 应用容器体积压缩至极限，并部署至 Cloudflare Workers 等边缘节点。 |

---

## 📝 单篇详细大纲 (深度版)

### 第 1 篇：工程化深水区：构建企业级 Monorepo 架构
**标题建议**：《别再 `npm install` 了：pnpm + Turbo + Biome 打造下一代前端基建》
**核心痛点**：多项目代码复用难、依赖幽灵依赖、Lint 速度慢。
**深度内容**：
1.  **架构选型**：为什么大型开源项目（Vue/Vite）都选 pnpm workspace？
2.  **实战落地**：
    *   配置 pnpm-workspace.yaml 实现 `ui-kit` 与 `apps` 分离。
    *   引入 **TurboRepo** 实现构建缓存（Build Caching），CI 速度提升 80%。
3.  **Rust 工具链**：使用 **Biome** (前 Rome) 秒级完成 Lint & Format，体验 Rust 对 JS 基建的降维打击。
4.  **规范工程化**：Changesets 自动化发版流程。

### 第 2 篇：Vite 进阶：自定义插件与构建性能极致压榨
**标题建议**：《Vite 只是快？手写 Plugin 揭秘 Rollup 构建黑魔法》
**核心痛点**：默认配置无法满足特殊构建需求，构建产物体积过大。
**深度内容**：
1.  **原理深挖**：Vite Dev Server 的中间件机制 vs Production 的 Rollup 构建流。
2.  **插件实战**：开发一个 `vite-plugin-image-optimizer` 或 `vite-plugin-mdx-vue`。
    *   操作 AST (Abstract Syntax Tree) 修改代码。
    *   利用 `transform` 钩子注入环境变量。
3.  **构建调优**：
    *   手动分包策略 (`manualChunks`) 避免厂商锁死。
    *   Tree-shaking 失效场景排查与解决（副作用 `sideEffects` 处理）。

### 第 3 篇：Vue 3.5 高阶范式：响应式系统的底层艺术
**标题建议**：《Vue 3.5 硬核指南：泛型组件、宏编译与响应式原理》
**核心痛点**：只会写基础 CRUD，不懂 Vue 编译器优化机制。
**深度内容**：
1.  **3.5 新特性**：`useId` 原理与 SSR Hydration 匹配，`defineModel` 的语法糖本质。
2.  **TypeScript 深度整合**：
    *   **泛型组件 (Generic Component)**：写出高复用的 Table/Select 组件。
    *   `defineProps` 的复杂类型解构与默认值编译机制。
3.  **性能优化模式**：
    *   `shallowRef` vs `triggerRef` 的极端优化场景。
    *   使用 `v-memo` 减少长列表 Patch 开销。

### 第 4 篇：UI 工程化：Tailwind v4 前瞻与 AI 生成流
**标题建议**：《CSS 的终局？Tailwind v4 引擎与 AI 代码生成的完美闭环》
**核心痛点**：手写 CSS 效率低，传统组件库样式难以定制。
**深度内容**：
1.  **Tailwind v4 革命**：Oxide 引擎 (Rust) 带来的零配置、即时编译体验。
2.  **架构设计**：基于 **CVA (Class Variance Authority)** + **Headless UI** 封装企业级组件库。
3.  **AI Workflow**：
    *   实战：使用 **v0.dev** 生成 Shadcn/ui 风格组件。
    *   Prompt Engineering：如何描述“响应式”、“暗黑模式”与“交互态”。

### 第 5 篇：状态管理哲学：Pinia 架构模式与类型体操
**标题建议**：《Pinia 不止是 Store：依赖注入模式与复杂业务解耦》
**核心痛点**：Store 膨胀成“上帝对象”，业务逻辑难以测试。
**深度内容**：
1.  **Setup Store 进阶**：利用 Closure 特性实现私有状态 (Private State)。
2.  **设计模式**：Service Layer (服务层) 与 Store 的解耦——不要在 Store 里直接调 API。
3.  **插件系统开发**：手写一个 `pinia-plugin-persist` (持久化) 或 `pinia-plugin-undo` (撤销重做)。
4.  **TypeScript 技巧**：自动推导 Store State 类型，避免 `any` 满天飞。

### 第 6 篇：AI Native 核心 (上)：Vercel AI SDK 与流式协议解密
**标题建议**：《DeepSeek-R1 接入实战：Vercel AI SDK 源码解析与思考链可视化》
**核心痛点**：只会调 fetch，不懂 Stream 原理，无法处理推理模型(Reasoning Model)的复杂输出。
**深度内容**：
1.  **协议底层**：Server-Sent Events (SSE) vs WebSocket 选型与抓包分析。
2.  **SDK 源码分析**：Vercel AI SDK 的 `useChat` 内部是如何处理 React/Vue 响应式流更新的？
3.  **DeepSeek-R1 实战**：
    *   **Thinking Process**：解析 R1 模型的 `<think>` 标签，在 UI 上实现“折叠/展开”思考过程。
    *   **Markdown Streaming**：解决 Markdown 渲染在流式输出时的闪烁与闭合标签问题。

### 第 7 篇：AI Native 核心 (下)：边缘计算与 Local LLM 实战
**标题建议**：《把大模型装进浏览器：WebLLM 与 Ollama 本地私有化部署》
**核心痛点**：API 成本高，数据隐私敏感，离线不可用。
**深度内容**：
1.  **Local First 架构**：为什么本地大模型是趋势？
2.  **WebGPU 实战**：使用 **WebLLM** 库，在 Chrome 中跑 Llama-3-8B-Quantized 模型。
3.  **混合架构 (Hybrid AI)**：
    *   简单任务（分类、摘要）跑本地小模型。
    *   复杂推理任务（代码生成）路由到云端 DeepSeek。
4.  **Function Calling**：让本地模型控制前端页面（如：语音指令切换深色模式）。

### 第 8 篇：RAG 实战：基于 LangChain.js 的文档对话 Agent
**标题建议**：《前端也能做 RAG：基于 LangChain.js 开发“知识库 Agent”》
**核心痛点**：大模型有幻觉，无法回答私有领域问题。
**深度内容**：
1.  **RAG 原理拆解**：Chunking (分块) -> Embedding (向量化) -> Vector Search (向量检索)。
2.  **技术栈选型**：
    *   向量库：浏览器端的 **Voy** (Wasm) 或 **MemoryVectorStore**。
    *   框架：LangChain.js 的核心 Abstraction。
3.  **全栈实现**：
    *   上传 PDF/Markdown。
    *   在 Browser/Node 层进行文本切片。
    *   实现“依据文档回答”的引用溯源 UI。

### 第 9 篇：全链路监控：性能指标与异常追踪体系
**标题建议**：《拒绝裸奔：构建基于 Core Web Vitals 的前端监控塔》
**核心痛点**：用户反馈卡顿，开发者无法复现。
**深度内容**：
1.  **关键指标**：深入理解 LCP (最大内容渲染)、CLS (累积布局偏移)、INP (交互到绘制延迟)。
2.  **Sentry 高级用法**：
    *   **Performance Monitoring**：路由切换的 Transaction 追踪。
    *   **Session Replay**：像看视频一样回放用户报错时的操作路径。
3.  **SourceMap 安全**：如何在 Sentry 后台还原代码，同时不在浏览器暴露源码。

### 第 10 篇：DevOps 交付：Docker 极致瘦身与 Edge 部署
**标题建议**：《CI/CD 最后一公里：Docker Multi-stage Build 与 Edge 部署》
**核心痛点**：镜像体积大（几百MB），部署慢，服务器成本高。
**深度内容**：
1.  **Docker 优化**：
    *   **Multi-stage Build**：构建环境与运行环境分离，将镜像压缩至 < 20MB (Nginx Alpine)。
2.  **Edge 部署**：
    *   将 Vue 应用部署到 **Cloudflare Pages** 或 **Vercel Edge**。
    *   配置 **Edge Middleware** 实现基于地理位置的访问控制或 A/B Test。
3.  **展望**：前端架构师的进阶之路（Rust, WebAssembly, Agentic AI）。
