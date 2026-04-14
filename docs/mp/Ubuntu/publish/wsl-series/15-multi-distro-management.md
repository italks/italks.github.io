# 同时装 5 个 Linux 发行版？多发行版管理与切换技巧

> **阅读时长**：约 11 分钟 | **难度等级**：⭐⭐⭐☆☆ 进阶实战
> **本篇关键词**：WSL / 多发行版 / 发行版管理 / 备份 / WSL
>
> WSL 不止能装一个 Linux——你可以同时装 Ubuntu、Debian、Fedora、Kali 等多个发行版，每个独立运行、互不干扰。这篇教你高效管理它们。

---

## 为什么要用多发行版？

### 实际场景

```
场景一：学习与测试
├── Ubuntu 24.04    → 日常主力开发
├── Debian 12       → 测试软件在精简环境下的兼容性
├── Fedora          → 尝鲜最新技术（Wayland/PipeWire等）
└── Arch Linux      → 学习滚动更新和高度定制

场景二：不同用途隔离
├── Ubuntu (stable) → 正式项目开发
├── Ubuntu (test)   → 实验性代码测试
├── Kali Linux      → 安全渗透工具集
└── Alpine          → Docker 镜像构建测试

场景三：团队协作
├── 和同事用同一个发行版和版本
├── 避免"我的机器上能跑"问题
└── 统一开发环境
```

---

## 安装多个发行版

### 查看可用列表

```powershell
wsl --list --online
```

输出示例（节选）：
```
NAME                FRIENDLY NAME
Ubuntu              Ubuntu
Ubuntu-22.04        Ubuntu 22.04 LTS
Ubuntu-24.04        Ubuntu 24.04 LTS
Debian              Debian GNU/Linux
kali-linux          Kali Linux Rolling
Fedora              Fedora for Windows
...
openSUSE-Leap-15.6   openSUSE Leap 15.6
SLES-15             SUSE Linux Enterprise Server 15 SP4
```

### 批量安装

```powershell
# 安装多个发行版
wsl --install -d Ubuntu-24.04
wsl --install -d Debian
wsl --install -d kali-linux
wsl --install -d Fedora
wsl --install -d openSUSE-Leap-15.6
```

每个安装完成后都会要求你设置用户名和密码，逐一完成即可。

---

## 发行版管理核心命令

### 查看状态

```powershell
# 列出所有已安装的发行版及状态
wsl --list -v
# 或简写: wsl -l -v

# 输出示例：
#  NAME            STATE           VERSION
# * Ubuntu-24.04    Stopped         2
#   Debian          Running         2
#   kali-linux      Stopped         2
#   Fedora          Stopped         2

# * 号表示默认启动的发行版
# STATE: Running / Stopped / Installing
# VERSION: 1 或 2
```

### 运行与切换

```powershell
# 启动默认发行版
wsl

# 启动指定发行版
wsl -d Debian
wsl -d kali-linux

# 设置默认发行版
wsl --set-default Debian

# 在指定发行版中执行单条命令（不进入交互式 Shell）
wsl -d Ubuntu-24.04 -- ls -la ~
wsl -d Fedora -- cat /etc/os-release
wsl -d kali-linux -- nmap -sn 192.168.1.0/24
```

### 停止与终止

```powershell
# 关闭所有 WSL 实例
wsl --shutdown

# 终止指定发行版
wsl --terminate Ubuntu-24.04
wsl --terminate kali-linux

# 查看某个发行版的运行状态
wsl --list -v | findstr "Running"
```

### 卸载

```powershell
# 卸载指定发行版（数据会全部删除！）
wsl --unregister Ubuntu-24.04

# ⚠️ 此操作不可逆！请先备份重要数据
```

---

## 导入导出：备份与迁移

### 导出（备份）

```powershell
# 将发行版导出为 tar 文件
wsl --export Ubuntu-24.04 D:\backup\ubuntu2404-backup.tar
wsl --export Debian D:\backup\debian-backup.tar
wsl --export kali-linux D:\backup\kali-backup.tar
```

导出的是完整的文件系统快照，包含：
- ✅ 所有已安装的软件和配置
- ✅ 用户数据和项目代码
- ✅ 用户账号和权限
- ✅ 所有自定义设置

### 导入（恢复）

```bash
# 可以导入到任意位置！这是释放 C 盘的关键技巧
wsl --import MyUbuntu D:\WSL\MyUbuntu D:\backup\ubuntu2404-backup.tar
wsl --import MyDebian D:\WSL\MyDebian D:\backup\debian-backup.tar
```

> 💡 **关键优势**：通过 `--import` 可以把 WSL 发行版放到 **D 盘或其他磁盘**，彻底解决 C 盘空间不足的问题！

```powershell
# 验证导入成功
wsl --list -v
# 应该能看到 MyUbuntu, MyDebian 等

# 启动导入的发行版
wsl -d MyUbuntu
```

### 自动化备份脚本

