# type="module" 深度解析：模块加载、路径前缀与异步等待的正确姿势

> **摘要**：引入 JS 脚本时，有没有 `type="module"` 差别有多大？本文从路径解析、默认前缀、异步加载三个维度深入解析，帮你避开模块化开发的常见坑点。预计阅读 8 分钟。

---

作为前端开发者，你可能无数次写过 `<script>` 标签，但有没有遇到过这些诡异现象：

- 加上 `type="module"` 后，相对路径突然报错？
- 模块还没加载完，代码就执行了？
- 同样的代码，普通脚本正常，模块脚本却找不到文件？

这一切的根源，都在于 `type="module"` 触发了一套完全不同的加载机制。今天我们就来彻底搞懂它。

## 一、路径解析：有没有 type="module" 的核心差异

### 1.1 普通 `<script>` 的相对路径

```html
<!-- 页面地址：https://example.com/pages/article.html -->
<script src="../js/utils.js"></script>
```

普通脚本中，`src` 的相对路径**相对于 HTML 文件所在目录**解析：
- 实际请求：`https://example.com/js/utils.js`

### 1.2 `type="module"` 的模块路径

```html
<!-- 页面地址：https://example.com/pages/article.html -->
<script type="module">
  import { utils } from '../js/utils.js';  // ❌ 可能耗尽心思还报错
</script>
```

**关键规则**：ES Module 的 `import` 路径**相对于当前模块文件所在位置**解析，而不是 HTML 页面！

如果你在 `https://example.com/scripts/main.js` 中写 `import './utils.js'`，它会去找 `https://example.com/scripts/utils.js`，而不是看 HTML 在哪。

### 1.3 "默认前缀"的真相

很多人以为 `type="module"` 会自动加前缀，实际上：

**没有默认前缀，但有基准路径（Base URL）规则**：

```javascript
// ❌ 错误理解：以为会自动加 /static/
import './utils.js';  // 不是 /static/utils.js

// ✅ 正确理解：相对当前模块文件
// 如果此代码在 /static/js/main.js 中
// 则 ./utils.js → /static/js/utils.js
```

**最佳实践**：使用绝对路径或 import map

```html
<script type="importmap">
{
  "imports": {
    "@/utils": "/static/js/utils.js",
    "lodash": "https://cdn.skypack.dev/lodash"
  }
}
</script>

<script type="module">
  import { helper } from '@/utils';  // 清晰、无歧义
  import _ from 'lodash';
</script>
```

## 二、异步加载：module 的隐式 defer

### 2.1 三种加载模式对比

| 加载方式 | 是否阻塞 HTML 解析 | 执行时机 | 是否异步 |
|:---|:---|:---|:---:|
| `<script src="...">` | **阻塞** | 立即执行 | ❌ |
| `<script src="..." defer>` | 不阻塞 | DOM 解析完成后、`DOMContentLoaded` 前 | ✅ |
| `<script src="..." async>` | 不阻塞 | 加载完成立即执行（顺序不保证） | ✅ |
| `<script type="module">` | 不阻塞 | **等效 defer**，DOM 解析后执行 | ✅ |

**关键点**：`type="module"` **默认就是 defer 的效果**，无需手动添加！

### 2.2 内联模块的陷阱

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

这是开发者最常踩的坑。来看三个场景的解决方案。

### 3.1 场景一：依赖某个模块初始化后再执行

```html
<script type="module">
  import { initApp } from './app.js';
  
  // ✅ 正确：import 本身是异步的，会等待模块加载完成
  initApp();  // 此时 app.js 及其依赖都已加载
  
  console.log('App initialized');
</script>
```

**原理**：ES Module 的 `import` 是**静态声明**，会确保依赖树完整加载后才执行当前模块。

### 3.2 场景二：动态加载模块（按需加载）

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

### 3.3 场景三：等待多个模块全部就绪

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

### 3.4 场景四：非模块脚本等待模块加载（跨脚本通信）

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

### 3.5 场景五：使用 top-level await（现代方案）

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

## 四、实战案例：Ubuntu 前端项目的模块化改造

假设你在开发一个 Ubuntu 软件中心的前端，需要按需加载大型组件：

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Ubuntu Software Center</title>
  
  <!-- 配置 import map -->
  <script type="importmap">
  {
    "imports": {
      "vue": "https://unpkg.com/vue@3/dist/vue.esm-browser.js",
      "@components/": "/static/js/components/"
    }
  }
  </script>
</head>
<body>
  <div id="app"></div>
  
  <script type="module">
    import { createApp } from 'vue';
    import App from '@components/App.js';
    
    // ✅ 等待核心模块加载
    const app = createApp(App);
    
    // ✅ 按需加载路由模块（避免首屏加载所有页面）
    async function loadRouter() {
      const { router } = await import('@components/router.js');
      app.use(router);
      app.mount('#app');
      console.log('App mounted');
    }
    
    loadRouter().catch(err => {
      console.error('Failed to load router:', err);
      // 降级方案：只渲染首页
      app.mount('#app');
    });
  </script>
</body>
</html>
```

## 五、常见问题速查

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

### Q3：如何在 Linux/Ubuntu 开发环境调试模块？

```bash
# 启动本地开发服务器（模块不支持 file:// 协议）
cd /var/www/my-project
python3 -m http.server 8000

# 或使用 Node.js
npx serve .
```

访问 `http://localhost:8000`，打开浏览器 DevTools → Sources → 可以看到模块依赖树。

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

💡 **UbuntuNews** | 资讯·工具·教程·社区

🐧 关注我们，获取更多 Ubuntu/Linux 技术干货

💬 加入 QQ 群/频道，与全国爱好者交流成长

❤️ 觉得有用？点个"在看"分享给更多人！
