const fs = require('fs');
const path = require('path');
const { svgHeader, bgGradient, badge, titleSub, codeBlock, card, save } = require('./svg-base');

// ============================================================
// 06 - WSLg GUI图形界面体验
// ============================================================
{
  const svg = svgHeader() + `
${bgGradient('bg06', '#1a1a2e', '#16213e')}
${badge('06')}

<!-- Title -->
<text x="450" y="55" font-family="Microsoft YaHei,Arial,sans-serif" font-size="28" fill="#FFFFFF" text-anchor="middle" font-weight="bold">在 Windows 上运行 Linux 桌面应用？</text>
<text x="450" y="80" font-family="Microsoft YaHei,Arial,sans-serif" font-size="14" fill="#a0aec0" text-anchor="middle">WSLg 图形界面完全体验</text>

<!-- WSLg Window Mockup -->
<rect x="60" y="110" width="380" height="260" rx="10" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
<!-- Window title bar -->
<rect x="60" y="110" width="380" height="30" rx="10" fill="#161b22"/>
<circle cx="85" cy="125" r="6" fill="#ff5f57"/>
<circle cx="105" cy="125" r="6" fill="#febc2e"/>
<circle cx="125" cy="125" r="6" fill="#28c840"/>
<text x="250" y="130" font-family="Microsoft YaHei,Arial" font-size="12" fill="#8b949e">WSLg - 图形应用</text>

<!-- App Grid inside window -->
<!-- Row 1 -->
<rect x="80" y="155" width="90" height="75" rx="8" fill="#1c2128"/>
<rect x="100" y="170" width="28" height="22" rx="4" fill="#E95420"/>
<text x="125" y="218" font-family="Microsoft YaHei,Arial" font-size="11" fill="#c9d1d9" text-anchor="middle">编辑器</text>

<rect x="185" y="155" width="90" height="75" rx="8" fill="#1c2128"/>
<circle cx="230" cy="188" r="14" fill="none" stroke="#58a6ff" stroke-width="3"/>
<line x1="238" y1="196" x2="248" y2="206" stroke="#58a6ff" stroke-width="3"/>
<text x="230" y="218" font-family="Microsoft YaHei,Arial" font-size="11" fill="#c9d1d9" text-anchor="middle">浏览器</text>

<rect x="290" y="155" width="90" height="75" rx="8" fill="#1c2128"/>
<path d="M315 175 L330 175 L335 180 L335 195 L315 195 Z" fill="#f0b72f"/>
<rect x="320" y="183" width="10" height="2" fill="#333"/>
<text x="335" y="218" font-family="Microsoft YaHei,Arial" font-size="11" fill="#c9d1d9" text-anchor="middle">文件管理</text>

<!-- Row 2 -->
<rect x="133" y="245" width="90" height="75" rx="8" fill="#1c2128"/>
<rect x="153" y="262" width="24" height="18" rx="3" fill="#a371f7"/>
<circle cx="160" cy="271" r="4" fill="#fff"/><circle cx="168" cy="271" r="4" fill="#fff"/><circle cx="176" cy="271" r="4" fill="#fff"/>
<text x="178" y="308" font-family="Microsoft YaHei,Arial" font-size="11" fill="#c9d1d9" text-anchor="middle">图片查看</text>

<rect x="240" y="245" width="90" height="75" rx="8" fill="#1c2128"/>
<rect x="258" y="260" width="54" height="34" rx="5" fill="#282c34" stroke="#61afef" stroke-width="1.5"/>
<text x="270" y="280" font-family="Consolas,monospace" font-size="8" fill="#61afef">$ gedit</text>
<text x="285" y="308" font-family="Microsoft YaHei,Arial" font-size="11" fill="#c9d1d9" text-anchor="middle">终端</text>

<!-- Terminal commands -->
<rect x="78" y="332" width="345" height="32" rx="6" fill="#21262d"/>
<text x="88" y="352" font-family="Consolas,monospace" font-size="11" fill="#7ee787">$ gedit &amp;    $ firefox &amp;    $ nautilus . &amp;</text>

<!-- Feature Cards (Right side) -->
<text x="480" y="135" font-family="Microsoft YaHei,Arial,sans-serif" font-size="16" fill="#E95420" font-weight="bold">核心特性</text>

${card(468, 150, 1, '无需 X Server', '内置 Wayland 支持，开箱即用')}
${card(468, 232, 2, 'GPU 加速渲染', '利用 Windows GPU 进行图形渲染')}
${card(468, 314, 3, '剪贴板共享', 'Windows 与 Linux 剪贴板互通')}
${card(638, 150, 4, '音频支持', 'PulseAudio/PipeWire 完美集成')}
${card(638, 232, 5, '多显示器', '支持外接多屏显示输出')}

<!-- Bottom tag -->
<rect x="340" y="455" width="220" height="28" rx="14" fill="rgba(233,84,32,0.15)" stroke="#E95420" stroke-width="1"/>
<text x="450" y="474" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">GUI / WSLg / 桌面应用</text>
</svg>`;
save('06-wsl-gui-apps-guide.svg', svg);
}

