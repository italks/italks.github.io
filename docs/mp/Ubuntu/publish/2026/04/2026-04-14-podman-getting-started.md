---
title: Podman 入门：在 Ubuntu 上安装、常用命令，以及为什么它正在取代 Docker
date: 2026-04-14
category: Tutorial
tags: [Podman, Docker, Container, Ubuntu, Linux, 教程]
cover: ../imgs/2026-04-14-podman-guide.svg
summary: Docker 不是唯一的容器工具。Podman 凭借无守护进程架构和默认无根运行，正成为越来越多 Ubuntu 用户的首选。本文从安装到实战，手把手带你上手 Podman，并详细对比它和 Docker 的真实差异。
---

# Podman 入门：在 Ubuntu 上安装、常用命令，以及为什么它正在取代 Docker

**阅读时长**：约 8 分钟

说个真事。上周帮朋友排查一台服务器的容器问题，`dockerd` 进程莫名挂了，结果上面跑的五个服务全部跟着停摆。排查了半天发现是内存不足导致 OOM，守护进程被系统 kill 掉了——但问题是，那些容器本身只占了不到 2GB 内存。

这件事让我再次意识到一个很多人忽略的事实：**Docker 的守护进程架构，本身就是单点故障。**

这不是在否定 Docker。Docker 在过去十几年里把容器技术从概念变成了基础设施，功劳毋庸置疑。但如果你的工作场景是 Ubuntu 服务器、关注安全性、或者只是想找一个更轻量的替代方案——那确实该了解一下 Podman 了。

这篇文章会覆盖三个部分：怎么装、怎么用、以及跟 Docker 到底差在哪。不讲虚的，直接上实操。

---

## 一、Podman 是什么，不是什么

先澄清一个常见误解：**Podman 不是 Docker 的 fork 或重新实现。**

它是 Red Hat 主导开发的独立项目，核心设计理念就一条——去掉守护进程（daemon）。Docker 的所有操作都要通过 `dockerd` 这个后台进程来中转，而 Podman 直接用 fork-exec 模型创建容器进程，没有中间层。

这个架构差异带来的实际好处：

| 特性 | Docker | Podman |
|:---|:---|:---|
| 架构 | 守护进程 (dockerd) | 无守护进程 (fork-exec) |
| 默认权限 | root 运行 | **无根运行** (rootless) |
| 单点故障 | dockerd 挂全挂 | 各容器独立，互不影响 |
| 空闲资源 | 守护进程常驻 50-150MB | 零额外开销 |
| 许可证 | Desktop 付费 ($9-24/人/月) | Apache 2.0，完全免费 |

还有一个关键点：**Podman 和 Docker 用的是同一套 OCI 镜像格式**。你在 Docker Hub 上拉到的镜像，Podman 直接能用，反过来也一样。不存在"迁移就要重建镜像"的问题。

---

## 二、在 Ubuntu 上安装 Podman

### 方法一：APT 安装（推荐）

Ubuntu 20.10 及以上版本官方仓库已经包含 Podman：

```bash
# 更新包索引
sudo apt update

# 安装 Podman
sudo apt install -y podman
```

就这么简单。两条命令搞定。

安装完验证一下：

```bash
podman --version
# 输出示例: podman version 5.3.1

podman info
# 会输出完整的运行环境信息，包括存储驱动、网络配置等
```

跑个 Hello World 测试：

```bash
podman run --rm docker.io/alpine echo "Hello from Podman"
```

首次执行会自动从 Docker Hub 拉取 alpine 镜像，之后输出 `Hello from Podman` 就说明一切正常。

### 方法二：源码编译（需要最新特性时）

如果 APT 源里的版本太旧，或者你需要特定的编译选项：

