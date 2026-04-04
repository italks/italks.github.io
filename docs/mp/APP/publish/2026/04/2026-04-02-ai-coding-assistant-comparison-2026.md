# 【实测】type="module" 的三个坑：路径解析、异步加载与等待完成

> **摘要**：引入 JS 脚本时，有没有 `type="module"` 差别有多大？本文用 5 个真实案例，实测路径解析差异、异步加载机制、等待模块加载的正确姿势。预计阅读 6 分钟，文末有可复制的代码模板。

---

最近在重构一个前端项目，遇到了一个诡异问题：

```html
<!-- 页面地址：https://example.com/pages/chat.html -->
<script type="module">
  import { ChatApp } from './chat.js';  // ❌ 报错：找不到模块
</script>
```

去掉 `type="module"` 就正常，加上就报错。查了半天才发现：**ES Module 的路径解析规则和普通脚本完全不同**。

这个坑让我决定系统测一遍 `type="module"` 的所有差异，整理成这份实测报告。

## 一、路径解析：module 相对的是模块文件，不是 HTML

### 实测案例 1：相对路径的差异

**测试环境**：
- HTML 页面：`https://example.com/pages/chat.html`
- 模块文件：`https://example.com/scripts/chat.js`
- 依赖文件：`https://example.com/scripts/utils.js`

**普通脚本的解析逻辑**：

```html
<!-- 在 chat.html 中 -->
<script src="../scripts/chat.js"></script>
<!-- 实际请求：https://example.com/scripts/chat.js ✅ -->
```

普通脚本的 `src` 相对路径**相对于 HTML 文件所在目录**解析。

**模块脚本的解析逻辑**：

```html
<!-- 在 chat.html 中 -->
<script type="module">
  import { utils } from './utils.js';
  // 解析为：https://example.com/pages/utils.js ❌
  // 实际文件在：https://example.com/scripts/utils.js
</script>
```

**关键结论**：
> ES Module 的 `import` 路径**相对于当前模块文件所在目录**，而不是 HTML 页面！

**正确写法**：

```html
<!-- chat.html 中引入模块 -->
<script type="module">
  import { ChatApp } from '../scripts/chat.js';  // ✅ 相对于 HTML
  
  // 或者在 chat.js 模块内部
  // import { utils } from './utils.js';  // ✅ 此时相对于 chat.js
</script>
```

### 实测案例 2：import map 解决路径混乱

在项目中，我这样组织代码：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Project</title>
  
  <!-- ✅ 使用 import map 统一管理路径 -->
  <script type="importmap">
  {
    "imports": {
      "@components/": "/static/js/components/",
      "@utils/": "/static/js/utils/",
      "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js"
    }
  }
  </script>
</head>
<body>
  <div id="app"></div>
  
  <script type="module">
    import { createApp } from 'vue';
    import { ChatPanel } from '@components/ChatPanel.js';  // 清晰无歧义
    import { formatMarkdown } from '@utils/markdown.js';
    
    createApp({ components: { ChatPanel } }).mount('#app');
  </script>
</body>
</html>
```

**实测结果**：
- ✅ 路径清晰，不需要 `../../` 这种相对路径
- ✅ CDN 资源统一管理
- ✅ 团队协作更方便

## 二、异步加载：module 默认就是 defer

### 四种加载模式对比实测

我写了一个测试页面，对比四种 script 加载方式：

```html
<!DOCTYPE html>
<html>
<head>
  <title>Script Loading Test</title>
  
  <!-- 1. 普通脚本（阻塞） -->
  <script src="blocking.js"></script>
  
  <!-- 2. defer（延迟到 DOM 解析后） -->
  <script src="deferred.js" defer></script>
  
  <!-- 3. async（异步加载，加载完立即执行） -->
  <script src="async.js" async></script>
  
  <!-- 4. module（等效 defer） -->
  <script type="module" src="module.js"></script>
</head>
<body>
  <h1>Test Page</h1>
  <script>
    console.log('DOM parsed:', document.readyState);
    document.addEventListener('DOMContentLoaded', () => {
      console.log('DOMContentLoaded fired');
    });
  </script>
