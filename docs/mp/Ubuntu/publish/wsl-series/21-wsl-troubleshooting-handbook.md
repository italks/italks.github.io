# WSL 十大常见问题排查手册（附解决方案）

> **阅读时长**：约 12 分钟 | **难度等级**：⭐⭐☆☆☆ 实用参考
> **本篇关键词**：WSL / 故障排查 / FAQ / 问题解决 / 常见错误
>
> 收集了 WSL 使用中最高频出现的 10 大类问题，每个都有清晰的诊断步骤和解决方案。建议收藏备用，遇到问题时直接翻阅。

---

## 排查方法论

```
WSL 问题通用排查四步法：

① 重启大法
   wsl --shutdown → 重新打开

② 检查版本
   wsl --version（保持最新！）
   wsl --update（有更新就升级）

③ 查日志
   dmesg | tail -20          # 内核日志
   journalctl -xe            # 系统服务日志
   /var/log/syslog           # 系统日志

④ 搜索官方 Issue
   github.com/microsoft/WSL/issues
   （大概率别人已经遇到过并解决了）
```

---

## ❌ 问题一：WSL 无法启动 / 卡在 "Installing"

### 症状
打开 Ubuntu 后一直显示 `Installing, this may take a few minutes...` 或无任何响应。

### 解决方案（按顺序尝试）

```powershell
# 方法 1：完全重启 WSL
wsl --shutdown
# 然后重新打开

# 方法 2：更新 WSL 版本
wsl --update
wsl --shutdown

# 方法 3：重置 LxssManager 服务
net stop LxssManager && net start LxssManager

# 方法 4：重新注册发行版（最后手段，数据会丢失！先备份）
wsl --list -v                    # 确认名称
wsl --export Ubuntu-24.04 D:\backup\u.tar   # 先备份！
wsl --unregister Ubuntu-24.04    # 注销
wsl --import Ubuntu-24.04 D:\WSL\U D:\backup\u.tar  # 导入恢复

# 方法 5：重装整个 WSL
# 设置 → 应用 → 可选功能 → 卸载"适用于 Linux 的 Windows 子系统"
# 然后重新 wsl --install
```

---

## ❌ 问题二：网络无法连接 / DNS 解析失败

### 症状
`ping baidu.com` 不通；`apt update` 报错 "Temporary failure resolving"；浏览器打不开网页。

### 诊断步骤

```bash
# 1. 检查能否 ping 通 IP（排除 DNS 问题）
ping -c 2 8.8.8.8        # 通 = DNS 问题；不通 = 网络问题

# 2. 检查 DNS 配置
cat /etc/resolv.conf
# 正常应包含 nameserver 条目

# 3. 检查网络接口
ip addr show eth0       # 应有 inet 地址
```

### 解决方案

```bash
# 方案 A：手动指定 DNS（最常用 ✅✅✅）
sudo rm -f /etc/resolv.conf
sudo bash -c 'echo "nameserver 8.8.8.8" > /etc/resolv.conf'
sudo bash -c 'echo "nameserver 114.114.114.114" >> /etc/resolv.conf'
sudo chattr +i /etc/resolv.conf   # 锁定防止被覆盖

# 方案 B：使用 Mirrored 网络模式的 DNS Tunneling
# .wslconfig 中设置：
# [wsl2]
# networkingMode=mirrored
# dnsTunneling=true

# 方案 C：重启网络服务
sudo service network-manager restart
# 或
sudo systemctl restart systemd-networkd
sudo systemctl restart resolvconf
```

---

## ❌ 问题三：Git 操作极慢

### 症状
在 WSL 中执行 `git status`、`git clone`、`npm install` 等操作非常慢。

### 根因分析

```bash
# 确认项目位置：
pwd
# 如果输出包含 /mnt/c/ 或 /mnt/d/ → 这就是问题所在！

# 跨文件系统 I/O 是性能杀手（详见第 4 篇文章）
# /mnt/c/ 上的操作比 ~/ 慢 5-30 倍
```

### 解决方案

```bash
# 把项目移到 Linux 文件系统内！
cp -r /mnt/c/Users/name/project/* ~/project/
cd ~/project

# 验证速度提升
git status      # 应该秒级响应 ✅
```

