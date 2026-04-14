# WSL 基础操作与常用命令：文件、网络、GUI 全掌握

> **阅读时长**：约 20 分钟 | **难度等级**：⭐⭐☆☆☆ 入门进阶
>
> 掌握 WSL 日常操作的核心技能，让 Windows 和 Linux 无缝协作。

---

## 一、wsl.exe 命令完全指南

`wsl.exe` 是 Windows 端控制 WSL 的命令行工具，功能非常强大。以下按使用频率排序：

### 1.1 查看与管理发行版

```powershell
# 列出已安装的发行版（显示版本和运行状态）
wsl --list -v
# 输出示例：
#  NAME            STATE           VERSION
# * Ubuntu-24.04    Stopped         2
#   Debian          Running         2

# 查看 Microsoft Store 可用的发行版
wsl --list --online

# 设置默认启动的发行版
wsl --set-default Ubuntu-24.04

# 设置默认 WSL 版本（影响新安装的发行版）
wsl --set-default-version 2
```

### 1.2 运行与关闭

```powershell
# 启动默认发行版（进入交互式 Shell）
wsl

# 启动指定发行版
wsl -d Debian

# 直接执行一条 Linux 命令（不进入 Shell）
wsl ls -la ~
wsl cat /etc/os-release
wsl uname -a

# 在指定发行版中执行命令
wsl -d Ubuntu-24.04 -- python3 --version

# 关闭所有 WSL 实例（释放内存和 CPU 资源）
wsl --shutdown

# 终止指定发行版
wsl --terminate Ubuntu-24.04
```

> 💡 **技巧**：`wsl --shutdown` 非常有用！当 WSL 出现异常或需要释放内存时，一键全部关闭。

### 1.3 用户管理

```powershell
# 以指定用户身份运行（默认是创建时设置的用户）
wsl -u root -d Ubuntu-24.04
# 或
wsl --user root

# 导出完整发行版为备份文件
wsl --export Ubuntu-24.04 D:\backup\ubuntu2404.tar

# 从备份导入（可自定义安装位置！）
wsl --import MyUbuntu D:\WSL\MyUbuntu D:\backup\ubuntu2404.tar
```

### 1.4 完整参数速查表

| 命令 | 简写 | 说明 |
|:---|:---|:---|
| `wsl --install` | | 安装 WSL + 默认发行版 |
| `wsl --install -d <发行版>` | | 安装指定发行版 |
| `wsl --list -v` | `wsl -l -v` | 列出发行版及状态 |
| `wsl --list --online` | `wsl -l --online` | 列出可用发行版 |
| `wsl --set-default <发行版>` | | 设为默认 |
| `wsl --set-default-version <1/2>` | | 设默认版本 |
| `wsl --shutdown` | | 关闭所有实例 |
| `wsl --terminate <发行版>` | | 终止指定实例 |
| `wsl --export <D> <路径>` | | 导出备份 |
| `wsl --import <D> <位置> <tar>` | | 导入恢复 |
| `wsl --unregister <D>` | | 卸载发行版 |
| `wsl --update` | | 更新 WSL 内核 |
| `wsl --status` | | 查看 WSL 详细状态 |

---

## 二、文件系统互访：Windows ↔ Linux

这是 WSL 最常用的操作之一，理解文件系统结构非常重要。

### 2.1 文件系统架构图

```
┌─────────────────────────────────────────────────────┐
│                    WSL 文件系统                      │
│                                                     │
│   Linux 文件系统            Windows 磁盘挂载          │
│   ┌──────────────┐        ┌──────────────┐          │
│   │ / (根目录)    │        │ /mnt/        │          │
│   │ ├── /home     │        │ ├── /mnt/c/  │ ← C盘   │
│   │ │   └── 用户  │        │ ├── /mnt/d/  │ ← D盘   │
│   │ ├── /etc     │        │ ├── /mnt/e/  │ ← E盘   │
│   │ ├── /var     │        │ └── ...      │          │
│   │ └── /usr     │        │              │          │
│   └──────────────┘        └──────────────┘          │
│        ↑                        ↑                   │
│   性能最优 ⚡               性能较慢 🐢             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 2.2 从 Linux 访问 Windows 文件

```bash
# 在 WSL 中访问 Windows 的 C 盘
cd /mnt/c/Users/你的用户名/Desktop
ls /mnt/c/Users/你的用户名/Documents/

# 访问其他盘符
ls /mnt/d/
ls /mnt/e/

