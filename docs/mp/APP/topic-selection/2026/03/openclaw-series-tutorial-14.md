# 实战案例 2—— 客户资料批量处理

> **场景**:每周处理上百份客户合同 PDF,提取关键信息

---

## 场景背景

### 业务痛点

某公司法务部门每周需要处理大量客户合同:

- **数量**:每周约 100-150 份 PDF 合同
- **内容**:合同编号、甲方、乙方、金额、签订日期、有效期等
- **流程**:人工阅读 → 手动录入 Excel → 汇总统计
- **耗时**:每份合同约 3-5 分钟,总计 5-8 小时/周

**痛点**:
- 重复劳动,枯燥易出错
- 人工录入容易遗漏或错误
- 效率低下,占用大量时间

---

### 自动化目标

用 OpenClaw 实现:

1. 批量读取合同 PDF
2. 自动提取关键信息
3. 结构化存储到 Excel
4. 数据校验和异常识别
5. 生成处理报告

**预期耗时**:自动化后仅需 10-15 分钟监控

---

## 一、需求分析:需要提取哪些字段

### 合同结构分析

典型的合同 PDF 包含:

```
合同编号:HT-2026-001

甲方:XX科技有限公司
乙方:YY商贸有限公司

根据《中华人民共和国合同法》...

一、合同金额
本合同总金额为人民币伍拾万元整(¥500,000)

二、签订日期
本合同于2026年3月11日签订

三、有效期
本合同有效期为一年,自签订之日起生效

...
```

---

### 需提取字段

| 字段 | 说明 | 示例 | 重要性 |
|------|------|------|--------|
| 合同编号 | 唯一标识 | HT-2026-001 | 必填 |
| 甲方 | 签约方 1 | XX科技有限公司 | 必填 |
| 乙方 | 签约方 2 | YY商贸有限公司 | 必填 |
| 金额 | 合同金额 | 500,000 | 必填 |
| 签订日期 | 生效日期 | 2026-03-11 | 必填 |
| 有效期 | 有效期限 | 1年 | 选填 |
| 合同类型 | 采购/销售/服务 | 采购合同 | 选填 |
| 备注 | 其他说明 | ... | 选填 |

---

### 数据质量要求

- **准确性**:提取信息准确率 > 95%
- **完整性**:必填字段不能缺失
- **一致性**:日期、金额格式统一
- **可追溯**:记录来源文件和处理时间

---

## 二、技能选择:pdf + xlsx

本案例主要使用两个技能:

| 技能 | 用途 | 关键操作 |
|------|------|---------|
| pdf | 提取合同内容 | 批量提取文字、表格 |
| xlsx | 存储和管理数据 | 创建数据库、校验数据 |

额外需要 LLM 能力用于智能提取。

安装技能:

```bash
openclaw skill install pdf xlsx
```

---

## 三、批量处理技巧:循环与并发

### 处理模式

对于大量文件,OpenClaw 支持两种模式:

#### 模式 1:顺序处理

```
文件1 → 处理 → 完成
            ↓
文件2 → 处理 → 完成
            ↓
文件3 → 处理 → 完成
```

**优点**:稳定,易于调试
**缺点**:速度慢

---

#### 模式 2:并发处理

```
文件1 → 处理 → 完成
文件2 → 处理 → 完成
文件3 → 处理 → 完成
```

**优点**:速度快,充分利用资源
**缺点**:需要考虑资源限制

---

### OpenClaw 并发配置

在工作流中配置并发:

```json
{
  "concurrency": {
    "enabled": true,
    "max_workers": 5,
    "timeout": 60
  }
}
```

**参数说明**:
- `max_workers`:并发数,建议不超过 CPU 核心数
- `timeout`:单个任务超时时间(秒)

---

## 四、数据校验:如何确保提取准确

### 校验策略

#### 1. 格式校验

检查字段格式是否正确:

```json
{
  "validations": [
    {
      "field": "合同编号",
      "pattern": "^HT-\\d{4}-\\d{3}$",
      "error": "合同编号格式错误"
    },
    {
      "field": "金额",
      "type": "number",
      "min": 0,
      "error": "金额必须为正数"
    },
    {
      "field": "签订日期",
      "pattern": "^\\d{4}-\\d{2}-\\d{2}$",
      "error": "日期格式错误"
    }
  ]
}
```

---

#### 2. 业务校验

检查业务逻辑是否合理:

```json
{
  "business_rules": [
    {
      "rule": "金额 > 1000000",
      "action": "标记为高风险",
      "level": "warning"
    },
    {
      "rule": "有效期 < 30天",
      "action": "标记为即将过期",
      "level": "warning"
    },
    {
      "rule": "签订日期 > 今天",
      "action": "标记为日期异常",
      "level": "error"
    }
  ]
}
```

---

#### 3. 交叉校验

检查字段之间的逻辑关系:

- 甲方 ≠ 乙方
- 签订日期 ≤ 有效期截止日期
- 金额 = 大写金额(如果有)

---

### 校验实现

在工作流中添加校验步骤:

```json
{
  "id": "step_validate",
  "name": "数据校验",
  "skill": "xlsx",
  "command": "validate",
  "params": {
    "input": "{{extracted_data}}",
    "rules": "./validation_rules.json",
    "output": "validated_data"
  }
}
```

---

## 五、异常处理:识别失败的文件

### 异常类型

| 异常类型 | 原因 | 处理方法 |
|---------|------|---------|
| 文件损坏 | PDF 无法打开 | 记录日志,跳过处理 |
| 内容缺失 | 关键字段未找到 | 标记为需人工审核 |
| 格式异常 | 不符合预期格式 | 应用修复规则或标记 |
| OCR 失败 | 扫描件识别失败 | 提高分辨率或人工录入 |

---

### 异常处理流程

```
处理文件
   ↓
提取失败? ─是→ 记录异常 → 加入失败列表
   ↓否
校验失败? ─是→ 标记问题 → 加入待审核列表
   ↓否
成功处理 → 加入成功列表
```

---

### 异常记录

生成异常报告:

```json
{
  "summary": {
    "total": 150,
    "success": 142,
    "failed": 5,
    "review": 3
  },
  "failed_files": [
    {
      "file": "contract_001.pdf",
      "error": "文件损坏,无法打开",
      "suggestion": "联系客户重新提供"
    }
  ],
  "review_files": [
    {
      "file": "contract_050.pdf",
      "issue": "合同编号格式不符",
      "extracted": "HT-2026-ABC",
      "expected": "HT-2026-XXX"
    }
  ]
}
```

---

## 完整工作流配置

创建 `contract_processing.json`:

```json
{
  "name": "合同批量处理",
  "description": "批量处理合同PDF,提取关键信息",
  "version": "1.0",
  "concurrency": {
    "enabled": true,
    "max_workers": 5
  },
  "inputs": {
    "contracts_dir": "./contracts/",
    "output_dir": "./output/"
  },
  "steps": [
    {
      "id": "step1_scan_files",
      "name": "扫描合同文件",
      "skill": "fs",
      "command": "list",
      "params": {
        "path": "{{inputs.contracts_dir}}",
        "pattern": "*.pdf"
      },
      "output": "file_list"
    },
    {
      "id": "step2_batch_extract",
      "name": "批量提取合同信息",
      "skill": "pdf",
      "command": "batch-extract",
      "params": {
        "files": "{{file_list}}",
        "extractor": "llm",
        "schema": {
          "合同编号": "string",
          "甲方": "string",
          "乙方": "string",
          "金额": "number",
          "签订日期": "date",
          "有效期": "string"
        }
      },
      "output": "raw_data",
      "on_error": "continue"
    },
    {
      "id": "step3_validate",
      "name": "数据校验",
      "skill": "xlsx",
      "command": "validate",
      "params": {
        "input": "{{raw_data}}",
        "rules": {
          "合同编号": {
            "required": true,
            "pattern": "^HT-\\d{4}-\\d{3}$"
          },
          "金额": {
            "required": true,
            "type": "number",
            "min": 0
          },
          "签订日期": {
            "required": true,
            "format": "YYYY-MM-DD"
          }
        }
      },
      "output": "validated_data"
    },
    {
      "id": "step4_save_database",
      "name": "保存到数据库",
      "skill": "xlsx",
      "command": "create",
      "params": {
        "data": "{{validated_data.success}}",
        "filename": "{{inputs.output_dir}}/contracts_db.xlsx",
        "columns": ["合同编号", "甲方", "乙方", "金额", "签订日期", "有效期", "处理时间"],
        "format": {
          "header_bold": true,
          "number_format": {
            "金额": "#,##0"
          },
          "date_format": {
            "签订日期": "YYYY-MM-DD"
          }
        }
      },
      "output": "database_file"
    },
    {
      "id": "step5_generate_report",
      "name": "生成处理报告",
      "skill": "xlsx",
      "command": "create",
      "params": {
        "data": [
          {
            "指标": "总文件数",
            "数量": "{{file_list.count}}"
          },
          {
            "指标": "成功处理",
            "数量": "{{validated_data.success.count}}"
          },
          {
            "指标": "失败文件",
            "数量": "{{validated_data.failed.count}}"
          },
          {
            "指标": "需人工审核",
            "数量": "{{validated_data.review.count}}"
          },
          {
            "指标": "成功率",
            "数量": "{{validated_data.success_rate}}%"
          }
        ],
        "filename": "{{inputs.output_dir}}/processing_report.xlsx"
      },
      "output": "report_file"
    },
    {
      "id": "step6_export_failed",
      "name": "导出失败列表",
      "skill": "xlsx",
      "command": "create",
      "params": {
        "data": "{{validated_data.failed}}",
        "filename": "{{inputs.output_dir}}/failed_contracts.xlsx",
        "columns": ["文件名", "错误原因", "建议操作"]
      }
    }
  ],
  "outputs": {
    "database": "{{inputs.output_dir}}/contracts_db.xlsx",
    "report": "{{inputs.output_dir}}/processing_report.xlsx",
    "failed": "{{inputs.output_dir}}/failed_contracts.xlsx"
  }
}
```

