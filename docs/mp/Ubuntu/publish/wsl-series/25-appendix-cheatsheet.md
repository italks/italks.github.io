# WSL 常用命令速查表 + 配置模板大全（附录）

> **阅读时长**：约 10 分钟 | **难度等级**：⭐☆☆☆☆ 参考速查
> **本篇关键词**：WSL / 速查表 / 命令参考 / 配置模板 / 附录
>
> 25 篇系列教程的终极附录——把所有核心命令、配置文件、快捷键浓缩成一份速查卡片。建议收藏或打印，随时翻阅。

---

## 一、WSL 核心命令速查

### 基础管理

| 命令 | 说明 |
|:---|:---|
| `wsl --install` | 一键安装 WSL + 默认发行版 |
| `wsl --install -d <发行版>` | 安装指定发行版 |
| `wsl --list -v` 或 `wsl -l -v` | 列出所有发行版及状态 |
| `wsl --list --online` | 查看可安装的发行版列表 |
| `wsl --set-default <发行版>` | 设置默认发行版 |
| `wsl --set-default-version <1/2>` | 设默认 WSL 版本 |
| `wsl` 或 `wsl <发行版>` | 启动交互式 Shell |
| `wsl -d <发行版> -- <命令>` | 执行单条命令（不进入Shell）|
| `wsl --shutdown` | 关闭所有 WSL 实例 |
| `wsl --terminate <发行版>` | 终止指定实例 |
| `wsl --unregister <发行版>` | 卸载发行版 ⚠️ |
| `wsl --export <D> <路径>` | 导出备份为 tar 文件 |
| `wsl --import <D> <位置> <tar>` | 导入恢复 |
| `wsl --update` | 更新 WSL 内核版本 |
| `wsl --version` | 查看当前版本 |

### 运行与执行

```bash
# 启动默认发行版
wsl

# 启动指定发行版
wsl -d Ubuntu-24.04

# 直接执行命令
wsl -d Ubuntu-24.04 -- ls -la ~
wsl -d Debian -- cat /etc/os-release

# 在 PowerShell 中调用 WSL 工具
wsl grep "error" app.log
wsl python3 script.py
wsl docker ps
```

---

## 二、Linux 常用命令速查

### 目录与文件

```bash
pwd                          # 当前目录
cd ~/projects                # 切换目录
cd ..                        # 上级目录
cd -                         # 上一个目录
ls -la                       # 详细列表（含隐藏）
tree -L 2                    # 树状显示（2层深）
```

### 文件操作

```bash
touch file.txt               # 创建空文件
cat file.txt                 # 查看内容
less big.log                 # 分页浏览大文件
head -20 file.txt            # 前20行
tail -f app.log              # 实时追踪日志
cp src dest                   # 复制
mv old new                    # 重命名/移动
rm file                      # 删除
rm -rf dir/                  # 强制删除目录
mkdir -p a/b/c               # 递建目录
find . -name "*.py"          # 查找Python文件
du -sh *                     # 目录大小排序
```

### 搜索与文本处理

```bash
grep "error" log.txt         # 搜索关键词
grep -rn "TODO" ./src/       # 递归搜索
grep -C 5 "Exception" log    # 显示上下文5行
awk '{print $1}' data.txt     # 提取第1列
sort file.txt                # 排序
uniq -c                      # 去重计数
wc -l file.txt               # 行数统计
diff file1 file2             # 对比差异
```

### 系统信息

```bash
free -h                      # 内存使用
df -h /                      # 磁盘使用
htop                         # 进程监控（需安装）
nproc                        # CPU核数
uname -a                     # 系统信息
cat /etc/os-release          # 发行版信息
ip addr show eth0             # IP地址
ss -tlnp                     # 端口监听
uptime                       # 运行时间
```

### 权限与用户

```bash
chmod +x script.sh           # 添加执行权限
chmod 644 file.txt           # rw-r--r--
chown user:group file        # 改所有者
sudo -i                      # 切换root用户
whoami                       # 当前用户
id                           # 用户ID信息
```

---

## 三、开发工具链速查

### Git

```bash
git init                      # 初始化仓库
git clone <url>              # 克隆
git status                   # 状态
git add .                    # 暂存全部
git commit -m "msg"          # 提交
git push                     # 推送
git pull                     # 拉取
git branch -a                # 所有分支
git checkout -b feature      # 新建并切换分支
git merge main               # 合并分支
git log --oneline -10        # 最近10次提交
git diff                      # 未暂存差异
git stash                     # 暂存修改
```

### Python

```bash
python3 -m venv .venv        # 创建虚拟环境
source .venv/bin/activate    # 激活
pip install <pkg>            # 安装包
pip freeze > reqs.txt         # 导出依赖
uv init myproj               # uv 快速初始化
jupyter lab                  # Notebook
pytest -v                    # 测试
black .                      # 格式化代码
ruff check .                 # 代码检查
```

### Node.js

```bash
fnm install --lts            # 安装LTS版
fnm use 20                   # 切换版本
pnpm install                 # 安装依赖
pnpm dev                     # 开发模式
pnpm build                   # 构建
npm outdated                  # 检查过期包
```

