# 15. 容器化技术：Docker

> **摘要**：Docker 让环境配置不再头疼。本文教你通过官方源安装最新版 Docker，配置非 Root 用户权限以提升便利性，并验证 Docker Compose。掌握容器化技术，让你的应用在不同机器上都能拥有一致的运行环境，开发部署更轻松。

Docker 的价值不是“省掉装环境”，而是把环境变成可复用的描述：你在本机怎么跑，CI 怎么跑，服务器怎么跑，尽量一致。

## 1. 安装 Docker

虽然 `apt install docker.io` 能装，但版本通常偏旧。更稳的做法是使用 Docker 官方仓库安装（更新节奏更一致，也更容易查到资料）。

1.  **添加官方仓库并安装**:
    ```bash
    sudo apt update
    sudo apt install ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo $VERSION_CODENAME) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt update
    sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    ```

2.  **启动 Docker**:
    ```bash
    sudo systemctl start docker
    sudo systemctl enable docker  # 开机自启
    ```

## 2. 非 Root 用户运行 Docker (重要)

默认情况下，运行 docker 命令需要 `sudo`，这很麻烦。我们可以把当前用户加入 `docker` 用户组。

注意：`docker` 用户组基本等价于“拥有 root 权限”。个人电脑问题不大；多人共用的机器要谨慎。

1.  **添加用户组**:
    ```bash
    sudo usermod -aG docker $USER
    ```
2.  **生效配置**:
    需要注销并重新登录，或者运行 `newgrp docker` 临时生效。
3.  **验证**:
    ```bash
    docker run hello-world
    ```
    如果不报错，说明配置成功。

## 3. 安装 Docker Compose

Docker Compose 用于定义和运行多容器应用（比如同时启动一个 Web 服务和一个数据库）。
现在 Docker Compose 已经集成到 docker 命令行插件中了 (`docker compose`)，通常随 Docker 一起安装好了。

验证：
```bash
docker compose version
```

## 4. 配置国内镜像加速器

由于网络原因，直接从 Docker Hub 拉取镜像会很慢。

1.  编辑配置文件 `/etc/docker/daemon.json` (如果不存在就新建)：
    ```bash
    sudo nano /etc/docker/daemon.json
    ```
2.  添加以下内容（使用阿里云、网易或中科大源）：
    ```json
    {
      "registry-mirrors": [
        "https://docker.mirrors.ustc.edu.cn",
        "https://hub-mirror.c.163.com"
      ]
    }
    ```
3.  重启 Docker：
    ```bash
    sudo systemctl daemon-reload
    sudo systemctl restart docker
    ```

## 5. 常用 Docker 镜像部署示例

### 部署一个 MySQL 数据库
```bash
docker run --name some-mysql -e MYSQL_ROOT_PASSWORD=请换成你自己的强密码 -d mysql:8.0
```

### 部署一个 Nginx 服务器
```bash
docker run --name some-nginx -p 8080:80 -d nginx
```
访问 `http://localhost:8080` 即可看到 Nginx 欢迎页。

有了 Docker，你就能把“在我机器上能跑”变成“在任何机器上都能用同一套方式跑”。真正的关键在于：把启动参数写进 `docker compose.yml`，把环境变量、数据卷、端口都固化下来，而不是每次手打一串命令。
