# Ubuntu 26.04启用sudo-rs：用Rust重写sudo，这46年的老工具迎来新生

> Ubuntu 26.04将默认采用基于Rust重写的sudo-rs，替代拥有46年历史的经典sudo。为什么Canonical要"重造轮子"？新工具到底安全在哪？对普通用户和系统管理员分别有什么影响？本文带你一文看懂。

**阅读时长**：6分钟  
**适合人群**：Linux用户、系统管理员、安全从业者

---

## 一、46年的传奇：sudo的前世今生

### 1.1 从"上帝模式"到权限管理

1970年代末，贝尔实验室的Bob Coggeshall和Cliff Spencer开发了sudo（SuperUser DO），初衷很简单：**让普通用户临时获得root权限，执行特定命令**。

在此之前，Unix系统只有两种选择：
- 用root账户登录（危险）
- 切换到root用户（`su`命令，需要root密码）

sudo的出现，彻底改变了这一局面。系统管理员可以精细控制"谁能在哪台机器上执行什么命令"，而不需要分发root密码。

### 1.2 sudo的核心功能

**基础用法**：
```bash
# 以root权限执行单个命令
sudo apt update

# 切换到root shell
sudo -i

# 以指定用户身份执行命令
sudo -u postgres psql
```

**权限配置**（`/etc/sudoers`）：
```bash
# 用户组wheel可以无密码执行所有命令
%wheel ALL=(ALL) NOPASSWD: ALL

# 用户webadmin只能重启nginx
webadmin ALL=/usr/sbin/nginx, /bin/systemctl restart nginx
```

**安全特性**：
- 5分钟内重复使用sudo免密码（可配置）
- 详细日志记录所有sudo操作
- 支持环境变量过滤、资源限制

### 1.3 三十年的技术债务

sudo虽然强大，但其C语言代码库已积累了**30多年的技术债务**：

**代码规模庞大**：
- 核心代码超过**10万行C代码**
- 历史遗留的宏定义和条件编译极多
- 支持大量过时功能（如LDAP、NIS）

**安全隐患频发**：
- 2012-2021年，sudo披露了**超过100个CVE漏洞**
- 2021年的**Baron Samedit漏洞**（CVE-2021-3156）允许普通用户获取root权限
- 大量漏洞源于**缓冲区溢出、堆栈溢出**等内存安全问题

**维护困难**：
- 原始sudo维护者已多次更换
- 年轻开发者不愿接手C语言项目
- 新功能开发成本高、风险大

---

## 二、sudo-rs：用Rust重新定义权限管理

### 2.1 项目背景

sudo-rs由**Internet Security Research Group**（ISRG）发起，作为**Prossimo项目**的一部分，目标是**用内存安全语言重写关键互联网基础设施**。

**开发时间线**：
- **2023年8月**：sudo-rs v0.2.0发布，首次安全审计
- **2025年8月**：v0.2.8发布，第二次安全审计
- **2025年10月**：Ubuntu 25.10默认启用sudo-rs
- **2026年4月**：Ubuntu 26.04 LTS将sudo-rs作为默认sudo

**支持平台**：
- ✅ Ubuntu 25.10+ / 26.04 LTS
- ✅ Arch Linux
- ✅ Fedora 42+
- ✅ Debian 13+
- ✅ FreeBSD
- ✅ NixOS

### 2.2 为什么选择Rust？

Rust语言的核心优势完美契合系统工具开发需求：

| 特性 | C语言 | Rust | 安全影响 |
|:---|:---|:---|:---|
| 内存管理 | 手动malloc/free | 所有权系统自动管理 | 杜绝缓冲区溢出、内存泄漏 |
| 空指针 | 可能为NULL | Option<T>强制处理 | 编译期杜绝空指针解引用 |
| 数据竞争 | 无保护 | 借用检查器 | 编译期保证线程安全 |
| 未定义行为 | 运行时崩溃 | 编译期报错 | 大幅减少安全隐患 |

**实际效果**：sudo-rs已通过两次独立安全审计，**未发现任何内存安全漏洞**。

### 2.3 sudo-rs的核心特性

#### 内存安全：从根本上解决问题

**C语言的困境**：
```c
// 经典缓冲区溢出示例
char buffer[64];
strcpy(buffer, user_input);  // 如果user_input超过64字节？
```

**Rust的解决方案**：
```rust
// 编译期就能发现潜在问题
let mut buffer = [0u8; 64];
buffer.copy_from_slice(user_input);  // 编译器检查长度
```

#### 更安全的默认配置

sudo-rs默认启用了传统sudo需要手动配置的安全选项：

```bash
# sudo-rs默认启用的安全特性
use_pty      # 在伪终端执行命令，防止键盘记录
pwfeedback   # 输入密码时显示星号（46年首次！）
env_reset    # 重置环境变量，防止环境注入
```

**对比经典sudo**：
- 经典sudo默认**静默输入密码**（无任何反馈）
- sudo-rs默认显示星号`****`，提升用户体验

#### 简化的代码库

