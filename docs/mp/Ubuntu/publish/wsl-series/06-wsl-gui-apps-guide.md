# 在 Windows 上运行 Linux 桌面应用？WSLg 图形界面体验

> **阅读时长**：约 10 分钟 | **难度等级**：⭐⭐☆☆☆ 入门进阶
> **本篇关键词**：WSL / WSLg / GUI 应用 / 图形界面 / Linux 桌面
>
> 以前在 Windows 上跑 Linux 程序只能用黑乎乎的终端，现在有了 WSLg，你可以直接在 Windows 桌面上看到 Linux 的图形窗口——像原生应用一样！

---

## WSLg 是什么？

### 一句话解释

**WSLg = WSL + Graphics（GUI）**，让你能在 Windows 桌面上直接运行 Linux 的**图形界面应用（GUI App）**。

```
没有 WSLg 的日子：
┌─────────────┐    ┌──────────────┐
│  WSL 终端    │    │ 只能跑命令行   │
│  $ vim       │    │ $ git         │
│  $ python3   │    │ $ docker      │
│  $ gcc       │    │ (全是黑框框)  │
└─────────────┘    └──────────────┘

有了 WSLg 之后：
┌─────────────┐    ┌──────────────┐
│  WSL 终端    │    │ 命令行应用     │
│  $ vim       │    ├──────────────┤
│  $ python3   │    │ 🖥️ Firefox   │ ← Linux 浏览器
│  $ gcc       │    │ 📝 Gedit     │ ← 文字编辑器
│              │    │ 🎨 GIMP      │ ← 图片编辑器
│              │    │ 📁 Nautilus  │ ← 文件管理器
│              │    └──────────────┘
└─────────────┘
所有窗口都像普通 Windows 窗口一样！
有标题栏、任务栏图标、可以最小化/最大化 ✅
```

---

## 启用 WSLg

### 系统要求

| 条件 | 要求 |
|:---|:---|
| **操作系统** | Windows 11（推荐）或 Windows 10 版本 21H2+ |
| **WSL 版本** | ≥ 0.58.0+ |
| **显卡** | 支持 Vulkan 或 OpenGL（绝大多数现代显卡都支持）|

> 💡 **怎么检查？** 打开 PowerShell 输入 `wsl --version`，确认版本够新。

### 自动启用（大多数情况）

如果你使用的是 **Windows 11** 或更新的 Windows 10：

```bash
# 只要 WSL 正常安装并运行，WSLg 默认就已经可用！
# 无需额外配置或安装任何东西
```

验证一下：
```bash
# 查看 DISPLAY 变量（有值说明 WSLg 已就绪）
echo $DISPLAY
# 应输出类似：:0 或 :1

echo $WAYLAND_DISPLAY
# 应输出类似：wayland-0 或 wayland-1
```

### 如果 WSLg 未生效

```powershell
# 1. 更新 WSL 到最新版
wsl --update

# 2. 重启 WSL
wsl --shutdown

# 3. 重新打开 Ubuntu 并验证
```

如果仍然不行，确认 `/etc/wsl.conf` 中没有干扰配置。

---

## 已验证可用的 GUI 应用清单

### 浏览器类 ⭐ 推荐

| 应用 | 安装命令 | 特点 |
|:---|:---|:---|
| **Firefox** | `sudo apt install firefox` | 跨平台经典浏览器，WSLg 兼容性最好 |
| **Chromium** | `sudo apt install chromium-browser` | 开源版 Chrome |

```bash
# 安装并启动 Firefox
sudo apt install firefox -y
firefox &
# & 表示后台运行，不占用终端

# 第一次启动会稍慢，之后就快了
```

### 文件管理器

| 应用 | 安装命令 | 用途 |
|:---|:---|:---|
| **Nautilus** | `sudo apt install nautilus` | GNOME 文件管理器 |
| **Thunar** | `sudo apt install thunar` | XFCE 的轻量文件管理器 |

```bash
sudo apt install nautilus -y
nautilus ~/projects/
# 可以直接浏览 WSL 文件系统的目录，比 ls 直观多了！
```

### 编辑器类

