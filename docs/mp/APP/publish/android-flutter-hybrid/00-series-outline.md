---
title: 安卓与 Flutter 混合开发（Add-to-App）系列教程大纲
description: 从零讲解原生 Android 项目如何无缝接入 Flutter 引擎，实现双向通信及性能优化，包含完整可运行 Demo。
---

# 安卓与 Flutter 混合开发（Add-to-App）系列教程大纲

> **核心价值：** 掌握在现有 Android 项目中集成 Flutter（Add-to-App），并熟练使用 Platform Channel 实现两端的深度双向通信。包含原生项目调用 Flutter 视图以及一套完整的双向通信 Demo 代码。

## 🎯 系列教程导读

Flutter 凭借极佳的跨平台性能与 UI 渲染能力，在移动开发域大放异彩。但对于庞大的存量 Android 项目，完全重写的成本太高。将 Flutter 以组件（Module）的形式接入原生项目，实现“原生为主、Flutter 为辅”的混合架构成为了主流解法。本系列将带你实战这套工业级方案。

## 📚 教程大纲

### 第一章：架构认知 - Add-to-App 原理
*   Flutter 引擎（Engine）与隔离（Isolate）机制解析。
*   Android 为什么能在 View 树里挂载 Flutter？(`FlutterView` 与 `FlutterActivity/FlutterFragment`)。
*   环境准备：将 Flutter Module 编译为 AAR 或者是源码依赖接入到现有原生工程中。

### 第二章：核心基石 - Platform Channel 全景指南
*   Flutter 与原生的唯一桥梁：Platform Channel。
*   **MethodChannel（方法通道）：** 最常用，适合方法调用与结果返回（如获取系统相册、调用定位）。
*   **EventChannel（事件通道）：** 适合数据流监控（如传感器数据、网络状态实时变化）。
*   **BasicMessageChannel（消息通道）：** 适合高频字符串、半结构化数据通信（如大图片流，不过现在常被 FFI 优化替代）。

### 第三章：引擎预热与内存陷阱
*   为什么打开 Flutter 页面会黑屏/白屏？
*   使用 `FlutterEngineCache` 预热引擎实战，实现秒开体验。
*   多引擎 vs 单引擎：业务上的选择折中与内存考量，FlutterEngineGroup 的正确使用姿势。

### 第四章：实战进阶 - 混合路由架构
*   原生跳转 Flutter 页面、Flutter 跳转原生页面的痛点。
*   共享生命周期分发方案，如何处理返回栈冲突。
*   市面成熟混合路由框架（如 flutter_boost）源码浅析与适用评估。

### 第五章：实战演练 - 手写 Android & Flutter 交互 Demo
*   实战需求：Flutter 端点击按钮调用 Android 原生电池电量获取接口；Android 端主动发送广播通知给 Flutter 更新 UI。

---

## 💻 包含能够使用的全本 Demo 代码示例

了解以上原理后，我们可以非常清晰地使用 `MethodChannel` 与 `EventChannel` 构建通信链路。以下是 Android 宿主如何与 Flutter 进行无缝联调的核心 Demo 代码。

### 1. Flutter 端核心代码 (Dart)

**创建一个新的 Flutter Module 项目 (`flutter create -t module my_flutter`)，编写 `main.dart`：**

```dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

void main() => runApp(const MyApp());

class MyApp extends StatelessWidget {
  const MyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: HybridDemoPage(),
    );
  }
}

class HybridDemoPage extends StatefulWidget {
  const HybridDemoPage({super.key});

  @override
  State<HybridDemoPage> createState() => _HybridDemoPageState();
}

class _HybridDemoPageState extends State<HybridDemoPage> {
  // 核心：定义 MethodChannel，名称必须与和 Android 端保持一致
  static const MethodChannel _methodChannel = MethodChannel('com.example.hybrid/battery');
  
  // 核心：定义 EventChannel 作为事件接收流
  static const EventChannel _eventChannel = EventChannel('com.example.hybrid/events');

  String _batteryLevel = '未知电量';
  String _nativeEvent = '等待原生推送事件...';

  @override
  void initState() {
    super.initState();
    // 监听原生通过 EventChannel 发出的持续事件
    _eventChannel.receiveBroadcastStream().listen((event) {
      setState(() {
        _nativeEvent = event.toString();
      });
    }, onError: (error) {
      setState(() {
        _nativeEvent = '接收事件失败';
      });
    });
  }

  // 手动调用原生方法
  Future<void> _getBatteryLevel() async {
    String batteryLevel;
    try {
      // 通过 invokeMethod 调用原生的 getBatteryLevel 方法
      final int result = await _methodChannel.invokeMethod('getBatteryLevel');
      batteryLevel = '当期电量：$result %';
    } on PlatformException catch (e) {
      batteryLevel = '获取失败: ${e.message}';
    }

    setState(() {
      _batteryLevel = batteryLevel;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Flutter 混合开发 Demo')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('方法回调结果：\n$_batteryLevel', textAlign: TextAlign.center, style: const TextStyle(fontSize: 18)),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _getBatteryLevel,
              child: const Text('调用 Android 获取电量'),
            ),
            const Divider(height: 50, thickness: 2),
            Text('原生持续推送的事件：\n$_nativeEvent', textAlign: TextAlign.center, style: const TextStyle(fontSize: 18, color: Colors.blue)),
          ],
        ),
      ),
    );
  }
}
```