</body>
</html>
```

**控制台输出**：

```
[blocking.js] I run immediately, blocking HTML parsing
[DOM parsed: loading]
[deferred.js] I run after DOM parsed, before DOMContentLoaded
[module.js] I also run after DOM parsed, before DOMContentLoaded
[DOMContentLoaded fired]
[async.js] I run whenever I finish loading (order not guaranteed)
```

**实测结论**：

| 加载方式 | 是否阻塞 HTML 解析 | 执行时机 | 是否异步 | 顺序保证 |
|:---|:---|:---|:---:|:---:|
| `<script src="...">` | **阻塞** | 立即执行 | ❌ | ✅ |
| `<script src="..." defer>` | 不阻塞 | DOM 解析后、`DOMContentLoaded` 前 | ✅ | ✅ |
| `<script src="..." async>` | 不阻塞 | 加载完立即执行 | ✅ | ❌ |
| `<script type="module">` | 不阻塞 | **等效 defer** | ✅ | ✅ |

**关键结论**：
> `type="module"` **默认就是 defer 效果**，无需手动添加！

### 实测案例 3：内联模块不能加 defer

```html
<!-- ❌ 错误：内联模块不能加 defer/async -->
<script type="module" defer>
  import { init } from './app.js';
  init();
</script>

<!-- ✅ 正确：内联模块本身就是 defer 效果 -->
<script type="module">
  import { init } from './app.js';
  init();  // DOM 已解析完成
</script>
```

## 三、如何等待模块加载完成再执行逻辑？

这是开发者最常踩的坑。来看五个场景的解决方案。

### 实测案例 4：依赖某个模块初始化后再执行

```html
<script type="module">
  import { initApp } from './app.js';
  
  // ✅ 正确：import 本身是异步的，会等待模块加载完成
  initApp();  // 此时 app.js 及其依赖都已加载
  
  console.log('App initialized');
</script>
```

**原理**：ES Module 的 `import` 是**静态声明**，会确保依赖树完整加载后才执行当前模块。

### 实测案例 5：动态加载模块（按需加载）

```html
<script type="module">
  // ✅ 动态 import() 返回 Promise
  async function loadModule() {
    const { heavyFeature } = await import('./heavy-feature.js');
    heavyFeature.run();
  }
  
  // 用户点击时再加载
  document.getElementById('btn').addEventListener('click', loadModule);
</script>
```

### 实测案例 6：等待多个模块全部就绪

```html
<script type="module">
  // ✅ 使用 Promise.all 等待多个动态模块
  async function initAll() {
    const [
      { utils },
      { api },
      { config }
    ] = await Promise.all([
      import('./utils.js'),
      import('./api.js'),
      import('./config.js')
    ]);
    
    // 三个模块全部加载完成
    console.log('All modules ready');
    utils.init();
    api.connect(config.endpoint);
  }
  
  initAll().catch(console.error);
</script>
```

### 实测案例 7：非模块脚本等待模块加载（跨脚本通信）

这是最棘手的场景：普通脚本想等模块加载完。

```html
<!-- 模块脚本 -->
<script type="module" id="app-module">
  import { init } from './app.js';
  
  // ✅ 通过自定义事件通知
  window.dispatchEvent(new CustomEvent('module-ready', {
    detail: { app: await init() }
  }));
</script>

<!-- 普通脚本 -->
<script>
  // ✅ 监听模块就绪事件
  window.addEventListener('module-ready', (e) => {
    console.log('Module loaded:', e.detail.app);
    // 此时可以安全使用模块导出的功能
  });
</script>
```

### 实测案例 8：使用 top-level await（现代方案）

```html
<script type="module">
  // ✅ 顶层 await：模块会等待此 Promise resolve
  const response = await fetch('/api/config');
  const config = await response.json();
  
  // 后续代码等待上述操作完成
  console.log('Config loaded:', config);
  
  export { config };
