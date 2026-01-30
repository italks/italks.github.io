# 11. 命令行下的软件管理 (APT)

App Center 很适合点一点就装，但真要排错、批量安装、复现环境，终端里的 **APT (Advanced Package Tool)** 更可靠：速度快、信息全、可脚本化。

## 1. 核心命令三板斧

### 第一步：更新软件源列表
```bash
sudo apt update
```
**注意**: 这步**不会**更新软件，它只是去服务器询问："现在有哪些软件更新了？最新版本号是多少？" 相当于刷新菜单。
*建议每次安装软件前都运行一次。*

### 第二步：升级所有软件
```bash
sudo apt upgrade
```
这步才是真正下载并安装更新。系统会列出需要升级的包，按 `Y` 确认。

如果你看到提示需要处理依赖变更、有些包“保留不升级”，可以先别硬上，先把输出看明白，再决定是否需要更激进的升级方式（比如涉及内核/驱动时）。

### 第三步：安装软件
```bash
sudo apt install 软件名
```
例如：`sudo apt install git vim vlc` (可以一次装多个)。

## 2. 搜索与卸载

### 搜索软件
不知道软件确切的名字？
```bash
apt search 关键词
```
例如 `apt search python`。列表可能会很长，配合 `grep` 使用效果更佳。

### 卸载软件
```bash
sudo apt remove 软件名
```
这会保留配置文件。

如果要彻底删除（包括配置文件）：
```bash
sudo apt purge 软件名
```

### 清理垃圾
安装软件时会自动下载很多依赖包，卸载时这些依赖包可能没被删除。
```bash
sudo apt autoremove
```
定期运行这个命令可以释放磁盘空间。

## 3. PPA：扩展你的软件库

官方仓库的软件虽然稳定，但版本可能较旧。**PPA (Personal Package Archives)** 是个人维护的软件仓库，可以让你安装最新版的软件。

提醒一句：PPA 方便，但也意味着你把系统的一部分更新交给了第三方维护。能用官方仓库/官方渠道解决的，尽量先用官方渠道。

例如，安装最新版的 OBS Studio：
```bash
# 1. 添加 PPA 源
sudo add-apt-repository ppa:obsproject/obs-studio

# 2. 刷新列表 (现在新版 Ubuntu 会在添加 PPA 后自动刷新，但手动刷一下也没坏处)
sudo apt update

# 3. 安装
sudo apt install obs-studio
```

## 4. 换源：给下载加速

默认的 Ubuntu 软件源服务器在国外，国内连接可能很慢。我们可以换成国内的镜像源（阿里云、清华、中科大）。

### 图形界面换源 (推荐)
1.  打开 "Software & Updates" (软件与更新)。
2.  在 "Download from" (下载自) 下拉菜单中选择 "Other..." -> "China"。
3.  点击 "Select Best Server" (选择最佳服务器)，系统会自动测试速度。
4.  选中最快的，点击 "Choose Server"。
5.  关闭窗口时，系统会提示重新载入 (Reload)，确认即可。

### 命令行换源 (进阶)
编辑 `/etc/apt/sources.list` 文件，将里面的域名替换为国内源的域名。
（由于涉及系统文件修改，新手建议使用图形界面操作）。

掌握了 APT，你就掌握了 Linux 软件管理的精髓。一行命令搞定安装，比去网页下载安装包爽多了。
