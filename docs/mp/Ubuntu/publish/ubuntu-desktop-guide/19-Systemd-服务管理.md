# 19. Systemd 服务管理

在 Linux 中，后台运行的程序被称为**服务 (Service)** 或 **守护进程 (Daemon)**。Ubuntu 使用 **Systemd** 作为初始化系统和服务管理器。

## 1. 什么是 Systemd？

它是 Linux 启动后运行的第一个进程 (PID 1)，负责启动和管理其他所有进程。
虽然它因"管得太宽"而有争议，但它确实统一了 Linux 的服务管理标准。

## 2. 核心命令：systemctl

`systemctl` 是管理服务的瑞士军刀。假设我们要管理 `nginx` 服务：

*   **启动服务**:
    ```bash
    sudo systemctl start nginx
    ```
*   **停止服务**:
    ```bash
    sudo systemctl stop nginx
    ```
*   **重启服务**:
    ```bash
    sudo systemctl restart nginx
    ```
*   **重载配置** (不中断服务):
    ```bash
    sudo systemctl reload nginx
    ```
*   **查看状态**:
    ```bash
    sudo systemctl status nginx
    ```
    *绿色表示正在运行 (active running)，红色表示挂了 (failed)。*

还有两个特别常用的：

```bash
systemctl list-units --type=service --state=running
systemctl list-unit-files --type=service | head
```

## 3. 开机自启管理

*   **设置开机自启**:
    ```bash
    sudo systemctl enable nginx
    ```
*   **禁止开机自启**:
    ```bash
    sudo systemctl disable nginx
    ```
*   **检查是否开机自启**:
    ```bash
    sudo systemctl is-enabled nginx
    ```

## 4. 查看系统日志 (journalctl)

服务启动失败了？别慌，看日志。

*   **查看所有日志**:
    ```bash
    journalctl
    ```
*   **查看某个服务的日志**:
    ```bash
    journalctl -u nginx
    ```
*   **实时查看最新日志** (类似 tail -f):
    ```bash
    journalctl -u nginx -f
    ```
*   **查看本次启动后的错误日志**:
    ```bash
    journalctl -b -p err
    ```

排障时更常用的两种看法：

```bash
journalctl -u nginx -n 200 --no-pager
journalctl -u nginx --since "1 hour ago"
```

如果你修改了服务的配置或 unit 文件，别忘了：

```bash
sudo systemctl daemon-reload
sudo systemctl restart nginx
```

学会了 `systemctl` 和 `journalctl`，你就具备了基本的服务器运维能力。
