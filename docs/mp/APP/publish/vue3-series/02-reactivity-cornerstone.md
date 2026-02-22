# 响应式系统的基石：Ref 与 Reactive (Vue 3 全景攻略 - 02)

> **摘要**：Ref 还是 Reactive？这是 Vue 3 新手最常问的问题。本文深入剖析 Vue 3 响应式系统的底层机制，对比 Ref（包装原始值）与 Reactive（Proxy 代理）的核心差异与局限性。通过最佳实践建议与源码层面的原理解读，帮你彻底厘清两者的使用场景，避开解构丢失响应性等常见陷阱。

## 引言：Ref 还是 Reactive？这是个问题

Vue 3 引入了两个用于定义响应式数据的 API：`ref` 和 `reactive`。对于刚开始接触 Composition API 的开发者来说，最困惑的问题莫过于：

> **“我到底应该用 `ref` 还是 `reactive`？它们有什么区别？什么时候该用哪个？”**

甚至在 Vue 社区内部，关于“全面拥抱 `ref`”还是“坚持 `reactive`”的争论也从未停止。本篇文章将深入剖析这两者的底层机制，揭示它们的优缺点，并给出**最佳实践建议**。

## 1. 为什么我们需要两个 API？

在 Vue 2 中，我们只有一个 `data()` 选项，所有数据都是响应式的。但在 Vue 3 中，由于 JavaScript 语言本身的限制（Proxy 只能代理对象，不能代理原始值），我们需要区分处理**原始值**（Primitive Values，如 string, number, boolean）和**引用类型**（Reference Types，如 object, array）。

### 1.1 Ref 的本质：包装原始值

JavaScript 的原始值是按值传递的，无法被追踪变化。为了让一个 `number` 变成响应式，Vue 需要把它包装在一个对象里：

```javascript
// 伪代码：ref 的大致实现原理
function ref(value) {
  const wrapper = {
    get value() {
      track() // 收集依赖
      return value
    },
    set value(newValue) {
      value = newValue
      trigger() // 触发更新
    }
  }
  return wrapper
}
```

这就是为什么使用 `ref` 定义的变量，必须通过 `.value` 来访问的原因。

### 1.2 Reactive 的本质：Proxy 代理

对于对象类型，Vue 3 使用 ES6 的 `Proxy` API 来拦截对对象属性的读取和修改。

```javascript
const state = reactive({ count: 0 })
state.count++ // 直接访问，不需要 .value
```

看起来 `reactive` 更符合直觉（不需要 `.value`），但它有几个致命的**局限性**。

## 2. Reactive 的三大局限

### 2.1 局限一：仅对对象有效

你不能用 `reactive` 包装一个原始值：

```javascript
const count = reactive(0) // ❌ 警告：value cannot be made reactive
```

这意味着你的代码中会同时存在 `ref`（处理基础类型）和 `reactive`（处理对象），导致心智负担加重。

### 2.2 局限二：解构丢失响应性

这是新手最容易踩的坑。当你解构一个 `reactive` 对象时，如果属性是原始值，响应性就会丢失。

```javascript
const state = reactive({ count: 0 })
let { count } = state // ❌ 这里的 count 只是一个普通的 number 0

count++ // state.count 不会变，UI 也不会更新
```

为了解决这个问题，你必须使用 `toRefs`：

```javascript
import { toRefs } from 'vue'
const state = reactive({ count: 0 })
let { count } = toRefs(state) // ✅ count 现在是一个 ref
```

### 2.3 局限三：替换对象丢失引用

如果你直接替换整个 `reactive` 对象，原来的响应式连接会断开：

```javascript
let state = reactive({ items: [] })

// ❌ 这样做会导致 state 指向新的内存地址，原来的 Proxy 仍然被组件持有，但已经脱钩了
state = reactive({ items: [1, 2, 3] })

// ✅ 正确做法：修改属性，而不是替换对象
state.items = [1, 2, 3]
// 或者使用 Object.assign
Object.assign(state, { items: [1, 2, 3] })
```

