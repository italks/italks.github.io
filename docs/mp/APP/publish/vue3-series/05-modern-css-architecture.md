# 现代 CSS 架构：从 Scoped 到 Tailwind/UnoCSS (Vue 3 Mastery Series - 05)

## 引言：CSS 的混沌与秩序

在前端开发中，CSS 往往是最容易失控的部分。随着项目规模的扩大，我们经常会遇到：
*   **全局污染**：改了一个类名，结果把别的页面搞崩了。
*   **命名困难**：绞尽脑汁想类名 (`.wrapper`, `.container-inner`, `.header-top-left`)。
*   **体积膨胀**：只有新增 CSS，不敢删除旧 CSS（因为不知道哪里还在用）。

Vue 从一开始就提供了 `<style scoped>` 来解决作用域问题，但这只是第一步。在 Vue 3 时代，原子化 CSS（Atomic CSS）的崛起，为我们提供了一种全新的样式管理思路。

## 1. Vue 内置方案：Scoped CSS

这是 Vue 开发者最熟悉的方案。

```vue
<template>
  <div class="example">Hello</div>
</template>

<style scoped>
.example {
  color: red;
}
</style>
```

### 1.1 它是如何工作的？

Vue 编译器会在构建时给每个组件生成一个唯一的 `data-v-hash` 属性（例如 `data-v-f3f3eg9`），并将 CSS 选择器改写为 `.example[data-v-f3f3eg9]`。这样就能保证样式只在这个组件内生效。

### 1.2 深度选择器：:deep()

有时我们需要修改子组件（或者是第三方库组件）的样式，但 `scoped` 限制了选择器的穿透。这时就需要 `:deep()`。

```vue
<style scoped>
/* ❌ 错误：无法选中子组件内部元素 */
.my-component .child-class {
  background: blue;
}

/* ✅ 正确：使用 :deep() */
.my-component :deep(.child-class) {
  background: blue;
}
</style>
```

### 1.3 CSS Modules

如果你不喜欢 `scoped` 的这种隐式行为，Vue 也支持 **CSS Modules**。

```vue
<style module>
.red {
  color: red;
}
</style>

<template>
  <p :class="$style.red">This should be red</p>
</template>
```

CSS Modules 通过将类名编译成唯一的哈希值（如 `_red_1a2b3`）来避免冲突，且显式绑定类名。

### 1.4 v-bind() in CSS

Vue 3 一个非常酷的特性是可以在 CSS 中直接使用 JS 变量：

```vue
<script setup>
const color = ref('red')
</script>

<style scoped>
.text {
  color: v-bind(color);
}
</style>
```

这背后其实是利用了 CSS 自定义属性（CSS Variables），实现了动态主题切换的黑魔法。

## 2. 原子化 CSS 革命：Tailwind CSS

尽管 `scoped` 解决了冲突问题，但它没解决**重复代码**和**命名困难**的问题。每个组件里都在重复写 `display: flex; align-items: center;`。

**Tailwind CSS** 提倡使用 Utility Classes（工具类）来构建界面。

```html
<!-- 传统写法 -->
<div class="chat-notification">
  <div class="chat-notification-logo-wrapper">
    <img class="chat-notification-logo" src="/img/logo.svg" alt="ChitChat Logo">
  </div>
  <div class="chat-notification-content">
    <h4 class="chat-notification-title">ChitChat</h4>
    <p class="chat-notification-message">You have a new message!</p>
  </div>
</div>

<!-- Tailwind 写法 -->
<div class="p-6 max-w-sm mx-auto bg-white rounded-xl shadow-md flex items-center space-x-4">
  <div class="flex-shrink-0">
    <img class="h-12 w-12" src="/img/logo.svg" alt="ChitChat Logo">
  </div>
  <div>
    <div class="text-xl font-medium text-black">ChitChat</div>
    <p class="text-gray-500">You have a new message!</p>
  </div>
</div>
```

### 2.1 为什么选择 Tailwind？

1.  **无需命名**：再也不用纠结叫 `wrapper` 还是 `container`。
2.  **文件体积小**：因为复用了大量的 utility class，HTML 变大了，但 CSS 产物通常可以保持很小（取决于配置与按需扫描范围）。
3.  **设计系统一致性**：颜色、间距、字体大小都受限于配置文件，不会出现 `margin-top: 13px` 这种奇怪的值。

## 3. 下一代引擎：UnoCSS

如果说 Tailwind 是原子化 CSS 的开创者，那么 **UnoCSS** 就是它的**极速版**。

UnoCSS 是由 Vue 核心成员 Anthony Fu 开发的“按需原子化 CSS 引擎”。它不是一个框架，而是一个生成器。

### 3.1 为什么 UnoCSS 更适合 Vue？

它引入了 **Attributify Mode**（属性化模式），让原子类写起来更像 props：

```vue
<!-- Tailwind -->
<button class="bg-blue-500 text-white font-bold py-2 px-4 rounded">
  Button
</button>

<!-- UnoCSS Attributify -->
<button 
  bg="blue-500" 
  text="white" 
  font="bold" 
  py="2" px="4" 
  rounded
>
  Button
</button>
```

这种写法在 Vue 组件中显得非常整洁，而且具有更好的可读性。

### 3.2 纯 CSS 图标

UnoCSS 可以直接通过类名使用图标（基于 Iconify）：

```html
<div class="i-mdi-alarm text-3xl text-orange-400" />
```

这一行代码会在启用 `preset-icons` 并安装对应图标集依赖后自动内联 SVG 图标，无需额外的图标组件库。

## 4. 架构建议：混合策略

在大型 Vue 项目中，我们不必非此即彼。推荐采用 **混合策略**：

1.  **全局布局与通用样式**：使用 **UnoCSS / Tailwind**。
    *   Grid 布局、Flex 对齐、间距、颜色、排版。
2.  **复杂交互组件**：使用 **Scoped CSS**。
    *   当一个元素的样式极其复杂，或者涉及到复杂的伪元素、动画关键帧时，写一堆 utility class 会很难维护。此时用 `<style scoped>` 将其封装在组件内部是明智的。
3.  **动态样式**：使用 **v-bind()**。
    *   处理随数据变化的主题色或位置偏移。

## 5. 总结

CSS 架构没有银弹，但原子化 CSS 无疑是目前构建可维护、高性能前端项目的最佳实践之一。

*   **Scoped CSS**：简单、安全，适合组件内部私有样式。
*   **Tailwind / UnoCSS**：高效、统一，适合快速构建布局和通用 UI。
*   **UnoCSS**：Vue 开发者的首选，极致的性能与开发体验。

**下一篇预告**：
样式搞定了，数据怎么办？Vuex 已经过时了吗？Pinia 到底好在哪里？为什么说“服务端状态”应该和“客户端状态”分开管理？下一篇《状态管理进阶》将为你揭开现代前端数据流的奥秘。

---

> **这里是《Vue 3 全景攻略》系列教程。**
>
> 如果你觉得这篇文章对你有帮助，欢迎 **点赞、在看、分享** 支持一下！
>
> 👇 **关注公众号「移动APP开发」，回复“Vue3”获取本系列完整思维导图与源码。**

*(此处插入公众号名片)*
