# 排错指南:遇到问题怎么办?

> **核心问题**:任务失败了怎么排查?

---

## 问题不可怕,排查有方法

使用 OpenClaw 过程中,难免会遇到问题:
- 任务执行失败
- 结果不符合预期
- 技能报错
- 配置无效

这些问题看似麻烦,但掌握正确的排查方法,就能快速定位和解决。

这一篇,我们系统学习 OpenClaw 的排错技巧。

---

## 一、常见错误类型及原因

### 1. 文件相关错误

#### 错误类型

| 错误信息 | 原因 | 解决方法 |
|---------|------|---------|
| `FileNotFoundError` | 文件不存在 | 检查路径是否正确 |
| `PermissionError` | 权限不足 | 检查文件权限 |
| `FileFormatError` | 格式不支持 | 确认文件格式正确 |
| `FileLockedError` | 文件被占用 | 关闭占用文件的程序 |

---

#### 案例:文件不存在

**错误信息**:

```
[ERROR] FileNotFoundError: ~/Documents/report.pdf
文件不存在,请检查路径是否正确
```

**排查步骤**:

1. 检查路径是否正确:

```bash
ls ~/Documents/report.pdf
```

2. 检查是否拼写错误:

```bash
ls ~/Documents/ | grep report
```

3. 检查是否使用了相对路径:

```bash
pwd  # 查看当前目录
```

**解决方法**:

使用绝对路径:

```bash
openclaw run pdf extract --input /Users/yourname/Documents/report.pdf
```

---

### 2. 权限相关错误

#### 错误类型

| 错误信息 | 原因 | 解决方法 |
|---------|------|---------|
| `PermissionDenied` | 无访问权限 | 添加目录到权限列表 |
| `SkillNotAuthorized` | 技能未授权 | 检查技能权限配置 |
| `CommandNotAllowed` | 命令执行被禁止 | 开放命令执行权限 |

---

#### 案例:权限不足

**错误信息**:

```
[ERROR] PermissionDenied: 技能 pdf 无权访问 ~/Desktop/
```

**排查步骤**:

1. 查看技能权限:

```bash
openclaw skill permissions pdf
```

输出:

```
技能: pdf
─────────────────────────────
权限列表:
  ✓ 文件读取:~/Documents
  ✗ 文件读取:~/Desktop (未授权)
```

2. 添加权限:

```bash
openclaw skill grant pdf --permission file_read --path ~/Desktop
```

或编辑配置文件 `~/.openclaw/config.json`:

```json
{
  "permissions": {
    "file_access": ["~/Documents", "~/Desktop"]
  }
}
```

---

### 3. 技能相关错误

#### 错误类型

| 错误信息 | 原因 | 解决方法 |
|---------|------|---------|
| `SkillNotFoundError` | 技能未安装 | 安装对应技能 |
| `SkillVersionError` | 技能版本不兼容 | 更新或降级技能 |
| `SkillDependencyError` | 依赖包缺失 | 安装依赖 |
| `SkillExecutionError` | 技能执行失败 | 查看详细日志 |

---

#### 案例:技能未安装

**错误信息**:

```
[ERROR] SkillNotFoundError: 技能 xlsx 未安装
请运行: openclaw skill install xlsx
```

**解决方法**:

```bash
openclaw skill install xlsx
```

---

#### 案例:依赖包缺失

**错误信息**:

```
[ERROR] SkillDependencyError: pdf 技能缺少依赖包 pdfplumber
请运行: pip install pdfplumber
```

**解决方法**:

```bash
pip install pdfplumber

# 或重新安装技能
openclaw skill reinstall pdf
```

---

### 4. 配置相关错误

#### 错误类型

| 错误信息 | 原因 | 解决方法 |
|---------|------|---------|
| `ConfigSyntaxError` | JSON 格式错误 | 检查 JSON 语法 |
| `ConfigFieldError` | 字段名错误 | 对照文档修正 |
| `ConfigValueError` | 字段值错误 | 修正配置值 |

---

#### 案例:JSON 格式错误

**错误信息**:

```
[ERROR] ConfigSyntaxError: ~/.openclaw/config.json
第 15 行:缺少逗号
```

**排查方法**:

1. 使用 JSON 验证工具检查语法
2. 查看错误提示的具体行号
3. 对比配置模板修正

**常见 JSON 错误**:

```json
{
  "skills": [
    {
      "name": "pdf"  // ❌ 缺少逗号
      "version": "latest"
    }
  ]
}
```

