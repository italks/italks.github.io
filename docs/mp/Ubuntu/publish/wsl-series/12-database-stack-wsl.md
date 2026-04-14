# 数据库全家桶：MySQL + Redis + PostgreSQL 一键部署

> **阅读时长**：约 12 分钟 | **难度等级**：⭐⭐⭐☆☆ 进阶实战
> **本篇关键词**：MySQL / Redis / PostgreSQL / 数据库 / WSL / 开发环境
>
> 在 WSL 中一键部署三大主流数据库，配置远程连接，配合 GUI 客户端工具——本地开发数据库环境从此不再折腾。

---

## 为什么在 WSL 中跑数据库？

```
传统方案的问题：
❌ Windows 安装 MySQL → 路径/权限/服务各种坑
❌ Docker for Windows（旧版）→ 性能差、启动慢
❌ 云开发数据库 → 网络延迟、费用、数据安全

WSL 方案的优势：
✅ 原生 Linux 性能，和线上服务器一致
✅ localhost 直连，零延迟
✅ systemd 管理，开机自启
✅ 数据持久化，重启不丢
✅ 多版本共存，随时切换
```

---

## 一、MySQL / MariaDB

### 安装 MariaDB（MySQL 的完全开源替代）

```bash
# 安装
sudo apt update
sudo apt install -y mariadb-server

# 启动服务
sudo systemctl start mariadb
sudo systemctl enable mariadb     # 开机自启

# 安全初始化
sudo mysql_secure_installation
# 依次提示：
# 1. Set root password? Y → 输入密码
# 2. Remove anonymous users? Y
# 3. Disallow root login remotely? N（开发需要远程连接）
# 4. Remove test database? Y
# 5. Reload privilege tables? Y

# 验证运行状态
sudo systemctl status mariadb
# 应显示: active (running) ✅
```

### 创建用户与数据库

```bash
# 登录 MariaDB
sudo mysql -u root -p

-- 在 SQL 提示符下执行：
-- 创建数据库
CREATE DATABASE myapp 
    DEFAULT CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

-- 创建用户并授权（% 表示允许任意主机连接）
CREATE USER 'devuser'@'%' IDENTIFIED BY 'dev_password_123';
GRANT ALL PRIVILEGES ON myapp.* TO 'devuser'@'%';
FLUSH PRIVILEGES;

-- 验证连接
SHOW DATABASES;
SELECT User, Host FROM mysql.user;

-- 退出
EXIT;
```

### 允许远程连接

```bash
# 编辑配置文件
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf
```

修改以下行：

```ini
# 找到 bind-address 这行，改为：
bind-address = 0.0.0.0

# 确保 port = 3306（默认应该就是）
port = 3306
```

```bash
# 重启生效
sudo systemctl restart mariadb

# 测试本地连接
mysql -u devuser -p -h 127.0.0.1 myapp
# 输入密码后能进入 ✅
```

### 常用操作速查

```sql
-- 查看所有数据库
SHOW DATABASES;

-- 查看当前库的所有表
SHOW TABLES;

-- 查看表结构
DESCRIBE tablename;
-- 或
SHOW COLUMNS FROM tablename;

-- 导入 SQL 文件
source /path/to/dump.sql;
-- 或命令行：mysql -u user -p dbname < dump.sql

-- 导出数据库
mysqldump -u devuser -p myapp > backup_$(date +%Y%m%d).sql
```

---

## 二、Redis — 内存数据库之王

### 安装与启动

```bash
# 安装
sudo apt install -y redis-server

# 启动
sudo systemctl start redis-server
sudo systemctl enable redis-server   # 开机自启

# 验证（应返回 PONG）
redis-cli ping
# PONG
```

### 常用操作

