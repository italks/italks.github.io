# Google 新神器让 Android 开发快 3 倍：Android CLI 完全指南，从安装到实战

> **摘要**：2026年4月16日，Google正式发布 **Android CLI** —— 一套专为AI Agent时代设计的命令行工具链。实测数据显示：配合任意AI Agent使用时任务完成速度**提升3倍**，LLM Token消耗**减少70%以上**。从项目创建到部署运行，全部在终端里一条命令搞定。本文手把手带你从零上手这一革命性工具。

**阅读时长**：约10分钟 | **难度**：⭐⭐⭐ 实战教程
**工具状态**：Preview（预览版） | 下载地址：d.android.com/tools/agents

---

## 为什么要关注Android CLI？

在聊具体用法之前，先回答一个核心问题——**为什么Google要重新设计一套CLI？**

### 传统Android开发的痛点

你一定经历过这些场景：

| 痛点 | 具体表现 |
|:---|:---|
| **环境配置繁琐** | SDK Manager界面卡顿、组件下载慢、版本冲突排查耗时 |
| **项目创建冗余** | Android Studio新建项目要等Gradle Sync，光初始化就要5-10分钟 |
| **Agent协作困难** | AI Agent不知道你的SDK路径、Build Variants、签名配置，生成代码经常跑不通 |
| **文档滞后** | LLM训练数据有截止日期，生成的代码用的是过时的API或废弃方法 |
| **CI/CD不友好** | GUI操作难以脚本化，自动化流程依赖各种Hack方案 |

### Android CLI的解决方案

```
┌─────────────────────────────────────────────────────┐
│                 Android CLI 架构                      │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ 核心命令   │  │ Skills   │  │ Knowledge Base   │  │
│  │ (7个命令) │  │ 技能系统  │  │ 实时知识库       │  │
│  └────┬─────┘  └────┬─────┘  └───────┬──────────┘  │
│       │              │                │              │
│       └──────────────┼────────────────┘              │
│                      ▼                               │
│           ┌──────────────────┐                       │
│           │  任意AI Agent     │ ← Gemini/Claude/Cursor│
│           │  (统一接口)       │    Codex/Antigravity │
│           └────────┬─────────┘                       │
│                    ▼                                 │
│        ┌───────────────────────┐                     │
│        │  Android Studio (可选) │ ← 精细调试/分析      │
│        └───────────────────────┘                     │
└─────────────────────────────────────────────────────┘
```

**核心价值主张**：
- 🚀 **任务速度提升3倍**（Google内部实验数据）
- 💰 **Token消耗降低70%+**（项目设置场景）
- 🔧 **标准化接口**：任何Agent都能理解
- 📚 **实时知识**：解决LLM训练截止日期问题

---

## 二、安装与环境配置

### 2.1 下载安装

```bash
# 方式一：官方下载（推荐）
# 访问 d.android.com/tools/agents 下载对应平台包

# 方式二：Homebrew（macOS/Linux）
brew install android-cli

# 方式三：手动配置（通用）
# 1. 下载压缩包解压到目标目录
# 2. 将bin目录加入PATH
export PATH="$PATH:/path/to/android-cli/bin"

# 验证安装
android --version
# 输出: Android CLI v0.x.x (Preview)
```

### 2.2 初始化开发环境

```bash
# 1. 更新CLI到最新版本
android update

# 2. 安装所需SDK组件（按需安装，不再全家桶）
android sdk install \
  platforms;android-35 \
  build-tools;35.0.0 \
  platform-tools \
  cmdline-toolslatest

# 3. 验证SDK安装
android sdk list
```

> ⚡ **关键区别**：传统方式需要通过Android Studio的SDK Manager下载几个GB的完整包。`android sdk install` 只下载你明确指定的组件，首次安装体积可缩减**60%以上**。

### 2.3 配置环境变量

```bash
# 设置ANDROID_HOME（如果之前没设过）
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
# export ANDROID_HOME=$HOME/Android/Sdk         # Linux
# setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk" # Windows (PowerShell)

# 将platform-tools加入PATH（用于adb等工具）
export PATH="$PATH:$ANDROID_HOME/platform-tools"

# 验证配置
android doctor
# 输出环境检查结果和修复建议
```

---

## 三、7个核心命令详解

### 命令总览速查表

