# OpenClaw龙虾如何编写自己的技能?

> **核心问题**:现有技能满足不了需求怎么办?
> 详细讲解OpenClaw技能开发全流程，从技能结构解析、开发环境搭建到实际案例实现，涵盖skill.json配置、主逻辑脚本编写、发布流程及安全最佳实践。

**系列教程第 17 篇** | **阅读时长:15-20 分钟**

---

## 从用户到开发者

前面的教程中,我们使用了许多官方和社区开发的技能。但当遇到特殊需求时,现有技能可能无法满足。

这时,你可以:
1. 向社区提需求
2. 自己开发技能

本篇教你如何编写自己的 OpenClaw 技能。

---

## 一、技能的本质:配置文件 + 脚本

### 技能结构

一个完整的技能包含以下文件:

```
my-skill/
├── skill.json        # 技能配置文件
├── main.py           # 主逻辑脚本(或其他语言)
├── requirements.txt  # Python 依赖(如果是 Python)
├── README.md         # 使用说明
└── tests/            # 测试文件(可选)
    └── test_main.py
```

---

### 核心文件:skill.json

这是技能的"身份证",定义了技能的基本信息和能力:

```json
{
  "name": "my-skill",
  "version": "1.0.0",
  "description": "我的自定义技能",
  "author": "your-name",
  "license": "MIT",
  
  "entry_point": "main.py",
  "language": "python",
  
  "commands": [
    {
      "name": "hello",
      "description": "打招呼",
      "params": [
        {
          "name": "name",
          "type": "string",
          "required": true,
          "description": "你的名字"
        }
      ],
      "returns": {
        "type": "string",
        "description": "问候语"
      }
    }
  ],
  
  "permissions": [
    "file_read",
    "file_write"
  ],
  
  "dependencies": {
    "python": ">=3.8",
    "packages": ["requests"]
  }
}
```

---

### 主逻辑脚本:main.py

实现具体的业务逻辑:

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

def hello(name: str) -> str:
    """
    打招呼
    
    Args:
        name: 用户名
    
    Returns:
        问候语
    """
    return f"你好,{name}!欢迎使用 OpenClaw!"

# OpenClaw 会调用这个函数
def execute(command: str, params: dict) -> dict:
    """
    技能执行入口
    
    Args:
        command: 命令名称
        params: 参数字典
    
    Returns:
        执行结果
    """
    if command == "hello":
        name = params.get("name", "朋友")
        result = hello(name)
        return {
            "success": True,
            "result": result
        }
    else:
        return {
            "success": False,
            "error": f"未知命令: {command}"
        }

if __name__ == "__main__":
    # 本地测试
    result = execute("hello", {"name": "张三"})
    print(result)
```

---

## 二、技能开发环境搭建

### 1. 创建技能目录

```bash
mkdir my-skill
cd my-skill
```

---

### 2. 初始化技能

```bash
openclaw skill init my-skill
```

这会自动生成基础文件:

```
my-skill/
├── skill.json
├── main.py
├── requirements.txt
└── README.md
```

---

### 3. 安装开发依赖

```bash
# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 安装 OpenClaw SDK(如果有)
pip install openclaw-sdk
```

---

### 4. 本地测试

```bash
# 直接运行脚本测试
python main.py

# 或使用 OpenClaw 命令测试
openclaw skill test . --command hello --params '{"name": "张三"}'
```

---

## 三、从零开发一个简单技能

### 需求:时间戳转换工具

创建一个技能,实现:
- 时间戳 → 日期时间
- 日期时间 → 时间戳

---

### 步骤 1:创建 skill.json

```json
{
  "name": "timestamp-converter",
  "version": "1.0.0",
  "description": "时间戳转换工具",
  "author": "your-name",
  "license": "MIT",
  
  "entry_point": "main.py",
  "language": "python",
  
  "commands": [
    {
      "name": "to-datetime",
      "description": "时间戳转日期时间",
      "params": [
        {
          "name": "timestamp",
          "type": "integer",
          "required": true,
          "description": "Unix 时间戳"
        }
      ],
      "returns": {
        "type": "string",
        "description": "日期时间字符串"
      }
    },
    {
      "name": "to-timestamp",
      "description": "日期时间转时间戳",
      "params": [
        {
          "name": "datetime_str",
          "type": "string",
          "required": true,
          "description": "日期时间字符串(格式:YYYY-MM-DD HH:MM:SS)"
        }
      ],
      "returns": {
        "type": "integer",
        "description": "Unix 时间戳"
      }
    }
  ],
  
  "dependencies": {
    "python": ">=3.8"
  }
}
```

---

### 步骤 2:编写 main.py

```python
#!/usr/bin/env python3
# -*- coding: utf-8 -*-

