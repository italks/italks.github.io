const { svgHeader, bgGradient, badge, card, save } = require('./svg-base');

// ============================================================
// 13 - 性能真相
// ============================================================
{
  const svg = svgHeader() + `
${bgGradient('bg13', '#0d1117', '#161b22')}
${badge('13')}

<!-- Title -->
<text x="450" y="52" font-family="Microsoft YaHei,Arial,sans-serif" font-size="27" fill="#fff" text-anchor="middle" font-weight="bold">WSL 2 性能真相：为什么有时比 Windows 还慢？</text>
<text x="450" y="76" font-family="Microsoft YaHei,Arial,sans-serif" font-size="13" fill="#8b949e" text-anchor="middle">I/O 瓶颈 / 内存分配 / 文件系统 / 优化方案</text>

<!-- Speedometer -->
<text x="160" y="115" font-family="Microsoft YaHei,Arial" font-size="14" fill="#E95420" font-weight="bold">性能仪表盘</text>

<g transform="translate(60, 130)">
  <!-- Gauge bg -->
  <path d="M20 120 A100 100 0 1 1 180 120" fill="none" stroke="#21262d" stroke-width="18"/>
  <!-- Green zone -->
  <path d="M30 125 A90 90 0 0 1 70 45" fill="none" stroke="#3fb950" stroke-width="14" stroke-linecap="round"/>
  <!-- Yellow zone -->
  <path d="M70 45 A90 90 0 0 1 130 35" fill="none" stroke="#d29922" stroke-width="14" stroke-linecap="round"/>
  <!-- Red zone -->
  <path d="M130 35 A90 90 0 0 1 170 125" fill="none" stroke="#f85149" stroke-width="14" stroke-linecap="round"/>

  <!-- Needle pointing to yellow-ish area -->
  <line x1="100" y1="110" x2="145" y2="55" stroke="#E95420" stroke-width="3" stroke-linecap="round"/>
  <circle cx="100" cy="110" r="10" fill="#E95420"/>

  <!-- Labels -->
  <text x="25" y="140" font-family="Arial" font-size="11" fill="#3fb950" font-weight="bold">快</text>
  <text x="88" y="28" font-family="Arial" font-size="11" fill="#d29922" font-weight="bold">中</text>
  <text x="165" y="140" font-family="Arial" font-size="11" fill="#f85149" font-weight="bold">慢</text>
</g>

<!-- Key insight cards -->
${card(280, 128, 1, '跨文件系统 I/O 最慢', '/mnt/c/ 下操作比 /home/ 慢 5-10 倍')}
${card(280, 210, 2, '默认占用一半内存', '可通过 .wslconfig 自由调整上限')}
${card(468, 128, 3, '代码放 Linux 内部', '始终使用 /home/user/ 存放项目文件')}
${card(468, 210, 4, 'virtiofs 新驱动', 'WSL 2.0+ 可大幅提升文件访问性能')}

<!-- Bottom tips -->
<rect x="50" y="330" width="800" height="80" rx="10" fill="#161b22" border="#30363d">
  <text x="70" y="355" font-family="Microsoft YaHei,Arial" font-size="13" fill="#58a6ff" font-weight="bold">优化建议</text>
  <text x="70" y="377" font-family="Microsoft YaHei,Arial" font-size="11" fill="#c9d1d9">1. 项目代码放在 /home/ 目录下</text>
  <text x="350" y="377" font-family="Microsoft YaHei,Arial" font-size="11" fill="#c9d1d9">2. 使用 .wslconfig 调整内存/CPU</text>
  <text x="620" y="377" font-family="Microsoft YaHei,Arial" font-size="11" fill="#c9d1d9">3. 启用 virtiofs 加速文件 I/O</text>
  <text x="70" y="400" font-family="Consolas,monospace" font-size="11" fill="#7ee787"># 优化后性能可提升 300% 以上！</text>
</rect>

<!-- Tag -->
<rect x="340" y="430" width="220" height="26" rx="13" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="448" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">性能优化 / 基准测试 / 排查</text>
</svg>`;
save('13-wsl-performance-truth.svg', svg);
}