### 2. Android 端核心代码 (Kotlin)

**在原生项目的入口（例如继承 `FlutterActivity` 的类）中配置 Channel 通道：**

```kotlin
// MainActivity.kt
import android.content.Context
import android.os.BatteryManager
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.EventChannel
import io.flutter.plugin.common.MethodChannel

class MyFlutterActivity : FlutterActivity() {

    private val METHOD_CHANNEL = "com.example.hybrid/battery"
    private val EVENT_CHANNEL = "com.example.hybrid/events"

    // 重写 configureFlutterEngine 提供引擎服务接入
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        val registerMessenger = flutterEngine.dartExecutor.binaryMessenger

        // 1. 实现 MethodChannel （供 Flutter 主动调用）
        MethodChannel(registerMessenger, METHOD_CHANNEL).setMethodCallHandler { call, result ->
            // 判断 Flutter 调用的方法名
            if (call.method == "getBatteryLevel") {
                val batteryLevel = getBatteryLevel()
                if (batteryLevel != -1) {
                    result.success(batteryLevel) // 回调给 Flutter 成功
                } else {
                    result.error("UNAVAILABLE", "无法获取到电池信息.", null)
                }
            } else {
                result.notImplemented()
            }
        }

        // 2. 实现 EventChannel （供 Android 持续发布系统事件或状态流）
        EventChannel(registerMessenger, EVENT_CHANNEL).setStreamHandler(
            object : EventChannel.StreamHandler {
                private var handler = Handler(Looper.getMainLooper())
                private var runnable: Runnable? = null

                override fun onListen(arguments: Any?, events: EventChannel.EventSink?) {
                    // 当 Flutter 侧开始监听时触发
                    var count = 0
                    runnable = Runnable {
                        events?.success("原生通过 EventChannel 发送的心跳包 [$count]")
                        count++
                        handler.postDelayed(runnable!!, 2000) // 每隔2秒向 Flutter发一次消息
                    }
                    handler.post(runnable!!)
                }

                override fun onCancel(arguments: Any?) {
                    // 当 Flutter 侧取消监听时触发，清理资源
                    handler.removeCallbacks(runnable!!)
                    runnable = null
                }
            }
        )
    }

    // Android 原生获取电池电量的底层实现代码
    private fun getBatteryLevel(): Int {
        return try {
            val batteryManager = getSystemService(Context.BATTERY_SERVICE) as BatteryManager
            batteryManager.getIntProperty(BatteryManager.BATTERY_PROPERTY_CAPACITY)
        } catch (e: Exception) {
             -1
        }
    }
}
```

### 💡 Demo 运行指南：
1. 本地需安装好 Flutter SDK 环境。
2. 在任意目录下使用 `flutter create -t module my_flutter_module` 生成模块。
3. 复制 Dart 代码至对应的 `main.dart`。
4. 在已有的 Android 工程 `app/build.gradle` 中配置引用（或者直接通过 AAR 依赖）。
5. 复制 `MyFlutterActivity.kt` 并在 AndroidManifest.xml 中注册，将跳转该 Activity 作为触发体验即可感受极致的原生与 Flutter 融合通讯！

---
*👉 本系列文章后续将详细介绍 Android 工程集成 Flutter 的 Gradle 依赖注入细节与 Flutter 内存泄漏排查技巧！*
