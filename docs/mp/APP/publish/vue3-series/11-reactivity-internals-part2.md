# 深入响应式原理 (下)：Computed 与 Watch 的实现细节 (Vue 3 全景攻略 - 11)

> **摘要**：继手写响应式系统后，本文进一步探索 Computed 与 Watch 的实现细节。我们将引入 Scheduler（调度器）概念，解析计算属性的缓存机制与懒执行策略，以及侦听器的 `flush` 执行时机。通过代码实现，你将深刻理解 Vue 3 如何通过精细的调度控制，实现高效的副作用管理与 DOM 更新。

## 引言：从被动响应到主动调度

在上一篇中，我们实现了一个最基础的响应式系统：只要数据一变，依赖它的所有副作用（Effect）就会立即执行。

但在实际开发中，我们往往需要更精细的控制：
1.  **Computed (计算属性)**：我不希望每次依赖变化都重新计算，只有在用到它时才计算（懒执行），而且如果依赖没变，直接用缓存（缓存）。
2.  **Watch (侦听器)**：我想在数据变化后做点异步操作，或者等 DOM 更新完了再执行回调。

为了实现这些功能，我们需要引入两个重要概念：**Scheduler (调度器)** 和 **Lazy Evaluation (懒执行)**。

## 1. 调度器 Scheduler：控制执行时机

默认情况下，`trigger` 触发时会直接调用 `effect()`。如果我们给 `effect` 增加一个 `scheduler` 选项，让用户自己决定什么时候执行，会怎么样？

```javascript
function effect(fn, options = {}) {
  const effectFn = () => { /* ... */ }
  effectFn.options = options // 存储选项
  // ...
}

function trigger(target, key) {
  // ...
  const effects = depsMap.get(key)
  effects.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      // 如果有调度器，调用调度器
      effectFn.options.scheduler(effectFn)
    } else {
      // 否则直接执行
      effectFn()
    }
  })
}
```

有了调度器，我们就可以实现 `computed` 和 `watch` 了。

## 2. Computed 的实现原理：缓存与懒执行

`computed` 本质上是一个特殊的 `effect`。它有两个特点：
1.  **Lazy**：默认不执行，只有读取 `.value` 时才执行。
2.  **Cache**：如果依赖没变，多次读取只计算一次。

```javascript
function computed(getter) {
  let value
  let dirty = true // 脏标记，表示是否需要重新计算

  const effectFn = effect(getter, {
    lazy: true,
    scheduler() {
      // 依赖变化时，不立即计算，而是标记为脏
      if (!dirty) {
        dirty = true
        // 通知依赖本 computed 的副作用更新
        trigger(obj, 'value')
      }
    }
  })

  const obj = {
    get value() {
      if (dirty) {
        value = effectFn() // 重新计算
        dirty = false
      }
      track(obj, 'value') // 收集依赖
      return value
    }
  }

  return obj
}
```

你看，这就是 Computed 的奥秘：利用 `dirty` 标志位控制缓存，利用调度器拦截更新。

## 3. Watch 的实现原理：副作用调度

`watch` 的实现相对简单，它利用调度器来控制回调的执行时机。

```javascript
function watch(source, cb, options = {}) {
  let getter
  if (typeof source === 'function') {
    getter = source
  } else {
    getter = () => traverse(source) // 递归读取属性
  }

  let oldValue, newValue

  // 调度器 job
  const job = () => {
    newValue = effectFn()
    cb(newValue, oldValue)
    oldValue = newValue
  }

  const effectFn = effect(getter, {
    lazy: true,
    scheduler: () => {
      // 控制 flush 时机：pre, post, sync
      if (options.flush === 'post') {
        queuePostFlushCb(job) // 放入微任务队列，DOM 更新后执行
      } else {
        job()
      }
    }
  })

  if (options.immediate) {
    job()
  } else {
    oldValue = effectFn() // 首次执行，收集依赖
  }
}
```

### 3.1 Flush Options

*   `flush: 'pre'` (默认)：在 DOM 更新前执行。Vue 内部维护了一个队列，利用微任务（Promise.resolve()）来批量执行。
*   `flush: 'post'`：在 DOM 更新后执行。通常用于需要访问更新后 DOM 的场景。
*   `flush: 'sync'`：同步执行，数据一变马上执行（性能开销大，少用）。

## 4. 总结：Vue 3 响应式系统的精髓

通过这两篇文章，我们从零构建了一个具备 `reactive`, `ref`, `computed`, `watch` 的响应式系统。

核心思想：
1.  **Proxy** 拦截操作。
2.  **WeakMap** 存储依赖。
3.  **Effect** 封装副作用。
4.  **Scheduler** 调度执行。

正是这些精妙的设计，让 Vue 3 在保持 API 简洁的同时，拥有了极其强大的表现力和性能。

**下一篇预告**：
数据变了，Vue 是如何更新 DOM 的？真的是“全量 Diff”吗？为什么说 Vue 3 的 Diff 算法比 Vue 2 快得多？下一篇《虚拟 DOM 与 Diff 算法》将为你揭秘编译时的静态优化魔法。

---

> **这里是《Vue 3 全景攻略》系列教程。**
>
> 如果你觉得这篇文章对你有帮助，欢迎 **点赞、在看、分享** 支持一下！
>
> 👇 **关注公众号「移动APP开发」，回复“Vue3”获取本系列完整思维导图与源码。**

*(此处插入公众号名片)*