```bash
# 连接 Redis
redis-cli

# ====== 基础操作 ======
SET mykey "Hello WSL"
GET mykey
# "Hello WSL"

DEL mykey

# ====== 数据类型示例 ======
# Hash（适合对象存储）
HSET user:1001 name "张三" age 28 city "北京"
HGETALL user:1001
# 1) "name"  2) "张三"  3) "age"  4) "28"

# List（适合队列）
LPUSH tasks "deploy code"
LPUSH tasks "write tests"
LPUSH tasks "fix bug"
LRANGE tasks 0 -1
# 1) "fix bug"  2) "write tests"  3) "deploy code"

# Set（适合去重/标签）
SADD tags python linux wsl
SMEMBERS tags

# Sorted Set（适合排行榜）
ZADD leaderboard 2500 "Alice"
ZADD leaderboard 3000 "Bob"
ZADD排行榜 2800 "Charlie"
ZREVRANGE leaderboard 0 -1 WITHSCORES

# ====== 实用命令 ======
KEYS *                    # 查看所有 key（慎用生产！）
DBSIZE                    # key 数量
INFO server               # 服务器信息
FLUSHALL                  # 清空所有数据 ⚠️
EXIT                      # 退出
```

### Redis 配置优化

```bash
# 备份原配置
sudo cp /etc/redis/redis.conf /etc/redis/redis.conf.bak

# 编辑配置（开发环境推荐设置）
sudo nano /etc/redis/redis.conf
```

关键配置项：

```ini
# 绑定地址（允许远程访问）
bind 0.0.0.0

# 设置密码（生产必须！开发可选）
requirepass your_dev_password

# 持久化：RDB 快照
save 900 1        # 900秒内至少1次写操作就保存
save 300 10       # 300秒内至少10次写操作
save 60 10000     # 60秒内至少10000次写操作
dbfilename dump.rdb
dir /var/lib/redis

# 最大内存限制（根据你的系统调整）
maxmemory 512mb
maxmemory-policy allkeys-lru
```

```bash
# 重启使配置生效
sudo systemctl restart redis-server

# 验证新配置
redis-cli CONFIG GET maxmemory
redis-cli INFO server | grep redis_version
```

---

## 三、PostgreSQL — 功能最强大的开源数据库

### 安装

```bash
# Ubuntu 24.04 可以直接 apt 安装
sudo apt install -y postgresql postgresql-contrib

# 启动
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 验证
sudo systemctl status postgresql
# active (running) ✅

# 查看版本
psql --version
# psql (PostgreSQL) 16.x
```

### 创建用户与数据库

PostgreSQL 使用 `postgres` 系统用户进行管理：

```bash
# 切换到 postgres 用户
sudo -u postgres psql

-- 创建用户（带密码）
CREATE USER devuser WITH PASSWORD 'dev_pass_123';

-- 创建数据库
CREATE DATABASE myapp OWNER devuser;

-- 授权
GRANT ALL PRIVILEGES ON DATABASE myapp TO devuser;

-- 退出 psql
\q
```

### 连接测试

```bash
# 用新建用户连接
psql -h localhost -U devuser -d myapp
# 输入密码后进入

-- 测试建表
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (name, email) VALUES ('Test', 'test@example.com');
SELECT * FROM users;

\q
```

### 远程连接配置

```bash
# 编辑 pg_hba.conf（客户端认证）
sudo nano /etc/postgresql/16/main/pg_hba.conf
```

添加以下行（在 IPv4 local connections 下面）：

```
# 允许密码认证的远程连接
host    all             all             0.0.0.0/0               scram-sha-256
```

```bash
# 编辑 postgresql.conf（监听地址）
sudo nano /etc/postgresql/16/main/postgresql.conf
```

修改：

```ini
# listen_addresses = 'localhost'
listen_addresses = '*'
```

```bash
# 重启 PostgreSQL
sudo systemctl restart postgresql

# 确认端口在监听
ss -tlnp | grep 5432
# LISTEN  0  128  0.0.0.0:5432
```

---

## 四、GUI 客户端工具推荐

| 工具 | 平台 | 特点 | 价格 |
|:---|:---|:---|:---|
| **DBeaver** 🌟 | Win/Linux/Mac | 免费、全功能、支持所有主流数据库 | **免费** |
| **TablePlus** | Win/Mac/Linux | 界面美观、轻量快速 | 部分收费 |
| **DataGrip** | JetBrains 家族 | 功能强大、SQL 智能 | 付费（有免费版）|
| **Beekeeper Studio** | 跨平台 | 开源免费、简洁现代 | **免费** |
| **phpMyAdmin** | Web 端 | MySQL 专用、浏览器访问 | **免费** |

