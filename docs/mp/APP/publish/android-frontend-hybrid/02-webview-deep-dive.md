---
title: 第二章：Android WebView 深度揭秘
description: 详解 WebView 的高级配置、Client 回调处理以及不可忽视的安全与内存优化问题。
cover: ./imgs/cover-02-webview.svg
---

# 第二章：Android WebView 深度揭秘

> **前言：** 上一章我们成功在 Android 中加载了一个网页，但这仅仅是开始。在实际生产环境中，我们需要处理各种复杂的交互：文件下载、全屏视频、错误页面处理，以及最令人头疼的内存泄漏和安全漏洞。本章将带你深入 WebView 的配置细节，打造一个“企业级”的 Web 容器。

## 1. WebSettings：打造全能浏览器

`WebSettings` 是管理 WebView 状态配置的核心类。默认配置往往非常保守，我们需要手动开启许多开关。

```kotlin
val webSettings = webView.settings

// 1. 核心交互配置
webSettings.javaScriptEnabled = true         // 开启 JS 支持（必选项）
webSettings.domStorageEnabled = true         // 开启 DOM Storage（LocalStorage 必须）

// 2. 视口与缩放
webSettings.useWideViewPort = true           // 将图片调整到适合 WebView 的大小
webSettings.loadWithOverviewMode = true      // 缩放至屏幕大小
webSettings.setSupportZoom(true)             // 支持缩放
webSettings.builtInZoomControls = true       // 设置内置的缩放控件
webSettings.displayZoomControls = false      // 隐藏原生的缩放控件

// 3. 缓存与网络
webSettings.cacheMode = WebSettings.LOAD_DEFAULT // 根据 cache-control 决定是否从网络上取数据
webSettings.allowFileAccess = true           // 设置可以访问文件

// 4. 多媒体支持
webSettings.mediaPlaybackRequiresUserGesture = false // 允许自动播放音频/视频
webSettings.mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW // 允许 HTTPS 页面加载 HTTP 资源（解决图片不显示问题）
```

## 2. 两大护法：WebViewClient 与 WebChromeClient

很多初学者容易混淆这两个 Client，简单区分如下：
*   **WebViewClient**：主要处理**内容加载**相关的事件（如页面开始加载、加载结束、URL 拦截、SSL 错误）。
*   **WebChromeClient**：主要处理**浏览器周边 UI**相关的事件（如进度条、JS 弹窗、标题、图标）。

### 2.1 WebViewClient 核心回调

```kotlin
webView.webViewClient = object : WebViewClient() {
    
    // 拦截 URL 跳转：非常重要！
    // 返回 true 表示应用自己处理（拦截），返回 false 表示由 WebView 处理（正常加载）
    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        val url = request?.url.toString()
        // 示例：拦截淘宝链接唤起淘宝 App
        if (url.startsWith("tbopen://")) {
            // 执行唤起逻辑...
            return true
        }
        return false
    }

    // 页面开始加载
    override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
        super.onPageStarted(view, url, favicon)
        // 显示 Loading 动画
    }

    // 页面加载结束
    override fun onPageFinished(view: WebView?, url: String?) {
        super.onPageFinished(view, url)
        // 隐藏 Loading 动画，或者注入自定义 JS
    }
    
    // 处理 SSL 证书错误（如自签名证书）
    override fun onReceivedSslError(view: WebView?, handler: SslErrorHandler?, error: SslError?) {
        // 警告：生产环境直接 proceed 存在安全风险，建议弹窗提示用户
        // handler?.proceed() 
        super.onReceivedSslError(view, handler, error)
    }
}
```

### 2.2 WebChromeClient 核心回调

```kotlin
webView.webChromeClient = object : WebChromeClient() {
    
    // 获取网页标题
    override fun onReceivedTitle(view: WebView?, title: String?) {
        super.onReceivedTitle(view, title)
        // 设置原生导航栏标题
        toolbar.title = title
    }

    // 获取加载进度 (0-100)
    override fun onProgressChanged(view: WebView?, newProgress: Int) {
        super.onProgressChanged(view, newProgress)
        // 更新原生进度条
        progressBar.progress = newProgress
        progressBar.visibility = if (newProgress == 100) View.GONE else View.VISIBLE
    }

    // 处理 JS 的 alert() 弹窗
    // 默认 WebView 会忽略 alert，必须重写此方法才能弹出原生对话框
    override fun onJsAlert(view: WebView?, url: String?, message: String?, result: JsResult?): Boolean {
        AlertDialog.Builder(view?.context)
            .setTitle("JS 提示")
            .setMessage(message)
            .setPositiveButton("确定") { _, _ -> result?.confirm() }
            .setCancelable(false)
            .show()
        return true // 表示已处理
    }
}
```

## 3. 安全避坑指南

WebView 是 Android 安全漏洞的高发区，以下几点务必注意：

### 3.1 内存泄漏 (Memory Leak)
WebView 内部持有 Context 引用，且生命周期较长，极易导致 Activity 无法回收。
*   **解决方案**：
    1.  不要在 XML 中定义 WebView，而是在代码中 `new WebView(context)`，并传入 Application Context（如果不需要弹 Dialog）。
    2.  严格执行销毁逻辑：
        ```kotlin
        override fun onDestroy() {
            if (webView != null) {
                webView.loadDataWithBaseURL(null, "", "text/html", "utf-8", null)
                webView.clearHistory()
                (webView.parent as ViewGroup).removeView(webView)
                webView.destroy()
            }
            super.onDestroy()
        }
        ```

### 3.2 跨站脚本攻击 (XSS) 与 远程代码执行
*   **移除危险接口**：在 Android 4.2 之前，`addJavascriptInterface` 存在严重漏洞。虽然现在大都使用 4.4+，但仍建议只注入带有 `@JavascriptInterface` 注解的安全方法。
*   **文件访问限制**：如果业务不需要，务必关闭文件访问权限：
    ```kotlin
    webSettings.allowFileAccess = false
    webSettings.allowContentAccess = false
    ```

### 3.3 HTTPS 中间人攻击
在 `onReceivedSslError` 中，切勿盲目调用 `handler.proceed()` 忽略证书错误。这会让 App 容易受到中间人攻击。正确的做法是弹窗告知用户证书有问题，由用户决定是否继续。

---

**小结**：
通过本章的配置，我们已经拥有了一个功能完备、体验良好且相对安全的 WebView 容器。但是，目前它还只是一个用来“看”网页的浏览器，原生与 H5 之间还无法进行实质性的“交流”。下一章，我们将进入 Hybrid 开发最核心的部分——**JSBridge**，打通原生与前端的任督二脉。
