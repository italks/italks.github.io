# Node.js / Go / Rust 在 WSL 中高效开发的秘诀

> **阅读时长**：约 12 分钟 | **难度等级**：⭐⭐☆☆☆ 入门进阶
> **本篇关键词**：Node.js / Go / Rust / 多语言开发 / 版本管理 / WSL
>
> 一个 WSL 环境可以同时跑 Node.js、Go、Rust 等多种语言。这篇教你用最少的配置搭建最高效的多语言开发环境。

---

## 一、Node.js 开发环境

### 安装方式：使用 fnm（Fast Node Manager）⭐推荐

为什么不用 nvm？**fnm 用 Rust 编写，比 nvm 快 10 倍以上**。

```bash
# 安装 fnm
curl -fsSL https://fnm.vercel.app/install | bash

# 重载 shell
source ~/.bashrc

# 验证
fnm --version
```

### 常用操作速查

```bash
# 安装 LTS 版本（长期支持版，生产首选）
fnm install --lts
# 或指定版本号
fnm install 20
fnm install 22          # 最新当前版

# 查看已安装的版本
fnm list

# 切换版本
fnm use 20              # 当前项目临时切换
fnm default 22          # 设为全局默认

# 运行指定版本（不切换）
fnm exec 18 node -v

# 卸载版本
fnm uninstall 16
```

### 包管理器选择：pnpm 🌟

```bash
# 安装 pnpm（通过 Corepack）
corepack enable
corepack prepare pnpm@latest --activate

# 或者全局安装 npm 包
npm i -g pnpm

# 验证
pnpm --version
```

| 特性 | npm | pnpm | yarn |
|:---|:---:|:---:|:---:|
| 安装速度 | ⚡⚡ | ⚡⚡⚡⚡⚡ | ⚡⚡⚡ |
| 磁盘占用 | 大（每个项目独立副本） | 小（硬链接/符号链接）| 中 |
| 严格依赖管理 | 否 | ✅ 默认 | 可选 |
| Monorepo 支持 | workspace | workspace | workspace |

### 全局常用工具

```bash
# 开发效率工具
pnpm add -g typescript ts-node
pnpm add -g nodemon pm2
pnpm add -g @vue/cli create-next-app
pnpm add -g vite eslint prettier
pnpm add -g turbo nx             # Monorepo 工具

# 调试与测试
pnpm add -g jest vitest

# 验证
tsc --version
nodemon --version
```

### 实际项目测试

```bash
# 创建一个 Vite + React 项目
pnpm create vite my-react-app --template react-ts
cd my-react-app
pnpm install
pnpm dev
# → http://localhost:5173 浏览器直接访问！
```

---

## 二、Go 语言环境

### 安装 Go

WSL 中安装 Go 非常简单：

```bash
# 方法一：apt 直接安装（版本可能不是最新）
sudo apt install -y golang-go
go version

# 方法二：官方安装脚本（推荐，获取最新版）
# 下载地址 https://go.dev/dl/
wget https://go.dev/dl/go1.22.0.linux-amd64.tar.gz
sudo rm -rf /usr/local/go
sudo tar -C /usr/local -xzf go1.22.0.linux-amd64.tar.gz
rm go1.22.0.linux-amd64.tar.gz

# 配置 PATH（写入 .bashrc）
echo 'export PATH=$PATH:/usr/local/go/bin' >> ~/.bashrc
echo 'export GOPATH=$HOME/go' >> ~/.bashrc
echo 'export PATH=$PATH:$GOPATH/bin' >> ~/.bashrc
source ~/.bashrc

# 验证
go version
```

### Go 项目结构

```bash
# 创建项目目录（GOPATH 外的新方式）
mkdir -p ~/projects/hello-go && cd ~/projects/hello-go

# 初始化模块
go mod init hello-go

# 编写代码
cat > main.go << 'EOF'
package main

import "fmt"

func main() {
    fmt.Println("🎉 Hello from Go on WSL!")
}
EOF

# 运行
go run main.go

# 构建
go build -o hello-go ./...
./hello-go
```

### 常用 Go 工具链

```bash
# 代码格式化与检查
go fmt ./...               # 格式化
go vet ./...               # 静态分析
go install golang.org/x/tools/cmd/gopls@latest   # LSP 服务器

# 测试
go test ./...              # 运行所有测试
go test -v -race ./...     # 详细输出 + 竞态检测

# 性能分析
go tool pprof              # CPU/Memory profiling

# 依赖管理
go mod tidy                # 整理依赖
go mod download            # 下载依赖到缓存
go mod graph               # 查看依赖图
```

---

## 三、Rust 语言环境

### 安装 rustup（官方工具链管理器）

```bash
# 使用官方安装脚本
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# 选择默认选项（输入 1 回车即可）
# 输出信息：
# stable-x86_64-unknown-linux-gnu installed - rustc 1.x.y
```

### 常用操作