// ============================================================
// 14 - wslconfig 黑魔法
// ============================================================
{
  const svg = svgHeader() + `
${bgGradient('bg14', '#111827', '#1f2937')}
${badge('14')}

<!-- Title -->
<text x="450" y="52" font-family="Microsoft YaHei,Arial,sans-serif" font-size="28" fill="#fff" text-anchor="middle" font-weight="bold">.wslconfig 黑魔法：内存、CPU、磁盘随便调</text>
<text x="450" y="76" font-family="Microsoft YaHei,Arial,sans-serif" font-size="13" fill="#9ca3af" text-anchor="middle">深度调优配置文件，释放 WSL 全部潜能</text>

<!-- VS Code editor mockup for .wslconfig -->
<rect x="40" y="98" width="480" height="310" rx="8" fill="#1e1e1e"/>
<!-- Editor title bar -->
<rect x="40" y="98" width="480" height="32" rx="8" fill="#323233"/>
<circle cx="62" cy="114" r="6" fill="#ff5f56"/><circle cx="82" cy="114" r="6" fill="#febc2e"/><circle cx="102" cy="114" r="6" fill="#28c840"/>
<text x="270" y="119" font-family="Consolas,monospace" font-size="12" fill="#cccccc">.wslconfig</text>

<!-- File path bar -->
<rect x="40" y="130" width="480" height="24" fill="#2d2d2d"/>
<text x="55" y="147" font-family="Consolas,monospace" font-size="10" fill="#858585">C:\\Users\\You\\.wslconfig</text>

<!-- Line numbers gutter -->
<rect x="40" y="154" width="36" height="254" fill="#252526"/>
<text x="57" y="175" font-family="Consolas,monospace" font-size="11" fill="#858585" text-anchor="end">1</text>
<text x="57" y="197" font-family="Consolas,monospace" font-size="11" fill="#858585" text-anchor="end">2</text>
<text x="57" y="219" font-family="Consolas,monospace" font-size="11" fill="#858585" text-anchor="end">3</text>
<text x="57" y="241" font-family="Consolas,monospace" font-size="11" fill="#858585" text-anchor="end">4</text>
<text x="57" y="263" font-family="Consolas,monospace" font-size="11" fill="#858585" text-anchor="end">5</text>
<text x="57" y="285" font-family="Consolas,monospace" font-size="11" fill="#858585" text-anchor="end">6</text>
<text x="57" y="307" font-family="Consolas,monospace" font-size="11" fill="#858585" text-anchor="end">7</text>
<text x="57" y="329" font-family="Consolas,monospace" font-size="11" fill="#858585" text-anchor="end">8</text>
<text x="57" y="351" font-family="Consolas,monospace" font-size="11" fill="#858585" text-anchor="end">9</text>
<text x="57" y="373" font-family="Consolas,monospace" font-size="11" fill="#858585" text-anchor="end">10</text>
<text x="57" y="395" font-family="Consolas,monospace" font-size="11" fill="#858585" text-anchor="end">11</text>

<!-- Code content with syntax highlighting -->
<text x="84" y="173" font-family="Consolas,monospace" font-size="12" fill="#569cd6">[wsl2]</text>
<text x="84" y="195" font-family="Consolas,monospace" font-size="12" fill="#9cdcfe">memory</text><text x="134" y="195" font-family="Consolas,monospace" font-size="12" fill="#d4d4d4">=</text><text x="144" y="195" font-family="Consolas,monospace" font-size="12" fill="#ce9178">16GB</text>
<text x="84" y="217" font-family="Consolas,monospace" font-size="12" fill="#9cdcfe">processors</text><text x="152" y="217" font-family="Consolas,monospace" font-size="12" fill="#d4d4d4">=</text><text x="162" y="217" font-family="Consolas,monospace" font-size="12" fill="#b5cea8">8</text>
<text x="84" y="239" font-family="Consolas,monospace" font-size="12" fill="#9cdcfe">swap</text><text x="118" y="239" font-family="Consolas,monospace" font-size="12" fill="#d4d4d4">=</text><text x="128" y="239" font-family="Consolas,monospace" font-size="12" fill="#ce9178">4GB</text>
<text x="84" y="261" font-family="Consolas,monospace" font-size="12" fill="#9cdcfe">localhostForwarding</text><text x="208" y="261" font-family="Consolas,monospace" font-size="12" fill="#d4d4d4">=</text><text x="218" y="261" font-family="Consolas,monospace" font-size="12" fill="#569cd6">true</text>
<text x="84" y="283" font-family="Consolas,monospace" font-size="12" fill="#6a9955"># 高级选项</text>
<text x="84" y="305" font-family="Consolas,monospace" font-size="12" fill="#9cdcfe">vmIdleTimeout</text><text x="174" y="305" font-family="Consolas,monospace" font-size="12" fill="#d4d4d4">=</text><text x="184" y="305" font-family="Consolas,monospace" font-size="12" fill="#ce9178">-1</text>
<text x="84" y="327" font-family="Consolas,monospace" font-size="12" fill="#9cdcfe">debugConsole</text><text x="168" y="327" font-family="Consolas,monospace" font-size="12" fill="#d4d4d4">=</text><text x="178" y="327" font-family="Consolas,monospace" font-size="12" fill="#569cd6">true</text>
<text x="84" y="349" font-family="Consolas,monospace" font-size="12" fill="#9cdcfe">nestedVirtualization</text><text x="228" y="349" font-family="Consolas,monospace" font-size="12" fill="#d4d4d4">=</text><text x="238" y="349" font-family="Consolas,monospace" font-size="12" fill="#569cd6">false</text>

<!-- Slider UI on right side -->
<text x="550" y="118" font-family="Microsoft YaHei,Arial" font-size="15" fill="#E95420" font-weight="bold">可视化调节面板</text>

<!-- Memory slider -->
<rect x="545" y="132" width="320" height="65" rx="8" fill="#1f2937"/>
<text x="560" y="153" font-family="Microsoft YaHei,Arial" font-size="12" fill="#e5e7eb" font-weight="bold">内存 (Memory)</text>
<rect x="560" y="163" width="260" height="8" rx="4" fill="#374151"/>
<rect x="560" y="163" width="170" height="8" rx="4" fill="#E95420"/>
<circle cx="730" cy="167" r="9" fill="#E95420"/>
<text x="838" y="171" font-family="Arial" font-size="12" fill="#E95420" font-weight="bold">16GB</text>

<!-- CPU slider -->
<rect x="545" y="207" width="320" height="65" rx="8" fill="#1f2937"/>
<text x="560" y="228" font-family="Microsoft YaHei,Arial" font-size="12" fill="#e5e7eb" font-weight="bold">处理器 (CPU)</text>
<rect x="560" y="238" width="260" height="8" rx="4" fill="#374151"/>
<rect x="560" y="238" width="200" height="8" rx="4" fill="#3b82f6"/>
<circle cx="760" cy="242" r="9" fill="#3b82f6"/>
<text x="838" y="246" font-family="Arial" font-size="12" fill="#3b82f6" font-weight="bold">8 核</text>

<!-- Swap slider -->
<rect x="545" y="282" width="320" height="65" rx="8" fill="#1f2937"/>
<text x="560" y="303" font-family="Microsoft YaHei,Arial" font-size="12" fill="#e5e7eb" font-weight="bold">交换空间 (Swap)</text>
<rect x="560" y="313" width="260" height="8" rx="4" fill="#374151"/>
<rect x="560" y="313" width="75" height="8" rx="4" fill="#10b981"/>
<circle cx="635" cy="317" r="9" fill="#10b981"/>
<text x="838" y="321" font-family="Arial" font-size="12" fill="#10b981" font-weight="bold">4GB</text>

<!-- Tip box -->
<rect x="545" y="360" width="320" height="48" rx="8" fill="rgba(233,84,32,0.1)" stroke="#E95420" stroke-width="1"/>
<text x="705" y="382" font-family="Microsoft YaHei,Arial" font-size="11" fill="#E95420" text-anchor="middle" font-weight="bold">建议设为物理内存的 50%~75%</text>
<text x="705" y="400" font-family="Microsoft YaHei,Arial" font-size="10" fill="#9ca3af" text-anchor="middle">修改后需执行 wsl --shutdown 重启生效</text>

<!-- Tag -->
<rect x="350" y="435" width="200" height="26" rx="13" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="453" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">配置调优 / 性能参数 / 深度定制</text>
</svg>`;
save('14-wslconfig-tuning.svg', svg);
}

