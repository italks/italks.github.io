# 测试驱动开发：Vitest 与 Cypress 实战 (Vue 3 Mastery Series - 09)

## 引言：不敢重构的恐惧

你是否有过这样的经历？
> 接手了一个老项目，想优化一段逻辑，但又害怕改坏了某个隐藏的功能点。
> 每次发版前都要手动点一遍所有流程，生怕漏测了一个按钮。

这就是缺乏自动化测试带来的恐惧。在 Vue 3 项目中，得益于 Vite 的极速构建，我们拥有了比以往任何时候都更好的测试体验。

本文将带你建立前端测试金字塔：**单元测试 (Unit Test)**、**组件测试 (Component Test)** 和 **端到端测试 (E2E Test)**。

## 1. 单元测试：Vitest 的极速体验

Vitest 是基于 Vite 的单元测试框架，它不仅快（利用了 Vite 的转换能力），而且 API 与 Jest 高度兼容。

### 1.1 测试纯逻辑函数

对于没有任何 UI 依赖的工具函数（如日期格式化、数据计算），单元测试是最容易上手的。

```javascript
// utils/sum.js
export function sum(a, b) {
  return a + b
}

// utils/sum.test.js
import { expect, test } from 'vitest'
import { sum } from './sum'

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3)
})
```

运行 `npm run test`，你会惊讶于它的启动速度。

### 1.2 测试 Composables

Composables 本质上也是函数，但它可能包含响应式状态。

```javascript
// composables/useCounter.js
import { ref } from 'vue'

export function useCounter() {
  const count = ref(0)
  const increment = () => count.value++
  return { count, increment }
}

// composables/useCounter.test.js
import { useCounter } from './useCounter'

test('increment counter', () => {
  const { count, increment } = useCounter()
  
  expect(count.value).toBe(0)
  increment()
  expect(count.value).toBe(1)
})
```

## 2. 组件测试：@vue/test-utils

有时候我们需要测试组件的行为：点击按钮后是否触发了事件？输入框变化后是否更新了 props？

这时候就需要 **Vue Test Utils**。

```vue
<!-- components/Counter.vue -->
<template>
  <button @click="count++">Count is: {{ count }}</button>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>
```

```javascript
// components/Counter.test.js
import { mount } from '@vue/test-utils'
import Counter from './Counter.vue'

test('increments value on click', async () => {
  const wrapper = mount(Counter)
  
  // 断言初始文本
  expect(wrapper.text()).toContain('Count is: 0')
  
  // 模拟点击
  await wrapper.find('button').trigger('click')
  
  // 断言更新后的文本
  expect(wrapper.text()).toContain('Count is: 1')
})
```

注意：这里使用了 `mount` 而不是 `shallowMount`。在 Vue 3 中，由于 setup 语法糖的存在，我们通常推荐直接挂载整个组件树进行测试。

## 3. 端到端测试 (E2E)：Cypress / Playwright

单元测试和组件测试只能保证代码逻辑是对的，但不能保证在真实浏览器中跑起来是对的。

E2E 测试会模拟真实用户的操作：打开浏览器 -> 访问页面 -> 点击登录 -> 跳转首页。

### 3.1 Cypress 实战

Cypress 是目前最流行的 E2E 框架之一，它的 API 非常语义化。

```javascript
// cypress/e2e/login.cy.js
describe('Login Flow', () => {
  it('successfully logs in', () => {
    cy.visit('/login')
    
    // 填写表单
    cy.get('input[name=username]').type('testuser')
    cy.get('input[name=password]').type('password123')
    
    // 点击提交
    cy.get('button[type=submit]').click()
    
    // 断言 URL 跳转
    cy.url().should('include', '/dashboard')
    
    // 断言页面内容
    cy.contains('Welcome, testuser')
  })
})
```

Cypress 会自动启动一个浏览器窗口，你可以看着它自动执行每一个步骤，就像有个隐形人在操作一样。

## 4. 总结：测试策略

1.  **工具函数 & Composables**：写 **Vitest 单元测试**。覆盖率高，运行快，是重构的基石。
2.  **核心业务组件**：写 **Vue Test Utils 组件测试**。关注交互逻辑（点击、输入、事件）。
3.  **关键用户路径**（登录、支付、下单）：写 **Cypress E2E 测试**。保证整个系统流程通畅。

**下一篇预告**：
基础和应用层面的内容我们已经讲完了。从下一篇开始，我们将进入**Vue 3 的内核世界**。你是否好奇 `reactive` 到底是怎么实现的？`track` 和 `trigger` 是如何配合工作的？下一篇《深入响应式原理 (上)》将带你手写一个 mini-vue。
