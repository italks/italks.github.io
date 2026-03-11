# 实战案例 1—— 自动化周报生成系统

> **场景**:每周需要汇总团队工作,生成周报 PPT

---

## 场景背景

### 传统流程

每周五下午,你需要:

1. 收集 5 位团队成员的周报文档(Word/PDF)
2. 提取关键信息:本周完成、下周计划、遇到问题
3. 整理到 Excel 汇总表
4. 根据汇总数据制作 PPT
5. 检查格式、调整排版
6. 发送给领导

**耗时**:约 2-3 小时

**痛点**:
- 重复性高,每周都要做
- 容易出错,数据可能遗漏
- 格式调整繁琐

---

### 自动化目标

用 OpenClaw 实现:

1. 自动收集和解析周报文档
2. 自动提取和整理关键信息
3. 自动生成汇总表和 PPT
4. 定时执行,无人值守

**预期耗时**:自动化后仅需 5 分钟检查

---

## 一、需求分析:周报的数据来源和格式要求

### 数据来源

**团队成员提交的周报**(Word 格式):

```
周报模板

姓名:张三
日期:2026-03-11

一、本周完成工作
1. 完成功能 A 开发
2. 修复 Bug #123
3. 参与代码评审 2 次

二、下周工作计划
1. 开始功能 B 开发
2. 编写测试用例

三、遇到的问题
暂无

四、工时统计
项目 A: 20 小时
项目 B: 20 小时
```

---

### 格式要求

**汇总 Excel**:

| 姓名 | 本周完成 | 下周计划 | 问题 | 总工时 |
|------|---------|---------|------|--------|
| 张三 | 功能A开发、Bug修复 | 功能B开发 | 无 | 40h |
| 李四 | 文档编写 | 测试准备 | 环境不稳定 | 40h |

**周报 PPT**:

```
第 1 页:封面 - XX 团队周报(2026-03-11)
第 2 页:本周工作概览
第 3 页:详细完成情况
第 4 页:下周计划
第 5 页:问题与风险
第 6 页:工时统计图表
```

---

## 二、技能选择:xlsx + docx + pptx

本案例需要三个技能:

| 技能 | 用途 | 关键操作 |
|------|------|---------|
| docx | 读取周报文档 | 批量读取、内容解析 |
| xlsx | 生成汇总表 | 数据整理、统计计算 |
| pptx | 生成 PPT | 模板填充、图表生成 |

安装技能:

```bash
openclaw skill install docx xlsx pptx
```

---

## 三、工作流设计:数据收集 → 整理 → 生成

### 整体流程

```
[输入] 团队成员周报文档(5个Word文件)
   ↓
[步骤1] docx:批量读取周报内容
   ↓
[步骤2] 自定义:解析提取关键信息
   ↓
[步骤3] xlsx:生成汇总表
   ↓
[步骤4] xlsx:计算统计数据
   ↓
[步骤5] pptx:生成周报PPT
   ↓
[输出] 周报汇总.xlsx + 团队周报.pptx
```

---

### 详细步骤

#### 步骤 1:批量读取周报

- 技能:`docx`
- 操作:批量读取指定目录下的所有 Word 文档
- 输入:`./weekly_reports/*.docx`
- 输出:文本内容列表

---

#### 步骤 2:解析提取信息

- 技能:内置 LLM(或自定义脚本)
- 操作:从文本中提取结构化信息
- 输入:步骤 1 的文本列表
- 输出:结构化数据(JSON)

---

#### 步骤 3:生成汇总表

- 技能:`xlsx`
- 操作:创建 Excel 汇总表
- 输入:步骤 2 的结构化数据
- 输出:`周报汇总.xlsx`

---

#### 步骤 4:计算统计数据

- 技能:`xlsx`
- 操作:计算总工时、问题数量等
- 输入:`周报汇总.xlsx`
- 输出:更新后的汇总表 + 统计数据

---

#### 步骤 5:生成 PPT

- 技能:`pptx`
- 操作:根据模板和汇总数据生成 PPT
- 输入:模板 + 汇总数据
- 输出:`团队周报.pptx`

---

## 四、完整配置文件示例

