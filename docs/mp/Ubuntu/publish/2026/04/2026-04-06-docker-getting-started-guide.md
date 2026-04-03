# Docker入门教程：从安装到第一个容器，30分钟上手

> 阅读时长：6分钟
> 
> Docker是容器技术的王者，但新手总觉得它高深莫测。本文用最简单的语言，带你从零开始掌握Docker，30分钟内运行你的第一个容器！

---

## 一、为什么你需要学Docker？

如果你遇到过这些问题：

- "在我电脑上能跑，到你那就不行了"
- 装个MySQL要折腾半天依赖
- 项目环境迁移，配置文件一大堆
- 想试试新软件，又怕污染系统

Docker就是你的救星。它把应用和依赖打包成一个**容器**，像集装箱一样，在哪都能跑，完全隔离，互不干扰。

**Docker vs 虚拟机**：

| 特性 | Docker容器 | 虚拟机 |
|:---:|:---|:---|
| 启动速度 | 秒级 | 分钟级 |
| 资源占用 | MB级 | GB级 |
| 隔离性 | 进程级 | 系统级 |
| 性能损耗 | 几乎无 | 10-20% |
| 适用场景 | 微服务、CI/CD | 独立操作系统 |

简单说：**容器是轻量级的虚拟化，更快更省资源**。

---

## 二、Ubuntu安装Docker，3步搞定

### 步骤1：卸载旧版本（如有）

```bash
sudo apt remove docker docker-engine docker.io containerd runc
```

### 步骤2：安装依赖包

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg lsb-release
```

### 步骤3：添加Docker官方源并安装

```bash
# 添加Docker GPG密钥
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 添加Docker APT源
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 安装Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 步骤4：启动Docker并设置开机自启

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

### 步骤5：验证安装

```bash
sudo docker run hello-world
```

看到"Hello from Docker!"就说明安装成功！

### 步骤6：让普通用户也能用Docker（可选）

每次都要sudo太麻烦？把当前用户加入docker组：

```bash
sudo usermod -aG docker $USER
newgrp docker
```

**注意**：需要注销重新登录生效。

---

## 三、核心概念：镜像、容器、仓库

学Docker前，先搞懂3个概念：

### 1. 镜像（Image）

**镜像 = 只读模板**

就像安装盘，包含运行应用所需的一切：代码、运行时、库、配置文件。

```bash
# 查看本地镜像
docker images

# 从Docker Hub拉取镜像
docker pull ubuntu:22.04
docker pull nginx:latest
docker pull mysql:8.0
```

### 2. 容器（Container）

**容器 = 镜像的运行实例**

就像用安装盘装好的系统，可以启动、停止、删除。一个镜像可以创建多个容器。

```bash
# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a
```

### 3. 仓库（Registry）

**仓库 = 镜像的存放地**

