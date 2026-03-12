# 文档处理三部曲:PDF、Word、Excel 一网打尽

> **核心问题**:日常工作中的文档处理怎么自动化?
> 深入讲解PDF、Word、Excel三大文档处理技能的高级操作，展示三者联动实现月度报告自动化的完整流程，适合需要处理大量办公文档的职场人士。

**系列教程第 8 篇** | **阅读时长:12-15 分钟**

---

## 文档处理:职场人的日常

如果你是职场白领,可能每天都在和这些文件打交道:

- 📄 PDF:合同、报告、资料
- 📝 Word:方案、文档、总结
- 📊 Excel:数据、报表、清单

这些文档处理看似简单,但当数量增多、格式复杂时,就会变成"重复劳动"。

这一篇,我们系统学习如何用 OpenClaw 自动化处理这三大文档类型。

---

## 一、PDF 技能深度使用:合并、拆分、提取、转换

### 常见 PDF 处理需求

| 需求 | 说明 | 传统方式 | OpenClaw 方式 |
|------|------|---------|-------------|
| 提取文字 | 从 PDF 中复制文字 | 全选复制,格式全乱 | 一键提取,保持格式 |
| 提取表格 | 从 PDF 中获取表格数据 | 手动重建表格 | 自动识别并导出 Excel |
| 合并 PDF | 多个 PDF 合成一个 | 在线工具或软件 | 本地快速合并 |
| 拆分 PDF | 一个 PDF 拆成多个 | 软件逐页分割 | 按需智能拆分 |
| PDF 转图片 | PDF 页面转成图片 | 截图或专用工具 | 批量转换 |

---

### 1. 提取文字

**场景**:从一份报告 PDF 中提取所有文字。

**命令**:

```bash
openclaw run pdf extract-text --input report.pdf --output report.txt
```

**交互模式**:

```
你:从 report.pdf 里提取所有文字
OpenClaw:好的,正在提取...完成!文字已保存到 report.txt
```

**高级选项**:

```bash
# 指定页面范围
openclaw run pdf extract-text --input report.pdf --pages 1-10 --output part.txt

# 保留格式
openclaw run pdf extract-text --input report.pdf --keep-format --output formatted.txt
```

---

### 2. 提取表格

**场景**:从财务报表 PDF 中提取表格数据。

**命令**:

```bash
openclaw run pdf extract-table --input finance.pdf --output tables.xlsx
```

**效果**:
- 自动识别表格区域
- 保持表格结构
- 导出为 Excel,方便后续处理

**示例**:

假设 PDF 中有这样的表格:

```
| 项目 | 金额 | 日期 |
|------|------|------|
| 办公用品 | 1200 | 2026-03-01 |
| 差旅费 | 3500 | 2026-03-05 |
```

提取后的 Excel 会保持相同结构。

---

### 3. 合并 PDF

**场景**:将 10 份合同 PDF 合并成一个文件。

**命令**:

```bash
openclaw run pdf merge --input contract1.pdf,contract2.pdf,...,contract10.pdf --output all_contracts.pdf
```

或使用通配符:

```bash
openclaw run pdf merge --input ./contracts/*.pdf --output merged.pdf
```

**进阶选项**:

```bash
# 添加书签
openclaw run pdf merge --input *.pdf --output merged.pdf --add-bookmarks

# 添加页码
openclaw run pdf merge --input *.pdf --output merged.pdf --add-page-numbers
```

---

### 4. 拆分 PDF

**场景**:将一份 100 页的报告拆分成多个章节。

**命令**:

```bash
# 按页码拆分
openclaw run pdf split --input report.pdf --pages 1-20,21-50,51-100 --output chapter1.pdf,chapter2.pdf,chapter3.pdf

# 按固定页数拆分
openclaw run pdf split --input report.pdf --each 10 --output-dir ./chapters/
```

---

### 5. PDF 转图片

**场景**:将 PDF 转成图片,用于演示或分享。

**命令**:

```bash
openclaw run pdf to-images --input slides.pdf --output-dir ./images/ --format png
```

**输出**:

```
./images/
├── slides_page_001.png
├── slides_page_002.png
└── ...
```

---

## 二、Word 技能实战:批量生成报告、模板填充

### 常见 Word 处理需求

| 需求 | 说明 | 传统方式 | OpenClaw 方式 |
|------|------|---------|-------------|
| 批量生成文档 | 根据数据生成多份文档 | 手动逐个创建 | 自动批量生成 |
| 模板填充 | 填充 Word 模板 | 手动替换占位符 | 自动填充数据 |
| 格式转换 | Word 转 PDF/HTML | 另存为 | 命令批量转换 |
| 内容替换 | 批量替换文档内容 | 查找替换 | 批量智能替换 |

