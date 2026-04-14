const { svgHeader, bgGradient, badge, save } = require('./svg-base');

// ============================================================
// 21 - 故障排查
// ============================================================
{
  const svg = svgHeader() + `
${bgGradient('bg21', '#1a0a0a', '#2a1515')}
${badge('21')}

<!-- Title -->
<text x="450" y="50" font-family="Microsoft YaHei,Arial,sans-serif" font-size="27" fill="#fff" text-anchor="middle" font-weight="bold">WSL 十大常见问题排查手册（附解决方案）</text>
<text x="450" y="74" font-family="Microsoft YaHei,Arial,sans-serif" font-size="13" fill="#9ca3af" text-anchor="middle">网络不通 / 权限报错 / 内存溢出 / 启动失败 一网打尽</text>

<!-- Warning triangle -->
<g transform="translate(60, 100)">
  <polygon points="50,10 95,90 5,90" fill="none" stroke="#f59e0b" stroke-width="4"/>
  <text x="50" y="72" font-family="Arial" font-size="36" fill="#f59e0b" text-anchor="middle" font-weight="bold">!</text>
</g>

<!-- Problem cards - row 1 -->
<rect x="175" y="105" width="240" height="62" rx="8" fill="#2d1810"/>
<circle cx="198" cy="136" r="12" fill="#ef4444"/>
<text x="198" y="141" font-family="Arial" font-size="13" fill="#fff" text-anchor="middle" font-weight="bold">1</text>
<text x="220" y="130" font-family="Microsoft YaHei,Arial" font-size="11" fill="#fca5a5" font-weight="bold">网络无法连接 / DNS 解析失败</text>
<text x="220" y="150" font-family="Consolas,monospace" font-size="9" fill="#9ca3af">resolv.conf 配置修复</text>

<rect x="430" y="105" width="230" height="62" rx="8" fill="#2d1810"/>
<circle cx="453" cy="136" r="12" fill="#ef4444"/>
<text x="453" y="141" font-family="Arial" font-size="13" fill="#fff" text-anchor="middle" font-weight="bold">2</text>
<text x="475" y="130" font-family="Microsoft YaHei,Arial" font-size="11" fill="#fca5a5" font-weight="bold">Permission denied 权限错误</text>
<text x="475" y="150" font-family="Consolas,monospace" font-size="9" fill="#9ca3af">chmod/chown/用户组修复</text>

<rect x="675" y="105" width="210" height="62" rx="8" fill="#2d1810"/>
<circle cx="698" cy="136" r="12" fill="#ef4444"/>
<text x="698" y="141" font-family="Arial" font-size="13" fill="#fff" text-anchor="middle" font-weight="bold">3</text>
<text x="720" y="130" font-family="Microsoft YaHei,Arial" font-size="11" fill="#fca5a5" font-weight="bold">内存不足 / OOM 崩溃</text>
<text x="720" y="150" font-family="Consolas,monospace" font-size="9" fill="#9ca3af">调整 .wslconfig 内存限制</text>

<!-- Row 2 -->
<rect x="175" y="178" width="240" height="62" rx="8" fill="#1a2744"/>
<circle cx="198" cy="209" r="12" fill="#3b82f6"/>
<text x="198" y="214" font-family="Arial" font-size="13" fill="#fff" text-anchor="middle" font-weight="bold">4</text>
<text x="220" y="203" font-family="Microsoft YaHei,Arial" font-size="11" fill="#93c5fd" font-weight="bold">WSL 无法启动 / 虚拟化错误</text>
<text x="220" y="223" font-family="Consolas,monospace" font-size="9" fill="#9ca3af">BIOS 虚拟化 + Hyper-V 检查</text>

<rect x="430" y="178" width="230" height="62" rx="8" fill="#1a2744"/>
<circle cx="453" cy="209" r="12" fill="#3b82f6"/>
<text x="453" y="214" font-family="Arial" font-size="13" fill="#fff" text-anchor="middle" font-weight="bold">5</text>
<text x="475" y="203" font-family="Microsoft YaHei,Arial" font-size="11" fill="#93c5fd" font-weight="bold">文件系统损坏 / ext4.vhdx 错误</text>
<text x="475" y="223" font-family="Consolas,monospace" font-size="9" fill="#9ca3af">磁盘检查与重建虚拟硬盘</text>

<rect x="675" y="178" width="210" height="62" rx="8" fill="#1a2744"/>
<circle cx="698" cy="209" r="12" fill="#3b82f6"/>
<text x="698" y="214" font-family="Arial" font-size="13" fill="#fff" text-anchor="middle" font-weight="bold">6</text>
<text x="720" y="203" font-family="Microsoft YaHei,Arial" font-size="11" fill="#93c5fd" font-weight="bold">Git SSH 连接 GitHub 失败</text>
<text x="720" y="223" font-family="Consolas,monospace" font-size="9" fill="#9ca3af">SSH 密钥权限与代理配置</text>

<!-- Row 3 -->
<rect x="175" y="251" width="240" height="62" rx="8" fill="#1a2a18"/>
<circle cx="198" cy="282" r="12" fill="#10b981"/>
<text x="198" y="287" font-family="Arial" font-size="13" fill="#fff" text-anchor="middle" font-weight="bold">7</text>
<text x="220" y="276" font-family="Microsoft YaHei,Arial" font-size="11" fill="#6ee7b7" font-weight="bold">systemd 服务无法自启</text>
<text x="220" y="296" font-family="Consolas,monospace" font-size="9" fill="#9ca3af">wsl.conf 中启用 systemd=true</text>

<rect x="430" y="251" width="230" height="62" rx="8" fill="#1a2a18"/>
<circle cx="453" cy="282" r="12" fill="#10b981"/>
<text x="453" y="287" font-family="Arial" font-size="13" fill="#fff" text-anchor="middle" font-weight="bold">8</text>
<text x="475" y="276" font-family="Microsoft YaHei,Arial" font-size="11" fill="#6ee7b7" font-weight="bold">Docker 容器无法联网</text>
<text x="475" y="296" font-family="Consolas,monospace" font-size="9" fill="#9ca3af">镜像加速器 + 网络模式切换</text>

<rect x="675" y="251" width="210" height="62" rx="8" fill="#1a2a18"/>
<circle cx="698" cy="282" r="12" fill="#10b981"/>
<text x="698" y="287" font-family="Arial" font-size="13" fill="#fff" text-anchor="middle" font-weight="bold">9</text>
<text x="720" y="276" font-family="Microsoft YaHei,Arial" font-size="11" fill="#6ee7b7" font-weight="bold">端口被占用 / localhost 不通</text>
<text x="720" y="296" font-family="Consolas,monospace" font-size="9" fill="#9ca3af">netstat 排查 + 防火墙规则</text>

<!-- Row 4 (last one) -->
<rect x="303" y="324" width="290" height="56" rx="8" fill="#2a1840"/>
<circle cx="326" cy="352" r="12" fill="#a855f7"/>
<text x="326" y="357" font-family="Arial" font-size="13" fill="#fff" text-anchor="middle" font-weight="bold">10</text>
<text x="348" y="347" font-family="Microsoft YaHei,Arial" font-size="11" fill="#c084fc" font-weight="bold">GUI 应用无法启动 / 显示异常</text>
<text x="348" y="367" font-family="Consolas,monospace" font-size="9" fill="#9ca3af">WSLg 环境变量 + 显卡驱动检查</text>

<!-- Debug command tip -->
<rect x="40" y="395" width="820" height="48" rx="10" fill="rgba(233,84,32,0.07)" stroke="#E95420" stroke-width="1"/>
<text x="60" y="417" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" font-weight="bold">通用调试命令</text>
<text x="170" y="417" font-family="Consolas,monospace" font-size="11" fill="#c9d1d9">wsl --status | dmesg | journalctl -xe</text>
<text x="60" y="436" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">每篇文章都附带详细步骤和截图，从定位问题到彻底解决，手把手教你排查！</text>

<!-- Tag -->
<rect x="320" y="458" width="260" height="26" rx="13" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="476" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">故障排查 / 问题解决 / FAQ 手册</text>
</svg>`;
save('21-wsl-troubleshooting-handbook.svg', svg);
}

