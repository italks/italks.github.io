# Linux网络配置入门教程：从IP地址到DNS，一篇搞定

> **阅读时长**：8分钟
> 
> **适合人群**：Linux新手、系统管理员、开发者
> 
> **你将了解**：IP地址配置、DNS设置、防火墙管理、故障排查

---

刚装好的Linux系统连不上网？手动配置IP地址一头雾水？DNS解析失败不知道怎么排查？

网络配置是Linux入门的第二大关（仅次于软件安装），但也是最容易踩坑的地方。本文将从零开始，带你系统掌握Linux网络配置的核心技能。

## 一、网络配置基础：理解三要素

### 1.1 IP地址、子网掩码、网关

Linux网络配置的核心三要素：

| 概念 | 作用 | 示例 |
|:---:|:---|:---|
| **IP地址** | 设备在网络中的唯一标识 | 192.168.1.100 |
| **子网掩码** | 定义网络范围 | 255.255.255.0（或/24） |
| **网关** | 连接不同网络的出口 | 192.168.1.1 |

**关键理解**：
```bash
# 查看当前网络配置
$ ip addr show

# 输出示例
2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP>
    inet 192.168.1.100/24 brd 192.168.1.255 scope global enp0s3
    #    ↑IP地址        ↑子网掩码(/24=255.255.255.0)
```

### 1.2 DNS：域名解析系统

DNS负责将域名转换为IP地址：

```bash
# 查看当前DNS配置
$ cat /etc/resolv.conf

# 输出示例
nameserver 192.168.1.1      # 路由器DNS
nameserver 8.8.8.8          # Google DNS
nameserver 114.114.114.114  # 国内DNS
```

**常见DNS服务器**：
- 国内：114.114.114.114、223.5.5.5（阿里）
- 国际：8.8.8.8（Google）、1.1.1.1（Cloudflare）

### 1.3 网络接口命名规则

Linux网络接口名称有规律可循：

| 接口类型 | 命名示例 | 说明 |
|:---:|:---|:---|
| 有线网卡 | enp0s3、eth0 | `en` = Ethernet |
| 无线网卡 | wlp2s0、wlan0 | `wl` = Wireless |
| 回环接口 | lo | 本地回环（127.0.0.1） |

## 二、NetworkManager：Ubuntu默认网络管理工具

### 2.1 nmcli命令速查

NetworkManager是Ubuntu默认的网络管理服务，`nmcli`是其命令行工具：

```bash
# 查看所有网络连接
$ nmcli connection show
NAME                TYPE      DEVICE
有线连接 1          ethernet  enp0s3
docker0             bridge    docker0

# 查看网络设备状态
$ nmcli device status
DEVICE  TYPE      STATE         CONNECTION
enp0s3  ethernet  connected     有线连接 1
lo      loopback  unmanaged     --

# 查看当前IP配置
$ nmcli device show enp0s3
GENERAL.DEVICE:     enp0s3
IP4.ADDRESS[1]:     192.168.1.100/24
IP4.GATEWAY:        192.168.1.1
IP4.DNS[1]:         192.168.1.1
```

### 2.2 图形界面配置（新手推荐）

Ubuntu桌面用户可以直接使用图形界面：

1. 点击右上角网络图标 → **有线设置** / **Wi-Fi设置**
2. 选择网络 → 点击**齿轮图标**
3. 切换到**IPv4**标签页
4. 选择配置方式：
   - **自动(DHCP)**：自动获取IP（默认）
   - **手动**：手动指定IP、子网掩码、网关、DNS

### 2.3 命令行配置（进阶必学）

#### DHCP自动获取IP

```bash
# 创建DHCP连接
$ sudo nmcli connection add type ethernet con-name "dhcp-connection" ifname enp0s3

# 启用DHCP
$ sudo nmcli connection modify "dhcp-connection" ipv4.method auto

# 激活连接
$ sudo nmcli connection up "dhcp-connection"
```

#### 手动配置静态IP

