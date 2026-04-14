# WSL 入门与安装配置：Windows 上体验 Linux 的最佳方式

> **阅读时长**：约 15 分钟 | **难度等级**：⭐☆☆☆☆ 新手友好
>
> 从零开始了解 WSL，完成安装配置，开启你的 Windows + Linux 双系统之旅。

---

## 一、背景故事：为什么微软要拥抱 Linux？

### 1.1 一段不可思议的历史

时间回到 2014 年，新任 CEO 萨提亚·纳德拉（Satya Nadella）说出了那句震惊世界的话：

> **"Microsoft loves Linux."**

（微软爱 Linux）

这在当时简直是天方夜谭。要知道，微软前 CEO 史蒂夫·鲍尔默（Steve Ballmer）曾公开称 Linux 为"癌症"。但从那时起，微软开始了史诗般的转身：

- 2015 年：Visual Studio Code 开源，支持 Linux
- 2016 年：**WSL 1 正式发布**，Bash on Windows 诞生
- 2019 年：**WSL 2 发布**，集成完整 Linux 内核
- 2020 年：WSL 支持 GUI 应用程序（WSLg）
- 2023 年起：WSL 成为主流开发者的标配工具

### 1.2 WSL 到底是什么？

**WSL（Windows Subsystem for Linux）** = **Windows 子系统 for Linux**

简单来说：

```
┌─────────────────────────────────────────────┐
│                  你的电脑                      │
│                                             │
│   ┌──────────────┐    ┌──────────────────┐  │
│   │   Windows     │    │      WSL         │  │
│   │               │    │                  │  │
│   │  · Office     │    │  · Ubuntu        │  │
│   │  · 浏览器      │    │  · Debian        │  │
│   │  · 游戏       │    │  · Fedora        │  │
│   │  · PS 剪映     │    │  · Kali Linux   │  │
│   └──────────────┘    └──────────────────┘  │
│                                             │
│              共享文件、网络、剪贴板              │
└─────────────────────────────────────────────┘
```

它**不是虚拟机**，不是 Docker 容器，而是一个让 Linux 二进制程序能在 Windows 上原生运行的兼容层。

### 1.3 WSL 1 vs WSL 2：选哪个？

| 对比项 | WSL 1 | WSL 2 |
|:---|:---|:---|
| **核心原理** | 翻译 Linux 系统调用为 Windows 调用 | 在轻量级虚拟机中运行真实 Linux 内核 |
| **文件系统速度** | ⚡ 快（直接访问 NTFS） | 🐢 较慢（通过 9P 协议转发） |
| **兼容性** | 约 95% 的 Linux 程序能运行 | 接近 100%，支持 Docker、systemd |
| **内存占用** | 低（按需加载） | 较高（预分配虚拟机内存） |
| **启动速度** | 秒开 | 需启动 VM（约 5-10 秒） |

**🎯 推荐：新手直接用 WSL 2**，除非你有特殊性能需求。

---

## 二、安装准备：检查你的环境

### 2.1 系统要求

```powershell
# 打开 PowerShell（管理员），查看系统版本
winver
```

| 操作系统 | 最低版本要求 |
|:---|:---|
| Windows 11 | 所有版本 ✅ |
| Windows 10 | 版本 2004+（内部版本 ≥19041）|

> 💡 **不确定？** 按 `Win + R` → 输入 `winver` → 回车即可查看。

### 2.2 启用 BIOS 虚拟化

WSL 2 依赖硬件虚拟化，需要确认已开启：

```powershell
# 检查虚拟化状态
systeminfo | findstr /i "虚拟"
```

如果显示"Hyper-V 要求: 虚拟化监视器扩展模式: 是"，说明已启用。

**如何开启（如未启用）：**
1. 重启电脑，进入 BIOS（通常按 Del、F2 或 F12）
2. 找到以下选项之一并设为 **Enabled**：
   - Intel VT-x / Intel Virtualization Technology
   - AMD-V / SVM Mode
3. 保存重启

---

## 三、安装 WSL：三种方式任你选

### 方式一：一行命令安装（推荐 ⭐⭐⭐⭐⭐）

这是最简单的方式，适合绝大多数用户：

```powershell
# PowerShell（管理员）中执行：
wsl --install
```

这条命令会自动完成：
1. ✅ 启用 WSL 功能
2. ✅ 启用虚拟机平台
3. ✅ 安装 Ubuntu（默认发行版）
4. ✅ 下载 Linux 内核更新包

安装完成后**重启电脑**，然后从开始菜单打开 Ubuntu 即可。

### 方式二：Microsoft Store 安装

适合想要选择其他发行版的用户：

```
1. 打开 Microsoft Store
2. 搜索以下任意发行版：
   ├── Ubuntu 24.04 LTS  （推荐新手）
   ├── Ubuntu 22.04 LTS  （稳定成熟）
   ├── Debian 12         （极简纯净）
   ├── Fedora            （红帽系）
   ├── openSUSE          （德国血统）
   └── Kali Linux        （安全测试）
3. 点击"获取"/"安装"
```

### 方式三：手动命令行安装（完全控制）

```powershell
# Step 1: 启用 WSL 功能
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart

# Step 2: 启用虚拟机平台（WSL 2 需要）
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart

# Step 3: 重启电脑后，设置 WSL 默认版本为 2
wsl --set-default-version 2

# Step 4: 安装指定发行版
wsl --list --online                    # 查看可用发行版列表
wsl --install -d Ubuntu-24.04         # 安装 Ubuntu 24.04
```

---

## 四、初次配置：让 WSL 更好用

