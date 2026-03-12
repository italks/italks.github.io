# 10 分钟安装 OpenClaw,小白也能搞定

> **摘要**: 提供OpenClaw三种安装方式对比，推荐官方包一键安装方案。详细讲解Windows/macOS/Linux三平台安装步骤、环境准备检查清单、初始化配置流程、安装验证方法，以及5个常见安装问题的解决方案。适合小白用户快速上手，附相关资源链接。
>
> **系列教程第 4 篇** | **阅读时长:10-15 分钟**

---

## 安装前的顾虑

看到"安装"两个字,你可能有点担心:
- 会不会要输很多命令?
- 需不需要懂编程?
- 配置失败了怎么办?

放心,这篇教程专为小白设计,跟着步骤走,10 分钟搞定。

---

## 一、环境准备检查清单

在安装 OpenClaw 之前,先检查你的电脑是否满足条件。

### 1. 操作系统要求

OpenClaw 支持:
- ✅ Windows 10/11
- ✅ macOS 10.15+
- ✅ Linux(主流发行版)

### 2. 必备软件检查

打开终端(Windows 用户打开 PowerShell 或 CMD),输入以下命令检查:

**检查 Python(需要 3.8+)**:

```bash
python --version
# 或
python3 --version
```

预期输出类似:`Python 3.10.x`

> ⚠️ 如果提示"命令未找到"或版本低于 3.8,需要先安装 Python
> 下载地址:https://www.python.org/downloads/

**检查 pip(Python 包管理器)**:

```bash
pip --version
# 或
pip3 --version
```

预期输出类似:`pip 23.x.x from ...`

**检查 Git(可选,用于从源码安装)**:

```bash
git --version
```

预期输出类似:`git version 2.x.x`

---

### 3. 硬件要求

- 内存:至少 4GB,推荐 8GB+
- 磁盘:至少 2GB 可用空间
- 网络:需要下载依赖包

---

## 二、三种安装方式对比

OpenClaw 提供三种安装方式:

| 方式 | 难度 | 优点 | 缺点 | 推荐人群 |
|------|------|------|------|---------|
| 官方包安装 | ⭐ 简单 | 快速、稳定 | 版本可能滞后 | 小白用户(推荐) |
| Docker 安装 | ⭐⭐ 中等 | 环境隔离、干净 | 需要装 Docker | 有 Docker 经验的用户 |
| 源码编译 | ⭐⭐⭐ 复杂 | 最新功能、可定制 | 步骤多、易出错 | 开发者、高级用户 |

**本教程采用第一种方式:官方包安装。**

---

## 三、推荐方案:官方包一键安装

### 步骤 1:下载安装包

访问 OpenClaw 官网或 GitHub Releases 页面:
- 官网:https://openclaw.ai(示例)
- GitHub:https://github.com/openclaw/openclaw/releases

下载对应你操作系统的安装包:
- Windows:`openclaw-setup-x.x.x.exe`
- macOS:`openclaw-x.x.x.dmg`
- Linux:`openclaw-x.x.x.AppImage`

---

### 步骤 2:运行安装程序

#### Windows

1. 双击 `openclaw-setup-x.x.x.exe`
2. 点击"是"允许运行
3. 选择安装目录(建议默认)
4. 点击"安装"
5. 勾选"启动 OpenClaw",点击"完成"

#### macOS

1. 双击 `openclaw-x.x.x.dmg`
2. 将 OpenClaw 图标拖入 Applications 文件夹
3. 打开启动台,找到 OpenClaw 并启动
4. 首次运行可能提示"无法验证开发者",在系统偏好设置→安全性与隐私中点击"仍要打开"

#### Linux

1. 下载 `.AppImage` 文件
2. 右键→属性→权限→勾选"允许作为程序执行"
3. 双击运行

---

### 步骤 3:初始化配置

首次启动时,OpenClaw 会进行初始化:

1. **选择数据目录**:建议默认,记住这个路径
2. **配置 AI 模型**:
   - 方式一:使用在线模型(如 OpenAI API)
   - 方式二:使用本地模型(如 Ollama)

   小白建议先用在线模型,后面再换本地模型

3. **API Key 配置**(如果使用在线模型):
   - 获取 OpenAI API Key:https://platform.openai.com/api-keys
   - 或使用其他兼容接口(如 DeepSeek、智谱等)
   - 填入 API Key,点击"验证"

4. **完成初始化**

---

## 四、安装验证:运行第一个命令

安装完成后,我们来验证是否成功。

### 方式一:图形界面

1. 打开 OpenClaw 应用
2. 在输入框输入:`查看帮助`
3. 如果能看到帮助信息,说明安装成功

### 方式二:命令行

打开终端,输入:

```bash
openclaw --version
```

预期输出:`OpenClaw version x.x.x`

再试一个简单命令:

```bash
openclaw list skills
```

预期输出:当前已安装的技能列表(初始可能为空)

---

## 五、常见安装问题 FAQ

### Q1:提示"python 不是内部或外部命令"

**原因**:Python 未安装或未加入环境变量

**解决**:
1. 下载安装 Python:https://www.python.org/downloads/
2. 安装时勾选"Add Python to PATH"
3. 重启终端,再次检查

---

### Q2:安装包无法运行,提示权限不足

**原因**:系统安全设置阻止

**解决**:
- **Windows**:右键→以管理员身份运行
- **macOS**:系统偏好设置→安全性与隐私→点击"仍要打开"
- **Linux**:`chmod +x openclaw-xxx.AppImage` 赋予执行权限

---

### Q3:API Key 验证失败

**原因**:Key 无效或网络问题

**解决**:
1. 检查 Key 是否正确复制(无多余空格)
2. 检查网络是否能访问 API 服务
3. 如果使用代理,确保代理配置正确
4. 尝试切换其他模型服务商

---

### Q4:安装后打不开

**可能原因**:
- 数据目录权限不足
- 端口被占用(默认端口 8080)
- 配置文件损坏

**解决**:
1. 以管理员身份运行
2. 检查端口占用:`netstat -ano | findstr 8080`(Windows)
3. 删除配置文件重新初始化(位于 `~/.openclaw/`)

---

### Q5:Mac 提示"已损坏,无法打开"

**原因**:macOS 安全机制

**解决**:
打开终端,输入:
```bash
sudo xattr -r -d com.apple.quarantine /Applications/OpenClaw.app
```
输入密码后,再次打开应用。

---

## 六、下一步

恭喜!你已经成功安装了 OpenClaw。

但安装只是第一步,下一篇我们完成一个真实任务:用 OpenClaw 处理 PDF 文件。

> **下一篇**:你的第一个任务:让 OpenClaw 帮你处理 PDF

---

## 附录:相关资源

- OpenClaw 官网:https://openclaw.ai
- GitHub 仓库:https://github.com/openclaw/openclaw
- 官方文档:https://docs.openclaw.ai
- 社区论坛:https://community.openclaw.ai
- 问题反馈:GitHub Issues

---
