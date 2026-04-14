# Dev Container：团队统一开发环境的终极方案

> **阅读时长**：约 11 分钟 | **难度等级**：⭐⭐⭐⭐ 高级实战
> **本篇关键词**：Dev Container / devcontainer.json / 统一环境 / 团队协作 / Docker
>
> "在我的机器上能跑"是开发者的噩梦。Dev Container 用容器化方案确保团队成员使用完全一致的开发环境，从操作系统依赖到编辑器扩展，一键复刻。

---

## 什么是 Dev Container？

### 核心理念

```
传统开发环境问题：
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ 开发者 A     │   │ 开发者 B     │   │ 开发者 C     │
│ Python 3.11 │   │ Python 3.12 │   │ Python 3.10 │
│ Node 18    │   │ Node 20     │   │ Node 19     │
│ MySQL 8.0  │   │ PostgreSQL  │   │ MariaDB     │
│ "能跑！"    │   │ 报错了 ❌    │   │ 缺包 ❌      │
└─────────────┘   └─────────────┘   └─────────────┘

Dev Container 方案：
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ 开发者 A     │   │ 开发者 B     │   │ 开发者 C     │
│ ════════════ │   │ ════════════ │   │ ════════════ │
│ 同一个容器   │←─→│ 同一个容器   │←─→│ 同一个容器   │
│ 完全一致 ✅  │   │ 完全一致 ✅  │   │ 完全一致 ✅  │
└─────────────┘   └─────────────┘   └─────────────┘
         ↑                    ↑                    ↑
    devcontainer.json（定义在代码仓库中，版本管理）
```

### 工作原理

```
你的项目仓库:
my-project/
├── .devcontainer/
│   └── devcontainer.json    ← 定义开发环境的"配方"
├── src/
└── README.md

团队成员操作：
git clone → VS Code 打开 → 
F1 → "Dev Containers: Reopen in Container" →
自动构建 → 进入统一环境 ✅
```

---

## 编写第一个 devcontainer.json

### 基础模板

```json
// .devcontainer/devcontainer.json
{
  "name": "My Project Dev Environment",
  
  // 使用官方镜像作为基础
  "image": "mcr.microsoft.com/devcontainers/python:3.12",
  
  // 或基于 Dockerfile 构建
  // "build": { "dockerfile": "Dockerfile" },
  
  // 功能特性（预配置组件）
  "features": {
    "ghcr.io/devcontainers/features/node:1": {},
    "ghcr.io/devcontainers/features/docker-in-docker:2": {},
    "ghcr.io/devcontainers/features/common-utils:2": {}
  },

  // 自定义配置
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-python.python",
        "ms-python.vscode-pylance",
        "ms-python.black-formatter",
        "eamodio.gitlens",
        "PKief.material-icon-theme"
      ],
      "settings": {
        "python.defaultInterpreterPath": "/usr/local/bin/python",
        "editor.formatOnSave": true,
        "[python]": {
          "editor.defaultFormatter": "ms-python.black-formatter"
        }
      }
    }
  },

  // 端口转发
  "forwardPorts": [8000, 3000, 5000, 8080],

  // 挂载点（可选）
  // "mounts": [
  //   "source=${localEnv:HOME}/.ssh,target=/root/.ssh,type=bind"
  // ],

  // 容器启动后执行的命令
  "postCreateCommand": "pip install -r requirements.txt && echo '✅ Dev environment ready!'",

  // 远程用户
  "remoteUser": "vscode"
}
```

---

## 常用场景配置

### 场景一：Python 全栈项目

```json
{
  "name": "Python Full-Stack",
  "image": "mcr.microsoft.com/devcontainers/python:3.12",
  "features": {
    "ghcr.io/devcontainers/features/python:1": {"version": "3.12"}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-python.python",
        "ms-python.vscode-pylance",
        "ms-python.debugpy",
        "charliermarsh.ruff",
        "mechatlinder.vscode-github-actions-io",
        "GitHub.copilot"
      ]
    }
  },
  "forwardPorts": [8000, 8888],
  "postCreateCommand": "pip install fastapi uvicorn sqlalchemy pytest httpie && pip install -r requirements.txt 2>/dev/null || true"
}
```

### 场景二：Node.js 前端项目

```json
{
  "name": "Node.js Frontend",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
  "features": {
    "ghcr.io/devcontainers/features/node:1": {"version": "20"}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "dbaeumer.vscode-eslint",
        "esbenp.prettier-vscode",
        "bradlc.vscode-tailwindcss",
        "formulahendry.auto-rename-tag",
        "GitHub.copilot",
        "usernamehw.errorlens"
      ],
      "settings": {
        "node.autodetect": "on"
      }
    }
  },
  "forwardPorts": [3000, 5173],
  "postCreateCommand": "npm install"
}
```

### 场景三：Go 后端服务

```json
{
  "name": "Go Backend",
  "image": "mcr.microsoft.com/devcontainers/go:1.22",
  "features": {
    "ghcr.io/devcontainers/features/go:1": {}
  },
  "customizations": {
    "vscode": {
      "extensions": [
        "golang.Go",
        "gopls",
        "prempilot.devtools-yap"
      ]
    }
  },
  "forwardPorts": [8080, 3000],
  "remoteEnv": {
    "GOPATH": "/workspace/go",
    "PATH": "/usr/local/go/bin:/workspace/go/bin:${containerEnv:PATH}"
  },
  "postCreateCommand": "go mod download && go install github.com/air-verse/air@latest"
}
```

