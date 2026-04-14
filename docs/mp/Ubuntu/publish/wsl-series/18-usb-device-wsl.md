# USB 设备连接 WSL？USB/IP 与硬件直通实战

> **阅读时长**：约 11 分钟 | **难度等级**：⭐⭐⭐⭐ 高级
> **本篇关键词**：USB / USBIPD / ADB / 硬件直通 / WSL / 设备连接
>
> WSL 不仅能操作文件和网络，还能连接真实的 USB 设备！手机调试、串口通信、U盘读写——这篇教你把 Windows 的 USB 设备"桥接"到 WSL 中使用。

---

## USB 设备能接入 WSL 吗？

### 能，但需要"桥梁"

```
┌───────────────────────────────────────────────┐
│               USB 连接架构                       │
│                                               │
│  USB 设备 ←→ Windows 驱动 ←→ USBIPD 桥接      │
│   (物理)       (原生支持)     (协议转发)        │
│                    ↓                            │
│              ┌──────────┐                      │
│              │   WSL    │                      │
│              │  使用设备  │                      │
│              └──────────┘                      │
│                                               │
│  核心技术：USB/IP (USB over IP) 协议           │
│  工具：usbipd-win (Windows 端) + usbip (Linux端)│
└───────────────────────────────────────────────┘
```

### 支持的设备类型

| 设备类型 | 支持度 | 常见用途 |
|:---|:---:|:---|
| **Android 手机** | ✅ 完美 | ADB 调试、文件传输 |
| **串口/UART 设备** | ✅ 很好 | Arduino、ESP32、嵌入式开发 |
| **U 盘 / 移动硬盘** | ⚠️ 可用 | 文件读写（但不如直接用 `/mnt/d`）|
| **游戏手柄** | ✅ 很好 | 游戏开发/输入测试 |
| **打印机/扫描仪** | ❌ 不推荐 | GUI 驱动依赖 |
| **音频设备** | ⚠️ 有限 | 基础功能可用 |

---

## 第一步：安装 USBIPD 工具

### Windows 端安装

```powershell
# 方法一：winget 安装（推荐）
winget install --id DorinNistor.UsbIpd -e winget

# 方法二：手动下载
# 访问 https://github.com/dorssel/usbipd-win/releases
# 下载最新版 msi 安装包并安装

# 验证安装
usbipd version
# usbipd-win v2.x.x
```

> 💡 需要 **Windows 11** 或 **Windows 10 版本 21H2+**

### Linux（WSL）端安装

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install linux-tools-$(uname -r) hwdata usbutils

