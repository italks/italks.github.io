# WSL 实战案例与故障排查：从搭建到排错全攻略

> **阅读时长**：约 22 分钟 | **难度等级**：⭐⭐⭐☆☆ 进阶实战
>
> 通过完整项目实战巩固所学技能，并建立自己的 WSL 故障排查知识库。

---

## 一、实战项目：在 WSL 中从零部署全栈应用

### 项目目标

用 WSL 搭建一个完整的「技术博客」后端，包含：

```
┌─────────────────────────────────────┐
│          技术栈                       │
│                                     │
│  后端: Python + FastAPI              │
│  数据库: PostgreSQL                  │
│  缓存: Redis                         │
│  前端: 简单 HTML 页面                │
│  容器化: Docker Compose             │
│  开发工具: VS Code Remote - WSL     │
└─────────────────────────────────────┘
```

### Step 1：创建项目结构

```bash
# 在 Linux 文件系统中创建项目（重要！）
mkdir -p ~/projects/blog-app/{app,tests,static,templates}
cd ~/projects/blog-app

# 创建 Python 虚拟环境
python3 -m venv .venv
source .venv/bin/activate

# 安装依赖
pip install fastapi uvicorn sqlalchemy psycopg2-binary redis pydantic python-multipart

# 记录依赖
pip freeze > requirements.txt
```

项目目录结构：
```
blog-app/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI 主应用
│   ├── models.py         # 数据模型
│   ├── database.py       # 数据库连接
│   └── routers/
│       └── posts.py      # 文章路由
├── tests/
├── static/
├── templates/
├── docker-compose.yml    # 容器编排
├── Dockerfile            # 镜像构建
├── requirements.txt
└── README.md
```

### Step 2：编写后端代码

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import posts

app = FastAPI(title="Blog API", version="1.0.0")

# 跨域支持（开发阶段）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(posts.router, prefix="/api/posts", tags=["posts"])

@app.get("/")
async def root():
    return {"message": "Welcome to Blog API on WSL!", "env": "WSL 2 / Ubuntu"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "platform": "wsl-ubuntu"}
```

```python
# app/routers/posts.py
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from datetime import datetime

router = APIRouter()

# 内存数据存储（生产环境应使用数据库）
posts_db = [
    {
        "id": 1,
        "title": "WSL 入门指南",
        "content": "Windows Subsystem for Linux 让开发更高效...",
        "author": "UbuntuNews",
        "created_at": "2026-04-14T10:00:00"
    },
    {
        "id": 2,
        "title": "Linux 命令行速查",
        "content": "最常用的50个命令...",
        "author": "UbuntuNews",
        "created_at": "2026-04-13T10:00:00"
    }
]

@router.get("", response_model=List[dict])
async def list_posts(author: Optional[str] = None):
    if author:
        return [p for p in posts_db if p["author"] == author]
    return posts_db

@router.get("/{post_id}")
async def get_post(post_id: int):
    post = next((p for p in posts_db if p["id"] == post_id), None)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post

@router.post("")
async def create_post(post_data: dict):
    new_post = {
        "id": max(p["id"] for p in posts_db) + 1,
        **post_data,
        "created_at": datetime.now().isoformat()
    }
    posts_db.append(new_post)
    return new_post
```

### Step 3：Docker 容器化

```dockerfile
# Dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

```yaml
# docker-compose.yml
services:
  api:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - .:/app
    environment:
      - DATABASE_URL=postgresql://dev:dev@db:5432/blogdb
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: blogdb
    volumes:
      - pgdata:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data

volumes:
  pgdata:
  redisdata:
```

### Step 4：启动与测试

```bash
# 一键启动所有服务
docker compose up -d --build

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f api

# 测试 API
curl http://localhost:8000/health
curl http://localhost:8000/api/posts
curl http://localhost:8000/api/posts/1
```

打开浏览器访问：
- `http://localhost:8000` — API 根路径
- `http://localhost:8000/docs` — 自动生成的 Swagger 文档 🎉

---

## 二、实战项目：前端开发工作流

### 场景：用 Vue 3 + Vite 开发前端

```bash
# 创建 Vue 3 项目
npm create vite@latest my-frontend -- --template vue-ts
cd my-frontend

# 启动开发服务器（热更新）
npm run dev
# → VITE ready in xxx ms
# → ➜  Local:   http://localhost:5173/
```

由于使用了镜像网络模式（mirrored），`http://localhost:5173` 可以直接在 Windows 浏览器中访问。

### VS Code 集成体验

