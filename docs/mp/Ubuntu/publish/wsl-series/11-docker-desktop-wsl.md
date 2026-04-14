# Docker Desktop + WSL 2：容器开发的黄金搭档

> **阅读时长**：约 12 分钟 | **难度等级**：⭐⭐⭐☆☆ 进阶实战
> **本篇关键词**：Docker / Docker Compose / WSL / 容器 / 微服务
>
> WSL 2 + Docker Desktop 是目前 Windows 上最流畅的容器开发方案。Docker 直接运行在 WSL 的 Linux 内核上，性能接近原生 Linux。

---

## 为什么 WSL + Docker 是黄金组合？

### 传统方式 vs WSL 后端

```
❌ 旧版 Docker（Hyper-V 后端）：
Windows → Hyper-V 虚拟机 → Docker Engine → Containers
         ↑ 额外虚拟化层，资源开销大

✅ WSL 2 后端：
Windows → WSL 2 VM → Docker Engine → Containers
         ↑ 复用已有的 WSL VM，无需额外开销！
```

### 核心优势

| 特性 | 说明 |
|:---|:---|
| **启动速度** | 利用已有 WSL 内核，秒级启动容器 |
| **文件系统** | 容器直接使用 ext4，I/O 性能极佳 |
| **网络集成** | localhost 直接访问容器端口 |
| **开发体验** | VS Code Remote + Docker 扩展完美配合 |
| **一致性** | 开发环境 ≈ 生产环境（都是 Linux）|

---

## 安装与配置

### Step 1：下载安装 Docker Desktop

```powershell
# 方法一：官网下载
# 访问 https://www.docker.com/products/docker-desktop/
# 下载 Windows 版安装包

# 方法二：winget 安装
winget install Docker.DockerDesktop

# 安装过程：一路 Next 即可（免费注册 Docker 账号可选）
```

### Step 2：设置 WSL 2 后端

```
1. 启动 Docker Desktop
2. 点击右上角 ⚙️ 设置图标
3. General 选项卡：
   ☑️ Use the WSL 2 based engine    ← 关键！
4. Resources → WSL Integration：
   ☑️ Enable integration with my default WSL distro
   ☑️ Ubuntu-24.04                  ← 勾选你的发行版
5. Apply & Restart
```

### Step 3：验证安装

```bash
# 在 WSL 终端中验证
docker --version      # Docker 引擎版本
docker compose version  # Compose 插件版本

# 运行测试容器
docker run hello-world
# 输出 "Hello from Docker!" 表示成功 ✅
```

```
验证检查清单：
✅ docker --version 有输出
✅ docker run hello-world 成功
✅ 在 WSL 中可以直接执行 docker 命令
✅ VS Code Docker 扩展可以连接
```

---

## Docker 基础命令速查

### 镜像操作

```bash
# 搜索镜像
docker search nginx

# 拉取镜像
docker pull ubuntu:24.04
docker pull python:3.12-slim
docker pull node:20-alpine

# 查看本地镜像
docker images
docker image ls

# 删除镜像
docker rmi <image_id>
docker rmi $(docker images -q -f "dangling=true")   # 清理悬空镜像
```

### 容器操作

```bash
# 运行容器（交互模式）
docker run -it ubuntu:24.04 /bin/bash

# 运行并映射端口
docker run -d -p 8080:80 nginx

# 运行并挂载卷（数据持久化）
docker run -v $(pwd):/app -w /app python:3.12-slim python app.py

# 查看运行中的容器
docker ps
docker ps -a              # 包含已停止的

# 进入正在运行的容器
docker exec -it <container_id> bash

# 查看日志
docker logs <container_id>
docker logs -f <container_id>       # 实时跟踪日志

# 停止/启动/删除容器
docker stop <container_id>
docker start <container_id>
docker rm <container_id>

# 一键清理（释放磁盘空间）
docker system prune -a     # ⚠️ 会删除所有未使用的容器和镜像
```

---

## Docker Compose 编排实战

### 场景：全栈 Web 应用

创建一个包含前后端、数据库、缓存的完整项目：

