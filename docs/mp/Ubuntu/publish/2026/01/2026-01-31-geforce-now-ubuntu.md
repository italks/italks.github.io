# 原生支持！GeForce NOW 登陆 Ubuntu：老旧 PC 也能畅玩 3A 大作

> **摘要**：Linux 游戏玩家的福音来了！NVIDIA 正式推出了适用于 Linux 的 GeForce NOW 原生 Beta 应用，首发支持 Ubuntu 24.04 及更高版本。无需高端显卡，你的 Ubuntu 办公本也能瞬间化身 RTX 5080 级游戏怪兽，享受 5K 120FPS 的极致云游戏体验。

![GeForce NOW Ubuntu Cover](../imgs/2026-01-31-geforce-now-ubuntu-cover.svg)

在 Linux 上玩游戏通常意味着要与 Wine、Proton 或驱动程序搏斗。虽然 Steam Deck 的成功极大地改善了 Linux 游戏生态，但对于想在 Ubuntu 桌面端享受光追 3A 大作的玩家来说，硬件配置依然是一道门槛。

但在 CES 2026 上，NVIDIA 为 Linux 社区投下了一枚重磅炸弹：**GeForce NOW 原生 Linux 应用（Beta 版）正式发布**。

这意味着，你不再需要局限于浏览器游玩，也不需要羡慕 Windows 用户的原生客户端体验。

## 什么是 GeForce NOW？

简单来说，**GeForce NOW** 是 NVIDIA 的云游戏服务。它就像是游戏界的 Netflix，但它运行的是你自己拥有的游戏（支持 Steam, Epic, Ubisoft 等平台）。

*   **云端算力**：游戏在 NVIDIA 的高性能服务器上运行（最高配置为 RTX 4080/5080 级别）。
*   **本地串流**：你的设备只需要负责接收视频流和发送操作指令。
*   **结果**：即使是只有集显的轻薄本，也能开启“全高画质 + 光线追踪”，流畅运行《赛博朋克 2077》或《黑神话：悟空》。

## 此次更新亮点：原生 Linux 支持

此前，Linux 用户主要通过 Chrome/Edge 浏览器使用 GeForce NOW，或者使用社区维护的第三方客户端。虽然能用，但往往限制了分辨率和帧率。

新的原生 Beta 应用带来了质的飞跃：

1.  **原生性能释放**：支持最高 **5K 分辨率 @ 120 FPS**，或者 **1080p @ 360 FPS**（需 Ultimate 会员）。这对于竞技类游戏玩家来说至关重要。
2.  **完整特性支持**：支持 NVIDIA Reflex 低延迟技术、Cloud G-SYNC、以及最新的 DLSS 4.0（云端开启）。
3.  **桌面深度集成**：不再是一个网页标签，而是一个能够更好地适配 Linux 桌面环境（如 GNOME, KDE）的独立应用。

## 系统要求 (Ubuntu 用户必看)

想在 Ubuntu 上体验原生 GeForce NOW，你需要满足以下条件：

### 1. 操作系统
*   **Ubuntu 24.04 LTS** 或更高版本。
*   虽然官方首发点名 Ubuntu，但理论上其他基于 Debian 的现代发行版也能运行（待测试）。

### 2. 硬件要求
既然是云游戏，对本地算力要求不高，但对**视频解码能力**有要求：
*   **GPU**：需要支持 **Vulkan** 视频解码（H.264 或 H.265/HEVC）的现代显卡。
    *   NVIDIA GeForce 10 系列及更新。
    *   AMD Radeon RX 400 系列及更新。
    *   Intel HD Graphics 600 系列及更新。
*   **驱动程序**：如果是 NVIDIA 显卡，需要安装 **580.126.07** 或更高版本的专有驱动。

### 3. 网络环境（最关键）
*   **带宽**：
    *   720p @ 60 FPS：至少 15 Mbps。
    *   1080p @ 60 FPS：至少 25 Mbps。
    *   4K/5K @ 120 FPS：建议 45 Mbps 以上。
*   **延迟**：连接到 NVIDIA 数据中心的延迟需低于 **80ms**（建议低于 40ms 以获得最佳体验）。
*   **连接**：强烈建议使用 **有线网络 (Ethernet)** 或 **5GHz Wi-Fi**。

## 为什么这对 Ubuntu 很重要？

这不仅仅是一个应用的发布，更是商业巨头对 Linux 桌面游戏潜力的一次重要认可。

过去，我们在 Linux 上玩游戏往往是“二等公民”，需要通过转译层损耗性能。而 GeForce NOW 的原生支持，让 Ubuntu 用户拥有了一条**绕过本地硬件限制**的捷径。

无论你是开发者、学生，还是只使用 Linux 的开源拥趸，现在你都有机会在不重启进入 Windows 的情况下，随时来一把画质拉满的 3A 大作。

**现在就去 NVIDIA 官网下载 Beta 版试试吧！**

## 下载与安装

目前 GeForce NOW Linux 客户端（Beta）已在 NVIDIA 官网开放下载。

*   **官方下载页面**：[https://www.nvidia.com/en-us/geforce-now/download/](https://www.nvidia.com/en-us/geforce-now/download/)

进入页面后，向下滚动找到 **Linux** 部分，点击下载。通常提供 `.deb` 安装包，适用于 Ubuntu/Debian 系统。

**安装命令（示例）：**

```bash
# 假设下载的文件名为 geforce-now-linux.deb
sudo dpkg -i geforce-now-linux.deb
sudo apt-get install -f  # 修复可能缺失的依赖
```

---

**🗣️ 话题讨论**

NVIDIA 终于想起了 Linux 桌面用户，这是否意味着 Linux 游戏的春天真的来了？你会为了 GeForce NOW 而放弃 Windows 双系统吗？

欢迎在评论区留言，分享你的看法或安装体验！👇