// ============================================================
// 22 - DevContainer
// ============================================================
{
  const svg = svgHeader() + `
${bgGradient('bg22', '#0c1426', '#16203a')}
${badge('22')}

<!-- Title -->
<text x="450" y="48" font-family="Microsoft YaHei,Arial,sans-serif" font-size="27" fill="#fff" text-anchor="middle" font-weight="bold">Dev Container：团队统一开发环境的终极方案</text>
<text x="450" y="72" font-family="Microsoft YaHei,Arial,sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">一键克隆环境 / 团队零差异配置 / WSL + Docker Compose</text>

<!-- Nested container diagram: Windows -> WSL -> DevContainer -->
<!-- Layer 1: Windows -->
<rect x="30" y="96" width="840" height="340" rx="14" fill="#0f172a" stroke="#3b82f6" stroke-width="2"/>
<text x="70" y="122" font-family="Arial,sans-serif" font-size="14" fill="#60a5fa" font-weight="bold">Windows 主机</text>

<!-- Layer 2: WSL -->
<rect x="52" y="138" width="380" height="280" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
<text x="72" y="160" font-family="Arial,sans-serif" font-size="13" fill="#6ee7b7" font-weight="bold">WSL 2 (Linux)</text>

<!-- Dev Containers inside WSL -->
<rect x="70" y="178" width="165" height="110" rx="8" fill="#0f172a" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="5,3"/>
<text x="152" y="200" font-family="Microsoft YaHei,Arial" font-size="11" fill="#c084fc" text-anchor="middle" font-weight="bold">DevContainer A</text>
<text x="85" y="222" font-family="Consolas,monospace" font-size="9" fill="#94a3b8">Node.js 20 + TypeScript</text>
<text x="85" y="238" font-family="Consolas,monospace" font-size="9" fill="#94a3b8">ESLint + Prettier</text>
<text x="85" y="254" font-family="Consolas,monospace" font-size="9" fill="#94a3b8">Redis + PostgreSQL</text>
<text x="85" y="276" font-family="Consolas,monospace" font-size="9" fill="#6ee7b7">状态：运行中 ✓</text>

<rect x="250" y="178" width="165" height="110" rx="8" fill="#0f172a" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="5,3"/>
<text x="332" y="200" font-family="Microsoft YaHei,Arial" font-size="11" fill="#fcd34d" text-anchor="middle" font-weight="bold">DevContainer B</text>
<text x="265" y="222" font-family="Consolas,monospace" font-size="9" fill="#94a3b8">Python 3.12 + uv</text>
<text x="265" y="238" font-family="Consolas,monospace" font-size="9" fill="#94a3b8">PyTorch + CUDA</text>
<text x="265" y="254" font-family="Consolas,monospace" font-size="9" fill="#94a3b8">Jupyter Lab</text>
<text x="265" y="276" font-family="Consolas,monospace" font-size="9" fill="#6ee7b7">状态：运行中 ✓</text>

<!-- devcontainer.json preview -->
<rect x="68" y="300" width="350" height="104" rx="6" fill="#161b22"/>
<text x="80" y="320" font-family="Consolas,monospace" font-size="9" fill="#79c0ff">{</text>
<text x="92" y="338" font-family="Consolas,monospace" font-size="9" fill="#7ee787">"image": "mcr.microsoft.com/devcontainers...",</text>
<text x="92" y="356" font-family="Consolas,monospace" font-size="9" fill="#7ee787">"features": { "ghcr.io/...": {} },</text>
<text x="92" y="374" font-family="Consolas,monospace" font-size="9" fill="#7ee787">"customizations": { "vscode": {...} }</text>
<text x="80" y="392" font-family="Consolas,monospace" font-size="9" fill="#79c0ff">}</text>

<!-- Right side: Team members with same env -->
<text x="460" y="160" font-family="Microsoft YaHei,Arial" font-size="14" fill="#E95420" font-weight="bold">团队成员环境一致性</text>

<!-- Member cards -->
${[{
  name: '张三',
  role: '前端开发',
  env: 'Node + Vue',
  status: '就绪'
}, {
  name: '李四',
  role: '后端开发',
  env: 'Python + FastAPI',
  status: '就绪'
}, {
  name: '王五',
  role: '全栈开发',
  env: 'Go + Gin',
  status: '就绪'
}, {
  name: '赵六',
  role: '运维工程师',
  env: 'Docker + K8s',
  status: '就绪'
}].map((m, i) => {
  const colors = ['#3b82f6','#10b981','#f59e0b','#a855f7'];
  const c = colors[i];
  return `
<rect x="${460}" y="${175 + i*65}" width="400" height="55" rx="8" fill="#1e293b"/>
<circle cx="${492}" cy="${202}" r="16" fill="${c}"/>
<text x="${492}" y="207" font-family="Arial" font-size="12" fill="#fff" text-anchor="middle" font-weight="bold">${m.name[0]}</text>
<text x="${520}" y="197" font-family="Microsoft YaHei,Arial" font-size="12" fill="#e2e8f0" font-weight="bold">${m.name}</text>
<text x="${520}" y="215" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">${m.role} | ${m.env}</text>
<rect x="${750}" y="${190}" width="46" height="22" rx="11" fill="${c}" opacity="0.2"/>
<text x="${773}" y="205" font-family="Microsoft YaHei,Arial" font-size="10" fill="${c}" text-anchor="middle">${m.status}</text>`;
}).join('\n')}

<!-- Bottom benefit bar -->
<rect x="40" y="450" width="820" height="38" rx="19" fill="rgba(233,84,32,0.08)"/>
<text x="120" y="474" font-family="Microsoft YaHei,Arial" font-size="11" fill="#E95420" font-weight="bold">核心优势：</text>
<text x="200" y="474" font-family="Microsoft YaHei,Arial" font-size="11" fill="#c9d1d9">新人 clone 后 code . 即可开始开发</text>
<text x="480" y="474" font-family="Microsoft YaHei,Arial" font-size="11" fill="#c9d1d9">消除 "我电脑上能跑啊" 经典难题</text>
<text x="750" y="474" font-family="Microsoft YaHei,Arial" font-size="11" fill="#c9d1d9">CI-CD 同一镜像</text>

<!-- Tag -->
<rect x="310" y="490" width="280" height="26" rx="13" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="508" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">DevContainer / 团队协作 / 环境统一</text>
</svg>`;
save('22-devcontainer-guide.svg', svg);
}