| 应用 | 安装命令 | 特点 |
|:---|:---|:---|
| **Gedit** | `sudo apt install gedit` | 类似 Windows 记事本但更强 |
| **GVim** | `sudo apt install vim-gtk3` | 带 GUI 的 Vim |
| **Geany** | `sudo apt install geany` | 轻量级 IDE |

### 图片与设计

| 应用 | 安装命令 | 特点 |
|:---|:---|:---|
| **GIMP** | `sudo apt install gimp` | 免费 Photoshop 替代品 |
| **Image Viewer** | `sudo apt install eog` | GNOME 图片查看器 |

```bash
sudo apt install gimp -y
gimp &
# 可以直接打开和编辑 /mnt/c/ 中的图片！
```

### 截图与录屏

| 应用 | 安装命令 | 特点 |
|:---|:---|:---|
| **Flameshot** | `sudo apt install flameshot` | 功能强大的截图工具（标注/上传）|
| **SimpleScreenRecorder** | `sudo apt install simplescreenrecorder` | 录屏工具 |

```bash
sudo apt install flameshot -y
flameshot &
# 截图后可以直接保存到 Windows 目录！
```

### 其他实用工具

| 应用 | 安装命令 | 说明 |
|:---|:---|:---|
| **xclip** | `sudo apt install xclip` | 剪贴板增强 |
| **wslu** | `sudo apt install wslu` | WSL 实用工具集（含 wslusc 创建快捷方式）|
| **file-roller** | `sudo apt install file-roller` | 解压缩工具（支持 zip/rar/7z 等）|
| **GHex** | `sudo apt install ghex` | 十六进制编辑器 |

### 一键安装常用 GUI 应用

```bash
sudo apt update && sudo apt install -y \
    firefox          \
    nautilus         \
    gedit            \
    gimp             \
    flameshot        \
    file-roller      \
    wslu             \
    xclip            \
    eog              # 图片查看器
```

---

## 使用技巧

### 技巧一：后台运行避免占用终端

```bash
# 方法一：& 后台运行
firefox &

# 方法二：nohup（关闭终端后程序继续运行）
nohup firefox &

# 方法三：用 wslu 创建 Windows 快捷方式（推荐！）
wslusc --browser firefox
# 这会在 Windows 开始菜单创建一个 Firefox 快捷方式
# 点击就能直接启动 WSL 中的 Firefox
```

### 技巧二：打开文件时自动选择应用

```bash
# 用默认 GUI 程序打开文件
wslview report.pdf           # 需先 sudo apt install wslu
xdg-open screenshot.png      # 标准 XDG 方式

# 用指定程序打开
gedit config.yaml
gimp photo.jpg
nautilus .
```

### 技巧三：从 Windows 直接调用

```powershell
# PowerShell 中也可以启动 WSL 的 GUI 程序
wsl firefox https://ubuntu.com
wsl gedit "D:\notes\todo.txt"
wsl nautilus
```

### 技巧四：复制粘贴互通

```
WSL GUI 应用中 Ctrl+C 复制的文本
    ↓
可直接在 Windows 应用中 Ctrl+V 粘贴 ✅

Windows 中复制的文本
    ↓
也可在 WSL GUI 应用中粘贴 ✅

剪贴板完全共享，无缝衔接！
```

### 技巧五：拖放文件

```
从 Nautilus（WSL 文件管理器）拖文件到 VS Code（Windows） → ✅ 可以
从 Windows 资源管理器拖文件到 GIMP（WSL）→ ✅ 可以
跨系统拖放文件，开箱即用
```

---

## 性能与体验优化

### 让 GUI 应用更流畅

```ini
# ~/.wslconfig — 给 WSL 分配更多资源
[wsl2]
memory=8GB
processors=6
swap=4GB
vmIdleTimeout=-1
```

GPU 加速默认已开启，无需额外配置。你可以验证：

```bash
# 检查 GPU 信息（Vulkan）
vulkaninfo --summary 2>/dev/null || echo "未安装 vulkan-tools"

# 检查 OpenGL
glxinfo | grep "OpenGL renderer" 2>/dev/null || echo "未安装 mesa-utils"
```

