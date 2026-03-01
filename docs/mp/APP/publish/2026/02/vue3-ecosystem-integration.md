# Vue 3 全家桶实战：Router 4 与 Pinia 的深度整合与最佳实践

在现代 Vue 3 开发中，单纯掌握 Vue 核心语法已经无法满足复杂的企业级需求。"Vue 3 + Vue Router 4 + Pinia" 已经成为构建单页应用 (SPA) 的**黄金三角**。

本文将深入探讨这三者如何高效协同，特别是**路由与状态管理的交互**，以及如何通过插件机制实现**状态持久化**。

## 1. 为什么选择 Pinia 而不是 Vuex？

Pinia 是 Vue 官方推荐的状态管理库，它不仅是 Vuex 5 的精神继承者，更完美契合了 Vue 3 的 Composition API 设计理念。

*   **去掉了 Mutation**：直接修改状态，代码更简洁。
*   **原生 TypeScript 支持**：不再需要复杂的类型包装器。
*   **体积更小**：约 1kb，且支持代码分割。
*   **多 Store 设计**：模块化更自然，不再是一棵巨大的状态树。

## 2. 核心整合模式：在 Router 中使用 Pinia，在 Pinia 中使用 Router

很多开发者遇到的第一个难题是：**如何在 `router.js` 中使用 Store？或者如何在 Store 中跳转路由？**

### 场景一：路由守卫中的状态判断 (Router -> Pinia)

这是最常见的场景：用户访问受保护页面时，我们需要检查 Pinia 中的用户登录状态。

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user' // 引入 store

const router = createRouter({
  // ... 配置
})

router.beforeEach((to, from, next) => {
  // ⚠️ 注意：必须在 beforeEach 内部调用 useUserStore
  // 因为此时 Pinia 实例才被挂载
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    // 未登录，重定向到登录页，并记录原目标路径
    next({ path: '/login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
```

### 场景二：Store 动作中的路由跳转 (Pinia -> Router)

在执行登录逻辑后，我们通常希望自动跳转到首页或之前的页面。虽然可以在组件里做，但在 Store 的 Action 里处理逻辑更内聚。

```typescript
// src/stores/user.ts
import { defineStore } from 'pinia'
import { useRouter } from 'vue-router' // ❌ 错误：在 setup store 外部无法使用 useRouter

// ✅ 正确做法：直接引入 router 实例
import router from '@/router'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: ''
  }),
  actions: {
    async login(credentials) {
      this.token = await api.login(credentials)
      
      // 登录成功后跳转
      router.push('/dashboard') 
    }
  }
})
```

## 3. 状态持久化：手写一个 Pinia 插件

页面刷新后 Pinia 数据丢失是新手的噩梦。与其依赖 `pinia-plugin-persistedstate`，不如手写一个简单的插件来理解其原理。

```typescript
// src/plugins/piniaPersist.ts
import { PiniaPluginContext } from 'pinia'

export function piniaPersistPlugin({ store }: PiniaPluginContext) {
  // 1. 初始化时从 localStorage 恢复数据
  const storedState = localStorage.getItem(`pinia-${store.$id}`)
  if (storedState) {
    store.$patch(JSON.parse(storedState))
  }

  // 2. 监听状态变化并保存
  store.$subscribe((mutation, state) => {
    // 可以在这里加防抖逻辑
    localStorage.setItem(`pinia-${store.$id}`, JSON.stringify(state))
  })
}

// src/main.ts
import { createPinia } from 'pinia'
import { piniaPersistPlugin } from './plugins/piniaPersist'

const pinia = createPinia()
pinia.use(piniaPersistPlugin) // 注册插件
```

## 4. 路由的高级应用：动态路由与滚动行为

### 动态添加路由 (权限管理)

对于后台管理系统，通常需要根据后端返回的菜单动态生成路由。

```typescript
// src/stores/permission.ts
import { defineStore } from 'pinia'
import { RouteRecordRaw } from 'vue-router'
import router from '@/router'

const modules = import.meta.glob('../views/**/*.vue')

export const usePermissionStore = defineStore('permission', {
  state: () => ({
    routes: []
  }),
  actions: {
    generateRoutes(menuList) {
      const accessRoutes = menuList.map(item => ({
        path: item.path,
        component: modules[`../views/${item.component}.vue`]
      }))
      
      // 动态添加到路由实例
      accessRoutes.forEach(route => {
        router.addRoute('main', route)
      })
      
      this.routes = accessRoutes
    }
  }
})
```

### 优化用户体验：滚动行为控制

当用户点击“后退”按钮时，页面应该回到之前的位置，而不是顶部。

```typescript
// src/router/index.ts
const router = createRouter({
  history: createWebHistory(),
  routes: [...],
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      // 如果有保存的位置（浏览器后退/前进），则恢复
      return savedPosition
    } else {
      // 否则滚动到顶部
      return { top: 0 }
    }
  }
})
```

## 5. 最佳实践总结

1.  **解耦**：尽量保持 Store 纯净，涉及 UI 跳转的逻辑可以通过 `Promise` 返回给组件处理，或者谨慎引入 `router` 实例。
2.  **模块化**：不要把所有状态都塞进一个 `useStore`，按业务领域拆分（`useUserStore`, `useCartStore`, `useAppStore`）。
3.  **类型安全**：利用 Pinia 的自动类型推导，少写 `any`。
4.  **持久化策略**：敏感数据（如 Token）存 Cookie (HttpOnly)，非敏感偏好设置（如主题色）存 localStorage。

---

通过掌握这些整合技巧，你可以构建出结构清晰、易于维护且体验优秀的 Vue 3 应用。下一篇我们将深入探讨 **Vue 3 的底层渲染机制**，看看它是如何高效地更新 DOM 的。