# 创建一个快捷方式（软链接），方便访问常用 Windows 目录
ln -s /mnt/c/Users/你的用户名/Desktop ~/Desktop
ln -s /mnt/c/Users/你的用户名/Documents ~/Documents
```

### 2.3 从 Windows 访问 Linux 文件

**方法一：通过资源管理器地址栏**

```
\\wsl$\Ubuntu-24.04\
\\wsl$\Ubuntu-24.04\home\zhangsan
\\wsl$\<发行版名称>\
```

在文件资源管理器地址栏输入以上路径即可。

**方法二：在 PowerShell 中打开**

```powershell
explorer.exe \\wsl$\Ubuntu-24.04\home\$env:USERNAME
# 注意：WSL 用户名和 Windows 用户名可能不同
```

**方法三：从 WSL 中直接调用**

```bash
# 在当前目录打开 Windows 资源管理器
explorer.exe .

# 打开指定目录
explorer.exe /mnt/c/Windows
```

### 2.4 ⚠️ 性能警告：跨文件系统操作的坑

这是一个新手最容易踩的坑：

```bash
# ❌ 慢！在 Windows 目录中执行 Git/npm 操作
cd /mnt/c/Users/你的用户名/project
git status       # 可能要等好几秒
npm install      # 可能比正常慢 5-10 倍！

