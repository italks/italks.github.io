# Python 开发环境搭建：venv、conda、uv 怎么选？

> **阅读时长**：约 12 分钟 | **难度等级**：⭐⭐☆☆☆ 入门进阶
> **本篇关键词**：Python / venv / conda / uv / 虚拟环境 / WSL 开发
>
> Python 是 WSL 上最流行的开发语言之一。但在开始写代码之前，你得先搞清楚虚拟环境和包管理器怎么选——这一篇帮你彻底理清。

---

## 为什么 Python 在 WSL 中特别好用？

### 对比：Windows 原生 vs WSL

| 问题 | Windows Python | WSL Python |
|:---|:---|:---|
| 安装依赖 | 经常遇到编译错误（缺少头文件）| `apt install` 搞定依赖 |
| 路径问题 | 反斜杠噩梦、路径空格问题 | 正斜杠，干净利落 |
| 脚本执行 | `.py` 文件关联混乱 | 直接 `python3 file.py` |
| 多版本共存 | 需要手动配置 PATH | pyenv/包管理器轻松切换 |
| 生产一致性 | 和 Linux 服务器有差异 | **几乎完全一致** ✅ |
| NumPy/Pandas 性能 | 通常较慢 | **更快**（Linux 编译优化）|

---

## 第一步：安装 Python

### Ubuntu 自带 Python

```bash
# Ubuntu 24.04 自带 Python 3.12+
python3 --version
# Python 3.12.x

# pip 也装上（如果还没有）
sudo apt install -y python3-pip python3-venv python3-dev

# 升级 pip 到最新版
python3 -m pip install --upgrade pip

# 验证
python3 --version && pip --version
```

### ⚠️ 重要规则：永远不要 sudo pip install！

```bash
# ❌ 错误做法：污染系统 Python
sudo pip install requests
# → 可能导致系统工具异常
# → 包管理混乱，难以维护

# ✅ 正确做法：使用虚拟环境
python3 -m venv .venv
source .venv/bin/activate
pip install requests          # 在虚拟环境中安全安装
deactivate                   # 退出时自动隔离
```

---

## 三种包管理器对比

### 总览

| 工具 | 类型 | 速度 | 适用场景 | 推荐度 |
|:---|:---|:---:|:---|:---:|
| **pip + venv** | 官方标准 | ⚡⚡ | 轻量项目、学习、小型工具 | ⭐⭐⭐⭐ |
| **uv** 🌟 | Rust 新秀 | ⚡⚡⚡⚡⚡ | **新项目首选（2025+）** | ⭐⭐⭐⭐⭐ |
| **Miniconda** | 数据科学生态 | ⚡⚡⚡ | 数据科学、AI/ML、多版本共存 | ⭐⭐⭐⭐ |

### 详细对比

```
pip + venv：
┌─────────────────────────────┐
│ 优点                         │
│ · Python 官方方案，最标准     │
│ · 无需额外安装               │
│ · 轻量，每个项目独立           │
│ 缺点                          │
│ · 速度较慢（pip 下载+安装）    │
│ · 不自动管理 Python 版本      │
│ · 大项目依赖解析可能卡死       │
└─────────────────────────────┘

uv：
┌─────────────────────────────┐
│ 优点                         │
│ · 极快！比 pip 快 10-100 倍   │
│ · 自动创建和管理虚拟环境      │
│ · 一条命令搞定项目初始化      │
│ · 内置 Python 版本下载管理    │
│ · Rust 编写，资源占用极低     │
│ 缺点                          │
│ · 相对较新（生态还在成长）     │
│ · 部分边缘场景可能有兼容问题   │
└─────────────────────────────┘

Miniconda / conda：
┌─────────────────────────────┐
│ 优点                         │
│ · 数据科学全家桶              │
│ · 二进制包，不用编译          │
│ · 非 Python 包也能管          │
│ · 多版本 Python 切换方便      │
│ 缺点                          │
│ · 安装包大（~500MB 起步）     │
│ · 启动慢                     │
│ · 与 pip 有时会冲突           │
│ · 许可协议限制                │
└─────────────────────────────┘
```

---

## 方案一：uv — 新项目首选（强烈推荐 ⭐）

### 安装

```bash
# 一行安装（官方脚本）
curl -LsSf https://astral.sh/uv/install.sh | sh

# 重载 shell 或手动添加 PATH
source ~/.bashrc
# 或者重启终端

# 验证
uv --version
# uv 0.x.x (构建于 202x-xx-xx)
```

### 快速上手

```bash
# 初始化一个新项目（自动创建 pyproject.toml + 虚拟环境）
uv init my-project && cd my-project

# 添加依赖（自动安装到虚拟环境）
uv add requests fastapi uvicorn sqlalchemy

# 运行代码
uv run main.py

# 添加开发依赖（不进入生产依赖）
uv add --dev pytest black ruff

# 运行测试
uv run pytest

# 查看已安装的包
uv pip list

# 导出 requirements.txt（兼容性）
uv pip freeze > requirements.txt

# 从 requirements.txt 安装
uv pip install -r requirements.txt

# 使用特定 Python 版本
uv python install 3.11         # 下载 Python 3.11
uv run --python 3.11 main.py   # 用 3.11 运行
```

### uv 项目结构示例

```
my-project/
├── .venv/                  # uv 自动管理的虚拟环境
├── pyproject.toml          # 项目配置和依赖声明
├── main.py                 # 你的代码
└── README.md
```

