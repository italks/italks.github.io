---
title: 安卓与 UniApp 原生插件开发与混合工程大纲
description: 如何突破 UniApp 的官方限制，通过开发 Android 原生插件（Module / Component）实现底层能力的无缝拓展。
---

# 安卓与 UniApp 原生插件开发与混合工程大纲

> **核心价值：** 当 UniApp 官方 API 无法满足特殊的硬件通讯或者底层业务逻辑时，我们不可避免地要进行原生插件开发。本系列从零开始手把手教你在 Android 侧扩展 UniApp 的业务能力，并提供一整套包含 Module 原理的跑通 Demo。

## 🎯 系列教程导读

UniApp 因其“一次编写、多端发布”的特性，在国内有着大量的受众群体，特别是在做低成本交付、多端上线的小程序开发厂商中广受欢迎。这带来了一套刚需：如何打通底层硬件（如蓝牙打印机、定制硬件传感器）、调用第三方原生 SDK 以及补充缺失的 UI 行为？开发一套 UniApp 的 Android 插件成为了最硬核的保底武器。

## 📚 教程大纲

### 第一章：基础准备 - 离线打包与插件工程搭建
*   了解 HBuilderX 提供的“离线打包 SDK”下载体系及其环境依赖。
*   Android Studio 原生工程导入与基础架构讲解。
*   配置 `app/build.gradle` 依赖 `lib.5plus.base-release.aar` 与 `wxfsSDK.aar` 的坑点集合。

### 第二章：核心原理 - 插件类型的分类
*   什么是原生支持 API 和什么是业务 SDK？
*   **Module 插件：** 面向非界面的逻辑处理（异步调用、全局事件、封装加密 SDK、本地服务调用）。
*   **Component 插件：** 封装需要渲染层的控件（内嵌复杂的原生地图、原生播放器等）。

### 第三章：实战 Module 原生插件开发
*   继承 `UniModule` 并重写生命周期。
*   `@UniJSMethod` 注解：同步方法（`sync = true`）与异步操作中 `UniJSCallback` 的使用。
*   实战演练：获取 Android ID 以及设备自定义扩展属性，封装并返回 JSON 并暴露给 UniApp 环境。

### 第四章：实战 Component 原生界面插件开发
*   如何继承 `UniComponent` 以及实现自定义的原生 View。
*   利用 `@UniComponentProp` 将 UniApp Vue 组件内的 Props 传递给原生 Android View。
*   原生监听事件后回传前端触发：`fireEvent()` 方法剖析。

### 第五章：混合开发之事件发送 (EventBus)
*   脱离组件的强制关联，让原生后端服务（如长连接 TCP Socket 线程或者 Service 收集的位置流）主动传递消息到 UniApp 端内。
*   UniApp 的 `plus.globalEvent.addEventListener` 工作原理揭秘。

---

## 💻 包含能够使用的全本 Demo 代码示例

下面的核心 Demo 代码向大家展示了，如何最快速地编写一个 **Module 原生插件**，不仅可以在 JS 中用普通函数方式调用原生，还能测试原生端如何直接发射事件（Event）给 JS 后端。

### 1. Android 原生插件端 (Java)

**需要依赖：离线打包的 `lib.5plus.base.aar` 包，并在 `dcloud_uniplugins.json` 里完成注册（例如别名：`NativeTools`）。**

```java
// NativeToolsModule.java
package com.demo.plugin;

import android.app.Activity;
import android.util.Log;
import android.widget.Toast;

import com.alibaba.fastjson.JSONObject;

import io.dcloud.feature.uniapp.annotation.UniJSMethod;
import io.dcloud.feature.uniapp.bridge.UniJSCallback;
import io.dcloud.feature.uniapp.common.UniModule;

public class NativeToolsModule extends UniModule {

    private final String TAG = "NativeToolsModule";

    // 1. 同步方法（JS 调用时直接拿到返回值，不可做耗时操作）
    @UniJSMethod(uiThread = true) // 指定在 UI 线程执行
    public void showToast(String message) {
        if (mUniSDKInstance != null && mUniSDKInstance.getContext() instanceof Activity) {
            Toast.makeText(mUniSDKInstance.getContext(), message, Toast.LENGTH_SHORT).show();
        }
    }

    // 2. 异步方法（传入 Callback 回调，常被用于网络请求,蓝牙等异步逻辑）
    @UniJSMethod(uiThread = false) // 指定在后台子线程执行
    public void getDeviceInfoAsync(JSONObject options, UniJSCallback callback) {
        try {
            // 解析前端传递的对象
            String prefix = options.getString("prefix");
            
            // 模拟一些耗时操作（原生运算）
            Thread.sleep(1000); 
            
            // 构建返回结果 FastJSON 格式
            JSONObject result = new JSONObject();
            result.put("brand", android.os.Build.BRAND);
            result.put("model", android.os.Build.MODEL);
            result.put("sdk", android.os.Build.VERSION.SDK_INT);
            result.put("responsePrefix", prefix + "_success");
            
            // 成功回调给 JS
            if(callback != null) {
                callback.invoke(result); // 只被调用一次
            }
        } catch (Exception e) {
            Log.e(TAG, "Error: ", e);
             if(callback != null) {
                 JSONObject err = new JSONObject();
                 err.put("error", e.getMessage());
                 callback.invoke(err); 
             }
        }
    }

    // 3. 原生独立线程主动触发全局事件到 JS (利用 GlobalEvent)
    @UniJSMethod(uiThread = true)
    public void startListeningHeartbeat() {
        new Thread(() -> {
            for (int i = 0; i < 5; i++) {
                try {
                    Thread.sleep(3000); // 间隔3秒主动上报
                    JSONObject data = new JSONObject();
                    data.put("tick", i);
                    data.put("timestamp", System.currentTimeMillis());
                    
                    // FireEvent 是最常用的脱钩级全局广播推送方案
                    if (mUniSDKInstance != null) {
                         // 推送一个名为 'onNativeHeartbeat' 的事件给前台接收
                        mUniSDKInstance.fireGlobalEventCallback("onNativeHeartbeat", data);
                    }
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
            }
        }).start();
    }
}
```

