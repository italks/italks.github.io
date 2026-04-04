# WorkBuddy 多设备 Memory 快速参考

## 🎯 核心原则

**读取所有设备，只写当前设备**

---

## 📱 当前设备

```bash
# 查看当前设备配置
cat .workbuddy/device.json

# 当前设备名称
macbook-pro
```

---

## 📖 读取操作

```bash
# 查看所有设备的今日记录
ls .workbuddy/memory/devices/*/$(date +%Y-%m-%d).md

# 查看指定设备的记录
cat .workbuddy/memory/devices/desktop-pc/2026-04-04.md

# 查看共享信息
cat .workbuddy/memory/SHARED.md

# 查看所有设备的 MEMORY.md
cat .workbuddy/memory/devices/*/MEMORY.md
```

---

## ✏️ 写入操作

```bash
# ✅ 只写入当前设备
vim .workbuddy/memory/devices/macbook-pro/2026-04-04.md

# ✅ 更新共享信息
vim .workbuddy/memory/SHARED.md

# ❌ 不要修改其他设备的 memory
# vim .workbuddy/memory/devices/desktop-pc/2026-04-04.md
```

---

## 🔄 同步操作

```bash
# 每日开始
git pull

# 每日结束
git add .workbuddy/memory/devices/macbook-pro/
git commit -m "macbook-pro: 今日工作记录"
git push

# 更新共享信息后
git add .workbuddy/memory/SHARED.md
git commit -m "更新共享信息"
git push
```

---

## 🛠️ 快捷命令

### 查看所有设备最近记录
```bash
for dir in .workbuddy/memory/devices/*/; do
  device=$(basename "$dir")
  latest=$(ls -t "$dir"2026-*.md 2>/dev/null | head -1)
  [ -n "$latest" ] && echo "$device: $(basename $latest)"
done
```

### 创建今日记录
```bash
device=$(jq -r '.deviceName' .workbuddy/device.json)
date=$(date +%Y-%m-%d)
file=".workbuddy/memory/devices/$device/$date.md"
[ ! -f "$file" ] && echo "# $date 工作记录" > "$file"
vim "$file"
```

---

## ⚠️ 重要提醒

- ✅ **读取**：可以查看所有设备
- ✅ **写入**：只修改当前设备目录
- ✅ **共享**：重要信息写入 `SHARED.md`
- ❌ **禁止**：不要修改其他设备的文件

---

## 📚 详细文档

- 完整指南：`.workbuddy/memory/README.md`
- 配置说明：`.workbuddy/memory/DEVICE-CONFIG.md`
- 共享信息：`.workbuddy/memory/SHARED.md`
