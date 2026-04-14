# WSL 新手第一课：终端不慌，这 15 个命令够用半年

> **阅读时长**：约 12 分钟 | **难度等级**：⭐☆☆☆☆ 零基础友好
> **本篇关键词**：WSL / Linux 命令 / 终端入门 / Ubuntu / 新手教程
>
> 不用背几千条命令，掌握这 15 个高频命令就能覆盖日常 90% 的操作场景。每个命令都配实例和输出，看完就能上手。

---

## 终端是什么？别被黑窗口吓到

你打开 Ubuntu 后看到的这个界面，就是**终端（Terminal）**：

```
zhangsan@DESKTOP:~$
```

它就是你和 Linux 对话的"聊天窗口"——你输入命令，Linux 执行后返回结果。没有图形界面的花哨，但效率极高。

> 💡 **一个比喻**：图形界面像点菜（看图选），终端像直接喊"来碗牛肉面"——熟练之后更快。

---

## 第一组：目录导航（4 个命令）

每天打开终端都要用的，必须形成肌肉记忆。

### 1. pwd — 我在哪？

```bash
$ pwd
/home/zhangsan
```

**作用**：显示当前所在目录的完整路径（Print Working Directory）。

> 🎯 **什么时候用**：迷路了不知道自己在哪个文件夹时。

---

### 2. ls — 这里有什么？

```bash
$ ls
Desktop  Documents  Downloads  project  README.md

# 详细模式（推荐！）
$ ls -l
total 32
drwxr-xr-x  2 zhangsan zhangsan 4096 Apr 14 10:00 Desktop
drwxr-xr-x  2 zhangsan zhangsan 4096 Apr 14 10:00 Documents
-rw-r--r--  1 zhangsan zhangsan   220 Apr 14 10:00 README.md

# 显示隐藏文件（以 . 开头的文件）
$ ls -la
total 64
drwxr-xr-x  5 zhangsan zhangsan 4096 Apr 14 10:00 .
drwxr-xr-x 15 root     root     4096 Apr 14 09:00 ..
-rw-------  1 zhangsan zhangsan  1234 Apr 14 10:00 .bashrc
drwx------  3 zhangsan zhangsan 4096 Apr 14 10:00 .config

# 树状展示（需要先安装 tree）
$ sudo apt install tree
$ tree ~/project -L 2
project/
├── src/
│   ├── main.py
│   └── utils.py
├── tests/
│   └── test_main.py
└── README.md
```

**ls -l 输出解读**：
```
-rw-r--r--  1 zhangsan zhangsan 220 Apr 14 README.md
 │  │  │  │    │        │        │    └─ 修改时间
 │  │  │  │    │        │        └──────── 文件大小(字节)
 │  │  │  │    │        └───────────────── 所属组
 │  │  │  │    └──────────────────────────── 所有者
 │  │  │    └─────────────────────────────── 硬链接数
 │  │  └──────────────────────────────────── 组权限
 │  └─────────────────────────────────────── 其他用户权限
 └────────────────────────────────────────── 文件类型与所有者权限
```

| 字符 | 含义 |
|:---|:---|
| `-` | 普通文件 |
| `d` | 目录（directory） |
| `r` | 可读 (read) |
| `w` | 可写 (write) |
| `x` | 可执行 (execute) |

---

### 3. cd — 去哪里？

```bash
cd ~/project              # 进入项目目录
cd ..                     # 返回上一级
cd ../..                  # 返回上上级
cd ~                      # 回到家目录 (/home/你的用户名)
cd /                      # 到根目录
cd -                      # 返回刚才所在的目录（超好用！）
cd                        # 不加参数 = cd ~（回家）
```

> 💡 **小技巧**：输入路径时按 `Tab` 键自动补全，不用手敲全名。

---

### 4. mkdir — 创建文件夹

```bash
mkdir my-folder           # 创建单个目录
mkdir -p a/b/c/d         # 递归创建多级目录（-p 很重要！）
mkdir -p ~/project/{src,tests,docs,assets}  # 一次创建多个子目录
```

---

## 第二组：文件操作（5 个命令）

### 5. cat — 查看文件内容

```bash
cat README.md             # 直接显示全部内容
cat -n main.py            # 显示行号（调试代码时很有用）
cat file1.txt file2.txt   # 合并显示多个文件
cat > newfile.txt << EOF   # 快速创建文件（EOF 结束）
这是新文件的内容
可以写多行
EOF
```