```bash
# 安装构建依赖
sudo apt install -y \
  btrfs-progs gcc git golang-go go-md2man iptables \
  libassuan-dev libbtrfs-dev libc6-dev libdevmapper-dev \
  libglib2.0-dev libgpgme-dev libseccomp-dev \
  libsystemd-dev make netavark passt pkg-config runc uidmap

# 克隆源码
git clone https://github.com/containers/podman.git
cd podman

# 编译并安装
make BUILDTAGS="selinux seccomp" PREFIX=/usr
sudo make install PREFIX=/usr
```

注意 Go 版本要求 1.23+，Ubuntu 26.04 自带的应该够用。更早的版本可能需要手动升级。

### 配置无根模式（Rootless）

这是 Podman 的杀手级功能，建议一定要配。

```bash
# 检查用户命名空间是否启用（现代 Ubuntu 默认开启）
sysctl kernel.unprivileged_userns_clone
# 输出应为 1

# 如果是 0，需要手动开启
echo "kernel.unprivileged_userns_clone=1" | sudo tee /etc/sysctl.d/99-userns.conf
sudo sysctl -p /etc/sysctl.d/99-userns.conf
```

配置完成后，**不需要 sudo 就能跑容器**：

```bash
# 不加 sudo，直接跑
podman run -d -p 8080:80 nginx

# 验证确实是无根运行
podman ps
# USER 列显示的是你的用户名，不是 root
```

这跟 Docker 的 rootless 模式有本质区别。Docker 的 rootless 是后来补上去的，限制很多（不能用 overlay2、低端口绑定麻烦）；而 Podman 从第一天起就是为无根设计的，开箱即用。

> **小技巧**：如果想绑定 80、443 这类特权端口，可以加大 UID 映射范围：
> ```bash
> # 编辑 ~/.config/containers/containers.conf
> # 在 [engine] 下添加：
> # netns = "slirp4netns"
> # 然后设置:
> sysctl -w net.ipv4.ip_unprivileged_port_start=80
> ```

---

## 三、常用命令速查

如果你用过 Docker，那好消息是：**95% 以上的命令可以直接复用**。甚至可以把 `alias docker=podman` 加到 `.zshrc` 里，基本无感切换。

下面按日常使用频率排列。

### 镜像操作

```bash
# 拉取镜像（兼容 Docker Hub 和其他 registry）
podman pull nginx
podman pull docker.io/library/alpine:latest
podman pull quay.io/podman/stable

# 查看本地镜像
podman images

# 删除镜像
podman rmi <image_id>
podman rmi --all   # 清空所有镜像

# 构建镜像（支持标准 Dockerfile）
podman build -t myapp:v1 .
```

> **注意**：Podman 也支持 `Containerfile` 作为 Dockerfile 的替代名称，两者语法完全一样。Red Hat 生态习惯用 Containerfile，效果等同。

### 容器生命周期

```bash
# 创建并启动容器
podman run -d --name webserver -p 8080:80 nginx

# 常用 run 参数
# -d: 后台运行
# -it: 交互模式 + TTY
# --rm: 退出后自动删除
# -v: 挂载卷 (-v /host/path:/container/path)
# -e: 设置环境变量 (-e MYSQL_ROOT_PASSWORD=secret)
# --network: 指定网络模式

# 查看运行的容器
podman ps
podman ps -a    # 包括已停止的

# 进入容器
podman exec -it <container_name> /bin/bash
podman exec -it <container_name> /bin/sh     # alpine 用 sh

# 查看日志
podman logs <container_name>
podman logs -f <container_name>    # 跟踪输出（类似 tail -f）

# 停止 / 启动 / 重启
podman stop <container_name>
podman start <container_name>
podman restart <container_name>

# 删除容器
podman rm <container_name>
pod rm -af      # 强制删除全部容器（包括运行中的）
```

### Pod 操作（Podman 独有优势）

这是 Docker 没有的原生概念——**Pod（容器组）**。Kubernetes 用户会很熟悉：