修正:

```json
{
  "skills": [
    {
      "name": "pdf",  // ✅ 添加逗号
      "version": "latest"
    }
  ]
}
```

---

### 5. 网络相关错误

#### 错误类型

| 错误信息 | 原因 | 解决方法 |
|---------|------|---------|
| `NetworkError` | 网络连接失败 | 检查网络设置 |
| `APIError` | API 调用失败 | 检查 API Key 和额度 |
| `TimeoutError` | 请求超时 | 增加超时时间 |

---

#### 案例:API 调用失败

**错误信息**:

```
[ERROR] APIError: OpenAI API 调用失败
状态码: 401 Unauthorized
原因: API Key 无效
```

**排查步骤**:

1. 检查 API Key 是否正确:

```bash
openclaw config show model.api_key
```

2. 验证 API Key:

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer YOUR_API_KEY"
```

3. 检查 API 额度:

登录 OpenAI 平台查看余额和使用情况。

**解决方法**:

更新 API Key:

```bash
openclaw config set model.api_key "sk-新的key"
```

---

## 二、日志查看技巧:快速定位问题

### 日志位置

OpenClaw 的日志文件位于:

```
~/.openclaw/logs/
├── openclaw.log      # 主日志
├── tasks.log         # 任务日志
├── skills.log        # 技能日志
└── errors.log        # 错误日志
```

---

### 查看实时日志

```bash
openclaw logs follow
```

实时显示任务执行过程,适合调试时使用。

---

### 查看历史日志

#### 查看最近日志

```bash
# 最近 50 行
openclaw logs show --lines 50

# 最近 1 小时
openclaw logs show --since "1 hour ago"
```

---

#### 按级别过滤

```bash
# 只看错误
openclaw logs show --level ERROR

# 只看警告和错误
openclaw logs show --level WARNING
```

---

#### 按关键词搜索

```bash
# 搜索包含 "pdf" 的日志
openclaw logs search "pdf"

# 搜索特定任务的日志
openclaw logs search "task_id:12345"
```

---

### 日志分析技巧

#### 1. 查看任务失败详情

```bash
openclaw task show <task_id> --verbose
```

输出:

```
任务 #12345
─────────────────────────────
时间: 2026-03-11 14:30:15
技能: pdf
操作: extract
输入: ~/Documents/report.pdf
状态: 失败 ❌

错误详情:
  [ERROR] 14:30:18 - pdf.extract
  FileNotFoundError: 文件不存在
  路径: ~/Documents/report.pdf
  提示: 请检查文件路径是否正确

建议操作:
  1. 确认文件存在: ls ~/Documents/report.pdf
  2. 使用绝对路径
  3. 检查当前工作目录: pwd
```

---

#### 2. 导出日志用于分析

```bash
openclaw logs export --output logs_20260311.json
```

导出为结构化 JSON,方便进一步分析。

---

## 三、技能冲突排查:多个技能互相干扰

### 冲突场景

当安装多个技能时,可能出现:

| 冲突类型 | 表现 | 原因 |
|---------|------|------|
| 依赖冲突 | 技能无法加载 | 不同技能依赖不同版本的同一包 |
| 功能冲突 | 结果不符合预期 | 多个技能处理同一文件类型 |
| 资源冲突 | 性能下降 | 多个技能同时占用大量资源 |

---

### 案例:依赖冲突

**场景**:技能 A 需要 `pandas==1.5.0`,技能 B 需要 `pandas==2.0.0`

**错误信息**:

```
[ERROR] SkillDependencyError: 技能 xlsx 和 pdf 存在依赖冲突
pandas 版本不兼容:
  - xlsx 要求: >= 2.0.0
  - pdf 要求: < 2.0.0
```

**解决方法**:

1. 更新技能到最新版本(可能已修复):

```bash
openclaw skill update --all
```

2. 使用虚拟环境隔离:

```bash
# 为技能创建独立环境
openclaw skill install xlsx --isolated
```

3. 联系技能开发者反馈问题。

---

### 案例:功能冲突

**场景**:安装了多个处理 PDF 的技能,不知道实际用的是哪个。

**排查方法**:

1. 查看技能优先级:

```bash
openclaw skill priority
```

输出:

```
PDF 文件处理优先级:
  1. pdf (v1.2.0) - 官方技能
  2. pdf-plus (v0.9.0) - 社区技能