// ============================================================
// 23 - 替代方案横评
// ============================================================
{
  const svg = svgHeader() + `
${bgGradient('bg23', '#111118', '#1c1c28')}
${badge('23')}

<!-- Title -->
<text x="450" y="48" font-family="Microsoft YaHei,Arial,sans-serif" font-size="26" fill="#fff" text-anchor="middle" font-weight="bold">除了 WSL 还有什么？8 种 Windows 上跑 Linux 方案横评</text>
<text x="450" y="72" font-family="Microsoft YaHei,Arial,sans-serif" font-size="13" fill="#8b949e" text-anchor="middle">虚拟机 / 双系统 / 云开发 / 容器 全面对比，帮你选最合适的</text>

<!-- Comparison table header -->
<rect x="30" y="92" width="840" height="34" rx="6" fill="#21262d"/>
<text x="140" y="114" font-family="Microsoft YaHei,Arial" font-size="12" fill="#c9d1d9" text-anchor="middle" font-weight="bold">方案名称</text>
<text x="330" y="114" font-family="Microsoft YaHei,Arial" font-size="12" fill="#c9d1d9" text-anchor="middle" font-weight="bold">性能</text>
<text x="440" y="114" font-family="Microsoft YaHei,Arial" font-size="12" fill="#c9d1d9" text-anchor="middle" font-weight="bold">易用性</text>
<text x="550" y="114" font-family="Microsoft YaHei,Arial" font-size="12" fill="#c9d1d9" text-anchor="middle" font-weight="bold">隔离性</text>
<text x="670" y="114" font-family="Microsoft YaHei,Arial" font-size="12" fill="#c9d1d9" text-anchor="middle" font-weight="bold">适合场景</text>
<text x="800" y="114" font-family="Microsoft YaHei,Arial" font-size="12" fill="#c9d1d9" text-anchor="middle" font-weight="bold">推荐度</text>

<!-- Table rows -->
const rows = [
  ['WSL 2', '#3fb950', '#3fb950', '#f0c000', 'VM级', '日常开发', '★★★★★'],
  ['Hyper-V / VMware', '#58a6ff', '#f0c000', '#3fb950', '强隔离', '企业测试', '★★★★☆'],
  ['VirtualBox', '#a371f7', '#3fb950', '#3fb950', '强隔离', '学习实验', '★★★☆☆'],
  ['双系统 Dual Boot', '#3fb950', '#f85149', '#3fb950', 'OS级', '游戏/Linux', '★★★☆☆'],
  ['GitHub Codespaces', '#a371f7', '#3fb950', '#f0c000', '容器级', '快速体验', '★★★★☆'],
  ['Colima (macOS)', '#f85149', '#f0c000', '#f0c000', 'VM级', 'Mac 用户', '★★★☆☆'],
  ['Gitpod 云IDE', '#a371f7', '#3fb950', '#f0c000', '容器级', 'PR 开发', '★★★★☆'],
  ['Docker Desktop', '#3fb950', '#f0c000', '#3fb950', '容器级', '微服务', '★★★★☆']
];

${rows.map((r, i) => {
  const bg = i % 2 === 0 ? '#161b22' : '#0d1117';
  const highlight = r[0] === 'WSL 2';
  const border = highlight ? '#E95420' : '#21262d';
  return `<rect x="30" y="${130 + i * 38}" width="840" height="38" rx="0" fill="${bg}" ${highlight ? `stroke="${border}" stroke-width="1.5"` : ''}/>
<text x="140" y="${154 + i * 38}" font-family="Arial,sans-serif" font-size="12" fill="${highlight ? '#E95420' : '#c9d1d9'}" text-anchor="middle" ${highlight ? 'font-weight="bold"' : ''}>${r[0]}</text>
<text x="330" y="${154 + i * 38}" font-family="Microsoft YaHei,Arial" font-size="11" fill="${r[1]}" text-anchor="middle">${r[1] === '#3fb950' ? '近原生' : r[1] === '#f0c000' ? '中等' : '原生'}</text>
<text x="440" y="${154 + i * 38}" font-family="Microsoft YaHei,Arial" font-size="11" fill="${r[2]}" text-anchor="middle">${r[2] === '#3fb950' ? '简单' : r[2] === '#f0c000' ? '中等' : '困难'}</text>
<text x="550" y="${154 + i * 38}" font-family="Microsoft YaHei,Arial" font-size="11" fill="${r[3]}" text-anchor="middle">${r[4]}</text>
<text x="670" y="${154 + i * 38}" font-family="Microsoft YaHei,Arial" font-size="11" fill="#8b949e" text-anchor="middle">${r[5]}</text>
<text x="800" y="${154 + i * 38}" font-family="Arial" font-size="12" fill="${highlight ? '#E95420' : '#f0c000'}" text-anchor="middle">${r[6]}</text>`;
}).join('\n')}

<!-- Bottom round corners for last row -->
<rect x="30" y="434" width="840" height="38" rx="0 0 6 6" fill="${rows.length % 2 === 0 ? '#0d1117' : '#161b22'}"/>

<!-- Recommendation highlight box -->
<rect x="200" y="450" width="500" height="38" rx="19" fill="rgba(233,84,32,0.1)" stroke="#E95420" stroke-width="1"/>
<text x="450" y="474" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">结论：WSL 2 是性能、集成度和易用性的最佳平衡点 ★</text>

<!-- Tag -->
<rect x="340" y="490" width="220" height="26" rx="13" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="508" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">方案对比 / 选型指南 / 横评分析</text>
</svg>`;
save('23-alternatives-comparison.svg', svg);
}