> 🎯 **黄金法则**：代码仓库、node_modules、venv、.git 目录——永远不要放在 `/mnt/` 下。

---

## ❌ 问题四：VS Code Remote 连接失败

### 症状
提示 "Cannot connect to WSL"、"Connection reset"、"The VS Code Server failed to start" 等。

### 解决方案

```powershell
# Step 1: 更新 Remote 扩展
# VS Code → 扩展面板 → Remote - WSL → 检查更新

# Step 2: 重启 WSL
wsl --shutdown

# Step 3: 清理旧的 server 并重建
# 在 WSL 中执行：
rm -rf ~/.vscode-server     # 删除旧 server 数据
rm -rf ~/.vscode-remote     # 也清理这个

# Step 4: 重新连接
# VS Code 中 Ctrl+Shift+P → Remote-WSL: Connect to WSL
# 会自动安装新的 server

# Step 5: 检查磁盘空间
df -h ~                     # 确保有空间安装 server

# Step 6: 如果还是不行，完全重装扩展
# VS Code → 扩展 → Remote-WSL → 卸载 → 重启 VS Code → 重新安装
```

---

## ❌ 问题五：C 盘空间被大量占用

### 症状
C 盘可用空间越来越少，发现 `ext4.vhdx` 占了几十 GB。

### 诊断

```powershell
# 查看 vhdx 文件大小
Get-ChildItem "$env:LOCALAPPDATA\Packages\*\LocalState\ext4.vhpx" |
    ForEach-Object { Write-Host $_.FullName ([math]::Round($_.Length/1GB, 2))"GB" }
```

### 解决方案

```bash
# 1. WSL 内部清理
sudo apt clean && sudo apt autoremove -y
pip cache purge && npm cache clean --force
docker system prune -a              # 如使用 Docker
du -sh ~/* 2>/dev/null | sort -hr | head -10  # 找出大目录

# 2. 压缩 vhdx（PowerShell 管理员）
wsl --shutdown
diskpart
# diskpak 中依次执行:
select vdisk file="你的 ext4.vhdx 完整路径"
compact vdisk
exit

# 3. 迁移到 D 盘（释放 C 盘！）
wsl --export Ubuntu-24.04 D:\backup\u.tar
wsl --unregister Ubuntu-24.04        # C 盘空间立即释放
wsl --import Ubuntu-24.04 D:\WSL\U D:\backup\u.tar
```

---

## ❌ 问题六：内存占用过高导致电脑卡顿

### 症状
任务管理器显示 `Vmmem` 进程占用大量内存（可能 4-8GB），电脑明显变卡。

### 解决方案

```ini
# 编辑 C:\Users\<你>\.wslconfig
[wsl2]
memory=4GB         # 根据实际情况调整
processors=4       # 减少核心数
swap=2GB
vmIdleTimeout=-1
```

```powershell
# 生效
wsl --shutdown
```

```bash
# 同时检查是否有内存密集型服务在运行
ps aux --sort=-%mem | head -15
# 关闭不需要的服务
sudo systemctl stop docker        # 如果不用 Docker
```

---

## ❌ 问题七：端口被占用 / localhost 无法访问

### 症状
WSL 中启动了 Web 服务（如 `python3 -m http.server 8080`），但 Windows 浏览器打不开 `localhost:8080`。

### 解决方案

```powershell
# 方法 A：确认使用 Mirrored 网络模式（推荐）
# .wslconfig:
[wsl2]
networkingMode=mirrored
localhostForwarding=true

# 方法 B：NAT 模式下检查自动转发是否生效
netstat -an | findstr :8080
# 应看到 0.0.0.0:8080 在 LISTENING

# 方法 C：手动添加转发（如果上述都不行）
netsh interface portproxy add v4tov4 `
    listenport=8080 listenaddress=0.0.0.0 `
    connectport=8080 connectaddress=$(wsl hostname -I)

# 方法 D：防火墙放行
New-NetFirewallRule -DisplayName "WSL Port 8080" `
    -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow
```

---

## ❌ 问题八：文件权限错误 (Permission denied)

### 症状
操作 `/mnt/c/` 下的文件时提示 `Permission denied` 或权限不足。

### 解决方案

```bash
# 方案 A：配置 wsl.conf 挂载选项
sudo tee -a /etc/wsl.conf << 'EOF'
[automount]
enabled = true
options = "metadata,uid=1000,gid=1000,umask=0022"
EOF

