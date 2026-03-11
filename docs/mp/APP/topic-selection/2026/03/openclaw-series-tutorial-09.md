# 让 OpenClaw 帮你做 PPT,从此告别加班

> **核心问题**:PPT 制作能自动化到什么程度?

---

## PPT 痛点:美观与效率的矛盾

做 PPT 是很多职场人的噩梦:

- 花几小时排版,还是不够美观
- 内容修改一次,格式就要重新调整
- 月报、周报结构相似,却要重复制作
- 数据更新后,图表要手动修改

如果能自动生成 PPT 初稿,只需要微调该多好。

这一篇,我们学习如何用 OpenClaw 的 `pptx` 技能自动化 PPT 制作。

---

## 一、pptx 技能基础能力

### 安装 pptx 技能

```bash
openclaw skill install pptx
```

---

### 核心功能

| 功能 | 说明 | 适用场景 |
|------|------|---------|
| 从大纲生成 | 根据文字大纲创建 PPT | 快速生成初稿 |
| 模板套用 | 应用企业模板样式 | 统一风格 |
| 内容填充 | 填充标题、正文、图片 | 批量生成 |
| 图表生成 | 自动创建数据图表 | 数据汇报 |
| 批量操作 | 批量处理多份 PPT | 规模化场景 |

---

### 基础命令

```bash
# 查看 pptx 技能帮助
openclaw skill help pptx

# 查看支持的操作
openclaw run pptx --help
```

输出:

```
pptx - 制作 PPT

用法:
  openclaw run pptx <command> [options]

命令:
  create     从大纲创建 PPT
  fill       填充 PPT 内容
  template   应用模板
  chart      添加图表
  export     导出为图片/PDF
  merge      合并多个 PPT
```

---

## 二、从大纲到 PPT:自动生成初稿

### 场景:快速生成季度汇报 PPT

**需求**:有一个汇报大纲,想快速生成 PPT 初稿。

**大纲文件**(`outline.md`):

```markdown
# 季度工作汇报

## 一、季度目标回顾
- 目标 1:完成产品升级
- 目标 2:拓展 3 个新客户
- 目标 3:团队扩充至 10 人

## 二、完成情况
- 产品升级:已完成 80%
- 新客户拓展:已完成 2 个
- 团队扩充:已完成 9 人

## 三、数据分析
- 销售额:500 万(同比增长 20%)
- 用户数:10 万(同比增长 30%)

## 四、下季度计划
- 完成产品升级剩余 20%
- 拓展第 3 个新客户
- 继续招聘,达到 10 人目标

## 五、总结与展望
- 团队执行力强
- 市场前景良好
- 下季度信心满满
```

---

### 执行命令

```bash
openclaw run pptx create \
  --outline outline.md \
  --theme professional \
  --output quarterly_report.pptx
```

**参数说明**:
- `--outline`:大纲文件路径
- `--theme`:主题风格(可选 professional, minimal, colorful, dark)
- `--output`:输出文件名

---

### 生成效果

OpenClaw 会自动:
1. 解析大纲结构
2. 创建对应页面
3. 应用主题样式
4. 生成 PPT 文件

生成的 PPT 结构:

```
第 1 页:封面 - 季度工作汇报
第 2 页:一、季度目标回顾
第 3 页:二、完成情况
第 4 页:三、数据分析
第 5 页:四、下季度计划
第 6 页:五、总结与展望
```

每页包含:
- 标题(一级标题)
- 内容列表(列表项)

---

### 交互模式

也可以用自然语言:

```
你:根据这个大纲生成一个季度汇报 PPT,风格要简洁专业
OpenClaw:好的,请提供大纲内容
你:[粘贴大纲]
OpenClaw:正在生成...完成!PPT 已保存为 quarterly_report.pptx,共 6 页
```

---

## 三、模板应用:企业风格一键套用

### 为什么需要模板?

生成的初稿虽然结构完整,但可能不符合企业视觉规范。

通过模板,可以快速套用企业风格。

---

### 准备模板文件

**方式一:使用现有 PPT 作为模板**

假设公司有一个标准模板 `company_template.pptx`,包含:
- 统一的配色方案
- 企业 Logo
- 字体规范
- 页脚信息

**方式二:创建模板配置**

创建 `template.json`:

```json
{
  "name": "企业标准模板",
  "colors": {
    "primary": "#0066CC",
    "secondary": "#FF6600",
    "background": "#FFFFFF",
    "text": "#333333"
  },
  "fonts": {
    "title": "微软雅黑",
    "body": "微软雅黑"
  },
  "logo": "./logo.png",
  "footer": "公司名称 | 机密文件"
}
```

---

### 应用模板

**方式一:生成时直接应用**

```bash
openclaw run pptx create \
  --outline outline.md \
  --template company_template.pptx \
  --output report.pptx
```

**方式二:对现有 PPT 应用模板**

```bash
openclaw run pptx apply-template \
  --input report_draft.pptx \
  --template company_template.pptx \
  --output report_final.pptx
```

---

### 模板效果对比

**应用前**:
- 默认蓝色主题
- 无 Logo
- 无页脚

**应用后**:
- 企业标准配色
- 右上角显示 Logo
- 底部显示公司名称和"机密文件"

---

## 四、图表与图片:数据可视化自动化

### 场景:在 PPT 中插入数据图表

**需求**:在汇报 PPT 中展示销售数据图表。

**准备数据**(`sales_data.xlsx`):