from datetime import datetime

def timestamp_to_datetime(timestamp: int) -> str:
    """
    时间戳转日期时间
    
    Args:
        timestamp: Unix 时间戳
    
    Returns:
        日期时间字符串
    """
    dt = datetime.fromtimestamp(timestamp)
    return dt.strftime("%Y-%m-%d %H:%M:%S")

def datetime_to_timestamp(datetime_str: str) -> int:
    """
    日期时间转时间戳
    
    Args:
        datetime_str: 日期时间字符串
    
    Returns:
        Unix 时间戳
    """
    dt = datetime.strptime(datetime_str, "%Y-%m-%d %H:%M:%S")
    return int(dt.timestamp())

def execute(command: str, params: dict) -> dict:
    """
    技能执行入口
    """
    try:
        if command == "to-datetime":
            timestamp = params.get("timestamp")
            if timestamp is None:
                return {"success": False, "error": "缺少参数: timestamp"}
            
            result = timestamp_to_datetime(timestamp)
            return {"success": True, "result": result}
        
        elif command == "to-timestamp":
            datetime_str = params.get("datetime_str")
            if datetime_str is None:
                return {"success": False, "error": "缺少参数: datetime_str"}
            
            result = datetime_to_timestamp(datetime_str)
            return {"success": True, "result": result}
        
        else:
            return {"success": False, "error": f"未知命令: {command}"}
    
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    # 测试
    print("测试 to-datetime:")
    print(execute("to-datetime", {"timestamp": 1709251200}))
    
    print("\n测试 to-timestamp:")
    print(execute("to-timestamp", {"datetime_str": "2024-03-01 00:00:00"}))
```

---

### 步骤 3:编写 README.md

```markdown
# timestamp-converter

时间戳转换工具

## 功能

- 时间戳 → 日期时间
- 日期时间 → 时间戳

## 安装

```bash
openclaw skill install timestamp-converter
```

## 使用

### 时间戳转日期时间

```bash
openclaw run timestamp-converter to-datetime --timestamp 1709251200
```

输出: `2024-03-01 00:00:00`

### 日期时间转时间戳

```bash
openclaw run timestamp-converter to-timestamp --datetime-str "2024-03-01 00:00:00"
```

输出: `1709251200`

## 参数说明

### to-datetime

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| timestamp | integer | 是 | Unix 时间戳 |

### to-timestamp

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| datetime_str | string | 是 | 日期时间(格式:YYYY-MM-DD HH:MM:SS) |

## 示例

```python
# 在工作流中使用
{
  "skill": "timestamp-converter",
  "command": "to-datetime",
  "params": {
    "timestamp": 1709251200
  }
}
```

## 作者

your-name

## 许可证

MIT
```

---

### 步骤 4:本地测试

```bash
python main.py
```

输出:

```
测试 to-datetime:
{'success': True, 'result': '2024-03-01 00:00:00'}

测试 to-timestamp:
{'success': True, 'result': 1709251200}
```

---

### 步骤 5:打包安装

```bash
# 本地安装
openclaw skill install .