# PowerShell 中重启 WSL 使生效
wsl --shutdown

# 方案 B：修改文件所有权
sudo chown -R $USER:$USER /mnt/c/path/to/folder

# 方案 C：避免在 WSL 中修改 Windows 系统文件
# 不要尝试编辑 C:\Windows, C:\Program Files 等系统目录
```

---

## ❌ 问题九：systemd 服务不运行

### 症状
`sudo systemctl start mysql` 提示 `System has not been booted with systemd.` 或 `Failed to connect to bus: No such file or directory`。

### 解决方案

```bash
# 检查配置
cat /etc/wsl.conf
# 必须包含以下内容：

[boot]
systemd=true

# 如果没有就加上去，然后：
# PowerShell → wsl --shutdown → 重新打开 Ubuntu

# 验证
systemctl is-system-running
# 输出 running 就对了 ✅
```

> ⚠️ 需要 **WSL 版本 ≥ 0.67.2**

---

## ❌ 问题十：Docker Desktop 连接 WSL 失败

### 症状
Docker Desktop 的 Settings → Resources → WSL Integration 中看不到发行版选项，或 Docker 命令报错。

### 解决方案

```powershell
# 1. 确认 WSL 后端已启用
# Docker Desktop → Settings → General:
# ☑️ Use the WSL 2 based engine

# 2. 确认发行版是 WSL 2
wsl --list -v
# VERSION 列必须显示为 2
# 如果是 1，转换它：
wsl --set-version Ubuntu-24.04 2

# 3. 重启 Docker Desktop
# 右键托盘图标 → Restart

# 4. 重新勾选集成
# Settings → Resources → WSL Integration:
# ☑️ Enable integration with my default WSL distro
# ☑️ Ubuntu-24.04

# 5. WSL 中验证
docker --version
docker run hello-world
```

---

## 快速索引表

| 症状 | 关键词 | 首选解决方案 |
|:---|:---|:---|
| 启动卡住 | Installing / 无响应 | `wsl --shutdown` |
| 网络不通 | DNS / ping 失败 | 改 resolv.conf 或 mirrored 模式 |
| Git/npm 慢 | 性能 | **把项目移到 `~/`** |
| VS Code 连不上 | Cannot connect | 清 `.vscode-server` |
| C 盘满了 | 磁盘空间 | compact vhdx 或迁移到 D 盘 |
| 内存过高 | Vmmem / 卡顿 | `.wslconfig` 限制 memory |
| 端口不通 | localhost | mirrored 模式或手动转发 |
| 权限拒绝 | Permission denied | wsl.conf 加 metadata |
| systemd 失败 | not booted with systemd | `/etc/wsl.conf` 加 `systemd=true` |
| Docker 失败 | WSL Integration | 确认 WSL 2 后端 + 重启 DD |

---

## 终极手段：完全重装

如果以上所有方法都无效，最后的办法：

```powershell
# 1. 备份数据（重要！）
wsl --export Ubuntu-24.04 D:\backup\last-resort.tar

# 2. 注销所有发行版
wsl --list -v | Select-String -NotMatch "NAME" | ForEach-Object {
    wsl --unregister $_.ToString().Trim()
}

# 3. 卸载 WSL
# 设置 → 应用 → 可选功能 → 
#   取消勾选 "适用于 Linux 的 Windows 子系统"
#   取消勾选 "虚拟机平台"
#   重启电脑

# 4. 重新安装
wsl --install

# 5. 恢复数据
wsl --import Ubuntu-24.04 D:\WSL\U D:\backup\last-resort.tar
```

---

## 下期预告

下一篇：**《Dev Container：团队统一开发环境的终极方案》**

- 📦 devcontainer.json 编写指南
- 🔧 预装依赖与工具链
- 🐳 多容器编排
- 🔄 CI/CD 集成
- 👥 团队协作最佳实践

---

> **💡 这个排查手册值得收藏！遇到问题时直接翻。**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
>
> 💬 你还遇到过哪些 WSL 奇葩问题？评论区补充！
