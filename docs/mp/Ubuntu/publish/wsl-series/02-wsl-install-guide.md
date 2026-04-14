# WSL 安装一条龙：3 种方式任你选，5 分钟搞定

> **阅读时长**：约 12 分钟 | **难度等级**：⭐☆☆☆☆ 零基础友好
> **本篇关键词**：WSL / 安装教程 / Ubuntu / Windows 11 / 开发环境
>
> 从检查系统要求到完成首次启动，手把手带你走完 WSL 安装全流程，3 种安装方式总有一款适合你。

---

## 安装前准备：30 秒自检

在开始之前，先确认你的电脑满足基本要求：

```powershell
# 打开 PowerShell（管理员），输入：
winver
```

| 操作系统 | 最低版本 | 是否支持 |
|:---|:---|:---:|
| **Windows 11** | 所有版本 | ✅ |
| **Windows 10** | 版本 2004+（内部版本 ≥19041）| ✅ |
| **Windows 10 家庭版** | 同上 | ✅ |

> 💡 不确定版本？按 `Win + R` → 输入 `winver` → 回车，弹窗里写着呢。

---

## 方式一：一条命令安装（推荐 ⭐⭐⭐⭐⭐）

这是最简单的方式，适合 99% 的用户。

### Step 1：打开 PowerShell 管理员

```
开始菜单 → 搜索 "PowerShell" → 右键 → 以管理员身份运行
```

### Step 2：执行一条命令

```powershell
wsl --install
```

就这么简单！这条命令会自动做以下事情：

```
┌───────────────────────────────────────┐
│  wsl --install 自动完成的操作：        │
│                                       │
│  ✅ 启用 "适用于 Linux 的 Windows 子系统" │
│  ✅ 启用 "虚拟机平台" 功能              │
│  ✅ 下载并安装最新版 Linux 内核          │
│  ✅ 安装 Ubuntu（默认发行版）            │
│  ✅ 配置 WSL 默认版本为 WSL 2            │
└───────────────────────────────────────┘
```

### Step 3：重启电脑

安装完成后会提示重启，照做就行。

### Step 4：首次启动配置

重启后从开始菜单打开 **Ubuntu**，会看到：

```
Installing, this may take a few minutes...
Please create a default UNIX user account. The username does not need to match your Windows username.
For more information visit: https://aka.ms/wslusers

Enter new UNIX username: zhangsan      ← 输入你的用户名
New password:                          ← 输入密码（屏幕不会显示！正常现象）
Retype new password:                   ← 再输一次密码
password updated successfully!
Installation successful!
```

> ⚠️ **重要提醒**：Linux 输入密码时屏幕上**什么都不显示**（没有圆点、没有星号），这是安全设计，不是键盘坏了！放心盲打，然后回车。

### Step 5：更新系统

```bash
# 进入 Ubuntu 后首先更新系统
sudo apt update && sudo apt upgrade -y
```

---

## 方式二：Microsoft Store 安装（可视化操作）

适合喜欢点点点的用户：

### Step 1：启用 WSL 功能

```powershell
# PowerShell（管理员）中执行：
wsl --install --no-distribution    # 只启用功能，不装发行版
```

### Step 2：从 Store 选择发行版

```
1. 打开 Microsoft Store 应用
2. 搜索以下任意一个：

   ┌─────────────┬──────────────────────────┐
   │ 发行版       │ 适合人群                  │
   ├─────────────┼──────────────────────────┤
   │ Ubuntu 24.04│ 🌟 新手首选               │
   │ Ubuntu 22.04│ 追求稳定                  │
   │ Debian 12   │ 喜欢极简纯净              │
   │ Fedora      │ 技术尝鲜党                │
   │ openSUSE    | 企业用户倾向               │
   └─────────────┴──────────────────────────┘

3. 点击"获取"或"安装"
4. 等待下载完成后自动出现在开始菜单
```

### Step 3：首次启动同方式一的 Step 4

---

## 方式三：手动安装（完全控制 ⭐⭐⭐⭐）

适合需要精细控制的用户，或者自动部署脚本集成。

### Step 1：启用 WSL 子系统

```powershell
# PowerShell（管理员）
dism.exe /online /enable-feature /featurename:Microsoft-Windows-Subsystem-Linux /all /norestart
```

### Step 2：启用虚拟机平台

```powershell
dism.exe /online /enable-feature /featurename:VirtualMachinePlatform /all /norestart
```

### Step 3：重启电脑

```powershell
# 重启后继续以下步骤
```

### Step 4：设置默认 WSL 版本为 2

```powershell
wsl --set-default-version 2
```

### Step 5：下载 Linux 内核更新包

如果 `wsl --update` 不工作，手动下载：

