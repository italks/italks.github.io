# OpenClaw龙虾实战案例 4—— 个人知识库自动整理

> **场景**:收集的文章、笔记、PDF 杂乱无章
> 展示如何用OpenClaw自动收集各平台内容、AI智能分类打标签、统一存储建立索引，并支持与Obsidian/Notion等笔记软件联动，让知识真正"活"起来。

**系列教程第 16 篇** | **阅读时长:15-20 分钟**

---

## 场景背景

### 知识管理的困境

你是否遇到过这样的问题:

- 收藏了 1000+ 文章,但几乎从不回顾
- 下载了无数 PDF 资料,却找不到想找的那份
- 笔记散落在各个平台:Notion、语雀、印象笔记...
- 文件夹结构混乱,整理起来无从下手

**问题本质**:
- 收集容易,整理难
- 缺乏统一的分类和标签
- 难以检索和关联

---

### 自动化目标

用 OpenClaw 实现:

1. 自动收集各平台内容
2. 智能分类和打标签
3. 统一存储到知识库
4. 建立索引便于检索
5. 与笔记软件联动

**价值**:让知识真正"活"起来,不再沉睡。

---

## 一、需求分析:知识库的结构设计

### 知识库结构

一个良好的知识库应该有清晰的结构:

```
knowledge_base/
├── inbox/           # 收集箱(待整理)
│   ├── articles/
│   ├── pdfs/
│   └── notes/
├── projects/        # 项目相关
│   ├── project_a/
│   └── project_b/
├── topics/          # 主题分类
│   ├── programming/
│   ├── design/
│   ├── management/
│   └── productivity/
├── references/      # 参考资料
│   ├── api_docs/
│   ├── tutorials/
│   └── papers/
└── archive/         # 归档
    └── 2025/
```

---

### 元数据设计

每个知识条目应有以下元数据:

| 字段 | 说明 | 示例 |
|------|------|------|
| 标题 | 文章标题 | "OpenClaw 入门教程" |
| 类型 | 内容类型 | article, pdf, note |
| 来源 | 来源平台 | 微信公众号、掘金 |
| 标签 | 分类标签 | AI, 教程, 自动化 |
| 创建时间 | 收集时间 | 2026-03-11 |
| 更新时间 | 最后更新 | 2026-03-11 |
| 重要程度 | 优先级 | 高、中、低 |
| 状态 | 处理状态 | 未读、已读、归档 |
| 路径 | 存储位置 | /topics/programming/ |

---

### 索引设计

创建全文索引,支持快速检索:

```json
{
  "index": {
    "title": "OpenClaw 入门教程",
    "content_hash": "abc123",
    "keywords": ["OpenClaw", "AI", "自动化", "教程"],
    "summary": "本文介绍 OpenClaw 的基本概念和使用方法...",
    "related": ["article_001", "article_002"],
    "tags": ["AI", "教程", "自动化"],
    "created_at": "2026-03-11T10:00:00Z",
    "path": "/topics/programming/openclaw-tutorial.md"
  }
}
```

---

## 二、技能选择:pdf + browser + 自定义整理

本案例需要多个技能配合:

| 技能 | 用途 | 关键操作 |
|------|------|---------|
| pdf | 处理 PDF 文件 | 提取文字、识别内容 |
| browser | 抓取网页内容 | 提取文章、保存内容 |
| llm | 智能分类 | 生成摘要、提取标签 |
| fs | 文件管理 | 移动、重命名 |

安装技能:

```bash
openclaw skill install pdf browser
```

---

## 三、自动分类:基于内容的智能归类

### 分类方法

#### 方法 1:关键词匹配

根据关键词自动分类:

```json
{
  "rules": [
    {
      "category": "programming",
      "keywords": ["代码", "编程", "开发", "Python", "JavaScript"]
    },
    {
      "category": "design",
      "keywords": ["设计", "UI", "UX", "视觉", "交互"]
    },
    {
      "category": "management",
      "keywords": ["管理", "团队", "协作", "项目"]
    }
  ]
}
```

---

#### 方法 2:AI 智能分类

使用 LLM 分析内容,自动判断分类:

```json
{
  "classifier": {
    "type": "llm",
    "prompt": "分析以下内容,判断它属于哪个主题类别,并给出标签",
    "categories": ["programming", "design", "management", "productivity", "other"]
  }
}
```

**示例**:

输入:
```
标题:OpenClaw 自动化入门
内容:OpenClaw 是一个 AI 自动化工具,可以帮助你处理文档...
```

输出:
```json
{
  "category": "productivity",
  "tags": ["AI", "自动化", "效率工具"],
  "confidence": 0.95
}
```

---

### 分类流程

