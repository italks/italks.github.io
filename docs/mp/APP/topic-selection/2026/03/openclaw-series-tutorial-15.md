# 实战案例 3—— 竞品信息自动监控

> **场景**:定期监控竞品网站,收集更新信息

---

## 场景背景

### 业务需求

某公司市场部需要持续监控竞品动态:

- **监控对象**:5 个主要竞品官网
- **监控内容**:产品更新、价格变化、新功能发布
- **监控频率**:每天一次
- **输出**:变化报告 + 异常提醒

**传统方式**:
- 每天人工访问各网站
- 手动记录变化
- 对比历史数据
- 整理报告

**耗时**:约 30 分钟/天

**痛点**:
- 容易遗漏更新
- 难以对比历史数据
- 重复性高

---

### 自动化目标

用 OpenClaw 实现:

1. 定时访问竞品网站
2. 自动抓取关键信息
3. 对比历史数据,识别变化
4. 生成变化报告
5. 异常时自动通知

**预期耗时**:自动化,仅需查看报告

---

## 一、需求分析:监控什么、多久一次

### 监控维度

| 维度 | 具体内容 | 监控频率 | 重要程度 |
|------|---------|---------|---------|
| 产品功能 | 新功能发布、功能更新 | 每天 | 高 |
| 价格策略 | 定价变化、促销活动 | 每天 | 高 |
| 内容更新 | 博客文章、新闻动态 | 每天 | 中 |
| 页面结构 | 网站改版、UI 调整 | 每周 | 低 |

---

### 监控对象

定义监控列表:

```json
{
  "competitors": [
    {
      "name": "竞品A",
      "url": "https://competitor-a.com",
      "pages": [
        {
          "path": "/products",
          "watch": ["产品列表", "价格"]
        },
        {
          "path": "/pricing",
          "watch": ["价格表"]
        },
        {
          "path": "/blog",
          "watch": ["最新文章"]
        }
      ]
    },
    {
      "name": "竞品B",
      "url": "https://competitor-b.com",
      "pages": [
        {
          "path": "/features",
          "watch": ["功能列表"]
        },
        {
          "path": "/pricing",
          "watch": ["价格"]
        }
      ]
    }
  ]
}
```

---

### 监控频率

| 内容 | 频率 | 执行时间 |
|------|------|---------|
| 价格监控 | 每天 | 10:00 |
| 功能监控 | 每天 | 10:00 |
| 内容监控 | 每天 | 10:00 |
| 结构监控 | 每周 | 周一 10:00 |

---

## 二、技能选择:browser + xlsx + email

本案例需要三个技能:

| 技能 | 用途 | 关键操作 |
|------|------|---------|
| browser | 网页访问和抓取 | 定时访问、提取数据 |
| xlsx | 数据存储和对比 | 历史数据、变化检测 |
| email | 通知提醒 | 发送变化报告 |

安装技能:

```bash
openclaw skill install browser xlsx email
```

---

## 三、定时任务配置:让 OpenClaw 自动执行

### 配置定时任务

OpenClaw 支持通过 cron 表达式配置定时任务:

```bash
openclaw automation create \
  --name "竞品监控" \
  --schedule "0 10 * * *" \
  --workflow competitor_monitor.json
```

**Cron 表达式说明**:
```
┌───────────── 分钟 (0-59)
│ ┌───────────── 小时 (0-23)
│ │ ┌───────────── 日 (1-31)
│ │ │ ┌───────────── 月 (1-12)
│ │ │ │ ┌───────────── 星期 (0-7, 0和7都是周日)
│ │ │ │ │
* * * * *
```

**常用示例**:
- `0 10 * * *`:每天 10:00
- `0 9,18 * * *`:每天 9:00 和 18:00
- `0 10 * * 1-5`:工作日 10:00
- `0 10 * * 1`:每周一 10:00

---

### 定时任务管理

查看所有定时任务:

```bash
openclaw automation list
```

输出:

```
定时任务列表:
─────────────────────────────
ID    名称         频率        状态
001   竞品监控      每天10:00   运行中
002   周报生成      每周五17:00 运行中
```

暂停任务:

```bash
openclaw automation pause 001
```

恢复任务:

```bash
openclaw automation resume 001
```

---

## 四、变化检测:对比历史数据

### 数据存储结构

每次监控的数据保存到 Excel:

```
competitor_data/
├── competitor_a/
│   ├── 2026-03-10.xlsx
│   ├── 2026-03-11.xlsx
│   └── latest.xlsx
├── competitor_b/
│   ├── 2026-03-10.xlsx
│   ├── 2026-03-11.xlsx
│   └── latest.xlsx
└── history/
    └── all_changes.xlsx
```

---

### 变化检测逻辑

```
今日数据 vs 昨日数据
   ↓
对比各字段
   ↓
发现差异? ─是→ 记录变化
   ↓否          ↓
无变化      计算变化幅度
              ↓
         生成变化报告
```

---

### 变化类型

| 变化类型 | 说明 | 举例 |
|---------|------|------|
| 新增 | 新出现的内容 | 新功能上线 |
| 删除 | 内容被移除 | 下架产品 |
| 修改 | 内容发生变化 | 价格调整 |
| 数值变化 | 数值增减 | 用户数增长 |

---

## 五、通知机制:有变化时自动提醒

### 通知规则

根据变化重要性分级通知:

| 变化等级 | 触发条件 | 通知方式 |
|---------|---------|---------|
| 紧急 | 价格大幅调整(>10%) | 立即邮件 + 微信 |
| 重要 | 新功能发布 | 当日邮件汇总 |
| 一般 | 内容更新 | 周报汇总 |
| 忽略 | 微小变化 | 仅记录,不通知 |

---

### 邮件通知配置

```json
{
  "notifications": {
    "email": {
      "to": ["market@company.com", "leader@company.com"],
      "subject": "【竞品监控】{{date}} 变化报告",
      "template": "change_report.html",
      "attach_report": true
    }
  }
}
```

---

## 完整工作流配置

创建 `competitor_monitor.json`:

```json
{
  "name": "竞品信息自动监控",
  "description": "定时监控竞品网站,检测变化并发送通知",
  "version": "1.0",
  "trigger": {
    "type": "schedule",
    "cron": "0 10 * * *"
  },
  "inputs": {
    "config_file": "./competitor_config.json"
  },
  "steps": [
    {
      "id": "step1_load_config",
      "name": "加载监控配置",
      "skill": "fs",
      "command": "read-json",
      "params": {
        "file": "{{inputs.config_file}}"
      },
      "output": "monitor_config"
    },
    {
      "id": "step2_fetch_data",
      "name": "抓取竞品数据",
      "skill": "browser",
      "command": "batch-fetch",
      "params": {
        "targets": "{{monitor_config.competitors}}",
        "extract_rules": {
          "products": ".product-list .product-name",
          "prices": ".price",
          "features": ".feature-list li"
        }
      },
      "output": "current_data",
      "concurrency": 3
    },
    {
      "id": "step3_load_history",
      "name": "加载历史数据",
      "skill": "xlsx",
      "command": "read",
      "params": {
        "file": "./competitor_data/history/latest.xlsx"
      },
      "output": "history_data",
      "on_error": "return_empty"
    },
    {
      "id": "step4_detect_changes",
      "name": "检测变化",
      "skill": "xlsx",
      "command": "compare",
      "params": {
        "current": "{{current_data}}",
        "history": "{{history_data}}",
        "compare_fields": ["products", "prices", "features"],
        "threshold": {
          "price_change": 0.05,
          "feature_add": 1
        }
      },
      "output": "changes"
    },
    {
      "id": "step5_save_data",
      "name": "保存数据",
      "skill": "xlsx",
      "command": "save",
      "params": {
        "data": "{{current_data}}",
        "file": "./competitor_data/{{date}}.xlsx"
      }
    },
    {
      "id": "step6_generate_report",
      "name": "生成变化报告",
      "skill": "xlsx",
      "command": "create",
      "params": {
        "data": "{{changes}}",
        "file": "./reports/competitor_changes_{{date}}.xlsx",
        "format": {
          "highlight_changes": true,
          "add_summary": true
        }
      },
      "output": "report_file"
    },
    {
      "id": "step7_evaluate_importance",
      "name": "评估重要性",
      "skill": "llm",
      "command": "evaluate",
      "params": {
        "changes": "{{changes}}",
        "criteria": {
          "紧急": "价格变化>10% 或 重大功能发布",
          "重要": "新功能 或 价格变化>5%",
          "一般": "内容更新"
        }
      },
      "output": "importance"
    },
    {
      "id": "step8_send_notification",
      "name": "发送通知",
      "skill": "email",
      "command": "send",
      "params": {
        "to": "{{monitor_config.notification_recipients}}",
        "subject": "【竞品监控】{{date}} 变化报告 - {{importance.level}}",
        "body": "{{changes.summary}}",
        "attachments": ["{{report_file}}"]
      },
      "condition": "{{changes.count > 0}}"
    }
  ],
  "outputs": {
    "report": "./reports/competitor_changes_{{date}}.xlsx",
    "changes_detected": "{{changes.count}}"
  }
}
```