```bash
# 创建静态IP连接
$ sudo nmcli connection add type ethernet con-name "static-connection" ifname enp0s3

# 配置IP地址、子网掩码、网关
$ sudo nmcli connection modify "static-connection" \
  ipv4.addresses 192.168.1.100/24 \
  ipv4.gateway 192.168.1.1 \
  ipv4.method manual

# 配置DNS
$ sudo nmcli connection modify "static-connection" \
  ipv4.dns "8.8.8.8,114.114.114.114"

# 激活连接
$ sudo nmcli connection up "static-connection"
```

**关键参数说明**：
- `ipv4.addresses`：IP地址/子网掩码（CIDR格式）
- `ipv4.gateway`：网关地址
- `ipv4.dns`：DNS服务器（多个用逗号分隔）
- `ipv4.method`：`auto`=DHCP，`manual`=手动

## 三、DNS配置：解决域名解析问题

### 3.1 修改DNS服务器

#### 方法一：nmcli命令

```bash
# 设置DNS服务器
$ sudo nmcli connection modify "有线连接 1" \
  ipv4.dns "8.8.8.8 114.114.114.114 223.5.5.5"

# 忽略自动DNS（防止被覆盖）
$ sudo nmcli connection modify "有线连接 1" ipv4.ignore-auto-dns yes

# 重新激活连接
$ sudo nmcli connection up "有线连接 1"
```

#### 方法二：编辑配置文件

```bash
# 编辑Netplan配置文件（Ubuntu 18.04+）
$ sudo nano /etc/netplan/01-network-manager-all.yaml

# 添加DNS配置
network:
  version: 2
  renderer: NetworkManager
  ethernets:
    enp0s3:
      dhcp4: yes
      nameservers:
        addresses: [8.8.8.8, 114.114.114.114, 223.5.5.5]

# 应用配置
$ sudo netplan apply
```

### 3.2 测试DNS解析

```bash
# 测试域名解析
$ nslookup baidu.com

# 输出示例
Server:     8.8.8.8
Address:    8.8.8.8#53

Non-authoritative answer:
Name:   baidu.com
Address: 220.181.38.148

# 测试DNS响应速度
$ dig google.com @8.8.8.8

# 查看DNS查询时间
;; Query time: 12 msec
```

## 四、防火墙配置：UFW入门

### 4.1 UFW基本操作

UFW（Uncomplicated Firewall）是Ubuntu默认防火墙工具：

```bash
# 查看防火墙状态
$ sudo ufw status
Status: inactive  # 未启用

# 启用防火墙
$ sudo ufw enable

# 默认拒绝所有入站连接
$ sudo ufw default deny incoming

# 默认允许所有出站连接
$ sudo ufw default allow outgoing

# 查看防火墙规则（带编号）
$ sudo ufw status numbered
Status: active
     To                         Action      From
[ 1] 22/tcp                     ALLOW IN    Anywhere
[ 2] 80/tcp                     ALLOW IN    Anywhere
[ 3] 443/tcp                    ALLOW IN    Anywhere
```

### 4.2 开放常用端口

```bash
# 开放SSH端口（22）
$ sudo ufw allow ssh
# 或
$ sudo ufw allow 22/tcp

# 开放HTTP端口（80）
$ sudo ufw allow http
# 或
$ sudo ufw allow 80/tcp

# 开放HTTPS端口（443）
$ sudo ufw allow https
# 或
$ sudo ufw allow 443/tcp

# 开放特定端口范围
$ sudo ufw allow 8000:9000/tcp

# 开放特定IP访问
$ sudo ufw allow from 192.168.1.100 to any port 22

# 删除规则
$ sudo ufw delete allow 8080/tcp
# 或按编号删除
$ sudo ufw delete 3
```

### 4.3 防火墙最佳实践

| 场景 | 推荐配置 |
|:---|:---|
| 个人电脑 | 允许SSH、禁止其他入站 |
| Web服务器 | 允许SSH、HTTP、HTTPS |
| 数据库服务器 | 允许SSH、数据库端口（限制IP） |
| 内网服务 | 仅允许内网IP访问 |

**⚠️ 安全建议**：
1. 生产环境必须启用防火墙
2. 仅开放必要端口
3. 定期检查防火墙规则
4. 使用`limit`规则防止暴力破解：
   ```bash
   # SSH连接限制（6次/30秒）
   $ sudo ufw limit ssh
   ```

## 五、网络故障排查：10个必会命令

