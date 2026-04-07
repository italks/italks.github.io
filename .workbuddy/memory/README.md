# WorkBuddy 多设备 Memory 使用指南

## 快速开始

### 1. 查看当前设备配置

```bash
cat .workbuddy/device.json
```

### 2. Memory 文件结构

```
.workbuddy/memory/
├── SHARED.md              # 跨设备共享的项目信息
├── DEVICE-CONFIG.md       # 多设备配置方案说明
├── README.md              # 本文件
└── devices/               # 设备专属目录（已加入 .gitignore）
    └── macbook-pro/       # 当前设备（MacBook Pro）
        ├── MEMORY.md      # 设备专属长期记忆
        ├── 2026-04-04.md  # 每日工作记录
        └── ...
```

### 3. 设备间协作方式

#### 共享记忆（SHARED.md）
- **存储内容**：项目整体规划、通用配置、重要里程碑
- **同步方式**：通过 Git 同步
- **修改规则**：所有设备都可修改，定期同步

#### 设备专属记忆（devices/[设备名]/）
- **存储内容**：
  - 设备本地的工作记录
  - 设备特有的环境配置
  - 自动化任务执行日志
- **同步方式**：默认不同步（已在 .gitignore 中排除）
- **优点**：避免 Git 冲突

### 4. 如何在其他设备上配置

#### 步骤 1：创建设备配置文件

在新设备上创建 `.workbuddy/device.json`：

```json
{
  "deviceName": "desktop-pc",
  "deviceType": "desktop",
  "os": "windows",
  "hostname": "DESKTOP-ABC123",
  "createdAt": "2026-04-04",
  "description": "桌面工作站"
}
```

#### 步骤 2：创建设备专属目录

```bash
mkdir -p .workbuddy/memory/devices/desktop-pc
```

#### 步骤 3：创建设备专属 MEMORY.md

```bash
cp .workbuddy/memory/devices/macbook-pro/MEMORY.md \
   .workbuddy/memory/devices/desktop-pc/MEMORY.md
```

然后根据设备特点修改内容。

### 5. 如需同步设备专属 memory

如果希望设备间共享工作记录，可以修改 `.gitignore`：

```gitignore
# 注释掉排除规则
# .workbuddy/memory/devices/

# 添加同步规则
!.workbuddy/memory/devices/
```

**注意**：同步后可能遇到 Git 冲突，需要手动合并。

### 6. 解决 Git 冲突

如果选择同步设备专属 memory，遇到冲突时：

```bash
# 查看冲突文件
git status

# 手动编辑冲突文件，保留两边的记录
# 或使用合并工具
git mergetool

# 标记为已解决
git add .workbuddy/memory/devices/*/2026-04-04.md
```

## 当前配置状态

- **当前设备**：macbook-pro (italksdeMBP)
- **设备类型**：laptop (macOS)
- **同步策略**：设备专属 memory 不同步
- **共享文件**：SHARED.md, DEVICE-CONFIG.md

## 常见问题

### Q1: 如何查看其他设备的工作记录？

**A**: 如果设备专属 memory 已同步，可以查看：
```bash
ls .workbuddy/memory/devices/
cat .workbuddy/memory/devices/desktop-pc/2026-04-04.md
```

如果未同步，需要在原设备上查看。

### Q2: 如何在设备间共享信息？

**A**: 修改 `SHARED.md` 文件，提交到 Git：
```bash
# 编辑共享文件
vim .workbuddy/memory/SHARED.md

# 提交同步
git add .workbuddy/memory/SHARED.md
git commit -m "更新共享记忆"
git push
```

### Q3: 设备专属 memory 会丢失吗？

**A**: 取决于你的选择：
- **不同步**：只存在本地，不会丢失，但不会自动备份到 Git
- **同步**：存在 Git 仓库中，有版本历史，但可能冲突

建议：重要信息写入 `SHARED.md`，临时工作记录留在设备专属目录。

## 建议

1. **重要配置** → 写入 `SHARED.md`
2. **每日工作记录** → 设备专属目录
3. **跨设备任务** → 在 `SHARED.md` 中同步进度
4. **定期备份** → 手动提交设备专属 memory（如需）
