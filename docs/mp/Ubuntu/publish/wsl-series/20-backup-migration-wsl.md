# WSL 备份与迁移：换电脑不丢环境的完整方案

> **阅读时长**：约 11 分钟 | **难度等级**：⭐⭐⭐☆☆ 进阶实战
> **本篇关键词**：WSL / 备份 / 迁移 / 环境重建 / wsl --export
>
> 花了几天配置好的 WSL 开发环境，换电脑时怎么完整搬过去？这篇给你一套从备份到迁移的完整方案，让你永不丢失劳动成果。

---

## 为什么需要备份和迁移？

```
你可能遇到的情况：
💻 换新电脑 → 要把整个开发环境搬过去
🔄 重装系统 → 不想从头配置一遍
📦 团队共享 → 让同事复刻相同的环境
🛡️ 数据安全 → 防止误操作丢失数据
🧪 实验环境 → 保存特定状态的快照用于测试
```

---

## 核心命令：wsl --export / --import

### 基本语法

```powershell
# 导出（备份）
wsl --export <发行版名称> <输出文件路径>

# 导入（恢复/迁移）
wsl --import <新发行版名称> <安装位置> <tar文件路径>
```

### 完整示例

```powershell
# ===== 备份（导出）=====
wsl --shutdown                          # 先关闭所有实例
wsl --export Ubuntu-24.04 D:\backup\ubuntu2404-full.tar
# 输出: 正在导出中，这可能需要几分钟...
# 完成后 D:\backup\ 下会生成 tar 文件

# ===== 恢复（导入）到新位置 =====
wsl --import MyUbuntu D:\WSL\MyUbuntu D:\backup\ubuntu2404-full.tar
# 完成！现在可以通过 wsl -d MyUbuntu 使用了

# ===== 验证 =====
wsl --list -v
# 应该能看到 MyUbuntu 在列表中
```

> ⚠️ **重要提示**：
> - `--export` 会包含发行版内的**所有内容**：用户数据、安装的软件、配置文件、项目代码等
> - 文件大小取决于你安装了多少东西，通常 1-10GB+
> - `--unregister` 会**彻底删除**原发行版，请确认已备份！

---

## 自动化备份脚本

### Windows 端定时备份（PowerShell）

```powershell
# save as C:\Scripts\wsl-backup.ps1
param(
    [string]$BackupRoot = "D:\WSL-Backups",
    [string[]]$Distros = @("Ubuntu-24.04", "Debian")
)

$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupDir = Join-Path $BackupRoot $Timestamp
New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null

Write-Host "📦 开始 WSL 备份 → $BackupDir" -ForegroundColor Cyan

# 关闭所有 WSL 实例
Write-Host "⏹️  关闭 WSL..." -ForegroundColor Yellow
wsl --shutdown
Start-Sleep -Seconds 5

foreach ($Distro in $Distros) {
    $TarFile = Join-Path $BackupDir "$Distro.tar"
    Write-Host "📥 正在备份 $Distro ..." -ForegroundColor Green
    
    try {
        wsl --export $Distro $TarFile
        $SizeMB = [math]::Round((Get-Item $TarFile).Length / 1MB, 1)
        Write-Host "   ✅ 完成！大小: ${SizeMB} MB" -ForegroundColor Green
        
        # 只保留最近 3 个备份
        $OldBackups = Get-ChildItem "$BackupRoot\*\$Distro.tar" -ErrorAction SilentlyContinue |
            Sort-Object LastWriteTime -Descending | Select-Object -Skip 3
        foreach ($Old in $OldBackups) {
            Remove-Item $Old.FullName -Force
            Write-Host "   🗑️  已清理旧备份: $($Old.Name)" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "   ❌ 备份失败: $_" -ForegroundColor Red
    }
}

# 同时导出 .wslconfig 配置
Copy-Item "$env:USERPROFILE\.wslconfig" "$BackupDir\wslconfig.backup" -ErrorAction SilentlyContinue

Write-Host "`n🎉 备份完成！位置: $BackupDir" -ForegroundColor Cyan
(Get-ChildItem $BackupDir | ForEach-Object { "{0} ({1:N0} MB)" -f $_.Name, ($_.Length/1MB) })
```

### 设置 Windows 定时任务自动执行

```powershell
# 每周日凌晨 2 点自动备份
$action = New-ScheduledTaskAction -Execute "powershell.exe" `
    -Argument "-ExecutionPolicy Bypass -File C:\Scripts\wsl-backup.ps1"
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 2am
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName "WSL Weekly Backup" `
    -Action $action -Trigger $trigger -Settings $settings -Description "WSL 自动备份任务"
```

---

## Dotfiles 统一管理（轻量级方案）

如果你不想每次都完整导出导入（tar 文件太大），可以用 dotfiles 方式只管理配置：

### 什么是 Dotfiles？

```
以 . 开头的隐藏配置文件：
~/.bashrc          # Shell 配置
~/.vimrc           # Vim 配置
~/.gitconfig       # Git 配置
~/.ssh/            # SSH 密钥
~/.config/         # 应用程序配置
~/.wslconf         # WSL 内部配置
```

### 用 Git 管理 Dotfiles

```bash
# 创建裸仓库管理 dotfiles
git init --bare $HOME/.cfg
alias config='/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME'

