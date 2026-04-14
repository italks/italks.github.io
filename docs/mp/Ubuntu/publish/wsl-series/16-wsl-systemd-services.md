# 让 WSL 开机自启：systemd 服务管理完全指南

> **阅读时长**：约 11 分钟 | **难度等级**：⭐⭐⭐☆☆ 进阶实战
> **本篇关键词**：systemd / WSL / 自启动 / 服务管理 / Cron / 开发环境
>
> 新版 WSL 已完整支持 systemd——这意味着你可以像在真正的 Linux 服务器上一样管理服务、设置开机自启、运行定时任务。

---

## 什么是 systemd？

### 一句话解释

**systemd = Linux 的"任务管理器 + 启动管理器 + 定时器"**

它负责：
- 🔄 启动和管理系统服务（MySQL、Redis、Nginx 等）
- ⏰ 按需自动启动依赖服务
- 📋 管理开机自启项
- ⏱️ 运行定时任务（timer）
- 📝 收集和管理日志

---

## 第一步：启用 systemd

### 检查当前状态

```bash
# 检查 systemd 是否可用
systemctl is-system-running

# 如果提示 "System has not been booted with systemd."
# → 说明尚未启用，需要配置
```

### 配置启用

```bash
# 编辑 /etc/wsl.conf
sudo nano /etc/wsl.conf
```

写入以下内容：

```ini
[boot]
systemd=true
```

保存后：

```powershell
# PowerShell 中重启 WSL 使生效
wsl --shutdown
```

然后重新打开 Ubuntu，验证：

```bash
systemctl is-system-running
# 应输出: running ✅

# 测试启动一个服务
systemctl status cron
# 应显示: active (running)
```

> 💡 需要 **WSL 版本 ≥ 0.67.2** 才支持 systemd。用 `wsl --version` 检查。

---

## 第二步：常用系统服务管理

### 服务操作命令速查

```bash
# ===== 基础操作 =====
sudo systemctl start <服务名>        # 启动
sudo systemctl stop <服务名>         # 停止
sudo systemctl restart <服务名>      # 重启
sudo systemctl status <服务名>        # 查看状态
sudo systemctl enable <服务名>        # 设为开机自启
sudo systemctl disable <服务名>       # 取消开机自启

# ===== 查询命令 =====
systemctl list-units --type=service   # 列出所有正在运行的服务
systemctl list-unit-files --type=service  # 列出所有服务（含自启状态）
systemctl is-active nginx             # 查看特定服务是否在运行
systemctl is-enabled mysql             # 查看是否设置了自启

# ===== 日志查看 =====
journalctl -u <服务名>                # 查看某服务的日志
journalctl -u <服务名> -f             # 实时跟踪日志（类似 tail -f）
journalctl -u <服务名> --since "1 hour ago"  # 最近1小时的日志
```

### 实际案例：数据库服务管理

```bash
# MariaDB/MySQL
sudo systemctl start mariadb          # 启动数据库
sudo systemctl enable mariadb          # 开机自启
sudo systemctl status mariadb          # 检查状态
journalctl -u mariadb -f              # 监听日志

# Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server
sudo systemctl status redis-server

# PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
sudo systemctl status postgresql

# Nginx
sudo systemctl start nginx
sudo systemctl enable nginx
sudo systemctl status nginx

# Docker
sudo systemctl start docker           # 如果用 systemd 管理 Docker
sudo systemctl enable docker
```

---

## 第三步：创建自定义 Systemd Service

### 场景一：Python Web 应用自启动

```bash
# 创建 service 文件
sudo tee /etc/systemd/system/my-app.service << 'EOF'
[Unit]
Description=My Python Web Application
After=network.target

[Service]
Type=simple
User=zhangsan                    # 你的用户名
WorkingDirectory=/home/zhangsan/my-web-app
ExecStart=/home/zhangsan/my-web-app/.venv/bin/python \
    /home/zhangsan/my-web-app/app.py
Restart=always                   # 崩溃后自动重启
RestartSec=5                     # 重启间隔 5 秒
Environment="PORT=8000"
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
```

```bash
# 加载并启动
sudo systemctl daemon-reload       # 重新加载配置
sudo systemctl start my-app        # 启动服务
sudo systemctl status my-app       # 检查状态
sudo systemctl enable my-app       # 设为开机自启

# 查看日志
journalctl -u my-app -f
```

### 场景二：Node.js 后台服务

```bash
sudo tee /etc/systemd/system/node-api.service << 'EOF'
[Unit]
Description=Node.js API Server
After=network.target

[Service]
Type=simple
User=zhangsan
WorkingDirectory=/home/zhangsan/api-server
ExecStart=/home/zhangsan/.fnm/node-20/bin/node server.js
Restart=on-failure               # 仅在失败时重启
RestartSec=10
Environment=NODE_ENV=production
Environment=DATABASE_URL=postgresql://dev:dev@localhost/appdb

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now node-api    # enable + start 一条命令！
```

### 场景三：Docker Compose 应用