**代码规模对比**：
- 经典sudo：**10万+行C代码**
- sudo-rs：**约3万行Rust代码**

**优势**：
- 更易维护和审计
- 减少攻击面
- 新功能开发更快

#### 现代化开发实践

- **持续集成**：每个PR都经过自动化测试
- **安全审计**：定期邀请第三方审计
- **社区驱动**：活跃的开源社区，年轻开发者参与度高

---

## 三、功能对比：sudo vs sudo-rs

### 3.1 普通用户视角

**命令用法完全一致**：
```bash
# Ubuntu 26.04中，sudo命令自动指向sudo-rs
sudo apt install nginx  # 依然可用
sudo -i                 # 切换root shell
```

**用户体验改进**：
```bash
# 输入密码时的新变化
[sudo] password for user: ******
# 经典sudo：输入时无任何反馈
# sudo-rs：显示星号，知道输入了多少字符
```

**错误提示更友好**：
```bash
# sudo-rs的错误信息更清晰
Sorry, user 'webadmin' is not allowed to execute '/bin/bash' as root on server01.
```

### 3.2 系统管理员视角

#### 支持的功能

✅ **完全兼容**：
- 所有常用命令行选项（`-u`, `-i`, `-E`等）
- sudoers文件基本语法
- PAM认证
- 日志记录（syslog）

❌ **移除的功能**：

| 功能 | 原因 | 替代方案 |
|:---|:---|:---|
| `sendmail`通知 | 邮件通知过时 | 使用日志聚合工具 |
| LDAP配置 | 复杂且易出错 | 使用配置管理工具 |
| 命令行通配符 | 常见配置错误源头 | 使用完整命令路径 |
| `cvtsudoers`工具 | 用途有限 | 手动编辑配置 |

#### 配置差异

**sudo-rs的严格要求**：
```bash
# 必须使用UTF-8编码
# /etc/sudoers文件必须是UTF-8编码

# 强制使用PAM认证
# 不能禁用PAM

# 资源限制通过PAM配置，而非sudoers
# /etc/security/limits.conf
```

**示例：配置sudo-rs**
```bash
# /etc/sudoers.d/webadmin
webadmin ALL=(ALL) /usr/sbin/nginx, /bin/systemctl restart nginx

# 测试配置语法
sudo -l   # 列出当前用户的sudo权限
```

### 3.3 安全性对比

| 维度 | 经典sudo | sudo-rs | 改进 |
|:---|:---|:---|:---|
| 内存安全漏洞 | 100+ CVE历史记录 | 0（经两次审计） | **根本性解决** |
| 代码复杂度 | 10万+行 | 3万行 | 减少70%攻击面 |
| 默认安全配置 | 需手动启用 | 默认启用 | 降低配置错误风险 |
| 安全审计频率 | 不定期 | 定期第三方审计 | 持续安全保障 |

---

## 四、为什么重写：技术决策背后的逻辑

### 4.1 不是"为了Rust而Rust"

sudo-rs项目首席工程师Marc Schoolderman在Ubuntu Summit 25.10上明确表示：

> "这不是为了使用新语言而重写。我们的目标是**解决实际问题**：减少内存安全漏洞、简化维护、提升安全性。Rust只是达成目标的工具。"

### 4.2 重写 vs 重构：两难选择

**方案1：重构现有C代码**
- ❌ 投入大：需要10人年工作量
- ❌ 风险高：修改历史代码可能引入新漏洞
- ❌ 效果有限：无法根本解决内存安全问题

**方案2：用Rust重写**
- ✅ 投入适中：3年完成核心功能
- ✅ 风险可控：Rust编译器提供安全保障
- ✅ 效果显著：从根本上杜绝内存安全漏洞

### 4.3 渐进式迁移策略

Canonical采取的是**谨慎的渐进式迁移**：

**阶段1：并行运行**（Ubuntu 24.04-25.04）
- sudo-rs在universe仓库可选安装
- 经典sudo仍是默认

**阶段2：切换默认**（Ubuntu 25.10）
- sudo命令指向sudo-rs
- 经典sudo改名为`sudo-ws`（仍可切换）

**阶段3：完全迁移**（Ubuntu 26.04 LTS）
- sudo-rs成为唯一默认
- 提供过渡期到26.10

**用户控制权**：
```bash
# Ubuntu 26.04之前可切换回经典sudo
sudo update-alternatives --config sudo

# 但不建议无特殊理由切换
```

### 4.4 社区反馈与支持

**原始sudo维护者的态度**：

sudo的原始维护者Todd Miller参与了sudo-rs的代码审查，并**将sudo-rs中发现的问题反向移植到经典sudo**。这说明：

- 重写不是"抛弃历史"，而是**共同进步**
- 新旧版本可以**互补共存**
- 最终受益的是整个Linux生态

---

## 五、Ubuntu 26.04中的sudo-rs：实战指南

### 5.1 检查当前使用的sudo版本

```bash
# 查看sudo版本和实现
sudo --version

# Ubuntu 26.04输出示例
Sudo-rs version 0.2.13
Configure options: --prefix=/usr --sysconfdir=/etc

# 检查是否使用sudo-rs
ls -l $(which sudo)
# lrwxrwxrwx 1 root root 7 Mar 20 10:00 /usr/bin/sudo -> sudo-rs
```