### 场景四：多容器编排（前后端 + 数据库）

```json
{
  "name": "Full Stack App",
  "dockerComposeFile": "docker-compose.yml",
  "service": "app",
  "workspaceFolder": /workspace",
  "customizations": {
    "vscode": {
      "extensions": [
        "ms-python.python",
        "ms-python.vscode-pylance",
        "dbaeumer.vscode-eslint",
        "eamodio.gitlens"
      ]
    }
  },
  "forwardPorts": [8000, 3000, 5432, 6379]
}
```

配合 `docker-compose.yml`：
```yaml
services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    volumes:
      - ..:/workspace:cached
    command: sleep infinity
    depends_on:
      - db
      - redis

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: appdb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

---

## 使用方式

### 在 WSL 中使用 Dev Container

```bash
# 前提条件：
# 1. Docker Desktop 已安装且运行（WSL 后端）
# 2. VS Code Remote 扩展已安装（Remote - Containers）

# 操作步骤：

# 方式一：VS Code 图形界面
# 1. VS Code 中打开项目目录
# 2. 按 F1 或 Ctrl+Shift+P
# 3. 输入 "Dev Containers: Reopen in Container"
# 4. 选择 devcontainer.json 中的配置
# 5. 等待构建完成（首次需要下载镜像）

# 方式二：命令行
code --folder-uri vscode-remote://devcontainer+/path/to/project

# 构建完成后：
# VS Code 底部状态栏显示 "Dev Container: 项目名"
# 终端自动进入容器内部
# 所有扩展都安装在容器中
```

### 常用 Dev Container 命令

```
F1 (命令面板) → 输入 "Dev Containers":

Reopen in Container              # 在容器中重新打开
Rebuild Container                # 重新构建（修改 devcontainer.json 后）
Rebuild Without Cache            # 无缓存重建（彻底重建）
Attach to Running Container       # 连接到运行中的容器
Show Container Logs               # 查看容器日志
Clone Repository in Container     # 直接在容器中克隆仓库
```

---

## Features 生态精选

Dev Container Features 是可复用的配置单元，由社区维护：

| Feature ID | 功能 | 安装内容 |
|:---|:---|:---|
| `node:1` | Node.js | npm, pnpm, nvm/fnm |
| `python:1` | Python | pip, venv, 常用包 |
| `go:1` | Go | go, gopls, delve |
| `rust:1` | Rust | rustc, cargo, rust-analyzer |
| `java:1` | Java | JDK, Maven, Gradle |
| `docker-in-docker:2` | Docker | Docker CLI（嵌套 Docker）|
| `common-utils:2` | 通用工具 | git, curl, jq, htop 等 |
| `github-cli:1` | GitHub CLI | gh 命令行工具 |
| `aws-cli:1` | AWS CLI | aws 命令行工具 |
| `terraform:1` | Terraform | IaC 工具 |

```json
// 一行添加任意 feature
"features": {
  "ghcr.io/devcontainers/features/docker-in-docker:2": {},
  "ghcr.io/devcontainers/features/github-cli:1": {},
  "ghcr.io/devcontainers/features/aws-cli:1": {}
}
```

---

## 团队协作最佳实践

### 1. devcontainer.json 放入版本控制

```
my-repo/
├── .devcontainer/
│   ├── devcontainer.json      ← 必须！所有人共享
│   └── Dockerfile              （可选）自定义构建
├── src/
├── tests/
└── .gitignore                  # 排除 .devcontainer/cache/
```

### 2. 提供多种配置选项

```json
// 可以创建多个配置文件供选择
// .devcontainer/devcontainer.json         # 默认配置（轻量）
// .devcontainer/devcontainer.full.json     # 完整配置（含数据库等）
// .devcontainer/devcontainer.ci.json      # CI/CD 配置
```

### 3. 文档化环境要求

```markdown
# README.md 中添加：

## 快速开始

### 使用 Dev Container（推荐）
1. 安装 [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. 安装 [VS Code](https://code.visualstudio.com/) + Remote Containers 扩展
3. 克隆本项目并打开
4. 按 F1 → "Dev Containers: Reopen in Container"
5. 等待构建完成后即可开始开发 ✅

### 手动搭建（备选）
详见 MANUAL_SETUP.md
```

### 4. CI/CD 集成思路

```yaml
# .github/workflows/ci.yml（示例）
# Dev Container 的 Dockerfile 也可直接用于 GitHub Actions
jobs:
  test:
    runs-on: ubuntu-latest
    container:
      image: mcr.microsoft.com/devcontainers/python:3.12
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r requirements.txt
      - run: pytest
```

---

## 下期预告

下一篇：**《除了 WSL 还有什么？8 种 Windows 上跑 Linux 方案横评》**

- 🖥️ VMware / VirtualBox 虚拟机
- ☁️ 云服务器远程开发
- 🐳 Docker Desktop 独立使用
- 🔄 Colab / GitPods 云 IDE
- 📊 全方位对比与选型建议

---

> **💡 你的团队用 Dev Container 吗？体验怎么样？**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