创建工作流配置 `weekly_report_workflow.json`:

```json
{
  "name": "周报自动生成",
  "description": "自动收集团队周报,生成汇总表和PPT",
  "version": "1.0",
  "trigger": {
    "type": "manual"
  },
  "inputs": {
    "report_dir": "./weekly_reports/",
    "date": "2026-03-11",
    "team_name": "产品研发组"
  },
  "steps": [
    {
      "id": "step1_read_reports",
      "name": "读取周报文档",
      "skill": "docx",
      "command": "batch-read",
      "params": {
        "input_dir": "{{inputs.report_dir}}",
        "file_pattern": "*.docx"
      },
      "output": "raw_reports"
    },
    {
      "id": "step2_parse_reports",
      "name": "解析周报内容",
      "skill": "llm",
      "command": "extract",
      "params": {
        "input": "{{raw_reports}}",
        "schema": {
          "name": "姓名",
          "completed": "本周完成的工作(列表)",
          "planned": "下周工作计划(列表)",
          "issues": "遇到的问题",
          "hours": "工时统计(数字)"
        },
        "output_format": "json"
      },
      "output": "parsed_data"
    },
    {
      "id": "step3_create_excel",
      "name": "生成汇总表",
      "skill": "xlsx",
      "command": "create",
      "params": {
        "data": "{{parsed_data}}",
        "columns": ["姓名", "本周完成", "下周计划", "问题", "工时"],
        "format": {
          "header_bold": true,
          "auto_width": true
        }
      },
      "output": "temp_summary.xlsx"
    },
    {
      "id": "step4_calculate_stats",
      "name": "计算统计数据",
      "skill": "xlsx",
      "command": "calculate",
      "params": {
        "input": "{{temp_summary}}",
        "formulas": [
          {
            "name": "总工时",
            "formula": "SUM(E2:E100)"
          },
          {
            "name": "平均工时",
            "formula": "AVERAGE(E2:E100)"
          },
          {
            "name": "问题数量",
            "formula": "COUNTIF(D2:D100,\"<>无\")"
          }
        ]
      },
      "output": "周报汇总.xlsx"
    },
    {
      "id": "step5_create_chart",
      "name": "生成工时图表",
      "skill": "xlsx",
      "command": "chart",
      "params": {
        "input": "周报汇总.xlsx",
        "type": "bar",
        "x_column": "姓名",
        "y_column": "工时",
        "title": "本周工时分布"
      },
      "output": "hours_chart.xlsx"
    },
    {
      "id": "step6_generate_ppt",
      "name": "生成周报PPT",
      "skill": "pptx",
      "command": "generate",
      "params": {
        "template": "./templates/weekly_report_template.pptx",
        "data": {
          "date": "{{inputs.date}}",
          "team_name": "{{inputs.team_name}}",
          "total_hours": "{{step4.stats.总工时}}",
          "issue_count": "{{step4.stats.问题数量}}",
          "summary_data": "周报汇总.xlsx",
          "chart_file": "hours_chart.xlsx"
        }
      },
      "output": "团队周报_{{inputs.date}}.pptx"
    }
  ],
  "outputs": {
    "excel": "周报汇总.xlsx",
    "ppt": "团队周报_{{inputs.date}}.pptx"
  },
  "on_success": {
    "notify": {
      "type": "email",
      "to": "leader@company.com",
      "subject": "周报已生成 - {{inputs.date}}",
      "body": "本周报汇总已完成,请查收附件。",
      "attachments": ["周报汇总.xlsx", "团队周报_{{inputs.date}}.pptx"]
    }
  },
  "on_failure": {
    "notify": {
      "type": "email",
      "to": "admin@company.com",
      "subject": "周报生成失败",
      "body": "周报自动生成失败,请检查日志。"
    }
  }
}
```

---

## 五、效果展示与优化建议

### 执行工作流

```bash
openclaw workflow run weekly_report_workflow.json
```

输出:

```
执行工作流:周报自动生成
─────────────────────────────
[1/6] 读取周报文档...
      ✓ 已读取 5 份周报文档

[2/6] 解析周报内容...
      ✓ 已解析 5 位成员信息

[3/6] 生成汇总表...
      ✓ 已创建 周报汇总.xlsx

[4/6] 计算统计数据...
      总工时: 200h
      平均工时: 40h
      问题数量: 2

[5/6] 生成工时图表...
      ✓ 已生成柱状图

[6/6] 生成周报PPT...
      ✓ 已生成 团队周报_2026-03-11.pptx

─────────────────────────────
✓ 工作流执行成功!

输出文件:
  - 周报汇总.xlsx
  - 团队周报_2026-03-11.pptx

邮件通知已发送至: leader@company.com
```

---

### 生成结果

#### Excel 汇总表

| 姓名 | 本周完成 | 下周计划 | 问题 | 工时 |
|------|---------|---------|------|------|
| 张三 | 功能A开发、Bug修复 | 功能B开发 | 无 | 40h |
| 李四 | 文档编写、测试 | 功能B测试 | 环境不稳定 | 40h |
| 王五 | 需求分析 | 需求评审 | 无 | 40h |
| 赵六 | 前端开发 | 联调测试 | 无 | 40h |
| 钱七 | 后端开发 | 接口对接 | 跨部门协作困难 | 40h |

**统计**:
- 总工时:200h
- 平均工时:40h
- 问题数量:2

---

#### PPT 周报

**第 1 页:封面**

```
产品研发组周报
2026-03-11
```

**第 2 页:工作概览**

```
本周概览
───────────────
团队成员: 5 人
总工时: 200 小时
完成任务: 15 项
遇到问题: 2 个
```

**第 3 页:详细完成情况**

```
本周完成工作
───────────────
• 张三:功能A开发、Bug修复
• 李四:文档编写、测试
• 王五:需求分析
• 赵六:前端开发
• 钱七:后端开发
```

**第 4 页:下周计划**

```
下周工作计划
───────────────
• 功能B开发和测试
• 需求评审
• 联调测试
• 接口对接
```

**第 5 页:问题与风险**

```
问题与风险
───────────────
1. 环境不稳定(李四)
   - 建议:协调运维团队解决

2. 跨部门协作困难(钱七)
   - 建议:安排协调会议
```

**第 6 页:工时统计**

```
本周工时分布
[柱状图显示每人工时]
```

---

### 优化建议

#### 1. 定时自动执行

```bash
openclaw workflow schedule weekly_report_workflow.json \
  --cron "0 17 * * 5"  # 每周五17:00执行
```

#### 2. 集成数据源

将团队成员的周报收集自动化:
- 对接企业微信/钉钉,自动收集周报
- 或对接 Jira/Trello,自动提取任务信息

#### 3. 历史数据对比

添加历史周报对比功能:
- 工时趋势图
- 问题数量变化
- 任务完成率统计

#### 4. 异常检测

自动识别异常情况:
- 工时异常(过低或过高)
- 连续多周有未解决问题
- 任务延期风险

---

### 进阶功能

#### 多团队支持

如果需要管理多个团队的周报:

```json
{
  "teams": [
    {
      "name": "产品研发组",
      "report_dir": "./reports/team_a/"
    },
    {
      "name": "市场运营组",
      "report_dir": "./reports/team_b/"
    }
  ]
}
```

执行:

```bash
openclaw workflow run weekly_report_workflow.json --team all
```

#### 权限管理

不同角色的访问权限:
- 团队成员:只能提交自己的周报
- 组长:查看本组汇总
- 领导:查看所有团队汇总

---

## 小结

本案例展示了如何用 OpenClaw 实现完整的周报自动化系统:

1. ✅ 自动收集和解析周报文档
2. ✅ 生成结构化汇总表
3. ✅ 自动制作 PPT 报告
4. ✅ 定时执行,无人值守
5. ✅ 自动通知相关人员

通过这个案例,你可以看到 OpenClaw 在实际工作场景中的强大能力。

---

## 下篇预告

下一篇,我们学习另一个实战案例:批量处理客户合同 PDF。

> **下一篇**:实战案例 2—— 客户资料批量处理

---

*系列教程第 13 篇*
*阅读时长:15-20 分钟*
