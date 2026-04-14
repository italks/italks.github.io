# WSL 开发环境搭建：从编译器到 IDE，打造完美开发工作站

> **阅读时长**：约 25 分钟 | **难度等级**：⭐⭐⭐☆☆ 进阶实战
>
> 在 WSL 中搭建完整的开发环境，涵盖主流编程语言、编辑器、数据库和容器工具。

---

## 一、为什么选择 WSL 作为开发环境？

### 1.1 传统 Windows 开发的痛点

```
传统 Windows 开发：
┌─────────────────────────────────────────┐
│  ❌ 很多开源工具没有 Windows 版          │
│  ❌ 路径问题（反斜杠 vs 正斜杠）         │
│  ❌ 换行符问题（CRLF vs LF）            │
│  ❌ Shell 命令不兼容（CMD/PS vs Bash）   │
│  ❌ 权限问题（文件权限语义不同）          │
│  ❌ 编译环境配置繁琐                      │
└─────────────────────────────────────────┘

WSL 开发：
┌─────────────────────────────────────────┐
│  ✅ 原生 Linux 工具链，开箱即用          │
│  ✅ 与 Windows 共享文件和剪贴板           │
│  ✅ VS Code 远程开发，体验无缝            │
│  ✅ Docker 完整支持                       │
│  ✅ 接近生产环境（服务器大多跑 Linux）     │
│  ✅ 不影响日常使用 Windows                │
└─────────────────────────────────────────┘
```

### 1.2 开发环境总览

本教程将搭建以下开发环境：

| 类别 | 工具 | 适用场景 |
|:---|:---|:---|
| **C/C++** | GCC, G++, Make, CMake | 系统编程、算法竞赛 |
| **Python** | Python 3, pip, venv, uv | 数据科学、Web 开发、AI |
| **JavaScript/TS** | Node.js, pnpm, npm | 前端、后端、全栈 |
| **Go** | Go, Go modules | 云原生、微服务 |
| **Rust** | rustc, cargo | 系统编程、高性能应用 |
| **Java** | JDK, Maven, Gradle | 企业级应用 |
| **IDE** | VS Code Remote - WSL | 统一编辑器 |
| **数据库** | MySQL, Redis, PostgreSQL | 数据持久化 |
| **容器** | Docker Desktop | 微服务部署 |

---

## 二、基础编译工具链

无论你用什么语言，以下基础工具都是必备的：

```bash
# 更新软件源
sudo apt update

# 安装构建基础工具包（包含 gcc, make, g++ 等）
sudo apt install -y build-essential

# 安装常用开发工具
sudo apt install -y \
    git \
    curl \
    wget \
    vim \
    nano \
    tree \
    htop \
    jq \
    unzip \
    zip \
    ca-certificates \
    gnupg \
    lsb-release \
    software-properties-common \
    apt-transport-https

# 验证安装
gcc --version      # GCC 编译器
make --version     # 构建工具
git --version      # 版本控制
```

### 2.1 CMake 安装（C/C++ 项目管理）

```bash
# 安装 CMake
sudo apt install -y cmake

# 验证
cmake --version

# 快速测试：创建一个 Hello World C++ 项目
mkdir -p ~/test-cpp && cd ~/test-cpp

# 创建 main.cpp
cat > main.cpp << 'EOF'
#include <iostream>

int main() {
    std::cout << "Hello from WSL!" << std::endl;
    return 0;
}
EOF

# 创建 CMakeLists.txt
cat > CMakeLists.txt << 'EOF'
cmake_minimum_required(VERSION 3.10)
project(HelloWSL)
add_executable(hello main.cpp)
EOF

# 构建
cmake -B build && cmake --build build

# 运行
./build/hello
```

---

## 三、Python 开发环境

### 3.1 系统 Python + pip

```bash
# Ubuntu 24.04 自带 Python 3.12+
python3 --version

# 安装 pip 和 venv
sudo apt install -y python3-pip python3-venv python3-dev

# 升级 pip 到最新版
python3 -m pip install --upgrade pip
```