# 或指定路径
openclaw skill install /path/to/timestamp-converter
```

---

## 四、技能发布流程

### 1. 准备发布

确保技能完整:
- ✅ skill.json 配置正确
- ✅ main.py 实现完整
- ✅ README.md 说明清晰
- ✅ 测试通过

---

### 2. 发布到 skills.sh

#### 方式一:通过 CLI 发布

```bash
openclaw skill publish
```

需要先登录:

```bash
openclaw login
```

#### 方式二:提交到 GitHub

1. 创建 GitHub 仓库
2. 推送代码
3. 在 skills.sh 提交技能信息

---

### 3. 技能审核

提交后,官方会审核:
- 代码质量
- 安全性
- 功能完整性

审核通过后,技能会出现在技能市场。

---

### 4. 版本更新

更新版本时:

1. 修改 `skill.json` 中的 `version`
2. 更新代码
3. 重新发布

```bash
openclaw skill publish
```

---

## 五、最佳实践与注意事项

### 代码规范

#### 1. 函数文档

每个函数都应该有清晰的文档:

```python
def process_file(file_path: str, output_dir: str) -> dict:
    """
    处理文件
    
    Args:
        file_path: 输入文件路径
        output_dir: 输出目录
    
    Returns:
        处理结果字典,包含:
        - success: 是否成功
        - output_file: 输出文件路径
        - stats: 处理统计
    
    Raises:
        FileNotFoundError: 文件不存在
        PermissionError: 权限不足
    """
    pass
```

---

#### 2. 错误处理

捕获并返回清晰的错误信息:

```python
try:
    # 业务逻辑
    pass
except FileNotFoundError as e:
    return {
        "success": False,
        "error": f"文件不存在: {e.filename}"
    }
except Exception as e:
    return {
        "success": False,
        "error": f"处理失败: {str(e)}"
    }
```

---

#### 3. 参数验证

验证输入参数:

```python
def execute(command: str, params: dict) -> dict:
    # 验证必需参数
    required_params = ["input", "output"]
    for param in required_params:
        if param not in params:
            return {
                "success": False,
                "error": f"缺少必需参数: {param}"
            }
    
    # 验证参数类型
    if not isinstance(params["input"], str):
        return {
            "success": False,
            "error": "参数 input 必须是字符串"
        }
    
    # 继续处理...
```

---

### 安全注意事项

#### 1. 权限最小化

只申请必要的权限:

```json
{
  "permissions": [
    "file_read"  // 只申请需要的权限
  ]
}
```

#### 2. 路径验证

验证文件路径,防止路径遍历攻击:

```python
import os

def safe_path(base_dir: str, user_path: str) -> str:
    """
    安全地拼接路径
    """
    full_path = os.path.join(base_dir, user_path)
    real_path = os.path.realpath(full_path)
    
    # 确保路径在允许的目录内
    if not real_path.startswith(os.path.realpath(base_dir)):
        raise ValueError("非法路径访问")
    
    return real_path
```

#### 3. 敏感信息保护

不要在代码中硬编码敏感信息:

```python
# ❌ 错误
api_key = "sk-xxxxx"

# ✅ 正确
import os
api_key = os.environ.get("API_KEY")
```

---

### 性能优化

#### 1. 大文件处理

使用流式处理大文件:

```python
def process_large_file(file_path: str):
    """流式处理大文件"""
    with open(file_path, 'r') as f:
        for line in f:
            # 逐行处理
            process_line(line)
```

#### 2. 并发处理

利用并发提高效率:

```python
from concurrent.futures import ThreadPoolExecutor

def batch_process(files: list, max_workers: int = 5):
    """批量并发处理"""
    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        results = executor.map(process_file, files)
    return list(results)
```

---

### 测试

编写单元测试:

```python
# tests/test_main.py

import pytest
from main import execute

def test_to_datetime():
    result = execute("to-datetime", {"timestamp": 1709251200})
    assert result["success"] == True
    assert result["result"] == "2024-03-01 00:00:00"

def test_to_timestamp():
    result = execute("to-timestamp", {"datetime_str": "2024-03-01 00:00:00"})
    assert result["success"] == True
    assert result["result"] == 1709251200

def test_invalid_command():
    result = execute("invalid", {})
    assert result["success"] == False
```

运行测试:

```bash
pytest tests/
```

---

## 小结

这一篇,你学会了:

1. ✅ 技能的本质:配置文件 + 脚本
2. ✅ 搭建开发环境
3. ✅ 从零开发一个简单技能
4. ✅ 技能发布流程
5. ✅ 最佳实践与注意事项

编写技能让你能够扩展 OpenClaw 的能力边界,满足个性化需求。

---

## 下篇预告

下一篇,我们学习 OpenClaw 的进阶配置:性能优化与安全加固。

> **下一篇**:OpenClaw 进阶配置:性能优化与安全加固

---