---

### 1. 批量生成文档

**场景**:根据 Excel 数据批量生成合同。

**准备**:
- 模板文件:`contract_template.docx`
- 数据文件:`contracts_data.xlsx`

模板示例:

```
甲方:{{party_a}}
乙方:{{party_b}}
金额:{{amount}}
日期:{{date}}
```

Excel 数据:

| party_a | party_b | amount | date |
|---------|---------|--------|------|
| 公司A | 公司B | 50000 | 2026-03-11 |
| 公司C | 公司D | 80000 | 2026-03-12 |

**命令**:

```bash
openclaw run docx batch-generate \
  --template contract_template.docx \
  --data contracts_data.xlsx \
  --output-dir ./contracts/
```

**输出**:

```
./contracts/
├── contract_001.docx (公司A-公司B)
├── contract_002.docx (公司C-公司D)
```

---

### 2. 模板填充

**场景**:填充固定模板生成报告。

**模板文件**(`report_template.docx`):

```
项目名称:{{project_name}}
负责人:{{manager}}
时间:{{date}}

一、项目概述
{{overview}}

二、完成情况
{{progress}}

三、下一步计划
{{next_steps}}
```

**数据文件**(`report_data.json`):

```json
{
  "project_name": "OpenClaw 推广项目",
  "manager": "张三",
  "date": "2026-03-11",
  "overview": "本项目旨在推广 OpenClaw 工具...",
  "progress": "已完成第一阶段的宣传...",
  "next_steps": "下周开始第二阶段..."
}
```

**命令**:

```bash
openclaw run docx fill-template \
  --template report_template.docx \
  --data report_data.json \
  --output report_final.docx
```

---

### 3. 内容替换

**场景**:批量替换文档中的公司名称。

**命令**:

```bash
openclaw run docx replace \
  --input ./docs/*.docx \
  --old "旧公司名" \
  --new "新公司名" \
  --output-dir ./updated/
```

---

### 4. Word 转 PDF

**命令**:

```bash
openclaw run docx to-pdf --input report.docx --output report.pdf
```

批量转换:

```bash
openclaw run docx to-pdf --input ./docs/*.docx --output-dir ./pdfs/
```

---

## 三、Excel 技能技巧:数据清洗、公式计算、图表生成

### 常见 Excel 处理需求

| 需求 | 说明 | 传统方式 | OpenClaw 方式 |
|------|------|---------|-------------|
| 数据清洗 | 去重、填充缺失值 | 手动或复杂公式 | 自动智能清洗 |
| 多表合并 | 合并多个 Excel | 复制粘贴或 VBA | 一键合并 |
| 公式计算 | 批量应用公式 | 手动填充公式 | 自动计算 |
| 图表生成 | 生成统计图表 | 手动插入图表 | 自动生成可视化 |

---

### 1. 数据清洗

**场景**:清洗一份包含重复、缺失值的客户数据。

**原始数据**:

| 姓名 | 邮箱 | 电话 | 金额 |
|------|------|------|------|
| 张三 | zhang@example.com | 13800138000 | 5000 |
| 张三 | zhang@example.com | 13800138000 | 5000 |
| 李四 | li@example.com | NULL | 3000 |
| 王五 | wang@example.com | 13900139000 | NULL |

**命令**:

```bash
openclaw run xlsx clean \
  --input customers.xlsx \
  --deduplicate \
  --fill-missing "电话:未知,金额:0" \
  --output customers_clean.xlsx
```

**清洗后**:

| 姓名 | 邮箱 | 电话 | 金额 |
|------|------|------|------|
| 张三 | zhang@example.com | 13800138000 | 5000 |
| 李四 | li@example.com | 未知 | 3000 |
| 王五 | wang@example.com | 13900139000 | 0 |

---

### 2. 多表合并

**场景**:合并 12 个月的销售数据表。

**命令**:

```bash
openclaw run xlsx merge \
  --input ./monthly_sales/*.xlsx \
  --output yearly_sales.xlsx \
  --add-source-column
```

`--add-source-column` 会添加一列标注数据来源。

---

### 3. 公式计算

**场景**:计算每个部门的平均工资。

**命令**:

```bash
openclaw run xlsx calculate \
  --input salary.xlsx \
  --formula "平均工资=AVERAGE(C2:C100)" \
  --group-by "部门" \
  --output salary_stats.xlsx
```

---

### 4. 图表生成

**场景**:根据销售数据生成柱状图。

**命令**:

```bash
openclaw run xlsx chart \
  --input sales.xlsx \
  --type bar \
  --x-column "月份" \
  --y-column "销售额" \
  --output sales_chart.xlsx
```