---

## 执行效果

### 执行命令

```bash
openclaw workflow run contract_processing.json
```

---

### 执行日志

```
执行工作流:合同批量处理
─────────────────────────────
配置:并发数 5,超时 60s

[1/6] 扫描合同文件...
      ✓ 发现 150 个 PDF 文件

[2/6] 批量提取合同信息(并发处理)...
      进度: [████████████████████] 100% (150/150)
      ✓ 成功提取: 145 份
      ✗ 提取失败: 5 份

[3/6] 数据校验...
      ✓ 校验通过: 142 份
      ⚠ 需人工审核: 3 份

[4/6] 保存到数据库...
      ✓ 已保存到 contracts_db.xlsx

[5/6] 生成处理报告...
      ✓ 已生成 processing_report.xlsx

[6/6] 导出失败列表...
      ✓ 已导出 failed_contracts.xlsx

─────────────────────────────
✓ 工作流执行完成!

处理结果:
  总文件数: 150
  成功处理: 142 (94.7%)
  需审核: 3 (2.0%)
  失败: 5 (3.3%)

输出文件:
  - contracts_db.xlsx (合同数据库)
  - processing_report.xlsx (处理报告)
  - failed_contracts.xlsx (失败列表)

耗时: 12 分 35 秒
```

---

### 结果文件

#### 合同数据库(contracts_db.xlsx)

| 合同编号 | 甲方 | 乙方 | 金额 | 签订日期 | 有效期 | 处理时间 |
|---------|------|------|------|---------|--------|---------|
| HT-2026-001 | XX科技 | YY商贸 | 500,000 | 2026-03-11 | 1年 | 2026-03-11 14:30 |
| HT-2026-002 | AA公司 | BB公司 | 320,000 | 2026-03-10 | 2年 | 2026-03-11 14:30 |
| ... | ... | ... | ... | ... | ... | ... |

---

#### 处理报告(processing_report.xlsx)

| 指标 | 数量 |
|------|------|
| 总文件数 | 150 |
| 成功处理 | 142 |
| 失败文件 | 5 |
| 需人工审核 | 3 |
| 成功率 | 94.7% |

---

#### 失败列表(failed_contracts.xlsx)

| 文件名 | 错误原因 | 建议操作 |
|--------|---------|---------|
| contract_025.pdf | 文件损坏,无法打开 | 联系客户重新提供 |
| contract_078.pdf | 扫描件模糊,OCR 失败 | 提高扫描分辨率 |
| contract_099.pdf | 非标准合同格式 | 人工处理 |
| ... | ... | ... |

---

## 小结

本案例展示了如何用 OpenClaw 批量处理合同 PDF:

1. ✅ 批量读取和提取合同信息
2. ✅ 并发处理提高效率
3. ✅ 数据校验确保准确性
4. ✅ 异常处理和失败识别
5. ✅ 生成结构化数据库

通过自动化,原本 5-8 小时的工作缩短到 15 分钟,效率提升 20-30 倍。

---

## 下篇预告

下一篇,我们学习竞品信息自动监控案例。

> **下一篇**:实战案例 3—— 竞品信息自动监控

---

*系列教程第 14 篇*
*阅读时长:12-15 分钟*
