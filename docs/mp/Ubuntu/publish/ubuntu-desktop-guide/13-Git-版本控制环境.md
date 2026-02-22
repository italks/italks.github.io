# 13. Git 版本控制环境

> **摘要**：Git 不仅是程序员的工具，更是版本管理的利器。本文指导你在 Ubuntu 上安装与配置 Git，包括设置用户信息、生成 SSH 密钥并连接 GitHub/GitLab。无论写代码还是写文档，掌握 Git 都能让你对文件的每一次修改都有迹可循。

Git 不只给写代码的人用：写文档、做笔记、备份配置（dotfiles），甚至写论文都能用到。它的价值不是“酷”，而是：改过什么、为什么改、怎么回退，都清清楚楚。

## 1. 安装 Git

```bash
sudo apt update
sudo apt install git
```

## 2. 初始配置 (第一次使用必须做)

告诉 Git 你是谁。这些信息会出现在你的每一次提交记录中。

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

检查配置：
```bash
git config --list
```

可选但很实用的两项：

```bash
git config --global init.defaultBranch main
git config --global core.editor "nano"
```

## 3. 配置 SSH Key (连接 GitHub/GitLab)

为了避免每次推送代码都要输入密码，我们需要配置 SSH 密钥。

1.  **生成密钥**:
    ```bash
    ssh-keygen -t ed25519 -C "your.email@example.com"
    ```
    可以一路回车，也可以给密钥加一个 passphrase（相当于给私钥再加一把锁）。

2.  **查看公钥**:
    ```bash
    cat ~/.ssh/id_ed25519.pub
    ```
    复制输出的一串字符（以 ssh-ed25519 开头）。

3.  **添加到 GitHub**:
    *   登录 GitHub -> Settings -> SSH and GPG keys -> New SSH key。
    *   粘贴刚才复制的内容。

4.  **测试连接**:
    ```bash
    ssh -T git@github.com
    ```
    如果看到 `Hi username! You've successfully authenticated...`，说明成功了。

## 4. 常用 Git 图形化客户端

虽然命令行最快，但处理复杂的合并冲突或查看提交历史时，图形界面更直观。

*   **GitKraken**: 界面极美，功能强大（部分高级功能收费）。
    *   *安装*: 去官网下载 `.deb` 或 Snap 安装。
*   **VS Code**: 自带的 Git 功能已经非常强大，配合 "Git Graph" 插件，足以应付 99% 的场景。
*   **Sublime Merge**: 速度极快，轻量级。

## 5. 常用命令速查

*   `git init`: 初始化仓库。
*   `git clone <url>`: 克隆远程仓库。
*   `git status`: 查看当前状态。
*   `git add .`: 添加所有修改。
*   `git commit -m "msg"`: 提交修改。
*   `git pull`: 拉取远程代码。
*   `git push`: 推送代码到远程。
*   `git checkout -b <branch>`: 创建并切换分支。

最建议养成的一个习惯：每次提交前先 `git status` 看一眼，确认自己提交的是“想提交的东西”，而不是顺手把一堆临时文件也带上了。
