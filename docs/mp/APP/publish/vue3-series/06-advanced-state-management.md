# 状态管理进阶：Pinia, VueUse 与 Server State (Vue 3 Mastery Series - 06)

## 引言：State 的三个层级

在前端应用中，并不是所有的数据都需要放进一个巨大的全局 Store 里。随着 Vue 3 生态的演进，我们逐渐认识到状态可以分为三个层级：

1.  **Local State (本地状态)**：仅在组件内部使用的状态，用 `ref` 或 `reactive` 即可。
2.  **Global Client State (全局客户端状态)**：跨组件共享的 UI 状态，如用户偏好、侧边栏开关、主题色等。这是 **Pinia** 的主战场。
3.  **Server State (服务端状态)**：从 API 获取的数据缓存。这通常包含 loading、error、refetching 等复杂逻辑。虽然可以用 Pinia 存，但专门的工具库（如 **TanStack Query**）会做得更好。

本文将深入探讨这三个层级的最佳实践，帮助你构建清晰、可维护的数据流。

## 1. Global Client State：Pinia 的崛起

Pinia 是 Vue 官方推荐的状态管理库，它彻底抛弃了 Vuex 的 Mutation，拥抱了 Composition API。

### 1.1 Setup Store：像写组件一样写 Store

Pinia 支持两种定义 Store 的方式：Options Store（类似 Vuex）和 **Setup Store**。强烈推荐后者，因为它更灵活，且能复用 Composables。

```javascript
// stores/counter.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCounterStore = defineStore('counter', () => {
  // State
  const count = ref(0)
  
  // Getters
  const doubleCount = computed(() => count.value * 2)
  
  // Actions
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})
```

这种写法和组件内的 `setup()` 完全一致，心智负担极低。

### 1.2 插件机制：持久化与日志

Pinia 的插件系统非常强大。比如实现一个简易的持久化插件：

```javascript
// plugins/pinia-persist.js
export function piniaPersist({ store }) {
  // 从 localStorage 恢复
  const savedState = localStorage.getItem(store.$id)
  if (savedState) {
    store.$patch(JSON.parse(savedState))
  }

  // 监听变化并保存
  store.$subscribe((mutation, state) => {
    localStorage.setItem(store.$id, JSON.stringify(state))
  })
}

// main.js
const pinia = createPinia()
pinia.use(piniaPersist)
```

当然，生产环境推荐使用成熟的 `pinia-plugin-persistedstate`。

## 2. Server State：为什么你需要 TanStack Query？

在传统的 Vuex/Pinia 模式中，我们经常写这样的代码：

```javascript
// store/user.js
actions: {
  async fetchUser(id) {
    this.isLoading = true
    this.error = null
    try {
      this.user = await api.getUser(id)
    } catch (err) {
      this.error = err
    } finally {
      this.isLoading = false
    }
  }
}
```

如果你有 10 个 API，你就要写 10 遍这样的 loading/error 逻辑。而且，你还面临着：
*   **缓存失效**：什么时候重新请求？
*   **竞态问题**：快速切换 ID 时，先发的请求后返回覆盖了正确数据怎么办？
*   **窗口聚焦刷新**：用户切回来时要不要刷新数据？

**TanStack Query (Vue Query)** 完美解决了这些问题。它是一个专门用于管理服务端状态的库。

### 2.1 极简的使用体验

```vue
<script setup>
import { useQuery } from '@tanstack/vue-query'

const fetchUser = async () => (await fetch('/api/user')).json()

// 自动处理 loading, error, data, caching, refetching
const { isLoading, isError, data, error } = useQuery({
  queryKey: ['user'],
  queryFn: fetchUser,
  staleTime: 1000 * 60 * 5 // 5分钟内数据认为是新鲜的，不重新请求
})
</script>

<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="isError">Error: {{ error.message }}</div>
  <div v-else>{{ data.name }}</div>
</template>
```

使用 Vue Query 后，原本放在 Pinia 里的 90% 异步逻辑都可以删掉了。Pinia 只需负责真正的**客户端全局状态**（如 theme, sidebarOpen）。

## 3. 轻量级状态：VueUse createGlobalState

有时候，我们仅仅想在两个组件之间共享一个简单的状态（比如“当前选中的标签页”），引入 Pinia 显得太重了。

这时可以使用 VueUse 的 `createGlobalState`：

```javascript
// composables/useGlobalState.js
import { createGlobalState, useStorage } from '@vueuse/core'

export const useGlobalState = createGlobalState(() => {
  // 状态可以是 ref，也可以是 useStorage 持久化状态
  const count = ref(0)
  const token = useStorage('my-token', '')
  
  return { count, token }
})
```

在组件中使用：

```javascript
import { useGlobalState } from './composables/useGlobalState'

const { count } = useGlobalState()
```

这就相当于一个**去中心化的小型 Store**，非常适合逻辑复用。

## 4. 总结：现代状态管理架构

在 Vue 3 应用中，我们推荐这样的状态管理架构：

1.  **Pinia**：用于管理**全局 UI 状态**（用户信息、权限、主题、全局配置）。
2.  **TanStack Query**：用于管理**服务端数据**（API 请求、缓存、同步）。
3.  **Composables (VueUse)**：用于管理**局部共享状态**或**逻辑复用**。
4.  **Props/Emits**：用于**父子组件通信**（不要为了通信而把所有数据都塞进 Store）。

通过合理划分状态的边界，你的代码将变得更加清晰、可测试且易于维护。

**下一篇预告**：
如果说状态管理是应用的“大脑”，那么路由就是应用的“骨架”。Vue Router 4 带来了哪些新特性？如何实现基于文件的路由（File-based Routing）？下一篇《路由系统深潜》将为你揭晓。

---

> **这里是《Vue 3 全景攻略》系列教程。**
>
> 如果你觉得这篇文章对你有帮助，欢迎 **点赞、在看、分享** 支持一下！
>
> 👇 **关注公众号「移动APP开发」，回复“Vue3”获取本系列完整思维导图与源码。**

*(此处插入公众号名片)*