### DBeaver 配置方法（推荐）

```
1. Windows 上安装 DBeaver（直接 exe 安装）
2. 打开 DBeaver → 新建数据库连接
3. 选择数据库类型（MySQL / PostgreSQL / Redis 等）

MySQL 连接设置：
├── Host: localhost
├── Port: 3306
├── Database: myapp
├── Username: devuser
└── Password: dev_password_123

PostgreSQL 连接设置：
├── Host: localhost
├── Port: 5432
├── Database: myapp
├── Username: devuser
└── Password: dev_pass_123

Redis 连接（需安装 Redis 插件）：
├── Host: localhost
├── Port: 6379
└── Password: （如果设置了的话）

4. 点击 "测试连接" → 成功后保存
```

> 💡 GUI 客户端运行在 Windows 上，通过 localhost 连接 WSL 中的数据库。因为使用了 mirrored 网络模式或自动端口转发，体验就像连本地数据库一样。

---

## 五、一键启动脚本

创建一个方便的管理脚本：

```bash
cat > ~/db-manager.sh << 'SCRIPT'
#!/bin/bash
# 数据库管理脚本

case "$1" in
    start)
        echo "🚀 启动所有数据库..."
        sudo systemctl start mariadb
        sudo systemctl start redis-server
        sudo systemctl start postgresql
        echo "✅ 全部已启动"
        ;;
    stop)
        echo "⏹️  停止所有数据库..."
        sudo systemctl stop mariadb
        sudo systemctl stop redis-server
        sudo systemctl stop postgresql
        echo "✅ 全部已停止"
        ;;
    status)
        echo "=== MariaDB ==="
        systemctl is-active mariadb
        echo "=== Redis ==="
        systemctl is-active redis-server
        echo "=== PostgreSQL ==="
        systemctl is-active postgresql
        ;;
    ports)
        echo "=== 数据库端口占用 ==="
        ss -tlnp | grep -E ':(3306|5432|6379)\s'
        ;;
    *)
        echo "用法: $0 {start|stop|status|ports}"
        ;;
esac
SCRIPT

chmod +x ~/db-manager.sh

# 使用方式
~/db-manager.sh start      # 启动全部
~/db-manager.sh status     # 检查状态
~/db-manager.sh ports      # 查看端口
~/db-manager.sh stop       # 停止全部
```

---

## 六、数据备份策略

```bash
#!/bin/bash
# save as ~/backup-db.sh
BACKUP_DIR="/mnt/d/db-backups/$(date +%Y%m%d)"
mkdir -p "$BACKUP_DIR"

echo "📦 开始备份数据库到 $BACKUP_DIR"

# 备份 MySQL/MariaDB
mysqldump -u devuser -p'dev_password_123' myapp \
    > "$BACKUP_DIR/mysqldb_$(date +%H%M%S).sql"

# 备份 PostgreSQL
pg_dump -U devuser -h localhost myapp \
    > "$BACKUP_DIR/pgdb_$(date +%H%M%S).sql"

# 备份 Redis
redis-cli BGSAVE
cp /var/lib/redis/dump.rdb "$BACKUP_DIR/redis_$(date +%H%M%S).rdb"

echo "✅ 备份完成！文件位置: $BACKUP_DIR"
ls -lh "$BACKUP_DIR"
```

---

## 下期预告

下一篇开始 **进阶优化篇**：**《WSL 2 性能真相：为什么有时候比 Windows 还慢？》**

- 📊 文件 I/O 实测数据对比
- 🔍 三大性能瓶颈深度分析
- ⏱️ 不同场景的性能基准测试
- 🛠️ 瓶颈定位与解决方法
- 💡 性能优化的最佳实践

---

> **💡 你主要用什么数据库？评论区聊聊！**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
>
> 💬 数据库踩过哪些坑？一起来排雷！