### 5.1 连通性测试

#### ping：测试网络连通性

```bash
# 测试外网连通性
$ ping -c 4 8.8.8.8
PING 8.8.8.8 (8.8.8.8) 56(84) bytes of data.
64 bytes from 8.8.8.8: icmp_seq=1 ttl=117 time=12.3 ms
64 bytes from 8.8.8.8: icmp_seq=2 ttl=117 time=11.8 ms

# 测试域名解析
$ ping -c 4 google.com
# 如果ping IP成功但ping域名失败 → DNS问题
```

#### traceroute：追踪路由路径

```bash
# 查看到目标主机的路由路径
$ traceroute google.com
traceroute to google.com (142.250.189.78), 30 hops max
 1  192.168.1.1 (192.168.1.1)  1.234 ms
 2  10.0.0.1 (10.0.0.1)  5.678 ms
 3  * * *  # 超时，可能是防火墙拦截
```

### 5.2 端口与服务测试

#### ss：查看端口监听

```bash
# 查看所有监听端口
$ ss -tulpn

# 输出示例
Netid  State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port
tcp    LISTEN  0       128           0.0.0.0:22          0.0.0.0:*    users:(("sshd",pid=1234,fd=3))
tcp    LISTEN  0       128           0.0.0.0:80          0.0.0.0:*    users:(("nginx",pid=5678,fd=6))

# 参数说明
# -t: TCP端口
# -u: UDP端口
# -l: 监听状态
# -p: 显示进程名
# -n: 数字显示端口
```

#### netstat：经典网络工具

```bash
# 查看所有网络连接
$ netstat -anp

# 查看特定端口
$ netstat -anp | grep :80
tcp  0  0  0.0.0.0:80  0.0.0.0:*  LISTEN  1234/nginx
```

#### telnet/nc：测试端口连通性

```bash
# 测试端口是否开放
$ nc -zv 192.168.1.100 22
Connection to 192.168.1.100 22 port [tcp/ssh] succeeded!

# 测试Web服务
$ curl -I http://192.168.1.100
HTTP/1.1 200 OK
Server: nginx/1.24.0
```

### 5.3 网络配置检查

#### ip命令全家桶

```bash
# 查看网络接口
$ ip link show

# 查看IP地址
$ ip addr show

# 查看路由表
$ ip route show
default via 192.168.1.1 dev enp0s3
192.168.1.0/24 dev enp0s3 proto kernel scope link src 192.168.1.100

# 查看ARP表
$ ip neigh show
192.168.1.1 dev enp0s3 lladdr 00:11:22:33:44:55 REACHABLE

# 添加临时IP地址（重启失效）
$ sudo ip addr add 192.168.1.101/24 dev enp0s3

# 删除IP地址
$ sudo ip addr del 192.168.1.101/24 dev enp0s3
```

### 5.4 DNS故障排查

```bash
# 1. 检查DNS配置
$ cat /etc/resolv.conf

# 2. 测试DNS解析
$ nslookup baidu.com
$ dig baidu.com

# 3. 测试特定DNS服务器
$ dig baidu.com @8.8.8.8

# 4. 清除DNS缓存（如果启用了systemd-resolved）
$ sudo systemd-resolve --flush-caches
```

## 六、常见问题与解决方案

### 6.1 无法获取IP地址

**症状**：
```bash
$ ip addr show
2: enp0s3: <BROADCAST,MULTICAST> mtu 1500
    # 没有inet地址
```

**解决方案**：
```bash
# 1. 检查网线连接
$ ethtool enp0s3 | grep Link
Link detected: yes

# 2. 启用网络接口
$ sudo ip link set enp0s3 up

# 3. 请求DHCP地址
$ sudo dhclient enp0s3

# 4. 重启NetworkManager
$ sudo systemctl restart NetworkManager
```

### 6.2 DNS解析失败

**症状**：
```bash
$ ping google.com
ping: google.com: Temporary failure in name resolution
```

**解决方案**：
```bash
# 1. 检查DNS配置
$ cat /etc/resolv.conf
# 如果为空或DNS服务器不可达

# 2. 手动设置DNS
$ sudo nmcli connection modify "有线连接 1" ipv4.dns "8.8.8.8"

# 3. 检查systemd-resolved服务
$ sudo systemctl status systemd-resolved

# 4. 重启DNS服务
$ sudo systemctl restart systemd-resolved
```