# ✅ 快！把项目放在 Linux 文件系统中
cp -r /mnt/c/Users/你的用户名/project/* ~/my-project/
cd ~/my-project
git status       # 秒级响应
npm install      # 正常速度
```

| 操作场景 | 位置 | 相对速度 | 建议 |
|:---|:---|:---:|:---|
| Git 操作 | `/home/` (Linux) | ⚡⚡⚡ 100% | ✅ 项目放这里 |
| Git 操作 | `/mnt/c/` (Windows) | 🐢🐢 5-20% | ❌ 避免 |
| npm/pip 安装 | `/home/` (Linux) | ⚡⚡⚡ 100% | ✅ |
| npm/pip 安装 | `/mnt/c/` (Windows) | 🐢🐢 10-30% | ❌ 避免 |
| 大量小文件读写 | `/home/` (Linux) | ⚡⚡⚡ 100% | ✅ |
| 大量小文件读写 | `/mnt/c/` (Windows) | 🐪 1-10% | ❌ 绝对避免 |

> **🎯 黄金法则**：开发项目、代码仓库、构建输出，统统放在 WSL 的 `/home/` 目录下！

---

## 三、网络配置与端口转发

### 3.1 WSL 网络模式详解

WSL 2 使用虚拟化网络，网络架构如下：

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   Windows   │         │   WSL 2     │         │  Internet   │
│             │         │  VM (虚拟机) │             ↑         │
│  localhost  │◄───────►│  localhost  │◄──────────┘         │
│  :3000      │  NAT    │  :3000      │                      │
│             │  转发    │             │                      │
└─────────────┘         └─────────────┘                      │
                              │                             │
                         NAT 网关                          │
                     (自动端口映射)                       │
                                                        │
```

**好消息**：新版 WSL（2022年9月后）支持 **mirrored（镜像）网络模式**，Windows 和 WSL 共享 localhost 和 IP：

```ini
# ~/.wslconfig（在 Windows 用户目录下）
[wsl2]
networkingMode=mirrored
```

开启后：
- Windows 中访问 `localhost:3000` = WSL 中 `localhost:3000`
- WSL 中的服务可以直接被局域网其他设备访问
- 无需手动配置端口转发

### 3.2 端口转发实战案例

假设你在 WSL 中启动了一个 Web 服务：

```bash
# 在 WSL 中启动一个简单的 HTTP 服务
python3 -m http.server 8080
```

**旧版 WSL（非 mirrored 模式）需要手动转发**：

```powershell
# 在 Windows PowerShell（管理员）中执行：
netsh interface portproxy add v4tov4 listenport=8080 listenaddress=0.0.0.0 connectport=8080 connectaddress=$(wsl hostname -I)

# 查看已有的转发规则
netsh interface portproxy show all

# 删除规则
netsh interface portproxy delete v4tov4 listenport=8080 listenaddress=0.0.0.0
```

### 3.3 常见网络问题排查

```bash
# 在 WSL 中查看 IP 地址
ip addr show eth0

# 测试网络连通性
ping -c 4 baidu.com
curl -I https://www.google.com

# 查看 DNS 配置
cat /etc/resolv.conf

# 测试 Windows 方向访问
# 在 WSL 中监听后，Windows 浏览器打开 http://localhost:端口号
```

---

## 四、GUI 图形界面应用（WSLg）

WSLg 是微软提供的 GUI 支持，让你能在 Windows 上运行 Linux 图形应用！

### 4.1 启用 WSLg

如果你使用的是 **Windows 11** 或 **Windows 10 版本 21H2+**，WSLg 已经默认启用：

```bash
# 安装带 GUI 的应用
sudo apt update
sudo apt install gedit -y           # 文本编辑器
sudo apt install nautilus -y        # 文件管理器
sudo apt install firefox -y         # 浏览器
sudo apt install gimp -y            # 图片编辑器
```

### 4.2 运行 GUI 应用

```bash
# 直接输入应用名即可弹出窗口
gedit &            # GNOME 文本编辑器
nautilus &         # 文件管理器
firefox &          # Firefox 浏览器
gimp &             # GIMP 图片编辑器

# & 符号表示后台运行，不占用终端
```

运行效果就像原生 Windows 应用一样——有窗口、任务栏图标、可以最小化/最大化！

### 4.3 已验证可用的 GUI 应用

| 应用类别 | 推荐软件 | 安装命令 |
|:---|:---|:---|
| 浏览器 | Firefox | `sudo apt install firefox` |
| 文件管理 | Nautilus | `sudo apt install nautilus` |
| 文本编辑 | Gedit | `sudo apt install gedit` |
| 图片编辑 | GIMP | `sudo apt install gimp` |
| IDE | GVim | `sudo apt install vim-gtk3` |
| 终端多路复用 | Tilix | `sudo apt install tilix` |
| 截图工具 | Flameshot | `sudo apt install flameshot` |
| 录屏 | SimpleScreenRecorder | `sudo apt install simplescreenrecorder` |

### 4.4 显示环境变量

如果 GUI 应用无法启动，检查显示相关环境变量：

```bash
echo $DISPLAY
# 正常应输出类似：:0 或 :1

echo $WAYLAND_DISPLAY
# 正常应输出类似：wayland-0

# 如果没有这些变量，尝试手动设置
export DISPLAY=:0
```

---

## 五、10 个日常高频操作实战演示

### 场景 1：快速编辑 Windows 文件

```bash
# 用 Linux 的 vim 编辑 Windows 上的配置文件
vim /mnt/c/Users/你的用户名/.ssh/config

# 用 nano 更友好（适合 vim 新手）
nano /mnt/c/Users/yourname/.bashrc
```

### 场景 2：Windows 和 Linux 之间复制文本

```bash
# 方法一：使用 clip.exe（Linux → Windows 剪贴板）
echo "Hello from Linux" | clip.exe
cat file.txt | clip.exe

# 方法二：使用 powershell.exe（获取 Windows 剪贴板内容）
powershell.exe -command "Get-Clipboard"

# 方法三：WSL 自带的剪贴板工具
sudo apt install xclip
echo "some text" | xclip -selection clipboard
xclip -selection clipboard -o    # 粘贴
```

### 场景 3：在 WSL 中打开 Windows 应用

```bash
# 用 VS Code 打开文件
code .

# 用默认程序打开文件
cmd.exe /c start file.pdf
# 或
explorer.exe file.xlsx

# 打开浏览器
cmd.exe /c start https://www.google.com
# 或
wslview https://ubuntu.com        # 需先 sudo apt install wslu
```

### 场景 4：批量重命名文件（Linux 工具更强大）

```bash
# 批量添加前缀
for f in *.jpg; do mv "$f" "photo_$f"; done

# 批量替换文件名中的空格为下划线
rename 's/ /_/g' *

# 按日期重命名
i=1; for f in *.jpg; do mv "$f" "$(date +%Y%m%d)_$((i++)).jpg"; done
```

### 场景 5：用 Linux 工具处理 Windows 日志

```bash
# 分析 Windows 下的大日志文件
grep "ERROR" /mnt/c/Users/name/AppData/logs/app.log | wc -l    # 错误行数统计
tail -f /mnt/c/Users/name/AppData/logs/app.log                 # 实时追踪日志
grep -A 5 -B 2 "Exception" /mnt/c/path/to/logfile.log          # 查看错误上下文
```

### 场景 6：SSH 远程连接服务器

```bash
# 连接远程服务器
ssh user@192.168.1.100

# 密钥认证连接
ssh -i ~/.ssh/id_rsa user@your-server.com

# 端口转发
ssh -L 8080:localhost:8080 user@server
```

### 场景 7：文件压缩和解压

```bash
# 压缩（tar.gz 格式，Linux 最常用）
tar -czvf backup.tar.gz my_folder/

# 解压
tar -xzvf backup.tar.gz

# zip 压缩（兼容 Windows）
zip -r archive.zip folder/

# 解压 zip
unzip archive.zip
```

### 场景 8：磁盘空间分析

```bash
# 查看各目录大小（找出大文件夹）
du -h --max-depth=1 /home | sort -hr

# 查看磁盘使用情况
df -h

# 查找大于 100MB 的文件
find /home -size +100M -type f 2>/dev/null
```

### 场景 9：进程管理

```bash
# 查看进程
ps aux

# 查找特定进程
ps aux | grep node
pgrep -f "python.*server"

# 结束进程
kill <PID>
kill -9 <PID>          # 强制结束
pkill -f node          # 按名称结束所有匹配进程
```

### 场景 10：定时任务

```bash
# 编辑 crontab
crontab -e

# 示例：每天凌晨 2 点备份项目
0 2 * * * tar -czvf /mnt/d/backups/project_$(date +\%Y\%m\%d).tar.gz ~/project/

# 示例：每 30 分钟同步一次数据
*/30 * * * * rsync -avz ~/data/ /mnt/d/sync_data/
```

---

## 六、WSL 与 Windows 的互操作命令

### 6.1 在 WSL 中调用 Windows 程序

任何 Windows 可执行文件都可以在 WSL 中直接调用：

```bash
# 调用 Windows 的 notepad.exe
notepad.exe readme.txt