### 3.2 使用虚拟环境（推荐 ✅✅✅）

```bash
# 创建项目目录
mkdir -p ~/projects/my-python-app && cd ~/projects/my-python-app

# 创建虚拟环境
python3 -m venv .venv

# 激活虚拟环境
source .venv/bin/activate

# 激活后提示符会变化：( .venv ) user@pc:~$

# 安装依赖
pip install requests flask pandas numpy

# 查看已安装的包
pip list

# 退出虚拟环境
deactivate
```

> ⚠️ **永远不要在系统 Python 中 `sudo pip install`！** 这会导致系统包管理混乱。始终使用虚拟环境。

### 3.3 包管理器选择指南

| 工具 | 适用场景 | 特点 |
|:---|:---|:---|
| **pip + venv** | 轻量项目、学习使用 | Python 官方方案 |
| **uv** 🌟 | 新项目首选（2025+） | 比 pip/poetry 快 10-100 倍 |
| **poetry** | 中大型项目 | 依赖管理+打包一体化 |
| **conda/miniconda** | 数据科学、AI | 科学计算生态丰富 |

**uv 快速上手**（当前最推荐的现代 Python 包管理器）：

```bash
# 安装 uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# 创建项目
uv init my-project && cd my-project

# 添加依赖
uv add requests fastapi uvicorn

# 运行
uv run python main.py
```

### 3.4 常用 Python 开发包一键安装

```bash
pip install --upgrade \
    jupyter        # 交互式笔记本
    numpy          # 数值计算
    pandas         # 数据分析
    matplotlib     # 可视化
    requests       # HTTP 请求
    flask          # Web 框架
    fastapi        # 现代 API 框架
    pytest         # 测试框架
    black          # 代码格式化
    mypy           # 类型检查
    httpie         # HTTP 调试工具
```

---

## 四、Node.js / JavaScript 开发环境

### 4.1 使用 fnm 管理 Node 版本（推荐）

```bash
# 安装 fnm (Fast Node Manager)
curl -fsSL https://fnm.vercel.app/install | bash

# 重启 shell 或执行：
source ~/.bashrc

# 安装最新 LTS 版本的 Node.js
fnm install --lts

# 安装指定版本
fnm install 20
fnm install 22

# 切换版本
fnm use 22
fnm default 22        # 设为默认

# 验证
node --version
npm --version
```

### 4.2 包管理器选择

```bash
# npm（Node.js 自带）
npm install -g pnpm   # 推荐：快速节省磁盘空间
npm install -g yarn   # 另一个流行选择

# 验证
pnpm --version
```

| 包管理器 | 优点 | 适用场景 |
|:---|:---|:---|
| **pnpm** 🌟 | 节省磁盘、严格依赖、速度快 | 新项目推荐 |
| **npm** | 官方自带、兼容性最好 | 通用场景 |
| **yarn** | 工作区支持好 | Monorepo 项目 |

### 4.3 常用全局工具

```bash
# 全局安装常用开发工具
pnpm add -g \
    typescript        # TypeScript 编译器
    ts-node           # 直接运行 TS 文件
    nodemon           # 自动重启服务
    pm2               # 进程管理器
    @vue/cli          # Vue 脚手架
    create-next-app   # Next.js 脚手架
    vite              # 构建工具
    eslint            # 代码检查
    prettier          # 代码格式化

# 验证 TypeScript
tsc --version
```

---

## 五、Go 语言开发环境

```bash
# 下载并安装 Go（以 Go 1.22 为例）
wget https://go.dev/dl/go1.22.0.linux-amd64.tar.gz
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.22.0.linux-amd64.tar.gz

# 添加到 PATH（写入 bashrc）
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
echo 'export GOPATH=$HOME/go' >> ~/.bashrc
echo 'export PATH=$PATH:$GOPATH/bin' >> ~/.bashrc
source ~/.bashrc

# 验证
go version

# 初始化一个新模块测试
mkdir -p ~/projects/hello-go && cd ~/projects/hello-go
go mod init hello-go

cat > main.go << 'EOF'
package main

import "fmt"

func main() {
    fmt.Println("Hello from Go on WSL!")
}
EOF

go run main.go
```