### 6. cp — 复制

```bash
cp file.txt backup.txt            # 复制文件
cp file.txt /tmp/                 # 复制到指定目录
cp -r folder/ /tmp/               # 复制整个目录（-r = recursive）
cp -a source/ target/             # 保留属性复制（权限、时间戳等）
```

### 7. mv — 移动 / 重命名

```bash
mv old_name.txt new_name.txt      # 重命名（同一目录下）
mv file.txt ~/Documents/          # 移动到其他目录
mv *.py ~/project/src/            # 批量移动所有 .py 文件
```

> 💡 Linux 没有"重命名"命令，mv 就是重命名！

### 8. rm — 删除（谨慎使用 ⚠️）

```bash
rm unwanted.txt                   # 删除文件（无确认！）
rm -i important.txt              # 删除前询问确认（-i = interactive）
rm -r old_folder/                # 删除目录（需 -r）
rm -rf temp/                      # 强制递归删除（慎用！！）
# rm -rf /                       # ❌ 绝对不要执行！这会删掉整个系统！
```

> ⚠️ **安全建议**：新手阶段养成用 `trash-cli` 代替 `rm` 的习惯：
> ```bash
> sudo apt install trash-cli      # 安装垃圾箱工具
> trash file.txt                  # 放入回收站，可恢复
> trash-list                      # 查看回收站内容
> trash-restore                   # 恢复文件
> ```

### 9. touch — 创建空文件 / 更新时间戳

```bash
touch newfile.py          # 创建新的空文件
touch existing.py         # 更新文件的修改时间为当前时间
```

> 💡 为什么叫 touch？因为它"触碰"一下文件，更新了时间戳。

---

## 第三组：查看与搜索（3 个命令）

### 10. grep — 全能搜索神器 🔥🔥🔥

**这是 Linux 最有用的命令之一！**

```bash
# 在文件中搜索关键词
grep "error" app.log

# 显示行号 + 上下文（排查问题时超好用）
grep -n "ERROR" app.log                    # -n 显示行号
grep -A 3 "Exception" app.log              # -After 后面 3 行
grep -B 3 "Exception" app.log              # -Before 前面 3 行
grep -C 5 "Exception" app.log              # -Context 前后各 5 行

# 在目录中搜索所有文件
grep -r "TODO" ./src/                      # -r 递归搜索
grep -rn "import" ./src/                  # 递归+行号

# 常用组合统计
grep -c "error" app.log                   # -c 计数（多少个匹配）
grep -v "debug" app.log                   # -v 反向匹配（排除 debug 行）

# 大小写忽略
grep -i "warning" app.log                 # -i 忽略大小写
```

**实际场景举例**：
```bash
# 查看 Nginx 日志中有多少个 404 错误
grep -c " 404 " /var/log/nginx/access.log

# 在项目中查找所有 TODO 注释
grep -rn "TODO\|FIXME" ./src/

# 排除注释行查看配置文件有效内容
grep -v "^#" /etc/nginx/nginx.conf | grep -v "^$"
```

---

### 11. find — 文件查找器

```bash
# 按名称查找
find . -name "*.py"                # 当前目录下所有 .py 文件
find ~ -name "config*"             # 家目录下名字含 config 的文件

# 按类型查找
find . -type d -name "test*"       # 只找目录
find . -type f -name "*.log"       # 只找文件

# 按大小查找
find . -size +100M                 # 大于 100MB 的文件
find . -size -1K                   # 小于 1KB 的文件

# 按时间查找
find . -mtime -7                   # 最近 7 天内修改的
find . -atime -30                  # 最近 30 天内访问的

# 组合使用（找到大文件并排序）
find . -type f -size +50M -exec ls -lh {} \; 2>/dev/null | sort -k5 -h
```

> 💡 **fd** 是 find 的现代替代品（Rust 编写），速度更快：
> ```bash
> cargo install fd-find
> fd ".py"                         # 比 find 简洁很多
> fd -e py -S +50m                 # 超过 50MB 的 Python 文件
> ```

---

### 12. less / head / tail — 分页查看

