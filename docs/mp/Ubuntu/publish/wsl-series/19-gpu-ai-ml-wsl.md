# WSL 跑 AI/ML 模型？CUDA 加速 + PyTorch 实战

> **阅读时长**：约 12 分钟 | **难度等级**：⭐⭐⭐⭐ 高级实战
> **本篇关键词**：WSL / GPU / CUDA / PyTorch / AI / 深度学习 / 机器学习
>
> WSL 2 支持 NVIDIA GPU 直通——你可以在 Windows 上用 WSL 直接跑 CUDA 加速的深度学习训练和推理，体验接近原生 Linux 的性能。

---

## WSL + GPU 能做什么？

### 支持矩阵

```
┌─────────────────────────────────────────────────┐
│           WSL GPU 加速支持全景                    │
│                                                 │
│  ✅ NVIDIA GPU（主流显卡）                        │
│     · GTX 16/20/30/40 系列                     │
│     · RTX 16/20/30/40/50 系列                  │
│     · Tesla 数据中心卡                          │
│                                                 │
│  ✅ 支持的框架                                   │
│     · PyTorch（完全支持）                        │
│     · TensorFlow（完全支持）                     │
│     · JAX（支持）                               │
│     · TensorFlow Lite / ONNX Runtime            │
│                                                 │
│  ✅ 支持的应用                                   │
│     · 深度学习训练与推理                         │
│     · LLM 大模型运行（如 Llama、Qwen）           │
│     · 计算机视觉（YOLO、Stable Diffusion）       │
│     · 数据科学计算                              │
│                                                 │
│  ❌ AMD GPU                                      │
│     · 目前 WSL 不支持 AMD ROCm 直通              │
│     · 需要用 ROCm 在原生 Linux 或 Docker        │
│     · （微软正在推进中）                         │
└─────────────────────────────────────────────────┘
```

### 性能对比

| 场景 | Windows 原生 | WSL 2 GPU | 原生 Linux |
|:---|:---:|:---:|:---:|
| **CUDA 编译速度** | 快 | ⚡ 同等 | ⚡ 同等 |
| **GPU 推理吞吐量** | 100% | **98-102%** | 100% |
| **GPU 显存利用率** | 95%+ | **93-97%** | 96%+ |
| **多 GPU 训练** | ⚠️ 需额外配置 | ✅ 开箱即用 | ✅ 原生支持 |
| **Docker 容器 GPU** | 需 WSL2 后端 | ✅ 原生支持 | ✅ 原生支持 |

> 🎯 **结论**：WSL 2 的 GPU 性能几乎等同于原生 Linux！

---

## 第一步：前置条件检查

### 确认你的显卡

```powershell
# PowerShell 中查看 GPU 信息
nvidia-smi
```

输出示例：
```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 550.00       Driver Version: 550.00       CUDA Version: 12.4     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp   Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|                               |                      |               MIG M. |
|===============================+======================+======================|
|   0  NVIDIA GeForce ... Off  | 00000000:01:00.0  On   |                  N/A |
| 30C    P8    12W / 200W      |   512MiB / 8192MiB     |      0%      Default |
|                               |                      |                  N/A |
+-----------------------------------------------------------------------------+
```

关键信息：
- **Driver Version**: 需要 ≥ 510.x（推荐最新）
- **CUDA Version**: 显示的是驱动支持的最高 CUDA 版本
- **Memory**: 你的显存大小（决定能跑多大的模型）

### WSL 中验证 GPU 可见性

```bash
# 在 WSL 中直接运行 nvidia-smi
nvidia-smi

# 如果能看到完整的 GPU 信息表 → GPU 直通已生效！✅
# 如果提示 "command not found" → 需要安装驱动
```

---

## 第二步：安装 CUDA Toolkit

### 为什么需要 CUDA Toolkit？

```
nvidia-smi 只需要驱动
但跑 PyTorch/TensorFlow 还需要 CUDA Toolkit：
· nvcc — CUDA 编译器
· cuDNN — 深度学习加速库
· cuBLAS / cuFFT 等 GPU 加速库
```