---

## 六、Rust 语言开发环境

```bash
# 使用官方安装脚本（rustup）
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 选择默认选项（输入 1 回车即可）
source ~/.cargo/env

# 验证
rustc --version
cargo --version

# 常用工具
rustup component add rust-analyzer clippy rustfmt

# 测试
cd ~ && cargo init hello-rust && cd hello-rust
cargo run
```

---

## 七、VS Code Remote - WSL 配置（重点 ⭐⭐⭐⭐⭐）

这是 WSL 开发的核心——让 VS Code 直接操作 WSL 内的文件！

### 7.1 安装扩展

在 Windows 的 VS Code 中安装以下扩展：

| 扩展名 | 用途 | 必要性 |
|:---|:---|:---:|
| **Remote - WSL** | 连接 WSL 环境 | 🔴 必须 |
| **Remote - Containers** | Dev Container 支持 | 🟡 推荐 |
| **Pylance / Python** | Python 开发 | 🟡 按需 |
| **ESLint** | JS/TS 代码检查 | 🟡 按需 |
| **Go** | Go 语言支持 | 🟡 按需 |
| **rust-analyzer** | Rust 开发 | 🟡 按需 |
| **C/C++ Intellisense** | C/C++ 开发 | 🟡 按需 |

### 7.2 连接 WSL

```
方法一：命令面板
1. Ctrl + Shift + P → 输入 "WSL"
2. 选择 "Remote-WSL: Connect to WSL"
3. 选择发行版 → 自动打开新窗口

方法二：左下角图标
1. 点击 VS Code 左下角绿色图标
2. 选择 "Connect to WSL" 或具体发行版

方法三：终端中启动
code .          # 在 WSL 终端中直接运行
code folder/    # 打开指定目录
```

连接成功后，VS Code 窗口底部状态栏会显示 **WSL: Ubuntu-24.04**。

### 7.3 推荐的 VS Code 设置（WSL 专用）

在 WSL 中按 `Ctrl+Shift+P` → "Open User Settings (JSON)"：

```json
{
    // 编辑器设置
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.fontSize": 14,
    "editor.fontFamily": "'Cascadia Mono', 'Fira Code', Consolas",
    "editor.renderWhitespace": "boundary",
    
    // 终端设置
    "terminal.integrated.defaultProfile.linux": "bash",
    "terminal.integrated.fontSize": 14,
    "terminal.integrated.cursorBlinking": true,
    
    // 文件保存相关
    "files.eol": "\n",                    // LF 换行符（Linux 风格）
    "files.insertFinalNewline": true,
    "files.trimTrailingWhitespace": true,
    
    // Python 相关
    "[python]": {
        "editor.defaultFormatter": "ms-python.black-formatter",
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
            "source.organizeImports": "explicit"
        }
    },
    
    // Git 相关
    "git.enableSmartCommit": true,
    "git.autofetch": true,
    "git.confirmSync": false,
    
    // WSL 特定优化
    "remote.WSL.fileWatcher.polling": true,    // 解决文件监听问题
}
```

### 7.4 推荐的 WSL 扩展组合

```bash
# 在 WSL 中安装语言服务器和工具
sudo apt install -y \
    clangd \           # C/C++ LSP
    python3-lsp-server \ # Python LSP (pylsp)
    node-typescript    # TypeScript 类型信息

# Python LSP 也可以用更强大的 pylance
# （通过 VS Code Pylance 扩展自动处理）
```

---

## 八、Git 配置最佳实践

### 8.1 初始配置

```bash
# 全局配置
git config --global user.name "你的名字"
git config --global user.email "your@email.com"

# 默认分支名为 main
git config --global init.defaultBranch main

# 设置默认编辑器为 VS Code
git config --global core.editor "code --wait"

# 换行符处理（重要！避免 CRLF/LF 混乱）
git config --global core.autocrlf input    # 在 Linux/WSL 中用这个

# 显示颜色
git config --global color.ui auto

# 更简洁的状态输出
git config --global status.short true

# 验证配置
git config --list --global
```