// ============================================================
// 10 - Git工作流
// ============================================================
{
  const svg = svgHeader() + `
${bgGradient('bg10', '#0f172a', '#1e293b')}
${badge('07')}

<!-- Title -->
<text x="450" y="52" font-family="Microsoft YaHei,Arial,sans-serif" font-size="28" fill="#fff" text-anchor="middle" font-weight="bold">Git 工作流在 WSL 中的正确姿势</text>
<text x="450" y="76" font-family="Microsoft YaHei,Arial,sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">SSH 配置 / 命令别名 / Git Hooks 一站式指南</text>

<!-- Git Branch Diagram -->
<text x="70" y="115" font-family="Microsoft YaHei,Arial" font-size="14" fill="#E95420" font-weight="bold">分支可视化</text>

<rect x="60" y="128" width="360" height="145" rx="8" fill="#0f172a" stroke="#334155" stroke-width="1"/>

<!-- Main branch line -->
<line x1="90" y1="250" x2="390" y2="160" stroke="#4ade80" stroke-width="3"/>
<circle cx="120" cy="240" r="8" fill="#4ade80"/>
<text x="120" y="244" font-family="Arial" font-size="9" fill="#000" text-anchor="middle" font-weight="bold">M1</text>
<circle cx="200" cy="215" r="8" fill="#4ade80"/>
<text x="200" y="219" font-family="Arial" font-size="9" fill="#000" text-anchor="middle" font-weight="bold">M2</text>
<circle cx="290" cy="182" r="8" fill="#4ade80"/>
<text x="290" y="186" font-family="Arial" font-size="9" fill="#000" text-anchor="middle" font-weight="bold">M3</text>
<circle cx="370" cy="158" r="8" fill="#4ade80"/>
<text x="370" y="162" font-family="Arial" font-size="9" fill="#000" text-anchor="middle" font-weight="bold">M4</text>
<text x="395" y="162" font-family="Arial" font-size="11" fill="#4ade80" font-weight="bold">main</text>

<!-- Feature branch -->
<line x1="200" y1="215" x2="260" y2="148" stroke="#f97316" stroke-width="2.5" stroke-dasharray="5,3"/>
<circle cx="260" cy="148" r="7" fill="#f97316"/>
<text x="285" y="145" font-family="Arial" font-size="10" fill="#f97316" font-weight="bold">feature</text>

<!-- Dev branch -->
<line x1="290" y1="182" x2="340" y2="145" stroke="#3b82f6" stroke-width="2.5" stroke-dasharray="5,3"/>
<circle cx="340" cy="145" r="7" fill="#3b82f6"/>
<text x="365" y="142" font-family="Arial" font-size="10" fill="#3b82f6" font-weight="bold">dev</text>

<!-- PR arrow -->
<path d="M268 152 Q300 175 335 150" fill="none" stroke="#a855f7" stroke-width="1.5" marker-end="url(#arrow)"/>
<defs><marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6z" fill="#a855f7"/></marker></defs>
<text x="295" y="172" font-family="Arial" font-size="9" fill="#a855f7">PR</text>

<!-- SSH Key Setup -->
<text x="70" y="295" font-family="Microsoft YaHei,Arial" font-size="13" fill="#E95420" font-weight="bold">SSH 密钥配置</text>
<rect x="60" y="305" width="235" height="95" rx="8" fill="#1e293b"/>
<text x="74" y="326" font-family="Consolas,monospace" font-size="11" fill="#7ee787">$ ssh-keygen -t ed25519</text>
<text x="74" y="348" font-family="Consolas,monospace" font-size="11" fill="#79c0ff">$ cat ~/.ssh/id_ed25519.pub</text>
<text x="74" y="370" font-family="Consolas,monospace" font-size="11" fill="#ffa657">$ ssh -T git@github.com</text>
<text x="74" y="392" font-family="Consolas,monospace" font-size="10" fill="#4ade80" font-weight="bold"># 认证成功！</text>

<!-- Aliases -->
<text x="320" y="295" font-family="Microsoft YaHei,Arial" font-size="13" fill="#E95420" font-weight="bold">常用命令别名</text>
<rect x="310" y="305" width="255" height="95" rx="8" fill="#1e293b"/>
<text x="324" y="326" font-family="Consolas,monospace" font-size="11" fill="#c9d1d9">git co   = git checkout</text>
<text x="324" y="348" font-family="Consolas,monospace" font-size="11" fill="#c9d1d9">git br   = git branch -a</text>
<text x="324" y="370" font-family="Consolas,monospace" font-size="11" fill="#c9d1d9">git lg   = log --graph</text>
<text x="324" y="392" font-family="Consolas,monospace" font-size="11" fill="#c9d1d9">git st   = status -sb</text>

<!-- Hooks hint -->
<rect x="310" y="412" width="255" height="50" rx="8" fill="rgba(233,84,32,0.1)" stroke="#E95420" stroke-width="1"/>
<text x="437" y="433" font-family="Microsoft YaHei,Arial" font-size="11" fill="#E95420" text-anchor="middle" font-weight="bold">Git Hooks 自动化</text>
<text x="437" y="452" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8" text-anchor="middle">提交前检查格式 / 推送前自动测试</text>

<!-- Bottom tag -->
<rect x="350" y="472" width="200" height="24" rx="12" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="489" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">Git / SSH / 开发效率</text>
</svg>`;
save('10-git-workflow-wsl.svg', svg);
}