### 6.3 防火墙阻止连接

**症状**：服务本地可访问，远程无法访问

**解决方案**：
```bash
# 1. 检查防火墙状态
$ sudo ufw status

# 2. 临时关闭防火墙测试
$ sudo ufw disable

# 3. 如果连接成功 → 开放对应端口
$ sudo ufw allow 8080/tcp

# 4. 重新启用防火墙
$ sudo ufw enable
```

### 6.4 网络配置丢失

**症状**：重启后网络配置丢失

**解决方案**：
```bash
# 检查NetworkManager是否开机自启
$ systemctl is-enabled NetworkManager
enabled

# 如果未启用
$ sudo systemctl enable NetworkManager

# 检查连接是否自动连接
$ nmcli connection show "有线连接 1" | grep autoconnect
connection.autoconnect: yes

# 如果未启用自动连接
$ sudo nmcli connection modify "有线连接 1" connection.autoconnect yes
```

## 七、网络配置最佳实践

### 7.1 生产环境配置检查清单

| 检查项 | 命令 | 期望结果 |
|:---|:---|:---|
| 网络接口状态 | `ip link show` | `UP` 状态 |
| IP地址配置 | `ip addr show` | 正确的IP地址 |
| 路由表 | `ip route show` | 默认网关存在 |
| DNS解析 | `nslookup google.com` | 返回IP地址 |
| 防火墙状态 | `sudo ufw status` | `Status: active` |
| 端口监听 | `ss -tulpn` | 必要端口开放 |

### 7.2 网络安全建议

1. **防火墙策略**：
   - 默认拒绝入站连接
   - 仅开放必要端口
   - 使用`limit`规则防止暴力破解

2. **DNS安全**：
   - 使用可信DNS服务器
   - 启用DNS over HTTPS (DoH)
   - 定期检查DNS配置

3. **网络监控**：
   - 使用`iftop`监控流量
   - 使用`nload`查看带宽使用
   - 使用`tcpdump`抓包分析

### 7.3 Ubuntu 26.04网络新特性

Ubuntu 26.04带来以下网络改进：

| 特性 | 说明 |
|:---|:---|
| **NetworkManager 1.50** | 改进的Wi-Fi 7支持 |
| **systemd 257** | 更快的网络初始化 |
| **Netplan 2.0** | 新的YAML配置格式 |
| **WireGuard优化** | 内核级VPN性能提升 |

**升级建议**：
```bash
# 升级后检查网络配置
$ sudo netplan try
# 自动验证配置，30秒无确认自动回滚

# 查看NetworkManager版本
$ nmcli --version
nmcli tool, version 1.50.0
```

## 八、总结：网络配置速查表

### 核心命令速查

| 任务 | 命令 |
|:---|:---|
| 查看网络接口 | `ip link show` |
| 查看IP地址 | `ip addr show` |
| 查看路由表 | `ip route show` |
| 查看DNS配置 | `cat /etc/resolv.conf` |
| 测试连通性 | `ping -c 4 8.8.8.8` |
| 测试DNS解析 | `nslookup baidu.com` |
| 查看监听端口 | `ss -tulpn` |
| 查看防火墙状态 | `sudo ufw status` |
| 开放端口 | `sudo ufw allow 80/tcp` |
| 查看网络连接 | `nmcli connection show` |

### 故障排查流程图

```
网络故障排查流程：
1. ping 127.0.0.1 → 失败 → 网络接口未启动
                 ↓ 成功
2. ping 192.168.1.1 → 失败 → 本地网络问题
                     ↓ 成功
3. ping 8.8.8.8 → 失败 → 网关或ISP问题
                 ↓ 成功
4. ping google.com → 失败 → DNS问题
                    ↓ 成功
5. 网络正常 → 检查防火墙/服务配置
```

---

## 💡 UbuntuNews | 资讯·工具·教程·社区

🐧 关注我们，获取更多Ubuntu/Linux技术干货

💬 加入QQ群/频道，与全国爱好者交流成长

❤️ 觉得有用？点个"在看"分享给更多人！