```bash
# 重载 shell（或重启终端）
source ~/.cargo/env

# 验证
rustc --version           # Rust 编译器
cargo --version           # 包管理和构建工具
rustup --version          # 版本管理器

# 安装常用组件
rustup component add clippy      # lint 检查
rustup component add rustfmt     # 代码格式化
rustup component add rust-analyzer # LSP（VS Code 用）
rustup component add rust-src    # 源码（IDE 跳转）

# 查看已安装的工具链
rustup show

# 切换版本（stable / beta / nightly）
rustup default stable
rustup default nightly        # 尝鲜最新特性

# 目标平台交叉编译（高级）
rustup target add wasm32-wasi   # WebAssembly
rustup target add aarch64-unknown-linux-gnu  # ARM64 Linux
```

### Cargo 生态精选

```bash
# 项目初始化
cargo new my-rust-app && cd my-rust-app
cargo run                      # 编译并运行

# 常用 cargo 子命令
cargo check                   # 快速检查编译错误（不生成二进制）
cargo build --release         # 发布构建（优化后）
cargo test                    # 运行测试
cargo bench                   # 基准性能测试
cargo doc                     # 生成文档
cargo clippy                  # lint 检查（比编译器警告更强）
cargo fmt                     # 格式化代码

# 必装全局工具
cargo install bacon           # 实时 Rust 代码审查
cargo install cargo-edit      # 增强 add/remove 命令
cargo install cargo-watch     # 文件变化自动重新运行
cargo install cargo-audit     # 安全漏洞扫描
```

### Rust 项目示例

```bash
# 创建一个 CLI 小工具
cargo new greet-cli && cd greet-cli

# 编辑 src/main.rs
cat > src/main.rs << 'EOF'
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    let name = args.get(1).map(|s| s.as_str()).unwrap_or("World");
    println!("Hello, {}! 👋 Welcome to WSL!", name);
}
EOF

cargo run -- -- Rust
# → Hello, Rust! 👋 Welcome to WSL!
```

---

## 四、多语言共存技巧

### 统一的目录规划

```bash
~/projects/
├── web-frontend/       # Node.js/TypeScript 项目
├── api-server/         # Go 后端服务
├── data-pipeline/      # Python 数据处理
├── cli-tool/           # Rust 命令行工具
└── shared-proto/       # 共享协议定义
```

### 共享的开发工具配置

```bash
# ~/.bashrc 中添加通用别名和函数

# ===== 项目快速跳转 =====
alias pj='cd ~/projects'
alias ws='pj && ls -1'

# ===== 多语言运行快捷键 =====
run_node() { (cd $1 && pnpm dev); }
run_go() { (cd $1 && go run .); }
run_python() { (cd $1 && source .venv/bin/activate && python3 $2); }

# ===== Git 通用操作 =====
alias gs='git status'
alias gl='git log --oneline -10'
alias gp='git push'

# ===== Docker 通用操作 =====
alias dc='docker compose'
alias dps='docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"'
```

### VS Code 多语言扩展组合

| 扩展名 | 支持语言 | 功能 |
|:---|:---|:---|
| **Pylance** | Python | 智能补全+类型检查 |
| **Go** (`golang.Go`) | Go | 调试+测试+导航 |
| **rust-analyzer** | Rust | 补全+诊断+代码操作 |
| **ESLint** | JS/TS | 代码规范检查 |
| **Error Lens** | 所有 | 行内错误显示 |

### 终端多标签页工作流

在 Windows Terminal 中：

```
标签页 1: ~/projects/api-server    （Go 开发）
标签页 2: ~/projects/web-frontend  （前端热更新）
标签页 3: ~/projects/data-pipeline （Python 数据处理）
标签页 4: ~                         （通用操作/docker）
```

每个标签页都是独立的 WSL Shell，互不干扰！

---

## 五、版本快速对比表

| 方面 | Node.js (fnm) | Go | Rust (rustup) |
|:---|:---:|:---:|:---:|
| **版本管理器** | `fnm` | 无（手动） | `rustup` |
| **包管理** | `pnpm/npm` | `go mod` | `cargo` |
| **项目创建** | `create-*` / `pnpm create` | `go mod init` | `cargo new` |
| **依赖文件** | `package.json`, `pnpm-lock.yaml` | `go.mod`, `go.sum` | `Cargo.toml`, `Cargo.lock` |
| **虚拟隔离** | node_modules/ | 自动（Go Module cache） | 自动（Cargo registry）|
| **构建产物** | `dist/` | 二进制可执行文件 | 二进制可执行文件 |
| **启动速度** | 快（解释/JIT） | 极快（原生编译） | 编译慢，运行极快 |
| **典型用途** | Web 前后端 | 云原生/微服务 | CLI工具/系统编程/WebAssembly|

---

## 下期预告

下一篇：**《Git 工作流在 WSL 中的正确姿势：SSH、别名、钩子》**

- 🔑 SSH 密钥配置与 GitHub/GitLab 连接
- 🏷️ 实用 git alias 别名集合
- 🪝 pre-commit 钩子自动化
- 📋 .gitconfig 最佳实践
- 🔀 高效分支管理策略

---

> **💡 你主要用哪门语言开发？评论区告诉我！**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
>
> 💬 多语言开发的你有什么经验之谈？