最大的公共仓库是[Docker Hub](https://hub.docker.com/)，类似GitHub，里面有各种官方和社区镜像。

```bash
# 搜索镜像
docker search nginx

# 拉取镜像
docker pull nginx
```

**三者关系**：从仓库拉取镜像 → 用镜像创建容器 → 容器运行应用

---

## 四、实战：运行你的第一个容器

### 案例1：启动一个Nginx Web服务器

```bash
# 后台运行Nginx，映射端口
docker run -d -p 8080:80 --name my-nginx nginx

# 访问测试
curl http://localhost:8080
```

打开浏览器访问 `http://localhost:8080`，看到Nginx欢迎页面就成功了！

**参数解释**：
- `-d`：后台运行（detached模式）
- `-p 8080:80`：端口映射，宿主机8080→容器80
- `--name my-nginx`：给容器起个名字
- `nginx`：使用的镜像名

### 案例2：运行一个Ubuntu容器并进入交互模式

```bash
# 进入Ubuntu容器的bash
docker run -it ubuntu:22.04 /bin/bash

# 在容器里执行命令
root@容器ID:/# apt update
root@容器ID:/# apt install -y vim
root@容器ID:/# exit  # 退出容器
```

**参数解释**：
- `-i`：交互模式（保持STDIN打开）
- `-t`：分配伪终端
- `/bin/bash`：启动bash shell

### 案例3：运行MySQL数据库

```bash
docker run -d \
  --name my-mysql \
  -e MYSQL_ROOT_PASSWORD=123456 \
  -e MYSQL_DATABASE=mydb \
  -p 3306:3306 \
  mysql:8.0
```

**参数解释**：
- `-e MYSQL_ROOT_PASSWORD=123456`：设置环境变量（root密码）
- `-e MYSQL_DATABASE=mydb`：创建数据库

连接MySQL：

```bash
# 进入MySQL容器
docker exec -it my-mysql mysql -uroot -p123456

# 或者用本地mysql客户端连接
mysql -h127.0.0.1 -P3306 -uroot -p123456
```

---

## 五、容器管理常用命令

### 1. 查看容器状态

```bash
# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 查看容器详细信息
docker inspect my-nginx

# 查看容器资源占用
docker stats my-nginx
```

### 2. 启动/停止/重启容器

```bash
# 停止容器
docker stop my-nginx

# 启动已停止的容器
docker start my-nginx

# 重启容器
docker restart my-nginx

# 强制停止容器
docker kill my-nginx
```

### 3. 进入容器内部

```bash
# 方式1：docker exec（推荐）
docker exec -it my-nginx /bin/bash

# 方式2：docker attach（不推荐，退出会导致容器停止）
docker attach my-nginx
```

### 4. 查看容器日志

```bash
# 查看全部日志
docker logs my-nginx

# 实时查看日志（类似tail -f）
docker logs -f my-nginx

# 查看最后100行
docker logs --tail 100 my-nginx
```

### 5. 删除容器和镜像

```bash
# 删除已停止的容器
docker rm my-nginx

# 强制删除运行中的容器
docker rm -f my-nginx

# 删除镜像
docker rmi nginx:latest

# 批量清理：删除所有停止的容器
docker container prune

# 批量清理：删除所有未使用的镜像
docker image prune -a
```

---

## 六、数据持久化：Volume与挂载

容器删除后，里面的数据也会丢失。怎么办？用**数据卷（Volume）**或**目录挂载**。

### 1. Volume（推荐）

Docker管理的存储卷，适合持久化数据。

```bash
# 创建卷
docker volume create mydata

# 查看卷
docker volume ls

# 使用卷
docker run -d -v mydata:/var/lib/mysql --name my-mysql mysql:8.0
```

### 2. 目录挂载

直接挂载宿主机目录，方便开发调试。

```bash
# 将宿主机/www目录挂载到容器的/usr/share/nginx/html
docker run -d -p 8080:80 -v /www:/usr/share/nginx/html --name my-nginx nginx

# 现在修改/www目录的文件，容器里立即生效
echo "<h1>Hello Docker!</h1>" > /www/index.html
```

### 3. 只读挂载

```bash
# 添加:ro参数，容器只能读不能写
docker run -d -v /www:/usr/share/nginx/html:ro nginx
```

---

## 七、Docker Compose：一键启动多容器

实际项目中，往往需要多个容器协作（Web+数据库+缓存）。手动一个个启动太麻烦，**Docker Compose**帮你一键搞定。

### 示例：WordPress博客系统

创建`docker-compose.yml`：

```yaml
version: '3.8'

services:
  # 数据库
  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: example
      MYSQL_DATABASE: wordpress
    volumes:
      - db_data:/var/lib/mysql

  # WordPress
  wordpress:
    image: wordpress:latest
    ports:
      - "8080:80"
    environment:
      WORDPRESS_DB_HOST: db:3306
      WORDPRESS_DB_PASSWORD: example
    volumes:
      - wp_data:/var/www/html
    depends_on:
      - db

volumes:
  db_data:
  wp_data:
```

一键启动：

```bash
# 启动所有服务
docker compose up -d

# 查看服务状态
docker compose ps

# 停止所有服务
docker compose down
```

访问 `http://localhost:8080`，WordPress安装页面就出现了！

---

## 八、Dockerfile：打造自己的镜像

除了用现成的镜像，你也可以用Dockerfile构建自己的镜像。

### 示例：构建Python Web应用镜像

创建`Dockerfile`：

```dockerfile
# 基础镜像
FROM python:3.11-slim

# 设置工作目录
WORKDIR /app

# 复制依赖文件
COPY requirements.txt .

# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["python", "app.py"]
```

构建镜像：

```bash
# 构建镜像，-t指定镜像名和标签
docker build -t my-python-app:v1.0 .

# 查看构建的镜像
docker images | grep my-python-app

# 运行容器
docker run -d -p 8000:8000 my-python-app:v1.0
```

---

## 九、实用技巧与常见问题

### 1. 容器开机自启动

```bash
# 创建容器时指定
docker run -d --restart=always nginx

# 修改已有容器
docker update --restart=always my-nginx
```

### 2. 容器资源限制

```bash
# 限制内存512MB，CPU最多用1个核心
docker run -d --memory=512m --cpus=1 nginx
```

### 3. 查看容器IP地址

```bash
docker inspect -f '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' my-nginx
```

### 4. 容器与宿主机文件互传

```bash
# 宿主机→容器
docker cp /host/file.txt my-nginx:/container/path/

# 容器→宿主机
docker cp my-nginx:/container/file.txt /host/path/
```

### 5. 清理Docker垃圾

```bash
# 删除所有停止的容器、未使用的网络、悬空镜像、构建缓存
docker system prune -a

# 查看磁盘占用
docker system df
```

### 6. 常见错误解决

**错误1：Cannot connect to the Docker daemon**

```bash
# 启动Docker服务
sudo systemctl start docker
```

**错误2：permission denied**

```bash
# 把当前用户加入docker组
sudo usermod -aG docker $USER
newgrp docker
```

**错误3：port is already allocated**

```bash
# 查看端口占用
sudo lsof -i :8080

# 修改端口映射
docker run -d -p 8081:80 nginx
```

---

## 十、进阶路线图

掌握了基础操作后，可以这样进阶：

1. **Docker网络**：bridge、host、overlay网络，容器间通信
2. **Docker Swarm**：原生容器编排，搭建集群
3. **Kubernetes**：容器编排平台，企业级运维必备
4. **镜像优化**：多阶段构建、精简镜像体积
5. **安全加固**：镜像安全扫描、容器权限控制

---

## 总结：Docker学习速查表

| 操作 | 命令 |
|:---|:---|
| 拉取镜像 | `docker pull <镜像名>` |
| 查看镜像 | `docker images` |
| 运行容器 | `docker run -d -p 宿主机端口:容器端口 <镜像名>` |
| 查看容器 | `docker ps` |
| 进入容器 | `docker exec -it <容器名> /bin/bash` |
| 停止容器 | `docker stop <容器名>` |
| 删除容器 | `docker rm <容器名>` |
| 查看日志 | `docker logs -f <容器名>` |
| 数据挂载 | `docker run -v 宿主机路径:容器路径 <镜像名>` |
| Compose启动 | `docker compose up -d` |

---

## 你现在可以做什么？

1. **动手实践**：按本文步骤，在你的Ubuntu上安装Docker
2. **运行第一个容器**：启动一个Nginx或MySQL
3. **加入社区**：在评论区分享你的Docker学习心得，遇到问题随时提问

---

💡 **UbuntuNews** | 资讯·工具·教程·社区

🐧 关注我们，获取更多Ubuntu/Linux技术干货

💬 加入QQ群/频道，与全国爱好者交流成长

❤️ 觉得有用？点个"在看"分享给更多人！