1. 访问 [WSL 内核更新页面](https://wslstorestorage.blob.core.windows.net/wslblob/wsl_update_x64.msi)
2. 下载 `.msi` 文件
3. 双击运行安装

### Step 6：安装指定发行版

```powershell
# 查看可用发行版列表
wsl --list --online

# 输出示例（节选）：
# NAME                FRIENDLY NAME
# Ubuntu              Ubuntu
# Debian              Debian GNU/Linux
# kali-linux          Kali Linux Rolling
# ...
# SLES-15             SUSE Linux Enterprise Server 15 SP4
# Ubuntu-22.04        Ubuntu 22.04 LTS
# Ubuntu-24.04        Ubuntu 24.04 LTS

# 安装你想要的发行版
wsl --install -d Ubuntu-24.04
```

---

## 安装后必做的 5 件事

### ✅ 1. 更换国内镜像源（国内用户必做）

```bash
# 备份原始源
sudo cp /etc/apt/sources.list /etc/apt/sources.list.bak

# 替换为阿里云镜像（以 Ubuntu 24.04 为例）
sudo sed -i 's/archive.ubuntu.com/mirrors.aliyun.com/g' /etc/apt/sources.list
sudo sed -i 's/security.ubuntu.com/mirrors.aliyun.com/g' /etc/apt/sources.list

# 生效
sudo apt update
```

> 💡 换完后下载速度从几十 KB/s 飙升到几 MB/s！

### ✅ 2. 安装常用基础工具

```bash
sudo apt install -y \
    git curl wget vim tree htop jq unzip zip \
    ca-certificates software-properties-common
```

### ✅ 3. 安装 Windows Terminal（强烈推荐）

```powershell
# Microsoft Store 搜索 "Windows Terminal"
# 或用命令行安装：
winget install Microsoft.WindowsTerminal
```

**为什么需要？**
- 多标签页同时开多个终端
- GPU 加速字体渲染更清晰
- 支持分屏、自定义主题和快捷键
- 直接看到所有 WSL 发行版的入口

### ✅ 4. 配置 Git 用户信息

```bash
git config --global user.name "Your Name"
git config --global user.email "you@example.com"
git config --global init.defaultBranch main
git config --global core.autocrlf input    # 重要！避免换行符混乱
```

### ✅ 5. 创建软链接方便访问 Windows 目录

```bash
# 创建快捷方式
ln -s /mnt/c/Users/$(whoami)/Desktop ~/Desktop
ln -s /mnt/c/Users/$(whoami)/Documents ~/Docs

# 以后直接 cd ~/Desktop 就能到 Windows 桌面了
```

---

## 不同发行版的安装命令速查

| 你想要的 | 一行命令 |
|:---|:---|
| **Ubuntu 最新版** | `wsl --install -d Ubuntu-24.04` |
| **Ubuntu 22.04 LTS** | `wsl --install -d Ubuntu-22.04` |
| **Debian 12** | `wsl --install -d Debian` |
| **Fedora** | `wsl --install -d Fedora` |
| **Kali Linux** | `wsl --install -d kali-linux` |
| **openSUSE Leap** | `wsl --install -d openSUSE-Leap-15.6` |
| **查看全部可选** | `wsl --list --online` |

---

## 常见安装问题 FAQ

### ❌ 问题："虚拟化未启用"

**症状**：安装时提示 VT-x 未启用或类似错误。

**解决**：
1. 重启电脑，按 `Del` / `F2` / `F12` 进入 BIOS
2. 找到以下选项之一设为 **Enabled**：
   - Intel: `VT-x` 或 `Intel Virtualization Technology`
   - AMD: `SVM Mode` 或 `AMD-V`
3. 保存退出，重启后再试

### ❌ 问题："0x800701bc 错误"

**症状**：安装发行版后无法启动，提示此错误码。

**原因**：WSL 2 内核没有正确安装。

**解决**：
```powershell
# 更新 WSL 内核
wsl --update
# 然后重启
wsl --shutdown
```

### ❌ 问题："Microsoft Store 无法访问"

**症状**：网络限制导致 Store 打不开。

**解决**：使用**方式一**或**方式三**（PowerShell 命令行安装）即可绕过 Store。

### ❌ 问题："正在安装" 卡住不动

**症状**：Ubuntu 显示 Installing 很久没反应。

**解决**：
1. 检查网络连接
2. 尝试关闭代理/VPN 后重试
3. 关闭后重新打开 Ubuntu
4. 如果还不行，`wsl --shutdown` 后重新尝试

---

## 安装完成验证清单

装完之后，跑一遍这个快速检查：

```bash
echo "=== 1. WSL 版本 ==="
wsl --version 2>/dev/null || uname -r

echo ""
echo "=== 2. 系统信息 ==="
cat /etc/os-release | grep -E "^(NAME|VERSION)"

echo ""
echo "=== 3. 磁盘空间 ==="
df -h /

echo ""
echo "=== 4. 内存情况 ==="
free -h

echo ""
echo "=== 5. 网络连通性 ==="
ping -c 2 baidu.com && echo "✅ 网络正常" || echo "❌ 网络异常"

echo ""
echo "🎉 检查完成！以上都显示正常就说明安装成功啦！"
```

---

## 下期预告

下一篇：**《WSL 新手第一课：终端不慌，这 15 个命令够用半年》**

- 📂 目录导航与文件管理
- 📝 文件查看与编辑
- 🔍 搜索与查找
- ⚡ 权限管理与管道操作
- 💡 实用快捷键与技巧

---

> **💡 装好了吗？点个"在看"，我们下篇继续！**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
>
> 💬 安装过程中遇到问题？评论区留言帮你解答！
