# 保姆级教程：在 Ubuntu 上搭建 L2TP/IPsec 服务端

> 🎯 **适用对象：** Linux 系统管理员、IT 运维、家庭实验室 (Homelab) 玩家
> 💡 **核心痛点：** 想要远程访问内网资源？OpenVPN 客户端太麻烦？想要用系统自带功能直连？
> 🏷️ **关键词：** Ubuntu, L2TP, IPsec, StrongSwan, xl2tpd, 远程办公

在外出差或移动办公时，安全地访问公司或家庭内网是一项刚需。L2TP/IPsec 是一种经典的解决方案，它的最大优势在于**绝大多数操作系统（Windows, macOS, iOS, Android）都原生支持**，无需额外安装第三方客户端软件。

本文将详细介绍如何在 Ubuntu 22.04/24.04 Server 上搭建一套稳定、安全的 L2TP/IPsec 服务端。

---

## 🛠️ 准备工作

在开始之前，请确保你拥有：
*   一台具有公网 IP 的 Ubuntu 服务器（VPS 或云主机）。
*   Root 权限或 sudo 权限。
*   防火墙（安全组）已开放相关端口：**UDP 500, 4500, 1701**。

> ⚠️ **云服务器用户特别提示：**
> 如果你使用的是阿里云、腾讯云、AWS、Azure 等云服务器，**仅仅在系统内部配置 UFW 是不够的**。你必须登录云服务商的网页控制台，找到“安全组”或“网络 ACL”设置，手动添加以下入站规则：
> *   **协议**：UDP
> *   **端口**：500, 4500, 1701
> *   **源地址**：0.0.0.0/0 (允许所有 IP 连接)
> *   **策略**：允许 (Allow)

---

## 📦 第一步：安装核心组件

我们需要安装三个核心组件：
1.  **StrongSwan**：用于处理 IPsec 协议，建立安全隧道。
2.  **xl2tpd**：L2TP 守护进程。
3.  **ppp**：用于处理用户认证和 IP 分配。

打开终端，执行以下命令：

```bash
sudo apt update
sudo apt install strongswan xl2tpd ppp net-tools -y
```

---

## 🔒 第二步：配置 IPsec (StrongSwan)

IPsec 负责加密数据传输。我们需要编辑 `/etc/ipsec.conf` 文件。

### 1. 编辑主配置文件

```bash
sudo nano /etc/ipsec.conf
```

清空或注释掉原有内容，写入以下配置：

```ini
config setup
    charondebug="ike 1, knl 1, cfg 0"
    uniqueids=no

conn %default
    keyexchange=ikev1
    authby=secret
    ike=aes128-sha1-modp1024,3des-sha1-modp1024!
    esp=aes128-sha1-modp1024,3des-sha1-modp1024!
    dpddelay=30
    dpdtimeout=120
    dpdaction=clear

conn L2TP-PSK-NAT
    rightsubnet=vhost:%priv
    also=L2TP-PSK-noNAT

conn L2TP-PSK-noNAT
    left=%defaultroute
    leftprotoport=17/1701
    right=%any
    rightprotoport=17/%any
    type=transport
    auto=add
```

### 2. 设置预共享密钥 (PSK)

编辑 `/etc/ipsec.secrets` 文件，设置连接时需要的“预共享密钥”。

```bash
sudo nano /etc/ipsec.secrets
```

添加一行（将 `YourSharedSecretKey` 替换为你自己的强密码）：

```text
: PSK "YourSharedSecretKey"
```

> ⚠️ **注意：** 冒号前面有一个空格，不要漏掉。

---

## ⚙️ 第三步：配置 L2TP (xl2tpd)

L2TP 负责建立隧道。编辑 `/etc/xl2tpd/xl2tpd.conf`。

```bash
sudo nano /etc/xl2tpd/xl2tpd.conf
```

写入以下内容：

```ini
[global]
ipsec saref = yes
listen-addr = 0.0.0.0

[lns default]
ip range = 192.168.42.10-192.168.42.250
local ip = 192.168.42.1
require chap = yes
refuse pap = yes
require authentication = yes
name = l2tpd
ppp debug = yes
pppoptfile = /etc/ppp/options.xl2tpd
length bit = yes
```

*   `ip range`：这是分配给客户端的内网 IP 地址段，确保不与服务器现有网段冲突。
*   `local ip`：L2TP 网关地址。

---

## 🔑 第四步：配置 PPP (用户认证)

### 1. 配置 PPP 选项

创建或编辑 `/etc/ppp/options.xl2tpd`：

```bash
sudo nano /etc/ppp/options.xl2tpd
```

写入以下内容：

```text
require-mschap-v2
ms-dns 8.8.8.8
ms-dns 8.8.4.4
auth
mtu 1200
mru 1000
crtscts
hide-password
modem
name l2tpd
proxyarp
lcp-echo-interval 30
lcp-echo-failure 4
```

### 2. 添加 VPN 账号

编辑 `/etc/ppp/chap-secrets` 文件来添加用户名和密码。

```bash
sudo nano /etc/ppp/chap-secrets
```

