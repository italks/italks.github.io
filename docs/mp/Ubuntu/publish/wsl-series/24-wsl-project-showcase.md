# WSL 实战项目合集：从个人博客到微服务的完整案例

> **阅读时长**：约 12 分钟 | **难度等级**：⭐⭐⭐⭐ 综合实战
> **本篇关键词**：WSL / 项目实战 / 全栈开发 / Docker / 博客 / API / 数据分析
>
> 学了这么多知识，是时候动手做几个完整项目了！4 个由浅入深的实战案例，覆盖 Web 开发、API 服务、容器化部署、数据分析——把前面学到的全部串联起来。

---

## 实战一：个人博客站点（入门级 ⭐）

### 目标
用 Python + FastAPI 在 WSL 中搭建一个简单的个人博客后端。

### Step 1：创建项目结构

```bash
mkdir -p ~/projects/blog-api && cd ~/projects/blog-api
python3 -m venv .venv && source .venv/bin/activate
pip install fastapi uvicorn sqlalchemy pydantic python-multipart
```

```
blog-api/
├── .venv/
├── app/
│   ├── __init__.py
│   ├── main.py           # FastAPI 主应用
│   ├── models.py         # 数据模型
│   ├── database.py       # 数据库连接
│   └── routers/
│       └── posts.py      # 文章路由
├── requirements.txt
└── README.md
```

### Step 2：编写代码

```python
# app/models.py
from pydantic import BaseModel, HttpURL
from datetime import datetime
from typing import Optional

class PostBase(BaseModel):
    title: str
    content: str
    author: str = "Anonymous"
    tags: list[str] = []

class PostCreate(PostBase):
    pass

class Post(PostBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
```

```python
# app/routers/posts.py
from fastapi import APIRouter, HTTPException
from typing import List
from ..models import Post, PostCreate

router = APIRouter(prefix="/api/posts", tags=["posts"])

# 模拟数据存储（生产环境应使用数据库）
posts_db: List[dict] = []
_next_id = 1

@router.get("", response_model=List[Post])
async def list_posts():
    return posts_db

@router.post("", response_model=Post, status_code=201)
async def create_post(post: PostCreate):
    global _next_id
    new_post = {
        "id": _next_id,
        "title": post.title,
        "content": post.content,
        "author": post.author,
        "tags": post.tags,
        "created_at": datetime.now()
    }
    _next_id += 1
    posts_db.append(new_post)
    return new_post

@router.get("/{post_id}")
async def get_post(post_id: int):
    for post in posts_db:
        if post["id"] == post_id:
            return post
    raise HTTPException(status_code=404, detail="Post not found")

@router.put("/{post_id}")
async def update_post(post_id: int, post: PostCreate):
    for i, p in enumerate(posts_db):
        if p["id"] == post_id:
            posts_db[i] = {**p, **post.model_dump(), "updated_at": datetime.now()}
            return posts_db[i]
    raise HTTPException(status_code=404, detail="Post not found")
```

```python
# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.posts import router as posts_router

app = FastAPI(
    title="Blog API",
    description="在 WSL 中搭建的个人博客 API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(posts_router)

@app.get("/")
async def root():
    return {"message": "Welcome to Blog API on WSL!", 
            "docs": "/docs",
            "health": "/health"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "platform": "wsl-ubuntu", "posts_count": len(posts_db)}
```

### Step 3：运行与测试

```bash
cd ~/projects/blog-api
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

打开浏览器访问：
- `http://localhost:8000` — 根路径
- `http://localhost:8000/docs` — Swagger UI（可在线测试所有接口）🎉

```bash
# 用 httpie 测试 API
http GET :8000/api/posts                    # 获取文章列表
http POST :8000/api/posts title="Hello WSL" content="我的第一篇博客" author="张三"
http GET :8000/api/posts/1                  # 获取第一篇文章
```

---

## 实战二：REST API + Docker Compose（进阶级 ⭐⭐）

### 目标
将博客 API 容器化，加上 PostgreSQL 和 Redis，用 Docker Compose 编排。

### docker-compose.yml

```yaml
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://dev:dev@db:5432/blogdb
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    volumes:
      - .:/app          # 实时同步代码修改
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: blogdb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redisdata:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - api
    restart: unless-stopped

volumes:
  pgdata:
  redisdata:
```

### Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 一键启动

```bash
docker compose up -d --build
docker compose ps              # 查看状态
docker compose logs -f api     # 查看 API 日志
```

访问 `http://localhost` 即可看到通过 Nginx 代理的 API。

---

## 实战三：数据分析可视化项目（⭐⭐⭐）

### 目标
用 Python 在 WSL 中抓取数据、分析并生成可视化图表，通过 Jupyter Notebook 展示。

```bash
mkdir -p ~/projects/data-viz && cd ~/projects/data-viz
source ~/.local/bin/activate   # 或你的虚拟环境
pip install jupyterlab pandas matplotlib seaborn plotly requests numpy
```

### 分析脚本

