# 路由系统深潜：动态权限、文件路由与微前端 (Vue 3 Mastery Series - 07)

## 引言：路由的演进

在前端单页应用（SPA）的早期，我们习惯手动编写路由表（`routes` 数组）。随着项目规模的扩大，这个文件往往变得难以维护：
*   **权限控制**：哪些页面需要登录？哪些需要管理员权限？
*   **懒加载**：每个路由都要写 `import()`，容易忘记。
*   **嵌套层级**：为了配合布局，嵌套路由写得头皮发麻。

Vue Router 4 带来了更灵活的 API，而社区更是涌现出了像 `unplugin-vue-router` 这样的神器，让路由管理变得前所未有的简单。

## 1. Vue Router 4 进阶：动态路由与权限

在后台管理系统中，根据用户角色动态生成菜单和路由是刚需。

### 1.1 动态添加路由 (addRoute)

假设我们从后端获取了一份菜单数据，如何把它转换成路由？

```javascript
// router/permission.js
import router from '@/router'
import { useUserStore } from '@/stores/user'

const modules = import.meta.glob('../views/**/*.vue')

export function generateRoutes(menuList) {
  const routes = []
  
  menuList.forEach(item => {
    const route = {
      path: item.path,
      name: item.name,
      component: modules[`../views/${item.component}.vue`], // 动态导入组件
      meta: { title: item.title, roles: item.roles }
    }
    
    // 动态添加到 router 实例
    router.addRoute('layout', route) // 添加到名为 'layout' 的父路由下
    routes.push(route)
  })
  
  return routes
}
```

注意 `import.meta.glob` 是 Vite 的特性，它允许你动态导入目录下的所有文件。

### 1.2 导航守卫 (Navigation Guards)

除了全局守卫 `beforeEach`，Vue Router 4 还支持在组件内定义守卫，配合 Composition API 使用非常方便。

```vue
<script setup>
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'

// 离开当前路由前（例如表单未保存）
onBeforeRouteLeave((to, from) => {
  if (isDirty.value) {
    const answer = window.confirm('你有未保存的更改，确定要离开吗？')
    if (!answer) return false // 取消导航
  }
})

// 路由参数变化但组件复用时（例如 /user/1 -> /user/2）
onBeforeRouteUpdate((to, from) => {
  userId.value = to.params.id
  fetchUser(userId.value)
})
</script>
```

## 2. 文件系统路由：像 Nuxt 一样开发

手动维护 `routes` 数组太累了。为什么不能像 Nuxt 或 Next.js 一样，根据 `pages` 目录下的文件结构自动生成路由呢？

**unplugin-vue-router** 就是为此而生的。

### 2.1 安装与配置

```bash
npm i -D unplugin-vue-router
```

在 `vite.config.js` 中配置：

```javascript
import VueRouter from 'unplugin-vue-router/vite'

export default defineConfig({
  plugins: [
    VueRouter({ /* options */ }),
    Vue()
  ]
})
```

### 2.2 目录结构即路由

现在，你只需要在 `src/pages` 下创建文件：

*   `src/pages/index.vue` -> `/`
*   `src/pages/about.vue` -> `/about`
*   `src/pages/users/[id].vue` -> `/users/:id`
*   `src/pages/users/[id]/edit.vue` -> `/users/:id/edit`

完全不需要手写路由配置！而且它还支持 **TypeScript 类型自动生成**。当你写 `<RouterLink to="...">` 时，IDE 会智能提示所有可用的路径，并在你写错时报错。

### 2.3 扩展路由元信息

如果想给某个页面添加 `meta` 信息（如标题、权限），可以使用 `<route>` 块：

```vue
<route lang="json">
{
  "meta": {
    "layout": "admin",
    "requiresAuth": true
  }
}
</route>

<template>
  <div>Admin Page</div>
</template>
```

## 3. Data Loaders：路由与数据获取的完美结合

Vue Router 正在实验一个新的特性：**Data Loaders**。它旨在解决“导航完成后才开始请求数据导致页面空白”的问题。

传统的做法是在组件的 `onMounted` 里请求数据。而 Data Loaders 允许你在**导航发生之前**（或并行）请求数据。

```javascript
// 此特性尚在 RFC 阶段，但值得关注
import { defineLoader } from 'vue-router/auto'

export const useUserData = defineLoader(async (route) => {
  return await fetchUser(route.params.id)
})
```

在组件中：

```vue
<script setup>
const user = useUserData() // 数据已经准备好了！
</script>
```

这不仅消除了“Loading...”闪烁，还让组件逻辑更加纯粹。

## 4. 总结

路由系统是前端架构的核心骨架。从手动配置到自动生成，从简单的跳转到复杂的权限控制，Vue Router 4 提供了强大的能力。

*   **动态路由**：配合后端菜单数据，实现灵活的权限管理。
*   **文件路由**：使用 `unplugin-vue-router` 提升开发效率和类型安全。
*   **Data Loaders**：探索未来的数据获取模式。

**下一篇预告**：
开发环境配置好了，代码也写得差不多了，如何保证打包出来的应用体积小、加载快？Vite 的构建优化有哪些黑科技？如何编写一个 Vite 插件？下一篇《Vite 极速构建》将为你揭秘。
