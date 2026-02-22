# Vite 极速构建：配置详解与插件开发 (Vue 3 全景攻略 - 08)

> **摘要**：Vite 以“快”著称，但如何用好它？本文深入 Vite 的核心配置与构建优化，解析路径别名、跨域代理、依赖预构建等关键机制。我们将带你手写一个 Vite 插件，掌握构建时的代码转换能力，并介绍分包策略、图片优化等性能调优技巧，助你打造毫秒级启动的极致开发体验。

## 引言：为什么 Vite 这么快？

在 Webpack 统治前端构建的时代，我们已经习惯了修改一行代码要等几秒钟甚至十几秒钟才能看到效果。随着项目体积的膨胀，这种“冷启动慢、热更新慢”的问题严重影响了开发效率。

**Vite (法语“快”)** 的出现彻底改变了这一切。它通过**基于原生 ESM 的开发服务器**（利用浏览器原生支持模块导入的能力）和 **Rollup 打包生产代码**（利用 Tree-shaking 和代码分割）实现了极致的开发体验。

本文将深入探讨 Vite 的核心配置，教你如何解决常见的构建问题，并带你手写一个简单的 Vite 插件。

## 1. 核心配置详解：不仅仅是 alias

虽然 `vite.config.js` 开箱即用，但了解一些关键配置能帮你避坑。

### 1.1 路径别名 (resolve.alias)

为了避免写 `../../../components/Button.vue` 这种相对路径，我们通常会配置别名：

```javascript
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
```

### 1.2 跨域代理 (server.proxy)

开发时最常遇到的就是跨域问题。Vite 内置了强大的代理功能：

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000', // 后端地址
      changeOrigin: true, // 修改 Host 头
      rewrite: (path) => path.replace(/^\/api/, '') // 去掉 /api 前缀
    }
  }
}
```

这意味着当你请求 `/api/user` 时，Vite 会自动帮你转发到 `http://localhost:3000/user`。

### 1.3 构建选项 (build)

生产环境打包时，我们可以控制很多细节：

```javascript
build: {
  target: 'esnext', // 生成代码的兼容性目标
  minify: 'terser', // 使用 terser 压缩（比 esbuild 慢但体积更小）
  rollupOptions: {
    output: {
      // 手动分包策略
      manualChunks(id) {
        if (id.includes('node_modules')) {
          return 'vendor' // 将所有依赖打包到一个 vendor.js
        }
      }
    }
  }
}
```

## 2. 依赖预构建：Vite 的魔法

当你第一次启动项目时，Vite 会扫描你的源码，找出所有的依赖（如 `vue`, `lodash`），并将它们**预构建**成 ESM 格式，缓存在 `node_modules/.vite` 目录下。

为什么要这么做？
1.  **CommonJS 兼容**：很多老包（如 React, Lodash）发布的是 CommonJS 格式，浏览器无法直接运行。Vite 使用 esbuild 将它们转换为 ESM。
2.  **性能优化**：有些包（如 `lodash-es`）内部有几百个小文件。如果不预构建，浏览器会发起几百个 HTTP 请求，导致页面加载极慢。Vite 将它们合并成一个文件。

如果你遇到“找不到模块”或“依赖更新不生效”的问题，试着删除 `node_modules/.vite` 目录重启即可。

## 3. 插件开发实战：编写一个自动日志插件

Vite 插件本质上是一个**返回特定钩子函数的对象**。它基于 Rollup 插件接口，并扩展了一些 Vite 特有的钩子。

让我们写一个简单的插件 `vite-plugin-auto-log`：在每个 Vue 组件挂载 (`onMounted`) 时，自动打印一行日志 "Component Mounted: [Name]"。

### 3.1 插件结构

```javascript
// plugins/auto-log.js
export default function autoLogPlugin() {
  return {
    name: 'vite-plugin-auto-log',
    // transform 钩子：在代码被编译前修改它
    transform(code, id) {
      // 只处理 .vue 文件
      if (!id.endsWith('.vue')) return

      // 简单的正则匹配（生产环境建议使用 AST）
      if (code.includes('onMounted')) {
        const logCode = `console.log('Component Mounted: ${id}')`
        // 在 onMounted 内部插入日志（这里只是伪代码演示思路）
        return code.replace(/onMounted\s*\(\s*\(\)\s*=>\s*\{/, `onMounted(() => { ${logCode};`)
      }
    }
  }
}
```

### 3.2 使用插件

```javascript
// vite.config.js
import autoLogPlugin from './plugins/auto-log'

export default defineConfig({
  plugins: [vue(), autoLogPlugin()]
})
```

这就展示了 Vite 插件最强大的能力：**在构建时修改代码**。你可以利用这个机制实现国际化自动注入、图片自动压缩、甚至自动生成路由（如 `unplugin-vue-router`）。

## 4. 性能调优指南

1.  **分析产物体积**：使用 `rollup-plugin-visualizer` 生成可视化的包体积分析图，找出哪个依赖最大。
2.  **按需引入**：确保使用了支持 Tree-shaking 的库（如 `lodash-es` 替代 `lodash`）。
3.  **代码分割**：利用动态导入 `import()` 将路由组件分割成独立的 Chunk。
4.  **图片优化**：使用 `vite-plugin-imagemin` 在构建时压缩图片。

## 5. 总结

Vite 不仅仅是一个构建工具，它是一个**开发环境生态**。通过合理的配置和插件开发，我们可以极大地提升开发体验和应用性能。

*   **Alias & Proxy**：解决路径和跨域问题。
*   **预构建**：解决 CommonJS 兼容和请求过多的问题。
*   **插件系统**：无限扩展构建能力。

**下一篇预告**：
代码写得快、构建得快还不够，还得保证代码质量。如何进行单元测试？如何进行组件测试？Vitest 和 Cypress 怎么选？下一篇《测试驱动开发》将带你建立坚固的测试防线。

---

> **这里是《Vue 3 全景攻略》系列教程。**
>
> 如果你觉得这篇文章对你有帮助，欢迎 **点赞、在看、分享** 支持一下！
>
> 👇 **关注公众号「移动APP开发」，回复“Vue3”获取本系列完整思维导图与源码。**

*(此处插入公众号名片)*