// ============================================================
// 15 - 多发行版管理
// ============================================================
{
  const svg = svgHeader() + `
${bgGradient('bg15', '#0c1222', '#162038')}
${badge('15')}

<!-- Title -->
<text x="450" y="52" font-family="Microsoft YaHei,Arial,sans-serif" font-size="28" fill="#fff" text-anchor="middle" font-weight="bold">同时装 5 个 Linux 发行版？多发行版管理与切换</text>
<text x="450" y="76" font-family="Microsoft YaHei,Arial,sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">Ubuntu / Debian / Fedora / Arch / openSUSE 并存指南</text>

<!-- Distro cards row -->
<!-- Ubuntu -->
<rect x="40" y="100" width="155" height="105" rx="10" fill="#1a1a2e" stroke="#E95420" stroke-width="2"/>
<circle cx="117" cy="138" r="22" fill="none" stroke="#E95420" stroke-width="3"/>
<circle cx="117" cy="138" r="10" fill="#E95420"/>
<text x="117" y="178" font-family="Arial,sans-serif" font-size="16" fill="#E95420" text-anchor="middle" font-weight="bold">Ubuntu</text>
<text x="117" y="196" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8" text-anchor="middle">默认 · 24.04 LTS</text>

<!-- Debian -->
<rect x="208" y="100" width="155" height="105" rx="10" fill="#1a1a2e" stroke="#a81d33" stroke-width="1.5"/>
<path d="M285 120 L300 148 L270 148 Z" fill="#a81d33"/>
<rect x="278" y="146" width="14" height="16" fill="#a81d33"/>
<text x="285" y="178" font-family="Arial,sans-serif" font-size="16" fill="#d64f59" text-anchor="middle" font-weight="bold">Debian</text>
<text x="285" y="196" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8" text-anchor="middle">稳定 · 12 Bookworm</text>

<!-- Fedora -->
<rect x="376" y="100" width="155" height="105" rx="10" fill="#1a1a2e" stroke="#51a2da" stroke-width="1.5"/>
<circle cx="453" cy="138" r="22" fill="none" stroke="#51a2da" stroke-width="3"/>
<path d="M443 138 Q453 123 463 138 Q453 153 443 138" fill="#51a2da"/>
<text x="453" y="178" font-family="Arial,sans-serif" font-size="16" fill="#51a2da" text-anchor="middle" font-weight="bold">Fedora</text>
<text x="453" y="196" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8" text-anchor="middle">前沿 · 41</text>

<!-- Arch -->
<rect x="544" y="100" width="155" height="105" rx="10" fill="#1a1a2e" stroke="#1793d1" stroke-width="1.5"/>
<polygon points="621,120 641,150 601,150" fill="none" stroke="#1793d1" stroke-width="2.5"/>
<text x="621" y="178" font-family="Arial,sans-serif" font-size="16" fill="#1793d1" text-anchor="middle" font-weight="bold">Arch</text>
<text x="621" y="196" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8" text-anchor="middle">滚动更新 · 滚动版</text>

<!-- openSUSE -->
<rect x="712" y="100" width="155" height="105" rx="10" fill="#1a1a2e" stroke="#73ba25" stroke-width="1.5"/>
<path d="M789 118 L797 135 L789 152 L781 135 Z" fill="#73ba25"/>
<text x="789" y="178" font-family="Arial,sans-serif" font-size="15" fill="#73ba25" text-anchor="middle" font-weight="bold">openSUSE</text>
<text x="789" y="196" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8" text-anchor="middle">企业级 · Tumbleweed</text>

<!-- Commands section -->
<text x="50" y="235" font-family="Microsoft YaHei,Arial" font-size="14" fill="#E95420" font-weight="bold">常用管理命令</text>

<rect x="40" y="245" width="820" height="130" rx="10" fill="#0f1629" stroke="#1e293b" stroke-width="1"/>
<text x="60" y="272" font-family="Consolas,monospace" font-size="12" fill="#7ee787">wsl --list --verbose</text>
<text x="290" y="272" font-family="Microsoft YaHei,Arial" font-size="11" fill="#64748b">查看所有发行版及状态（运行中/已停止）</text>

<text x="60" y="300" font-family="Consolas,monospace" font-size="12" fill="#7ee787">wsl --set-default Ubuntu-24.04</text>
<text x="330" y="300" font-family="Microsoft YaHei,Arial" font-size="11" fill="#64748b">设置默认启动的发行版</text>

<text x="60" y="328" font-family="Consolas,monospace" font-size="12" fill="#7ee787">wsl -d Arch</text>
<text x="190" y="328" font-family="Microsoft YaHei,Arial" font-size="11" fill="#64748b">指定发行版启动</text>

<text x="420" y="328" font-family="Consolas,monospace" font-size="12" fill="#7ee787">wsl --shutdown</text>
<text x="560" y="328" font-family="Microsoft YaHei,Arial" font-size="11" fill="#64748b">关闭所有发行版</text>

<text x="60" y="356" font-family="Consolas,monospace" font-size="12" fill="#ffa657">wsl --export Debian D:\backup\debian.tar</text>
<text x="380" y="356" font-family="Microsoft YaHei,Arial" font-size="11" fill="#64748b">导出发行版备份</text>

<!-- Tips -->
<rect x="40" y="390" width="820" height="55" rx="10" fill="rgba(233,84,32,0.08)" stroke="#E95420" stroke-width="1"/>
<text x="60" y="414" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" font-weight="bold">实用技巧</text>
<text x="130" y="414" font-family="Microsoft YaHei,Arial" font-size="11" fill="#c9d1d9">每个发行版独立环境互不干扰</text>
<text x="400" y="414" font-family="Microsoft YaHei,Arial" font-size="11" fill="#c9d1d9">可同时运行多个实例</text>
<text x="650" y="414" font-family="Microsoft YaHei,Arial" font-size="11" fill="#c9d1d9">共享 WSL 内核资源按需分配</text>
<text x="60" y="436" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">推荐组合：Ubuntu 日常开发 + Arch 尝鲜新特性 + Debian 学习服务器运维</text>

<!-- Tag -->
<rect x="330" y="460" width="240" height="26" rx="13" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="478" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">多发行版 / 切换管理 / 备份迁移</text>
</svg>`;
save('15-multi-distro-management.svg', svg);
}