```bash
#!/bin/bash
# save as ~/wsl-backup.sh
BACKUP_DIR="/mnt/d/wsl-backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
mkdir -p "$BACKUP_DIR"

DISTS=("Ubuntu-24.04" "Debian" "kali-linux")

for dist in "${DISTS[@]}"; do
    echo "📦 备份 $dist ..."
    wsl --export "$dist" "$BACKUP_DIR/${dist}_${TIMESTAMP}.tar"
    
    # 只保留最近 3 个备份（清理旧备份）
    ls -t "$BACKUP_DIR/${dist}_"*.tar 2>/dev/null | tail -n +4 | xargs rm -f
    
    echo "✅ $dist 备份完成"
done

echo "🎉 全部备份完成！位置: $BACKUP_DIR"
ls -lh "$BACKUP_DIR/"
```

---

## 自定义存储位置（C 盘救星）

### 问题：默认安装在 C 盘

WSL 发行版默认安装在：
```
C:\Users\<用户名>\AppData\Local\Packages\<发行版>\
```
随着使用时间增长，可能占用数十 GB。

### 解决方案：导入到其他磁盘

```powershell
# Step 1: 导出当前发行版
wsl --export Ubuntu-24.04 D:\backup\u2404.tar

# Step 2: 注销原发行版（释放 C 盘空间）
wsl --unregister Ubuntu-24.04

# Step 3: 导入到 D 盘
wsl --import Ubuntu-24.04 D:\WSL\Ubuntu D:\backup\u2404.tar

# 完成！现在 vhdx 文件在 D:\WSL\Ubuntu\ext4.vhdx
```

迁移后的目录结构：
```
D:\WSL\
├── Ubuntu\
│   └── ext4.vhdx         ← 虚拟磁盘在这里了！
├── Debian\
│   └── ext4.vhdx
└── Kali\
    └── ext4.vhdx
```

---

## 各发行版个性化配置

### 让每个发行版一眼就能区分

```bash
# Ubuntu (~/.bashrc) — 绿色主题
PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\w\$ '

# Debian (~/.bashrc) — 蓝色简洁
PS1='\[\033[01;34m\]\w \$ \[\033[00m\]'

# Kali Linux (~/.zshrc 或 ~/.bashrc) — 红色霸气
PS1='\[\033[01;31m\]┌─[\[\033[01;33m\]\u\[\033[01;31m\]]-[\[\033[01;36m\]\W\[\033[01;31m\]]\n└─▶ \[\033[00m\]'

# Fedora (.bashrc) — 紫色优雅
PS1='\[\033[01;35m\]\u@\h:\w\$ \[\033[00m\]'
```

### Oh My Posh 不同主题

```bash
# Ubuntu: atomic 主题
eval "$(oh-my-posh init bash --config $(oh-my-posh config get atomic))"

# Debian: paradox 主题（高级感）
eval "$(oh-my-posh init bash --config $(oh-my-posh config get paradox))"

# Kali: custom hacker 主题
eval "$(oh-my-posh init bash --config $(oh-my-posh config get custom/hacker))"
```

---

## Windows Terminal 配合多发行版

### 在侧边栏显示所有发行版

Windows Terminal 会自动检测到所有 WSL 发行版并添加到标签栏下拉菜单：

```
点击终端标题旁的下拉箭头 ▼
┌─────────────────────┐
│ Ubuntu-24.04        │  ← 点击直接打开新标签页
│ Debian               │
│ kali-linux           │
│ Fedora               │
│ PowerShell           │
│ Command Prompt       │
└─────────────────────┘
```

### 自定义各发行版的 Terminal 配置

```json
// settings.json 中为每个发行版定制外观
{
    "profiles": {
        "list": [
            {
                "name": "Ubuntu-24.04",
                "commandline": "wsl.exe -d Ubuntu-24.04",
                "icon": "\ue70c",
                "colorScheme": "One Half Dark",
                "startingDirectory": "//wsl$/Ubuntu-24.04/home/user"
            },
            {
                "name": "Debian",
                "commandline": "wsl.exe -d Debian", 
                "icon": "\ue70a",
                "colorScheme": "Monokai Night",
                "startingDirectory": "//wsl$/Debian/home/user"
            },
            {
                "name": "kali-linux",
                "commandline": "wsl.exe -d kali-linux",
                "icon": "\ud83d\udee1",  // 🗡️
                "colorScheme": "Red",
                "startingDirectory": "//wsl$/kali-linux/kali"
            }
        ]
    }
}
```

效果：每个发行版有独特的图标和配色方案，一目了然！

---

## 推荐的多发行版组合方案

| 方案 | 组合 | 适用人群 |
|:---|:---|:---|
| **极简派** | Ubuntu 24.04 + Debian | 只需要一个稳定+一个轻量 |
| **全能派** | Ubuntu + Debian + Fedora | 全栈开发者，需要覆盖红帽系 |
| **安全派** | Ubuntu + Kali Linux | 开发+渗透测试双需求 |
| **尝鲜派** | Ubuntu + Fedora + Arch | 技术爱好者，想体验不同生态 |
| **容器派** | Ubuntu + Alpine | 开发 + 极轻量镜像构建 |

---

## 下期预告

下一篇：**《让 WSL 开机自启：systemd 服务管理完全指南》**

- 🔧 启用 systemd 并验证
- 🛠️ 创建和管理自定义 Systemd 服务
- ⏰ Cron 定时任务配置
- 🔄 开机自启脚本与服务
- 📊 服务状态监控与日志

---

> **💡 你装了几个 Linux 发行版？都是用来做什么的？**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