### 8.2 SSH 密钥配置

```bash
# 生成 SSH 密钥（用于 GitHub/GitLab 认证）
ssh-keygen -t ed25519 -C "your@email.com"

# 复制公钥到剪贴板
cat ~/.ssh/id_ed25519.pub | clip.exe

# 粘贴到 GitHub Settings → SSH and GPG keys → New SSH key

# 测试连接
ssh -T git@github.com
# Hi username! You've successfully authenticated...
```

### 8.3 常用的 Git Alias（快捷别名）

```bash
# 添加实用别名
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.lg "log --oneline --graph --all --decorate"
git config --global alias.undo 'reset HEAD~1 --soft'

# 使用示例
git co main             # = git checkout main
git br -a               # = git branch -a
git ci -m "fix: xxx"    # = git commit -m "fix: xxx"
git st                  # = git status
git lg                  # = 漂亮的提交历史图
git undo                # = 撤销上一次提交
```

---

## 九、数据库环境搭建

### 9.1 MySQL / MariaDB

```bash
# 安装 MariaDB（MySQL 的完全兼容开源替代）
sudo apt install -y mariadb-server

# 启动服务
sudo systemctl start mariadb
sudo systemctl enable mariadb   # 开机自启

# 安全初始化（设置 root 密码等）
sudo mysql_secure_installation

# 登录
sudo mysql -u root -p

# 创建用户和数据库（在 MySQL 提示符下）
CREATE DATABASE myapp DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'devuser'@'%' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON myapp.* TO 'devuser'@'%';
FLUSH PRIVILEGES;

# 允许远程连接
sudo sed -i 's/bind-address.*/bind-address = 0.0.0.0/' /etc/mysql/mariadb.conf.d/50-server.cnf
sudo systemctl restart mariadb
```

### 9.2 Redis

```bash
# 安装 Redis
sudo apt install -y redis-server

# 启动
sudo systemctl start redis-server
sudo systemctl enable redis-server

# 测试连接
redis-cli ping
# 应返回 PONG

# 常用操作
redis-cli SET mykey "Hello WSL"
redis-cli GET mykey
redis-cli INFO server
```

### 9.3 PostgreSQL

```bash
# 安装 PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# 启动
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 切换到 postgres 用户创建数据库
sudo -u postgres createdb mydb
sudo -u postgres createuser -P devuser   # 会提示输入密码

# 授权访问
sudo -u postgres psql
# 进入 psql 后执行：
GRANT ALL PRIVILEGES ON DATABASE mydb TO devuser;
\q

# 连接测试
psql -h localhost -U devuser -d mydb
```

### 9.4 数据库 GUI 客户端推荐

| 工具 | 平台 | 特点 |
|:---|:---|:---|
| **DBeaver** | Windows/Linux | 免费全能，支持所有主流数据库 |
| **TablePlus** | macOS/Win/Linux | 简洁美观，部分收费 |
| **DataGrip** | JetBrains | 功能强大（付费） |
| **Beekeeper Studio** | 跨平台 | 开源免费，界面友好 |

```bash
# DBeaver 可以直接在 Windows 上运行
# 通过 localhost 连接 WSL 中的数据库
explorer.exe https://dbeaver.io/download/
```

---

## 十、Docker Desktop 集成

### 10.1 为什么 WSL 2 + Docker 是黄金组合？

```
传统 Docker Desktop（Hyper-V 后端）：
Windows → Hyper-V VM → Docker Engine → Containers

Docker Desktop（WSL 2 后端）：⚡更快！
Windows → WSL 2 VM → Docker Engine → Containers
                     ↑
                 已有 WSL VM，无需额外虚拟化开销！
```

### 10.2 安装与配置

