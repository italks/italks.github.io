# WSL 网络完全指南：localhost、端口转发一网打尽

> **阅读时长**：约 12 分钟 | **难度等级**：⭐⭐☆☆☆ 入门进阶
> **本篇关键词**：WSL / 网络配置 / 端口转发 / localhost / 镜像模式
>
> WSL 的网络是它最让人困惑的部分之一。三种网络模式各有什么特点？localhost 能不能直接通？局域网怎么访问？一篇文章彻底搞懂。

---

## 先搞懂 WSL 的三种网络模式

### 模式总览

```
┌────────────────────────────────────────────────────────┐
│                   WSL 2 三种网络模式                      │
│                                                        │
│  ┌──── NAT（默认）─────┐                               │
│  │ WSL 有独立 IP        │  Windows 和 WSL 各自独立 IP   │
│  │ localhost 不互通     │  需要手动配置端口转发          │
│  └─────────────────────┘                                │
│                                                        │
│  ┌── Mirrored（推荐⭐）──┐                              │
│  │ 共享网络栈            │  localhost 完全互通           │
│  │ 局域网可直接访问      │  无需任何额外配置             │
│  └─────────────────────┘                                │
│                                                        │
│  ┌── Symmetric（高级）──┐                              │
│  │ 高度自定义            │  适合有特殊网络需求的高级用户  │
│  └─────────────────────┘                                │
└────────────────────────────────────────────────────────┘
```

### 详细对比

| 特性 | NAT（默认） | Mirrored（镜像） | Symmetric |
|:---|:---|:---|:---|
| **WSL IP** | 独立虚拟 IP | 与 Windows 相同 | 自定义 |
| **localhost 互通** | ❌ 默认不互通 | ✅ 完全互通 | ✅ 可配置 |
| **Windows → WSL 服务** | 需要端口转发或新版本自动转发 | ✅ 直接 `localhost:port` | ✅ 直接访问 |
| **WSL → Windows 服务** | ✅ 直接访问 | ✅ 直接访问 | ✅ 直接访问 |
| **局域网其他设备→WSL** | ❌ 不能直接访问 | ✅ 可以！ | ✅ 可以 |
| **IPv6 支持** | 部分 | ✅ 支持 | ✅ 支持 |
| **VPN 兼容性** | 一般 | ⚡ 更好 | ⚡ 更好 |
| **适用系统** | Win10/11 | **Win11 推荐** | Win11 预览版 |

> 🎯 **新手结论**：Windows 11 用户直接用 **Mirrored 模式**，省心省力！

---

## 方案一：镜像模式（推荐 ⭐⭐⭐⭐⭐）

这是目前最简单、最推荐的网络方案。

### 配置方法

在 Windows 用户目录下创建或编辑 `.wslconfig`：

```ini
# 文件位置：C:\Users\<你的用户名>\.wslconfig

[wsl2]
memory=8GB
swap=4GB
processors=6

networkingMode=mirrored
dnsTunneling=true
autoProxy=true
firewall=true
vmIdleTimeout=-1
```

### 配置后操作

```powershell
# 必须重启 WSL 使配置生效
wsl --shutdown
```

然后重新打开 WSL 即可。

### 使用效果

```bash
# 在 WSL 中启动一个服务
python3 -m http.server 8080

# Windows 浏览器直接访问：
# http://localhost:8080     ✅ 能访问！

# 局域网其他设备通过你电脑的 IP 访问：
# http://192.168.1.100:8080    ✅ 也能访问！（之前 NAT 模式不行）

# WSL 访问 Windows 上跑的服务：
curl http://localhost:3000      # 如果 Windows 跑了 Node 服务 ✅
```

### 一切就这么简单——不需要端口转发，不需要额外配置！

---

## 方案二：NAT 模式（默认 / Win10 用户）

如果你用的是 Windows 10 或不想改默认设置，了解 NAT 模式的规则。

### NAT 网络架构图

