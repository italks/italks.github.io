# WorkBuddy 多设备 Memory 使用指南

## 🎯 核心原则

**读取所有设备记录，只写入当前设备**

- ✅ **读取**：可以查看所有设备的工作记录和 memory
- ✅ **写入**：只修改当前设备的 memory 文件
- ✅ **同步**：通过 Git 同步所有设备的 memory
- ✅ **协作**：不同设备可以看到彼此的工作进度

---

## 📁 文件结构

```
.workbuddy/
├── device.json                     # 当前设备配置
└── memory/
    ├── SHARED.md                   # 跨设备共享信息
    ├── DEVICE-CONFIG.md            # 配置方案说明
    ├── README.md                   # 本文件
    └── devices/                    # 所有设备的 memory（会同步）
        ├── macbook-pro/            # MacBook Pro 的记录
        │   ├── MEMORY.md
        │   ├── 2026-04-04.md
        │   └── ...
        ├── desktop-pc/             # Desktop PC 的记录（只读）
        │   ├── MEMORY.md
        │   ├── 2026-04-04.md
        │   └── ...
        └── iphone/                 # iPhone 的记录（只读）
            ├── MEMORY.md
            └── ...
```

---

## 🔄 工作流程

### 当前设备识别

WorkBuddy 启动时，会自动读取 `.workbuddy/device.json` 确定当前设备：

```json
{
  "deviceName": "macbook-pro",
  "deviceType": "laptop",
  "os": "darwin",
  "hostname": "italksdeMBP"
}
```

### 读取策略

**优先级顺序：**
1. 当前设备的 memory（读写）
2. 共享 memory `SHARED.md`（读写）
3. 其他设备的 memory（只读）

**读取示例：**
```bash
# 查看当前设备（macbook-pro）的今日记录
cat .workbuddy/memory/devices/macbook-pro/2026-04-04.md

# 查看其他设备（desktop-pc）的今日记录
cat .workbuddy/memory/devices/desktop-pc/2026-04-04.md

# 查看共享信息
cat .workbuddy/memory/SHARED.md

# 查看所有设备的最新记录
ls .workbuddy/memory/devices/*/2026-04-04.md
```

### 写入策略

**只写入当前设备目录：**
```bash
# ✅ 正确：写入当前设备
echo "新增内容" >> .workbuddy/memory/devices/macbook-pro/2026-04-04.md

# ❌ 错误：不要修改其他设备的 memory
# echo "新增内容" >> .workbuddy/memory/devices/desktop-pc/2026-04-04.md
```

---

## 🤝 多设备协作示例

### 场景：MacBook Pro 和 Desktop PC 协作

#### MacBook Pro 上的工作

```bash
# 1. 拉取最新记录
git pull

# 2. 查看 Desktop PC 昨天做了什么
cat .workbuddy/memory/devices/desktop-pc/2026-04-03.md
# 输出：完成了小红书运营策略优化

# 3. 继续自己的工作
echo "## 新任务\n生成 Ubuntu 26.04 Beta 测评文章" \
  >> .workbuddy/memory/devices/macbook-pro/2026-04-04.md

# 4. 提交记录
git add .workbuddy/memory/devices/macbook-pro/
git commit -m "macbook-pro: 完成 Ubuntu 26.04 Beta 测评"
git push
```

#### Desktop PC 上的工作

```bash
# 1. 拉取最新记录
git pull

# 2. 查看 MacBook Pro 今天做了什么
cat .workbuddy/memory/devices/macbook-pro/2026-04-04.md
# 输出：生成了 Ubuntu 26.04 Beta 测评文章

# 3. 开始自己的工作
echo "## 新任务\n优化小红书内容排版" \
  >> .workbuddy/memory/devices/desktop-pc/2026-04-04.md

# 4. 提交记录
git add .workbuddy/memory/devices/desktop-pc/
git commit -m "desktop-pc: 优化小红书内容排版"
git push
```

---

## 📋 日常操作指南

### 每日开始工作

```bash
# 1. 同步所有设备的记录
git pull

# 2. 查看其他设备最近的动态
for device in .workbuddy/memory/devices/*/; do
  echo "=== $(basename $device) ==="
  ls -t "$device"2026-*.md | head -1 | xargs cat
done

# 3. 查看共享信息是否有更新
cat .workbuddy/memory/SHARED.md

# 4. 创建或更新今日记录
date=$(date +%Y-%m-%d)
device=$(cat .workbuddy/device.json | grep deviceName | cut -d'"' -f4)
touch ".workbuddy/memory/devices/$device/$date.md"
```

### 每日结束工作

```bash
# 1. 提交当前设备的记录
git add .workbuddy/memory/devices/$(cat .workbuddy/device.json | grep deviceName | cut -d'"' -f4)/
git commit -m "$(cat .workbuddy/device.json | grep deviceName | cut -d'"' -f4): 今日工作记录"

# 2. 推送到远程
git push
```

### 需要跨设备共享重要信息

```bash
# 1. 更新共享 memory
vim .workbuddy/memory/SHARED.md

# 2. 提交并推送
git add .workbuddy/memory/SHARED.md
git commit -m "更新共享信息：Ubuntu 26.04 正式版发布日期确认"
git push
```

---

## ⚠️ 重要规则

### ✅ 允许的操作

1. **读取所有设备的 memory**
   ```bash
   cat .workbuddy/memory/devices/*/MEMORY.md
   cat .workbuddy/memory/devices/*/2026-04-04.md
   ```