| 命令 | 功能 | 典型用途 |
|:---|:---|:---|
| `android create` | 创建新项目 | 从官方模板秒级生成项目骨架 |
| `android sdk install` | 安装SDK组件 | 按需安装，避免臃肿 |
| `android run` | 构建并运行应用 | 一键部署到设备/模拟器 |
| `android emulator` | 管理虚拟设备 | 创建/启动/管理AVD |
| `android update` | 更新工具链 | 保持CLI和SDK最新 |
| `android skills` | 管理技能系统 | 浏览/安装/配置Agent技能 |
| `android docs` | 查询知识库 | 获取最新权威开发指南 |

下面逐一深入。

---

### 3.1 `android create` — 项目创建

这是最常用的命令，也是体验提升最明显的入口。

```bash
# 基本用法：创建一个Modern Compose模板项目
android create --template modern-compose-app MyNewApp

# 指定包名和语言
android create \
  --template modern-compose-app \
  --package com.example.myapp \
  --language kotlin \
  --min-sdk 24 \
  MyNewApp

# 可用模板列表（截至2026年4月）
# ├── modern-compose-app          # Modern Compose应用（推荐）
# ├── basic-activity              # 基础Activity模板
# ├── compose-material3           # Material 3 Compose应用
# ├── wear-os-app                 # Wear OS手表应用
# ├── android-tv-app              # Android TV应用
# ├── android-auto-app            # Android Auto应用
# └── blank-project               # 空白项目（最小化）

# 创建后自动进入项目目录
cd MyNewApp
ls -la
# 输出典型的Android项目结构：
# app/src/main/java/com/example/myapp/
# app/build.gradle.kts
# settings.gradle.kts
# gradlew / gradlew.bat
```

#### 与传统方式对比

| 对比维度 | Android Studio 新建项目 | `android create` |
|:---|:---|:---|
| **耗时** | 5-15分钟（含Gradle Sync） | **5-30秒** |
| **交互方式** | GUI向导（多次点击） | **一条命令** |
| **内存占用** | ~1.5-2GB（IDE进程） | **<50MB（终端）** |
| **Agent友好度** | ❌ Agent无法操作GUI | ✅ Agent可直接调用 |
| **架构质量** | 取决于模板选择 | ✅ 内置最佳实践 |

---

### 3.2 `android sdk install` — SDK管理

```bash
# 安装特定平台的SDK
android sdk install "platforms;android-35"

# 安装构建工具
android sdk install "build-tools;35.0.0"

# 批量安装常用组件
android sdk install \
  "platforms;android-35" \
  "build-tools;35.0.0" \
  "platform-tools" \
  "cmdline-tools;latest"

# 查看已安装组件
android sdk list --installed

# 查看可用更新
android sdk list --updates

# 卸载不需要的组件（节省磁盘空间）
android sdk uninstall "platforms;android-33"
```

> **实用技巧**：对于CI/CD环境，可以创建一个 `sdk-profile.txt` 文件列出所需组件，团队共享：

```bash
# sdk-profile.txt 示例
platforms;android-35
build-tools;35.0.0
platform-tools
cmdline-tools;latest
ndk;27.0.0  # 如需NDK

# 一键安装配置文件中的所有组件
android sdk install --profile sdk-profile.txt
```

---

### 3.3 `android run` — 构建与运行

```bash
# 基本用法：构建并安装到已连接设备
android run

# 指定构建变体
android run --variant release

# 指定目标设备（当连接多台设备时）
android run --device emulator-5554
# 或
android run --device <设备序列号>

# 仅构建不运行（用于CI打包）
android run --build-only

# 清除缓存后重新构建
android run --clean

# 安装APK到所有连接设备
android run --all-devices
```

#### 底层执行流程

```
android run
    │
    ├─ 1. 解析项目配置（build.gradle.kts）
    ├─ 2. 检测目标设备（adb devices）
    ├─ 3. 执行 Gradle 构建（./gradlew assembleDebug）
    ├─ 4. APK 签名处理（debug/release keystore）
    ├─ 5. 安装到目标设备（adb install -r）
    └─ 6. 启动 Activity（adb shell am start）
```

> **省心之处**：你不需要关心Gradle的具体参数、签名配置的位置、adb的目标选择——一条命令全部搞定。

---

### 3.4 `android emulator` — 设备管理

```bash
# 列出可用设备定义
android emulator list-devices

# 创建虚拟设备
android emulator create \
  --name Pixel_8_API_35 \
  --device pixel_8 \
  --api 35 \
  --image google_apis

# 启动模拟器
android emulator start Pixel_8_API_35

# 列出运行的模拟器
android emulator list-running

# 停止指定模拟器
android emulator stop Pixel_8_API_35

# 删除虚拟设备定义
android emulator delete Pixel_8_API_35

# 快捷方式：创建并立即启动
android emulator create --device pixel_9 --api 35 --auto-start
```