```
┌──────────────┐         ┌──────────────────┐         ┌──────────┐
│   Windows    │         │   WSL 2 (VM)     │         │ Internet │
│              │         │                  │         │          │
│ localhost:80 │◄──────?►│ 172.x.x.x:8080  │◄────────┤          │
│ :3000        │  NAT    │ localhost:8080   │  出站    │          │
│              │  转发    │                  │  NAT     │          │
└──────────────┘         └──────────────────┘         └──────────┘
       ▲                          ▲
       │     默认需要配置才能通     │
       └──────────────────────────┘
```

### 新版 WSL 已自动处理 localhost 转发

好消息！2022 年后的新版 WSL 已经**自动做了 localhost 转发**：

```bash
# 大多数情况下，以下场景已经可以直接工作：
# WSL 中监听 8080 → Windows 浏览器访问 localhost:8080 ✅
# （前提是 .wslconfig 中 localhostForwarding=true，这是默认值）
```

如果还是不通，手动添加：

```powershell
# PowerShell（管理员）中执行：
netsh interface portproxy add v4tov4 `
    listenport=8080 listenaddress=0.0.0.0 `
    connectport=8080 connectaddress=$(wsl hostname -I)

# 查看已有的转发规则
netsh interface portproxy show all

# 删除某条规则
netsh interface portproxy delete v4tov4 `
    listenport=8080 listenaddress=0.0.0.0

# 清除所有规则
netsh interface portproxy reset
```

### 局域网访问（NAT 模式的难点）

NAT 模式下，局域网其他设备**无法直接访问** WSL 中的服务。

**变通方案：在 Windows 端做二次转发**

```powershell
# 假设 WSL 中跑了服务在 8080 端口
# 且已配置 localhost 转发

# 让 Windows 监听 8080 并转发到自身（实际到达 WSL）
netsh interface portproxy add v4tov4 `
    listenport=8080 listenaddress=0.0.0.0 `
    connectport=8080 connectaddress=127.0.0.1

# 然后开放防火墙
New-NetFirewallRule -DisplayName "WSL Port 8080" `
    -Direction Inbound -Protocol TCP -LocalPort 8080 -Action Allow

# 局域网设备现在可以通过你电脑 IP + 8080 端口访问了
```

> 💡 觉得麻烦？这就是为什么推荐用 **Mirrored 模式**的原因！

---

## DNS 配置与问题排查

### DNS 解析流程

```
你在 WSL 中执行 ping baidu.com
    ↓
查询 /etc/resolv.conf 中的 nameserver
    ↓
WSL 将请求转发给 DNS 服务器
    ↓
返回 IP 地址
```

### 常见 DNS 问题

#### 问题：WSL 中无法解析域名

```bash
# 检查 DNS 配置
cat /etc/resolv.conf
# 正常输出示例：
# nameserver 172.xx.x.x    ← 自动生成的（来自 Windows）

# 测试 DNS 解析
nslookup baidu.com
ping -c 2 8.8.8.8          # IP 通但域名不通 = DNS 问题
```

**解决方案 A — 手动指定 DNS**：
```bash
sudo rm /etc/resolv.conf
sudo bash -c 'echo "nameserver 8.8.8.8" > /etc/resolv.conf'
sudo bash -c 'echo "nameserver 114.114.114.114" >> /etc/resolv.conf'
sudo chattr +i /etc/resolv.conf   # 锁定防止被覆盖
```

**解决方案 B — Mirrored 模式开启 DNS Tunneling**：
```ini
# .wslconfig
[wsl2]
networkingMode=mirrored
dnsTunneling=true    # ← 这个选项让 DNS 通过 Windows 解析
```

#### 问题：某些域名能解析但不能访问

可能是 IPv6 相关问题：

```bash
# 强制使用 IPv4
curl -4 https://example.com

# 或修改 /etc/gai.conf 取消 IPv6 优先
sudo sed -i 's/^#precedence ::ffff:0:0\/96  100/precedence ::ffff:0:0\/96  100/' /etc/gai.conf
```

---

## 防火墙设置

### Mirrored 模式防火墙

```ini
# .wslconfig
[wsl2]
networkingMode=mirrored
firewall=true    # 启用防火墙隔离
```

启用后 WSL 的入站连接受 Windows Defender 防火墙管理。如需开放端口：

