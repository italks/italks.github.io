# 在其他设备上配置 WorkBuddy Memory

本文档说明如何在其他设备（如 Desktop PC、iPhone 等）上配置 WorkBuddy memory。

---

## 🖥️ Desktop PC 配置示例

### 步骤 1：克隆项目

```bash
# 克隆项目到本地
git clone <your-repo-url>
cd italks.github.io
```

### 步骤 2：创建设备配置文件

```bash
# 创建设备配置
cat > .workbuddy/device.json << EOF
{
  "deviceName": "desktop-pc",
  "deviceType": "desktop",
  "os": "windows",
  "hostname": "DESKTOP-WORKSTATION",
  "createdAt": "2026-04-04",
  "description": "办公室桌面工作站"
}
EOF
```

### 步骤 3：创建设备专属目录

```bash
# 创建目录
mkdir -p .workbuddy/memory/devices/desktop-pc

# 创建设备专属 MEMORY.md
cat > .workbuddy/memory/devices/desktop-pc/MEMORY.md << EOF
# Desktop PC 设备专属记忆

## 设备信息
- 设备名称：desktop-pc
- 设备类型：桌面工作站
- 操作系统：Windows 11
- 主要用途：重度开发、视频剪辑、游戏测试

## 工作环境
- 项目路径：D:/projects/italks.github.io/
- Node.js 版本：22.12.0
- 编辑器：VSCode + Cursor

## 设备特定配置

### Windows 路径映射
- 项目根目录：D:/projects/italks.github.io/
- WorkBuddy 配置：C:/Users/zhoulizhi/.workbuddy/
- 临时文件：D:/temp/

### 主要工作内容
- 小红书运营策略优化
- 视频脚本生成
- 竞品分析报告
- 数据可视化图表

## 自动化任务
- 每周一生成小红书选题方案
- 每周五生成运营数据报告
- 热点事件自动推送

## 更新记录
- 2026-04-04：初始化 Desktop PC 设备配置
EOF
```

### 步骤 4：验证配置

```bash
# 检查配置是否正确
cat .workbuddy/device.json

# 查看其他设备的记录（MacBook Pro）
ls .workbuddy/memory/devices/macbook-pro/

# 查看共享信息
cat .workbuddy/memory/SHARED.md

# 测试写入权限
echo "## 测试记录" >> .workbuddy/memory/devices/desktop-pc/test.md
cat .workbuddy/memory/devices/desktop-pc/test.md
rm .workbuddy/memory/devices/desktop-pc/test.md
```

---

## 📱 iPhone 配置示例

### 步骤 1：在 iPhone 上安装 WorkBuddy

（假设 WorkBuddy 支持 iOS 客户端）

### 步骤 2：登录并同步项目

```bash
# 在 WorkBuddy iOS 应用中：
# 1. 扫码登录
# 2. 选择项目 italks.github.io
# 3. 等待同步完成
```

### 步骤 3：创建设备配置

由于 iOS 可能无法直接创建文件，可以在 MacBook Pro 上代为创建：

```bash
# 在 MacBook Pro 上执行
cat > .workbuddy/memory/devices/iphone/device.json << EOF
{
  "deviceName": "iphone",
  "deviceType": "mobile",
  "os": "ios",
  "createdAt": "2026-04-04",
  "description": "移动办公设备"
}
EOF

cat > .workbuddy/memory/devices/iphone/MEMORY.md << EOF
# iPhone 设备专属记忆

## 设备信息
- 设备名称：iPhone
- 设备类型：移动设备
- 操作系统：iOS 19
- 主要用途：移动办公、应急响应、素材收集

## 使用场景
- 会议记录
- 灵感捕捉
- 紧急修改
- 远程协作

## 限制
- 无法执行本地脚本
- 无法访问本地文件系统
- 只能通过微信服务号交互

## 更新记录
- 2026-04-04：初始化 iPhone 设备配置
EOF

# 提交到 Git
git add .workbuddy/memory/devices/iphone/
git commit -m "添加 iPhone 设备配置"
git push
```

然后在 iPhone 上拉取更新。

---

## 💻 其他笔记本配置示例

### MacBook Air 配置