# 调用 Windows 的 calc.exe（计算器）
calc.exe

# 调用 Windows 的 code.exe（VS Code）
code.exe .

# 调用 Windows 的 explorer.exe
explorer.exe .

# 调用完整的 Windows 路径
/mnt/c/Windows/System32/ipconfig.exe /all
```

### 6.2 在 Windows 中调用 WSL 命令

PowerShell/CMD 中也可以反向调用：

```powershell
# 执行 Linux 命令
wsl ls -la
wsl grep "error" app.log
wsl touch newfile.txt

# 组合使用（管道传递）
type error.log | wsl grep "CRITICAL" | wsl sort | wsl uniq -c
```

### 6.3 环境变量互通

```bash
# 在 WSL 中访问 Windows 环境变量
echo $PATH                    # 已包含 Windows PATH
echo $USERPROFILE             # → /mnt/c/Users/你的用户名
echo $APPDATA                 # → /mnt/c/Users/.../AppData/Roaming

# 自定义：让 WSL 也继承特定的 Windows 环境变量
# 编辑 ~/.bashrc，添加：
export MY_WIN_HOME="$USERPROFILE"
```

---

## 七、实用工具推荐

### 7.1 wslu — WSL 实用工具集

```bash
# 安装
sudo apt install wslu

# 主要功能
wslview https://example.com        # 用默认浏览器打开链接
wslusc --browser firefox           # 创建 Windows 快捷方式
wslsys                            # 获取系统信息
wslfetch                          # 显示 WSL 信息（类似 neofetch）
wslup                             # 检查 WSL 更新
```

### 7.2 Windows Terminal 配置建议

```json
// settings.json 中推荐配置
{
    "profiles": {
        "defaults": {
            "fontFace": "Cascadia Mono",
            "fontSize": 14,
            "colorScheme": "One Half Dark",
            "cursorShape": "bar",
            "cursorHeight": 25,
            "padding" : "8, 8, 8, 8"
        },
        "list": [
            {
                "name": "Ubuntu-24.04",
                "commandline": "wsl.exe -d Ubuntu-24.04",
                "icon": "\ue70c",  // Ubuntu 图标
                "startingDirectory": "//wsl$/Ubuntu-24.04/home/你的用户名"
            }
        ]
    },
    // 默认启动配置文件
    "defaultProfile": "{你的GUID}"
}
```

---

## 八、下期预告

下一篇我们将深入 **《WSL 开发环境搭建》**，内容包括：

- 🔧 编译工具链搭建（GCC/G++、Make、CMake）
- 🐍 Python 开发环境（venv、conda、pip）
- ⚡ Node.js 与前端开发工具链
- 🦀 Go 语言环境配置
- 📝 VS Code Remote - WSL 完整配置指南
- 🐳 Docker Desktop 集成与容器开发
- 🗄️ 数据库环境搭建（MySQL、Redis、PostgreSQL）

---

> **💡 觉得有用？点个"在看"分享给更多开发者朋友！**
> 
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
> 
> 💬 有问题或想讨论？欢迎评论区留言交流！