// ============================================================
// 24 - 实战项目合集
// ============================================================
{
  const svg = svgHeader() + `
${bgGradient('bg24', '#0a0f1a', '#131c31')}
${badge('24')}

<!-- Title -->
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
<text x="474" y="202" font-family="Consolas,monospace" font-size="8" fill="#f0c000">jupyter lab --no-browser</text>
<text x="474" y="228" font-family="Consolas,monospace" font-size="8" fill="#6ee7b7" font-weight="bold"># 可视化报表自动生成</text>
<text x="474" y="260" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">技术栈：Python + Matplotlib + CSV</text>

<!-- Project 4: CI/CD Pipeline -->
<rect x="675" y="88" width="195" height="185" rx="10" fill="#1e293b" stroke="#a855f7" stroke-width="1.5"/>
<rect x="687" y="100" width="170" height="30" rx="6" fill="#2e1065"/>
<text x="772" y="121" font-family="Microsoft YaHei,Arial" font-size="13" fill="#c084fc" text-anchor="middle" font-weight="bold">CI/CD 流水线</text>
<text x="772" y="145" font-family="Consolas,monospace" font-size="9" fill="#64748b" text-anchor="middle">GitHub Actions / Jenkins</text>
<rect x="679" y="153" width="187" height="55" rx="4" fill="#0f172a"/>
<text x="689" y="171" font-family="Consolas,monospace" font-size="8" fill="#3fb950">Build  --- 通过</text>
<text x="689" y="184" font-family="Consolas,monospace" font-size="8" fill="#3fb950">Test   --- 全部通过</text>
<text x="689" y="197" font-family="Consolas,monospace" font-size="8" fill="#3fb950">Deploy --- 运行中</text>
<text x="689" y="201" font-family="Consolas,monospace" font-size="7" fill="#8b949e">git push -> auto build -> deploy</text>
<text x="689" y="228" font-family="Consolas,monospace" font-size="8" fill="#6ee7b7" font-weight="bold"># 自动化构建部署全流程</text>
<text x="689" y="260" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">技术栈：YAML + Docker + Nginx</text>

<!-- Common tech stack summary at bottom -->
<text x="450" y="295" font-family="Microsoft YaHei,Arial" font-size="14" fill="#E95420" text-anchor="middle" font-weight="bold">所有项目的共同技术栈</text>

<rect x="30" y="308" width="840" height="80" rx="10" fill="#0f172a" stroke="#1e293b" stroke-width="1"/>

<!-- Tech stack items in grid -->
${[
  {icon: '🐧', label: 'WSL 2 Linux 环境'},
  {icon: '🐳', label: 'Docker 容器化'},
  {icon: '📦', label: 'Git 版本控制'},
  {icon: '💻', label: 'VS Code 编辑器'},
  {icon: '⚡', label: 'Node.js/Python 运行时'},
  {icon: '🗄️', label: 'PostgreSQL/Redis 数据库'},
  {icon: '🌐', label: 'Nginx/Caddy Web服务'}
].map((t, i) => {
  const x = 55 + (i % 4) * 210;
  const y = i < 4 ? 338 : 370;
  const col = ['#3b82f6','#10b981','#f59e0b','#a855f7','#ec4899','#06b6d4','#84cc16'][i];
  return `<rect x="${x}" y="${y}" width="195" height="26" rx="5" fill="${col}15"/><circle cx="${x+14}" cy="${y+13}" r="8" fill="${col}" opacity="0.8"/><text x="${x+28}" y="${y+17}" font-family="Microsoft YaHei,Arial" font-size="10" fill="#e2e8f0">${t.label}</text>`;
}).join('\n')}

<!-- Tag -->
<rect x="315" y="408" width="270" height="26" rx="13" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="426" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">实战项目 / 从零到一 / 综合案例</text>
</svg>`;
save('24-wsl-project-showcase.svg', svg);
}

