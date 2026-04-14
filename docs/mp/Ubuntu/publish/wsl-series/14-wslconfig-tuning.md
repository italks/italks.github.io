# .wslconfig 黑魔法：内存、CPU、磁盘随便调

> **阅读时长**：约 11 分钟 | **难度等级**：⭐⭐⭐☆☆ 进阶实战
> **本篇关键词**：.wslconfig / WSL 配置 / 内存 / 性能调优 / 网络模式
>
> `.wslconfig` 是 WSL 的"控制面板"。掌握它，你就能精确控制 WSL 的每一个资源参数——从内存分配到网络行为，全都在一个文件里搞定。

---

## .wslconfig 是什么？

### 文件位置与格式

```
位置: C:\Users\<你的用户名>\.wslconfig

格式: Windows INI 格式（类似 .ini 配置文件）
生效: 每次修改后需要 wsl --shutdown 重启
作用范围: 全局（影响所有 WSL 发行版）
```

### 基本结构

```ini
[wsl2]
; 这是 WSL 2 的配置节
memory=8GB
processors=6
```

---

## 完整参数详解

### 一、资源管理参数

#### memory — 内存上限

```ini
# 格式
memory=<大小>

# 示例
memory=4GB          ; 固定 4GB
memory=50%          ; 动态占用系统总内存的 50%（默认值）
memory=8192MB       ; 用 MB 也可以
memory=0            ; 无限制（不推荐！可能拖垮 Windows）
```

| 你的总内存 | 推荐设置 | 说明 |
|:---:|:---|:---|
| 8GB | `memory=4GB` | 留一半给 Windows |
| 16GB | `memory=8GB` | WSL 可以比较大方 |
| 32GB+ | `memory=16GB` | 大型项目/Docker 多容器 |
| 64GB+ | `memory=24GB` | AI/ML 训练场景 |

#### processors — CPU 核心数限制

```ini
# 格式
processors=<核心数>

# 示例
processors=6        ; 使用 6 个 CPU 核心
processors=4        ; 谨慎使用，留一半给 Windows
processors=-1       ; 使用所有核心
```

> 💡 **建议留 2-4 个核给 Windows**，否则切出 WSL 时 Windows 可能卡顿。

#### swap — 交换空间

```ini
swap=2GB            ; 固定 2GB
swap=0              ; 禁用交换（内存足够时可以）
swap=auto           ; 自动（默认为系统内存的 25% 或最大 4GB）

# 自定义交换文件位置
swapfile=D:\\wsl-swap.swap    ; 放到 D 盘节省 C 盘空间 ⭐
```

#### vmIdleTimeout — 自动内存回收

```ini
vmIdleTimeout=-1       ; 永不自动回收（默认，性能最好）
vmIdleTimeout=600      ; 空闲 10 分钟后开始回收
vmIdleTimeout=3600     ; 空闲 1 小时后开始回收
```

```
内存回收效果：

不回收 (-1)：
内存 ████████████████░░ 始终保持高位
时间 ──────────────────────→

有回收 (600s)：
内存 ██░░░░████████░░░░███ 空闲后逐渐释放
时间 ──────────────────────→
```

---

### 二、网络参数（重点 ⭐）

#### networkingMode — 网络模式选择

```ini
# 三种可选值：

networkingMode=NAT        ; 默认模式（向后兼容）
networkingMode=mirrored   ; 镜像模式（Win11 推荐 ⭐⭐⭐⭐⭐）
networkingMode=symmetric  ; 对称 NAT 模式（高级）
```

**三种模式对比**：

| 特性 | NAT | mirrored | symmetric |
|:---|:---:|:---:|:---:|
| localhost 互通 | 需配置 | ✅ 自动 | ✅ |
| 局域网访问 | ❌ 不行 | ✅ 可以 | ✅ |
| IPv4 地址 | 独立虚拟 IP | 共享 Windows IP | 可选 |
| IPv6 支持 | 有限 | ✅ 完整 | ✅ |
| VPN 兼容性 | 一般 | **最佳** | 好 |
| 适用版本 | Win10/11 | **Win11 推荐** | Win11 最新版 |

#### mirrored 模式的附加选项