### Docker

```bash
docker ps                    # 运行中的容器
docker images                # 镜像列表
docker run -it ubuntu bash   # 交互运行
docker exec -it <id> bash    # 进入容器
docker logs -f <id>          # 日志跟踪
docker compose up -d          # 编排启动
docker compose down           # 编排停止
docker system prune -a       # 清理空间
```

---

## 四、配置文件模板合集

### .wslconfig（Windows 端）

```ini
# C:\Users\<你>\.wslconfig
[wsl2]
memory=8GB
swap=4GB
swapfile=D:\\wsl-swap.swap
processors=6
networkingMode=mirrored
dnsTunneling=true
autoProxy=true
firewall=true
vmIdleTimeout=-1
```

### /etc/wsl.conf（WSL 内部）

```ini
# /etc/wslconf
[boot]
systemd=true

[automount]
enabled = true
options = "metadata,uid=1000,gid=1000,umask=022"
root = /

[network]
generateHosts = false
generateResolvConf = true
```

### ~/.bashrc（常用别名）

```bash
# ===== 别名 =====
alias ll='ls -alF'
alias la='ls -A'
alias ..='cd ..'
alias gs='git status'
alias gl='git log --oneline -10'
alias gd='git diff'
alias ga='git add'
alias gc='git commit -m'
alias gp='git push'
alias dc='docker compose'
alias dps='docker ps --format "table {{.Names}}\t{{.Status}}"'

# ===== 路径快捷方式 =====
ln -sf /mnt/c/Users/$(whoami)/Desktop ~/Desktop
ln -sf /mnt/c/Users/$(whoami)/Documents ~/Docs

# ===== 开发函数 =====
gnb() { git checkout -b "feature/$1" && git push -u origin "feature/$1"; }
gci() { git add -A && git commit -m "$*"; }
```

### VS Code settings.json（WSL Remote）

```json
{
    "editor.formatOnSave": true,
    "files.eol": "\n",
    "files.trimTrailingWhitespace": true,
    "[python]": {
        "editor.defaultFormatter": "ms-python.black-formatter",
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
            "source.organizeImports": "explicit"
        }
    },
    "remote.WSL.fileWatcher.polling": true,
    "terminal.integrated.defaultProfile.linux": "bash",
    "workbench.colorTheme": "One Dark Pro"
}
```

### Windows Terminal settings.json

```json
{
    "profiles": {
        "defaults": {
            "font": {"face": "JetBrainsMono Nerd Font", "size": 13},
            "colorScheme": "One Half Dark",
            "acrylicOpacity": 0.92,
            "useAcrylic": true,
            "padding": "10,8,10,8"
        }
    },
    "schemes": [
        {"name": "One Half Dark", "background": "#282c34", 
         "foreground": "#abb2bf", "black": "#282c34",
         "blue": "#61afef", "green": "#98c379", "red": "#e06c75"}
    ]
}
```

---

## 五、网络与端口速查

### Mirrored 模式（Win11 推荐）

```ini
[wsl2]
networkingMode=mirrored    # 共享网络栈
dnsTunneling=true          # DNS 通过 Windows
autoProxy=true             # 自动代理
firewall=true              # 防火墙隔离
```

### NAT 模式端口转发

```powershell
# 手动添加转发规则
netsh interface portproxy add v4tov4 `
    listenport=8080 listenaddress=0.0.0.0.0 `
    connectport=8080 connectaddress=$(wsl hostname -I)

# 查看规则
netsh interface portproxy show all
```

### 防火墙放行

```powershell
New-NetFirewallRule -DisplayName "WSL Dev" `
    -Direction Inbound -Protocol TCP -LocalPort 3000,5000,8000 `
    -Action Allow
```

---

## 六、故障排查速查

| 问题 | 首选解决方案 |
|:---|:---|
| 无法启动 | `wsl --shutdown` → 重开 |
| 网络不通 | 改 `/etc/resolv.conf` DNS 或用 mirrored |
| Git/npm 慢 | **项目移到 `~/`**（最重要！）|
| VS Code连不上 | 清 `~/.vscode-server` 重连 |
| C盘满了 | compact vhdx 或迁移到D盘 |
| 内存过高 | `.wslconfig` 限制 memory |
| 端口不通 | mirrored模式或手动转发 |
| 权限错误 | wsl.conf 加 `metadata` |
| systemd失败 | 加 `[boot] systemd=true` |
| Docker失败 | 确认WSL 2后端+重启DD |

---

## 七、学习路线回顾

```
零基础 ──→ 入门篇(01-06) ──→ 实战篇(07-12)
                              │
                              ↓
                         进阶篇(13-18)
                              │
                              ↓
                         高手篇(19-24)
                              │
                              ↓
                         🎉 WSL 大师！
```

**恭喜你完成了整个系列的学习！** 🎊🐧

---

> **💡 这份速查表建议收藏，随时翻阅！**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
>
> ❤️ 感谢一路相伴，我们下个系列见！
