# Git 工作流在 WSL 中的正确姿势：SSH、别名、钩子

> **阅读时长**：约 12 分钟 | **难度等级**：⭐⭐☆☆☆ 入门进阶
> **本篇关键词**：Git / SSH / 工作流 / 版本控制 / WSL 开发
>
> WSL 中使用 Git 和原生 Linux 几乎完全一致，但有些配置细节能让你的效率翻倍。SSH 密钥、实用别名、自动钩子——一个都不能少。

---

## 第一步：Git 初始化配置

### 基础设置（必须做）

```bash
# 设置用户名和邮箱
git config --global user.name "你的名字"
git config --global user.email "your@email.com"

# 默认分支名
git config --global init.defaultBranch main

# 默认编辑器（VS Code）
git config --global core.editor "code --wait"

# 换行符处理（WSL/Linux 必须设为 input）
git config --global core.autocrlf input

# 显示颜色
git config --global color.ui auto

# 推送行为
git config --global push.default simple

# 验证所有配置
git config --list --global
```

### 配置文件位置说明

```
~/.gitconfig          ← 全局配置（所有项目生效）
.git/config           ← 项目级配置（仅当前项目，优先级更高）
```

---

## 第二步：SSH 密钥配置

### 为什么用 SSH 而不是 HTTPS？

| 方式 | 优点 | 缺点 |
|:---|:---|:---|
| **SSH** | 免密推送、更安全、更快 | 需要初始配置 |
| **HTTPS** | 简单直接 | 每次要输密码/token |

> 💡 配置一次 SSH，之后永久免密——绝对值得！

### 生成 SSH 密钥对

```bash
# 生成 ed25519 密钥（比 RSA 更安全、更短）
ssh-keygen -t ed25519 -C "your@email.com"

# 输出：
# Generating public/private ed25519 key pair.
# Enter file in which to save the key (/home/you/.ssh/id_ed255255): [直接回车]
# Enter passphrase (empty for no passphrase): [输入密码或留空]
# Enter same passphrase again: [再输入]

# 如果系统不支持 ed25519（老系统），用 RSA 替代
# ssh-keygen -t rsa -b 4096 -C "your@email.com"
```

### 查看公钥并添加到 GitHub/GitLab

```bash
# 查看公钥内容
cat ~/.ssh/id_ed25519.pub

# 复制输出内容（以 ssh-ed25519 开头的一长串）

# GitHub 操作：
# 1. 登录 https://github.com/settings/keys
# 2. 点击 "New SSH key"
# 3. Title 随便填（如 "WSL-Ubuntu"）
# 4. Key 复制刚才的公钥内容
# 5. 点击 "Add SSH key"

# GitLab 操作类似：
# Settings → SSH Keys → Add new key
```

### 测试连接

```bash
# 测试 GitHub 连接
ssh -T git@github.com
# 输出：Hi username! You've successfully authenticated...

# 测试 GitLab 连接
ssh -T git@gitlab.com
```

### 多平台 SSH 管理

如果你同时使用 GitHub、GitLab、Gitee 等：

```bash
# 编辑 SSH 配置文件
nano ~/.ssh/config
```

写入以下内容：

```
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes

Host gitlab.com
    HostName gitlab.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes

Host gitee.com
    HostName gitee.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
```

```bash
# 设置权限
chmod 600 ~/.ssh/config

# 测试各平台连接
ssh -T git@github.com
ssh -T git@gitlab.com
ssh -T git@gitee.com
```

---

## 第三步：Git 实用别名（效率翻倍 ⭐）

每次输入完整的 git 命令太累了。把这些别名加到 `~/.gitconfig`：

```bash
# 方法一：逐条添加
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.st status
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.lg "log --oneline --graph --all --decorate"
git config --global alias.undo 'reset HEAD~1 --soft'
git config --global alias.amend 'commit --amend --no-edit'

# 方法二：直接编辑 gitconfig（推荐）
cat >> ~/.gitconfig << 'EOF'

[alias]
    # ===== 基础操作 =====
    co = checkout
    br = branch
    ci = commit
    st = status
    df = diff
    rf = reflog

    # ===== 日志查看 =====
    lg = log --oneline --graph --all --decorate
    ll = log --oneline --stat
    last = log -1 HEAD

    # ===== 撤销操作 =====
    unstage = reset HEAD --
    undo = reset HEAD~1 --soft
    amend = commit --amend --no-edit
    discard = checkout --

    # ===== 分支管理 =====
    branches = branch -a
    new-branch = "!f() { git checkout -b \"$1\" && git push -u origin \"$1\"; }; f"

    # ===== 拉取与推送 =====
    pull-all = !"for r in $(git remote); do git pull $r; done"
EOF
```

### 别名使用示例