// ============================================================
// 16 - systemd 服务管理
// ============================================================
{
  const svg = svgHeader() + `
${bgGradient('bg16', '#121218', '#1c1c26')}
${badge('16')}

<!-- Title -->
<text x="450" y="52" font-family="Microsoft YaHei,Arial,sans-serif" font-size="27" fill="#fff" text-anchor="middle" font-weight="bold">让 WSL 开机自启：systemd 服务管理完全指南</text>
<text x="450" y="76" font-family="Microsoft YaHei,Arial,sans-serif" font-size="13" fill="#8b949e" text-anchor="middle">启用 systemd / 自定义服务 / 开机自启实战</text>

<!-- Gear icon -->
<g transform="translate(70, 108)">
  <circle cx="55" cy="55" r="42" fill="none" stroke="#30363d" stroke-width="2"/>
  <circle cx="55" cy="55" r="30" fill="none" stroke="#E95420" stroke-width="4" opacity="0.3"/>
  <circle cx="55" cy="55" r="20" fill="#E95420" opacity="0.15"/>
  <!-- Gear teeth -->
  <g transform="translate(55,55)">
    <rect x="-6" y="-48" width="12" height="14" rx="3" fill="#E95420" transform="rotate(0)"/>
    <rect x="-6" y="-48" width="12" height="14" rx="3" fill="#E95420" transform="rotate(45)"/>
    <rect x="-6" y="-48" width="12" height="14" rx="3" fill="#E95420" transform="rotate(90)"/>
    <rect x="-6" y="-48" width="12" height="14" rx="3" fill="#E95420" transform="rotate(135)"/>
    <rect x="-6" y="-48" width="12" height="14" rx="3" fill="#E95420" transform="rotate(180)"/>
    <rect x="-6" y="-48" width="12" height="14" rx="3" fill="#E95420" transform="rotate(225)"/>
    <rect x="-6" y="-48" width="12" height="14" rx="3" fill="#E95420" transform="rotate(270)"/>
    <rect x="-6" y="-48" width="12" height="14" rx="3" fill="#E95420" transform="rotate(315)"/>
    <circle cx="0" cy="0" r="14" fill="#1e2433" stroke="#E95420" stroke-width="3"/>
  </g>
</g>

<!-- Terminal: systemctl output -->
<rect x="210" y="102" width="650" height="165" rx="8" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
<rect x="210" y="102" width="650" height="26" rx="8" fill="#161b22"/>
<text x="225" y="120" font-family="Consolas,monospace" font-size="11" fill="#8b949e">bash — systemctl list-units --type=service --state=running</text>

<text x="222" y="147" font-family="Consolas,monospace" font-size="11" fill="#7ee787" font-weight="bold">UNIT</text>
<text x="420" y="147" font-family="Consolas,monospace" font-size="11" fill="#7ee787" font-weight="bold">LOAD</text>
<text x="500" y="147" font-family="Consolas,monospace" font-size="11" fill="#7ee787" font-weight="bold">ACTIVE</text>
<text x="600" y="147" font-family="Consolas,monospace" font-size="11" fill="#7ee787" font-weight="bold">SUB</text>
<text x="700" y="147" font-family="Consolas,monospace" font-size="11" fill="#7ee787" font-weight="bold">DESCRIPTION</text>

<line x1="215" y1="154" x2="850" y2="154" stroke="#21262d" stroke-width="1"/>

<text x="222" y="172" font-family="Consolas,monospace" font-size="10" fill="#c9d1d9">docker.service</text>
<text x="420" y="172" font-family="Consolas,monospace" font-size="10" fill="#7ee787">loaded</text>
<text x="500" y="172" font-family="Consolas,monospace" font-size="10" fill="#3fb950">active</text>
<text x="600" y="172" font-family="Consolas,monospace" font-size="10" fill="#3fb950">running</text>
<text x="700" y="172" font-family="Consolas,monospace" font-size="10" fill="#8b949e">Docker 容器引擎</text>

<text x="222" y="192" font-family="Consolas,monospace" font-size="10" fill="#c9d1d9">nginx.service</text>
<text x="420" y="192" font-family="Consolas,monospace" font-size="10" fill="#7ee787">loaded</text>
<text x="500" y="192" font-family="Consolas,monospace" font-size="10" fill="#3fb950">active</text>
<text x="600" y="192" font-family="Consolas,monospace" font-size="10" fill="#3fb950">running</text>
<text x="700" y="192" font-family="Consolas,monospace" font-size="10" fill="#8b949e">Web 反向代理服务器</text>

<text x="222" y="212" font-family="Consolas,monospace" font-size="10" fill="#c9d1d9">mysql.service</text>
<text x="420" y="212" font-family="Consolas,monospace" font-size="10" fill="#7ee787">loaded</text>
<text x="500" y="212" font-family="Consolas,monospace" font-size="10" fill="#3fb950">active</text>
<text x="600" y="212" font-family="Consolas,monospace" font-size="10" fill="#3fb950">running</text>
<text x="700" y="212" font-family="Consolas,monospace" font-size="10" fill="#8b949e">MySQL 数据库服务</text>

<text x="222" y="232" font-family="Consolas,monospace" font-size="10" fill="#c9d1d9">redis-server.service</text>
<text x="420" y="232" font-family="Consolas,monospace" font-size="10" fill="#7ee787">loaded</text>
<text x="500" y="232" font-family="Consolas,monospace" font-size="10" fill="#3fb950">active</text>
<text x="600" y="232" font-family="Consolas,monospace" font-size="10" fill="#3fb950">running</text>
<text x="700" y="232" font-family="Consolas,monospace" font-size="10" fill="#8b949e">Redis 缓存服务</text>

<text x="222" y="256" font-family="Consolas,monospace" font-size="10" fill="#8b949e">4 services listed.</text>

<!-- Enable commands -->
<text x="50" y="290" font-family="Microsoft YaHei,Arial" font-size="14" fill="#E95420" font-weight="bold">常用命令速查</text>

<rect x="40" y="300" width="410" height="100" rx="8" fill="#161b22"/>
<text x="55" y="324" font-family="Consolas,monospace" font-size="12" fill="#7ee787">sudo systemctl enable docker</text>
<text x="300" y="324" font-family="Microsoft YaHei,Arial" font-size="10" fill="#8b949e">开机自启 Docker</text>

<text x="55" y="348" font-family="Consolas,monospace" font-size="12" fill="#7ee787">sudo systemctl status nginx</text>
<text x="280" y="348" font-family="Microsoft YaHei,Arial" font-size="10" fill="#8b949e">查看 Nginx 运行状态</text>

<text x="55" y="372" font-family="Consolas,monospace" font-size="12" fill="#7ee787">sudo systemctl restart mysql</text>
<text x="290" y="372" font-family="Microsoft YaHei,Arial" font-size="10" fill="#8b949e">重启 MySQL 服务</text>

<text x="55" y="392" font-family="Consolas,monospace" font-size="12" fill="#ffa657">journalctl -u myapp -f</text>
<text x="250" y="392" font-family="Microsoft YaHei,Arial" font-size="10" fill="#8b949e">查看应用日志</text>

<!-- Enable systemd hint -->
<rect x="470" y="300" width="390" height="100" rx="8" fill="rgba(233,84,32,0.08)" stroke="#E95420" stroke-width="1"/>
<text x="665" y="325" font-family="Microsoft YaHei,Arial" font-size="13" fill="#E95420" text-anchor="middle" font-weight="bold">如何启用 systemd？</text>
<text x="495" y="350" font-family="Consolas,monospace" font-size="11" fill="#c9d1d9">编辑 /etc/wsl.conf 添加：</text>
<text x="495" y="370" font-family="Consolas,monospace" font-size="11" fill="#7ee787">[boot]</text>
<text x="495" y="388" font-family="Consolas,monospace" font-size="11" fill="#7ee787">systemd=true</text>
<text x="700" y="388" font-family="Microsoft YaHei,Arial" font-size="10" fill="#8b949e">然后重启 WSL</text>

<!-- Tag -->
<rect x="340" y="420" width="220" height="26" rx="13" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="438" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">systemd / 服务管理 / 开机自启</text>
</svg>`;
save('16-wsl-systemd-services.svg', svg);
}