```
┌──────────────────────────────────────────────────┐
│  Windows 桌面                                      │
│  ┌────────────────────────────────────────────┐   │
│  │  VS Code (Remote-WSL)                      │   │
│  │                                            │   │
│  │  左侧: 文件浏览器（WSL 内的文件）           │   │
│  │  底部: 终端（WSL Bash）                     │   │
│  │  右侧: 编辑器（语法高亮、智能补全）          │   │
│  │                                            │   │
│  │  npm run dev → 终端输出端口                 │   │
│  │  Ctrl+点击 URL → Windows 浏览器自动打开     │   │
│  └────────────────────────────────────────────┘   │
│                                                    │
│  Windows 浏览器 ←── localhost:5173 ──→ WSL Vite   │
└──────────────────────────────────────────────────┘
```

---

## 三、十大高频故障排查手册

### ❌ 问题 1：WSL 无法启动 / 卡在 "Installing..."

**症状**：打开 Ubuntu 后一直显示 "Installing, this may take a few minutes..." 或无反应。

**解决方案**：
```powershell
# 方法一：完全重置
wsl --shutdown                    # 关闭所有实例
wsl --unregister Ubuntu-24.04     # 卸载问题发行版
wsl --install -d Ubuntu-24.04     # 重新安装

# 方法二：检查 WSL 版本
wsl --version                     # 版本是否过低？
wsl --update                      # 更新到最新版

# 方法三：重启 LxssManager 服务
net stop LxssManager && net start LxssManager
```

### ❌ 问题 2：网络无法连接 / DNS 解析失败

**症状**：WSL 内 ping 不通外网，或 `apt update` 失败。

**解决方案**：
```bash
# 方法一：修复 DNS（最常见原因）
sudo rm /etc/resolv.conf
sudo bash -c 'echo "nameserver 8.8.8.8" > /etc/resolv.conf'
sudo bash -c 'echo "nameserver 114.114.114.114" >> /etc/resolv.conf'
sudo chattr +i /etc/resolv.conf  # 防止被覆盖

# 方法二：检查网络模式
cat /etc/wsl.conf
# 确保 networkingMode 配置正确

# 方法三：重启网络服务
sudo service network-manager restart
# 或
sudo systemctl restart systemd-networkd
```

### ❌ 问题 3：Git 操作极慢

**症状**：`git status`、`git clone` 在 WSL 中非常慢。

**解决方案**：
```bash
# 原因：项目放在了 /mnt/c/ （Windows 目录）

# 解决方案：把项目移到 Linux 文件系统！
cp -r /mnt/c/Users/name/project/* ~/project/
cd ~/project

# 再次执行 git status → 秒级响应 ✅
```

### ❌ 问题 4：C 盘空间被大量占用

**症状**：C 盘可用空间越来越少，发现 ext4.vhdx 占了几十 GB。

**解决方案**：
```powershell
# Step 1: 关闭 WSL
wsl --shutdown

# Step 2: 清理 WSL 内部文件（见前文第四节）

# Step 3: 压缩 vhdx
diskpart
# diskpart 中输入：
select vdisk file="你的ext4.vhdx完整路径"
compact vdisk
exit

# Step 4: 如果还不够，迁移到 D 盘（见前文第五节）
```

### ❌ 问题 5：VS Code Remote 连接失败

**症状**：提示 "Cannot connect to WSL" 或 "Connection reset"。

**解决方案**：
```powershell
# Step 1: 重启 WSL
wsl --shutdown

# Step 2: 更新 VS Code Remote 扩展
# 打开扩展面板 → Remote - WSL → 更新到最新版本

# Step 3: 重建 Server
# 在 WSL 中删除旧的 server
rm -rf ~/.vscode-server
# 重新连接时 VS Code 会自动安装新的

# Step 4: 检查磁盘空间
df -h ~  # 确保有足够空间安装 server
```

### ❌ 问题 6：端口被占用 / localhost 无法访问

**症状**：WSL 中启动的服务，Windows 浏览器打不开。

**解决方案**：
```powershell
# 方法一：确认网络模式为 mirrored
# ~/.wslconfig 中设置 networkingMode=mirrored

# 方法二：手动添加端口转发（非 mirrored 模式需要）
netsh interface portproxy add v4tov4 listenport=8080 \
    listenaddress=0.0.0.0 connectport=8080 connectaddress=$(wsl hostname -I)

# 方法三：检查防火墙
# Windows Defender 允许入站规则中的对应端口
```

### ❌ 问题 7：文件权限错误（Permission denied）

**症状**：操作 `/mnt/c/` 下的文件时提示权限不足。

**解决方案**：
```bash
# 方法一：使用 /etc/wsl.conf 配置挂载选项
sudo tee -a /etc/wsl.conf << 'EOF'
[automount]
options = "metadata,uid=1000,gid=1000,umask=0022"
EOF
# 然后 wsl --shutdown 并重新打开

# 方法二：修改文件所有权
sudo chown -R $USER:$USER /mnt/c/path/to/folder

# 方法三：不要在 WSL 中操作 Windows 系统文件
# C:\Windows, C:\Program Files 等目录不建议修改
```

