# 技能市场初探:如何找到你需要的技能?

> **核心问题**:怎么发现更多能力?
> 系统介绍skills.sh技能市场，讲解按场景、热度、最新三种浏览方式，教您判断技能质量并掌握两种安装方式，适合需要扩展OpenClaw能力的用户。

**系列教程第 6 篇** | **阅读时长:6-8 分钟**

---

## 技能:OpenClaw 的能力之源

上一篇,你安装了第一个技能 `pdf`,体验了 OpenClaw 的基本能力。

但 OpenClaw 能做的远不止处理 PDF。它的能力边界,取决于你安装了哪些技能。

这一篇,我们探索 OpenClaw 的技能市场,学会发现和安装技能。

---

## 一、skills.sh 技能市场介绍

### 什么是 skills.sh?

**skills.sh** 是 OpenClaw 官方的技能市场,类似于:
- npm 对于 Node.js
- PyPI 对于 Python
- App Store 对于 iPhone

它是一个集中式的技能仓库,收录了官方和社区开发的各类技能。

### 访问方式

**方式一:网页浏览**

打开浏览器,访问:https://skills.sh

你将看到技能市场的首页:

```
热门技能 | 最新更新 | 分类浏览
─────────────────────────────
pdf (⭐ 1.2k)  处理 PDF 文件
xlsx (⭐ 980)  操作 Excel 表格
pptx (⭐ 856)  制作 PPT
browser (⭐ 723) 浏览器自动化
...
```

**方式二:命令行查看**

```bash
openclaw skill search
```

输出:

```
可安装技能(共 127 个):
  pdf (v1.2.0) - 处理 PDF 文件 [⭐ 1.2k]
  xlsx (v1.1.5) - 操作 Excel 表格 [⭐ 980]
  pptx (v1.0.8) - 制作 PPT [⭐ 856]
  browser (v2.0.1) - 浏览器自动化 [⭐ 723]
  email (v0.9.3) - 邮件处理 [⭐ 612]
  ...
```

---

## 二、技能分类浏览:按场景、按热度、按最新

skills.sh 提供多种浏览方式:

### 1. 按场景分类

在网页左侧或命令中,可以按场景筛选:

```bash
openclaw skill search --category document
```

主要分类:

| 分类 | 说明 | 典型技能 |
|------|------|---------|
| document | 文档处理 | pdf, docx, xlsx, pptx |
| automation | 自动化 | browser, scheduler, workflow |
| content | 内容创作 | writer, translator, designer |
| data | 数据处理 | cleaner, analyzer, visualizer |
| dev | 开发辅助 | coder, tester, deployer |
| communication | 沟通协作 | email, slack, wechat |

---

### 2. 按热度排序

查看最受欢迎的技能:

```bash
openclaw skill search --sort stars
```

或网页上点击"热门"标签。

热度通常反映:
- 用户使用广泛程度
- 社区活跃度
- 功能实用性

---

### 3. 按最新更新

查看最近更新的技能:

```bash
openclaw skill search --sort updated
```

或网页上点击"最新"标签。

这有助于:
- 发现新技能
- 了解技能维护情况
- 获取最新功能

---

## 三、如何判断技能质量:安装量、评分、更新频率

在技能市场,你可能会看到多个同类技能,如何选择?

### 关键指标

| 指标 | 说明 | 如何查看 | 建议阈值 |
|------|------|---------|---------|
| 安装量 | 累计下载次数 | 技能详情页 | > 1000 较可靠 |
| 评分 | 用户评价(1-5星) | 技能详情页 | > 4.0 较好 |
| 更新时间 | 最近一次更新 | 技能详情页 | 3 个月内有更新 |
| 作者信誉 | 开发者资质 | 作者主页 | 官方或活跃贡献者 |
| 文档质量 | 使用说明是否清晰 | README | 有详细示例和文档 |

---

### 实际操作

**查看技能详情**:

```bash
openclaw skill info xlsx
```

输出:

```
技能: xlsx
─────────────────────────────
版本: 1.1.5
作者: openclaw-team (官方)
安装量: 12,543
评分: ⭐⭐⭐⭐⭐ (4.7/5.0)
更新时间: 2026-03-01
描述: 操作 Excel 表格,支持读取、写入、格式化、图表生成

功能列表:
  - 读取 Excel 文件
  - 写入/修改单元格
  - 数据清洗
  - 公式计算
  - 图表生成
  - 多表合并

依赖:
  - openpyxl >= 3.1.0
  - pandas >= 2.0.0

文档: https://docs.openclaw.ai/skills/xlsx
源码: https://github.com/openclaw/skill-xlsx
```

**查看用户评价**:

```bash
openclaw skill reviews xlsx
```

输出:

```
xlsx 用户评价(共 156 条):
─────────────────────────────
⭐⭐⭐⭐⭐ user123: 非常好用,处理大量 Excel 没问题
⭐⭐⭐⭐ user456: 文档清晰,功能齐全
⭐⭐⭐⭐⭐ user789: 替代了我的 Python 脚本,省了很多时间
...
```

---

## 四、技能安装的两种方式:命令行、配置文件

找到想要的技能后,有两种安装方式:

### 方式一:命令行安装(推荐新手)

```bash
# 安装最新版本
openclaw skill install xlsx

# 安装指定版本
openclaw skill install xlsx@1.1.0

# 从 URL 安装
openclaw skill install https://github.com/user/skill-custom/archive/main.zip
```

---

### 方式二:配置文件安装(推荐批量管理)

编辑 `~/.openclaw/config.json`:

```json
{
  "skills": [
    {
      "name": "pdf",
      "version": "latest"
    },
    {
      "name": "xlsx",
      "version": "1.1.5"
    },
    {
      "name": "pptx",
      "version": "latest"
    },
    {
      "name": "browser",
      "version": "latest"
    }
  ]
}
```

然后同步:

```bash
openclaw skill sync
```

这会自动安装配置文件中列出的所有技能。

**优点**:
- 可以版本锁定
- 方便团队共享配置
- 适合自动化部署

---

## 五、安装后的管理和更新

### 查看已安装技能

```bash
openclaw skill list
```

输出:

```
已安装技能:
  pdf (v1.2.0) - 处理 PDF 文件
  xlsx (v1.1.5) - 操作 Excel 表格
  pptx (v1.0.8) - 制作 PPT
```

---

### 更新技能

```bash
# 更新单个技能
openclaw skill update xlsx

# 更新所有技能
openclaw skill update --all
```

---

### 卸载技能

```bash
openclaw skill uninstall xlsx
```

---

### 查看技能使用帮助

```bash
openclaw skill help xlsx
```

输出:

```
xlsx - 操作 Excel 表格

用法:
  openclaw run xlsx <command> [options]

命令:
  read      读取 Excel 文件
  write     写入 Excel 文件
  merge     合并多个 Excel
  clean     数据清洗
  chart     生成图表

示例:
  openclaw run xlsx read --input data.xlsx
  openclaw run xlsx merge --input file1.xlsx,file2.xlsx --output merged.xlsx

详细文档: https://docs.openclaw.ai/skills/xlsx
```

---

## 小结

这一篇,你学会了:

1. ✅ 访问 skills.sh 技能市场
2. ✅ 按场景、热度、最新浏览技能
3. ✅ 判断技能质量的方法
4. ✅ 两种技能安装方式
5. ✅ 技能的更新和管理

现在,你已经能自主发现和安装技能,OpenClaw 的能力大门已经打开。

---

## 下篇预告

技能装好了,但界面上的各种按钮、配置都是什么意思?下一篇,我们全面解读 OpenClaw 界面。

> **下一篇**:OpenClaw 界面全解读,每个按钮都有用

---