`pyproject.toml` 内容：
```toml
[project]
name = "my-project"
version = "0.1.0"
requires-python = ">=3.10"
dependencies = [
    "requests>=2.31.0",
    "fastapi>=0.104.0",
    "uvicorn[standard]>=0.24.0",
]
```

---

## 方案二：pip + venv — 传统可靠

### 创建和使用虚拟环境

```bash
# 1. 创建项目目录
mkdir -p ~/projects/myapp && cd ~/projects/myapp

# 2. 创建虚拟环境
python3 -m venv .venv

# 3. 激活虚拟环境
source .venv/bin/activate
# 提示符变化：( .venv ) user@pc:~/projects/myapp$

# 4. 升级 pip
pip install --upgrade pip setuptools wheel

# 5. 安装依赖
pip install flask pandas numpy

# 6. 查看已安装的包
pip list

# 7. 退出虚拟环境
deactivate
```

### 批量依赖管理

```bash
# 导出当前环境所有依赖
pip freeze > requirements.txt

# 从文件批量安装
pip install -r requirements.txt

# 只导出项目直接依赖（更干净的列表）
pip freeze --exclude-editable > requirements.txt

# 或使用 pip-tools（推荐用于精确控制）
pip install pip-tools
# 创建 requirements.in（只写直接依赖）
# 然后：
pip-compile requirements.in     # 生成 requirements.txt
pip-sync requirements.txt        # 精确安装
```

### 自动激活虚拟环境（可选便利功能）

```bash
# 安装 autoenv（进入目录自动激活）
pip install autoenv

# 写入 bashrc
echo 'source $(python3 -m autoenv site)' >> ~/.bashrc

# 在项目中创建 .env 文件
echo 'source .venv/bin/activate' > ~/projects/myapp/.env
# 下次 cd 进入该目录会自动激活
```

---

## 方案三：Miniconda — 数据科学首选

### 安装 Miniconda

```bash
# 下载最新版 Miniconda
wget https://repo.anaconda.com/miniconda/Miniconda3-latest-Linux-x86_64.sh

# 安装（一路回车 + yes）
bash Miniconda3-latest-Linux-x86_64.sh

# 重启 shell
source ~/.bashrc
# 或关闭重开终端

# 验证
conda --version
```

### Conda 常用操作

```bash
# 创建环境
conda create -n datascience python=3.11

# 激活环境
conda activate datascience

# 安装数据科学常用包（conda 会处理二进制编译依赖）
conda install numpy pandas matplotlib scikit-learn jupyter seaborn plotly

# 用 pip 安装 conda 没有的包
pip install some-special-package

# 查看所有环境
conda env list

# 导出/导入环境
conda export > environment.yml
conda env create -f environment.yml

# 删除环境
conda remove -n old-env --all

# 清理缓存释放空间
conda clean --all
```

### Jupyter Notebook 配置

```bash
# 安装 Jupyter
conda install jupyter ipykernel

# 启动 Notebook（WSLg 下可以直接在浏览器看到）
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser

# 浏览器打开 http://localhost:8888 即可操作

# 如果想从 Windows 浏览器访问，获取 token 后粘贴
# 终端中显示的 URL 带 token 参数，复制完整 URL 到浏览器
```

---

## 常用 Python 开发包速查表

### Web 开发

```bash
pip install fastapi uvicorn     # 现代 API 框架
pip install flask               # 经典轻量框架
pip install django              # 全栈框架
pip install httpie              # API 调试工具（替代 curl）
```

### 数据科学

```bash
pip install numpy pandas matplotlib    # 三件套
pip install seaborn plotly             # 高级可视化
pip install scikit-learn              # 机器学习
pip install jupyterlab                # Notebook
pip install openpyxl xlrd             # Excel 处理
```

### 开发工具

```bash
pip install pytest pytest-cov         # 测试
pip install black isort ruff           # 格式化与检查
pip install mypy                      # 类型检查
pip install httpx                     # HTTP 客户端
pip install rich                      # 终端美化输出
pip install python-dotenv             # 环境变量管理
```

---

## VS Code + Python + Remote-WSL 配置

确保在 VS Code 中安装了以下扩展：

1. **Python** (`ms-python.python`)
2. **Pylance** (`ms-python.vscode-pylance`)
3. **Black Formatter** (`ms-python.black-formatter`)
4. **Jupyter** (`ms-toolsai.jupyter`)

VS Code 会自动检测虚拟环境。如果没检测到：

```
Ctrl+Shift+P → "Python: Select Interpreter"
→ 选择 .venv/bin/python 或 conda 环境中的 python
```

`.vscode/settings.json`（项目级配置）：
```json
{
    "python.defaultInterpreterPath": "${workspaceFolder}/.venv/bin/python",
    "python.formatting.provider": "black",
    "python.linting.enabled": true,
    "python.testing.pytestEnabled": true,
    "[python]": {
        "editor.defaultFormatter": "ms-python.black-formatter",
        "editor.formatOnSave": true,
        "editor.codeActionsOnSave": {
            "source.organizeImports": "explicit"
        }
    }
}
```

---

## 下期预告

下一篇：**《Node.js / Go / Rust 在 WSL 中高效开发的秘诀》**

- ⚡ fnm 管理 Node.js 版本
- 🦀 Go 语言环境配置与 GOPATH
- 🦀 rustup + cargo 工具链入门
- 💡 多语言开发环境共存技巧

---

> **💡 你平时用哪种 Python 包管理器？评论区投个票！**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
>
> 💬 Python 开发还有什么坑？留言一起讨论！
