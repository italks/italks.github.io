# 08. 终端 (Terminal) 的第一步

> **摘要**：别怕黑框框！本文带你迈出终端操作的第一步。通俗解释 Shell 与终端的关系，教你读懂命令提示符，并掌握 `pwd`、`ls` 等核心导航命令。终端不是装酷的工具，而是提升效率的杠杆，学会它，你将开启掌控系统的新大门。

![封面图](../../imgs/ubuntu-desktop-guide-08-cover.svg)

终端不是“装酷用的黑框框”，它更像一个效率杠杆：同样的事，鼠标点 10 次，终端一行命令就结束，而且可复用、可复制、可回放。

## 1. 什么是 Shell？

你看到的黑框框叫 **Terminal (终端模拟器)**，而在里面运行的程序叫 **Shell (壳)**。
Shell 接收你的指令，翻译给操作系统内核 (Kernel)，然后把结果反馈给你。
*   **Bash (Bourne Again SHell)**: Ubuntu 默认的 Shell，最为通用。
*   **Zsh**: 功能更强大的 Shell，深受开发者喜爱（后续教程会教你安装）。

## 2. 打开终端

*   快捷键：`Ctrl + Alt + T` (请把这个快捷键刻在 DNA 里)。
*   或者在 Activities 中搜索 "Terminal"。

## 3. 读懂命令提示符

打开终端后，你会看到类似这样的一行字：
`user@hostname:~$`

*   `user`: 当前登录的用户名。
*   `hostname`: 电脑的主机名。
*   `~`: 当前所在的目录。`~` 代表**家目录** (Home Directory)，即 `/home/user`。
*   `$`: 表示你是普通用户。如果是 `#`，说明你是超级管理员 (Root)，这很危险，要小心操作。

## 4. 核心导航命令

在终端里，你就没有鼠标了，需要用命令来"走动"。

先记住两个概念：

- **绝对路径**：从 `/` 开始写（比如 `/home/user/Downloads`）
- **相对路径**：从当前目录开始写（比如 `Downloads`、`../Documents`）

### `pwd` (Print Working Directory)
**我在哪？**
显示当前所在的完整路径。
```bash
pwd
# 输出: /home/user
```

### `ls` (List)
**这里有什么？**
列出当前目录下的文件和文件夹。
```bash
ls
ls -l   # 显示详细信息（权限、大小、时间）
ls -a   # 显示隐藏文件（以 . 开头的文件）
```

### `cd` (Change Directory)
**我要去哪？**
切换目录。
```bash
cd Downloads    # 进入 Downloads 目录
cd ..           # 返回上一级目录
cd ~            # 回到家目录
cd /            # 去根目录
```

### `mkdir` (Make Directory)
**建个新房子**
创建一个新文件夹。
```bash
mkdir Projects
```

### `touch`
**变个新东西**
创建一个空文件。
```bash
touch readme.txt
```

### `cp` (Copy)
**影分身之术**
复制文件或文件夹。
```bash
cp file.txt file_backup.txt
cp -r folder1 folder2   # 复制文件夹要加 -r (Recursive)
```

### `mv` (Move)
**搬家 / 改名**
移动文件，或者重命名文件。
```bash
mv file.txt Documents/  # 移动
mv oldname.txt newname.txt # 重命名
```

### `rm` (Remove)
**毁灭吧，赶紧的**
删除文件。**注意：Linux 终端删除的文件通常不进回收站，删了就真没了！**
```bash
rm file.txt
rm -rf foldername   # 强制删除文件夹及其内容 (慎用!)
```

## 5. 实用技巧

*   **Tab 键自动补全**: 输入 `cd Do` 然后按 `Tab`，它会自动补全为 `cd Downloads/`。**这是最重要的技巧，没有之一。**
*   **上下箭头**: 翻阅历史命令，不用重复打字。
*   **Ctrl + C**: 强制终止当前正在运行的程序（如果程序卡死了）。
*   **Ctrl + L** 或输入 `clear`: 清屏。

再加两个“保命技巧”：

- **先看帮助再动手**：`命令 --help` 或 `man 命令`（比如 `man ls`）
- **路径有空格要加引号**：例如 `cd "My Files"`，否则命令会被拆成两段

试着多用几次，你会发现手指在键盘上飞舞的感觉比拖鼠标快多了。
