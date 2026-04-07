# Google Gemma 4 开源：你的 Android App 现在就能离线跑 AI！

> **一句话摘要**：谷歌 Gemma 4 正式开源，4B 版本可在普通 Android 手机上离线运行，支持文本/图像/音频多模态，Apache 2.0 协议商用免费。本文带你从零到一完成端侧 AI 接入，附完整代码示例。
>
> ⏱️ 阅读时长：约 12 分钟 | 难度：中级

---

## 为什么这次不一样？

过去两年，"手机跑大模型"一直是开发者圈的谈资而非实操话题——内存动辄 12GB、延迟高达数秒、效果差强人意。

**2026 年 4 月 2 日，这一切改变了。**

谷歌 DeepMind 正式开源 **Gemma 4** 系列，其中 **E2B（20亿参数）和 E4B（40亿参数）** 两款端侧专属版本，可以在 6GB 内存的 Android 手机上**离线流畅运行**，首 Token 延迟低至 80ms，推理速度达到 45+ tokens/s。

这不是实验室里的 Demo，是**你现在就能集成到 App 里的能力**。

---

## Gemma 4 家族一览

| 版本 | 参数量 | 类型 | 推荐硬件 | 最佳场景 |
|------|--------|------|----------|----------|
| **E2B** | 2B（2T tokens 训练） | Dense，端侧优化 | 手机（≥4GB RAM） | 轻量对话、快速摘要 |
| **E4B** | 4B | Dense，端侧优化 | 旗舰手机（≥6GB RAM） | 复杂推理、Agent工作流 |
| **26B A4B** | 26B MoE（激活4B） | MoE | PC/服务器 | 高精度推理 |
| **31B** | 31B | Dense | 多卡服务器 | 企业级部署 |

> **开发者关注重点**：E2B 和 E4B 就是你要集成进 App 的模型。E4B 在 Arena AI 全球开放模型排行榜中排名前 10，**逼近参数大 20 倍的模型性能**。

---

## 关键特性：为端侧而生

### 1. 多模态全覆盖
Gemma 4 原生支持**文本、图像、视频帧、音频**四种输入模态，一个模型搞定：
- 拍照问答（识别菜品、阅读文件）
- 语音转文字后理解意图
- 视频关键帧描述

### 2. 256K 超长上下文
端侧模型支持最长 **256,000 Token** 上下文——可以把整个用户手册塞进去，做本地知识库问答。

### 3. 思维链（Hybrid Thinking）
E4B 支持 Think/NoThink 双模式切换，复杂任务启用思维链，简单任务直接输出，在**速度与精度**之间灵活平衡。

### 4. 支持 140+ 语言
中文理解和生成能力显著提升，适合国内 App 直接接入。

### 5. Apache 2.0 协议
**完全免费，可商用**，无需版权授权，也不需要向谷歌报备。

---

## 三种接入路径对比

| 接入方式 | 适用场景 | 优点 | 缺点 |
|----------|----------|------|------|
| **MediaPipe GenAI（推荐）** | Android 原生应用 | 谷歌官方维护，性能最优，API 最简洁 | 仅限 Android 14+ |
| **llama.cpp / MNN** | 跨平台（Android + iOS） | 生态完整，社区活跃 | 需自行处理模型格式转换 |
| **AI Edge Torch Lite** | TensorFlow 体系迁移 | 与现有 TFLite 代码兼容 | 功能相对局限 |

> **结论**：纯 Android 项目首选 MediaPipe GenAI；需要同时支持 Android + iOS 的跨端项目，考虑 KMP + MNN 或 Flutter 方案。

---

## 实战：5 步在 Android App 中接入 Gemma 4 E4B

### 环境要求

- Android Studio Meerkat（2024.3.1+）
- minSdkVersion 26（Android 8.0+）
- targetSdkVersion 36
- 推荐测试机：8GB RAM，骁龙 8 Gen 3 或天玑 9400

### Step 1：添加依赖

```kotlin
// build.gradle.kts (app)
dependencies {
    // MediaPipe Tasks GenAI
    implementation("com.google.mediapipe:tasks-genai:0.10.22")
    
    // 可选：协程支持
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.1")
}
```

```xml
<!-- AndroidManifest.xml：声明需要设备端AI推理能力 -->
<uses-feature
    android:name="android.hardware.ai.inference"
    android:required="false" />
```

### Step 2：下载并打包模型

```bash
# 从 HuggingFace 下载（需 VPN 或使用镜像站）
# 模型文件约 2.5GB（E4B int4 量化版）
pip install huggingface_hub

python - <<EOF
from huggingface_hub import snapshot_download
snapshot_download(
    repo_id="google/gemma-4-e4b-it-mediapipe",
    local_dir="./gemma4_e4b",
    ignore_patterns=["*.bin", "*.safetensors"]  # 只下载 .task 文件
)
EOF
```

> **国内镜像**：可使用 `HF_ENDPOINT=https://hf-mirror.com` 加速下载

