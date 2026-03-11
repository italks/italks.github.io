# 浏览器自动化:让 OpenClaw 帮你"上网办事"

> **核心问题**:网页操作能自动化吗?

---

## 浏览器自动化:从手动到自动

日常工作中,你可能需要:

- 定期访问某个网站查看更新
- 重复填写相同的网页表单
- 从多个网页复制粘贴信息
- 截图保存网页内容

这些看似简单的操作,当频率变高时,就成了"时间黑洞"。

浏览器自动化,就是让 OpenClaw 代替你操作浏览器,自动完成这些重复性网页任务。

---

## 一、浏览器自动化技能介绍

### 安装 browser 技能

```bash
openclaw skill install browser
```

或安装更强大的 `playwright-cli`:

```bash
openclaw skill install playwright-cli
```

> 本篇以 `playwright-cli` 为例,功能更全面。

---

### 核心能力

| 能力 | 说明 | 应用场景 |
|------|------|---------|
| 打开网页 | 访问指定 URL | 网页浏览 |
| 点击元素 | 点击按钮、链接 | 表单提交、导航 |
| 输入文字 | 在输入框填入内容 | 表单填写 |
| 截图 | 保存网页截图 | 记录、存档 |
| 提取数据 | 抓取网页内容 | 数据收集 |
| 执行脚本 | 运行 JavaScript | 高级定制 |

---

### 浏览器选择

Playwright 支持三种浏览器:

| 浏览器 | 命令参数 | 特点 |
|--------|---------|------|
| Chromium | `--browser chromium` | 速度快,兼容性好 |
| Firefox | `--browser firefox` | 隐私保护强 |
| WebKit | `--browser webkit` | 模拟 Safari |

默认使用 Chromium。

---

## 二、基础操作:打开网页、点击、输入、截图

### 1. 打开网页并截图

**场景**:打开某个网站,截图保存。

**命令**:

```bash
openclaw run playwright screenshot \
  --url "https://example.com" \
  --output screenshot.png
```

**参数说明**:
- `--url`:目标网址
- `--output`:截图保存路径

**交互模式**:

```
你:打开 https://example.com 并截图
OpenClaw:好的,正在打开网页...截图已保存为 screenshot.png
```

---

### 2. 点击元素

**场景**:点击网页上的按钮。

**命令**:

```bash
openclaw run playwright click \
  --url "https://example.com" \
  --selector "button.submit" \
  --screenshot result.png
```

**参数说明**:
- `--selector`:CSS 选择器,定位要点击的元素

**如何获取选择器**:
1. 打开浏览器开发者工具(F12)
2. 右键点击目标元素→检查
3. 右键 HTML 元素→Copy→Copy selector

---

### 3. 输入文字

**场景**:在搜索框输入关键词。

**命令**:

```bash
openclaw run playwright fill \
  --url "https://www.google.com" \
  --selector "input[name='q']" \
  --text "OpenClaw" \
  --screenshot search_result.png
```

---

### 4. 组合操作:搜索并截图

**场景**:在搜索引擎搜索关键词,截图结果页。

**命令**:

```bash
openclaw run playwright script \
  --url "https://www.google.com" \
  --actions '[
    {"type": "fill", "selector": "input[name=\"q\"]", "text": "OpenClaw"},
    {"type": "click", "selector": "input[type=\"submit\"]"},
    {"type": "wait", "duration": 2000},
    {"type": "screenshot", "output": "search_result.png"}
  ]'
```

这个命令依次执行:
1. 在搜索框输入"OpenClaw"
2. 点击搜索按钮
3. 等待 2 秒加载
4. 截图保存

---

## 三、数据抓取:从网页提取结构化数据

### 场景:从商品页面抓取信息

**需求**:从某个商品页面提取名称、价格、评分等信息。

**方法一:使用内置提取命令**

```bash
openclaw run playwright extract \
  --url "https://shop.example.com/product/123" \
  --fields '{
    "name": "h1.product-title",
    "price": "span.price",
    "rating": "span.rating-score",
    "reviews": "span.review-count"
  }' \
  --output product.json
```