而 `ref` 就没有这个问题，因为 `.value` 只是 wrapper 对象的一个属性，替换它完全没问题：

```javascript
const items = ref([])
items.value = [1, 2, 3] // ✅ 完美工作
```

## 3. 最佳实践：为什么推荐首选 Ref？

基于上述分析，目前 Vue 社区（包括官方文档的建议）越来越倾向于：**默认使用 `ref`，仅在特定场景使用 `reactive`**。

### 3.1 统一的心智模型

使用 `ref`，你不需要关心变量是对象还是原始值：

```javascript
const count = ref(0)
const user = ref({ name: 'Alice' })
const list = ref([1, 2, 3])
```

虽然需要写 `.value`，但在 IDE 的帮助下（如 Volar 插件），这并不是大问题。而且 `.value` 显式地告诉阅读代码的人：“这是一个响应式变量，它的变化会触发副作用”。

### 3.2 自动解包 (Auto-unwrapping)

在 `<template>` 中，Vue 会自动解包 `ref`，所以你**不需要**在模版里写 `.value`：

```vue
<template>
  <div>{{ count }}</div> <!-- ✅ 自动解包 -->
</template>
```

此外，Vue 3 的 `watch` 也能直接侦听 `ref`，不需要像侦听 `reactive` 属性那样写成 getter 函数：

```javascript
// ref
watch(count, (newVal) => console.log(newVal))

// reactive
watch(() => state.count, (newVal) => console.log(newVal))
```

## 4. 什么时候用 Reactive？

`reactive` 并非一无是处。在以下场景中，它依然有独特的优势：

1.  **分组管理相关状态**：当你有一组紧密相关的状态（例如表单数据）时，使用 `reactive` 可以让代码更整洁。
    ```javascript
    const formData = reactive({
      username: '',
      password: '',
      email: ''
    })
    ```
2.  **避免深层 `.value`**：如果你的状态结构嵌套很深，`ref.value.nested.prop` 可能会很繁琐，而 `reactive` 可以直接访问。

## 5. 源码揭秘：Ref 如何实现对象响应式？

你可能会问：`ref({ count: 0 })` 内部发生了什么？

实际上，当 `ref` 接收到一个对象时，它内部会自动调用 `reactive` 来转换这个对象。

```javascript
// 源码简化逻辑
class RefImpl {
  constructor(value) {
    // 如果是对象，就用 reactive 包装；如果是原始值，就直接存储
    this._value = isObject(value) ? reactive(value) : value
  }
  
  get value() {
    track(this, 'value')
    return this._value
  }
  
  set value(newVal) {
    this._value = isObject(newVal) ? reactive(newVal) : newVal
    trigger(this, 'value')
  }
}
```

这意味着：`ref` 是一个能够处理所有类型的“全能选手”，而 `reactive` 只是处理对象类型的“特长生”。

## 6. 总结

*   **Ref**：万能，处理原始值和对象，需要 `.value`（模版中自动解包），更安全（不易丢失响应性）。
*   **Reactive**：仅限对象，不需要 `.value`，解构需谨慎。

**建议**：作为初学者或团队规范，**默认使用 `ref`** 可以避免 90% 的响应式陷阱。只有当你非常清楚 `reactive` 的行为及其限制时，才考虑使用它来组织聚合状态。

**下一篇预告**：
搞定了响应式数据，接下来就是组件间的通信。Props, Emits, Slots 还有透传 Attributes，这些在 Vue 3 中有了哪些新变化？如何利用 `defineModel` 实现更优雅的双向绑定？下一篇《组件化设计哲学》见！

---

> **这里是《Vue 3 全景攻略》系列教程。**
>
> 如果你觉得这篇文章对你有帮助，欢迎 **点赞、在看、分享** 支持一下！
>
> 👇 **关注公众号「移动APP开发」，回复“Vue3”获取本系列完整思维导图与源码。**

*(此处插入公众号名片)*
