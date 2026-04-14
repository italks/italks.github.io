const { svgHeader, bgGradient, badge, save } = require('./svg-base');

// ============================================================
// 24 - 实战项目合集
// ============================================================
{
  const svg = svgHeader() + `
${bgGradient('bg24', '#0a0f1a', '#131c31')}
${badge('24')}

<text x="450" y="46" font-family="Microsoft YaHei,Arial,sans-serif" font-size="26" fill="#fff" text-anchor="middle" font-weight="bold">WSL 实战项目合集：从个人博客到微服务的完整案例</text>
<text x="450" y="70" font-family="Microsoft YaHei,Arial,sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">4 个真实项目手把手带你从零到部署上线</text>

<!-- Project 1: Blog -->
<rect x="30" y="88" width="205" height="185" rx="10" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
<rect x="42" y="100" width="180" height="30" rx="6" fill="#1e3a5f"/>
<text x="132" y="121" font-family="Microsoft YaHei,Arial" font-size="13" fill="#93c5fd" text-anchor="middle" font-weight="bold">个人博客</text>
<text x="132" y="145" font-family="Consolas,monospace" font-size="9" fill="#64748b" text-anchor="middle">Hugo / Hexo / Next.js</text>
<rect x="44" y="158" width="176" height="50" rx="4" fill="#0f172a"/>
<text x="54" y="175" font-family="Consolas,monospace" font-size="8" fill="#7ee787">$ hugo new site myblog</text>
<text x="54" y="190" font-family="Consolas,monospace" font-size="8" fill="#7ee787">$ hugo server -D</text>
<text x="54" y="202" font-family="Consolas,monospace" font-size="8" fill="#ffa657">$ deploy to Vercel/GitPages</text>
<text x="54" y="225" font-family="Consolas,monospace" font-size="8" fill="#6ee7b7" font-weight="bold"># 30分钟上线个人博客</text>
<text x="54" y="260" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">技术栈：Markdown + Git + CI-CD</text>

<!-- Project 2: REST API -->
<rect x="245" y="88" width="205" height="185" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
<rect x="257" y="100" width="180" height="30" rx="6" fill="#134e4a"/>
<text x="347" y="121" font-family="Microsoft YaHei,Arial" font-size="13" fill="#6ee7b7" text-anchor="middle" font-weight="bold">REST API 服务</text>
<text x="347" y="145" font-family="Consolas,monospace" font-size="9" fill="#64748b" text-anchor="middle">Express / FastAPI / Gin</text>
<rect x="249" y="155" width="196" height="53" rx="4" fill="#0f172a"/>
<text x="259" y="173" font-family="Consolas,monospace" font-size="8" fill="#79c0ff">GET    /api/users</text>
<text x="259" y="186" font-family="Consolas,monospace" font-size="8" fill="#7ee787">POST   /api/posts</text>
<text x="259" y="199" font-family="Consolas,monospace" font-size="8" fill="#ffa657">PUT    /api/:id</text>
<text x="259" y="228" font-family="Consolas,monospace" font-size="8" fill="#6ee7b7" font-weight="bold"># CRUD + JWT 认证 + Swagger</text>
<text x="259" y="260" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">技术栈：ORM + 数据库 + Docker</text>

<!-- Project 3: Data Analysis -->
<rect x="460" y="88" width="205" height="185" rx="10" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
<rect x="472" y="100" width="180" height="30" rx="6" fill="#451a03"/>
<text x="562" y="121" font-family="Microsoft YaHei,Arial" font-size="13" fill="#fcd34d" text-anchor="middle" font-weight="bold">数据分析项目</text>
<text x="562" y="145" font-family="Consolas,monospace" font-size="9" fill="#64748b" text-anchor="middle">Pandas / Jupyter / Plotly</text>
<rect x="464" y="153" width="192" height="57" rx="4" fill="#0f172a"/>
<text x="474" y="171" font-family="Consolas,monospace" font-size="8" fill="#a371f7">import pandas as pd</text>
<text x="474" y="184" font-family="Consolas,monospace" font-size="8" fill="#a371f7">df = pd.read_csv(...)</text>
<text x="474" y="197" font-family="Consolas,monospace" font-size="8" fill="#a371f7">df.plot(kind='bar')</text>
<text x="474" y="228" font-family="Consolas,monospace" font-size="8" fill="#6ee7b7" font-weight="bold"># 可视化报表自动生成</text>
<text x="474" y="260" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">技术栈：Python + Matplotlib + CSV</text>

<!-- Project 4: CI/CD -->
<rect x="675" y="88" width="195" height="185" rx="10" fill="#1e293b" stroke="#a855f7" stroke-width="1.5"/>
<rect x="687" y="100" width="170" height="30" rx="6" fill="#2e1065"/>
<text x="772" y="121" font-family="Microsoft YaHei,Arial" font-size="13" fill="#c084fc" text-anchor="middle" font-weight="bold">CI/CD 流水线</text>
<text x="772" y="145" font-family="Consolas,monospace" font-size="9" fill="#64748b" text-anchor="middle">GitHub Actions / Jenkins</text>
<rect x="679" y="153" width="187" height="55" rx="4" fill="#0f172a"/>
<text x="689" y="171" font-family="Consolas,monospace" font-size="8" fill="#3fb950">Build  --- 通过</text>
<text x="689" y="184" font-family="Consolas,monospace" font-size="8" fill="#3fb950">Test   --- 全部通过</text>
<text x="689" y="197" font-family="Consolas,monospace" font-size="8" fill="#3fb950">Deploy --- 运行中</text>
<text x="689" y="201" font-family="Consolas,monospace" font-size="7" fill="#8b949e">git push -&gt; auto build -&gt; deploy</text>
<text x="689" y="228" font-family="Consolas,monospace" font-size="8" fill="#6ee7b7" font-weight="bold"># 自动化构建部署全流程</text>
<text x="689" y="260" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">技术栈：YAML + Docker + Nginx</text>

<!-- Common tech stack -->
<text x="450" y="295" font-family="Microsoft YaHei,Arial" font-size="14" fill="#E95420" text-anchor="middle" font-weight="bold">所有项目的共同技术栈</text>

<rect x="30" y="308" width="840" height="80" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>

<!-- Tech items -->
${[
  {label: 'WSL 2 Linux 环境', color: '#3b82f6', x: 55},
  {label: 'Docker 容器化', color: '#10b981', x: 265},
  {label: 'Git 版本控制', color: '#f59e0b', x: 475},
  {label: 'VS Code 编辑器', color: '#a855f7', x: 685}
].map(t => {
  return `<rect x="${t.x}" y="330" width="195" height="26" rx="5" fill="${t.color}15"/><circle cx="${t.x+14}" cy="343" r="8" fill="${t.color}" opacity="0.8"/><text x="${t.x+28}" y="347" font-family="Microsoft YaHei,Arial" font-size="10" fill="#e2e8f0">${t.label}</text>`;
}).join('\n')}

${[
  {label: 'Node.js/Python 运行时', color: '#ec4899', x: 160},
  {label: 'PostgreSQL/Redis 数据库', color: '#06b6d4', x: 370},
  {label: 'Nginx/Caddy Web服务', color: '#84cc16', x: 580},
  {label: 'CI/CD 自动部署', color: '#f97316', x: 790}
].map(t => {
  return `<rect x="${t.x}" y="362" width="195" height="22" rx="5" fill="${t.color}12"/><text x="${t.x+10}" y="377" font-family="Microsoft YaHei,Arial" font-size="10" fill="#e2e8f0">${t.label}</text>`;
}).join('\n')}

<rect x="315" y="408" width="270" height="26" rx="13" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="426" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">实战项目 / 从零到一 / 综合案例</text>
</svg>`;
save('24-wsl-project-showcase.svg', svg);
}
console.log('24 done');
