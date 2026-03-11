# OpenClaw 与其他工具的集成

> **核心问题**:如何融入现有工作流?

---

## 不孤单的工具

OpenClaw 不是孤立的工具,它可以与各种现有工具和服务集成:

- 与 ChatGPT/Claude 协作
- 与企业微信/钉钉联动
- 与现有系统集成
- 与云服务结合

这一篇,我们探索 OpenClaw 的集成能力。

---

## 一、与 ChatGPT/Claude 协作:脑力活 + 执行活

### 分工理念

**ChatGPT/Claude**:擅长思考、分析、创意
**OpenClaw**:擅长执行、处理、操作

**最佳实践**:

```
ChatGPT (思考) → 提供方案 → OpenClaw (执行) → 完成任务
```

---

### 场景 1:方案设计 + 自动执行

**示例:设计自动化工作流**

**步骤 1**:用 ChatGPT 设计方案

```
用户:我需要每周自动生成销售周报,数据来源是 Excel,输出是 PPT,帮我设计一个自动化方案

ChatGPT:
好的,我为你设计一个自动化方案:

1. 数据收集层
   - 定期从销售系统导出 Excel
   - 存储到指定目录

2. 数据处理层
   - 使用 xlsx 技能读取数据
   - 计算汇总指标
   - 生成图表

3. 报告生成层
   - 使用 pptx 技能生成 PPT
   - 填充数据和图表
   - 应用企业模板

4. 分发层
   - 自动发送邮件
   - 或推送到企业微信

配置文件示例:
[提供 JSON 配置]
```

---

**步骤 2**:用 OpenClaw 实现

```bash
# 保存 ChatGPT 提供的配置
# 执行工作流
openclaw workflow run weekly_sales_report.json
```

---

### 场景 2:问题诊断 + 自动修复

**示例:PDF 提取失败**

**步骤 1**:向 ChatGPT 描述问题

```
用户:OpenClaw 提取 PDF 时失败,错误信息是:
[ERROR] PDFDecodeError: 文件加密或损坏

ChatGPT:
这个错误通常有以下原因:
1. PDF 有密码保护
2. PDF 文件损坏
3. PDF 格式特殊

解决方法:
1. 如果有密码,使用 --password 参数
2. 尝试用其他工具打开确认文件完整性
3. 使用 OCR 模式处理扫描件

OpenClaw 命令:
openclaw run pdf extract --input file.pdf --password "your_password"
或
openclaw run pdf extract --input file.pdf --ocr
```

---

**步骤 2**:执行建议

```bash
# 尝试 ChatGPT 建议的方案
openclaw run pdf extract --input file.pdf --ocr
```

---

### 集成方式

#### 方式 1:手动切换

- 遇到思考类问题 → 用 ChatGPT
- 遇到执行类问题 → 用 OpenClaw

---

#### 方式 2:配置 ChatGPT 为 OpenClaw 的"大脑"

在 OpenClaw 配置中启用 ChatGPT 辅助:

```json
{
  "assistant": {
    "enabled": true,
    "provider": "openai",
    "model": "gpt-4",
    "mode": "planning"
  }
}
```

**效果**:

```
用户:帮我整理这 100 个 PDF 文件

OpenClaw: 正在规划任务...
[调用 GPT-4 分析任务]

任务规划:
1. 扫描所有 PDF 文件
2. 提取每个 PDF 的元数据
3. 根据内容分类
4. 移动到对应目录

开始执行...
```

---

## 二、与企业微信/钉钉联动:消息通知

### 场景:任务完成自动通知

当 OpenClaw 完成任务后,自动发送通知到企业微信或钉钉。

---

### 企业微信集成

#### 步骤 1:创建企业微信机器人

1. 在企业微信群中添加机器人
2. 获取 Webhook URL

---

#### 步骤 2:配置通知

```json
{
  "notifications": {
    "wechat_work": {
      "webhook": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx"
    }
  }
}
```

---

#### 步骤 3:在工作流中使用