```ini
networkingMode=mirrored
dnsTunneling=true         ; DNS 通过 Windows 解决（解决 DNS 问题）
autoProxy=true             ; 自动继承 Windows 代理设置
firewall=true              ; 启用 Windows 防火墙隔离
```

> 🎯 **Win11 用户直接复制这段就对了**：
> ```ini
> [wsl2]
> networkingMode=mirrored
> dnsTunneling=true
> autoProxy=true
> firewall=true
> ```

---

### 三、磁盘与挂载参数

#### defaultVHDSize — 初始磁盘大小

```ini
defaultVHDSize=60GB        ; vhdx 初始最大容量（实际按需增长）
; 一般不需要设置这个，默认即可
```

#### kernelCommandLine — 内核启动参数

```ini
; 高级用户使用
kernelCommandLine="net.ifnames=0 biosdevname=0"
; 例如统一网卡命名规则
```

---

## 推荐配置方案

### 方案一：均衡开发（大多数开发者 ⭐⭐⭐⭐⭐）

```ini
[wsl2]
memory=8GB
swap=4GB
swapfile=D:\\wsl-swap.swap
processors=6
networkingMode=mirrored
dnsTunneling=true
autoProxy=true
firewall=true
vmIdleTimeout=-1
```

### 方案二：轻量高效（8GB 内存或笔记本 ⭐⭐⭐⭐）

```ini
[wsl2]
memory=4GB
swap=2GB
processors=4
networkingMode=mirrored
dnsTunneling=true
autoProxy=true
vmIdleTimeout=-1
```

### 方案三：高性能（16GB+ 内存 + Docker重度用户 ⭐⭐⭐⭐）

```ini
[wsl2]
memory=12GB
swap=4GB
processors=10
networkingMode=mirrored
dnsTunneling=true
autoProxy=true
firewall=true
vmIdleTimeout=-1
```

### 方案四：AI/ML 训练（32GB+ 内存 + GPU ⭐⭐⭐）

```ini
[wsl2]
memory=24GB
swap=8GB
processors=14
networkingMode=mirrored
dnsTunneling=true
autoProxy=true
vmIdleTimeout=-1
```

---

## 配置修改后的生效流程

```
1. 编辑 C:\Users\<你>\.wslconfig
   ↓
2. 保存文件
   ↓
3. PowerShell 中执行:
   wsl --shutdown
   ↓
4. 重新打开 Ubuntu（或其他发行版）
   ↓
5. 验证配置是否生效
   free -h      # 检查内存
   nproc        # 检查 CPU 核数
```

> ⚠️ **注意**：`.wslconfig` 中的注释用英文分号 `;`，不要用 `#`！

---

## 高级技巧

### 技巧一：多套配置快速切换

创建多个配置文件，按需切换：

```powershell
# 创建不同场景的配置
# C:\Users\你\.wslconfig.dev      （开发用）
# C:\Users\你\.wslconfig.light    （轻量用）
# C:\Users\你\.wslconfig.heavy    （重型任务用）

# PowerShell 快速切换函数（加入 $PROFILE）：
function Set-WSLConfig {
    param([string]$Profile = "dev")
    $src = "$env:USERPROFILE\.wslconfig.$Profile"
    if (Test-Path $src) {
        Copy-Item $src "$env:USERPROFILE\.wslconfig" -Force
        wsl - shutdown
        Write-Host "已切换到 $Profile 配置并重启 WSL"
    }
}
# 使用: Set-WSLConfig heavy
```

### 技巧二：监控当前实际资源使用

```bash
# 在 WSL 中运行
echo "=== CPU ==="
nproc
echo "=== Memory ==="
free -h
echo "=== Disk ==="
df -h /
echo "=== Top Processes ==="
ps aux --sort=-%mem | head -8
```

```powershell
# 在 PowerShell 中查看 Vmmem 进程
Get-Process Vmmem | Select-Object CPU, WorkingSet64, @{N='Mem_MB';E={[math]::Round($_.WorkingSet64/1MB)}}
```

---

## 下期预告

下一篇：**《同时装 5 个 Linux 发行版？多发行版管理与切换技巧》**

- 🐧 多发行版的安装与管理
- 🔁 默认发行版切换
- 💾 导入导出与备份策略
- 📍 自定义存储位置
- 🎯 不同发行版的最佳用途

---

> **💡 你的 .wslconfig 有什么独家配置？评论区分享一下！**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