```bash
# 原来 vs 现在
git status                    # → git st
git checkout main             # → git co main
git commit -m "fix: bug"      # → git ci -m "fix: bug"
git log --oneline --graph     # → git lg
git checkout -- .             # → git discard .
git reset HEAD~1              # → git undo
```

---

## 第四步：Pre-commit 钩子（自动化质量门禁）

### 什么是 pre-commit？

每次你执行 `git commit` 时，pre-commit 会**自动运行检查**：

```
git add . 
git commit -m "feat: new feature"
        ↓
   pre-commit 自动触发！
        ↓
   ├── 运行代码格式化（black/isort）
   ├── 运行 lint 检查（ruff/flake8）  
   ├── 检查敏感信息泄露
   └── 所有通过 → 提交成功 ✅
        ↓
   任何一项失败 → 提交被阻止 ❌
```

### 安装与配置

```bash
# 安装 pre-commit
pip install pre-commit

# 或用 uv/cargo 安装也行
uv tool install pre-commit

# 在项目中创建配置文件
cat > .pre-commit-config.yaml << 'EOF'
repos:
  # Python 格式化
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.4.0
    hooks:
      - id: ruff          # lint 检查
      - id: ruff-format   # 代码格式化
  
  # 敏感信息检测
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks

  # YAML 格式化
  - repo: https://github.com/pre-commit/mirrors-prettier
    rev: v4.0.0-alpha.8
    hooks:
      - id: prettier
        types: [yaml, markdown, json]
EOF

# 安装钩子到项目的 .git/hooks/
pre-commit install

# 手动运行一次（检查所有文件）
pre-commit run --all-files
```

### 更多有用 hook 示例

在 `.pre-commit-config.yaml` 中追加：

```yaml
repos:
  # JSON/YAML 语法检查
  - repo: https://github.com/python-jsonschema/check-jsonschema
    rev: 0.28.2
    hooks:
      - id: check-github-workflows
      - id: check-github-actions
EOF
```

---

## 第五步：高效分支管理策略

### Git Flow 精简版

```
main (生产)
  │
  ├── develop (开发集成分支)
  │     │
  │     ├── feature/login    （功能分支）
  │     ├── feature/payment   （功能分支）
  │     │
  │     └── release/v1.2      （发布分支）
  │
  └── hotfix/urgent-fix       （紧急修复）
```

### 实用 shell 函数（加入 ~/.bashrc）

```bash
# ===== Git 快捷函数 =====

# 创建功能分支并推送到远程
gnb() {
    local branch_name="$1"
    if [ -z "$branch_name" ]; then
        echo "Usage: gnb <branch-name>"
        return 1
    fi
    git checkout -b "feature/$branch_name" && \
    git push -u origin "feature/$branch_name"
}

# 合并 develop 到当前分支
gmd() {
    git fetch origin develop && \
    git merge origin/develop
}

# 删除本地+远程分支
gdb() {
    git branch -d "$1" && \
    git push origin --delete "$1"
}

# 一键提交（带类型前缀）
gci() {
    local msg="$*"
    if [ -z "$msg" ]; then
        echo "Usage: gci <commit message>"
        return 1
    fi
    git add -A && git commit -m "$msg"
}
```

---

## 第六步：.gitignore 最佳实践

### 项目模板

创建全局 gitignore：

```bash
# 全局忽略规则（对所有项目生效）
git config --global core.excludesfile ~/.gitignore_global

cat > ~/.gitignore_global << 'EOF'
# OS files
.DS_Store
Thumbs.db
desktop.ini

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# Python
__pycache__/
*.py[cod]
*$py.class
.venv/
env/

# Node.js
node_modules/
dist/
.next/

# Environment variables
.env
.env.local
.env.*.local

# Logs
logs/
*.log

# Build outputs
build/
dist/
target/

# OS-specific
.DS_Store
EOF
```

### 各语言项目级 .gitignore

```bash
# Python 项目
echo -e '__pycache__/\n*.pyc\n.venv/\n*.egg-info/' > .gitignore

# Node.js 项目  
echo -e 'node_modules/\ndist/\n.env.local' > .gitignore

# Go 项目
echo -e '\nbin/\nvendor/' > .gitignore
# Go 其实大部分不需要手动 ignore

# Rust 项目（cargo 已经帮你处理了大部分）
# 通常只需追加：
echo -e '.vscode/\n*.swp' >> .gitignore
```

---

## 下期预告

下一篇：**《Docker Desktop + WSL 2：容器开发的黄金搭档》**

- 🐳 Docker Desktop 安装与 WSL 后端配置
- 📦 docker-compose 编排实战
- 🔧 镜像加速与资源限制
- 🌐 容器网络与数据持久化
- 🚀 从开发到部署的完整流程

---

> **💡 你的 Git 有什么独家技巧？评论区分享出来！**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
>
> 💬 还想了解 Git 的哪些高级用法？
