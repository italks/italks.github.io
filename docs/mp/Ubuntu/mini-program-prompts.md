# 微信小程序开发提示语 (Prompts)

以下提示语可直接复制给 AI 编程助手（如 Trae, Cursor, Windsurf），用于快速生成小程序代码。建议分阶段进行。

---

## 阶段一：项目初始化与架构搭建

**Prompt:**
```markdown
你是一名资深的微信小程序开发专家。请帮我初始化一个微信小程序项目。
项目名称：UbuntuNews
技术栈：使用 Uni-app (Vue 3 + TypeScript) 框架，或者原生微信小程序（根据你的推荐选择最优方案，但我倾向于 Uni-app 以便跨平台）。
UI 框架：使用 uView Plus 或 Uni-ui。

主要目标：创建一个服务于 Linux 和 AI 爱好者的资讯与工具应用。

请完成以下任务：
1. 生成项目的目录结构。
2. 配置 `pages.json`，设置底部 TabBar，包含四个页面：
   - 首页 (pages/index/index)：资讯流
   - 百科 (pages/wiki/wiki)：常用命令与教程
   - AI 实验室 (pages/ai/ai)：模型部署与工具
   - 我的 (pages/me/me)：用户中心
3. 设置全局主题色为 Ubuntu 品牌色 (#E95420) 和深色模式背景。
4. 提供基础的 `main.ts` 和 `App.vue` 代码。
```

---

## 阶段二：首页（资讯流）开发

**Prompt:**
```markdown
请开发“首页”模块。
需求如下：
1. 顶部包含一个搜索栏（Search Bar），占位符为“搜索 Linux 教程或 AI 工具”。
2. 搜索栏下方是一个轮播图（Swiper），展示 3 张精选图片（使用占位图即可）。
3. 轮播图下方是一个横向滚动的“分类标签栏”（Tabs），包含：全部、系统更新、开源周报、AI 动态、教程。
4. 主体部分是一个文章列表（List）：
   - 列表项样式：左侧为标题和摘要，右侧为缩略图（120x120px）。
   - 底部显示元数据：发布时间（如“2小时前”）、阅读量（如“1.2k阅读”）。
   - 点击列表项跳转到详情页 `pages/article/detail`。
5. 请使用 Mock 数据生成 5 条示例文章数据，内容涵盖 Ubuntu 26.04、DeepSeek 部署、Linux 内核更新等主题。
```

---

## 阶段三：百科（知识库）功能开发

**Prompt:**
```markdown
请开发“百科”页面，这是一个工具箱和知识库。
需求如下：
1. 页面顶部是一个 Grid 宫格导航，包含 4 个图标：
   - 命令速查 (Command)
   - 发行版指南 (Distro)
   - 环境配置 (Env Setup)
   - 常见问题 (FAQ)
2. 下方是一个“热门速查”列表：
   - 展示 Linux 常用命令（如 tar, grep, chmod, systemctl）。
   - 点击命令弹出一个模态框或跳转详情，显示该命令的常用参数和示例代码。
3. 实现一个“代码复制”组件：
   - 在展示命令示例时，提供一个“复制”按钮，点击后调用剪贴板 API 复制内容。
```

---

## 阶段四：AI 实验室与文章详情页

**Prompt:**
```markdown
请开发“AI 实验室”页面和“文章详情”页。
1. **AI 实验室**：
   - 布局类似卡片流（Card View）。
   - 每个卡片代表一个 AI 主题（如“DeepSeek-R1 本地部署”、“Qwen2.5 量化指南”）。
   - 卡片包含：封面大图、标题、标签（如 #LLM, #Local, #Ollama）。
   - 增加一个“Prompt 库”入口，点击进入列表展示常用 AI 提示词。

2. **文章详情页 (pages/article/detail)**：
   - 接收上一页传递的 `id` 参数。
   - 页面包含：标题、作者信息、正文内容（支持 Markdown 渲染）。
   - **关键点**：请推荐并集成一个适合小程序的 Markdown 渲染库（如 `mp-html` 或 `towxml`），确保代码块有高亮显示，表格能正常滚动。
```

---

## 阶段五：数据集成与优化

**Prompt:**
```markdown
现在我们需要优化数据层。
1. 请封装一个 `request.ts` 工具类，基于 `uni.request`，包含拦截器（处理 Token、错误统一提示）。
2. 定义 TypeScript 接口 (Interfaces)：
   - `Article` (id, title, summary, cover, createTime, views, category)
   - `Command` (name, description, usage, examples)
3. 模拟一个后端 API 服务（可以使用 Mockjs 或简单的 JSON 文件），返回我们在 `docs/mp/Ubuntu/publish` 目录下看到的那些文章结构的模拟数据。
```
