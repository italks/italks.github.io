# Ubuntu 26.04 升级被拒？cgroup v1 迁移全攻略 + 升级后 12 项必做修复

> 升级报错 "Refusing to run under cgroup v1"？中文变日文？ll 命令出乱码？别慌，一文搞定所有升级坑点。

⏱ 阅读时长：8 分钟 | 📅 2026-05-01

---

## 写在前面

Ubuntu 26.04 LTS 发布已满一周，大量用户第一时间冲了升级——然后被各种报错劝退。

其中最炸裂的：**systemd 259 彻底移除 cgroup v1 支持**，升级直接中断。社区论坛、Ask Ubuntu 上相关问题暴增。

今天是五一假期，正是升级好时机。我整理了 **升级被拒的 5 大原因和 3 种解决方案**，外加 **升级后 12 项必做修复清单**，帮你一次性搞定。

---

## 一、升级被拒：cgroup v1 不再支持

### 🔴 典型报错

```
Refusing to run under cgroup v1
Your system is using cgroup v1, which is no longer supported
upgrade blocker: cgroup v1 detected
```

看到这个，升级直接中断。

### 为什么会中招？

| 原因 | 说明 | 高危人群 |
|:---|:---|:---|
| GRUB 强制 cgroup v1 | 残留 `systemd.unified_cgroup_hierarchy=0` | Docker 旧版用户、Home Assistant 用户 |
| Docker 版本低于 20.10 | Docker 19.03 依赖 cgroup v1 | 未更新 Docker 的用户 |
| LXC/LXD 旧格式配置 | 残留 `lxc.cgroup.*` (v1 格式) | 容器化部署用户 |
| GPU 驱动硬编码 v1 路径 | 旧版 NVIDIA Container Toolkit | AI/深度学习用户 |
| Snap/AppArmor 配置冲突 | 旧 snapd 快照需 v1 shim | 长期未 `snap refresh` 的用户 |

### 快速自查：你中招了吗？

```bash
# 显示 cgroup2fs = v2（安全），tmpfs = v1（会被拦截）
stat -fc %T /sys/fs/cgroup/

# 检查 Docker 的 cgroup 版本
docker info 2>/dev/null | grep -i cgroup
# 期望输出：Cgroup Driver: systemd / Cgroup Version: 2
```

---

## 二、3 种解决方案

### 方案 1：正规迁移 cgroup v2（推荐）

**适用场景**：GRUB 有残留 v1 参数 + Docker 版本过低

**步骤 1**：修改 GRUB

```bash
# 备份
sudo cp /etc/default/grub /etc/default/grub.backup-pre-2604

# 编辑，删除以下两行参数：
# systemd.unified_cgroup_hierarchy=0
# systemd.legacy_systemd_cgroup_controller=1
sudo nano /etc/default/grub

# 更新引导
sudo update-grub
sudo reboot
```

重启后确认：`stat -fc %T /sys/fs/cgroup/` 应显示 `cgroup2fs`

**步骤 2**：更新 Docker

```bash
# 卸载旧版
sudo apt remove docker docker-engine docker.io containerd runc

# 安装最新版
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo "deb [arch=$(dpkg --print-architecture) \
  signed-by=/etc/apt/keyrings/docker.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list

sudo apt update && sudo apt install docker-ce docker-ce-cli container.io
sudo systemctl restart docker

# 验证
docker info | grep -i cgroup
# 应显示 Cgroup Version: 2
```

**步骤 3**：重新执行升级

```bash
sudo apt update && sudo apt full-upgrade
sudo do-release-upgrade -d
```

### 方案 2：仅修改容器端配置

**适用场景**：主机 GRUB 已切 v2，但容器运行时仍要求 v1

```bash
# Docker daemon 明示 cgroup v2
sudo tee /etc/docker/daemon.json <<'EOF'
{
  "exec-opts": ["native.cgroupdriver=systemd"]
}
EOF
sudo systemctl restart docker

# LXC 配置改写
# 旧：lxc.cgroup.memory.limit_in_bytes = 512M
# 新：lxc.cgroup2.memory.max = 512M
```

### 方案 3：两阶段升级（生产环境）

**适用场景**：生产服务器，稳字当头

```bash
# 先升 25.10（同时支持 v1 和 v2）
sudo sed -i 's/Prompt=lts/Prompt=normal/' /etc/update-manager/release-upgrades
sudo do-release-upgrade

# 在 25.10 上用 cgroup v2 运行验证 1~2 周
# 确认 Docker、K8s、systemd-cgtop 指标正常后
# 再升 26.04
sudo do-release-upgrade
```

---

## 三、升级后 12 项必做修复

