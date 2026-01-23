# 实战篇：DeepSeek 本地部署，在 Ubuntu 上打造你的隐私 AI 助手

> 🚀 **难度等级：** 入门
> ⏱️ **预计耗时：** 10 分钟
> 💻 **适用版本：** Ubuntu 22.04 LTS / 24.04 LTS / 26.04 (Preview)

各位 UbuntuNews 的极客朋友们，大家好！

在上期《Ubuntu 26.04 "坚毅浣熊" 前瞻》的文末，我们立下了一个 Flag：要带大家在 Ubuntu 上玩转 **DeepSeek**。

今天，我们兑现承诺。

为什么要在本地部署大模型？
*   **隐私安全：** 你的代码、文档、私密对话完全留存在本地硬盘，无需上传云端。
*   **零延迟：** 没有网络波动，响应速度仅取决于你的显卡算力。
*   **免费：** 告别 Token 计费，7x24 小时随心调用。

而 **DeepSeek (深度求索)** 作为近期最耀眼的国产开源大模型，其 V3 版本在编码和推理能力上已跻身世界第一梯队。今天，我们就用最符合 Linux 哲学的工具 —— **Ollama**，在 Ubuntu 上把 DeepSeek "装进笼子"。

---

## 🛠️ 准备工作：你的装备够用吗？

在开始之前，打开终端，输入神圣的指令：

```bash
nvidia-smi
```

*   **入门级 (7B 模型)：** 至少 8GB 显存 (RTX 3060/4060 级别) 或 16GB 统一内存。
*   **进阶级 (33B/67B 模型)：** 需要 24GB+ 显存 (RTX 3090/4090 或多卡互联)。
*   **纯 CPU 玩家：** 也可以跑，但请做好风扇起飞的准备，且推理速度会较慢。

> **注意：** 确保你已经安装了专有显卡驱动。在 Ubuntu 上，可以通过 "Software & Updates" -> "Additional Drivers" 一键安装。

---

## 🚀 第一步：安装 AI 运行时 —— Ollama

Ollama 是目前 Linux 平台上部署 LLM (大语言模型) 的事实标准工具，它极度简洁，就像 Docker 一样好用。

在终端执行以下命令（官方一键脚本）：

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

安装完成后，验证服务状态：

```bash
systemctl status ollama
```

看到绿色的 `active (running)`，说明引擎已启动。

---

## 📥 第二步：拉取 DeepSeek 模型

Ollama 的模型库非常丰富。针对普通开发者，我们推荐 **DeepSeek-R1** 系列（擅长推理和代码）。

根据你的显存大小，选择合适的“杯型”：

*   **7B (推荐大多数人)：** 平衡了速度与智商。
    ```bash
    ollama run deepseek-r1:7b
    ```

*   **1.5B (轻量级)：** 适合老旧笔记本。
    ```bash
    ollama run deepseek-r1:1.5b
    ```

*   **32B/70B (性能怪兽)：** 适合显存土豪。
    ```bash
    ollama run deepseek-r1:32b
    ```

输入命令后，Ollama 会自动从镜像站下载模型权重（通常几 GB），下载完成后会自动进入交互模式。

---

## 💬 第三步：Hello, DeepSeek!

当终端出现 `>>>` 提示符时，你就可以和它对话了。

**测试一下它的编程能力：**

```text
>>> 请用 Python 写一个快速排序算法，并解释时间复杂度。
```

你会发现，它不仅生成了代码，还通过 `<think>` 标签展示了它的思维链（Chain of Thought），这正是 R1 系列模型的强大之处。

要退出对话，输入 `/bye` 即可。

---

## 🎨 进阶：给 AI 穿上图形界面 (Open WebUI)

黑乎乎的终端虽然极客，但如果你想拥有类似 ChatGPT 的网页体验，或者想上传文档让它阅读，**Open WebUI** 是最佳伴侣。

前提：你需要安装 **Docker**。

```bash
# 运行 Open WebUI 容器
docker run -d -p 3000:8080 --add-host=host.docker.internal:host-gateway -v open-webui:/app/backend/data --name open-webui --restart always ghcr.io/open-webui/open-webui:main
```

运行成功后，打开浏览器访问 `http://localhost:3000`。

注册一个管理员账号（所有数据保存在本地），你就能看到一个漂亮的聊天界面。在模型选择列表中，你会发现刚才下载的 `deepseek-r1:7b` 已经在那里等你了。

---

## 🔮 总结

至此，你已经拥有了一台完全属于你自己的 AI 工作站。

*   写代码卡壳了？问它。
*   服务器报错看不懂？把 Log 贴给它。
*   需要翻译英文文档？让它来。

**下期预告：**
单纯对话还不够？下期我们将探讨 **"RAG (检索增强生成)"**，教你如何把 **Ubuntu 官方文档** 喂给 DeepSeek，让它成为真正的 Ubuntu 运维专家！

---

**💬 互动提问：**
你在本地部署 AI 时遇到过最头疼的问题是什么？是显卡驱动报错，还是下载速度太慢？欢迎在评论区吐槽！
