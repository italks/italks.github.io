# 企业级应用架构与性能优化 (Vue 3 Mastery Series - 14)

## 引言：从 Demo 到 Production

写一个 Todo List 很简单，但维护一个拥有几百个页面、几十人协作的大型企业级应用（ERP、CRM、SaaS）却是另一回事。

作为本系列的终章，我们将探讨那些**超越 API 本身**的问题：
*   **架构设计**：如何组织代码才不会变成“屎山”？
*   **性能优化**：首屏加载慢怎么办？列表卡顿怎么办？
*   **稳定性**：线上报错怎么监控？内存泄漏怎么排查？

## 1. 目录结构：Feature-based vs Layer-based

### 1.1 传统的分层架构 (Layer-based)

这是 Vue CLI 默认生成的结构：

```
src/
  components/  (所有的组件)
  views/       (所有的页面)
  stores/      (所有的状态)
  utils/       (所有的工具)
```

**优点**：分类清晰，找“工具函数”去 `utils`，找“页面”去 `views`。
**缺点**：当你在开发一个“用户管理”功能时，你需要在 `views/User`, `components/UserForm`, `stores/user`, `api/user` 之间反复横跳。代码耦合度高，难以拆分。

### 1.2 基于特性的架构 (Feature-based)

现代大型项目更推荐按**业务领域**（Domain）来组织代码：

```
src/
  features/
    user/
      components/
      composables/
      api.js
      store.js
      index.vue
    product/
      ...
  shared/      (通用的组件、工具)
    components/
    utils/
```

**优点**：高内聚。删除“用户管理”功能只需删除 `features/user` 文件夹。非常适合微前端拆分。

## 2. 性能优化实战

### 2.1 加载性能 (Loading Performance)

目标：减少 FCP (First Contentful Paint) 和 LCP (Largest Contentful Paint)。

1.  **路由懒加载**：这是最基本的。
    ```javascript
    component: () => import('./views/Home.vue')
    ```
2.  **异步组件**：对于弹窗、抽屉等**非首屏可见**的组件，使用 `defineAsyncComponent`。
    ```javascript
    const UserModal = defineAsyncComponent(() => import('./UserModal.vue'))
    ```
3.  **分包策略**：在 `vite.config.js` 中配置 `manualChunks`，把 `echarts`, `lodash` 等大库单独打包，利用浏览器缓存。

### 2.2 运行时性能 (Runtime Performance)

目标：保持 FPS 稳定在 60，减少卡顿。

1.  **浅层响应式**：对于不需要深度监听的大数据（如 ECharts 的配置项、地图数据），使用 `shallowRef`。
    ```javascript
    const chartOption = shallowRef({ ... })
    ```
    这能节省大量的 Proxy 代理开销。
2.  **v-memo**：Vue 3.2 新增指令。如果列表项依赖的数据没变，直接跳过 Diff。
    ```vue
    <li v-for="item in list" v-memo="[item.id, item.selected]">
      ...
    </li>
    ```
3.  **虚拟滚动**：当列表超过 1000 条时，DOM 节点过多会导致浏览器重排卡顿。使用 `vue-virtual-scroller` 只渲染可视区域。

## 3. 错误监控与稳定性

### 3.1 全局错误处理

不要在每个组件里写 `try-catch`。利用 Vue 的 `errorHandler`。

```javascript
// main.js
app.config.errorHandler = (err, instance, info) => {
  console.error('全局捕获:', err)
  // 上报给 Sentry
  Sentry.captureException(err)
}
```

### 3.2 内存泄漏排查

常见的内存泄漏点：
1.  **未清理的事件监听**：`window.addEventListener` 后没在 `onUnmounted` 移除。
2.  **未清理的定时器**：`setInterval`。
3.  **第三方库实例**：如 ECharts 实例，组件销毁时要调用 `chart.dispose()`。

使用 Chrome DevTools 的 **Memory 面板** -> **Heap Snapshot**，对比组件销毁前后的内存快照，查找 Detached DOM nodes。

## 4. 系列总结

至此，《Vue 3 全景攻略》系列教程圆满结束。我们从思维模型的转变出发，一路深入了响应式原理、编译器、虚拟 DOM，最后落地到企业级架构。

Vue 3 不仅仅是一个框架，它是一套**渐进式**的解决方案。
*   你可以只用 CDN 引入它写个小 Demo。
*   也可以配合 Vite, Pinia, Router 构建复杂的单页应用。
*   甚至可以用 Nuxt 开发服务端渲染 (SSR) 的全栈应用。

希望这个系列能成为你 Vue 3 进阶路上的垫脚石。保持好奇，持续学习，我们下一个系列见！

---

> **这里是《Vue 3 全景攻略》系列教程。**
>
> 如果你觉得这篇文章对你有帮助，欢迎 **点赞、在看、分享** 支持一下！
>
> 👇 **关注公众号「移动APP开发」，回复“Vue3”获取本系列完整思维导图与源码。**

*(此处插入公众号名片)*
