# 22. 运行 Windows 应用：Wine 与 Proton

> **摘要**：离不开 Windows 软件？本文提供三种解决方案：利用 Steam Proton 畅玩大作，使用 Bottles 容器化运行工具软件，以及通过 Deepin-Wine 搞定微信等国产应用。助你在 Linux 上也能无缝使用必要的 Windows 独占程序，兼顾生态与体验。

Linux 生态已经能覆盖大多数日常需求，但总有一些 Windows 独占的软件绕不开。解决思路通常有三条路：**原生替代**、**兼容层（Wine/Proton）**、**虚拟机/双系统**。别一上来就硬刚 Wine，先选最省心的路径。

## 1. 什么是 Wine？

Wine Is Not an Emulator (Wine 不是模拟器)。
它是一个兼容层，能把 Windows 的 API 调用实时翻译成 Linux 能听懂的指令。所以它的性能损耗非常小，甚至有时候比在 Windows 上跑得还快。

但也要说清楚边界：Wine 不是“万能运行器”。能不能跑、跑得稳不稳，很依赖具体软件版本、依赖库、驱动模型，甚至地区发行版差异。

## 2. Steam Play (Proton)：Linux 游戏救星

如果你是游戏玩家，Valve 开发的 **Proton** (基于 Wine) 简直是神迹。
1.  **安装 Steam**: `sudo apt install steam`
2.  **开启 Proton**:
    *   Steam -> Settings -> Compatibility。
    *   勾选 "Enable Steam Play for all other titles"。
3.  **玩游戏**: 现在你可以直接下载并运行 Windows 游戏了（如《艾尔登法环》、《赛博朋克 2077》）。
    *   去 [ProtonDB](https://www.protondb.com/) 查看游戏的兼容性报告。

## 3. Bottles：容器化运行 Windows 软件

直接配置 Wine 非常麻烦（你需要手动安装各种 DLL）。**Bottles** 是一个图形化工具，能帮你自动配置环境。

1.  **安装**: 在 App Center 搜索 Bottles 并安装 (推荐 Flatpak 版本)。
2.  **创建容器 (Bottle)**:
    *   点击 "+"。
    *   起个名字，Environment 选择 "Application" 或 "Gaming"。
3.  **运行程序**:
    *   进入容器，点击 "Run Executable"，选择你的 `.exe` 安装包。
4.  **安装依赖**:
    *   在 "Dependencies" 页面，你可以一键安装 .NET Framework, DirectX, VC++ Runtimes 等常用库。

## 4. 深度/统信 Wine (Deepin-Wine)

如果你需要运行国产毒瘤软件（微信、QQ、钉钉），Deepin 团队维护的 Deepin-Wine 是最佳选择。
虽然在 Ubuntu 上安装 Deepin-Wine 比较折腾（需要添加第三方仓库），但有些开源项目（如 `deepin-wine-ubuntu`）打包好了现成的解决方案。

**现在的建议**：
*   **游戏**: 用 Steam Proton。
*   **工具软件**: 用 Bottles。
*   **微信/QQ**: 尽量用原生 Linux 版，或者用 Web 版。

## 5. 虚拟机：最后的退路

如果 Wine 搞不定（反作弊网游、需要内核驱动的硬件工具链、极度复杂的专业软件），就别在不适合的地方耗时间：要么用虚拟机跑，要么保留双系统。把时间用在能提升生产力的地方，比“折腾到能跑”更划算。