| 月份 | 销售额 |
|------|--------|
| 1月 | 80 |
| 2月 | 95 |
| 3月 | 110 |

---

### 添加图表

**命令**:

```bash
openclaw run pptx add-chart \
  --input report.pptx \
  --slide 3 \
  --type bar \
  --data sales_data.xlsx \
  --title "季度销售趋势" \
  --output report_with_chart.pptx
```

**参数说明**:
- `--slide 3`:在第 3 页插入图表
- `--type bar`:柱状图(可选 line, pie, area)
- `--data`:数据源 Excel 文件

---

### 批量添加图表

如果有多个数据需要可视化,可以批量处理:

```bash
openclaw run pptx batch-add-chart \
  --input report.pptx \
  --config charts.json \
  --output report_final.pptx
```

`charts.json` 配置:

```json
{
  "charts": [
    {
      "slide": 3,
      "type": "bar",
      "data": "sales_data.xlsx",
      "title": "销售趋势"
    },
    {
      "slide": 4,
      "type": "pie",
      "data": "product_share.xlsx",
      "title": "产品占比"
    }
  ]
}
```

---

### 插入图片

**场景**:在 PPT 中插入产品截图或照片。

```bash
openclaw run pptx add-image \
  --input report.pptx \
  --slide 5 \
  --image product.png \
  --position center \
  --output report_with_image.pptx
```

批量插入:

```bash
openclaw run pptx batch-add-image \
  --input report.pptx \
  --images "./screenshots/*.png" \
  --output report_with_images.pptx
```

---

## 五、实战案例:周报 PPT 一键生成

### 完整场景

**背景**:每周需要制作工作周报 PPT,内容格式固定,只是数据更新。

**传统方式**:
1. 复制上周 PPT
2. 修改标题日期
3. 更新数据内容
4. 调整图表
5. 检查格式

**耗时**:约 30 分钟

---

### OpenClaw 自动化方案

#### 步骤 1:准备模板

创建周报模板 `weekly_report_template.pptx`,包含:

```
第 1 页:封面
  - 标题:{{title}}
  - 日期:{{date}}

第 2 页:本周工作
  - 内容:{{this_week_tasks}}

第 3 页:数据分析
  - 图表占位符

第 4 页:下周计划
  - 内容:{{next_week_plan}}

第 5 页:问题与建议
  - 内容:{{issues}}
```

---

#### 步骤 2:准备数据

创建 `weekly_data.json`:

```json
{
  "title": "产品组周报",
  "date": "2026-03-11",
  "this_week_tasks": [
    "完成功能 A 开发",
    "修复 3 个线上 Bug",
    "参与需求评审 2 次"
  ],
  "next_week_plan": [
    "开始功能 B 开发",
    "优化性能问题",
    "准备演示材料"
  ],
  "issues": [
    "测试环境不稳定,影响进度",
    "需增加设计资源支持"
  ],
  "chart_data": "weekly_stats.xlsx"
}
```

---

#### 步骤 3:一键生成

```bash
openclaw run pptx generate \
  --template weekly_report_template.pptx \
  --data weekly_data.json \
  --add-chart \
  --chart-config chart.json \
  --output "2026-03-11_周报.pptx"
```

`chart.json`:

```json
{
  "slide": 3,
  "type": "bar",
  "data": "weekly_stats.xlsx",
  "title": "本周数据概览"
}
```

**耗时**:约 1 分钟

---

### 定时自动化

如果数据来源固定(如从 Jira、Excel 自动同步),可以配置定时任务:

```bash
openclaw automation create \
  --name "周报自动生成" \
  --schedule "FREQ=WEEKLY;BYDAY=FR;BYHOUR=17;BYMINUTE=0" \
  --workflow weekly_report.json
```

每周五下午 5 点自动生成周报 PPT。

---

## 进阶技巧:复杂 PPT 自动化

### 技巧 1:动态调整布局

根据内容量自动调整布局:

```bash
openclaw run pptx create \
  --outline outline.md \
  --auto-layout \
  --output report.pptx
```

内容少时用大字体,内容多时自动缩小。

---

### 技巧 2:智能配图

根据内容关键词自动匹配图片:

```bash
openclaw run pptx create \
  --outline outline.md \
  --auto-image \
  --image-source unsplash \
  --output report.pptx
```

会根据标题关键词从 Unsplash 自动搜索并插入相关图片。

---

### 技巧 3:批量生成多份 PPT

场景:需要为 10 个部门生成结构相同的 PPT。

```bash
openclaw run pptx batch-generate \
  --template report_template.pptx \
  --data departments.xlsx \
  --output-dir ./reports/
```

`departments.xlsx`:

| department | tasks | stats |
|-----------|-------|-------|
| 销售部 | ... | ... |
| 技术部 | ... | ... |
| 市场部 | ... | ... |

---

## 小结

这一篇,你学会了:

1. ✅ pptx 技能基础能力
2. ✅ 从大纲快速生成 PPT 初稿
3. ✅ 应用企业模板统一风格
4. ✅ 自动生成数据图表
5. ✅ 实战案例:周报 PPT 一键生成

PPT 自动化是 OpenClaw 的高频应用场景,掌握这些技能,告别加班不是梦。

---

## 下篇预告

文档处理和 PPT 制作都是本地操作,下一篇我们学习浏览器自动化:让 OpenClaw 帮你"上网办事"。

> **下一篇**:浏览器自动化:让 OpenClaw 帮你"上网办事"

---

*系列教程第 9 篇*
*阅读时长:10-12 分钟*