# 首次添加所有配置
config add ~/.bashrc ~/.vimrc ~/.gitconfig ~/.wslconf ~/.config/
config commit -m "initial dotfiles backup"
# 推送到 GitHub/GitLab
config remote add origin git@github.com:user/dotfiles.git
config push -u origin main
```

### 新机器一键恢复

```bash
# 克隆配置仓库
git init --bare $HOME/.cfg
alias config='/usr/bin/git --git-dir=$HOME/.cfg/ --work-tree=$HOME'
config remote add origin git@github.com:user/dotfiles.git
config pull origin main

# 安装基础工具后，配置就全部恢复了
sudo apt update && sudo apt install -y $(cat ~/packages.txt)
```

---

## 完整环境迁移清单

### 从 A 电脑迁移到 B 电脑

```
═════════════════════════════════════
     WSL 环境迁移检查清单
═════════════════════════════════════

【A 电脑 — 备份阶段】
□ 1. 导出 WSL 发行版: wsl --export > backup.tar
□ 2. 备份 .wslconfig 文件
□ 3. 备份 SSH 密钥（如需要）
□ 4. 记录已安装的主要软件包列表
□ 5. 记录自定义的 Shell 别名和函数
□ 6. 备份 Docker 镜像和数据卷（可选）
□ 7. 备份数据库数据（如有重要数据）

【B 电脑 — 恢复阶段】
□ 8. 安装 WSL: wsl --install
□ 9. 安装 Windows Terminal
□ 10. 复制 .wslconfig 到用户目录
□ 11. 导入发行版: wsl --import
□ 12. 启动并验证: wsl -d <名称>
□ 13. 更换国内镜像源
□ 14. 更新系统: apt update && apt upgrade
□ 15. 安装 Nerd Font 字体
□ 16. 安装 VS Code + Remote-WSL 扩展
□ 17. 安装 Docker Desktop 并配置 WSL 后端
□ 18. 测试 Git、SSH 连接
□ 19. 验证 Python/Node.js/Go 环境
□ 20. 启动数据库服务并验证连接

【验证阶段】
□ 21. 运行项目确认一切正常
□ 22. Git push/pull 测试通过
□ 23. Docker 构建运行正常
□ 24. GPU 可用（如有 AI 需求）
```

### 一键环境恢复脚本

```bash
#!/bin/bash
# save as ~/setup-new-env.sh
set -e
echo "🚀 WSL 新环境初始化脚本"

echo "📦 [1/6] 更新系统..."
sudo apt update && sudo apt upgrade -y

echo "🔧 [2/6] 安装基础工具..."
sudo apt install -y git curl wget vim tree htop jq unzip zip \
    ca-certificates gnupg lsb-release software-properties-common \
    build-essential python3-pip python3-venv python3-dev

echo "🤖 [3/6] 安装 Oh My Posh..."
wget https://github.com/JanDeDobbeleer/oh-my-posh/releases/latest/download/posh-linux-amd64 \
    -O /usr/local/bin/oh-my-posh && chmod +x /usr/local/bin/oh-my-posh

echo "🐍 [4/6] Python 工具链..."
pip install --upgrade pip uv ruff black mypy pytest httpie

echo "🔑 [5/6] 配置 Git..."
if [ ! -f ~/.gitconfig ]; then
    read -p "Git 用户名: " GIT_NAME
    read -p "Git 邮箱: " GIT_EMAIL
    git config --global user.name "$GIT_NAME"
    git config --global user.email "$GIT_EMAIL"
    git config --global core.autocrlf input
fi

echo "✅ [6/6] 全部完成！"
echo ""
echo "接下来手动安装:"
echo "  · Node.js (fnm)"
echo "  · Go (官方安装包)"
echo "  · Rust (rustup)"
echo "  · Docker Desktop"
echo "  · VS Code 扩展"
```

---

## 多机同步进阶方案

| 方案 | 适用场景 | 工具 |
|:---|:---|:---|
| **完整备份** | 换电脑/重装 | `wsl --export` / `--import` |
| **Dotfiles** | 配置同步 | Git 裸仓库 + stow |
| **容器化** | 团队统一环境 | DevContainer / Dockerfile |
| **云同步** | 跨设备小文件 | OneDrive/Dropbox 同步特定目录 |
| **脚本化** | 快速重建 | 一键 setup 脚本 |

---

## 下期预告

下一篇：**《WSL 十大常见问题排查手册（附解决方案）》**

- ❌ 安装失败与版本问题
- ❌ 网络不通与 DNS 解析
- ❌ VS Code Remote 连接故障
- ❌ 文件权限与磁盘空间
- ❌ 内存占用过高
- ❌ Docker / Git / SSH 问题汇总

---

> **💡 你有因为没备份而丢失过 WSL 配置吗？评论区说说惨痛经历！**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