// ============================================================
// 25 - 附录速查表
// ============================================================
{
  const svg = svgHeader() + `
${bgGradient('bg25', '#0d1117', '#161b22')}
${badge('25')}

<!-- Title -->
<text x="450" y="46" font-family="Microsoft YaHei,Arial,sans-serif" font-size="26" fill="#fff" text-anchor="middle" font-weight="bold">附录：WSL 常用命令速查表 + 配置模板大全</text>
<text x="450" y="68" font-family="Microsoft YaHei,Arial,sans-serif" font-size="12" fill="#8b949e" text-anchor="middle">收藏这一张就够了！核心命令、路径参考、配置模板一站式查询</text>

<!-- Column 1: Essential Commands -->
<rect x="25" y="82" width="280" height="215" rx="8" fill="#161b22" border="#21262d"/>
<rect x="25" y="82" width="280" height="26" rx="8" fill="#21262d"/>
<text x="165" y="101" font-family="Microsoft YaHei,Arial" font-size="12" fill="#58a6ff" text-anchor="middle" font-weight="bold">核心命令速查</text>

<text x="38" y="124" font-family="Consolas,monospace" font-size="10" fill="#7ee787">wsl --install</text>
<text x="190" y="124" font-family="Microsoft YaHei,Arial" font-size="9" fill="#8b949e">安装 WSL</text>

<text x="38" y="144" font-family="Consolas,monospace" font-size="10" fill="#7ee787">wsl --shutdown</text>
<text x="190" y="144" font-family="Microsoft YaHei,Arial" font-size="9" fill="#8b949e">关闭 WSL</text>

<text x="38" y="164" font-family="Consolas,monospace" font-size="10" fill="#7ee787">wsl -l -v</text>
<text x="190" y="164" font-family="Microsoft YaHei,Arial" font-size="9" fill="#8b949e">列出发行版</text>

<text x="38" y="184" font-family="Consolas,monospace" font-size="10" fill="#7ee787">wsl --set-default D</text>
<text x="190" y="184" font-family="Microsoft YaHei,Arial" font-size="9" fill="#8b949e">设为默认发行版</text>

<text x="38" y="204" font-family="Consolas,monospace" font-size="10" fill="#7ee787">wsl -u D -- cmd</text>
<text x="190" y="204" font-family="Microsoft YaHei,Arial" font-size="9" fill="#8b949e">在发行版中执行命令</text>

<text x="38" y="224" font-family="Consolas,monospace" font-size="10" fill="#ffa657">wsl --export D f.tar</text>
<text x="195" y="224" font-family="Microsoft YaHei,Arial" font-size="9" fill="#8b949e">导出备份</text>

<text x="38" y="244" font-family="Consolas,monospace" font-size="10" fill="#ffa657">wsl --import D p f.tar</text>
<text x="195" y="244" font-family="Microsoft YaHei,Arial" font-size="9" fill="#8b949e">导入恢复</text>

<text x="38" y="264" font-family="Consolas,monospace" font-size="10" fill="#ffa657">wsl --update</text>
<text x="190" y="264" font-family="Microsoft YaHei,Arial" font-size="9" fill="#8b949e">更新 WSL 内核</text>

<text x="38" y="286" font-family="Consolas,monospace" font-size="10" fill="#79c0ff">wsl -d Ubuntu -u root</text>
<text x="195" y="286" font-family="Microsoft YaHei,Arial" font-size="9" fill="#8b949e">以 root 登录</text>

<!-- Column 2: Key Paths -->
<rect x="315" y="82" width="270" height="215" rx="8" fill="#161b22" border="#21262d"/>
<rect x="315" y="82" width="270" height="26" rx="8" fill="#21262d"/>
<text x="450" y="101" font-family="Microsoft YaHei,Arial" font-size="12" fill="#f0c000" text-anchor="middle" font-weight="bold">关键路径速查</text>

<text x="328" y="126" font-family="Microsoft YaHei,Arial" font-size="10" fill="#c9d1d9" font-weight="bold">WSL 主目录（Linux）：</text>
<text x="328" y="146" font-family="Consolas,monospace" font-size="11" fill="#7ee787">/home/你的用户名/</text>

<text x="328" y="172" font-family="Microsoft YaHei,Arial" font-size="10" fill="#c9d1d9" font-weight="bold">Windows 访问 WSL 文件：</text>
<text x="328" y="192" font-family="Consolas,monospace" font-size="10" fill="#79c0ff">\\\\\\wsl$\\\\发行版名\\\\home</text>

<text x="328" y="218" font-family="Microsoft YaHei,Arial" font-size="10" fill="#c9d1d9" font-weight="bold">WSL 内访问 Windows C盘：</text>
<text x="328" y="238" font-family="Consolas,monospace" font-size="11" fill="#ffa657">/mnt/c/Users/你的用户名/</text>

<text x="328" y="264" font-family="Microsoft YaHei,Arial" font-size="10" fill="#c9d1d9" font-weight="bold">WSL 配置文件位置：</text>
<text x="328" y="284" font-family="Consolas,monospace" font-size="10" fill="#a371f7">~/.wslconfig  或  /etc/wsl.conf</text>

<!-- Column 3: Config Template -->
<rect x="595" y="82" width="280" height="215" rx="8" fill="#161b22" border="#21262d"/>
<rect x="595" y="82" width="280" height="26" rx="8" fill="#21262d"/>
<text x="735" y="101" font-family="Microsoft YaHei,Arial" font-size="12" fill="#3fb950" text-anchor="middle" font-weight="bold">.wslconfig 配置模板</text>

<rect x="605" y="112" width="260" height="172" rx="6" fill="#0d1117"/>
<text x="614" y="132" font-family="Consolas,monospace" font-size="10" fill="#569cd6">[wsl2]</text>
<text x="614" y="152" font-family="Consolas,monospace" font-size="10" fill="#9cdcfe">memory</text><text x="656" y="152" font-family="Consolas,monospace" font-size="10" fill="#d4d4d4">=</text><text x="666" y="152" font-family="Consolas,monospace" font-size="10" fill="#ce9178">8GB</text>
<text x="614" y="172" font-family="Consolas,monospace" font-size="10" fill="#9cdcfe">processors</text><text x="674" y="172" font-family="Consolas,monospace" font-size="10" fill="#d4d4d4">=</text><text x="684" y="172" font-family="Consolas,monospace" font-size="10" fill="#b5cea8">4</text>
<text x="614" y="192" font-family="Consolas,monospace" font-size="10" fill="#9cdcfe">swap</text><text x="644" y="192" font-family="Consolas,monospace" font-size="10" fill="#d4d4d4">=</text><text x="654" y="192" font-family="Consolas,monospace" font-size="10" fill="#ce9178">2GB</text>
<text x="614" y="212" font-family="Consolas,monospace" font-size="10" fill="#9cdcfe">localhostForwarding</text><text x="738" y="212" font-family="Consolas,monospace" font-size="10" fill="#d4d4d4">=</text><text x="748" y="212" font-family="Consolas,monospace" font-size="10" fill="#569cd6">true</text>
<text x="614" y="232" font-family="Consolas,monospace" font-size="10" fill="#6a9955"># 高级选项</text>
<text x="614" y="252" font-family="Consolas,monospace" font-size="10" fill="#9cdcfe">vmIdleTimeout</text><text x="700" y="252" font-family="Consolas,monospace" font-size="10" fill="#d4d4d4">=</text><text x="710" y="252" font-family="Consolas,monospace" font-size="10" fill="#ce9178">-1</text>
<text x="614" y="272" font-family="Consolas,monospace" font-size="10" fill="#9cdcfe">debugConsole</text><text x="692" y="272" font-family="Consolas,monospace" font-size="10" fill="#d4d4d4">=</text><text x="702" y="272" font-family="Consolas,monospace" font-size="10" fill="#569cd6">true</text>

<!-- Bottom tips bar -->
<rect x="25" y="308" width="850" height="70" rx="10" fill="rgba(233,84,32,0.06)" stroke="#E95420" stroke-width="1"/>

<text x="50" y="333" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" font-weight="bold">快速提示</text>

<text x="120" y="333" font-family="Microsoft YaHei,Arial" font-size="10" fill="#c9d1d9">代码放 /home/ 比 /mnt/c/ 快 5~10 倍</text>
<text x="420" y="333" font-family="Microsoft YaHei,Arial" font-size="10" fill="#c9d1d9">修改配置后需 wsl --shutdown 重启生效</text>
<text x="720" y="333" font-family="Microsoft YaHei,Arial" font-size="10" fill="#c9d1d9">Windows Terminal 是最佳终端选择</text>

<text x="120" y="360" font-family="Microsoft YaHei,Arial" font-size="10" fill="#c9d1d9">WSL 2 需要 Hyper-V 和虚拟化支持（BIOS开启）</text>
<text x="480" y="360" font-family="Microsoft YaHei,Arial" font-size="10" fill="#c9d1d9">推荐使用 WSL 2（WSL 1 已停止维护）</text>

<!-- Star icon -->
<rect x="380" y="392" width="140" height="30" rx="15" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="413" font-family="Microsoft YaHei,Arial" font-size="13" fill="#E95420" text-anchor="middle" font-weight="bold">★ 收藏备用 ★</text>

<!-- Tag -->
<rect x="330" y="438" width="240" height="26" rx="13" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="456" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">速查表 / 配置模板 / 快速参考</text>
</svg>`;
save('25-appendix-cheatsheet.svg', svg);
}

console.log('\nBatch 4 done: 21, 22, 23, 24, 25');