升级完成不代表万事大吉。以下按优先级排序，逐项检查：

### 🔴 P0：系统体检（立即做）

| 检查项 | 命令 | 关注点 |
|:---|:---|:---|
| 内核版本 | `uname -a` | 应为 7.0.x |
| 失败服务 | `systemctl --failed` | 必须为空 |
| 包管理状态 | `dpkg --audit` | 必须无报错 |
| 磁盘空间 | `df -h` | / 需 >5GB 可用 |
| 启动错误 | `journalctl -p 3 -b` | 无 critical 错误 |

### 🟠 P1：关键功能恢复

**6. APT 源收敛**

```bash
# 禁用还停在旧版本的第三方源
ls /etc/apt/sources.list.d/
sudo apt update
apt list --upgradable
```

第三方源必须确认已提供 26.04 包，否则升级后 apt update 会报错。

**7. GPU 驱动验证**

```bash
# NVIDIA
nvidia-smi

# AMD ROCm
rocminfo
rocm-smi
```

**8. 中文显示修复**

升级后中文可能变成日文字形（CJK fallback 顺序变了）：

```bash
# 验证
fc-match 'sans-serif:charset=590d'

# 修复：新增本地 fontconfig 规则
sudo tee /etc/fonts/local.conf <<'EOF'
<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "urn:fontconfig:fonts.dtd">
<fontconfig>
  <alias>
    <family>sans-serif</family>
    <prefer>
      <family>Noto Sans CJK SC</family>
    </prefer>
  </alias>
</fontconfig>
EOF

fc-cache -f
```

### 🟡 P2：桌面与开发环境

**9. 输入法检查**

GNOME 50 + Wayland 下输入法链路可能被升级覆盖，确认：
- Rime / ibus 配置已恢复
- 输入法快捷键与终端快捷键无冲突

**10. Wayland 兼容性**

XWayland 下可能遇到 Xauthority 过期：

```bash
# 自动选择最新的 Mutter Xwayland auth 文件
find "${XDG_RUNTIME_DIR:-/run/user/$(id -u)}" \
  -maxdepth 1 -type f -name '.mutter-Xwaylandauth.*' \
  -printf '%T@ %p\n' | sort -nr | awk 'NR == 1 {print $2}'
```

**11. ll 命令修复**

rust-coreutils 的 ls 可能导致 ll 输出列间距异常：

```bash
# 确认当前调用的是哪个 ls
type -a ls

# 修复：切回 GNU 版（推荐）
sudo apt install coreutils-from-gnu --allow-remove-essential
```

### 🟢 P3：清理与优化

**12. 残留包清理 + 索引收敛**

```bash
# 清理旧版本残留
sudo apt autoremove --purge

# GNOME LocalSearch 索引范围收窄
# 升级后可能重新索引整个家目录，CPU 狂飙
# 设置 > 搜索 > 搜索位置，排除 node_modules、venv、build 等
```

---

## 四、升级时间线建议

| 时间节点 | 建议操作 |
|:---|:---|
| 发布日 ~ 1 周后 | 开发者/爱好者可升级，参考本文修复 |
| **26.04.1 修正版**（约 7 月） | 普通用户建议等此版本自动升级 |
| 2029 年 4 月前 | 24.04 LTS 用户不受影响，可安心等待 |

---

## 五、常见 FAQ

**Q：可以不升级继续用 24.04 吗？**
完全可以。24.04 LTS 支持到 2029 年 4 月，ESM 至 2034 年 4 月。

**Q：Docker 19 升级后能用吗？**
不能。必须更新到 Docker 24.0+ 后再升级系统。

**Q：Home Assistant 用户怎么办？**
删除 GRUB 中的 `systemd.unified_cgroup_hierarchy=0`，更新 HA 至 2026.1+ 版本。

**Q：双系统 Windows + Ubuntu 受影响吗？**
TPM 全盘加密兼容 BitLocker，双系统友好。但升级前建议备份重要数据。

---

## 总结

Ubuntu 26.04 是一次**从内核到桌面的全维度大升级**，但升级路上的坑不少：

1. **cgroup v1 是最大拦路虎** —— 先自查、再迁移、后升级
2. **升级后 12 项修复要逐项过** —— 先系统健康，再桌面环境，最后清理优化
3. **普通用户建议等 26.04.1** —— 开发者和爱好者可以冲，但做好踩坑准备

五一假期有充裕时间，正好是升级的好时机。祝升级顺利！

---

💡 **UbuntuNews** | 资讯·工具·教程·社区
🐧 关注我们，获取更多Ubuntu/Linux技术干货
💬 加入QQ群/频道，与全国爱好者交流成长
❤️ 觉得有用？点个"在看"分享给更多人！
