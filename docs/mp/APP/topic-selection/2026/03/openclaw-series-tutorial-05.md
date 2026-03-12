# 你的第一个任务:让 OpenClaw 帮你处理 PDF

> **核心问题**:怎么开始用?
> 讲解技能概念与安装第一个pdf技能，通过实战任务掌握命令行和交互模式两种使用方式，适合OpenClaw入门用户快速上手。

**系列教程第 5 篇** | **阅读时长:8-10 分钟**

---

## 准备开始

安装好 OpenClaw 后,你可能跃跃欲试,但又有点迷茫:
- 第一步该做什么?
- 怎么让它帮我处理文件?

这一篇,我们用一个真实任务带你入门:从 PDF 中提取文字。

---

## 一、技能概念:什么是技能?怎么理解?

在 OpenClaw 中,**技能**是最核心的概念。

### 技能是什么?

技能是 OpenClaw 的"能力模块",每个技能解决一类问题:

- `pdf` 技能:处理 PDF 文件
- `xlsx` 技能:操作 Excel 表格
- `pptx` 技能:制作 PPT
- `browser` 技能:控制浏览器

就像手机上的 App,每个 App 做一件事,每个技能也是一种能力。

### 为什么要有技能机制?

OpenClaw 本身是一个"执行框架",它不会直接处理 PDF 或 Excel,而是通过技能来扩展能力。

这样设计的好处:
- **按需安装**:只用装你需要的技能,不臃肿
- **社区扩展**:任何人都可以开发技能,能力无限
- **版本管理**:技能独立更新,互不干扰

---

## 二、安装第一个技能:pdf

现在我们来安装 `pdf` 技能。

### 方法一:命令行安装(推荐)

打开终端,输入:

```bash
openclaw skill install pdf
```

预期输出:

```
正在安装技能:pdf...
✓ 从 skills.sh 下载技能包
✓ 解压到 ~/.openclaw/skills/pdf
✓ 安装依赖包...
✓ 技能安装成功!

技能信息:
  名称: pdf
  版本: 1.2.0
  描述: 处理 PDF 文件,支持提取、合并、拆分、转换等操作
  作者: openclaw-team
  依赖: PyPDF2, pdfplumber
```

### 方法二:配置文件安装

在 `~/.openclaw/config.json` 中添加:

```json
{
  "skills": [
    {
      "name": "pdf",
      "version": "latest"
    }
  ]
}
```

然后运行:

```bash
openclaw skill sync
```

### 验证安装

输入命令查看已安装技能:

```bash
openclaw skill list
```

预期输出:

```
已安装技能:
  pdf (v1.2.0) - 处理 PDF 文件
```

---

## 三、实战任务:从 PDF 中提取文字

技能装好了,现在我们来完成第一个真实任务。

### 任务描述

你有一份 PDF 文档 `report.pdf`,想提取其中的文字内容。

### 步骤 1:准备 PDF 文件

假设你的 PDF 文件在 `~/Documents/report.pdf`。

如果没有,可以:
- 从网上下载任意 PDF 用于测试
- 或使用 OpenClaw 提供的示例文件:

```bash
openclaw example download sample.pdf
```

---

### 步骤 2:执行提取命令

#### 方式一:命令行

```bash
openclaw run pdf extract --input ~/Documents/report.pdf --output ~/Documents/report.txt
```

参数说明:
- `run pdf`:运行 pdf 技能
- `extract`:执行提取操作
- `--input`:输入文件路径
- `--output`:输出文件路径

预期输出:

```
正在执行:pdf extract
读取文件:report.pdf (共 15 页)
提取文字中...
✓ 完成!已保存到:~/Documents/report.txt
```

#### 方式二:自然语言(交互模式)

打开 OpenClaw 交互界面:

```bash
openclaw chat
```

输入:

```
从 ~/Documents/report.pdf 中提取所有文字,保存到 txt 文件
```

OpenClaw 会自动:
1. 理解你的意图
2. 选择 pdf 技能
3. 执行提取操作
4. 返回结果

---

### 步骤 3:查看结果

打开输出的 txt 文件:

```bash
cat ~/Documents/report.txt
# 或用文本编辑器打开
```

你会看到从 PDF 中提取的文字内容。

---

## 四、从命令到交互:两种使用方式

OpenClaw 提供两种使用方式:

### 方式一:命令行模式

**特点**:
- 精确控制参数
- 适合脚本、自动化场景
- 需要记住命令格式

**示例**:

```bash
# 合并多个 PDF
openclaw run pdf merge --input file1.pdf,file2.pdf --output merged.pdf

# 拆分 PDF
openclaw run pdf split --input large.pdf --pages 1-10 --output part1.pdf
```

---

### 方式二:交互对话模式

**特点**:
- 自然语言输入,无需记命令
- 智能理解意图
- 适合日常使用、探索功能

**示例**:

```
你:把这个 PDF 转成图片
OpenClaw:好的,请问 PDF 文件路径是?
你:~/Documents/report.pdf
OpenClaw:正在转换...已完成!图片保存在 ~/Documents/report_images/
```

---

## 五、任务结果查看和导出

### 查看任务历史

```bash
openclaw task history
```

输出:

```
最近任务:
  #001 [2026-03-11 14:30] pdf extract - 成功
  #002 [2026-03-11 14:25] pdf list - 成功
```

### 查看任务详情

```bash
openclaw task show #001
```

输出:

```
任务 #001
  时间:2026-03-11 14:30:15
  技能:pdf
  操作:extract
  输入:~/Documents/report.pdf
  输出:~/Documents/report.txt
  状态:成功
  耗时:2.3 秒
```

### 导出任务记录

```bash
openclaw task export --output task_history.json
```

---

## 小结

这一篇,你学会了:

1. ✅ 理解"技能"概念
2. ✅ 安装第一个技能:`pdf`
3. ✅ 完成第一个任务:提取 PDF 文字
4. ✅ 掌握两种使用方式:命令行和交互模式
5. ✅ 查看任务历史和导出记录

恭喜!你已经能用 OpenClaw 解决实际问题了。

---

## 下篇预告

pdf 技能只是开始,OpenClaw 还有更多技能等你探索。下一篇,我们介绍技能市场:如何找到你需要的技能。

> **下一篇**:技能市场初探:如何找到你需要的技能?

---