将下载的 `gemma4_e4b_q4.task` 文件放入 `app/src/main/assets/models/` 目录。

### Step 3：初始化推理引擎

```kotlin
class GemmaRepository(private val context: Context) {
    
    private var llmInference: LlmInference? = null
    
    suspend fun initialize() = withContext(Dispatchers.IO) {
        val modelPath = copyModelToCache()
        
        val options = LlmInference.LlmInferenceOptions.builder()
            .setModelPath(modelPath)
            .setMaxTokens(2048)           // 最大输出 Token 数
            .setTopK(40)                   // 采样参数
            .setTemperature(0.7f)          // 创造性（0=确定，1=随机）
            .setRandomSeed(42)
            .setResultListener { partialResult, done ->
                // 流式回调，UI 实时更新
                onPartialResult(partialResult, done)
            }
            .build()
        
        llmInference = LlmInference.createFromOptions(context, options)
    }
    
    private fun copyModelToCache(): String {
        val modelFile = File(context.cacheDir, "gemma4_e4b_q4.task")
        if (!modelFile.exists()) {
            context.assets.open("models/gemma4_e4b_q4.task").use { input ->
                modelFile.outputStream().use { output ->
                    input.copyTo(output)
                }
            }
        }
        return modelFile.absolutePath
    }
}
```

### Step 4：构建对话并推理

```kotlin
// 使用 Gemma 4 的标准对话格式
fun buildPrompt(userMessage: String, history: List<ChatMessage>): String {
    val sb = StringBuilder()
    
    // 系统提示（可选）
    sb.append("<start_of_turn>user\n")
    sb.append("你是一个专业的 Android 开发助手，请用中文回答。\n\n")
    
    // 历史对话
    history.forEach { msg ->
        if (msg.isUser) {
            sb.append("${msg.content}<end_of_turn>\n")
            sb.append("<start_of_turn>model\n")
        } else {
            sb.append("${msg.content}<end_of_turn>\n")
            sb.append("<start_of_turn>user\n")
        }
    }
    
    // 当前用户输入
    sb.append("$userMessage<end_of_turn>\n")
    sb.append("<start_of_turn>model\n")
    
    return sb.toString()
}

// 异步推理（支持流式输出）
suspend fun chat(message: String): Flow<String> = channelFlow {
    val prompt = buildPrompt(message, conversationHistory)
    
    llmInference?.generateResponseAsync(prompt) { partialResult, done ->
        trySend(partialResult)
        if (done) close()
    } ?: close(Exception("模型未初始化"))
}
```

### Step 5：ViewModel + UI 集成

```kotlin
class ChatViewModel(
    private val gemmaRepo: GemmaRepository
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(ChatUiState())
    val uiState: StateFlow<ChatUiState> = _uiState.asStateFlow()
    
    init {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true) }
            gemmaRepo.initialize()
            _uiState.update { it.copy(isLoading = false, isModelReady = true) }
        }
    }
    
    fun sendMessage(text: String) {
        viewModelScope.launch {
            // 添加用户消息
            _uiState.update { state ->
                state.copy(messages = state.messages + ChatMessage(text, isUser = true))
            }
            
            // 流式收集 AI 回复
            val responseBuilder = StringBuilder()
            gemmaRepo.chat(text).collect { chunk ->
                responseBuilder.append(chunk)
                _uiState.update { state ->
                    // 实时更新最后一条 AI 消息
                    val messages = state.messages.toMutableList()
                    if (messages.lastOrNull()?.isUser == false) {
                        messages[messages.lastIndex] = ChatMessage(
                            responseBuilder.toString(), isUser = false
                        )
                    } else {
                        messages.add(ChatMessage(responseBuilder.toString(), isUser = false))
                    }
                    state.copy(messages = messages)
                }
            }
        }
    }
}
```

---

## 性能优化：让推理更快

### 1. 选择合适的量化等级

| 量化方式 | 模型大小 | 推理速度 | 质量损失 |
|----------|----------|----------|----------|
| FP32（原始） | ~16GB | 最慢 | 无 |
| INT8 | ~4GB | 快 | 可忽略 |
| **INT4（推荐）** | **~2.5GB** | **最快** | **轻微** |

> 推荐使用官方 `gemma4_e4b_q4.task`，INT4 量化，平衡最佳。

### 2. GPU 加速（骁龙/天玑）

```kotlin
// 优先使用 GPU，降级到 CPU
val options = LlmInference.LlmInferenceOptions.builder()
    .setModelPath(modelPath)
    .setPreferredBackend(LlmInference.Backend.GPU)  // 优先 GPU
    .setFallbackToDefaultBackend(true)               // GPU 不可用时自动回退 CPU
    .build()
```

### 3. 预热策略

```kotlin
// App 启动后台预热，而非首次使用时才加载
class MyApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // 在后台线程预加载模型（约 3-8 秒）
        CoroutineScope(Dispatchers.IO).launch {
            GemmaRepository.getInstance(this@MyApplication).initialize()
        }
    }
}
```

