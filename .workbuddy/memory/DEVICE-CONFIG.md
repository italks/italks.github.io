# WorkBuddy 多设备 Memory 配置方案

## 问题说明

当同一项目在多台设备上使用 WorkBuddy 时，`.workbuddy/memory/` 目录下的文件会通过 Git 同步，导致：
- 不同设备的工作记录冲突
- Git merge 冲突
- 设备 A 的记录覆盖设备 B 的记录

## 解决方案：设备隔离存储

### 实施步骤

#### 1. 确定设备名称

在每个设备上设置环境变量或在项目中创建设备配置文件：

**方式 A：环境变量（推荐）**
```bash
# macOS/Linux - 在 ~/.zshrc 或 ~/.bashrc 中添加
export WORKBUDDY_DEVICE_NAME="macbook-pro"

# Windows - 在系统环境变量中设置
WORKBUDDY_DEVICE_NAME=desktop-pc
```

**方式 B：设备配置文件**
在每个设备上创建 `.workbuddy/device.json`：
```json
{
  "deviceName": "macbook-pro",
  "deviceType": "laptop",
  "os": "darwin",
  "hostname": "zhoulizhideMacBook-Pro"
}
```

#### 2. 修改 Memory 文件命名规则

将原来的统一文件改为按设备命名：

**原结构：**
```
.workbuddy/memory/
├── MEMORY.md
├── 2026-04-04.md
└── 2026-04-03.md
```

**新结构：**
```
.workbuddy/memory/
├── SHARED.md              # 设备间共享的记忆
├── devices/
│   ├── macbook-pro/
│   │   ├── MEMORY.md      # MacBook Pro 的设备专属记忆
│   │   ├── 2026-04-04.md  # MacBook Pro 的工作记录
│   │   └── 2026-04-03.md
│   ├── desktop-pc/
│   │   ├── MEMORY.md      # Desktop PC 的设备专属记忆
│   │   ├── 2026-04-04.md
│   │   └── 2026-04-03.md
│   └── iphone/
│       ├── MEMORY.md      # iPhone 的设备专属记忆
│       └── 2026-04-04.md
```

#### 3. 修改 .gitignore（可选）

**选项 A：不同步设备专属 memory**
```gitignore
# 不同步设备专属记忆
.workbuddy/memory/devices/
# 但同步共享记忆
!.workbuddy/memory/SHARED.md
```

**选项 B：同步所有 memory（允许冲突）**
```gitignore
# 不忽略任何 memory 文件
# 但需要注意定期解决 Git 冲突
```

## 使用建议

### 哪些内容应该共享？

**放入 `SHARED.md`：**
- 项目整体规划
- 公众号运营策略
- 长期目标和里程碑
- 通用配置（如 md-wechat 配置）
- 跨设备通用的知识

**放入设备专属 `MEMORY.md`：**
- 设备特定的工作环境配置
- 设备本地的自动化任务记录
- 设备特有的工具路径
- 设备本地的临时工作记录

### 工作流程示例

**场景：MacBook Pro 和 Desktop PC 协作**

1. **MacBook Pro 上工作**：
   - 生成 Ubuntu 公众号文章
   - 记录在 `.workbuddy/memory/devices/macbook-pro/2026-04-04.md`
   - 更新设备专属配置

2. **Desktop PC 上工作**：
   - 查看 `SHARED.md` 了解项目整体进度
   - 执行不同类型的任务（如小红书运营）
   - 记录在 `.workbuddy/memory/devices/desktop-pc/2026-04-04.md`

3. **定期同步**：
   - 提交代码时，设备专属 memory 会同步到 Git
   - 其他设备可以看到但不会冲突
   - `SHARED.md` 作为跨设备的"公告板"

## 冲突处理策略

### 如果选择同步所有 memory 文件：

**解决 Git 冲突的方式：**

```bash
# 方式 1：保留双方修改
git checkout --ours .workbuddy/memory/devices/macbook-pro/2026-04-04.md
git checkout --theirs .workbuddy/memory/devices/desktop-pc/2026-04-04.md
git add .

# 方式 2：手动合并冲突部分
# 打开冲突文件，保留两边的记录
# 冲突标记示例：
<<<<<<< HEAD
| 4/3 | axios供应链攻击 | 安全热点 |
=======
| 4/3 | Linux网络配置 | 入门教程 |
>>>>>>> a4c3d20
# 改为：
| 4/3 | axios供应链攻击（MacBook Pro）| 安全热点 |
| 4/3 | Linux网络配置（Desktop PC）| 入门教程 |
```

## 自动化脚本

创建脚本自动识别设备并使用对应的 memory：

```bash
#!/bin/bash
# .workbuddy/scripts/sync-memory.sh

DEVICE_NAME=${WORKBUDDY_DEVICE_NAME:-$(hostname)}
MEMORY_DIR=".workbuddy/memory/devices/$DEVICE_NAME"

# 创建设备专属目录
mkdir -p "$MEMORY_DIR"

# 如果没有 MEMORY.md，从模板创建
if [ ! -f "$MEMORY_DIR/MEMORY.md" ]; then
  cp .workbuddy/templates/MEMORY-device.template.md "$MEMORY_DIR/MEMORY.md"
fi

echo "Using device memory: $DEVICE_NAME"
```

## 总结

**推荐配置：**
1. 设置 `WORKBUDDY_DEVICE_NAME` 环境变量
2. 使用设备专属目录存储 memory
3. `SHARED.md` 存储跨设备共享信息
4. 根据需要选择是否同步设备专属 memory

**优点：**
- 设备间 memory 完全隔离，不会冲突
- 保留跨设备共享能力
- 便于追踪每个设备的工作记录
- Git 历史清晰可追溯