#### 常用设备预设

| 预设名 | 分辨率 | 适用场景 |
|:---|:---|:---|
| `pixel_8` | 1080×2400 | 主流手机测试 |
| `pixel_9` | 1080×2424 | 最新机型适配 |
| `pixel_fold` | 1841×2208 | 折叠屏测试 |
| `pixel_tablet` | 1600×2560 | 平板适配验证 |
| `tv_1080p` | 1920×1080 | Android TV测试 |

---

### 3.5 `android skills` — Agent技能系统（重点！）

这是Android CLI最具创新性的功能——**Skills系统让AI Agent能"理解"Android开发的最佳实践**。

```bash
# 查看所有可用技能
android skills list

# 安装单个技能
android skills install navigation-3-setup

# 批量安装推荐技能集
android skills install --recommended

# 查看已安装技能详情
android skills info navigation-3-setup

# 搜索特定功能的技能
android skills search compose
android skills search migration

# 更新所有已安装技能
android skills update

# 创建自定义技能（团队内部使用）
android skills init my-custom-skill
# 编辑 SKILL.md 后发布到团队仓库即可
```

#### 当前可用的核心技能（2026年4月）

| 技能名称 | 功能说明 | 适用场景 |
|:---|:---|:---|
| `navigation-3-setup` | Navigation 3 设置与迁移 | 新项目导航架构搭建 |
| `edge-to-edge-support` | 边到边显示实现 | 适配Android 15+沉浸式UI |
| `agp-9-migration` | AGP 9 迁移指南 | Gradle插件升级 |
| `xml-to-compose-migrate` | XML布局转Compose | UI现代化迁移 |
| `r8-config-analysis` | R8混淆配置分析 | Release包优化 |
| `baseline-profiles` | Baseline Profiles配置 | 启动性能优化 |
| `testing-setup` | 测试框架搭建 | 单元测试/集成测试初始化 |

#### Skill的工作原理

当你对AI Agent说：

> "帮我把这个项目的导航升级到Navigation 3"

Agent的执行流程如下：

```
用户提示词
    ↓
Agent解析意图 → 匹配到 navigation-3-migration SKILL.md
    ↓
读取SKILL.md中的结构化指令
    ├── 步骤1：添加Navigation 3依赖
    ├── 步骤2：迁移NavGraph为Composable函数
    ├── 步骤3：替换NavController调用
    ├── 步骤4：处理Deep Link变化
    └── 步骤5：验证清单（5项检查点）
    ↓
Agent按照指令精确执行每一步
    ↓
输出符合最新最佳实践的代码
```

**没有Skill时**：Agent靠LLM训练数据"猜"怎么做，可能用过时的API → 反复修正 → Token浪费

**有Skill时**：Agent拿到的是**精确的、最新的、经过验证的操作手册** → 一次做对 → 效率暴增

---

### 3.6 `android docs` — 实时知识库

这是解决"LLM知识过时"问题的关键能力。

```bash
# 搜索文档
android docs "edge-to-edge implementation"

# 搜索特定主题的最新指南
android docs "Compose state management best practices"
android docs "WorkManager 2026 migration guide"

# 限定搜索范围
android docs "Firebase Auth" --scope firebase
android docs "Kotlin coroutines" --scope kotlin

# 打开浏览器查看完整文档页面
android docs open "https://developer.android.com/guide/topics/ui/look-and-feel/edge-to-edge"

# 导出文档内容供Agent使用
android docs export "navigation-3-guide" --format markdown --output nav3-guide.md
```

#### Knowledge Base覆盖范围

| 文档源 | 内容示例 | 更新频率 |
|:---|:---|:---:|
| **Android Developer Docs** | 开发指南/API参考/最佳实践 | 实时同步 |
| **Firebase Documentation** | Firebase服务集成文档 | 实时同步 |
| **Google Developers Blog** | 最新技术文章和公告 | 每日更新 |
| **Kotlin Language Docs** | Kotlin语言参考 | 同步Kotlin官方 |

> 💡 **实际价值**：当你问Claude Code "怎么实现edge-to-edge"，它可能给你2024年的答案。而通过 `android docs`，Agent获取的是**今天刚更新的官方指南**。

---