输出 `product.json`:

```json
{
  "name": "智能手表 Pro",
  "price": "¥999",
  "rating": "4.8",
  "reviews": "1234"
}
```

---

**方法二:使用脚本灵活提取**

```bash
openclaw run playwright evaluate \
  --url "https://shop.example.com/product/123" \
  --script '
    return {
      name: document.querySelector("h1").textContent,
      price: document.querySelector(".price").textContent,
      rating: document.querySelector(".rating").textContent
    }
  ' \
  --output data.json
```

---

### 批量抓取

**场景**:从多个商品页面提取数据。

**步骤 1:准备 URL 列表**

创建 `urls.txt`:

```
https://shop.example.com/product/101
https://shop.example.com/product/102
https://shop.example.com/product/103
...
```

**步骤 2:批量提取**

```bash
openclaw run playwright batch-extract \
  --urls urls.txt \
  --fields '{
    "name": "h1.product-title",
    "price": "span.price"
  }' \
  --output products.xlsx
```

自动生成 Excel 文件,每行一个商品信息。

---

### 翻页抓取

**场景**:抓取多页搜索结果。

```bash
openclaw run playwright crawl \
  --url "https://shop.example.com/search?q=手表" \
  --fields '{
    "title": ".product-title",
    "price": ".product-price"
  }' \
  --next-page "a.next-page" \
  --max-pages 5 \
  --output products.xlsx
```

**参数说明**:
- `--next-page`:下一页按钮的选择器
- `--max-pages`:最多抓取几页

---

## 四、表单自动填充:告别重复录入

### 场景:自动填写日报系统

**需求**:每天需要在内部系统填写日报,字段固定,内容相似。

**传统方式**:
1. 打开系统
2. 登录
3. 进入日报页面
4. 逐个填写字段
5. 提交

**耗时**:约 5 分钟

---

### OpenClaw 自动化方案

#### 步骤 1:录制操作(可选)

OpenClaw 支持操作录制,生成脚本:

```bash
openclaw run playwright record \
  --url "https://internal.example.com" \
  --output daily_report.json
```

然后在浏览器中手动操作一遍,OpenClaw 会记录所有动作。

---

#### 步骤 2:编写自动化脚本

创建 `daily_report.json`:

```json
{
  "name": "自动填写日报",
  "steps": [
    {
      "action": "goto",
      "url": "https://internal.example.com/login"
    },
    {
      "action": "fill",
      "selector": "input[name='username']",
      "value": "{{username}}"
    },
    {
      "action": "fill",
      "selector": "input[name='password']",
      "value": "{{password}}"
    },
    {
      "action": "click",
      "selector": "button[type='submit']"
    },
    {
      "action": "wait",
      "duration": 2000
    },
    {
      "action": "goto",
      "url": "https://internal.example.com/daily-report"
    },
    {
      "action": "fill",
      "selector": "textarea[name='content']",
      "value": "{{report_content}}"
    },
    {
      "action": "click",
      "selector": "button.submit"
    },
    {
      "action": "screenshot",
      "output": "report_submitted.png"
    }
  ]
}
```

---

#### 步骤 3:执行脚本

```bash
openclaw run playwright run-script \
  --script daily_report.json \
  --vars '{
    "username": "your_username",
    "password": "your_password",
    "report_content": "今天完成了XX工作,明天计划..."
  }'
```

**耗时**:约 10 秒

---

### 安全提示

> ⚠️ 密码明文存储有安全风险,建议:
> 1. 使用环境变量:`{{env.PASSWORD}}`
> 2. 或使用 OpenClaw 的密钥管理功能
> 3. 不要将包含密码的文件提交到 Git

---

## 五、实战案例:自动填写日报系统

### 完整场景

**背景**:公司内部系统,每天需要填写工作日报。

**字段**:
- 今日工作内容
- 明日计划
- 遇到的问题
- 工时