```

2. 调整优先级:

```bash
openclaw skill set-priority pdf --top
```

3. 或禁用不需要的技能:

```bash
openclaw skill disable pdf-plus
```

---

## 四、权限问题排查:技能"没权限"怎么办

### 常见权限问题

| 问题 | 表现 | 解决方法 |
|------|------|---------|
| 文件访问权限 | 无法读取/写入文件 | 添加目录到权限列表 |
| 网络访问权限 | 无法联网 | 开启网络权限 |
| 命令执行权限 | 无法执行 shell 命令 | 开启命令执行权限(谨慎) |

---

### 排查流程

#### 步骤 1:查看技能权限

```bash
openclaw skill permissions <skill_name>
```

输出:

```
技能: browser
─────────────────────────────
权限列表:
  ✓ 文件读取: ~/Downloads
  ✗ 文件写入: 未授权
  ✓ 网络访问: 所有网站
  ✗ 命令执行: 未授权
```

---

#### 步骤 2:授予权限

```bash
# 授予文件写入权限
openclaw skill grant browser --permission file_write --path ~/Downloads

# 授予网络访问权限
openclaw skill grant browser --permission network_access
```

---

#### 步骤 3:验证权限

```bash
openclaw skill permissions browser
```

确认权限已更新。

---

### 安全建议

> ⚠️ **权限最小化原则**:
> 只授予技能必需的权限,避免过度授权。

- ❌ 不要:授予所有目录的完全访问权限
- ✅ 应该:只授予特定目录的特定权限

- ❌ 不要:随意开启命令执行权限
- ✅ 应该:只在必要时开启,并限制命令范围

---

## 五、向社区求助的正确姿势

### 什么时候需要求助?

- 官方文档没有相关说明
- 常见错误排查方法无效
- 怀疑是 Bug
- 需要功能建议

---

### 求助渠道

| 渠道 | 适用场景 | 链接 |
|------|---------|------|
| GitHub Issues | Bug 报告、功能建议 | github.com/openclaw/openclaw/issues |
| 社区论坛 | 使用问题、经验分享 | community.openclaw.ai |
| Discord/微信群 | 实时交流 | 官网获取邀请链接 |

---

### 如何提问?

#### ❌ 错误的提问方式

```
标题:求助,OpenClaw 不工作了

内容:
OpenClaw 出错了,怎么办?
```

**问题**:信息太少,无法定位问题。

---

#### ✅ 正确的提问方式

```
标题:[pdf 技能] 提取 PDF 文字时报 FileNotFoundError

环境信息:
- OpenClaw 版本: 1.2.0
- 操作系统: macOS 13.0
- Python 版本: 3.10.0

问题描述:
使用 pdf 技能提取 PDF 文字时,报文件不存在错误。

复现步骤:
1. 安装 pdf 技能: openclaw skill install pdf
2. 执行命令: openclaw run pdf extract --input ~/Documents/report.pdf
3. 报错

错误日志:
[ERROR] FileNotFoundError: ~/Documents/report.pdf
文件不存在,请检查路径是否正确

已尝试的解决方法:
1. 确认文件存在: ls ~/Documents/report.pdf (文件存在)
2. 使用绝对路径: 同样报错
3. 检查权限: pdf 技能已有 ~/Documents 读取权限

附件:
- 配置文件: config.json
- 完整日志: openclaw.log
```

**优点**:
- 信息完整
- 有复现步骤
- 已尝试的方法
- 有日志和配置

---

### 提问模板

```
标题:[技能名] 简短描述问题

环境信息:
- OpenClaw 版本:
- 操作系统:
- Python 版本:

问题描述:
(详细描述问题现象)

复现步骤:
1. 
2. 
3. 

错误日志:
(粘贴相关日志)

已尝试的解决方法:
1. 
2. 

附件:
(如有必要,附上配置文件、日志等)
```

---

## 小结

这一篇,你学会了:

1. ✅ 常见错误类型及原因分析
2. ✅ 日志查看技巧,快速定位问题
3. ✅ 技能冲突排查方法
4. ✅ 权限问题排查流程
5. ✅ 向社区求助的正确姿势

遇到问题不要慌,按照这篇指南逐步排查,大部分问题都能解决。

---

## 下篇预告

进阶篇到此结束,下一篇我们进入实战篇,通过完整案例展示 OpenClaw 的实际应用价值。

> **下一篇**:实战案例 1—— 自动化周报生成系统

---

*系列教程第 12 篇*
*阅读时长:8-10 分钟*