### 2. UniApp 前端业务层 (Vue 3 / Setup)

**前端需要在其生命周期或者事件流中引入声明的原生插件模块别名：**

```vue
<!-- AppToolsDemo.vue -->
<template>
  <view class="container">
    <button @click="callNativeToast">原生 Toast 测试</button>
    <button @click="fetchNativeDeviceInfo">异步获取系统底层设备信息</button>
    <button @click="startNativeHeartbeat">开启原生心跳事件推送</button>
    <text class="result">{{ resultText }}</text>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 核心：加载我们在原生插件 json 里注册过名字为 'NativeTools' 的 Module 对象
// 注意：该代码只在打包 Custom 运行基座或者 APP 生效，H5/小程序环境下会获取失败！
const nativeModule = uni.requireNativePlugin('NativeTools')

const resultText = ref('等待交互...')

function callNativeToast() {
  if (!nativeModule) return resultText.value = '必须在真机环境运行！'
  // 1. 调用暴露出来的同步方法，并传入字符串
  nativeModule.showToast('🚀 你好，我是来自 Vue3 端传递的信息！')
  resultText.value = '✔ Toast 方法已调用'
}

function fetchNativeDeviceInfo() {
  if (!nativeModule) return 
  
  resultText.value = '获取中...'
  
  // 2. 调用暴露出来的异步方法，带有回调函数
  nativeModule.getDeviceInfoAsync(
    // 发送过去的对象
    { prefix: 'UniAppReq' },
    // Callback 回调接收
    (res) => {
      // res 即为 原生返回结果的 JSONObject 体
      if (res.error) {
        resultText.value = '获取失败: ' + res.error
      } else {
        resultText.value = `📦 成功获取底包信息: \n${JSON.stringify(res, null, 2)}`
      }
    }
  )
}

function startNativeHeartbeat() {
  if (!nativeModule) return
  // 触发原生方法启动独立的系统进程/线程
  nativeModule.startListeningHeartbeat()
  resultText.value = '✨ 心跳监听正在开启中...'
}

// 3. 在 Vue 的生命周期层面，对 `fireGlobalEventCallback` 中的指定名称进行监听
onMounted(() => {
  plus.globalEvent.addEventListener('onNativeHeartbeat', (msg) => {
    // msg 也是通过 FastJSON 解析好的 对象
    console.log('[Native] 收到原生主动推送消息:', msg)
    resultText.value = `🔔 接收到原生主动上报事件： 心跳序列 ${msg.tick}`
  })
})

onUnmounted(() => {
  // 注意释放全局事件监听 避免内存泄漏哦
  plus.globalEvent.removeEventListener('onNativeHeartbeat')
})
</script>

<style scoped>
.container { padding: 40rpx; display: flex; flex-direction: column; gap: 30rpx;}
button { background-color: #007AFF; color: #FFF;}
.result { margin-top: 40rpx; color: #1E3C72; font-weight: bold; background-color: #EEEEEE; padding: 20rpx;}
</style>
```

### 💡 Demo 运行指南与避坑：
1. UniApp 的原生插件 **无法在标准基座上运行调试！**，你必须要在 HBuilderX 里配置本地或者云端的 **“打包自定义运行基座”**。
2. Android Studio 开发时打出来的 AAR 如果里面有图片或者布局文件，一定不要使用 `R.id.*` 的方式调用资源资源引用。原生插件里的资源必须要用 `getResources().getIdentifier()` 方式获取避免和主包 R 引用冲突。
3. 把 AAR 包放入 HBuilderX 项目里指定规范文件夹：`nativeplugins/你的插件id/android/` 并在插件的 `package.json` 内声明配置，配置好对应安卓清单文件的权限与引用的第三方库即可大功告成打基座体验。

---
*👉 后续系列中，我们将更加深度实战 UniApp Component 封装高德地图 SDK 以及百度语音播报等真实企业级场景，让你轻松跨过那道不可逾越的“基座鸿沟”！*