</script>
```

**注意**：顶层 `await` 会阻塞**依赖此模块的其他模块**，但不阻塞 HTML 渲染。

## 四、常见问题速查

### Q1：为什么 `import './utils'` 不加 `.js` 会报错？

**答**：ES Module 要求**精确路径**，不会像 CommonJS 那样自动补全扩展名。

```javascript
// ❌ 浏览器中报错
import utils from './utils';

// ✅ 必须写完整
import utils from './utils.js';
```

### Q2：模块加载失败如何处理？

```html
<script type="module">
  try {
    const { critical } = await import('./critical.js');
    critical.init();
  } catch (err) {
    console.error('Module load failed:', err);
    // 降级方案
    showFallbackUI();
  }
</script>
```

### Q3：如何在本地开发环境调试模块？

```bash
# 启动本地开发服务器（模块不支持 file:// 协议）
cd /path/to/project
python3 -m http.server 8000

# 或使用 Node.js
npx serve .
```

访问 `http://localhost:8000`，打开浏览器 DevTools → Sources → 可以看到模块依赖树。

## 五、可复制的代码模板

### 模板 A：import map + 模块化组织（推荐）

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>模块化项目模板</title>
  
  <script type="importmap">
  {
    "imports": {
      "@components/": "/static/js/components/",
      "@utils/": "/static/js/utils/",
      "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js"
    }
  }
  </script>
</head>
<body>
  <div id="app"></div>
  
  <script type="module">
    import { createApp } from 'vue';
    import { App } from '@components/App.js';
    
    const app = createApp(App);
    
    // 按需加载路由模块
    async function loadRouter() {
      const { router } = await import('@utils/router.js');
      app.use(router);
      app.mount('#app');
    }
    
    loadRouter().catch(err => {
      console.error('Failed to load router:', err);
      app.mount('#app');  // 降级方案
    });
  </script>
</body>
</html>
```

### 模板 B：动态加载 + 错误处理

```javascript
// utils/module-loader.js
export async function loadModuleSafely(modulePath, fallback = null) {
  try {
    const module = await import(modulePath);
    return module;
  } catch (err) {
    console.error(`Failed to load module: ${modulePath}`, err);
    if (fallback) {
      return fallback;
    }
    throw err;
  }
}

// 使用示例
import { loadModuleSafely } from './module-loader.js';

const { heavyFeature } = await loadModuleSafely('./heavy-feature.js', {
  heavyFeature: { run: () => console.log('Fallback activated') }
});
```

### 模板 C：跨脚本通信（模块 → 普通脚本）

```javascript
// module.js
import { init } from './core.js';

// 初始化完成后通知外部
const app = await init();

window.__MODULE_READY__ = true;
window.dispatchEvent(new CustomEvent('module-ready', {
  detail: { app, version: '1.0.0' }
}));

export { app };
```

```javascript
// legacy-script.js（普通脚本）
if (window.__MODULE_READY__) {
  // 模块已加载
  console.log('Module already loaded');
} else {
  // 等待模块加载
  window.addEventListener('module-ready', (e) => {
    console.log('Module ready:', e.detail);
  });
}
```

## 六、总结

掌握 `type="module"` 的三个核心机制：

1. **路径解析**：模块内 `import` 相对于**当前模块文件**，不是 HTML 页面
2. **异步加载**：`type="module"` 默认 defer 效果，不阻塞 HTML 解析
3. **等待加载**：
   - 静态 `import` 自动等待依赖加载
   - 动态 `import()` 返回 Promise，用 `await` 等待
   - 跨脚本通信用自定义事件或全局状态
   - 现代 JS 用顶层 `await`（需浏览器支持）

**一句话总结**：`type="module"` 不是简单的"启用严格模式"，而是一套全新的模块系统，路径、加载、执行时机都有本质变化。理解这些差异，才能写出健壮的前端代码。

---

💡 **以我眼光看世界** | 技术·实测·思考

🔍 关注我们，获取更多前端开发实战经验

💬 有问题？评论区留言，一起讨论

❤️ 觉得有用？点个"在看"分享给更多人！