### 3.7 `android update` — 工具链更新

```bash
# 检查是否有可用更新
android update --check

# 更新CLI本身
android update --self

# 更新SDK组件
android update --sdk

# 更新已安装的Skills
android update --skills

# 全量更新（一键全部更新）
android update --all
```

---

## 四、实战案例：从零到跑通一个App

让我们用一个完整的实战串联所有知识点。假设你要快速搭建一个**Material 3 + Compose + Navigation 3**的现代Android应用。

### 4.1 10分钟极速搭建流程

```bash
# ═══════ Step 1: 创建项目（~15秒）═══════
android create \
  --template compose-material3 \
  --package com.example.modernapp \
  --language kotlin \
  --min-sdk 26 \
  ModernApp

# ═══════ Step 2: 进入项目目录 ═══════
cd ModernApp

# ═══════ Step 3: 安装开发所需技能（~10秒）═══════
android skills install \
  navigation-3-setup \
  edge-to-edge-support \
  baseline-profiles

# ═══════ Step 4: 创建模拟器（~20秒，首次需下载镜像）═══════
android emulator create \
  --name Dev_Emulator \
  --device pixel_8 \
  --api 35 \
  --auto-start

# ═══════ Step 5: 运行应用（~1-2分钟，取决于首次编译）═══════
android run

# 🎉 应用已经在模拟器中运行了！
# 总耗时：约2-3分钟（首次），后续增量构建只需10-30秒
```

### 4.2 结合AI Agent的开发流程

现在假设你想用 **Gemini CLI** 或 **Claude Code** 来继续开发这个项目：

```bash
# 启动Gemini CLI（已内置Android CLI支持）
gemini

# 在Agent对话中使用自然语言：
#
# > 用Navigation 3帮我搭一个三页面的导航结构：
# >   首页(HomeScreen) → 详情页(DetailScreen) → 设置页(SettingsScreen)
# >
# > 并确保支持edge-to-edge显示

# Agent会自动：
# 1. 读取 navigation-3-setup SKILL.md 的指令
# 2. 按照最新规范生成NavHost代码
# 3. 读取 edge-to-edge-support 的指令
# 4. 正确配置enableEdgeToEdge()和系统栏Inset处理
# 5. 生成完整的、可直接运行的代码
```

对比一下有无Android CLI加持的差异：

| 场景 | 无CLI（纯LLM） | 有CLI + Skills | 提升 |
|:---|:---:|:---:|:---:|
| Navigation 3搭建 | 3-5次迭代修正 | **1次正确** | **3-5X** |
| Edge-to-edge适配 | 经常遗漏Insets处理 | **完整覆盖** | **消除回溯** |
| Token消耗 | 基准 | **-70%** | **成本大幅降低** |
| 代码符合最新API | 约60%概率过时 | **100%最新** | **质量保证** |

---

## 五、在CI/CD流水线中的应用

Android CLI的程序化特性使其天然适合自动化场景。

### 5.1 GitHub Actions示例

```yaml
# .github/workflows/android-ci.yml
name: Android CI
on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Android CLI
        run: |
          curl -fsSL https://dl.android.com/cli/install.sh | bash
          
      - name: Install SDK components
        run: |
          android sdk install \
            "platforms;android-35" \
            "build-tools;35.0.0" \
            "platform-tools"
            
      - name: Build app
        run: android run --build-only --variant release
        
      - name: Upload APK
        uses: actions/upload-artifact@v4
        with:
          name: release-apk
          path: app/build/outputs/apk/release/*.apk
```

### 5.2 本地开发脚本封装

你可以把常用操作封装成shell脚本：

```bash
#!/bin/bash
# dev.sh — 团队统一开发启动脚本

set -e

echo "🔧 初始化开发环境..."
android update --check && android update --sdk

echo "📦 安装项目所需的Skills..."
android skills install --recommended

echo "📱 启动开发模拟器..."
if ! android emulator list-running | grep -q "Dev_Emulator"; then
  android emulator start Dev_Emulator || true
fi

echo "✅ 环境就绪！开始开发吧"
echo ""
echo "常用命令："
echo "  android run              # 构建运行"
echo "  android run --clean      # 清理后重建"
echo "  android skills list      # 查看可用技能"
echo "  android docs '关键词'    # 搜索文档"
```

---

## 六、与现有工作流的衔接策略

你可能担心："我用了Android CLI，是不是就不能用Android Studio了？"

完全不是。Google的设计思路是**分层衔接**：

