---
title: 第三章：核心机制 - JSBridge 通信原理
description: 揭秘 Hybrid App 的核心命脉——JSBridge，深入讲解原生与 JS 互调的三种方式及协议设计。
cover: ./imgs/cover-03-jsbridge.svg
---

# 第三章：核心机制 - JSBridge 通信原理

> **前言：** 为什么在 Hybrid App 中，H5 网页能调用原生的摄像头、定位甚至支付功能？这一切都归功于 **JSBridge（JavaScript Bridge）**。它就像一座桥梁，连接了 Android 原生世界（Java/Kotlin）和 Web 前端世界（JavaScript）。本章将彻底讲透这座桥梁的搭建原理。

## 1. 原生调用 JavaScript

Android 调用 JS 代码非常简单，主要有两种方式。

### 1.1 `loadUrl` (传统方式)
这是早期 Android 版本通用的方式。本质是执行一段 `javascript:` 伪协议代码。

```kotlin
// 调用前端的 globalFunction 函数
webView.loadUrl("javascript:globalFunction('来自 Java 的问候')")
```
*   **缺点**：无法获取 JS 函数的返回值；如果 JS 代码执行出错，原生端无感知；频繁调用性能较差。

### 1.2 `evaluateJavascript` (Android 4.4+ 推荐)
这是目前主流的方式，支持获取返回值，且效率更高。

```kotlin
webView.evaluateJavascript("javascript:getUserName()") { value ->
    // value 就是 JS 函数的返回值
    Log.d("JSBridge", "前端返回的用户名为: $value")
}
```
*   **注意**：该方法必须在**主线程**（UI 线程）调用。

## 2. JavaScript 调用原生 (核心难点)

前端调用原生相对复杂，业界主要有三种流派：

### 2.1 对象注入 (`addJavascriptInterface`)
这是官方提供的方法，最直接、性能最好。

*   **Android 端**：
    ```kotlin
    class NativeInterface {
        @JavascriptInterface // 必须加此注解，否则 JS 无法访问（Android 4.2+ 安全机制）
        fun showToast(msg: String) {
            Toast.makeText(context, msg, Toast.LENGTH_SHORT).show()
        }
    }
    webView.addJavascriptInterface(NativeInterface(), "Android")
    ```

*   **前端 JS**：
    ```javascript
    // 直接通过 window 对象调用
    window.Android.showToast("Hello Native!");
    ```

### 2.2 URL 拦截 (`shouldOverrideUrlLoading`)
这是一种兼容性极好的“歪门邪道”。前端通过 iframe 或 `window.location` 发起一个特殊格式的 URL 请求，原生拦截该请求并解析参数。

*   **协议约定**：例如 `jsbridge://methodName?param=value`
*   **Android 端**：
    ```kotlin
    override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
        val url = request?.url.toString()
        if (url.startsWith("jsbridge://")) {
            // 解析 URL，执行对应原生方法
            handleJsBridgeRequest(url)
            return true // 拦截请求，不进行页面跳转
        }
        return false
    }
    ```
*   **缺点**：URL 长度有限制；数据传递效率低。

### 2.3 `prompt` 拦截 (`onJsPrompt`)
利用 JS 的 `prompt()` 方法（即输入框弹窗）进行通信。因为 `prompt` 在实际业务中很少使用，且可以传输较长的数据，因此常被用来做 Bridge 通道。

*   **Android 端**：
    ```kotlin
    override fun onJsPrompt(view: WebView?, url: String?, message: String?, defaultValue: String?, result: JsPromptResult?): Boolean {
        if (message?.startsWith("jsbridge:") == true) {
            // 解析 message 中的 JSON 数据
            // 执行原生逻辑...
            result?.confirm("原生返回的结果") // 将结果返回给 JS
            return true
        }
        return super.onJsPrompt(view, url, message, defaultValue, result)
    }
    ```

## 3. 设计一套健壮的 JSBridge 协议

为了规范通信，通常我们会定义一套标准的 JSON 协议，而不是随意传参。

### 3.1 协议格式 (Payload)
建议采用类似 JSON-RPC 的格式：

```json
{
  "action": "getCamera",      // 要调用的功能名称
  "params": {                 // 参数对象
    "quality": 80,
    "format": "jpeg"
  },
  "callbackId": "cb_123456"   // 回调 ID（用于异步返回结果）
}
```

### 3.2 异步回调机制
大部分原生操作（如定位、拍照）都是耗时的异步操作，不能立即返回结果。因此需要设计 callback 机制：

1.  **前端**：生成唯一的 `callbackId`，将 `callbackId` 和回调函数存入一个全局 Map 中。将 `callbackId` 传给原生。
2.  **原生**：执行完耗时操作后，拿到结果。
3.  **原生**：主动调用 JS 的全局回调分发函数，如 `window.JSBridge.onComplete(callbackId, resultData)`。
4.  **前端**：`onComplete` 根据 `callbackId` 找到对应的回调函数并执行，最后删除该记录。

### 3.3 封装示例
```javascript
// 前端简易封装
const JSBridge = {
    callbacks: {},
    callNative: function(action, params, callback) {
        const callbackId = 'cb_' + new Date().getTime();
        this.callbacks[callbackId] = callback;
        
        const payload = JSON.stringify({ action, params, callbackId });
        // 这里选择使用注入对象方式调用
        if (window.Android) {
            window.Android.postMessage(payload);
        }
    },
    // 供原生调用
    onNativeCallback: function(callbackId, result) {
        const callback = this.callbacks[callbackId];
        if (callback) {
            callback(result);
            delete this.callbacks[callbackId];
        }
    }
};
```

---

**小结**：
JSBridge 是混合开发的灵魂。本章我们掌握了 Android 与 JS 双向通信的底层原理，并了解了如何设计一套支持异步回调的标准协议。掌握了这些，你已经具备了手写一个 Hybrid 框架的核心能力。下一章，我们将关注如何让 H5 页面跑得更快，探讨性能优化的“黑科技”。