```bash
cat > .workbuddy/device.json << EOF
{
  "deviceName": "macbook-air",
  "deviceType": "laptop",
  "os": "darwin",
  "hostname": "zhoulizhideMacBook-Air",
  "createdAt": "2026-04-04",
  "description": "便携办公笔记本"
}
EOF

mkdir -p .workbuddy/memory/devices/macbook-air

cat > .workbuddy/memory/devices/macbook-air/MEMORY.md << EOF
# MacBook Air 设备专属记忆

## 设备信息
- 设备名称：macbook-air
- 设备类型：便携笔记本
- 主要用途：出差、咖啡厅办公、轻量级工作

## 使用场景
- 外出办公
- 会议演示
- 轻量级编辑
- 内容审核

## 性能限制
- 不适合：视频渲染、大规模数据处理
- 适合：文档编辑、内容创作、简单开发

## 更新记录
- 2026-04-04：初始化 MacBook Air 设备配置
EOF
```

---

## 🔄 多设备协作工作流

### 场景：团队协作

#### MacBook Pro（主力开发）
```bash
# 上午：生成 Ubuntu 公众号文章
echo "## 上午\n生成 Ubuntu 26.04 Beta 测评" \
  >> .workbuddy/memory/devices/macbook-pro/2026-04-04.md

git add .workbuddy/memory/devices/macbook-pro/
git commit -m "macbook-pro: 完成 Ubuntu 26.04 Beta 测评"
git push
```

#### Desktop PC（数据分析）
```bash
# 下午：分析运营数据
git pull  # 同步 MacBook Pro 的记录

echo "## 下午\n分析上周运营数据，生成报告" \
  >> .workbuddy/memory/devices/desktop-pc/2026-04-04.md

git add .workbuddy/memory/devices/desktop-pc/
git commit -m "desktop-pc: 完成运营数据分析"
git push
```

#### iPhone（移动审核）
```bash
# 晚上：在手机上查看并审核
git pull

# 查看今天所有设备的工作
cat .workbuddy/memory/devices/*/2026-04-04.md

# 通过微信服务号发送修改建议
# （WorkBuddy 会记录到 iPhone 的 memory）
```

---

## 📊 设备分工建议

| 设备 | 主要用途 | 典型任务 |
|:---|:---|:---|
| **MacBook Pro** | 主力开发 | 文章生成、代码开发、重度编辑 |
| **Desktop PC** | 数据分析 | 运营分析、视频处理、图表生成 |
| **MacBook Air** | 移动办公 | 外出工作、会议演示、轻量编辑 |
| **iPhone** | 移动审核 | 灵感记录、紧急修改、内容审核 |

---

## ✅ 验证清单

在新设备上配置完成后，检查以下项目：

- [ ] 已创建 `.workbuddy/device.json`
- [ ] 已创建设备专属目录 `.workbuddy/memory/devices/[设备名]/`
- [ ] 已创建设备专属 `MEMORY.md`
- [ ] 可以读取其他设备的 memory
- [ ] 可以读取 `SHARED.md`
- [ ] 写入测试成功
- [ ] 已提交到 Git

---

## 🆘 常见问题

### Q1: 如何知道当前设备名称？

```bash
# 查看设备配置
cat .workbuddy/device.json

# 或使用 jq
jq -r '.deviceName' .workbuddy/device.json
```

### Q2: 如何查看所有已配置的设备？

```bash
ls -la .workbuddy/memory/devices/
```

### Q3: 可以删除某个设备的配置吗？

可以，但建议保留：
```bash
# 不推荐删除
rm -rf .workbuddy/memory/devices/old-device/

# 建议归档
mv .workbuddy/memory/devices/old-device/ \
   .workbuddy/memory/devices/_archived/
```

### Q4: 设备名称可以修改吗？

可以，但需要：
1. 修改 `.workbuddy/device.json`
2. 重命名 `.workbuddy/memory/devices/旧名称/` 为新名称
3. 提交到 Git

```bash
# 修改设备名称
vim .workbuddy/device.json

# 重命名目录
mv .workbuddy/memory/devices/macbook-pro/ \
   .workbuddy/memory/devices/new-macbook/

# 提交
git add .workbuddy/
git commit -m "重命名设备：macbook-pro → new-macbook"
git push
```

---

## 📚 相关文档

- 快速参考：`.workbuddy/memory/QUICK-REF.md`
- 完整指南：`.workbuddy/memory/README.md`
- 配置说明：`.workbuddy/memory/DEVICE-CONFIG.md`
