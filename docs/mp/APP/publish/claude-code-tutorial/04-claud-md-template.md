# 我的 CLAUDE.md 模板：让 AI 从第一天就懂你的项目

> 阅读时长：6分钟
>
> 复制粘贴就能用，附 3 个真实案例。

---

## 你是不是每次都要解释一遍项目背景？

场景很熟悉：

```
你：帮我加一个搜索功能
AI：好的，请问你用的什么框架？
你：React
AI：状态管理用的什么？
你：Zustand
AI：UI 库呢？
你：Ant Design
AI：API 请求用的什么？
你：axios
...
```

**每次对话，都要重新解释。**

如果 AI 能记住你的项目背景，效率会高多少？

---

## 什么是 CLAUDE.md？

**CLAUDE.md 是给 AI 的项目说明书。**

放在项目根目录，AI 每次启动时会自动读取。

它的作用：

1. **省去重复解释**——技术栈、代码规范、已知坑，一次配置永久生效
2. **提高准确性**——AI 知道你的项目约束，生成的代码更符合实际
3. **团队协作**——新成员快速上手，AI 也能帮助理解项目

---

## CLAUDE.md 应该包含什么？

### 必备内容

| 内容 | 作用 |
|---|---|
| **项目概述** | 一句话说明项目是什么 |
| **技术栈** | 框架、语言、工具库 |
| **代码组织** | 目录结构说明 |
| **开发规范** | 命名、注释、提交信息风格 |
| **已知坑** | 项目特有的注意事项 |

### 可选内容

- API 接口文档
- 环境变量说明
- 部署流程
- 常见问题 FAQ

---

## 基础模板：复制粘贴就能用

```markdown
# 项目名称

## 项目概述
<!-- 一句话描述项目是什么 -->

## 技术栈
- 前端框架：
- UI 库：
- 状态管理：
- 请求库：
- 构建工具：

## 代码组织
```
src/
├── components/    # 公共组件
├── pages/         # 页面
├── utils/         # 工具函数
├── hooks/         # 自定义 Hooks
├── api/           # API 请求
└── types/         # TypeScript 类型定义
```

## 开发规范
<!-- 命名规范、注释风格、提交信息格式 -->

## 已知坑
<!-- 项目特有的注意事项 -->

## 环境变量
<!-- .env 文件说明 -->
```

---

## 真实案例 1：React Web 项目

```markdown
# 电商后台管理系统

## 项目概述
基于 React 18 的电商后台管理系统，支持商品管理、订单处理、数据分析。

## 技术栈
- 前端框架：React 18 + TypeScript
- UI 库：Ant Design 5.x
- 状态管理：Zustand
- 请求库：axios + React Query
- 构建工具：Vite
- 路由：React Router v6

## 代码组织
```
src/
├── components/       # 公共组件
│   ├── Layout/       # 布局组件
│   └── Table/        # 表格封装
├── pages/            # 页面
│   ├── product/      # 商品管理
│   ├── order/        # 订单管理
│   └── dashboard/    # 数据面板
├── hooks/            # 自定义 Hooks
├── api/              # API 请求
├── stores/           # Zustand stores
├── utils/            # 工具函数
└── types/            # 类型定义
```

## 开发规范
- 组件命名：PascalCase（如 `ProductList.tsx`）
- 文件命名：camelCase（如 `formatPrice.ts`）
- 提交信息：遵循 Conventional Commits
  - feat: 新功能
  - fix: Bug 修复
  - docs: 文档更新
  - refactor: 重构

## 已知坑
1. **Ant Design Table 虚拟滚动**：大数据量时需要手动开启虚拟滚动
2. **Zustand 持久化**：localStorage 有 5MB 限制，大数据不要存
3. **Vite 热更新**：有时需要手动刷新页面

## 环境变量
```env
VITE_API_URL=后端 API 地址
VITE_UPLOAD_URL=文件上传地址
```
```

---

## 真实案例 2：移动端 React Native 项目