// ============================================================
// 17 - 终端美化
// ============================================================
{
  const svg = svgHeader() + `
${bgGradient('bg17', '#1a1b26', '#24283b')}
${badge('17')}

<!-- Title -->
<text x="450" y="50" font-family="Microsoft YaHei,Arial,sans-serif" font-size="27" fill="#fff" text-anchor="middle" font-weight="bold">WSL 终端美化大作战：Oh My Posh + 字体 + 主题</text>
<text x="450" y="74" font-family="Microsoft YaHei,Arial,sans-serif" font-size="13" fill="#a9b1d6" text-anchor="middle">打造颜值与效率兼具的开发者终端</text>

<!-- Beautiful terminal mockup (Tokyo Night style) -->
<rect x="50" y="96" width="800" height="240" rx="10" fill="#1a1b26" stroke="#414868" stroke-width="1"/>
<!-- Terminal title bar -->
<rect x="50" y="96" width="800" height="28" rx="10" fill="#16161e"/>
<circle cx="77" cy="110" r="6" fill="#f7768e"/><circle cx="97" cy="110" r="6" fill="#e0af68"/><circle cx="117" cy="110" r="6" fill="#9ece6a"/>
<text x="440" y="115" font-family="Microsoft YaHei,Arial" font-size="11" fill="#565f89">Windows Terminal — Ubuntu</text>

<!-- Oh My Posh prompt segments -->
<rect x="66" y="138" width="768" height="185" rx="6" fill="#1a1b26"/>

<!-- Prompt line 1: user@host segment -->
<rect x="72" y="150" width="86" height="22" rx="4" fill="#7aa2f7"/>
<text x="115" y="166" font-family="Consolas,monospace" font-size="11" fill="#1a1b26" text-anchor="middle" font-weight="bold">user</text>

<rect x="158" y="150" width="4" height="22" fill="#7aa2f7"/>
<rect x="162" y="150" width="92" height="22" rx="0" fill="#bb9af7"/>
<text x="208" y="166" font-family="Consolas,monospace" font-size="11" fill="#1a1b26" text-anchor="middle" font-weight="bold">dev-machine</text>

<rect x="254" y="150" width="4" height="22" fill="#bb9af7"/>
<rect x="258" y="150" width="54" height="22" rx="0" fill="#9ece6a"/>
<text x="285" y="166" font-family="Consolas,monospace" font-size="11" fill="#1a1b26" text-anchor="middle" font-weight="bold">~/wsl</text>

<rect x="312" y="150" width="4" height="22" fill="#9ece6a"/>
<rect x="316" y="150" width="52" height="22" rx="0" fill="#f7768e"/>
<text x="342" y="166" font-family="Consolas,monospace" font-size="10" fill="#fff" text-anchor="middle">main</text>

<rect x="368" y="150" width="4" height="22" fill="#f7768e"/>
<text x="380" y="166" font-family="Consolas,monospace" font-size="11" fill="#7aa2f7">$</text>

<text x="398" y="166" font-family="Consolas,monospace" font-size="11" fill="#c0caf5">git status &amp;&amp; npm test</text>

<!-- Output line -->
<text x="80" y="192" font-family="Consolas,monospace" font-size="10" fill="#9ece6a">On branch main</text>
<text x="80" y="210" font-family="Consolas,monospace" font-size="10" fill="#c0caf5">nothing to commit, working tree clean</text>
<text x="80" y="228" font-family="Consolas,monospace" font-size="10" fill="#9ece6a">PASS: 42/42 tests</text>
<text x="80" y="246" font-family="Consolas,monospace" font-size="10" fill="#e0af68">Duration: 3.2s</text>

<!-- Prompt line 2 (shorter path) -->
<rect x="72" y="264" width="70" height="20" rx="4" fill="#7aa2f7"/>
<text x="107" y="279" font-family="Consolas,monospace" font-size="10" fill="#1a1b26" text-anchor="middle" font-weight="bold">user</text>
<rect x="142" y="264" width="4" height="20" fill="#7aa2f7"/>
<rect x="146" y="264" width="64" height="20" fill="#9ece6a"/>
<text x="178" y="279" font-family="Consolas,monospace" font-size="10" fill="#1a1b26" text-anchor="middle" font-weight="bold">~</text>
<rect x="210" y="264" width="4" height="20" fill="#9ece6a"/>
<text x="222" y="279" font-family="Consolas,monospace" font-size="11" fill="#7aa2f7">$</text>
<text x="238" y="279" font-family="Consolas,monospace" font-size="11" fill="#c0caf5">_</text>

<!-- Cursor blink effect -->
<rect x="236" y="269" width="7" height="15" fill="#7aa2f7" opacity="0.7">

</rect>

<!-- Feature cards below terminal -->
<text x="50" y="358" font-family="Microsoft YaHei,Arial" font-size="14" fill="#E95420" font-weight="bold">美化三要素</text>

<!-- Card 1: Oh My Posh -->
<rect x="50" y="370" width="255" height="72" rx="8" fill="#1e2030" stroke="#7aa2f7" stroke-width="1"/>
<text x="177" y="393" font-family="Microsoft YaHei,Arial" font-size="13" fill="#7aa2f7" text-anchor="middle" font-weight="bold">Oh My Posh</text>
<text x="70" y="415" font-family="Microsoft YaHei,Arial" font-size="10" fill="#a9b1d6">分段式提示符主题引擎</text>
<text x="70" y="432" font-family="Consolas,monospace" font-size="9" fill="#565f89">200+ 主题可选，支持自定义</text>

<!-- Card 2: Nerd Font -->
<rect x="322" y="370" width="255" height="72" rx="8" fill="#1e2030" stroke="#9ece6a" stroke-width="1"/>
<text x="449" y="393" font-family="Microsoft YaHei,Arial" font-size="13" fill="#9ece6a" text-anchor="middle" font-weight="bold">Nerd Font 字体</text>
<text x="342" y="415" font-family="Microsoft YaHei,Arial" font-size="10" fill="#a9b1d6">等宽编程字体 + 图标集</text>
<text x="342" y="432" font-family="Consolas,monospace" font-size="9" fill="#565f89">推荐: JetBrainsMono Nerd Font</text>

<!-- Card 3: Windows Terminal -->
<rect x="595" y="370" width="255" height="72" rx="8" fill="#1e2030" stroke="#f7768e" stroke-width="1"/>
<text x="722" y="393" font-family="Microsoft YaHei,Arial" font-size="13" fill="#f7768e" text-anchor="middle" font-weight="bold">Windows Terminal</text>
<text x="615" y="415" font-family="Microsoft YaHei,Arial" font-size="10" fill="#a9b1d6">GPU 渲染 + 标签页 + 分屏</text>
<text x="615" y="432" font-family="Consolas,monospace" font-size="9" fill="#565f89">透明度、背景图、配色方案</text>

<!-- Tag -->
<rect x="330" y="460" width="240" height="26" rx="13" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="478" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">终端美化 / Oh My Posh / 主题</text>
</svg>`;
save('17-terminal-beautification.svg', svg);
}

console.log('\nBatch 2 done: 13, 14, 15, 16, 17');