2. **修改当前设备的 memory**
   ```bash
   vim .workbuddy/memory/devices/macbook-pro/MEMORY.md
   ```

3. **修改共享 memory**
   ```bash
   vim .workbuddy/memory/SHARED.md
   ```

### ❌ 禁止的操作

1. **修改其他设备的 memory**
   ```bash
   # ❌ 不要这样做
   vim .workbuddy/memory/devices/desktop-pc/MEMORY.md
   ```

2. **删除其他设备的记录**
   ```bash
   # ❌ 不要这样做
   rm .workbuddy/memory/devices/desktop-pc/2026-04-04.md
   ```

---

## 🛠️ 自动化脚本

### 创建每日记录脚本

```bash
#!/bin/bash
# 文件：.workbuddy/scripts/daily-memory.sh

# 获取当前设备
DEVICE=$(cat .workbuddy/device.json | jq -r '.deviceName')
DATE=$(date +%Y-%m-%d)
MEMORY_DIR=".workbuddy/memory/devices/$DEVICE"
MEMORY_FILE="$MEMORY_DIR/$DATE.md"

# 创建目录
mkdir -p "$MEMORY_DIR"

# 如果文件不存在，创建模板
if [ ! -f "$MEMORY_FILE" ]; then
  cat > "$MEMORY_FILE" << EOF
# $DATE 工作记录

## 设备信息
- 设备：$DEVICE
- 日期：$(date +%Y年%m月%d日)

## 今日任务

## 完成情况

## 备注
EOF
  echo "创建今日记录：$MEMORY_FILE"
else
  echo "今日记录已存在：$MEMORY_FILE"
fi

# 打开编辑
vim "$MEMORY_FILE"
```

### 查看所有设备最近记录

```bash
#!/bin/bash
# 文件：.workbuddy/scripts/show-all-devices.sh

echo "=== 所有设备最近工作记录 ==="
echo

for device_dir in .workbuddy/memory/devices/*/; do
  device_name=$(basename "$device_dir")
  latest_file=$(ls -t "$device_dir"2026-*.md 2>/dev/null | head -1)
  
  if [ -n "$latest_file" ]; then
    echo "📱 $device_name"
    echo "   最新记录：$(basename "$latest_file")"
    echo "   内容预览："
    head -10 "$latest_file" | sed 's/^/   /'
    echo
  fi
done
```

---

## 📊 数据流示意图

```
┌─────────────────┐
│  MacBook Pro    │
│  (当前设备)      │
└────────┬────────┘
         │
         │ 读取所有设备 memory
         ▼
┌─────────────────────────────────────┐
│   .workbuddy/memory/devices/        │
│   ├── macbook-pro/   ←─┐            │
│   │   ├── MEMORY.md    │ 读取+写入  │
│   │   └── 2026-04-04.md│            │
│   ├── desktop-pc/      │            │
│   │   ├── MEMORY.md    │ 只读       │
│   │   └── 2026-04-04.md│            │
│   └── iphone/          │            │
│       └── MEMORY.md    │ 只读       │
└─────────────────────────┴───────────┘
         │
         │ Git 同步
         ▼
┌─────────────────┐
│  Remote Repo    │
│  (GitHub/GitLab)│
└─────────────────┘
         │
         │ Git pull
         ▼
┌─────────────────┐
│  Desktop PC     │
│  (其他设备)      │
└─────────────────┘
```

---

## 🎓 最佳实践

### 1. 定期同步
- 每日开始前 `git pull`
- 每日结束后 `git push`
- 重要更新后立即推送

### 2. 清晰的提交信息
```bash
# ✅ 好的提交信息
git commit -m "macbook-pro: 完成 Ubuntu 26.04 Beta 测评文章"

# ❌ 不好的提交信息
git commit -m "update"
```

### 3. 设备命名规范
- `macbook-pro` / `macbook-air`
- `desktop-pc` / `desktop-workstation`
- `iphone` / `ipad`
- `office-laptop` / `home-laptop`

### 4. 共享信息及时更新
遇到以下情况时，更新 `SHARED.md`：
- 项目整体规划变更
- 重要里程碑达成
- 公共配置修改
- 跨设备协作任务分配

---

## 🔍 常见问题

### Q1: 如果不小心修改了其他设备的 memory 怎么办？

**A**: 
```bash
# 1. 撤销修改
git checkout .workbuddy/memory/devices/其他设备名/

# 2. 如果已经提交，回退提交
git reset --soft HEAD~1
git checkout .workbuddy/memory/devices/其他设备名/
git commit -m "撤销误操作"
```

### Q2: 如何查看某个设备的历史记录？

**A**:
```bash
# 查看指定设备的所有记录
ls -lt .workbuddy/memory/devices/macbook-pro/2026-*.md

# 查看某个设备的 Git 历史
git log --oneline -- .workbuddy/memory/devices/macbook-pro/
```

### Q3: 多个设备同时推送会冲突吗？

**A**: 不会，因为每个设备只修改自己的目录，Git 会自动合并不同目录的更改。如果真的冲突，说明有人修改了其他设备的文件，需要手动解决。

---

## 📚 相关文档

- 配置说明：`.workbuddy/memory/DEVICE-CONFIG.md`
- 共享记忆：`.workbuddy/memory/SHARED.md`
- 设备配置：`.workbuddy/device.json`