### 高 DPI 显示优化

如果你用的是高分辨率屏幕（4K），可能需要调整缩放：

```bash
# 设置 GDK 缩放（影响 GTK 应用如 Gedit、Nautilus）
export GDK_SCALE=2
export GDK_DPI_SCALE=0.5

# 设置 Qt 缩放（影响 Qt 应用）
export QT_AUTO_SCREEN_SCALE_FACTOR=1
export QT_SCALE_FACTOR=2

# 写入 ~/.bashrc 永久生效
cat >> ~/.bashrc << 'EOF'
# HiDPI 缩放设置
export GDK_SCALE=2
export GDK_DPI_SCALE=0.5
export QT_AUTO_SCREEN_SCALE_FACTOR=1
EOF
```

---

## 这些事 WSLg 做不到

### ❌ 不适合的场景

| 场景 | 原因 | 建议 |
|:---|:---|:---|
| **3A 游戏** | GPU 驱动支持有限、性能损耗大 | 用 Windows 原生运行 |
| **视频剪辑**（Premiere/DaVinci） | 专业应用无 Linux 版或性能不足 | Windows 端运行 |
| **完整桌面环境**（GNOME/KDE） | WSLg 是单应用模式，非完整桌面 | 用虚拟机替代 |
| **硬件密集型应用**（音频制作等） | 音频/USB 设备支持有限 | 原生环境更稳定 |

### ⚠️ 已知限制

1. **不支持 Wayland 原生应用**（需要 X11/Wayland 兼容层）
2. **部分 3D 加速功能受限**（游戏和 CAD 类软件）
3. **音频支持基础**（PulseAudio 可用，但不适合专业音频工作）
4. **摄像头/麦克风**部分设备兼容性问题

---

## 实战案例：用 Linux 工具处理 Windows 上的图片

### 批量转换图片格式

```bash
# 安装 ImageMagick
sudo apt install imagemagick

# 将 Windows 目录中的 PNG 全部转为 JPG
mkdir -p /mnt/c/Users/zhangsan/Pictures/output
for f in /mnt/c/Users/zhangsan/Pictures/*.png; do
    convert "$f" "/mnt/c/Users/zhangsan/Pictures/output/$(basename "$" .png").jpg"
done

# 或者用 GIMP 打开单个图片精细编辑
gimp "/mnt/c/Users/zhangsan/Pictures/photo.png"
```

### 用 GIMP 快速修图

```bash
# 打开 Windows 中的图片
gimp "/mnt/c/Users/zhangsan/Desktop/screenshot.png"

# 在 GIMP 中操作：
# · 调整亮度对比度
# · 裁剪旋转
# · 添加文字/水印
# · 导出为不同格式

# 导出时直接保存回 Windows 目录即可
```

---

## 入门篇总结（第 01-06 篇）

到这里，我们的 **WSL 入门篇** 已经全部完成！来回顾一下：

| 篇号 | 主题 | 核心收获 |
|:---:|:---|:---|
| 01 | **WSL 到底是什么？** | 背景、原理、与其他方案对比 |
| 02 | **安装一条龙** | 3 种安装方式 + 首次配置 |
| 03 | **新手第一课** | 15 个必备终端命令 |
| 04 | **文件互通** | 文件系统架构、黄金法则 |
| 05 | **网络完全指南** | 三种模式、端口转发、DNS |
| 06 | **GUI 图形体验** | WSLg 使用、GUI 应用清单 |

**恭喜你完成了入门阶段！🎉 接下来进入实战篇，我们将搭建真正的开发环境。**

---

## 下期预告

下一篇开始 **开发实战篇**：**《VS Code + WSL = 完美开发环境？Remote 插件配置全攻略》**

- 🔌 Remote - WSL 扩展安装与连接
- ⚙️ 必装扩展组合推荐
- 📝 settings.json 最佳配置
- 🚀 开发工作流演示
- 💡 效率翻倍的小技巧

---

> **💡 你试过在 Windows 上跑 Linux GUI 应用吗？感觉怎么样？**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
>
> 💬 最想用 WSLg 运行哪个 Linux 应用？评论区告诉我！