### 4. 设备能力检测

```kotlin
fun isDeviceCapable(): Boolean {
    val activityManager = getSystemService(ACTIVITY_SERVICE) as ActivityManager
    val memInfo = ActivityManager.MemoryInfo()
    activityManager.getMemoryInfo(memInfo)
    
    val totalRamGB = memInfo.totalMem / (1024.0 * 1024 * 1024)
    
    return when {
        totalRamGB >= 8 -> true   // E4B：推荐
        totalRamGB >= 4 -> true   // E2B：可用
        else -> false              // 内存不足，降级到云端 API
    }
}

// 自适应策略：端侧不行就用云端
fun getAiProvider(): AiProvider {
    return if (isDeviceCapable()) {
        OnDeviceAiProvider(gemmaRepo)
    } else {
        CloudAiProvider(geminiApiKey)
    }
}
```

---

## 实际场景：哪些 App 最适合接入？

### ✅ 强烈推荐

| 场景 | 用法 | 参考实现 |
|------|------|----------|
| **智能客服** | 离线回答 FAQ，联网时同步上报 | `E4B + RAG本地知识库` |
| **文档助手** | 读取 PDF/截图，本地摘要+问答 | `E4B + 多模态输入` |
| **代码补全工具** | 离线代码建议（针对特定语言微调） | `E2B + 低延迟模式` |
| **教育 App** | 离线解题解析，保护学生隐私 | `E4B + Think模式` |
| **隐私敏感场景** | 医疗、法律、金融等数据不上云 | `E4B + 本地知识库` |

### ⚠️ 需要权衡

- **实时语音助手**：E4B 延迟 80ms，配合 ASR 使用勉强可接受
- **复杂多轮推理**：超过 10 轮对话后上下文管理需要手动压缩

### ❌ 不适合

- 需要最新事实性知识（E4B 知识截止 2025 年底）
- 对话质量要求极高的旗舰应用（建议服务端 + 端侧混用）

---

## 跨端方案：KMP 共享业务逻辑 + 各平台推理

如果你的项目同时覆盖 **Android 和 iOS**，推荐用 **Kotlin Multiplatform (KMP)** 共享业务层，各端分别接入本地推理引擎：

```kotlin
// KMP common 层：共享对话逻辑
expect class OnDeviceAI {
    suspend fun chat(message: String): Flow<String>
}

// Android actual 实现（MediaPipe GenAI，性能最优）
actual class OnDeviceAI {
    private val gemmaRepo = GemmaRepository.instance
    actual suspend fun chat(message: String) = gemmaRepo.chat(message)
}

// iOS actual 实现（CoreML / llama.cpp.swift）
actual class OnDeviceAI {
    // 通过 KMP-Native 互操作调用 Swift 推理
    actual suspend fun chat(message: String): Flow<String> = channelFlow {
        CoreMLBridge.inference(message) { chunk, done ->
            trySend(chunk)
            if (done) close()
        }
    }
}
```

> **提示**：iOS 端可考虑 CoreML 框架直接加载量化模型（需将 `.task` 格式转换为 `.mlpackage`），或使用 `llama.cpp.swift` 作为统一跨端推理底座。

---

## 数据安全：不可忽视的合规问题

接入端侧 AI 后，需要关注：

1. **模型文件保护**：加密存储 `.task` 文件，防止提取后在其他设备运行
2. **推理内容日志**：端侧推理内容是否上报？需在隐私政策中明确说明
3. **Prompt 注入防御**：不要直接拼接用户输入，做基础过滤
4. **合规检查**：金融/医疗类 App 需确认监管机构对本地 AI 决策的态度

---

## 总结：端侧 AI 的拐点来了

Gemma 4 的意义不仅是一个新模型，更是 **"端侧 AI 工程化落地"的信号弹**：

- **4B 参数，手机可跑**：硬件门槛真正跨过临界点
- **多模态，一个模型搞定**：不需要多个模型拼接
- **Apache 2.0，商用免费**：没有版权风险
- **MediaPipe 封装，开发门槛大降**：两三天就能集成

**现在就可以开始做的事情**：
1. ✅ 下载 E4B 模型，在自己的测试机上跑一跑
2. ✅ 评估现有 App 中哪些功能适合迁移到端侧
3. ✅ 做一个场景原型（客服/文档助手/代码补全都是好起点）
4. ⏳ 关注 iOS 端侧 AI 适配进展（CoreML + llama.cpp.swift 方案成熟度）

端侧 AI 不是未来，是**现在**。先做先得。

---

💡 **AppDev | 资讯·工具·教程·社区**

📱 关注我们，获取最新 Android / iOS / 跨平台开发干货

💬 有问题？评论区留言，或加入开发者交流群探讨

❤️ 觉得有用？点个「在看」分享给团队里的同事！