```bash
# 创建一个 Pod（类似于 K8s 的 Pod）
podman pod create --name myapp -p 8080:80

# 向 Pod 中添加容器（共享网络命名空间）
podman run -d --pod myapp nginx
podman run -d --pod myapp redis

# 查看 Pod 信息
podman pod list
podman pod inspect myapp

# Pod 内的容器可以直接通过 localhost 互相通信
# nginx 可以用 localhost:6379 连接 redis，不需要额外网络配置

# 导出为 Kubernetes YAML（一键生成部署文件！）
podman generate kube myapp > myapp.yaml

# 删除 Pod（会同时清理内部所有容器）
podman pod rm myapp -f
```

这个功能的实用之处在于：本地开发完的容器编排，可以直接导出成 K8s YAML 部署到生产环境。**从开发到部署的工作流被大幅简化了。**

### 卷和网络

```bash
# 创建命名卷
podman volume create mydata

# 查看卷
podman volume ls
podman volume inspect mydata

# 使用卷
podman run -v mydata:/data alpine ls /data
podman run -v $(pwd)/local:/container/path alpine

# 网络
podman network create mynet
podman network ls
podman run --network mynet alpine
```

### systemd 集成（生成自启动服务）

```bash
# 让现有容器开机自启
podman generate systemd --name webserver --files
# 会在当前目录生成 container-webserver.service
# 复制到用户级 systemd 目录即可生效：
cp container-webserver.service ~/.config/systemd/user/
systemctl --user enable --now container-webserver.service
```

这意味着你可以用 `systemctl` 来管理容器的启停、重启策略和日志——跟管理普通系统服务完全一致。对于服务器运维来说，这个集成比 Docker 的 restart policy 更灵活、更符合 Linux 的管理哲学。

---

## 四、Podman vs Docker：真实差异对比

前面提到了架构区别，这里展开聊聊在实际使用中的具体感受。

### 1. 安全性：差距比想象的大

Docker 的 `dockerd` 默认以 root 权限运行，这意味着任何能访问 Docker socket 的用户，都等于拿到了整台机器的 root 权限。很多团队对此并不在意——直到某天 CI 流水线里的恶意代码利用了这个提权通道。

Podman 的做法完全不同：

```bash
# Docker: 必须 sudo（或把用户加入 docker 组，同样有风险）
sudo docker run -d nginx

# Podman: 普通用户直接跑
podman run -d nginx

# 验证进程归属
ps aux | grep nginx
# Docker: root 用户
# Podman: 你的用户 ID
```

每个无根容器通过用户命名空间（user namespace）做 UID 映射，容器内的 root 映射到宿主机上一个非特权 UID。即使攻击者从容器内逃逸，拿到的也只是一个普通用户的权限。

### 2. 性能：日常使用几乎无感

基准测试数据（仅供参考）：

| 场景 | Docker | Podman |
|:---|:---|:---|
| 冷启动（未缓存） | ~3-5 秒 | ~2-4 秒 |
| 热启动（已缓存） | ~500-800ms | ~300-600ms |
| 空闲内存占用 | +50-150MB (dockerd) | 0 |

冷启动快的那几百毫秒是因为省去了守护进程初始化。但在实际使用中，除非你是在 CI/CD 里频繁创建销毁短命容器，否则体感差别不大。

容器运行时的性能则完全一致——两者底层都是用 runc 或 crun 来跑容器的，不存在谁快谁慢的问题。

### 3. Compose 兼容性：基本够用，但有坑

```bash
# 方案一：用 podman-compose（Python 实现）
pip install podman-compose
podman-compose -f docker-compose.yml up -d

# 方案二：启用 Docker API 兼容，直接用 docker-compose
systemctl --user enable --now podman.socket
export DOCKER_HOST=unix://$XDG_RUNTIME_DIR/podman/podman.sock
docker-compose up -d    # 实际调用的是 Podman
```