```bash
mkdir -p ~/projects/docker-demo && cd ~/projects/docker-demo
```

#### docker-compose.yml

```yaml
services:
  # 前端
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend

  # 后端 API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://dev:dev@db:5432/appdb
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./backend:/app
    depends_on:
      - db
      - redis

  # PostgreSQL 数据库
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: appdb
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  # Redis 缓存
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

  # Nginx 反向代理
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - frontend
      - backend

volumes:
  pgdata:
  redisdata:
```

#### 一键启动全部服务

```bash
# 构建并启动所有服务
docker compose up -d --build

# 查看各服务状态
docker compose ps

# 输出示例：
# NAME                STATUS        PORTS
# docker-demo-backend-1    Up    0.0.0.0:8000->8000/tcp
# docker-demo-db-1          Up    0.0.0.0:5432->5432/tcp
# docker-demo-frontend-1    Up    0.0.0.0:3000->80/tcp
# docker-demo-nginx-1       Up    0.0.0.0:80->80/tcp
# docker-demo-redis-1       Up    0.0.0.0:6379->6379/tcp

# 查看某服务的日志
docker compose logs -f backend

# 重启单个服务
docker compose restart backend

# 停止所有服务
docker compose down

# 停止并删除数据卷（完全清理）
docker compose down -v
```

---

## 镜像加速配置（国内用户）

编辑或创建 Docker 配置文件：

```json
// ~/.docker/daemon.json
{
  "registry-mirrors": [
    "https://docker.1ms.run",
    "https://docker.xuanyuan.me"
  ]
}
```

> 💡 国内 Docker Hub 访问慢或不稳定，配了镜像加速后拉取速度从几 KB/s 飙升到几 MB/s。

配置后重启 Docker Desktop 生效。

---

## 资源限制与优化

### .wslconfig 中控制 Docker 资源

```ini
# C:\Users\<你>\.wslconfig
[wsl2]
memory=8GB           # 给 WSL/Docker 足够内存
processors=6
swap=4GB
vmIdleTimeout=-1
```

### Docker Desktop 自身设置

```
Docker Desktop → Settings → Resources:

Advanced:
├── CPUs: 4                    （留给 Windows 2-4 核）
├── Memory: 4 GB               （WSL 总内存的一部分）
└── Disk image size: 60 GB     （根据需要调整）

Resource Control:
☑️ Enable resource saver mode   （空闲时自动降低占用）
```

### 磁盘空间清理

```bash
# 查看磁盘占用
docker system df

# 清理未使用的资源（安全）
docker system prune
# 可回收：
# · 停止的容器
# · 未使用的网络
# · 悬空的镜像

# 深度清理（包括未使用的镜像）⚠️
docker system prune -a

# 手动清理特定内容
docker container prune          # 所有停止的容器
docker volume prune             # 未使用的卷
docker image prune -a            # 未使用的镜像
```

---

## Dev Container 开发提示

如果你在 VS Code 中使用 Remote-Containers：

```
F1 → "Dev Containers: Open Folder in Container"
→ 自动构建开发容器并在其中打开代码
→ 终端、扩展、调试器全部在容器内运行
→ 团队成员用同一个 devcontainer.json 就能获得一致环境
```

`devcontainer.json` 示例：
```json
{
  "name": "My Python Project",
  "image": "mcr.microsoft.com/devcontainers/python:3.12",
  "features": {
    "ghcr.io/devcontainers/features/docker-in-docker:2": {}
  },
  "postCreateCommand": "pip install -r requirements.txt",
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-python.python",
        "ms-python.vscode-pylance"
      ]
    }
  }
}
```

---

## 下期预告

下一篇：**《数据库全家桶：MySQL + Redis + PostgreSQL 一键部署》**

- 🗄️ MySQL/MariaDB 安装与远程连接配置
- 🔴 Redis 数据类型与常用操作
- 🐘 PostgreSQL 高级特性
- 📊 GUI 客户端工具推荐
- 🔄 数据备份与恢复策略

---

> **💡 你在 WSL 中主要用 Docker 做什么？评论区聊聊！**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
>
> 💬 Docker 遇到过哪些坑？一起排雷！