### 5.2 常用配置示例

**场景1：允许用户无密码执行特定命令**
```bash
# /etc/sudoers.d/deploy
deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx
deploy ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart mysql
```

**场景2：限制用户只能在特定时间使用sudo**
```bash
# /etc/sudoers.d/time-limited
admin ALL=/usr/bin/apt, /usr/bin/dpkg
# 注意：sudo-rs不支持时间限制，需配合PAM配置
```

**场景3：记录sudo操作到专用日志**
```bash
# sudo-rs默认使用syslog
# 查看sudo日志
journalctl -t sudo

# 或通过rsyslog配置
# /etc/rsyslog.d/sudo.conf
if $programname == 'sudo' then /var/log/sudo.log
```

### 5.3 故障排查

**问题1：sudoers配置不生效**
```bash
# 检查语法（sudo-rs会自动检查）
sudo -l

# 查看详细错误信息
sudo -l -U username
```

**问题2：PAM认证失败**
```bash
# 检查PAM配置
ls -l /etc/pam.d/sudo*

# sudo-rs使用sudo和sudo-i两个PAM服务
# /etc/pam.d/sudo
auth required pam_unix.so
account required pam_unix.so
```

**问题3：切换回经典sudo**
```bash
# 安装经典sudo
sudo apt install sudo-ws

# 切换
sudo update-alternatives --config sudo

# 选择 /usr/bin/sudo-ws
```

---

## 六、sudo的未来：不仅仅是重写

### 6.1 sudo-rs的下一步计划

**短期目标**（2026-2027）：
- 完善AppArmor和SELinux集成
- 改进错误提示信息
- 优化性能（目标与经典sudo持平）

**长期愿景**：
- 探索超越传统sudo的配置方式
- 更灵活的权限管理模型
- 与容器技术的深度集成

### 6.2 Linux生态的Rust化浪潮

sudo-rs只是Linux系统工具Rust化的一个缩影：

**已完成的Rust重写项目**：
- ✅ **ripgrep** (grep替代)
- ✅ **exa** (ls替代)
- ✅ **bat** (cat替代)
- ✅ **fd** (find替代)

**进行中的项目**：
- 🔄 **uutils-coreutils** (GNU Coreutils的Rust实现)
- 🔄 **rustls** (OpenSSL替代)
- 🔄 **zbus** (D-Bus的现代实现)

### 6.3 对普通用户的启示

**不必恐慌**：
- 命令用法完全一样
- 静默升级，无感知
- 性能和兼容性有保障

**积极拥抱**：
- 更安全的系统基础
- 更现代的开发实践
- 更活跃的社区支持

**学习Rust的理由更充分了**：
- 系统工具开发的首选语言
- 内存安全的语言级保障
- 高薪资、高需求的就业市场

---

## 七、总结：为什么这是好事？

### 7.1 技术层面

| 维度 | 改进 |
|:---|:---|
| 安全性 | 根本解决内存安全漏洞 |
| 可维护性 | 代码量减少70%，更易审计 |
| 用户体验 | 密码反馈、友好错误提示 |
| 未来扩展 | 现代架构支持新功能开发 |

### 7.2 生态层面

- **推动Linux现代化**：证明大型系统工具可以用Rust重写
- **吸引新贡献者**：年轻开发者更愿意参与Rust项目
- **提升整体安全**：减少关键组件的安全漏洞

### 7.3 给用户的建议

**普通用户**：
- ✅ 无需任何操作，照常使用`sudo`
- ✅ 享受更安全的系统
- ✅ 密码输入时有星号反馈了！

**系统管理员**：
- 📋 检查现有sudoers配置兼容性
- 📋 学习sudo-rs的新特性和限制
- 📋 测试关键脚本在sudo-rs下的行为

**开发者**：
- 🦀 学习Rust的最佳时机
- 🦀 参与开源项目的绝佳机会
- 🦀 为未来系统开发做准备

---

## 八、延伸阅读

**官方文档**：
- [sudo-rs GitHub仓库](https://github.com/trifectatechfoundation/sudo-rs)
- [Ubuntu 26.04 Release Notes](https://wiki.ubuntu.com/NobleNarwhal/ReleaseNotes)

**相关文章**：
- [Ubuntu 26.04 新特性详解：从安装到上手](#)
- [Linux权限管理最佳实践](#)
- [为什么Rust正在接管系统编程](#)

**社区讨论**：
- [Reddit: r/linux](https://reddit.com/r/linux)
- [Ubuntu Forums](https://ubuntuforums.org)

---

**互动话题**：  
你对Ubuntu用Rust重写sudo怎么看？是进步还是折腾？欢迎在评论区分享你的观点！

**关注UbuntuNews**，获取最新Linux资讯和实用教程！

---

**封面图说明**：Ubuntu 26.04默认采用sudo-rs，用Rust语言重写经典sudo工具，提升系统安全性。
