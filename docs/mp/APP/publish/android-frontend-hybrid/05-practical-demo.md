---
title: 第五章：实战演练 - 从零手写一个企业级 Hybrid 调试 Demo
description: 理论结合实践，提供一套完整的 Android + Vue 双向通信 Demo 代码，可直接运行测试。
cover: ./imgs/cover-05-demo.svg
---

# 第五章：实战演练 - 从零手写一个企业级 Hybrid 调试 Demo

> **前言：** 纸上得来终觉浅，绝知此事要躬行。在前四章中，我们学习了理论、配置、通信原理和优化方案。本章我们将把这些知识串联起来，提供一套**开箱即用**的完整 Demo 代码。你可以将其作为基础模板，应用到你的实际项目中。

## 1. 需求定义

我们要实现一个具备以下功能的 Demo：
1.  **JS 呼叫原生**：
    *   发送 Toast 消息（无返回值）。
    *   获取设备硬件信息（同步/异步返回值）。
2.  **原生呼叫 JS**：
    *   原生主动发送消息给前端，前端展示在页面上。
3.  **工程结构**：
    *   Android 端：使用 Kotlin。
    *   Web 端：使用原生 HTML/JS (方便演示，无需编译) 或 Vue。

## 2. Android 端核心代码 (Kotlin)

### 2.1 `MainActivity.kt`

```kotlin
package com.example.hybridtest

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.*
import android.widget.Button
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import org.json.JSONObject

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private lateinit var btnSendToWeb: Button

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        webView = findViewById(R.id.webview)
        btnSendToWeb = findViewById(R.id.btn_send)

        initWebView()

        // 点击原生按钮，调用前端方法
        btnSendToWeb.setOnClickListener {
            val msg = "来自 Android 的时间戳: ${System.currentTimeMillis()}"
            // 调用前端挂载在 window 上的 receiveMessageFromNative 方法
            webView.evaluateJavascript("javascript:window.receiveMessageFromNative('$msg')") { result ->
                Toast.makeText(this, "前端返回值: $result", Toast.LENGTH_SHORT).show()
            }
        }
    }

    private fun initWebView() {
        val settings = webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        
        // 注入 JSBridge 对象，前端通过 window.AndroidBridge 访问
        webView.addJavascriptInterface(HybridInterface(), "AndroidBridge")

        // 配置 WebChromeClient 处理 alert 弹窗
        webView.webChromeClient = object : WebChromeClient() {
            override fun onJsAlert(view: WebView?, url: String?, message: String?, result: JsResult?): Boolean {
                return super.onJsAlert(view, url, message, result)
            }
        }

        // 加载本地 HTML (需放入 assets 目录) 或 远程 URL
        // webView.loadUrl("file:///android_asset/index.html")
        // 这里建议使用本机局域网 IP 进行联调，例如：
        webView.loadUrl("http://10.0.2.2:5500/index.html") 
    }

    // 定义供 JS 调用的接口类
    inner class HybridInterface {
        
        @JavascriptInterface
        fun showToast(message: String) {
            // JS 线程非主线程，更新 UI 需切换
            runOnUiThread {
                Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show()
            }
        }

        @JavascriptInterface
        fun getDeviceInfo(): String {
            val json = JSONObject()
            json.put("model", android.os.Build.MODEL)
            json.put("sdk", android.os.Build.VERSION.SDK_INT)
            json.put("manufacturer", android.os.Build.MANUFACTURER)
            return json.toString()
        }
    }
}
```

### 2.2 `activity_main.xml`

```xml
<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:orientation="vertical">

    <WebView
        android:id="@+id/webview"
        android:layout_width="match_parent"
        android:layout_height="0dp"
        android:layout_weight="1" />

    <Button
        android:id="@+id/btn_send"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:text="原生调用 JS" />
</LinearLayout>
```

## 3. Web 前端核心代码

### 3.1 `index.html`

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hybrid Demo</title>
    <style>
        body { font-family: sans-serif; padding: 20px; background: #f0f2f5; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); margin-bottom: 20px; }
        button { background: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 4px; font-size: 16px; margin: 5px 0; width: 100%; }
        .log { background: #333; color: #0f0; padding: 10px; border-radius: 4px; min-height: 50px; font-family: monospace; }
    </style>
</head>
<body>
    <div class="card">
        <h3>JS 调用原生 (H5 -> Native)</h3>
        <button onclick="callNativeToast()">发送 Toast</button>
        <button onclick="getNativeDeviceInfo()">获取设备信息</button>
    </div>

    <div class="card">
        <h3>原生调用 JS (Native -> H5)</h3>
        <p>接收到的消息：</p>
        <div id="logArea" class="log">等待消息...</div>
    </div>

    <script>
        // 1. 调用原生 Toast
        function callNativeToast() {
            if (window.AndroidBridge && window.AndroidBridge.showToast) {
                window.AndroidBridge.showToast("Hello Android, 我是 H5");
            } else {
                alert("未检测到原生环境");
            }
        }

        // 2. 获取设备信息
        function getNativeDeviceInfo() {
            if (window.AndroidBridge && window.AndroidBridge.getDeviceInfo) {
                const infoStr = window.AndroidBridge.getDeviceInfo();
                const info = JSON.parse(infoStr);
                document.getElementById('logArea').innerText = 
                    `设备型号: ${info.model}\n厂商: ${info.manufacturer}\nSDK: ${info.sdk}`;
            } else {
                alert("未检测到原生环境");
            }
        }

        // 3. 供原生调用的方法 (挂载到全局)
        window.receiveMessageFromNative = function(message) {
            document.getElementById('logArea').innerText = "收到原生消息: " + message;
            return "JS 已收到!"; // 返回值给原生
        }
    </script>
</body>
</html>
```

## 4. 联调指南

1.  **启动前端服务**：使用 VS Code 的 Live Server 插件，或者 `npm run dev` 启动前端项目。假设地址是 `http://192.168.1.100:5500`。
2.  **配置 Android 网络**：确保手机/模拟器和电脑在同一 WiFi 下。修改 Android 代码中的 `loadUrl` 为上述 IP 地址。
3.  **权限检查**：确保 AndroidManifest.xml 中添加了网络权限。
    ```xml
    <uses-permission android:name="android.permission.INTERNET" />
    ```
4.  **运行**：安装 App 到手机，点击按钮体验双向通信。

---

**结语**：
至此，我们完成了《安卓与前端混合开发（Hybrid App）系列教程》的全部内容。从基础概念到 WebView 配置，从 JSBridge 原理到性能优化，最后通过一个实战 Demo 落地。希望这套教程能帮助你建立起完整的 Hybrid 知识体系，在实际工作中游刃有余地解决混合开发难题。
