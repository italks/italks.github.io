# Linux 游戏界的“复仇者联盟”：Open Gaming Collective (OGC)

> **摘要**：这次我们不再搞错对象了。OGC (Open Gaming Collective) 不是为了打官司，而是为了打游戏！这是一个由 Bazzite, Nobara, ChimeraOS 等顶尖 Linux 游戏发行版组成的超级联盟。他们的目标很简单：停止重复造轮子，联手打造一个统一、高性能的 Linux 游戏底层生态。

![Open Gaming Collective Cover](../imgs/2026-01-31-open-gaming-collective-cover.svg)

在 Linux 游戏圈，长期以来存在一种“各自为战”的现象。虽然大家都在用 Linux 内核，但为了让 Steam Deck 以外的掌机（如 ROG Ally, Legion Go）运行顺畅，或者为了获得更好的桌面游戏性能，每个发行版都在维护自己的一套“魔改”组件。

直到 **Open Gaming Collective (OGC)** 的出现，这种局面终于要改变了。

## OGC 是什么？

Open Gaming Collective (OGC) 是一个致力于改善开源游戏生态系统的工作组。它的核心使命是**“Leveling Up the Ecosystem, Together”**（共同提升生态系统）。

简单来说，就是各个原本“竞争”的 Linux 游戏发行版决定坐下来，把各自手里最好的技术贡献出来，形成一套**标准化的共享组件**。

他们的哲学是 **"Upstream First"**（上游优先）：与其每个人都维护一套私有的补丁，不如合力将改进推送到上游，造福所有人。

## 梦之队：参与的成员

如果你是 Linux 游戏玩家，这个名单绝对会让你兴奋，因为它几乎囊括了目前市面上最热门的“游戏级” Linux 发行版和项目：

### 创始成员 (Founding Members)
*   **Universal Blue & Bazzite**：目前最热门的 SteamOS 替代品之一，基于 Fedora 原子桌面，以其稳定性和对掌机的完美支持著称。
*   **Nobara**：由 Proton-GE 的作者 GloriousEggroll 维护的发行版，不仅优化了内核，还预装了大量游戏修正补丁。
*   **ChimeraOS**：专注于提供类似主机体验的 Linux 发行版，是客厅 PC 玩家的首选。
*   **ASUS Linux**：专注于华硕硬件（如 ROG 笔记本、ROG Ally）在 Linux 下的驱动支持，弥合了发烧硬件与主线内核的差距。
*   **Playtron**：一个新兴的、致力于让 Linux 游戏在全球范围内更易于访问的 OS 项目，特别关注安全启动 (Secure Boot) 的支持。
*   **PikaOS**：专注于基于 Debian 的游戏优化。
*   **ShadowBlip** & **Fyra Labs**：专注于手持设备体验和桌面普及化。

### 战略合作伙伴
*   **winesapOS**：便携式 Linux 游戏系统的先驱之一。

## 这个联盟要解决什么问题？

OGC 的成立正是为了解决 Linux 游戏生态中日益严重的**碎片化**和**资源浪费**问题。

### 1. 停止“重复造轮子”
以前，为了支持某个新的掌机手柄或修复某个游戏的崩溃，Bazzite 团队可能写了一个补丁，Nobara 团队也写了一个类似的，ChimeraOS 团队又写了一个。
**现在**：大家在 OGC 的框架下协作，维护同一套代码。

### 2. 统一的硬件支持
Steam Deck 很棒，但市场上还有 ROG Ally, Lenovo Legion Go, MSI Claw 等各种设备。每个设备都需要特定的内核补丁、TDP 控制和风扇曲线。OGC 汇集了 ASUS Linux 等专家的力量，确保这些硬件能在所有成员的发行版上“开箱即用”。

### 3. 共享技术支柱 (Shared Technical Pillars)
OGC 已经确定了几个核心的共享项目：

*   **The OGC Kernel**：一个共享的、专注于游戏的 Linux 内核。不再是每个发行版维护自己的内核分支，而是集合所有优化（调度器、驱动补丁、性能调优）于一身的超级内核。
*   **Gamescope Fork**：Gamescope 是 Valve 开发的微型合成器，是 SteamOS 的核心。OGC 计划维护一个下游分支，旨在扩展其硬件支持范围，使其能在更多非 Steam Deck 设备上完美运行。

## 对普通玩家意味着什么？

作为普通用户，你可能不需要直接加入 OGC，但你将直接受益：

1.  **更快的更新**：当一个游戏 bug 被修复，它会更快地同步到所有 OGC 成员的发行版中。
2.  **更好的兼容性**：无论你买哪种 Windows 掌机，刷入 Bazzite 或 ChimeraOS 后的体验将更加一致和完美。
3.  **更强的性能**：集结了全网最懂 Linux 游戏优化的开发者维护的内核，性能表现值得期待。

OGC 的出现标志着 Linux 游戏从“单兵作战”进入了“集团军作战”的时代。这不仅是对抗 Windows 的有力武器，也是开源精神的最佳体现。