### 4.1 设置用户名和密码

首次启动 Ubuntu 时，会要求你创建 UNIX 用户：

```
Installing, this may take a few minutes...
Please create a default UNIX user account. The username does not need to match your Windows username.
For more information visit: https://aka.ms/wslusers

Enter new UNIX username: zhangsan      # ← 输入用户名
New password:                          # ← 输入密码（不会显示字符，正常的）
Retype new password:                   # ← 再次输入密码
password updated successfully.
Installation successful!
```

> ⚠️ **注意**：密码输入时屏幕上**不会显示任何内容**（没有 * 也没有圆点），这是 Linux 的安全设计，正常输入即可。

### 4.2 更新系统软件包

```bash
# 进入 WSL 后，首先更新系统
sudo apt update && sudo apt upgrade -y
```

| 命令 | 作用 |
|:---|:---|
| `sudo` | 以管理员权限执行 |
| `apt update` | 刷新软件源列表 |
| `apt upgrade` | 升级所有已安装的软件 |
| `-y` | 自动确认，不用手动输 y |

### 4.3 配置镜像源（国内用户必做）

默认源在国外，下载速度慢。换成阿里云或清华源：

```bash
# 备份原始源文件
sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak

# 编辑源文件（以 Ubuntu 24.04 为例）
sudo sed -i 's/archive.ubuntu.com/mirrors.aliyun.com/g' /etc/apt/sources.list
sudo sed -i 's/security.ubuntu.com/mirrors.aliyun.com/g' /etc/apt/sources.list

# 更新使生效
sudo apt update
```

---

## 五、发行版选择指南

### 主流发行版对比

| 发行版 | 包管理 | 特点 | 适合人群 |
|:---|:---|:---|:---|
| **Ubuntu** | apt | 社区最大，教程最多 | 🌟 新手首选 |
| **Debian** | apt | 极简稳定，老牌经典 | 追求稳定者 |
| **Fedora** | dnf | 新技术首发，红帽系 | 技术尝鲜党 |
| **openSUSE** | zypper | YaST 配置工具强大 | 企业用户 |
| **Arch Linux** | pacman | 滚动更新，高度定制 | 高级玩家 |

### 🎯 新手推荐：Ubuntu

理由很简单：
1. 教程资源最丰富（遇到问题一搜就有答案）
2. 社区活跃，中文资料多
3. 与本公众号主题契合（你关注的不就是 Ubuntu 嘛 😄）

---

## 六、WSL 常用基础命令速查

在 Windows 的 PowerShell/CMD 中使用：

```bash
# 查看已安装的发行版
wsl --list -v
# 或简写：wsl -l -v

# 查看可安装的发行版
wsl --list --online

# 运行指定发行版
wsl -d Ubuntu-24.04

# 关闭 WSL（释放资源）
wsl --shutdown

# 导出发行版备份
wsl --export Ubuntu-24.04 D:\backup\ubuntu-backup.tar

# 导入恢复
wsl --import Ubuntu-Restore D:\wsl\Ubuntu D:\backup\ubuntu-backup.tar

# 卸载发行版
wsl --unregister Ubuntu-24.04
```

---

## 七、安装 Windows Terminal（强烈推荐）

Windows 自带的终端体验一般，推荐安装 **Windows Terminal**：

```powershell
# Microsoft Store 搜索 "Windows Terminal" 免费安装
# 或执行：
winget install Microsoft.WindowsTerminal
```

**为什么推荐？**
- ✅ 多标签页（同时开多个发行版/PowerShell/CMD）
- ✅ GPU 加速渲染（字体更清晰）
- ✅ 分屏功能
- ✅ 自定义主题、快捷键、配色方案
- ✅ 直接在侧边栏看到你的 WSL 发行版

---

## 八、常见问题 FAQ

### Q1：WSL 和虚拟机有什么区别？

| | WSL | VMware/VirtualBox |
|:---|:---|:---|
| 启动速度 | 秒开 | 分钟级 |
| 内存占用 | 共享/动态分配 | 固定分配 |
| 文件互通 | 原生访问 | 需共享文件夹 |
| 图形界面 | WSLg 支持 | 原生支持 |
| 适用场景 | 开发工具、CLI 应用 | 完整桌面环境 |

**一句话总结**：开发用 WSL，学习桌面 Linux 用虚拟机。

### Q2：可以装多个发行版吗？

当然可以！每个发行版独立存储，互不影响：

```bash
# 同时装 Ubuntu 和 Debian
wsl --install -d Ubuntu-24.04
wsl --install -d Debian
```

### Q3：WSL 能玩游戏吗？

WSL 2 支持运行部分 Linux 游戏（借助 Steam Proton），但性能不如原生 Windows。建议游戏还是留在 Windows，WSL 专注开发和工具场景。

### Q4：会感染 Windows 病毒吗？

WSL 的文件系统与 Windows 隔离，Linux 病毒无法直接影响 Windows 系统。但两者共享的目录（如 `/mnt/c/`）中的文件仍需注意安全。

---

## 九、下期预告

下一篇我们将深入 **《WSL 基础操作与常用命令》**，内容包括：

- 🔧 wsl.exe 命令行工具完整指南
- 📂 Windows 和 Linux 文件系统互访技巧
- 🌐 网络配置与端口转发详解
- 🖥️ GUI 图形应用的使用方法（WSLg）
- ⌨️ 10 个日常高频操作实战演示

---

> **💡 觉得有用？关注我们，不错过后续精彩内容！**
> 
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
> 
> 💬 有问题欢迎评论区交流，我们一起学习进步！
