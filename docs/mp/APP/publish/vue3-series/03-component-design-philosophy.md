# 组件化设计哲学：Props, Emits 与 Slots (Vue 3 Mastery Series - 03)

## 引言：从面条代码到乐高积木

在现代前端开发中，组件化不仅仅是一种代码复用手段，更是一种**工程思维**。当我们谈论“组件化”时，我们不仅仅是在把一大坨 HTML/CSS/JS 切分到不同的文件里，更是在思考：

*   **数据如何流转？** (Props)
*   **状态如何改变？** (Emits)
*   **内容如何分发？** (Slots)

Vue 3 引入的 Composition API 和 `<script setup>` 语法糖，让这三大支柱变得更加简洁和强大。本文将带你重新审视 Vue 3 的组件化设计哲学，并介绍 `defineModel` 这个能够大幅提升开发体验的新特性。

## 1. 单向数据流：Props 的只读契约

在 Vue 中，父组件通过 `props` 向子组件传递数据。这个过程遵循**单向数据流**（One-Way Data Flow）原则：

> **父级 props 的更新会向下流动到子组件中，但是反过来则不行。**

这不仅仅是框架的限制，更是为了防止子组件意外修改父组件的状态，导致数据流向难以追踪。

### 1.1 Props 的定义与校验

在 `<script setup>` 中，我们使用 `defineProps` 宏来声明 props。它不需要导入，直接可用。

```vue
<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
})

// 在 script 中访问
console.log(props.title)
</script>

<template>
  <h1>{{ title }}</h1> <!-- 模版中直接访问 -->
</template>
```

### 1.2 TypeScript 用户的福音

如果你使用 TypeScript，你可以通过泛型参数来定义 props，这将获得极佳的类型推导体验：

```vue
<script setup lang="ts">
interface Props {
  title: string
  count?: number // 可选
  items: string[]
}

// 基于类型的声明，编译器会自动推导出运行时 props 选项
const props = defineProps<Props>()

// 设置默认值 (Vue 3.3+)
const { count = 0 } = defineProps<Props>()
</script>
```

## 2. 事件驱动：Emits 的契约精神

既然 props 是只读的，那子组件想要修改数据怎么办？答案是：**通知父组件去改**。

在 Vue 2 中，我们使用 `this.$emit`。在 Vue 3 `<script setup>` 中，我们使用 `defineEmits`。

```vue
<script setup>
const emit = defineEmits(['update:count', 'submit'])

const handleClick = () => {
  emit('update:count', props.count + 1)
}
</script>
```

### 2.1 类型化的 Emits

同样，TS 用户可以定义 payload 的类型：

```vue
<script setup lang="ts">
const emit = defineEmits<{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
}>()
</script>
```

这确保了你在调用 `emit('change', 'abc')` 时，编译器会报错，因为 `id` 必须是数字。

## 3. 双向绑定的进化：defineModel (Vue 3.4+)

长期以来，Vue 的 `v-model` 其实是 `props` + `emit` 的语法糖。在 Vue 3.4 之前，实现一个支持 `v-model` 的组件需要写很多样板代码：

1.  定义 `props: ['modelValue']`
2.  定义 `emits: ['update:modelValue']`
3.  在 input 事件中 emit 更新

Vue 3.4 引入了 `defineModel` 宏，彻底简化了这个过程：

```vue
<!-- Child.vue -->
<script setup>
// 声明一个双向绑定的 prop
const model = defineModel()

// 修改 model.value 会自动触发 'update:modelValue' 事件
const update = () => {
  model.value++
}
</script>

<template>
  <input v-model="model" />
</template>
```

父组件使用：

```vue
<Parent>
  <Child v-model="count" />
</Parent>
```

`defineModel` 返回的是一个 `ref`，你可以像操作普通响应式变量一样操作它，Vue 会自动处理底层的 props/emit 逻辑。这是 Vue 3 组件化体验的一次巨大飞跃！

## 4. 内容分发：Slots 的灵活定制

Props 传递数据，Slots 传递**内容**（DOM 结构）。这使得组件能够像 HTML 元素一样嵌套使用。

### 4.1 默认插槽与具名插槽

```vue
<!-- Layout.vue -->
<template>
  <header>
    <slot name="header"></slot> <!-- 具名插槽 -->
  </header>
  <main>
    <slot></slot> <!-- 默认插槽 -->
  </main>
</template>
```

使用：

```vue
<Layout>
  <template #header>
    <h1>页面标题</h1>
  </template>
  <p>主要内容...</p>
</Layout>
```

### 4.2 作用域插槽 (Scoped Slots)：数据反向传递

这是 Slots 最强大的功能：**子组件将数据回传给插槽内容**。这在列表渲染、表格组件中非常常见。

```vue
<!-- MyList.vue -->
<script setup>
const items = ref(['A', 'B', 'C'])
</script>

<template>
  <ul>
    <li v-for="item in items">
      <!-- 将 item 数据暴露给插槽 -->
      <slot :item="item"></slot>
    </li>
  </ul>
</template>
```

父组件接收数据并自定义渲染：

```vue
<MyList>
  <!-- 解构出子组件传递的 item -->
  <template #default="{ item }">
    <span style="color: red">{{ item }}</span>
  </template>
</MyList>
```

这让 `MyList` 组件只负责逻辑（遍历），而将渲染权（样式、结构）完全交还给了父组件，实现了极致的解耦。

## 5. 透传 Attributes：$attrs

当你在组件上写 `class`, `style` 或 `v-on` 监听器，但组件内部并没有显式声明对应的 `props` 或 `emits` 时，这些属性会**透传**（Fallthrough）到组件的根元素上。

```vue
<!-- MyButton.vue -->
<template>
  <button class="btn">Click Me</button>
</template>

<!-- Parent.vue -->
<MyButton class="large" @click="onClick" />
```

最终渲染结果：
```html
<button class="btn large">Click Me</button> <!-- class 合并，click 事件绑定 -->
```

如果你不希望透传到根元素（例如你想绑定到内部的 `input` 而不是外层的 `div`），可以在 script 中设置 `inheritAttrs: false`，然后使用 `v-bind="$attrs"` 手动绑定。

## 6. 总结

*   **Props** 是只读的数据契约，使用 `defineProps` 声明。
*   **Emits** 是状态变更的通知，使用 `defineEmits` 声明。
*   **defineModel** 是实现双向绑定的终极利器，简化了 `v-model` 的实现。
*   **Slots** 让组件的内容结构可定制，作用域插槽更是解耦神器。

掌握了这些，你已经能够编写出高质量、可复用的 Vue 组件了。但随着逻辑越来越复杂，仅仅依靠组件拆分可能还不够。如何提取跨组件复用的逻辑？如何避免 Mixins 的陷阱？

**下一篇预告**：
《逻辑复用新范式：Composables》。我们将学习如何利用 Composition API 编写优雅的组合式函数 (Hooks)，彻底改变你的代码组织方式。