**Step 1**: 下载 [Docker Desktop](https://www.docker.com/products/docker-desktop/) 并安装

**Step 2**: 设置 WSL 2 后端

```
Docker Desktop → Settings → General:
☑️ Use the WSL 2 based engine

Settings → Resources → WSL Integration:
☑️ Enable integration with my default WSL distro
☑️ Ubuntu-24.04
```

**Step 3**: 重启 Docker Desktop

### 10.3 验证与使用

```bash
# 在 WSL 中验证
docker --version
docker compose version

# 运行第一个容器
docker run hello-world

# 运行 Nginx 服务
docker run -d -p 8080:80 nginx

# 浏览器访问 http://localhost:8080 即可看到 Nginx 欢迎页

# 使用 docker-compose 示例
mkdir -p ~/projects/docker-demo && cd ~/projects/docker-demo

cat > docker-compose.yml << 'EOF'
services:
  web:
    image: nginx:alpine
    ports:
      - "8080:80"
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
EOF

docker compose up -d
docker compose ps
docker compose logs -f web
```

### 10.4 Docker 常用命令速查

```bash
# 镜像操作
docker pull ubuntu:24.04
docker images
docker rmi <image_id>

# 容器操作
docker ps              # 运行中的容器
docker ps -a           # 所有容器
docker stop <id>       # 停止
docker rm <id>         # 删除
docker logs -f <id>    # 查看日志
docker exec -it <id> bash  # 进入容器内部

# 清理（释放磁盘空间）
docker system prune -a    # 清除未使用的镜像和容器
```

---

## 十一、完整开发环境检查清单

完成以上配置后，用以下命令验证你的环境：

```bash
#!/bin/bash
# save as check-env.sh, then chmod +x check-env.sh && ./check-env.sh

echo "==========================================="
echo "  WSL 开发环境检查清单"
echo "==========================================="

echo -n "📦 Build Tools (GCC):  "
gcc --version 2>/dev/null | head -n1 || echo "❌ 未安装"

echo -n "📦 Make:              "
make --version 2>/dev/null | head -n1 | awk '{print $1, $4}' || echo "❌ 未安装"

echo -n "🐍 Python:            "
python3 --version || echo "❌ 未安装"

echo -n "📦 pip:               "
pip --version 2>/dev/null | awk '{print $1, $2}' || echo "❌ 未安装"

echo -n "📦 Node.js:           "
node --version 2>/dev/null || echo "❌ 未安装"

echo -n "📦 npm:               "
npm --version 2>/dev/null || echo "❌ 未安装"

echo -n "🦀 Go:                "
go version 2>/dev/null || echo "❌ 未安装"

echo -n "🦀 Rust:              "
rustc --version 2>/dev/null || echo "❌ 未安装"

echo -n "📦 Git:               "
git --version 2>/dev/null || echo "❌ 未安装"

echo -n "🐳 Docker:            "
docker --version 2>/dev/null || echo "❌ 未安装"

echo -n "🗄️ MySQL/MariaDB:     "
mysql --version 2>/dev/null || echo "❌ 未安装"

echo -n "🔴 Redis:             "
redis-cli ping 2>/dev/null || echo "❌ 未运行"

echo -n "🐘 PostgreSQL:        "
psql --version 2>/dev/null || echo "❌ 未安装"

echo -n "✏️ VS Code Remote:     "
if pgrep -f "code.*wsl" > /dev/null; then echo "✅ 已连接"; else echo "⚠️ 未检测到"; fi

echo "==========================================="
echo "  检查完成！"
echo "==========================================="
```

---

## 十二、下期预告

下一篇我们将深入 **《WSL 进阶技巧与性能优化》**，内容包括：

- ⚡ WSL 2 性能瓶颈深度分析与实测数据
- 💾 内存管理和 .wslconfig 最佳配置
- 💿 磁盘空间优化与清理技巧
- 🔄 多发行版管理与高效切换策略
- 📦 WSL 导入导出与备份恢复实战
- 🔧 让 WSL 启动速度提升的秘密

---

> **💡 觉得有用？点个"在看"分享给更多开发者朋友！**
> 
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
> 
> 💬 你的开发环境还装了什么好东西？评论区分享一下！