```bash
sudo tee /etc/systemd/system/docker-compose-app.service << 'EOF'
[Unit]
Description=Docker Compose App Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/zhangsan/docker-demo
ExecStart=/usr/local/bin/docker compose up -d
ExecStop=/usr/local/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable docker-compose-app
```

---

## 第四步：Cron 定时任务

### 基本 Cron 语法

```
┌───────────── 分钟 (0-59)
│ ┌───────────── 小时 (0-23)
│ │ ┌───────────── 日 (1-31)
│ │ │ ┌───────────── 月 (1-12)
│ │ │ │ ┌───────────── 星期 (0-6, 0=周日)
│ │ │ │ │
* * * * *  要执行的命令
```

### 常用定时任务示例

```bash
# 打开 crontab 编辑器
crontab -e
```

写入以下内容：

```cron
# ========== 系统维护类 ==========

# 每天凌晨 2 点备份数据库
0 2 * * * mysqldump -u devuser -p'password' myapp > /mnt/d/backups/db_$(date +\%Y\%m\%d).sql

# 每周日凌晨 3 点清理临时文件
0 3 * * 0 find /tmp -type f -atime +7 -delete

# 每月 1 号清理 apt 缓存
0 4 1 * * sudo apt clean && sudo apt autoremove -y

# ========== 项目自动化 ==========

# 每 30 分钟同步 Git 仓库
*/30 * * * * cd ~/project && git pull origin main > /dev/null 2>&1

# 每小时检查磁盘空间并报警（< 10% 时通知）
0 * * * * df / | awk 'NR==2{if($5+0<10) print "WARNING: Disk low! "$5" free"}'

# ========== 开发辅助 ==========

# 工作日早上 9 点提醒（需要 notify-send 或类似工具）
0 9 * * 1-5 echo "☀️ 开始工作！" | wall

# 每 6 小时记录一次内存使用情况
0 */6 * * * free -h >> ~/logs/memory-history.log
```

### 查看与管理 Cron 任务

```bash
# 查看当前用户的定时任务
crontab -l

# 导出备份
crontab -l > my-cron-backup.txt

# 从文件恢复
crontab my-cron-backup.txt

# 清空所有任务
crontab -r     # ⚠️ 确认要清空！

# 查看 Cron 执行日志
grep CRON /var/log/syslog
# 或者
journalctl -u cron
```

---

## 第五步：Systemd Timer（Cron 的现代替代）

Timer 是 systemd 的定时任务机制，比 Cron 更强大：

```bash
# 创建 timer 示例：每小时备份数据库
sudo tee /etc/systemd/system/backup-db.timer << 'EOF'
[Unit]
Description=Hourly Database Backup Timer

[Timer]
OnCalendar=*:00:00            # 每小时的第 0 分钟
Persistent=true                # 错过的执行会在开机后补执行

[Install]
WantedBy=timers.target
EOF

sudo tee /etc/systemd/system/backup-db.service << 'EOF'
[Unit]
Description=Hourly Database Backup

[Service]
Type=oneshot
ExecStart=/bin/bash -c 'mysqldump -u devuser -p"pass" myapp > /mnt/d/backups/hourly_$(date +\%%Y%%m%%d_%%H%%M).sql'
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now backup-db.timer
sudo systemctl list-timers    # 查看所有活跃的 timer
```

| 对比 | Cron | Systemd Timer |
|:---|:---|:---|
| 易用性 | ⭐⭐⭐⭐⭐ 极简 | ⭐⭐⭐ 需写两个文件 |
| 日志集成 | 分散 | ✅ 统一 journalctl |
| 错过补偿 | ❌ 不补执行 | ✅ Persistent 补执行 |
| 资源限制 | ❌ 无 | ✅ 可设 CPU/内存限制 |
| 依赖管理 | ❌ 无 | ✅ 可指定依赖服务 |

---

## 服务监控与排障

### 快速诊断脚本

```bash
cat > ~/service-check.sh << 'SCRIPT'
#!/bin/bash
echo "=== WSL 服务健康检查 ==="
echo ""

services=("mariadb" "redis-server" "postgresql" "nginx" "docker")

for svc in "${services[@]}"; do
    if systemctl is-enabled $svc &>/dev/null; then
        state=$(is-active $svc)
        if [ "$state" = "active" ]; then
            echo "✅ $svc — 运行中"
        else
            echo "❌ $svc — 未运行 ($state)"
        fi
    else
        echo "⚪ $svc — 未安装或未注册"
    fi
done

echo ""
echo "=== 最近的服务错误日志 ==="
journalctl --since "1 hour ago" -p err --no-pager | tail -20
SCRIPT
chmod +x ~/service-check.sh
./service-check.sh
```

---

## 下期预告

下一篇：**《WSL 终端美化大作战：Oh My Posh + 字体 + 主题》**

- 🎨 Oh My Posh 安装与主题选择
- 🔤 Nerd Font 字体安装
- 🎭 Windows Terminal 配色方案
- ⌨️ 快捷键与分屏技巧
- 💡 打造令人羡慕的开发者终端

---

> **💡 你在 WSL 中用了 systemd 管理哪些服务？评论区分享！**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