**需求**:根据本地记录文件,自动填写提交。

---

### 实现方案

#### 1. 数据源:本地记录

创建 `work_log.md`:

```markdown
## 今日工作
- 完成功能开发
- 参与需求评审
- 修复线上 Bug

## 明日计划
- 开始新功能开发
- 代码评审

## 问题
- 测试环境不稳定

## 工时
8 小时
```

---

#### 2. 转换脚本

创建 `fill_daily_report.json`:

```json
{
  "name": "日报自动提交",
  "steps": [
    {
      "action": "login",
      "url": "https://internal.company.com/login",
      "username": "{{env.USERNAME}}",
      "password": "{{env.PASSWORD}}"
    },
    {
      "action": "goto",
      "url": "https://internal.company.com/daily-report/new"
    },
    {
      "action": "fill",
      "selector": "#today-work",
      "value": "{{today_work}}"
    },
    {
      "action": "fill",
      "selector": "#tomorrow-plan",
      "value": "{{tomorrow_plan}}"
    },
    {
      "action": "fill",
      "selector": "#issues",
      "value": "{{issues}}"
    },
    {
      "action": "fill",
      "selector": "#hours",
      "value": "8"
    },
    {
      "action": "click",
      "selector": "button[type='submit']"
    },
    {
      "action": "wait",
      "duration": 1000
    },
    {
      "action": "screenshot",
      "output": "daily_report_{{date}}.png"
    }
  ]
}
```

---

#### 3. 执行脚本

```bash
# 从工作记录提取内容
TODAY_WORK=$(grep -A 10 "## 今日工作" work_log.md | tail -n +2)
TOMORROW_PLAN=$(grep -A 10 "## 明日计划" work_log.md | tail -n +2)
ISSUES=$(grep -A 10 "## 问题" work_log.md | tail -n +2)

# 执行自动化
openclaw run playwright run-script \
  --script fill_daily_report.json \
  --vars "{
    \"today_work\": \"$TODAY_WORK\",
    \"tomorrow_plan\": \"$TOMORROW_PLAN\",
    \"issues\": \"$ISSUES\",
    \"date\": \"$(date +%Y-%m-%d)\"
  }"
```

---

#### 4. 定时自动执行

设置每天下午 5 点自动执行:

```bash
openclaw automation create \
  --name "日报自动提交" \
  --schedule "FREQ=DAILY;BYHOUR=17;BYMINUTE=0" \
  --script fill_daily_report.json
```

---

## 高级技巧:处理复杂场景

### 技巧 1:等待动态内容

某些页面内容是动态加载的,需要等待:

```json
{
  "action": "wait-for-selector",
  "selector": ".content-loaded",
  "timeout": 5000
}
```

或等待固定时间:

```json
{
  "action": "wait",
  "duration": 3000
}
```

---

### 技巧 2:处理弹窗

```json
{
  "action": "click",
  "selector": "button.close-modal"
}
```

---

### 技巧 3:处理下拉选择

```json
{
  "action": "select",
  "selector": "select.department",
  "value": "tech"
}
```

---

### 技巧 4:处理多标签页

```json
{
  "action": "new-tab",
  "url": "https://example.com"
}
```

---

## 小结

这一篇,你学会了:

1. ✅ 浏览器自动化基础操作:打开、点击、输入、截图
2. ✅ 从网页提取结构化数据
3. ✅ 表单自动填充
4. ✅ 实战案例:自动填写日报系统
5. ✅ 高级技巧:处理动态内容、弹窗等

浏览器自动化让 OpenClaw 的能力从本地扩展到网络,实现更广泛的自动化场景。

---

## 下篇预告

单一技能已经很强大,但如果能组合多个技能呢?下一篇,我们学习技能组合拳,完成更复杂的任务。

> **下一篇**:技能组合拳:多个技能协同完成复杂任务

---

*系列教程第 10 篇*
*阅读时长:10-12 分钟*