```bash
# less — 分页浏览大文件（按 q 退出，/ 搜索）
less large_log.txt

# head — 查看前几行
head -20 app.log                  # 前 20 行
head -n 5 README.md               # 前 5 行

# tail — 查看末尾几行（最常用！）
tail -f app.log                   # 实时追踪日志（-f = follow）⭐
tail -100 app.log                # 最后 100 行
tail -n +500 app.log             # 从第 500 行开始显示到最后

# 组合技巧：实时过滤日志中的错误
tail -f app.log | grep ERROR      # 实时只看 ERROR 行
```

---

## 第四组：系统信息（3 个命令）

### 13. df / du — 磁盘空间

```bash
# df — 查看磁盘整体使用情况
df -h                             # -h 用人类可读格式（MB/GB）
# 输出示例：
# Filesystem      Size  Used Avail Use% Mounted on
# /dev/sdc        256G   42G  201G  18% /

# du — 查看目录占用空间
du -sh ~/project/                 # 项目总大小
du -h --max-depth=1 ~/            # 家目录下一级各目录大小（找出谁占空间）
du -sh * | sort -hr               # 从大到小排序
```

### 14. htop — 进程监控

```bash
sudo apt install htop             # 首次安装
htop                              # 启动（按 F10 或 q 退出）

# 界面功能：
# CPU/内存实时图表
# 进程列表（按 CPU/内存排序）
# 按 F9 可以结束进程
# 按 F6 可以选择排序方式
```

### 15. history — 命令历史

```bash
history                           # 查看最近执行的命令列表
history | grep git                # 搜索历史中用过的 git 命令
!23                               # 重新执行历史中编号为 23 的命令
!!                                # 重复执行上一条命令

# 快捷操作：
Ctrl + R                          # 搜索历史命令（输入关键字模糊匹配）
↑ / ↓                             # 上下翻阅历史命令
```

---

## 终端快捷键速查表（记牢这些效率翻倍）

| 快捷键 | 功能 |
|:---|:---|
| `Ctrl + C` | 取消当前命令（最常用！）|
| `Ctrl + D` | 退出当前会话 / 终端 |
| `Ctrl + L` | 清屏（等同于 clear）|
| `Ctrl + A` | 光标跳到行首 |
| `Ctrl + E` | 光标跳到行尾 |
| `Ctrl + U` | 删除光标前所有内容 |
| `Ctrl + K` | 删除光标后所有内容 |
| `Ctrl + W` | 删除光标前的一个单词 |
| `Ctrl + R` | 反向搜索历史命令 |
| `Tab` | 自动补全（文件名/命令名）|
| `↑ / ↓` | 浏览历史命令 |

---

## 管道符：让命令组合起来发挥威力

管道 `|` 是 Linux 最强大的特性之一，把前一个命令的输出作为后一个命令的输入：

```bash
# 组合示例 1：查看进程中最耗内存的 5 个
ps aux | sort -k6 -nr | head -5

# 组合示例 2：统计日志中各类错误数量
grep "ERROR\|WARN\|FATAL" app.log | awk '{print $1}' | sort | uniq -c | sort -rn

# 组合示例 3：找到最大的 10 个文件并删除旧备份
find . -name "*.bak" -size +10M | xargs rm -f

# 组合示例 4：一行搞定项目文件统计
find . -type f | wc -l              # 总文件数
find . -name "*.py" | wc -l         # Python 文件数
du -sh .                            # 总大小
```

---

## 新手常见错误与纠正

| ❌ 错误做法 | ✅ 正确做法 | 原因 |
|:---|:---|:---|
| `ls -al /home/user/Desktop` | `~/Desktop` 或 `~./Desktop` | 用波浪号更简洁 |
| `cd home/zhangsan` | `cd /home/zhangsan` 或 `cd ~` | 绝对路径需要 `/` 开头 |
| `rm -rf / tmp/test` | `rm -rf /tmp/test` | 多了个空格可能删根目录！ |
| `cat huge_file` | `less huge_file` | 大文件用 less 分页浏览 |
| 手动一个个删文件 | `rm *.log` 或用通配符 | 批量操作更高效 |

---

## 下期预告

下一篇：**《Windows 和 Linux 的文件互通：别在 C 盘跑代码！》**

- 📂 WSL 文件系统架构详解
- ↔️ Windows ↔ Linux 双向访问方法
- ⚡ 性能陷阱与黄金法则
- 🔗 软链接让跨系统操作更便捷

---

> **💡 这 15 个命令你用过几个？评论区告诉我！**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
>
> 💬 有什么常用命令想了解？留言安排！