// ============================================================
// 11 - Docker Desktop + WSL
// ============================================================
{
  const svg = svgHeader() + `
${bgGradient('bg11', '#0c1929', '#1a365d')}
${badge('11')}

<!-- Title -->
<text x="450" y="52" font-family="Microsoft YaHei,Arial,sans-serif" font-size="27" fill="#fff" text-anchor="middle" font-weight="bold">Docker Desktop + WSL 2：容器开发的黄金搭档</text>
<text x="450" y="76" font-family="Microsoft YaHei,Arial,sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">架构原理 / Compose 编排 / 最佳实践</text>

<!-- Architecture diagram -->
<!-- Windows Layer -->
<rect x="60" y="105" width="400" height="55" rx="8" fill="#1e3a5f" stroke="#3b82f6" stroke-width="1.5"/>
<text x="260" y="128" font-family="Microsoft YaHei,Arial" font-size="13" fill="#93c5fd" text-anchor="middle" font-weight="bold">Windows 主机</text>
<text x="260" y="148" font-family="Consolas,monospace" font-size="11" fill="#bfdbfe" text-anchor="middle">docker ps | docker compose up | Docker Desktop CLI</text>

<!-- Arrow down -->
<path d="M260 165 L260 185" stroke="#60a5fa" stroke-width="2" marker-end="url(#arr11)"/>
<defs><marker id="arr11" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6z" fill="#60a5fa"/></marker></defs>

<!-- WSL 2 Layer -->
<rect x="60" y="190" width="400" height="140" rx="8" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
<text x="260" y="213" font-family="Microsoft YaHei,Arial" font-size="13" fill="#6ee7b7" text-anchor="middle" font-weight="bold">WSL 2 虚拟机（Linux 内核）</text>

<!-- Containers in WSL -->
<rect x="80" y="228" width="88" height="50" rx="6" fill="#0f172a" stroke="#3b82f6" stroke-width="1"/>
<text x="124" y="250" font-family="Microsoft YaHei,Arial" font-size="10" fill="#93c5fd" text-anchor="middle">应用服务</text>
<text x="124" y="264" font-family="Arial" font-size="8" fill="#64748b" text-anchor="middle">Container</text>

<rect x="178" y="228" width="88" height="50" rx="6" fill="#0f172a" stroke="#10b981" stroke-width="1"/>
<text x="222" y="250" font-family="Microsoft YaHei,Arial" font-size="10" fill="#6ee7b7" text-anchor="middle">数据库</text>
<text x="222" y="264" font-family="Arial" font-size="8" fill="#64748b" text-anchor="middle">Container</text>

<rect x="276" y="228" width="88" height="50" rx="6" fill="#0f172a" stroke="#f59e0b" stroke-width="1"/>
<text x="320" y="250" font-family="Microsoft YaHei,Arial" font-size="10" fill="#fcd34d" text-anchor="middle">缓存</text>
<text x="320" y="264" font-family="Arial" font-size="8" fill="#64748b" text-anchor="middle">Redis Cache</text>

<rect x="374" y="228" width="74" height="50" rx="6" fill="#0f172a" stroke="#ef4444" stroke-width="1"/>
<text x="411" y="250" font-family="Microsoft YaHei,Arial" font-size="10" fill="#fca5a5" text-anchor="middle">代理</text>
<text x="411" y="264" font-family="Arial" font-size="8" fill="#64748b" text-anchor="middle">Nginx</text>

<!-- Docker daemon label -->
<rect x="80" y="290" width="368" height="32" rx="6" fill="rgba(16,185,129,0.15)"/>
<text x="264" y="311" font-family="Consolas,monospace" font-size="11" fill="#6ee7b7" text-anchor="middle">dockerd 在 Linux VM 中原生运行</text>

<!-- Right panel: Features -->
<text x="495" y="118" font-family="Microsoft YaHei,Arial" font-size="14" fill="#E95420" font-weight="bold">核心优势</text>

<rect x="485" y="130" width="390" height="68" rx="8" fill="#1e293b"/>
<text x="500" y="152" font-family="Microsoft YaHei,Arial" font-size="12" fill="#e2e8f0" font-weight="bold">Linux 原生容器</text>
<text x="500" y="170" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">完整的 Linux 内核支持，无需虚拟化开销</text>
<text x="700" y="152" font-family="Microsoft YaHei,Arial" font-size="12" fill="#e2e8f0" font-weight="bold">文件系统</text>
<text x="700" y="170" font-family="Consolas,monospace" font-size="10" fill="#94a3b8">ext4 / virtiofs</text>

<rect x="485" y="208" width="390" height="68" rx="8" fill="#1e293b"/>
<text x="500" y="230" font-family="Microsoft YaHei,Arial" font-size="12" fill="#e2e8f0" font-weight="bold">Windows 互访</text>
<text x="500" y="248" font-family="Consolas,monospace" font-size="10" fill="#94a3b8">\\\\wsl$\\ 直接访问容器文件</text>
<text x="700" y="230" font-family="Microsoft YaHei,Arial" font-size="12" fill="#e2e8f0" font-weight="bold">端口转发</text>
<text x="700" y="248" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">localhost 直连容器服务</text>

<rect x="485" y="286" width="390" height="68" rx="8" fill="#1e293b"/>
<text x="500" y="308" font-family="Microsoft YaHei,Arial" font-size="12" fill="#e2e8f0" font-weight="bold">资源隔离</text>
<text x="500" y="326" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">CPU/内存/磁盘独立分配</text>
<text x="700" y="308" font-family="Microsoft YaHei,Arial" font-size="12" fill="#e2e8f0" font-weight="bold">网络模式</text>
<text x="700" y="326" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">镜像/桥接/NAT 灵活选择</text>

<!-- Bottom tip -->
<rect x="200" y="375" width="500" height="42" rx="21" fill="rgba(233,84,32,0.12)" stroke="#E95420" stroke-width="1"/>
<text x="450" y="401" font-family="Microsoft YaHei,Arial" font-size="13" fill="#E95420" text-anchor="middle" font-weight="bold">容器与镜像管理：docker images / docker ps / compose up</text>

<!-- Bottom tag -->
<rect x="350" y="442" width="200" height="26" rx="13" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="460" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">Docker / DevOps / 容器化</text>
</svg>`;
save('11-docker-desktop-wsl.svg', svg);
}