### 推荐的分阶段工作流

```
阶段1: 快速原型（CLI + Agent）
  │  android create → AI Agent编码 → android run 快速验证
  │  目标：最快速度验证想法是否可行
  ▼
阶段2: 功能完善（CLI + Agent + Studio混合）
  │  核心功能用CLI+Agent快速搭建
  │  复杂UI和交互转入Android Studio可视化调试
  ▼
阶段3: 发布准备（Android Studio为主）
  │  性能分析(Profiler) → 内存泄漏检测 → UI调试(Layout Inspector)
  │  Baseline Profiles生成 → R8混淆优化 → 签名打包
  ▼
阶段4: 持续集成（CLI纯命令行）
     android run --build-only → 自动化测试 → 分发
```

### 各阶段的工具选型

| 阶段 | 推荐工具 | 理由 |
|:---|:---|:---|
| **原型验证** | CLI + AI Agent | 速度快、成本低、Agent友好 |
| **日常开发** | CLI为主，Studio辅助 | 大部分操作CLI搞定，复杂调试开Studio |
| **性能调优** | Android Studio | Profiler/Layout Inspector等GUI工具不可替代 |
| **CI/CD** | CLI | 无头服务器无GUI，CLI是唯一选择 |
| **Code Review** | 两者结合 | CLI生成diff，Studio做详细审查 |

---

## 七、注意事项与已知限制

### 当前处于 Preview 阶段

| 限制项 | 说明 | 应对策略 |
|:---|:---|:---|
| **部分功能仍在迭代** | Skills数量持续增加 | 定期执行 `android update --skills` |
| **Windows支持尚在完善** | macOS/Linux优先 | Windows用户建议用WSL2 |
| **大型项目迁移成本** | 从现有项目迁移到CLI流程需要适配 | 新项目直接用CLI，老项目渐进式引入 |
| **自定义模板有限** | 官方模板可能不满足所有需求 | 用 `android skills init` 创建团队模板 |

### 常见坑点

```bash
# 坑1：忘记执行android update导致Skills过期
# 解决：每周至少执行一次 android update --all

# 坑2：SDK路径未设置导致android命令找不到组件
# 解决：确保ANDROID_HOME环境变量正确设置
# 验证：echo $ANDROID_HOME

# 坑3：模拟器首次创建需要下载系统镜像，时间较长
# 解决：提前执行 android emulator create --download-only 缓存镜像

# 坑4：多个Android SDK版本共存导致冲突
# 解决：android sdk install 会自动管理版本，不要手动修改SDK目录
```

---

## 总结

Android CLI不是要替代Android Studio，而是**填补了一个长期缺失的空白**——让Android开发也能像Web/后端开发一样拥有高效的命令行工具链，同时为AI Agent时代的编程方式提供标准化的基础设施。

### 核心要点回顾

| 要点 | 关键信息 |
|:---|:---|
| **定位** | 轻量级程序化CLI，专为AI Agent设计 |
| **核心命令** | 7个（create/run/emulator/sdk/update/skills/docs） |
| **杀手锏** | Skills系统 + Knowledge Base = Agent精准执行 |
| **性能数据** | 任务速度↑3倍，Token消耗↓70%+ |
| **适用场景** | 快速原型、CI/CD、Agent驱动开发、轻量化开发环境 |
| **获取方式** | d.android.com/tools/agents（免费Preview版） |

### 立即行动清单

- [ ] 访问 d.android.com/tools/agents 下载Android CLI
- [ ] 执行 `android create --template compose-material3 TestApp` 体验秒级建项目
- [ ] 运行 `android skills list --recommended` 了解可用技能
- [ ] 尝试 `android docs "edge-to-edge"` 感受实时知识库
- [ ] 把常用命令封装成团队共享的dev.sh脚本

> 💬 **互动话题**：你目前用的是什么Android开发工作流？有没有遇到过"想让AI帮你写代码但它总是搞不定环境配置"的困扰？欢迎评论区聊聊！

---

📱 **移动开发前沿** | Android · Compose · CLI · AI Agent · 开发效率

🔥 关注我们，获取更多Android开发实战干货和技术深度解读

💬 加入交流群，与全国开发者一起成长

❤️ 觉得有用？点个"在看"分享给更多Android开发者！

*参考来源：[Android Developers Blog - Android CLI and Skills](https://android-developers.googleblog.com/2026/04/build-android-apps-3x-faster-using-any-agent.html)、Google官方文档*