```
新内容
   ↓
提取文字内容
   ↓
AI 分析分类
   ↓
生成标签和摘要
   ↓
移动到对应目录
   ↓
更新索引
```

---

## 四、标签与索引:便于后续检索

### 标签系统

#### 标签层级

```
标签体系
├── 领域
│   ├── 技术
│   │   ├── 前端
│   │   ├── 后端
│   │   └── AI
│   ├── 设计
│   └── 管理
├── 类型
│   ├── 教程
│   ├── 案例
│   └── 工具
└── 状态
    ├── 未读
    ├── 已读
    └── 归档
```

#### 标签规则

```json
{
  "tagging_rules": {
    "auto_tags": true,
    "min_tags": 2,
    "max_tags": 5,
    "allowed_tags": "./tags_list.json"
  }
}
```

---

### 索引构建

#### 全文索引

使用 Elasticsearch 或本地索引:

```json
{
  "index_config": {
    "fields": ["title", "content", "tags", "summary"],
    "analyzer": "chinese",
    "store_source": true
  }
}
```

#### 检索示例

```bash
# 搜索包含"OpenClaw"的内容
openclaw knowledge search "OpenClaw"

# 按标签筛选
openclaw knowledge search --tags "AI,自动化"

# 组合查询
openclaw knowledge search "教程" --category programming --status unread
```

---

## 五、与笔记软件联动

### 支持的笔记软件

| 软件 | 集成方式 | 说明 |
|------|---------|------|
| Obsidian | 文件系统 | 直接操作 Markdown 文件 |
| Notion | API | 通过官方 API 集成 |
| 语雀 | API | 通过官方 API 集成 |
| 印象笔记 | API | 通过第三方工具 |

---

### Obsidian 集成示例

Obsidian 基于 Markdown 文件,可以直接集成:

```json
{
  "obsidian": {
    "vault_path": "~/Documents/obsidian/MyVault",
    "inbox_folder": "Inbox",
    "auto_frontmatter": true,
    "frontmatter_template": {
      "title": "{{title}}",
      "date": "{{created_at}}",
      "tags": "{{tags}}",
      "source": "{{source_url}}",
      "status": "{{status}}"
    }
  }
}
```

**生成结果**:

```markdown
---
title: OpenClaw 自动化入门
date: 2026-03-11
tags: [AI, 自动化, 教程]
source: https://example.com/article/123
status: unread
---

# OpenClaw 自动化入门

OpenClaw 是一个 AI 自动化工具...

[阅读原文](https://example.com/article/123)
```

---

### Notion 集成示例

通过 Notion API 集成:

```json
{
  "notion": {
    "api_key": "{{env.NOTION_API_KEY}}",
    "database_id": "xxx-xxx-xxx",
    "properties_mapping": {
      "标题": "title",
      "标签": "multi_select",
      "来源": "url",
      "状态": "select",
      "创建时间": "date"
    }
  }
}
```

---

## 完整工作流配置

创建 `knowledge_organizer.json`:

```json
{
  "name": "知识库自动整理",
  "description": "自动收集、分类、整理知识内容",
  "version": "1.0",
  "trigger": {
    "type": "manual"
  },
  "inputs": {
    "source_dir": "./inbox/",
    "knowledge_base": "./knowledge_base/",
    "note_app": "obsidian"
  },
  "steps": [
    {
      "id": "step1_scan_new_content",
      "name": "扫描新内容",
      "skill": "fs",
      "command": "scan",
      "params": {
        "path": "{{inputs.source_dir}}",
        "file_types": ["pdf", "md", "html", "txt"]
      },
      "output": "new_files"
    },
    {
      "id": "step2_extract_content",
      "name": "提取内容",
      "skill": "multi",
      "command": "extract",
      "params": {
        "files": "{{new_files}}",
        "handlers": {
          "pdf": "pdf.extract-text",
          "html": "browser.extract-article",
          "md": "fs.read-text",
          "txt": "fs.read-text"
        }
      },
      "output": "raw_contents"
    },
    {
      "id": "step3_analyze_classify",
      "name": "分析并分类",
      "skill": "llm",
      "command": "classify",
      "params": {
        "contents": "{{raw_contents}}",
        "task": "分析内容,给出分类、标签和摘要",
        "output_format": {
          "title": "string",
          "category": "string",
          "tags": "array",
          "summary": "string(200字以内)",
          "importance": "high|medium|low"
        }
      },
      "output": "analyzed_data"
    },
    {
      "id": "step4_determine_path",
      "name": "确定存储路径",
      "skill": "custom",
      "command": "determine-path",
      "params": {
        "category": "{{analyzed_data.category}}",
        "importance": "{{analyzed_data.importance}}",
        "date": "{{date}}",
        "base_path": "{{inputs.knowledge_base}}"
      },
      "output": "target_paths"
    },
    {
      "id": "step5_organize_files",
      "name": "整理文件",
      "skill": "fs",
      "command": "organize",
      "params": {
        "files": "{{new_files}}",
        "target_paths": "{{target_paths}}",
        "add_frontmatter": true,
        "frontmatter": {
          "title": "{{analyzed_data.title}}",
          "tags": "{{analyzed_data.tags}}",
          "summary": "{{analyzed_data.summary}}",
          "date": "{{date}}",
          "status": "unread"
        }
      },
      "output": "organized_files"
    },
    {
      "id": "step6_update_index",
      "name": "更新索引",
      "skill": "search",
      "command": "index",
      "params": {
        "files": "{{organized_files}}",
        "index_path": "{{inputs.knowledge_base}}/index.json",
        "fields": ["title", "tags", "summary", "content"]
      }
    },
    {
      "id": "step7_sync_to_notes",
      "name": "同步到笔记软件",
      "skill": "{{inputs.note_app}}",
      "command": "sync",
      "params": {
        "files": "{{organized_files}}",
        "sync_mode": "add"
      },
      "condition": "{{inputs.note_app != 'none'}}"
    },
    {
      "id": "step8_generate_report",
      "name": "生成整理报告",
      "skill": "xlsx",
      "command": "create",
      "params": {
        "data": "{{analyzed_data}}",
        "file": "./reports/knowledge_report_{{date}}.xlsx",
        "columns": ["标题", "分类", "标签", "重要程度", "状态", "路径"]
      }
    }
  ],
  "outputs": {
    "report": "./reports/knowledge_report_{{date}}.xlsx",
    "indexed": "{{organized_files.count}}"
  }
}
```

---

## 执行效果

### 执行命令

```bash
openclaw workflow run knowledge_organizer.json
```

---

### 执行日志

```
执行工作流:知识库自动整理
─────────────────────────────
[1/8] 扫描新内容...
      ✓ 发现 15 个新文件
      - PDF: 8 个
      - 文章: 5 个
      - 笔记: 2 个

[2/8] 提取内容...
      ✓ 已提取 15 个文件的内容

[3/8] 分析并分类...
      使用 AI 分析内容...
      ✓ 分析完成

      分类结果:
      ├─ programming: 5 篇
      ├─ design: 3 篇
      ├─ productivity: 4 篇
      └─ management: 3 篇

[4/8] 确定存储路径...
      ✓ 路径已确定

[5/8] 整理文件...
      ✓ 已整理并移动文件
      ✓ 已添加元数据

[6/8] 更新索引...
      ✓ 索引已更新
      当前索引条目: 1,234 条

[7/8] 同步到笔记软件...
      同步至 Obsidian...
      ✓ 已同步 15 条到 Obsidian

[8/8] 生成整理报告...
      ✓ 已生成报告

─────────────────────────────
✓ 工作流执行成功!

处理结果:
  新增内容: 15 条
  索引总数: 1,234 条
  
输出文件:
  - knowledge_report_2026-03-11.xlsx

已同步至 Obsidian
```

---

### 整理结果示例

**原始文件**:
```
inbox/
├── article_001.pdf
├── article_002.html
└── note_003.txt
```

**整理后**:

```
knowledge_base/
├── topics/
│   ├── programming/
│   │   ├── 2026-03-11_python-best-practices.md
│   │   └── 2026-03-11_web-performance.md
│   └── productivity/
│       └── 2026-03-11_time-management-tips.md
└── references/
    └── papers/
        └── 2026-03-11_ai-research.pdf
```

**Markdown 文件内容**:

```markdown
---
title: Python 最佳实践指南
tags: [Python, 编程, 最佳实践]
summary: 本文总结了 Python 开发中的最佳实践,包括代码风格、性能优化等
date: 2026-03-11
status: unread
importance: high
source: https://example.com/python-best-practices
---

# Python 最佳实践指南

[原文内容...]

## 关键要点

1. 遵循 PEP 8 代码风格
2. 使用类型注解提高代码可读性
3. 编写单元测试保证质量
```

---

## 小结

本案例展示了如何用 OpenClaw 实现知识库自动整理:

1. ✅ 自动扫描和收集内容
2. ✅ AI 智能分类和打标签
3. ✅ 自动整理文件结构
4. ✅ 建立全文索引
5. ✅ 与笔记软件联动

通过自动化整理,知识不再沉睡,真正成为你的资产。

---

## 下篇预告

实战篇到此结束,下一篇我们进入高级篇,学习如何编写自己的技能。

> **下一篇**:如何编写自己的技能?

---