// ============================================================
// 12 - 数据库全家桶
// ============================================================
{
  const svg = svgHeader() + `
${bgGradient('bg12', '#13111c', '#1a1528')}
${badge('12')}

<!-- Title -->
<text x="450" y="52" font-family="Microsoft YaHei,Arial,sans-serif" font-size="28" fill="#fff" text-anchor="middle" font-weight="bold">数据库全家桶：一键部署全栈数据存储</text>
<text x="450" y="76" font-family="Microsoft YaHei,Arial,sans-serif" font-size="13" fill="#a0aec0" text-anchor="middle">MySQL + Redis + PostgreSQL + MongoDB 在 WSL 中运行</text>

<!-- Database cylinders row -->
<text x="450" y="112" font-family="Microsoft YaHei,Arial" font-size="15" fill="#E95420" text-anchor="middle" font-weight="bold">四大数据库引擎</text>

<!-- MySQL -->
<g transform="translate(80, 130)">
  <ellipse cx="60" cy="15" rx="55" ry="15" fill="#00758f"/>
  <rect x="5" y="15" width="110" height="65" fill="#006579"/>
  <ellipse cx="60" cy="80" rx="55" ry="15" fill="#005166"/>
  <ellipse cx="60" cy="15" rx="55" ry="15" fill="#00a1b4" opacity="0.5"/>
  <text x="60" y="53" font-family="Arial" font-size="18" fill="#fff" text-anchor="middle" font-weight="bold">MySQL</text>
  <text x="60" y="108" font-family="Consolas,monospace" font-size="12" fill="#00a1b4" text-anchor="middle">:3306</text>
</g>

<!-- PostgreSQL -->
<g transform="translate(265, 130)">
  <ellipse cx="60" cy="15" rx="55" ry="15" fill="#336791"/>
  <rect x="5" y="15" width="110" height="65" fill="#2868ab"/>
  <ellipse cx="60" cy="80" rx="55" ry="15" fill="#1f5a8f"/>
  <ellipse cx="60" cy="15" rx="55" ry="15" fill="#4b8bbe" opacity="0.5"/>
  <text x="60" y="53" font-family="Arial" font-size="16" fill="#fff" text-anchor="middle" font-weight="bold">PostgreSQL</text>
  <text x="60" y="108" font-family="Consolas,monospace" font-size="12" fill="#4b8bbe" text-anchor="middle">:5432</text>
</g>

<!-- Redis -->
<g transform="translate(450, 130)">
  <ellipse cx="60" cy="15" rx="55" ry="15" fill="#dc382d"/>
  <rect x="5" y="15" width="110" height="65" fill="#c92c22"/>
  <ellipse cx="60" cy="80" rx="55" ry="15" fill="#b41f15"/>
  <ellipse cx="60" cy="15" rx="55" ry="15" fill="#e54b42" opacity="0.5"/>
  <text x="60" y="53" font-family="Arial" font-size="18" fill="#fff" text-anchor="middle" font-weight="bold">Redis</text>
  <text x="60" y="108" font-family="Consolas,monospace" font-size="12" fill="#e54b42" text-anchor="middle">:6379</text>
</g>

<!-- MongoDB -->
<g transform="translate(635, 130)">
  <ellipse cx="60" cy="15" rx="55" ry="15" fill="#4ea94b"/>
  <rect x="5" y="15" width="110" height="65" fill="#449641"/>
  <ellipse cx="60" cy="80" rx="55" ry="15" fill="#3a8237"/>
  <ellipse cx="60" cy="15" rx="55" ry="15" fill="#5fbf5c" opacity="0.5"/>
  <text x="60" y="53" font-family="Arial" font-size="16" fill="#fff" text-anchor="middle" font-weight="bold">MongoDB</text>
  <text x="60" y="108" font-family="Consolas,monospace" font-size="12" fill="#5fbf5c" text-anchor="middle">:27017</text>
</g>

<!-- Deploy commands -->
<text x="60" y="275" font-family="Microsoft YaHei,Arial" font-size="14" fill="#E95420" font-weight="bold">一行命令部署</text>
<rect x="50" y="285" width="800" height="80" rx="10" fill="#1a1528" stroke="#334155" stroke-width="1"/>
<text x="70" y="310" font-family="Consolas,monospace" font-size="13" fill="#7ee787">$ docker compose up -d</text>
<text x="70" y="335" font-family="Consolas,monospace" font-size="13" fill="#79c0ff">$ sudo apt install mysql-server postgresql redis-server mongodb-org</text>
<text x="70" y="358" font-family="Consolas,monospace" font-size="11" fill="#8b949e"># 或使用 apt 直接安装，两种方式任选</text>

<!-- Connect from Windows -->
<text x="60" y="395" font-family="Microsoft YaHei,Arial" font-size="14" fill="#E95420" font-weight="bold">Windows 连接方式（通过端口转发）</text>
<rect x="50" y="405" width="800" height="55" rx="10" fill="rgba(233,84,32,0.08)"/>
<text x="70" y="430" font-family="Consolas,monospace" font-size="12" fill="#ffa657">mysql -h localhost -P 3306    psql -h localhost -p 5432    redis-cli ping</text>
<text x="70" y="450" font-family="Microsoft YaHei,Arial" font-size="11" fill="#94a3b8">所有数据库都可通过 localhost 直接从 Windows 客户端访问</text>

<!-- Tag -->
<rect x="330" y="472" width="240" height="24" rx="12" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="489" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">数据库 / 全栈开发 / 一键部署</text>
</svg>`;
save('12-database-stack-wsl.svg', svg);
}

console.log('\nBatch 1 done: 06, 10, 11, 12');