### ❌ 问题 8：内存占用过高导致电脑卡顿

**症状**：任务管理器显示 Vmmem 进程占用大量内存。

**解决方案**：
```ini
# ~/.wslconfig 中限制内存
[wsl2]
memory=6GB        # 根据实际需求调整
processors=4
swap=2GB
vmIdleTimeout=-1
```

```powershell
# 保存后执行
wsl --shutdown    # 生效
```

### ❌ 问题 9：systemd 服务不运行

**症状**：`sudo systemctl start mysql` 提示 "System has not been booted with systemd."

**解决方案**：
```bash
# 检查 /etc/wsl.conf 是否配置了 systemd
cat /etc/wsl.conf

# 应该包含以下内容（如果没有就加上）：
sudo tee /etc/wsl.conf << 'EOF'
[boot]
systemd=true
EOF

# 重启 WSL 使生效
# PowerShell 中执行：
wsl --shutdown
# 然后重新打开 Ubuntu

# 验证
systemctl is-system-running  # 应返回 running
```

### ❌ 问题 10：Docker Desktop 连接 WSL 失败

**症状**：Docker Desktop 的 WSL Integration 选项中没有显示发行版。

**解决方案**：
```powershell
# Step 1: 确认 WSL 2 后端已启用
# Docker Desktop → Settings → General → Use the WSL 2 based engine ✓

# Step 2: 确认发行版版本为 WSL 2
wsl --list -v
# VERSION 列应该显示 2
# 如果是 1，转换它：wsl --set-version Ubuntu-24.04 2

# Step 3: 重启 Docker Desktop
# 右键托盘图标 → Restart

# Step 4: 在 Settings → Resources → WSL Integration 中勾选发行版
```

---

## 四、故障排查通用方法论

遇到问题时，按以下顺序排查：

```
┌─────────────────────────────────────────────┐
│           WSL 排查四步法                      │
│                                             │
│  ① 重启大法                                  │
│     wsl --shutdown → 重新打开               │
│                                             │
│  ② 查看版本                                  │
│     wsl --version                           │
│     wsl --update（保持最新！）               │
│                                             │
│  ③ 检查日志                                   │
│     dmesg | tail -20                        │
│     journalctl -xe                          │
│     /var/log/syslog                        │
│                                             │
│  ④ 搜索官方 Issue                            │
│     github.com/microsoft/WSL/issues        │
│     大概率别人已经遇到过并解决了             │
└─────────────────────────────────────────────┘
```

---

## 五、性能监控工具推荐

| 工具 | 功能 | 安装 |
|:---|:---|:---|
| **htop** | 进程/CPU/内存监控 | `sudo apt install htop` |
| **iotop** | 磁盘 I/O 实时监控 | `sudo apt install iotop` |
| **iftop** | 网络流量实时查看 | `sudo apt install iftop` |
| **ncdu** | 磁盘空间交互式分析 | `sudo apt install ncdu` |
| **speedtest-cli** | 网速测试 | `sudo apt install speedtest-cli` |
| **glances** | 全能系统监控 | `sudo pip install glances` |

```bash
# 一键安装全部监控工具
sudo apt install htop iotop iftop ncdu speedtest-cli
sudo pip install glances

# 快速使用
htop           # CPU/内存
iotop          # 磁盘读写
ncdu ~/        # 目录大小分析
speedtest      # 网速测试
glances        # 一目了然的全局监控
```

---

## 六、系列教程总结与展望

至此，我们的 WSL 五篇系列教程已经完成！让我们回顾一下整个学习路线：

| 篇数 | 主题 | 核心收获 |
|:---:|:---|:---|
| 第1篇 | **入门与安装配置** | 了解 WSL 背景，完成环境搭建 |
| 第2篇 | **基础操作与常用命令** | 文件、网络、GUI 全面掌握 |
| 第3篇 | **开发环境搭建** | 多语言开发 + IDE + 数据库 + Docker |
| 第4篇 | **进阶技巧与性能优化** | 性能调优、多发行版、终端美化 |
| 第5篇 | **实战案例与故障排查** | 项目实战 + 十大故障解决 |

### 下一步建议

- 🔧 **动手做项目**：理论结合实践才能真正掌握
- 💬 **加入社区**：[GitHub Issues](https://github.com/microsoft/WSL/issues) 提问交流
- 📖 **深入阅读**：[微软官方文档](https://learn.microsoft.com/zh-cn/windows/wsl/) 获取最新信息
- 🔄 **持续更新**：WSL 发展很快，保持关注新特性

---

> **💡 感谢你跟随完成了全部 5 篇教程！**
> 
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
> 
> ❤️ 觉得有用？点个"在看"，分享给更多开发者朋友！我们下个系列见！