```powershell
# PowerShell（管理员）中允许特定端口
New-NetFirewallRule -DisplayName "WSL Dev Server" `
    -Direction Inbound -Protocol TCP -LocalPort 3000,5000,8080 `
    -Action Allow
```

### NAT 模式防火墙

NAT 模式下 WSL 的流量对 Windows 来说是"出站"，一般不受防火墙限制。但如果做了端口转发，需要开放对应端口（见上文）。

---

## 网络调试工具箱

### 基础诊断命令

```bash
# 1. 查看 WSL 的 IP 地址
ip addr show eth0 | grep inet
hostname -I

# 2. 查看 Windows 主机 IP（从 WSL 内）
cat /etc/resolv.conf | grep nameserver
# 或
ip route | grep default | awk '{print $3}'

# 3. 测试连通性
ping -c 4 baidu.com                    # 外网
ping -c 4 $(cat /etc/resolv.conf | awk '{print $2}')  # DNS服务器
curl -I https://www.google.com          # HTTP 连接

# 4. 查看端口占用
ss -tlnp | grep :8080                   # Linux 风格
netstat -tlnp | grep 8080               # 同上

# 5. 查看路由表
ip route

# 6. 抓包分析（高级排查）
sudo apt install tcpdump
sudo tcpdump -i eth0 port 8080          # 监听 8080 端口流量
```

### 从 Windows 侧诊断

```powershell
# 测试能否连上 WSL 的端口
Test-NetConnection -ComputerName localhost -Port 8080

# 查看所有监听端口
netstat -ano | findstr LISTENING

# 查看 WSL 虚拟网卡的信息
Get-NetAdapter | Where-Object {$_.Name -like "*vEthernet*"}
```

### 常见网络问题速查表

| 症状 | 可能原因 | 解决方向 |
|:---|:---|:---|
| `ping` 外网不通 | 网络/DNS 问题 | 检查 resolv.conf、DNS 配置 |
| `localhost:port` 打不开 | 未监听或端口未转发 | `ss -tlnp` 确认监听状态 |
| Windows 能访问，手机不能 | NAT 模式限制 | 改 mirrored 或配端口转发 |
| VPN 连上后 WSL 断网 | VPN 劫持路由 | 检查 VPN 分流规则 |
| Docker 端口映射失败 | Docker 网络模式冲突 | 用 mirrored 或 bridge 模式 |
| Git clone/push 超时 | 代理/DNS 问题 | 检查 HTTP_PROXY 设置 |

---

## 实际案例：部署一个可局域网访问的服务

### 场景：团队内部演示 Web 应用

```bash
# 1. 在 WSL 中准备一个简单的 Web 服务
mkdir -p ~/demo && cd ~/demo
cat > app.py << 'EOF'
from flask import Flask
app = Flask(__name__)

@app.route("/")
def home():
    return "<h1>Hello from WSL! Team Demo</h1><p>Your WSL network works!</p>"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
EOF

# 2. 安装依赖并运行
pip install flask python3 app.py
# 输出：Running on http://0.0.0.0:5000

# 3. 本机验证
curl http://localhost:5000        # ✅ 应返回 HTML 页面

# 4. 局域网验证（Mirrored 模式）
# 其他设备浏览器打开：http://<你的IP>:5000

# 5. 查看本机 IP
ip addr show eth0 | grep inet    # 或 Windows 中 ipconfig
```

### 效果展示

```
同事的电脑/手机的浏览器
    ↓
http://192.168.1.100:5000
    ↓
路由器 → 你的电脑（Windows）
    ↓
Mirrored 模式自动转发
    ↓
WSL 中的 Flask 应用 (0.0.0.0:5000)
    ↓
返回页面内容 ✅
```

---

## 下期预告

下一篇：**《在 Windows 上运行 Linux 桌面应用？WSLg 图形界面体验》**

- 🖥️ WSLg 是什么？一键启用
- 🎨 已经验证的 GUI 应用清单
- 📱 安装和运行图形界面程序
- ⚙️ 显示环境与性能调优
- 🎮 能玩游戏吗？能跑 IDE 吗？

---

> **💡 你的 WSL 网络遇到哪些坑？评论区聊聊！**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
>
> 💬 下篇讲 GUI 图形界面，想看什么应用？留言安排！