### 安装方法

```bash
# 方法一：apt 安装（Ubuntu 推荐）
wget https://developer.download.nvidia.com/compute/cuda/repos/wsl-ubuntu/x86_64/cuda-keyring_1.1-1_all.deb
sudo dpkg -i cuda-keyring_1.1-1_all.deb
sudo apt update
sudo apt install cuda-toolkit-12-4    # 根据需要的版本调整

# 方法二：runfile 安装（更灵活）
# 从 https://developer.nvidia.com/cuda-downloads 选择:
# Operating System: Linux → x86_64 → WSL-Ubuntu -> 2.0 runfile (local)
# 下载后执行安装脚本

# 验证
nvcc --version
# nvcc: NVIDIA (R) Cuda compiler tools...
# Cuda compilation tools, release 12.4, ...
```

### 配置环境变量

```bash
echo 'export PATH=/usr/local/cuda/bin:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/usr/local/cuda/lib64:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc
```

---

## 第三步：PyTorch GPU 环境搭建

### 创建专用虚拟环境

```bash
# 创建 AI/ML 专用环境
python3 -m venv ~/ml-env
source ~/ml-env/bin/activate
pip install --upgrade pip

# 安装 PyTorch（GPU 版本）
# 访问 https://pytorch.org/get-started/locally/ 获取最新命令
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu124

# 安装常用 ML 工具包
pip install numpy pandas matplotlib seaborn plotly jupyterlab scikit-learn
pip install transformers accelerate bitsandbytes   # LLM 相关
pip install ultralytics                            # YOLO
```

### 验证 PyTorch GPU 支持

```python
# 创建测试文件 test-gpu.py
import torch

print(f"PyTorch version: {torch.__version__}")
print(f"CUDA available: {torch.cuda.is_available()}")

if torch.cuda.is_available():
    print(f"CUDA version: {torch.version.cuda}")
    print(f"GPU count: {torch.cuda.device_count()}")
    print(f"Current GPU: {torch.cuda.get_device_name(0)}")
    print(f"GPU memory: {torch.cuda.get_device_properties(0).total_mem / 1024**3:.1f} GB")
    
    # 测试 GPU 计算
    x = torch.randn(1000, 1000, device='cuda')
    y = torch.matmul(x, x.t())
    print(f"GPU matrix multiply: shape = {y.shape} ✅")
else:
    print("❌ CUDA not available!")
```

```bash
python test-gpu.py
# 输出示例：
# PyTorch version: 2.2.0+cu124
# CUDA available: True
# CUDA version: 12.4
# GPU count: 1
# Current GPU: NVIDIA GeForce RTX 4060 Laptop GPU
# GPU memory: 8.0 GB
# GPU matrix multiply: shape = torch.Size([1000, 1000]) ✅
```

---

## 第四步：实际应用场景

### 场景一：本地运行大语言模型 (LLM)

```bash
# 安装 Hugging Face Transformers
pip install transformers accelerate sentencepiece

# 运行一个较小的模型测试
cat > run-llm.py << 'PYEOF'
from transformers import pipeline
import time

print("🔄 加载模型...")
start = time.time()
generator = pipeline('text-generation', 
                       model='Qwen/Qwen2.5-1.5B-Instruct',  # 约 1.5GB
                       device_map='cuda')
load_time = time.time() - start
print(f"✅ 模型加载完成 ({load_time:.1f}s)")

prompt = "用简单的解释告诉我什么是WSL？"
print(f"\n💬 提示词: {prompt}\n")
result = generator(prompt, max_new_tokens=200, do_sample=True)[0]['generated_text']
print(result)
PYEOF

python run-llm.py
```

> 💡 **显存需求参考**：
> - 1.5B 参数模型 → ~3GB 显存
> - 7B 参数模型 → ~14GB 显存（需量化）
> - 使用 `bitsandbytes` 4-bit/8-bit 量化可大幅降低显存需求

### 场景二：YOLO 目标检测