**支持的图表类型**:
- `bar`:柱状图
- `line`:折线图
- `pie`:饼图
- `scatter`:散点图
- `area`:面积图

---

## 四、三者联动:从 PDF 提取 → Excel 整理 → Word 输出

真正的场景往往是多种文档类型协同工作。

### 实战场景:月度报告自动化

**需求**:从多份 PDF 报告中提取数据,整理到 Excel,最终生成 Word 报告。

---

### 步骤 1:从 PDF 提取数据

```bash
# 批量提取 PDF 表格
openclaw run pdf extract-table \
  --input ./reports/*.pdf \
  --output-dir ./raw_data/
```

---

### 步骤 2:Excel 整理数据

```bash
# 合并所有表格
openclaw run xlsx merge \
  --input ./raw_data/*.xlsx \
  --output merged_data.xlsx

# 清洗并计算汇总
openclaw run xlsx clean \
  --input merged_data.xlsx \
  --deduplicate \
  --output cleaned_data.xlsx

openclaw run xlsx calculate \
  --input cleaned_data.xlsx \
  --formula "总计=SUM(金额)" \
  --output monthly_summary.xlsx
```

---

### 步骤 3:Word 生成报告

```bash
# 填充报告模板
openclaw run docx fill-template \
  --template monthly_report_template.docx \
  --data monthly_summary.xlsx \
  --output final_report.docx
```

---

### 一键执行

可以将上述流程写入配置文件 `workflow.json`:

```json
{
  "name": "月度报告自动化",
  "steps": [
    {
      "skill": "pdf",
      "command": "extract-table",
      "input": "./reports/*.pdf",
      "output": "./raw_data/"
    },
    {
      "skill": "xlsx",
      "command": "merge",
      "input": "./raw_data/*.xlsx",
      "output": "merged_data.xlsx"
    },
    {
      "skill": "xlsx",
      "command": "clean",
      "input": "merged_data.xlsx",
      "output": "cleaned_data.xlsx"
    },
    {
      "skill": "docx",
      "command": "fill-template",
      "template": "monthly_report_template.docx",
      "data": "cleaned_data.xlsx",
      "output": "final_report.docx"
    }
  ]
}
```

执行:

```bash
openclaw workflow run workflow.json
```

---

## 五、实战案例:自动化月度报告生成

### 完整场景

**背景**:每月需要从各部门收集 PDF 报告,汇总整理,生成月度报告。

**传统流程**:
1. 收集 10 份 PDF 报告(耗时 2 天)
2. 手动提取关键数据(耗时 4 小时)
3. 整理到 Excel(耗时 2 小时)
4. 编写 Word 报告(耗时 3 小时)
5. 检查修正(耗时 1 小时)

**总耗时**:约 3 天

---

### OpenClaw 自动化流程

**步骤 1:准备模板**

创建 `report_template.docx`,包含占位符:
- `{{month}}`:月份
- `{{total_sales}}`:总销售额
- `{{top_product}}`:最畅销产品
- ...

**步骤 2:配置工作流**

创建 `monthly_report.json`:

```json
{
  "name": "月度报告自动化",
  "trigger": "manual",
  "steps": [
    {
      "name": "提取PDF数据",
      "skill": "pdf",
      "command": "extract-table",
      "input": "./monthly_reports/*.pdf",
      "output": "./temp/raw_data.xlsx"
    },
    {
      "name": "数据清洗与汇总",
      "skill": "xlsx",
      "command": "process",
      "input": "./temp/raw_data.xlsx",
      "operations": ["deduplicate", "calculate_totals"],
      "output": "./temp/summary.xlsx"
    },
    {
      "name": "生成报告",
      "skill": "docx",
      "command": "fill-template",
      "template": "./templates/report_template.docx",
      "data": "./temp/summary.xlsx",
      "output": "./output/{{month}}_月度报告.docx"
    }
  ]
}
```

**步骤 3:执行**

```bash
openclaw workflow run monthly_report.json
```

**总耗时**:约 5 分钟

---

## 小结

这一篇,你学会了:

1. ✅ PDF 深度操作:提取、合并、拆分、转换
2. ✅ Word 批量处理:模板填充、批量生成
3. ✅ Excel 数据处理:清洗、合并、计算、图表
4. ✅ 三者联动:完整自动化工作流
5. ✅ 实战案例:月度报告自动化

文档处理是 OpenClaw 的核心能力,掌握这些技能,你的工作效率将大幅提升。

---

## 下篇预告

文档处理之外,PPT 制作也是职场常见需求。下一篇,我们学习如何让 OpenClaw 帮你自动生成 PPT。

> **下一篇**:让 OpenClaw 帮你做 PPT,从此告别加班

---

