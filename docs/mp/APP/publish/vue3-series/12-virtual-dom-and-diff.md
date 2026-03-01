# 虚拟 DOM 与 Diff 算法：Vue 3 的性能秘密 (Vue 3 全景攻略 - 12)

> **摘要**：Vue 3 为什么比 Vue 2 快？秘密在于编译时优化。本文深入剖析 Vue 3 的虚拟 DOM 与 Diff 算法，揭秘 Patch Flags（补丁标记）、Static Hoisting（静态提升）与 Block Tree（区块树）如何实现靶向更新。同时，我们将探讨最长递增子序列（LIS）算法在列表 Diff 中的应用，领略算法之美。

## 引言：Virtual DOM 的功与过

React 引入 Virtual DOM 之后，前端界掀起了一场革命。它的核心思想是：**操作真实 DOM 太慢了，不如在 JS 里操作一个轻量级的对象树，最后再一次性更新 DOM**。

但是，随着 Vue 2 和 React 的发展，人们发现了一个问题：**每次数据变化都要重新生成整棵 VDOM 树并进行 Diff，这本身也有开销**。尤其是对于很多静态内容（比如 `<div>Hello</div>`），它永远不会变，为什么还要每次都 Diff 它呢？

Vue 3 通过**编译时优化 (Compile-time Optimization)**，显著缓解了这个问题，实现了比 Vue 2 更高效的渲染性能。

## 1. Vue 3 的编译优化三板斧

### 1.1 Patch Flags (补丁标记)

Vue 3 的编译器在生成 VDOM 时，会给动态节点打上一个标记（PatchFlag）。

```vue
<template>
  <div>
    <span>Hello</span> <!-- 静态节点 -->
    <span :class="active">{{ msg }}</span> <!-- 动态节点 -->
  </div>
</template>
```

编译后的代码（伪代码）：

```javascript
_createElementVNode("div", null, [
  _createElementVNode("span", null, "Hello"), // 静态
  _createElementVNode("span", { class: active }, msg, 1 /* TEXT */) // 动态，PatchFlag = 1
])
```

在运行时 Diff 阶段，Vue 看到 `PatchFlag === 1`，就知道：**“这个节点只有文本内容是动态的，我只比对文本，不比对 class、style 等其他属性”**。

这使得 Diff 算法从**全量比对**变成了**靶向更新**，性能不再与模板大小成正比，而是与动态内容的数量成正比。

### 1.2 Static Hoisting (静态提升)

对于那些永远不会变的静态节点，Vue 3 会把它们的创建过程**提升**到渲染函数之外。

```javascript
// 提升到 render 函数外面，只创建一次
const _hoisted_1 = _createElementVNode("span", null, "Hello")

export function render() {
  return _createElementVNode("div", null, [
    _hoisted_1, // 直接复用，不再重新创建 VNode
    _createElementVNode("span", { class: active }, msg, 1)
  ])
}
```

这意味着在多次渲染中，静态节点的 VNode 对象是同一个引用，Diff 算法可以直接跳过它们（`oldVNode === newVNode`）。

### 1.3 Block Tree (区块树)

在 Vue 2 中，组件的 VDOM 树是一个层级结构。为了找到动态节点，必须递归遍历整棵树。

Vue 3 引入了 **Block** 的概念。一个组件就是一个 Block，它会收集内部所有的动态子节点（无论层级多深），放进一个 `dynamicChildren` 数组。

```javascript
const block = {
  type: 'div',
  children: [...],
  dynamicChildren: [ // 扁平化的动态节点数组
    vnode_msg,
    vnode_class
  ]
}
```

Diff 时，Vue 只需要遍历这个扁平数组，完全忽略了层级结构。这就是为什么 Vue 3 的 Diff 速度极快的原因。

## 2. Diff 算法核心：最长递增子序列

当处理 `v-for` 列表更新时，Diff 算法需要解决一个经典问题：**如何通过最少的移动操作，把旧列表变成新列表？**

例如：
Old: `[A, B, C, D, E, F, G]`
New: `[A, B, E, C, D, H, F, G]`

Vue 3 采用了 **最长递增子序列 (Longest Increasing Subsequence, LIS)** 算法。

### 2.1 算法思路

1.  **预处理**：先处理头部和尾部相同的节点（A, B 和 F, G）。
2.  **构建映射**：建立新列表中剩余节点 key 到 index 的 Map。
3.  **生成数组**：生成一个数组 `newIndexToOldIndexMap`，记录新节点在旧列表中的位置。
4.  **计算 LIS**：计算这个数组的最长递增子序列。这个序列中的节点**不需要移动**。
5.  **移动节点**：倒序遍历，将不在 LIS 中的节点移动到正确位置。

Vue 2 使用的是双端 Diff 算法，而 Vue 3 的 LIS 算法在处理复杂乱序场景下，能保证移动次数最少，性能更优。

## 3. 总结

Vue 3 的性能提升并非仅仅依靠更快的 JS 引擎，而是通过**编译器与运行时的深度配合**：

1.  **编译时**：标记动态节点（Patch Flags），提升静态节点，扁平化结构（Block Tree）。
2.  **运行时**：利用这些信息进行靶向更新，配合 LIS 算法优化列表 Diff。

这种“动静结合”的设计思路，是 Vue 3 区别于 React（纯运行时 Diff）的最大特征，也是其性能领先的关键。

**下一篇预告**：
我们一直在说“编译器”，那 Vue 的模版到底是怎么变成 JS 代码的？`v-if`、`v-for` 是怎么被编译的？下一篇《编译器探秘》将带你走进 Vue 3 的编译世界。

---

> **这里是《Vue 3 全景攻略》系列教程。**
>
> 如果你觉得这篇文章对你有帮助，欢迎 **点赞、在看、分享** 支持一下！
>
> 👇 **关注公众号「移动APP开发」，回复“Vue3”获取本系列完整思维导图与源码。**

*(此处插入公众号名片)*