```bash
# 安装 YOLO
pip install ultralytics opencv-python-headless

# 目标检测演示
cat > detect.py << 'PYEOF'
from ultralytics import YOLO
import cv2

print("🔄 加载 YOLOv8n...")
model = YOLO('yolov8n.pt')   # Nano 版本，仅 ~6MB

print("📸 进行推理（GPU加速）...")
results = model.predict(source=0, show=True, conf=0.5)

# 用摄像头或图片也行
# results = model.predict(source='photo.jpg', save=True)
print("✅ 检测完成！结果保存在 runs/detect/")
PYEOF

python detect.py
# 会弹出一个窗口显示实时摄像头检测结果（WSLg GUI）
# 或者处理指定图片文件
```

### 场景三：Jupyter Notebook + GPU 监控

```bash
# 启动 Jupyter Lab（WSLg 下浏览器可直接访问）
jupyter lab --ip=0.0.0.0 --port=8888 --no-browser
```

在 Notebook 中监控 GPU：

```python
# GPU 监控代码块（可在 Notebook 中反复执行）
!nvidia-smi

# PyTorch GPU 内存使用
import torch
if torch.cuda.is_available():
    allocated = torch.cuda.memory_allocated() / 1024**3
    reserved = torch.cuda.memory_reserved() / 1024**3
    print(f"已分配: {allocated:.2f} GB | 缓存预留: {reserved:.2f} GB")
```

---

## 第五步：性能优化技巧

### 技巧一：设置 CUDA 内存策略

```python
import os
os.environ['PYTORCH_CUDA_ALLOC_CONF'] = 'expandable_segments:True'

import torch
# 允许 CUDA 内存池动态扩展
```

### 技巧二：混合精度训练（减少显存占用 ~50%）

```python
from torch import amp  # PyTorch 2.0+
scaler = amp.GradScaler('cuda')

with amp.autocast('cuda'):
    output = model(input_data)
loss = criterion(output, target)
scaler.scale(loss).backward()
scaler.step(optimizer)
scaler.update()
```

### 技巧三：多 GPU（如果有）

```python
# DataParallel（简单易用）
model = torch.nn.DataParallel(model).cuda()

# DistributedDataParallel（更高性能，推荐大规模训练）
import torch.distributed as dist
dist.init_process_group(backend='nccl')
model = torch.nn.parallel.DistributedDataParallel(model, device_ids=[0])
```

### .wslconfig GPU 优化

```ini
[wsl2]
memory=16GB          # AI 任务需要更多内存
processors=10
swap=8GB
vmIdleTimeout=-1
# GPU 直通不需要特殊配置，开箱即用
```

---

## 常见问题 FAQ

### Q：`nvidia-smi` 在 WSL 中找不到？

```
解决：
1. 确认 Windows 端安装了 NVIDIA 驱动（≥ 510 版本）
2. 更新 WSL：wsl --update
3. 重启 WSL：wsl --shutdown
4. 如果还不行，确认是 WSL 2（wsl --list -v 看 VERSION 列）
```

### Q：`RuntimeError: CUDA out of memory`

```
解决：
1. 减小 batch size
2. 使用梯度累积模拟大 batch
3. 使用混合精度训练 (AMP)
4. 清理缓存: torch.cuda.empty_cache()
5. 检查是否有其他程序占用 GPU
```

### Q：WSL 中 GPU 比 Windows 慢？

```
正常情况应该基本一致。如果明显慢：
1. 确保 model 和 data 都在 cuda 上
2. 检查是否误用了 CPU fallback
3. 禁用 WSLg（GUI）节省资源
4. 关闭不必要的后台服务
```

---

## 下期预告

下一篇：**《WSL 备份与迁移：换电脑不丢环境的完整方案》**

- 💾 wsl --export/import 全流程
- 🔧 自动化备份脚本设计
- 🖥️ 新电脑环境一键重建清单
- ☁️ 多机同步方案
- 🗄️ Dotfiles 统一管理

---

> **💡 你在 WSL 中跑过什么 AI 模型？效果如何？**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
