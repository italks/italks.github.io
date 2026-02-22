# 逻辑复用新范式：Composables (组合式函数) (Vue 3 Mastery Series - 04)

## 引言：Mixins 已死，Composables 当立

在 Vue 2 时代，如果我们想在多个组件之间复用逻辑（比如“分页功能”或“鼠标位置追踪”），唯一的选择通常是 **Mixins**。

```javascript
// Vue 2 Mixin 写法
export const paginationMixin = {
  data() {
    return { currentPage: 1, pageSize: 10 }
  },
  methods: {
    changePage(page) { this.currentPage = page }
  }
}
```

虽然它能工作，但 Mixins 带来了两个著名的痛点：
1.  **命名冲突**：如果不小心在组件里定义了一个叫 `currentPage` 的变量，它会悄无声息地覆盖 Mixin 里的同名变量，导致 Bug 难以排查。
2.  **来源不详**：当一个组件使用了 3 个 Mixins，而你在 `template` 里看到一个 `this.formatDate` 方法时，你完全不知道它来自哪个 Mixin，只能一个个文件去翻。

Vue 3 的 **Composition API** 彻底终结了 Mixins 的时代。我们通过编写 **Composables**（组合式函数），实现了逻辑的优雅复用。

## 1. 什么是 Composable？

简单来说，Composable 就是一个**利用 Vue Composition API 来封装和复用有状态逻辑的函数**。

它通常遵循以下约定：
*   函数名以 `use` 开头（如 `useMouse`, `useFetch`）。
*   接收参数（通常是 `ref` 或 getter 函数）。
*   返回一个对象，包含响应式状态和修改状态的方法。

## 2. 实战：封装一个 useFetch

让我们从一个最常见的场景开始：数据请求。我们希望封装一个能够处理 `loading`、`error` 和 `data` 状态的通用请求函数。

```javascript
// composables/useFetch.js
import { ref, watchEffect, toValue } from 'vue'

export function useFetch(url) {
  const data = ref(null)
  const error = ref(null)
  const isFetching = ref(true)

  const fetchData = async () => {
    // 重置状态
    data.value = null
    error.value = null
    isFetching.value = true

    // toValue() 是 Vue 3.3+ 的工具，可以解包 ref 或 getter
    const urlValue = toValue(url)

    try {
      const res = await fetch(urlValue)
      if (!res.ok) throw new Error(res.statusText)
      data.value = await res.json()
    } catch (err) {
      error.value = err
    } finally {
      isFetching.value = false
    }
  }

  // 自动侦听 url 变化并重新请求
  watchEffect(() => {
    fetchData()
  })

  return { data, error, isFetching, retry: fetchData }
}
```

### 2.1 在组件中使用

```vue
<script setup>
import { ref, computed } from 'vue'
import { useFetch } from './composables/useFetch'

const id = ref(1)
const url = computed(() => `https://jsonplaceholder.typicode.com/todos/${id.value}`)

// 传入响应式的 url，当 id 变化时，useFetch 会自动重新请求
const { data, error, isFetching } = useFetch(url)
</script>

<template>
  <button @click="id++">Next Todo</button>
  
  <div v-if="isFetching">Loading...</div>
  <div v-else-if="error">Error: {{ error.message }}</div>
  <div v-else>{{ data }}</div>
</template>
```

你看，我们在组件里没有写任何 `try-catch` 或 `loading` 状态管理的逻辑，所有脏活累活都被 `useFetch` 承包了。

## 3. Composable 设计原则

编写优秀的 Composable 需要遵循一些最佳实践：

### 3.1 参数灵活性

你的 Composable 应该既能接收普通值，也能接收 `ref` 或 `getter`。Vue 3.3 引入的 `toValue` 辅助函数就是为此而生的。

```javascript
// ❌ 不灵活
function useTitle(title) {
  document.title = title.value // 强依赖 ref
}

// ✅ 灵活
import { toValue } from 'vue'
function useTitle(title) {
  // title 可以是 string, ref(string), 或 () => string
  const value = toValue(title)
  document.title = value
}
```

### 3.2 返回值解构

通常建议返回一个普通对象，而不是 `reactive` 对象，以便用户可以解构使用，且不会丢失响应性（因为属性本身是 `ref`）。

```javascript
// ✅ 推荐
return { x, y } 

// ❌ 不推荐（解构会丢失响应性，除非用 toRefs）
return reactive({ x, y })
```

### 3.3 副作用清理

如果你的 Composable 注册了事件监听器（如 `window.addEventListener`）或定时器，务必在 `onUnmounted` 或 `onScopeDispose` 中清理它们，防止内存泄漏。

```javascript
import { onScopeDispose } from 'vue'

export function useEventListener(target, event, callback) {
  target.addEventListener(event, callback)
  
  // 自动清理
  onScopeDispose(() => {
    target.removeEventListener(event, callback)
  })
}
```

## 4. 状态共享：替代 Vuex？

Composables 不仅可以复用逻辑，还可以**共享状态**。

如果我们将状态定义在函数**外部**，那么这个状态就是全局唯一的（Singleton）。

```javascript
// store/useUser.js
import { ref } from 'vue'

// ⚠️ 注意：这个 ref 是在函数外部定义的
const user = ref(null)

export function useUser() {
  const login = async (username) => {
    user.value = { name: username }
  }
  
  return { user, login }
}
```

无论你在多少个组件里调用 `useUser()`，它们访问的都是同一个 `user` 变量。这在某种程度上可以替代简单的 Vuex/Pinia，用于跨组件共享数据。

## 5. VueUse：工具库的宝藏

在自己动手写 Composable 之前，强烈建议先去看看 **[VueUse](https://vueuse.org/)**。它是 Vue 社区最大的 Composable 工具库，包含 200+ 个开箱即用的函数。

*   `useStorage`: 自动同步 localStorage。
*   `useMouse`: 追踪鼠标位置。
*   `useDark`: 暗黑模式切换。
*   `onClickOutside`: 点击元素外部触发。

**不要重复造轮子**，除非你需要深度定制。

## 6. 总结

Composables 是 Vue 3 的灵魂所在。它让我们不再被 Options API 的条条框框束缚，而是像搭积木一样，将一个个独立的功能模块（Hooks）组合成复杂的业务逻辑。

*   **告别 Mixins**：解决了命名冲突和来源不详的问题。
*   **逻辑复用**：将业务逻辑从 UI 组件中剥离。
*   **状态共享**：简单的全局状态管理。

**下一篇预告**：
有了逻辑复用，我们的组件结构已经很清晰了。但是样式（CSS）该怎么写？是继续用 Scoped CSS，还是拥抱原子化的 Tailwind CSS？下一篇《现代 CSS 架构》将为你揭晓。
