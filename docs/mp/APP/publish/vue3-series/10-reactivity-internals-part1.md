# 深入响应式原理 (上)：手写一个简易 Reactivity 系统 (Vue 3 Mastery Series - 10)

## 引言：为什么学原理？

“面试造航母，工作拧螺丝”——这是很多开发者的自嘲。但我始终认为，**学习底层原理不仅仅是为了面试**。

当你遇到 Bug 却不知道为什么数据变了 UI 没更新时；当你写出了导致性能雪崩的代码却不自知时；当你想要封装一个高级的 Hooks 却无从下手时……对原理的理解就是你的救命稻草。

Vue 3 的响应式系统是其最核心、最精妙的部分。本文将带你从零开始，用几十行代码手写一个简易版的 `reactive` 和 `effect`，彻底搞懂它的运作机制。

## 1. 核心概念：依赖收集与触发更新

响应式系统的本质可以归纳为两句话：
1.  **当读取数据时**，把当前正在执行的函数（副作用）**收集**起来。（`track`）
2.  **当修改数据时**，把刚才收集到的函数**重新执行**一遍。（`trigger`）

我们需要三个核心角色：
*   **Target**：原始对象，存储数据。
*   **Dep (Dependency)**：依赖集合，存储副作用函数（通常是一个 `Set`）。
*   **Effect**：副作用函数，比如渲染函数、computed、watch。

## 2. 第一步：实现 reactive (Proxy 拦截)

Vue 3 使用 ES6 `Proxy` 来拦截对象操作。

```javascript
// 全局变量，存储当前正在执行的副作用函数
let activeEffect = null

function reactive(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      // 1. 收集依赖
      track(target, key)
      return Reflect.get(target, key, receiver)
    },
    set(target, key, value, receiver) {
      const oldValue = target[key]
      const result = Reflect.set(target, key, value, receiver)
      // 2. 触发更新（如果值变了）
      if (oldValue !== value) {
        trigger(target, key)
      }
      return result
    }
  })
}
```

## 3. 第二步：实现 track (依赖收集)

我们需要一个全局的容器来存储“对象 -> 属性 -> 依赖集合”的映射关系。通常使用 `WeakMap`。

```javascript
// WeakMap<target, Map<key, Set<effect>>>
const targetMap = new WeakMap()

function track(target, key) {
  // 如果没有正在执行的副作用，直接返回
  if (!activeEffect) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }

  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }

  // 把当前副作用添加到依赖集合中
  dep.add(activeEffect)
}
```

## 4. 第三步：实现 trigger (触发更新)

当属性被修改时，找到对应的依赖集合，依次执行。

```javascript
function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const dep = depsMap.get(key)
  if (dep) {
    // 遍历所有依赖并执行
    dep.forEach(effect => effect())
  }
}
```

## 5. 第四步：实现 effect (副作用函数)

`effect` 函数负责设置 `activeEffect`，并执行传入的函数 fn。

```javascript
function effect(fn) {
  const effectFn = () => {
    try {
      activeEffect = effectFn
      // 执行 fn 时会触发 getter -> 调用 track -> 收集 activeEffect
      return fn()
    } finally {
      activeEffect = null // 重置
    }
  }
  
  // 立即执行一次，触发依赖收集
  effectFn()
}
```

## 6. 整合测试

让我们来看看这个 mini-reactivity 系统能不能工作：

```javascript
const state = reactive({ count: 0 })

effect(() => {
  console.log('Count changed:', state.count)
})
// 输出: Count changed: 0

state.count++ 
// 触发 setter -> trigger -> 执行 effect
// 输出: Count changed: 1
```

成功了！我们只用了不到 50 行代码，就实现了 Vue 3 响应式系统的核心逻辑。

当然，真正的 Vue 3 源码要复杂得多，还需要处理：
*   **嵌套 Effect**（组件嵌套组件）。
*   **数组长度变化**。
*   **Map/Set 类型支持**。
*   **清理依赖**（避免内存泄漏）。
*   **调度器 Scheduler**（控制执行时机）。

关于调度器和 `computed`/`watch` 的实现，我们将在下一篇详细讲解。

**下一篇预告**：
为什么 `computed` 有缓存？`watch` 是怎么知道数据变了的？`flush: 'post'` 是什么意思？下一篇《深入响应式原理 (下)》将为你揭秘这些高级特性的实现细节。