# 创建软链接（让命令名匹配）
sudo ln -s /usr/lib/linux-tools/*/usbip /usr/local/bin/usbip

# 验证
usbip version
```

---

## 第二步：核心使用流程

### 三步通用流程

```
Step 1: Windows 列出所有 USB 设备
Step 2: 将目标设备绑定到 WSL
Step 3: 在 WSL 中使用设备
```

### Step 1：查看已连接的 USB 设备

```powershell
# PowerShell（管理员）中执行：
usbipd list
```

输出示例：
```
BUSID  DEVICE                                                        STATE
1-1    Intel(R) USB 3.0 eXtensible Host Controller                 Not Shared
1-2    Generic USB Hub                                              Not Shared
1-5    USB Input Device                                             Not Shared
1-6    Android ADB Interface                                        Not Shared          ← 这是我们想要的！
1-8    USB Serial Device (COM3)                                     Not Shared          ← 串口设备
```

记下你想使用的设备的 **BUSID**（如 `1-6`）。

### Step 2：绑定到 WSL

```powershell
# 将 BUSID 为 1-6 的设备绑定到默认 WSL 发行版
usbipd bind --busid 1-6

# 绑定到指定发行版
usbipd bind --busid 1-6 --wsl Ubuntu-24.04

# 输出: usbipd: info: device '1-6' is now available for attach...
```

### Step 3：在 WSL 中挂载设备

```bash
# 查看 WSL 可以访问的 USB 设备
sudo usbip list -r localhost

# 挂载设备（使用 Step 1 中的 busid）
sudo usbip attach -r localhost --busid 1-6

# 验证设备是否可见
lsusb
# 应该能看到你的设备出现在列表中！

# 如果是串口设备：
ls /dev/ttyUSB* /dev/ttyACM*
```

---

## 场景一：Android ADB 调试（最常用 ⭐）

### 为什么要在 WSL 里用 ADB？

```
Windows ADB:
· 路径配置麻烦
· Shell 脚本不兼容
· 和 Git Bash/CMD 冲突

WSL ADB:
· Linux 原生体验
· Shell 脚本无缝衔接
· 配合其他 Linux 工具链完美
```

### 完整配置步骤

```powershell
# 1. 手机用 USB 连接到电脑
# 2. 手机上开启"开发者选项 → USB 调试"
# 3. 查看设备
usbipd list
# 找到 Android 设备的 BUSID（通常显示为 "Android", "Samsung", "Xiaomi" 等）

# 4. 绑定
usbipd bind --busid <Android设备的BUSID>
```

```bash
# 5. WSL 中挂载
sudo usbip attach -r localhost --busid <同一个BUSID>

# 6. 安装 ADB
sudo apt install android-tools-adb

# 7. 验证连接
adb devices
# List of devices attached
# XXXXXXXX    device          ← 看到 device 就说明成功了！

# 8. 常用 ADB 操作
adb shell                          # 进入 Android Shell
adb install app.apk                # 安装 APK
adb logcat                         # 查看日志
adb push file.txt /sdcard/Download/ # 推送文件到手机
adb pull /sdcard/DCIM/photo.jpg .  # 从手机拉取文件
adb screencap -p screen.png         # 截屏
```

### 一键脚本简化流程

```bash
cat > ~/adb-connect.sh << 'SCRIPT'
#!/bin/bash
echo "📱 Android ADB 快速连接"
echo ""

# 尝试自动检测并挂载
DEVICES=$(sudo usbip list -r localhost 2>/dev/null | grep -oP '1-\d+' | head -1)
if [ -n "$DEVICES" ]; then
    echo "发现 USB 设备: $DEVICES"
    sudo usbip attach -r localhost --busid $DEVICES
else
    echo "未找到可用设备，请先在 PowerShell 中执行:"
    echo "  usbipd bind --busid <设备ID>"
fi

echo ""
echo "=== ADB 设备列表 ==="
adb devices 2>/dev/null || echo "ADB 未安装或无设备"
SCRIPT
chmod +x ~/adb-connect.sh
./adb-connect.sh
```

---

## 场景二：串口设备（Arduino / ESP32 / 嵌入式）

### 开发者最常用的场景之一

```powershell
# 绑定串口设备（通常是 "USB Serial Device" 或类似名称）
usbipd list
# 找到 COM3 对应的 USB 设备
usbipd bind --busid 1-8    # 假设 1-8 是你的串口设备
```

```bash
# WSL 中挂载
sudo usbip attach -r localhost --busid 1-8

# 查看串口设备
ls /dev/ttyUSB* /dev/ttyACM*
# /dev/ttyUSB0    ← 这就是你的串口！

# 安装串口工具
sudo apt install minicom picocom cutcom

# 用 minicom 打开串口（115200 波特率）
minicom -D /dev/ttyUSB0 -b 115200

# 或用 picocom（更轻量）
picocom -b 115200 /dev/ttyUSB0

# 用 Python 操作串口
pip install pyserial
python3 << EOF
import serial
ser = serial.Serial('/dev/ttyUSB0', 9600, timeout=1)
ser.write(b'Hello from WSL!\n')
print(ser.readline().decode())
ser.close()
EOF
```

### PlatformIO / Arduino IDE 集成

```bash
# 安装 PlatformIO（CLI 版）
pip install platformio

# 编译并上传固件到 ESP32/Arduino
pio run -t upload

# PlatformIO 会自动检测 /dev/ttyUSB0 并上传固件
# 全程在 WSL 中完成，无需切换到 Windows！
```

---

## 场景三：U 盘与移动存储

> ⚠️ 注意：U 盘通过 USBIPD 挂载后可以访问，但实际场景中直接用 `/mnt/d` 更方便。此处仅作技术展示。

```powershell
usbipd bind --busid <U盘的BUSID>
```

```bash
sudo usbip attach -r localhost --busid <BUSID>

# U 盘通常会作为 SCSI 磁盘出现
# 查看新出现的块设备
lsblk
# sdb       8:16   1  28.9G  0 disk
# └─sdb1    8:17   1  28.9G  0 part

# 挂载
sudo mkdir -p /mnt/usb
sudo mount /dev/sdb1 /mnt/usb

# 访问
ls /mnt/usb/

# 使用完毕后卸载
sudo umount /mnt/usb
```

---

## 常见问题排查

### Q1：`usbip: error: attach request failed`

```
原因：设备已被占用或未正确绑定

解决：
1. Windows 中确认设备未被其他程序占用
2. 重新绑定：usbipd unbind --busid <ID> && usbipd bind --busid <ID>
3. 重启 WSL：wsl --shutdown
```

### Q2：ADB 显示 `no permissions` 或 `unauthorized`

```
原因：手机端的 USB 调试授权弹窗未确认

解决：
1. 手机屏幕上应该弹出"允许 USB 调试吗？"对话框
2. 勾选"一律允许使用这台计算机进行调试"
3. 点击确定
4. 重新 adb devices
```

### Q3：绑定后设备在 Windows 中不可用了

```
这是正常行为！绑定 = 将设备从 Windows 移交给 WSL。

恢复给 Windows：
usbipd unbind --busid <BUSID>

WSL 中也需要先断开：
sudo usbip detach --port=<端口号>
sudo usbip list  # 可以看到当前 attached 的设备和端口
```

### Q4：每次重启都要重新绑定？

是的，USBIPD 绑定不会持久化。解决方案：

```powershell
# 创建 PowerShell 脚本自动绑定常用设备
# save as C:\Scripts\bind-devices.ps1

usbipd bind --busid 1-6    # Android
usbipd bind --busid 1-8    # Serial
Write-Host "✅ USB 设备已绑定到 WSL"
```

```bash
# WSL 端创建自动挂载脚本
cat > ~/usb-attach.sh << 'SCRIPT'
#!/bin/bash
sudo usbip attach -r localhost --busid 1-6    # Android
sudo usbip attach -r localhost --busid 1-8    # Serial
echo "✅ USB 设备已挂载"
SCRIPT
chmod +x ~/usb-attach.sh
```

---

## 下期预告

下一篇开始 **高手篇**：**《WSL 跑 AI/ML 模型？CUDA 加速 + PyTorch 实战》**

- 🎮 GPU 直通配置与验证
- 🤗 CUDA Toolkit 安装
- 🔥 PyTorch / TensorFlow GPU 支持
- 🧠 本地运行大模型（LLM）
- 📊 Jupyter Notebook GPU 监控

---

> **💡 你有在 WSL 中连接过什么 USB 设备？评论区聊聊！**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
