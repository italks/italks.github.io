const { svgHeader, bgGradient, badge, save } = require('./svg-base');

// ============================================================
// 22 - DevContainer
// ============================================================
{
  const members = [
    {name: '张三', role: '前端开发', env: 'Node + Vue', color: '#3b82f6'},
    {name: '李四', role: '后端开发', env: 'Python + FastAPI', color: '#10b981'},
    {name: '王五', role: '全栈开发', env: 'Go + Gin', color: '#f59e0b'},
    {name: '赵六', role: '运维工程师', env: 'Docker + K8s', color: '#a855f7'}
  ];

  let memberHtml = '';
  members.forEach((m, i) => {
    const y1 = 175 + i * 65;
    const y2 = 202;
    const y3 = 197;
    const y4 = 215;
    const y5 = 190;
    const y6 = 205;
    memberHtml += '<rect x="460" y="' + y1 + '" width="400" height="55" rx="8" fill="#1e293b"/>\n';
    memberHtml += '<circle cx="492" cy="' + y2 + '" r="16" fill="' + m.color + '"/>\n';
    memberHtml += '<text x="492" y="' + (y2+5) + '" font-family="Arial" font-size="12" fill="#fff" text-anchor="middle" font-weight="bold">' + m.name[0] + '</text>\n';
    memberHtml += '<text x="520" y="' + y3 + '" font-family="Microsoft YaHei,Arial" font-size="12" fill="#e2e8f0" font-weight="bold">' + m.name + '</text>\n';
    memberHtml += '<text x="520" y="' + y4 + '" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">' + m.role + ' | ' + m.env + '</text>\n';
    memberHtml += '<rect x="750" y="' + y5 + '" width="46" height="22" rx="11" fill="' + m.color + '" opacity="0.2"/>\n';
    memberHtml += '<text x="773" y="' + y6 + '" font-family="Microsoft YaHei,Arial" font-size="10" fill="' + m.color + '" text-anchor="middle">就绪</text>\n';
  });

  const svg = svgHeader() + `
${bgGradient('bg22', '#0c1426', '#16203a')}
${badge('22')}

<text x="450" y="48" font-family="Microsoft YaHei,Arial,sans-serif" font-size="27" fill="#fff" text-anchor="middle" font-weight="bold">Dev Container：团队统一开发环境的终极方案</text>
<text x="450" y="72" font-family="Microsoft YaHei,Arial,sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">一键克隆环境 / 团队零差异配置 / WSL + Docker Compose</text>

<!-- Windows layer -->
<rect x="30" y="96" width="840" height="340" rx="14" fill="#0f172a" stroke="#3b82f6" stroke-width="2"/>
<text x="70" y="122" font-family="Arial,sans-serif" font-size="14" fill="#60a5fa" font-weight="bold">Windows 主机</text>

<!-- WSL layer -->
<rect x="52" y="138" width="380" height="280" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
<text x="72" y="160" font-family="Arial,sans-serif" font-size="13" fill="#6ee7b7" font-weight="bold">WSL 2 (Linux)</text>

<!-- DevContainer A -->
<rect x="70" y="178" width="165" height="110" rx="8" fill="#0f172a" stroke="#a855f7" stroke-width="1.5" stroke-dasharray="5,3"/>
<text x="152" y="200" font-family="Microsoft YaHei,Arial" font-size="11" fill="#c084fc" text-anchor="middle" font-weight="bold">DevContainer A</text>
<text x="85" y="222" font-family="Consolas,monospace" font-size="9" fill="#94a3b8">Node.js 20 + TypeScript</text>
<text x="85" y="238" font-family="Consolas,monospace" font-size="9" fill="#94a3b8">ESLint + Prettier</text>
<text x="85" y="254" font-family="Consolas,monospace" font-size="9" fill="#94a3b8">Redis + PostgreSQL</text>
<text x="85" y="276" font-family="Consolas,monospace" font-size="9" fill="#6ee7b7">状态：运行中 ✓</text>

<!-- DevContainer B -->
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

<!-- Team members -->
<text x="460" y="160" font-family="Microsoft YaHei,Arial" font-size="14" fill="#E95420" font-weight="bold">团队成员环境一致性</text>
${memberHtml}

<!-- Bottom benefit bar -->
<rect x="40" y="450" width="820" height="38" rx="19" fill="rgba(233,84,32,0.08)"/>
<text x="120" y="474" font-family="Microsoft YaHei,Arial" font-size="11" fill="#E95420" font-weight="bold">核心优势：</text>
<text x="200" y="474" font-family="Microsoft YaHei,Arial" font-size="11" fill="#c9d1d9">新人 clone 后 code . 即可开始开发</text>
<text x="480" y="474" font-family="Microsoft YaHei,Arial" font-size="11" fill="#c9d1d9">消除 "我电脑上能跑啊" 经典难题</text>
<text x="750" y="474" font-family="Microsoft YaHei,Arial" font-size="11" fill="#c9d1d9">CI-CD 同一镜像</text>

<rect x="310" y="490" width="280" height="26" rx="13" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="508" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">DevContainer / 团队协作 / 环境统一</text>
</svg>`;
save('22-devcontainer-guide.svg', svg);
}
console.log('22 done');