大多数常见的 compose 文件都能正常运行。但以下功能可能有问题：
- Swarm 模式的 deploy 配置（Podman 本身不支持 Swarm）
- 部分 volume 驱动
- 复杂的 depends_on 条件表达式

如果你的 compose 文件比较标准（定义几个服务、端口映射、环境变量），那问题不大。如果是那种写了上百行的高级编排，建议先在测试环境验证一遍。

### 4. 生态系统：Docker 依然领先

这一点必须诚实地说：**Docker 的生态成熟度目前还是高于 Podman 的。**

具体体现在：
- 第三方工具默认对接 Docker（部分 CI/CD 平台、监控工具）
- Docker Hub 的镜像构建和扫描功能更完善
- 遇到问题时，网上搜到的答案 90% 是 Docker 相关的
- Docker Desktop 的 GUI 对桌面用户很友好

但这不意味着 Podman 不能用。2026 年的今天，GitHub Actions、GitLab CI、Jenkins 都已经有成熟的 Podman 支持。主流的监控方案（Prometheus + cAdvisor）也能正常采集 Podman 容器的指标。

---

## 五、什么时候选 Podman，什么时候留 Docker？

根据实际经验给个参考：

### 选 Podman 的场景

- ✅ **Linux 服务器运维**：无守护进程意味着更高的稳定性和安全性
- ✅ **合规要求严格**：金融、医疗等行业对权限控制有硬性要求
- ✅ **Kubernetes 开发者**：原生 pod 概念 + K8s YAML 导出，工作流丝滑
- ✅ **多租户环境**：不同用户各自跑自己的容器，互不干扰
- ✅ **不想付 Docker Desktop 许可费**：macOS/Windows 上 Podman Desktop 也是免费的

### 继续用 Docker 的场景

- ✅ **重度依赖 Docker Desktop GUI**：可视化界面确实做得好
- ✅ **团队已经在用 Swarm**：Podman 不支持
- ✅ **大量遗留 compose 文件**且没精力改
- ✅ **Windows 容器开发**：这方面 Docker 支持更好

### 折中方案

很多团队的做法是：**开发机器保留 Docker Desktop，生产服务器用 Podman**。反正镜像格式通用，两边都不耽误。

---

## 六、快速上手清单

如果你决定试试 Podman，照着这个顺序来就行：

```bash
# ① 安装
sudo apt update && sudo apt install -y podman

# ② 验证
podman --version && podman run --rm alpine echo "OK"

# ③ （可选）配无根模式的特权端口
echo "net.ipv4.ip_unprivileged_port_start=80" | sudo tee -etc/sysctl.d/podman.conf
sudo sysctl -p /etc/sysctl.d/podman.conf

# ④ 跑第一个应用
podman run -d --name hello -p 8080:80 nginx
curl localhost:8080    # 应该看到 Nginx 欢迎页

# ⑤ （可选）设别名，肌肉记忆不用改
echo 'alias docker=podman' >> ~/.zshrc
source ~/.zshrc
```

整个过程不超过五分钟。如果之前有用过 Docker 的经验，基本上零学习成本。

---

## 写在后面

容器技术的本质是把应用及其依赖打包成一个标准化单元，让它在任何地方都能一致地运行。Docker 把这个概念普及了，但它并不是实现这个目标的唯一方式——甚至不一定是最适合你当前场景的方式。

Podman 的出现不是为了"干掉 Docker"，而是提供了另一种思路：**更简洁的架构、更安全的默认行为、零成本的许可模式**。对于在 Ubuntu 上做开发和运维的人来说，多了解一个选项总归是有用的。

哪怕你最终决定继续用 Docker，知道 Podman 能做什么、怎么做，也是扩展技术视野的一部分。

---

**💡 UbuntuNews** | 资讯·工具·教程·社区

🐧 关注我们，获取更多 Ubuntu/Linux 技术干货

💬 加入QQ群/频道，与全国爱好者交流成长

❤️ 觉得有用？点个"在看"分享给更多人！
