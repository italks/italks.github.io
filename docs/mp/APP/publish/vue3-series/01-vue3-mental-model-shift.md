# Vue 3 新纪元：思维模型的转变 (Vue 3 Mastery Series - 01)

## 引言：为什么我们需要 Vue 3？

对于很多习惯了 Vue 2 `Options API` 的开发者来说，Vue 3 的到来最初可能带来了一些困惑："我原来的 `data`, `methods`, `computed` 写得好好的，为什么要换成 `setup`？为什么要搞这么复杂的 `ref` 和 `reactive`？"

如果你也有这样的疑问，那么你可能还没有真正理解 Vue 3 带来的核心变革——**从“配置式”到“组合式”的思维模型转变**。

本篇文章作为《Vue 3 全景攻略》系列的第一篇，我们将抛开繁琐的 API 细节，从设计哲学的角度，探讨 Vue 3 到底解决了什么痛点，以及如何重塑你的前端开发思维。

## 1. Vue 2 的痛点：逻辑碎片化

在 Vue 2 的 `Options API` 中，我们的代码是按照**选项**（Options）来组织的：

```javascript
export default {
  data() {
    return {
      searchQuery: '',
      items: [],
      isLoading: false
    }
  },
  methods: {
    fetchItems() { /* ... */ },
    filterItems() { /* ... */ }
  },
  computed: {
    filteredItems() { /* ... */ }
  },
  mounted() {
    this.fetchItems()
  }
}
```

这种组织方式在组件简单时非常直观。但随着组件变得复杂，比如我们在这个组件里增加了一个“排序功能”和一个“分页功能”，你会发现：
*   排序相关的 `data` 在顶部。
*   排序相关的 `methods` 在中间。
*   排序相关的 `computed` 在底部。

**同一功能的代码被强制拆分到了不同的选项中**。当你需要修改“排序功能”时，你不得不在文件上下反复跳转。这被称为**“逻辑碎片化”**（Logical Fragmentation）。

## 2. Vue 3 的解药：Composition API (组合式 API)

Vue 3 引入 `Composition API` 的核心目的，就是为了解决逻辑复用和代码组织的问题。它允许我们按照**逻辑关注点**（Logical Concerns）来组织代码。

### 2.1 什么是“组合式”思维？

想象一下，如果我们可以把“搜索功能”、“排序功能”、“分页功能”分别封装成独立的函数，然后在组件里把它们“组合”起来，代码会变成什么样？

```javascript
// Composition API 风格
import { useSearch } from './composables/useSearch'
import { useSort } from './composables/useSort'
import { usePagination } from './composables/usePagination'

export default {
  setup() {
    const { searchQuery, items, fetchItems } = useSearch()
    const { sortKey, sortItems } = useSort(items)
    const { currentPage, changePage } = usePagination(items)

    return {
      searchQuery,
      items,
      sortKey,
      currentPage
    }
  }
}
```

这种写法带来的好处是显而易见的：
1.  **高内聚**：相关功能的代码在一起，维护时不再需要“反复横跳”。
2.  **低耦合**：功能模块之间通过参数传递依赖，清晰明了。
3.  **可复用**：`useSearch`, `useSort` 等函数可以轻松地提取到独立文件中，在其他组件复用（告别了 Mixins 的命名冲突和来源不清问题）。

## 3. Setup 语法糖：极致的开发体验

在 Vue 3.0 刚发布时，我们需要在 `setup()` 函数中手动返回所有需要在模版中使用的变量，这确实有点繁琐。但随着 Vue 3.2 引入 `<script setup>` 语法糖，一切都变了。

### 3.1 更少的样板代码

```vue
<script setup>
import { ref, onMounted } from 'vue'

// 变量直接定义，无需 return
const count = ref(0)

// 函数直接定义
const increment = () => count.value++

// 生命周期直接使用
onMounted(() => console.log('Mounted!'))
</script>

<template>
  <button @click="increment">{{ count }}</button>
</template>
```

`<script setup>` 不仅是语法糖，它还带来了**更好的运行时性能**（模版编译时可以直接通过闭包访问变量，无需通过代理）和**更好的 TypeScript 类型推导**。

## 4. 思维转变实战：从 Options 到 Composition

让我们通过一个简单的“鼠标追踪器”功能，来体验这种思维的转变。

### 4.1 Options API 实现

```javascript
export default {
  data() {
    return {
      x: 0,
      y: 0
    }
  },
  methods: {
    update(e) {
      this.x = e.pageX
      this.y = e.pageY
    }
  },
  mounted() {
    window.addEventListener('mousemove', this.update)
  },
  unmounted() {
    window.removeEventListener('mousemove', this.update)
  }
}
```

### 4.2 Composition API 实现

```javascript
import { ref, onMounted, onUnmounted } from 'vue'

export function useMouse() {
  const x = ref(0)
  const y = ref(0)

  const update = (e) => {
    x.value = e.pageX
    y.value = e.pageY
  }

  onMounted(() => window.addEventListener('mousemove', update))
  onUnmounted(() => window.removeEventListener('mousemove', update))

  return { x, y }
}
```

在组件中使用：

```vue
<script setup>
import { useMouse } from './useMouse'

const { x, y } = useMouse()
</script>
```

你看，我们不仅实现了功能，还顺手把它变成了一个可复用的 Hooks！这就是 Vue 3 思维模型的最大魅力——**在编写业务逻辑的同时，你就在构建可复用的基础设施**。

## 5. 总结与预告

Vue 3 的 `Composition API` 并不是要完全取代 `Options API`（后者在简单场景下依然好用），但它提供了一种**处理复杂性**的强大能力。它要求我们从“填写配置”转变为“设计逻辑”，这对开发者的抽象能力提出了更高的要求，但回报是更健壮、更可维护的代码库。

**下一篇预告**：
理解了思维模型后，我们面临的第一个技术挑战就是响应式数据的定义。`ref` 和 `reactive` 到底有什么区别？为什么解构会丢失响应性？下一篇《响应式系统的基石：Ref 与 Reactive》将为你深度解密。

---

> **这里是《Vue 3 全景攻略》系列教程。**
>
> 如果你觉得这篇文章对你有帮助，欢迎 **点赞、在看、分享** 支持一下！
>
> 👇 **关注公众号「移动APP开发」，回复“Vue3”获取本系列完整思维导图与源码。**

*(此处插入公众号名片)*