格式如下（每行一个用户）：

```text
# client    server      secret              IP addresses
user1       l2tpd       "UserPassword123"   *
user2       l2tpd       "AnotherPassword"   *
```

*   `user1`：你的 VPN 用户名。
*   `l2tpd`：服务名，与 options 文件中的 name 保持一致。
*   `UserPassword123`：你的 VPN 密码。
*   `*`：允许从任何 IP 登录。

---

## 🌐 第五步：网络转发与防火墙

这是最关键也最容易出错的一步。

### 1. 开启内核转发

编辑 `/etc/sysctl.conf`：

```bash
sudo nano /etc/sysctl.conf
```

找到并取消注释以下行（如果没有则添加）：

```ini
net.ipv4.ip_forward = 1
```

如果是 Ubuntu 22.04+，建议额外检查以下项以支持 L2TP：

```ini
net.ipv4.conf.all.accept_redirects = 0
net.ipv4.conf.all.send_redirects = 0
net.ipv4.conf.default.rp_filter = 0
net.ipv4.conf.default.accept_source_route = 0
net.ipv4.conf.default.send_redirects = 0
net.ipv4.icmp_ignore_bogus_error_responses = 1
```

应用更改：

```bash
sudo sysctl -p
```

### 2. 配置 UFW 防火墙 (如果开启)

如果你使用 UFW 防火墙，需要允许 UDP 端口并配置 NAT 转发。

首先允许端口：

```bash
sudo ufw allow 500/udp
sudo ufw allow 4500/udp
sudo ufw allow 1701/udp
```

然后配置 NAT 转发。编辑 `/etc/ufw/before.rules`：

```bash
sudo nano /etc/ufw/before.rules
```

在文件**最开头**（`*filter` 之前）添加以下内容：

```text
# NAT table rules
*nat
:POSTROUTING ACCEPT [0:0]

# Forward traffic from L2TP subnet through the public interface
# 将 eth0 替换为你的实际公网网卡接口名称 (用 ip addr 查看，通常是 eth0 或 ens3)
-A POSTROUTING -s 192.168.42.0/24 -o eth0 -j MASQUERADE

COMMIT
```

> **⚠️ 关键提示：** 务必确认你的网卡名称是 `eth0` 还是 `ens3` 等，使用 `ip addr` 命令查看。如果填错，客户端连接后将**无法上网**。

最后，修改 UFW 的默认转发策略。编辑 `/etc/default/ufw`：

```bash
sudo nano /etc/default/ufw
```

将 `DEFAULT_FORWARD_POLICY="DROP"` 改为：

```ini
DEFAULT_FORWARD_POLICY="ACCEPT"
```

重启 UFW：

```bash
sudo ufw disable
sudo ufw enable
```

---

## 🚀 第六步：启动服务

重启相关服务以应用所有配置：

```bash
sudo systemctl restart strongswan-starter
sudo systemctl restart xl2tpd
```

设置开机自启：

```bash
sudo systemctl enable strongswan-starter
sudo systemctl enable xl2tpd
```

---

## 💻 客户端连接测试

### Windows 10/11

1.  设置 -> 网络和 Internet -> VPN -> 添加 VPN 连接。
2.  **VPN 提供商：** Windows（内置）。
3.  **连接名称：** 随意（如 MyHomeVPN）。
4.  **服务器名称或地址：** 你的服务器公网 IP。
5.  **VPN 类型：** 使用预共享密钥的 L2TP/IPsec。
6.  **预共享密钥：** 输入你在第二步设置的 PSK。
7.  **登录信息类型：** 用户名和密码。
8.  **用户名/密码：** 输入你在第四步设置的账号密码。
9.  保存并连接。

> **💡 常见问题：** 如果 Windows 报错“L2TP 连接尝试失败，因为安全层在初始化与远程计算机的协商时遇到了一个处理错误”，通常需要修改注册表。
> 1. `Win + R` 输入 `regedit`。
> 2. 路径：`HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\PolicyAgent`。
> 3. 新建 -> DWORD (32位) 值，命名为 `AssumeUDPEncapsulationContextOnSendRule`。
> 4. 数值数据改为 `2`。
> 5. **重启电脑**后重试。

### macOS / iOS

1.  设置 -> VPN -> 添加 VPN 配置。
2.  类型选择 **L2TP**。
3.  描述随意，服务器填 IP。
4.  账户：你的用户名。
5.  密码：你的密码。
6.  密钥 (Secret)：你的预共享密钥 (PSK)。
7.  连接即可。

---

## 📝 总结

通过以上步骤，你已经成功搭建了一个支持多平台的 L2TP/IPsec 服务端。它不仅能让你在公共 Wi-Fi 下加密流量，保护隐私，还能轻松访问内网服务器。

**排错小贴士：**
如果连接失败，可以查看日志进行诊断：
*   IPsec 日志：`sudo tail -f /var/log/syslog` 或 `sudo journalctl -u strongswan-starter -f`
*   L2TP 日志：`sudo journalctl -u xl2tpd -f`

祝你远程办公愉快！🚀