```json
{
  "on_success": {
    "notify": {
      "type": "wechat_work",
      "message": {
        "msgtype": "markdown",
        "markdown": {
          "content": "## 任务完成通知\n\n**任务**: {{workflow_name}}\n**状态**: 成功\n**耗时**: {{duration}}\n**时间**: {{timestamp}}"
        }
      }
    }
  }
}
```

---

#### 效果

企业微信收到消息:

```
任务完成通知

任务: 周报自动生成
状态: 成功
耗时: 5 分 23 秒
时间: 2026-03-11 17:05:23

附件:
- 周报汇总.xlsx
- 团队周报.pptx
```

---

### 钉钉集成

类似企业微信,使用钉钉机器人 Webhook:

```json
{
  "notifications": {
    "dingtalk": {
      "webhook": "https://oapi.dingtalk.com/robot/send?access_token=xxx",
      "secret": "your_secret"
    }
  }
}
```

---

## 三、与现有系统集成:API 调用

### OpenClaw API

OpenClaw 提供 REST API,方便与其他系统集成。

#### 启动 API 服务

```bash
openclaw api start --port 8080
```

---

#### API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/tasks` | POST | 创建任务 |
| `/api/tasks/{id}` | GET | 查询任务状态 |
| `/api/skills` | GET | 获取技能列表 |
| `/api/workflows` | POST | 执行工作流 |

---

#### 示例:创建任务

```bash
curl -X POST http://localhost:8080/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "skill": "pdf",
    "command": "extract",
    "params": {
      "input": "/path/to/file.pdf",
      "output": "/path/to/output.txt"
    }
  }'
```

响应:

```json
{
  "task_id": "task_12345",
  "status": "pending",
  "created_at": "2026-03-11T10:00:00Z"
}
```

---

#### 查询任务状态

```bash
curl http://localhost:8080/api/tasks/task_12345
```

响应:

```json
{
  "task_id": "task_12345",
  "status": "completed",
  "result": {
    "output_file": "/path/to/output.txt",
    "pages": 15,
    "chars": 12500
  },
  "duration": 2.3,
  "completed_at": "2026-03-11T10:00:02Z"
}
```

---

### 从其他系统调用

#### Python 示例

```python
import requests

def run_openclaw_task(skill, command, params):
    response = requests.post(
        "http://localhost:8080/api/tasks",
        json={
            "skill": skill,
            "command": command,
            "params": params
        }
    )
    return response.json()

# 调用
result = run_openclaw_task(
    skill="pdf",
    command="extract",
    params={
        "input": "report.pdf",
        "output": "report.txt"
    }
)
print(result)
```

---

#### JavaScript 示例

```javascript
async function runOpenClawTask(skill, command, params) {
  const response = await fetch('http://localhost:8080/api/tasks', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      skill: skill,
      command: command,
      params: params
    })
  });
  return await response.json();
}

// 调用
const result = await runOpenClawTask('pdf', 'extract', {
  input: 'report.pdf',
  output: 'report.txt'
});
console.log(result);
```

---

## 四、与云服务结合:存储、计算

### 云存储集成

#### 阿里云 OSS

```json
{
  "storage": {
    "type": "oss",
    "config": {
      "access_key_id": "{{env.OSS_ACCESS_KEY_ID}}",
      "access_key_secret": "{{env.OSS_ACCESS_KEY_SECRET}}",
      "bucket": "my-bucket",
      "endpoint": "oss-cn-hangzhou.aliyuncs.com"
    }
  }
}
```

使用:

```bash
# 上传文件到 OSS
openclaw storage upload report.pdf --path reports/

# 从 OSS 下载文件
openclaw storage download reports/report.pdf
```

---

#### AWS S3

```json
{
  "storage": {
    "type": "s3",
    "config": {
      "access_key": "{{env.AWS_ACCESS_KEY}}",
      "secret_key": "{{env.AWS_SECRET_KEY}}",
      "bucket": "my-bucket",
      "region": "us-east-1"
    }
  }
}
```

---

### 云函数集成

#### 阿里云函数计算

将 OpenClaw 任务部署为云函数:

```yaml
# template.yaml
ROSTemplateFormatVersion: '2015-09-01'
Transform: 'Aliyun::Serverless-2018-04-03'
Resources:
  OpenClawFunction:
    Type: 'Aliyun::Serverless::Function'
    Properties:
      Handler: index.handler
      Runtime: python3.9
      CodeUri: ./
      MemorySize: 512
      Timeout: 300
```

---

#### AWS Lambda

```yaml
# serverless.yml
service: openclaw-lambda

provider:
  name: aws
  runtime: python3.9
  memorySize: 512
  timeout: 300

functions:
  process:
    handler: handler.process
    events:
      - http:
          path: process
          method: post
```

---

## 五、集成案例分享

### 案例 1:OpenClaw + Zapier

**场景**:当收到新邮件时,自动用 OpenClaw 处理附件。

#### 步骤 1:配置 Zapier 触发器

- 触发器:新邮件到达
- 条件:有附件

---

#### 步骤 2:调用 OpenClaw API

```json
{
  "url": "https://your-openclaw-api.com/api/tasks",
  "method": "POST",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "skill": "pdf",
    "command": "extract",
    "params": {
      "input": "{{attachment_url}}",
      "output": "{{output_path}}"
    }
  }
}
```

---

### 案例 2:OpenClaw + Jenkins

**场景**:在 CI/CD 流程中使用 OpenClaw 生成文档。

#### Jenkinsfile

```groovy
pipeline {
    agent any
    
    stages {
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Generate Docs') {
            steps {
                sh '''
                    openclaw run pptx create \
                        --outline docs/outline.md \
                        --output docs/presentation.pptx
                '''
            }
        }
        
        stage('Archive') {
            steps {
                archiveArtifacts 'docs/presentation.pptx'
            }
        }
    }
}
```

---

### 案例 3:OpenClaw + GitLab CI

**场景**:自动生成项目周报。

#### .gitlab-ci.yml

```yaml
stages:
  - report

weekly_report:
  stage: report
  only:
    - schedules
  script:
    - openclaw workflow run weekly_report.json
  artifacts:
    paths:
      - reports/
    expire_in: 1 week
```

配置定时任务:

```bash
# GitLab CI/CD Schedules
# 每周五 17:00 执行
Cron: 0 17 * * 5
```

---

## 小结

这一篇,你学会了:

1. ✅ 与 ChatGPT/Claude 协作:脑力活 + 执行活
2. ✅ 与企业微信/钉钉联动:消息通知
3. ✅ 与现有系统集成:API 调用
4. ✅ 与云服务结合:存储、计算
5. ✅ 集成案例分享

OpenClaw 的集成能力让它能够融入各种工作流,发挥更大的价值。

---

## 系列教程总结

恭喜你完成了 OpenClaw 系列教程的全部 19 篇!

**你学到了**:

**入门篇(第 1-3 篇)**:
- OpenClaw 是什么
- 能解决什么问题
- 与其他工具的区别

**基础篇(第 4-7 篇)**:
- 安装和配置
- 第一个任务
- 技能市场探索
- 界面功能解读

**进阶篇(第 8-12 篇)**:
- 文档处理
- PPT 自动化
- 浏览器自动化
- 技能组合
- 问题排查

**实战篇(第 13-16 篇)**:
- 周报自动化
- 合同批量处理
- 竞品监控
- 知识库整理

**高级篇(第 17-19 篇)**:
- 技能开发
- 性能与安全
- 工具集成

---

## 下一步建议

1. **实践**:选择一个真实场景,动手实现
2. **深入**:阅读官方文档,了解更多细节
3. **贡献**:开发技能,分享给社区
4. **反馈**:遇到问题,向社区反馈

---

## 附录:常用资源

- 官网:https://openclaw.ai
- 文档:https://docs.openclaw.ai
- 技能市场:https://skills.sh
- 社区:https://community.openclaw.ai
- GitHub:https://github.com/openclaw

---

感谢你的学习,祝你在 OpenClaw 的使用中取得成功!

---

*系列教程第 19 篇(完结篇)*
*阅读时长:12-15 分钟*
