---
title: 别只盯着应用商店！Ubuntu 装软件的 5 种“隐藏”姿势，学会了才是高手
date: 2026-02-10
tags: [Ubuntu, Linux, Tutorial, Software]
category: Ubuntu
description: 很多新手从 Windows 转过来，习惯了去官网下 .exe，或者只知道用 Ubuntu 的应用商店。其实，Ubuntu 下装软件的方式非常多，而且很多时候比 Windows 更爽。今天就来盘点一下，除了应用商店，还有哪些神仙操作。
cover: ../../imgs/2026-02-10-ubuntu-software-install-ways-cover.svg
---

很多刚从 Windows 转到 Ubuntu 的小伙伴，最不习惯的可能就是“怎么装软件”。

虽然 Ubuntu 现在自带了 **App Center (应用中心)**，像手机应用商店一样点一点就能装，但你很快会发现：
*   “哎？我要的这个软件怎么搜不到？”
*   “商店里这个版本怎么是三年前的？”
*   “我想装个旧版本怎么办？”

其实，Linux 的软件安装方式比 Windows 丰富得多，而且一旦你掌握了其中的逻辑，你会发现它比 Windows 满网找 `.exe`、还得防着捆绑全家桶要**爽得多**。

今天我们就来盘点一下，除了应用商店，Ubuntu 还可以通过哪些方式安装软件。

---

## 方式一：APT 命令行 —— 极客的浪漫（也是最稳的）

这是 Ubuntu 最经典、最基础，也是老手最爱用的方式。

在 Windows 下，你想装个 Git，可能要打开浏览器 -> 搜官网 -> 下载安装包 -> 双击 -> 下一步 x N。
在 Ubuntu 下，只需要打开终端（Ctrl+Alt+T），输入一行命令：

```bash
sudo apt install git
```

回车，输密码，搞定。

**APT (Advanced Package Tool)** 是 Ubuntu 的包管理器，它直接从官方维护的“软件仓库”里下载软件。

*   **优点**：绝对安全（官方审核过）、速度快、自动解决依赖（缺什么库自动补齐）。
*   **缺点**：有些软件版本可能不是最新的。

**常用三板斧：**

1.  **刷新列表**（去看看服务器上有啥新东西，装软件前必做）：
    ```bash
    sudo apt update
    ```
2.  **安装软件**：
    ```bash
    sudo apt install 软件名
    ```
3.  **卸载软件**：
    ```bash
    sudo apt remove 软件名
    ```

> **小贴士**：不知道软件具体叫啥？可以用 `apt search 关键词` 搜一下。

---

## 方式二：DEB 包 —— Linux 版的 ".exe"

有些商业软件（比如 Google Chrome、VS Code、百度网盘、WPS Office）因为版权或其他原因，没有进入 Ubuntu 的官方仓库。

这时候，你通常要去它们的官网，找到 **Linux** 下载区，选择 **`.deb`** 格式下载。

`.deb` 之于 Ubuntu，就像 `.exe` / `.msi` 之于 Windows。

**怎么安装？**

1.  **双击**：大部分情况下，双击下载好的 `.deb` 文件，会调用应用中心打开，点击“Install”即可。
2.  **命令行（更推荐）**：如果双击没反应，或者报错，用终端最靠谱：
    ```bash
    # 假设你在 Downloads 目录
    cd ~/Downloads
    sudo dpkg -i 文件名.deb
    ```

> **常见坑**：如果安装时提示“依赖关系未满足”，别慌，运行下面这行命令，系统会自动把缺的依赖补上：
> ```bash
> sudo apt install -f
> ```

---

## 方式三：Snap —— 官方力推的“全家桶”

你可能在命令行里见过 `snap` 这个词。这是 Ubuntu 母公司 Canonical 大力推广的一种新格式。

它的特点是**“自带干粮”**：一个软件把在这个系统上运行需要的所有依赖库都打包在自己肚子里。

*   **优点**：
    *   **开箱即用**：不管你系统缺啥，它都能跑。
    *   **自动更新**：后台静默更新，永远保持最新。
    *   **沙箱隔离**：比较安全，不会搞坏系统。
*   **缺点**：第一次启动可能会慢几秒（因为要解压挂载）。

**怎么用？**
很多软件在 APT 里版本老，但在 Snap 里是新的。
```bash
sudo snap install 软件名
```
比如安装最新版的 Spotify 或 PyCharm。

---

## 方式四：Flatpak —— 社区最爱的“当红炸子鸡”

如果你去 Reddit 或者 Linux 论坛，会发现大家对 Flatpak 的评价非常高。它和 Snap 类似，也是自带依赖、沙箱隔离，但它更通用（所有 Linux 发行版都能用），而且软件库 **Flathub** 非常丰富且更新极快。

**如果你想要最新版的桌面应用（比如 OBS、GIMP、Telegram），首选 Flatpak。**

Ubuntu 默认没带 Flatpak，你需要先“激活”它：

1.  **安装基础环境**：
    ```bash
    sudo apt install flatpak
    ```
2.  **添加 Flathub 仓库**（相当于添加了一个巨大的应用商店）：
    ```bash
    flatpak remote-add --if-not-exists flathub https://flathub.org/repo/flathub.flatpakrepo
    ```
3.  **安装软件**：
    可以去 [flathub.org](https://flathub.org) 搜，或者命令：
    ```bash
    flatpak install flathub 软件名
    ```

---

## 方式五：AppImage —— 真正的“绿色软件”

这个最神奇，它甚至不需要“安装”。

AppImage 格式的文件，就像 Windows 下的“绿色版”软件。你下载下来一个文件（后缀通常是 `.AppImage`），它就是软件本身。

**怎么用？**

1.  下载文件。
2.  **右键 -> 属性 -> 允许作为程序执行**（或者命令行 `chmod +x 文件名`）。
3.  **双击运行**。

不想用了？直接把文件删了就行，系统里不留一点垃圾。

**适用场景**：
*   你想尝鲜某个软件的 Beta 版。
*   你想同时保留一个软件的 1.0 版和 2.0 版。
*   不想把系统搞乱，用完即走。

---

## 总结：我该选哪种？

看到这么多方式，是不是有点晕？别怕，给你一个简单的**决策流**：

1.  **首选 APT** (`apt install`)：系统工具、开发环境、追求稳定时。
2.  **次选 Snap / Flatpak**：由于 APT 版本太老，或者你想装最新版的桌面软件（微信、网易云、OBS）时。
3.  **不得已选 DEB**：只有官网提供下载，仓库里没有时（Chrome, VS Code）。
4.  **备用 AppImage**：偶尔用一次，或者上面都搞不定时。

Linux 的世界很自由，条条大路通罗马。掌握了这几种“姿势”，你就再也不会因为“装不上软件”而抓狂了。

---

**互动话题**：
你在 Ubuntu 下装软件遇到过最坑的问题是什么？欢迎在评论区吐槽！