```python
# analysis.py — GitHub 热门项目分析
import requests
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

# 1. 获取 GitHub 搜索结果
def fetch_repos(query="stars:>1000", per_page=30):
    url = "https://api.github.com/search/repositories"
    params = {"q": query, "sort": "stars", "per_page": per_page}
    headers = {"Accept": "application/vnd.github.v3+json"}
    resp = requests.get(url, params=params, headers=headers)
    data = resp.json()["items"]
    return [{
        "name": item["full_name"],
        "stars": item["stargazers_count"],
        "forks": item["forks_count"],
        "language": item["language"] or "Unknown",
        "url": item["html_url"]
    } for item in data]

# 2. 分析
repos = fetch_repos("language:python stars:>50000")
df = pd.DataFrame(repos)

print("=== 数据概览 ===")
print(df.head(10))
print(f"\n语言分布:\n{df['language'].value_counts()}")
print(f"\n统计信息:\n{df[['stars', 'forks']].describe()}")

# 3. 可视化
plt.style.use('seaborn-v0_8-darkgrid')
fig, axes = plt.subplots(1, 2, figsize=(14, 6))

# Stars vs Forks 散点图
ax1 = axes[0]
scatter = ax1.scatter(df['stars'], df['forks'], c=range(len(df)), cmap='viridis', s=100, alpha=0.7)
ax1.set_xlabel('Stars (⭐)', fontsize=12)
ax1.set_ylabel('Forks (🍴)', fontsize=12)
ax1.set_title('GitHub Top Python Repos: Stars vs Forks', fontsize=14)

# 语言分布饼图
ax2 = axes[1]
lang_counts = df['language'].value_counts()
colors = plt.cm.Set3(range(len(lang_counts)))
wedges, texts, autotexts = ax2.pie(lang_counts, labels=lang_counts.index, 
                                    autopct='%1.1f%%', colors=colors, startangle=90)
ax2.set_title('Language Distribution', fontsize=14)

plt.tight_layout()
plt.savefig('github-analysis.png', dpi=150, bbox_inches='tight')
print("\n✅ 图表已保存为 github-analysis.png")
plt.show()  # WSLg 下会弹出窗口
```

```bash
# 运行分析
python analysis.py
```

---

## 实战四：自动化工作流（高级 ⭐⭐⭐⭐）

### 目标
创建一个完整的开发到部署自动化流水线：

```
代码提交 → 自动测试 → 构建 Docker 镜像 → 部署到服务器
```

### pre-commit 钩子

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.4.0
    hooks:
      - id: ruff
      - id: ruff-format
  
  - repo: https://github.com/gitleaks/gitleaks
    rev: v8.18.0
    hooks:
      - id: gitleaks
```

### GitHub Actions CI 配置

```yaml
# .github/workflows/ci.yml
name: CI Pipeline
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'
      
      - name: Install dependencies
        run: pip install -r requirements.txt
      
      - name: Run tests
        run: pytest -v --cov=app
      
      - name: Code quality check
        run: ruff check . && ruff format --check .

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Build Docker Image
        run: docker build -t my-app:${{ github.sha }} .
      
      - name: Push to Registry
        # 推送到 Docker Hub 或其他镜像仓库
        run: |
          echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u "${{ secrets.DOCKER_USERNAME }}" --password-stdin
          docker tag my-app:${{ github.sha }} myuser/myapp:latest
          docker push myuser/myapp:latest
```

---

## 项目实战总结清单

| 项目 | 技术栈 | 学到的 WSL 技能 | 难度 |
|:---|:---|:---|:---:|
| 博客 API | Python/FastAPI | 虚拟环境、包管理、uvicorn、API 测试 | ⭐ |
| 容器化部署 | Docker Compose/Nginx/PG/Redis | Docker 编排、网络配置、数据卷 | ⭐⭐ |
| 数据分析 | Jupyter/Pandas/Matplotlib | WSLg GUI、数据可视化、Jupyter Lab | ⭐⭐⭐ |
| CI/CD 流水线 | GitHub Actions/Docker/pre-commit | Git Hooks、CI/CD、容器构建推送 | ⭐⭐⭐⭐ |

---

## 🎉 系列教程总结

到这里，我们的 **WSL 完全指南系列** 25 篇文章就全部完成了！

```
═══════════════════════════════════════════════
        WSL 完全指南 — 全部 25 篇文章索引
═══════════════════════════════════════════════

【入门篇】01-06
  01. WSL 到底是什么？为什么说是神器？
  02. 安装一条龙：3种方式任你选
  03. 新手第一课：15个命令够用半年
  04. Windows和Linux文件互通：别在C盘跑代码！
  05. 网络完全指南：localhost、端口转发一网打尽
  06. GUI图形界面体验：WSLg

【实战篇】07-12
  07. VS Code + WSL Remote配置全攻略
  08. Python开发环境：vena、conda、uv怎么选？
  09. Node.js / Go / Rust 多语言开发秘诀
  10. Git工作流：SSH、别名、钩子
  11. Docker Desktop + WSL 黄金搭档
  12. 数据库全家桶：MySQL+Redis+PostgreSQL

【进阶篇】13-18
  13. 性能真相：为什么有时候比Windows还慢？
  14. .wslconfig黑魔法：内存CPU随便调
  15. 同时装5个发行版？多发行版管理
  16. systemd服务管理与开机自启
  17. 终端美化大作战：Oh My Posh + 字体
  18. USB设备连接：USB/IP硬件直通

【高手篇】19-23
  19. GPU/AI加速：CUDA + PyTorch实战
  20. 备份与迁移：换电脑不丢环境
  21. 十大常见问题排查手册
  22. Dev Container团队统一环境
  23. 8种Windows跑Linux方案横评

【实战总结】24
  24. 实战项目合集：博客/API/数据分析/CI-CD

【附录】25
  25. 常用命令速查表 + 配置模板大全

═══════════════════════════════════════════════
```

---

> **🎉 恭喜你完成了整个系列的学习！**
>
> 🐧 **UbuntuNews** — 专注 Ubuntu/Linux 技术分享
>
> 💬 哪篇文章对你帮助最大？评论区告诉我们！