```markdown
# 健身打卡 App

## 项目概述
React Native 跨平台健身打卡应用，支持 iOS 和 Android。

## 技术栈
- 框架：React Native 0.73 + TypeScript
- 状态管理：Redux Toolkit
- 导航：React Navigation 6.x
- UI 组件：React Native Paper
- 存储：AsyncStorage + SQLite
- 网络：axios

## 代码组织
```
src/
├── screens/          # 页面
├── components/       # 公共组件
├── navigation/       # 路由配置
├── store/            # Redux store
├── services/         # API 服务
├── hooks/            # 自定义 Hooks
├── utils/            # 工具函数
└── assets/           # 静态资源
```

## 开发规范
- 样式：使用 StyleSheet.create，不使用内联样式
- 组件：函数式组件 + Hooks
- 提交信息：feat/fix/docs/refactor

## 已知坑
1. **iOS 权限**：相机、相册权限需要在 Info.plist 配置
2. **Android 签名**：发布前需要生成签名文件
3. **第三方库兼容性**：新增库前检查是否支持当前 RN 版本

## 环境变量
```env
API_URL=后端 API 地址
GOOGLE_CLIENT_ID=Google 登录客户端 ID
```
```

---

## 真实案例 3：Node.js 后端项目

```markdown
# RESTful API 服务

## 项目概述
基于 Express 的 RESTful API 服务，提供用户认证、数据管理接口。

## 技术栈
- 运行时：Node.js 20
- 框架：Express + TypeScript
- 数据库：PostgreSQL + Prisma ORM
- 认证：JWT + bcrypt
- 校验：Zod
- 日志：Winston

## 代码组织
```
src/
├── routes/           # 路由
├── controllers/      # 控制器
├── services/         # 业务逻辑
├── models/           # 数据模型（Prisma）
├── middlewares/      # 中间件
├── validators/       # 请求校验（Zod）
├── utils/            # 工具函数
└── types/            # 类型定义
```

## 开发规范
- 路由命名：RESTful 风格（/users, /orders）
- 错误处理：统一使用 ApiError 类
- 提交信息：feat/fix/docs/refactor

## 已知坑
1. **Prisma 迁移**：修改 schema 后需要运行 `npx prisma migrate dev`
2. **JWT 过期**：token 过期时间设为 7 天，refresh token 30 天
3. **环境变量**：数据库密码不要提交到 Git

## 环境变量
```env
DATABASE_URL=PostgreSQL 连接字符串
JWT_SECRET=JWT 密钥
PORT=服务端口
```
```

---

## 维护 CLAUDE.md 的最佳实践

### 1. 项目初始化时创建

新项目第一天就写好 CLAUDE.md，省去后续重复解释。

### 2. 发现新坑就更新

遇到新问题，及时补充到"已知坑"部分。

### 3. 技术栈变更要同步

换了 UI 库、加了新依赖，记得更新技术栈部分。

### 4. 保持简洁

CLAUDE.md 不是详细文档，而是**快速索引**。

详细文档放在 `docs/` 目录，CLAUDE.md 只放关键信息。

---

## 总结

CLAUDE.md 是给 AI 的项目说明书，作用：

1. **省去重复解释**——一次配置永久生效
2. **提高准确性**——AI 生成的代码更符合实际
3. **团队协作**——新成员快速上手

**使用方法：**

1. 复制基础模板
2. 根据项目类型选择案例参考
3. 填充你的项目信息
4. 放在项目根目录

**一个 10 分钟的配置，省下无数次的重复解释。**

---

## 下一步：理解 AI 的"记性"为什么那么差

CLAUDE.md 解决了项目级别的记忆问题。

但 AI 还有一个更大的限制：**上下文窗口**。

**下一篇：AI 的"记性"为什么那么差？上下文窗口的真相**

我将解释：
- 20 万 Token 到底能装多少
- 为什么窗口会"爆"
- Claude Code 如何聪明地管理上下文

---

💡 **APP 开发者** | 资讯·工具·教程·社区

📱 关注我们，获取更多移动开发技术干货

💬 加入技术交流群，与全国开发者一起成长

❤️ 觉得有用？点个"在看"分享给更多人！