---

## 执行效果

### 自动执行日志

```
[2026-03-11 10:00:00] 竞品监控任务启动
─────────────────────────────
[10:00:01] 加载监控配置...✓
[10:00:02] 抓取竞品数据(3个并发)...
          ├─ 竞品A: ✓ 完成
          ├─ 竞品B: ✓ 完成
          └─ 竞品C: ✓ 完成
[10:00:45] 数据抓取完成
[10:00:46] 加载历史数据...✓
[10:00:47] 检测变化...
          ├─ 竞品A: 发现 2 处变化
          │   - 价格调整: ¥999 → ¥899 (-10%)
          │   - 新增功能: AI 助手
          ├─ 竞品B: 无变化
          └─ 竞品C: 发现 1 处变化
              - 新文章: 《产品更新说明》
[10:00:50] 检测完成,共发现 3 处变化
[10:00:51] 保存数据...✓
[10:00:52] 生成报告...✓
[10:00:53] 评估重要性...
          等级: 重要
          原因: 竞品A价格下调10%,且新增AI功能
[10:00:54] 发送通知...✓
           已发送至: market@company.com
─────────────────────────────
[2026-03-11 10:00:55] 任务完成
```

---

### 变化报告

**邮件内容**:

```
主题:【竞品监控】2026-03-11 变化报告 - 重要

竞品监控日报
═══════════════════════════

监测时间: 2026-03-11 10:00
监控对象: 3 个竞品
变化数量: 3 处

━━━━━━━━━━━━━━━━━━━━━━━━━

【竞品A】- 2 处变化

⚠ 价格调整
  原价格: ¥999
  新价格: ¥899
  变化幅度: -10%
  
  💡 分析: 大幅降价,可能应对市场竞争

✨ 新增功能
  功能名称: AI 助手
  功能描述: 智能对话与内容生成
  
  💡 分析: 跟进 AI 趋势,可能影响产品竞争力

━━━━━━━━━━━━━━━━━━━━━━━━━

【竞品B】- 无变化

━━━━━━━━━━━━━━━━━━━━━━━━━

【竞品C】- 1 处变化

📄 新文章
  标题: 《产品更新说明》
  发布时间: 2026-03-10
  链接: https://competitor-c.com/blog/xxx

━━━━━━━━━━━━━━━━━━━━━━━━━

【建议行动】

1. 关注竞品A价格策略,评估是否调整定价
2. 研究 AI 助手功能,考虑跟进或差异化
3. 持续监控竞品C内容动态

━━━━━━━━━━━━━━━━━━━━━━━━━

详细数据见附件

OpenClaw 自动监控
```

---

### 历史趋势分析

积累一段时间后,可以分析趋势:

```
竞品A价格趋势
─────────────────────
日期        价格    变化
2026-03-01  ¥1099   -
2026-03-05  ¥999    -9%
2026-03-11  ¥899    -10%
```

可视化图表:

```
价格趋势
¥1200 ┤
¥1100 ┤●
¥1000 ┤  ●
¥ 900 ┤    ●
      └────────
      3/1 3/5 3/11
```

---

## 小结

本案例展示了如何用 OpenClaw 实现竞品自动监控:

1. ✅ 定时自动访问竞品网站
2. ✅ 抓取关键信息
3. ✅ 对比历史数据检测变化
4. ✅ 生成变化报告
5. ✅ 重要变化自动通知

通过自动化监控,市场团队可以及时掌握竞品动态,做出快速响应。

---

## 下篇预告

下一篇,我们学习个人知识库自动整理案例。

> **下一篇**:实战案例 4—— 个人知识库自动整理

---

*系列教程第 15 篇*
*阅读时长:12-15 分钟*
