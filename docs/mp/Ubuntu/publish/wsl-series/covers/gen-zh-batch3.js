const { svgHeader, bgGradient, badge, save } = require('./svg-base');

// ============================================================
// 18 - USB设备连接
// ============================================================
{
  const svg = svgHeader() + `
${bgGradient('bg18', '#0a0f1a', '#131c31')}
${badge('18')}

<!-- Title -->
<text x="450" y="50" font-family="Microsoft YaHei,Arial,sans-serif" font-size="27" fill="#fff" text-anchor="middle" font-weight="bold">USB 设备连接 WSL？USB/IP 与硬件直通实战</text>
<text x="450" y="74" font-family="Microsoft YaHei,Arial,sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">让 U盘/串口/开发板在 WSL 中正常工作</text>

<!-- USB Plug icon (left) -->
<g transform="translate(60, 105)">
  <rect x="0" y="25" width="80" height="42" rx="4" fill="#c0c0c0"/>
  <rect x="-8" y="33" width="12" height="26" rx="2" fill="#888"/>
  <rect x="76" y="33" width="12" height="26" rx="2" fill="#888"/>
  <!-- USB symbol -->
  <rect x="28" y="38" width="24" height="16" rx="3" fill="#333"/>
  <polygon points="34,43 46,47 34,51" fill="#fff"/>
  <!-- Metal part -->
  <rect x="15" y="10" width="50" height="18" rx="3" fill="#d4af37"/>
  <line x1="22" y1="19" x2="58" y2="19" stroke="#b8960f" stroke-width="1"/>
</g>

<!-- Arrow to WSL -->
<path d="M160 145 L210 145" stroke="#E95420" stroke-width="3" marker-end="url(#arr18)"/>
<defs><marker id="arr18" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto"><path d="M0 0 L7 3.5 L0 7z" fill="#E95420"/></marker></defs>
<text x="185" y="137" font-family="Arial" font-size="9" fill="#E95420">USB/IP</text>

<!-- Terminal window -->
<rect x="220" y="100" width="420" height="175" rx="8" fill="#0d1117" stroke="#30363d" stroke-width="1"/>
<rect x="220" y="100" width="420" height="26" rx="8" fill="#161b22"/>
<circle cx="242" cy="113" r="5" fill="#ff5f57"/><circle cx="258" cy="113" r="5" fill="#febc2e"/><circle cx="274" cy="113" r="5" fill="#28c840"/>
<text x="410" y="118" font-family="Consolas,monospace" font-size="11" fill="#8b949e">bash — USB 设备管理</text>

<text x="236" y="146" font-family="Consolas,monospace" font-size="11" fill="#79c0ff">$ usbipd list</text>
<text x="240" y="166" font-family="Consolas,monospace" font-size="10" fill="#8b949e">BUSID  DEVICE                          STATE</text>
<text x="240" y="184" font-family="Consolas,monospace" font-size="10" fill="#7ee787">1-1    SanDisk Ultra 32GB              Not attached</text>
<text x="240" y="202" font-family="Consolas,monospace" font-size="10" fill="#7ee787">1-2    CH340 Serial Converter            Not attached</text>

<text x="236" y="228" font-family="Consolas,monospace" font-size="11" fill="#ffa657">$ usbipd bind -b 1-1 &amp;&amp; wsl attach -b 1-1</text>
<text x="236" y="252" font-family="Consolas,monospace" font-size="11" fill="#7ee787"># 设备已连接到 WSL！</text>
<text x="236" y="270" font-family="Consolas,monospace" font-size="10" fill="#3fb950">$ lsusb</text>

<!-- Step cards on right -->
<text x="660" y="118" font-family="Microsoft YaHei,Arial" font-size="14" fill="#E95420" font-weight="bold">操作步骤</text>

<rect x="652" y="130" width="228" height="55" rx="8" fill="#1e293b"/>
<circle cx="674" y="157" r="13" fill="#E95420"/>
<text x="674" y="162" font-family="Arial" font-size="13" fill="#fff" text-anchor="middle" font-weight="bold">1</text>
<text x="697" y="152" font-family="Microsoft YaHei,Arial" font-size="12" fill="#e2e8f0" font-weight="bold">安装驱动</text>
<text x="697" y="172" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">Windows 端安装 usbipd-win</text>

<rect x="652" y="195" width="228" height="55" rx="8" fill="#1e293b"/>
<circle cx="674" y="222" r="13" fill="#3b82f6"/>
<text x="674" y="227" font-family="Arial" font-size="13" fill="#fff" text-anchor="middle" font-weight="bold">2</text>
<text x="697" y="217" font-family="Microsoft YaHei,Arial" font-size="12" fill="#e2e8f0" font-weight="bold">绑定设备</text>
<text x="697" y="237" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">usbipd bind -b [总线ID]</text>

<rect x="652" y="260" width="228" height="55" rx="8" fill="#1e293b"/>
<circle cx="674" y="287" r="13" fill="#10b981"/>
<text x="674" y="292" font-family="Arial" font-size="13" fill="#fff" text-anchor="middle" font-weight="bold">3</text>
<text x="697" y="282" font-family="Microsoft YaHei,Arial" font-size="12" fill="#e2e8f0" font-weight="bold">挂载到 WSL</text>
<text x="697" y="302" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">wsl --attach -b [总线ID]</text>

<!-- Supported devices -->
<text x="50" y="305" font-family="Microsoft YaHei,Arial" font-size="13" fill="#E95420" font-weight="bold">支持的设备类型</text>
<rect x="40" y="315" width="595" height="55" rx="8" fill="rgba(233,84,32,0.06)"/>

<rect x="56" y="327" width="90" height="32" rx="6" fill="#1e293b"/>
<text x="101" y="348" font-family="Microsoft YaHei,Arial" font-size="11" fill="#e2e8f0" text-anchor="middle">U 盘 / 移动硬盘</text>

<rect x="158" y="327" width="90" height="32" rx="6" fill="#1e293b"/>
<text x="203" y="348" font-family="Microsoft YaHei,Arial" font-size="11" fill="#e2e8f0" text-anchor="middle">串口转换器</text>

<rect x="260" y="327" width="90" height="32" rx="6" fill="#1e293b"/>
<text x="305" y="348" font-family="Microsoft YaHei,Arial" font-size="11" fill="#e2e8f0" text-anchor="middle">Arduino 开发板</text>

<rect x="362" y="327" width="90" height="32" rx="6" fill="#1e293b"/>
<text x="407" y="348" font-family="Microsoft YaHei,Arial" font-size="11" fill="#e2e8f0" text-anchor="middle">ESP32 / STM32</text>

<rect x="464" y="327" width="70" height="32" rx="6" fill="#1e293b"/>
<text x="499" y="348" font-family="Microsoft YaHei,Arial" font-size="11" fill="#e2e8f0" text-anchor="middle">摄像头</text>

<rect x="544" y="327" width="75" height="32" rx="6" fill="#1e293b"/>
<text x="581" y="348" font-family="Microsoft YaHei,Arial" font-size="11" fill="#e2e8f0" text-anchor="middle">打印机</text>

<!-- Note -->
<rect x="650" y="330" width="230" height="35" rx="6" fill="rgba(59,130,246,0.08)" stroke="#3b82f6" stroke-width="1"/>
<text x="765" y="352" font-family="Microsoft YaHei,Arial" font-size="10" fill="#93c5fd" text-anchor="middle">需要 Windows 11 22H2+ 版本</text>

<!-- Tag -->
<rect x="320" y="395" width="260" height="26" rx="13" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="413" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">USB 设备 / 硬件直通 / 开发调试</text>
</svg>`;
save('18-usb-device-wsl.svg', svg);
}

// ============================================================
// 19 - GPU/AI加速
// ============================================================
{
  const svg = svgHeader() + `
${bgGradient('bg19', '#0a0a1a', '#141430')}
${badge('19')}

<!-- Title -->
<text x="450" y="48" font-family="Microsoft YaHei,Arial,sans-serif" font-size="27" fill="#fff" text-anchor="middle" font-weight="bold">在 WSL 中跑 AI/ML 模型？CUDA + PyTorch 实战指南</text>
<text x="450" y="72" font-family="Microsoft YaHei,Arial,sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">GPU 直通 / 深度学习训练 / 本地部署大模型</text>

<!-- GPU Chip diagram (left) -->
<text x="70" y="108" font-family="Microsoft YaHei,Arial" font-size="14" fill="#E95420" font-weight="bold">GPU 架构示意</text>
<rect x="50" y="118" width="280" height="200" rx="10" fill="#0f1628" stroke="#1e3a5f" stroke-width="1.5"/>

<!-- GPU die -->
<rect x="85" y="140" width="210" height="120" rx="6" fill="#1a2744" stroke="#2563eb" stroke-width="2"/>
<text x="190" y="165" font-family="Arial,sans-serif" font-size="14" fill="#60a5fa" text-anchor="middle" font-weight="bold">NVIDIA CUDA GPU 核心</text>

<!-- CUDA cores grid -->
<g transform="translate(100, 180)">
  ${Array.from({length: 24}).map((_, i) => {
    const row = Math.floor(i / 8);
    const col = i % 8;
    return `<rect x="${col * 23}" y="${row * 18}" width="18" height="13" rx="2" fill="#3b82f6"/>`;
  }).join('\n  ')}
</g>

<!-- Memory chips -->
<rect x="85" y="270" width="45" height="30" rx="4" fill="#374151"/><text x="107" y="290" font-family="Arial" font-size="8" fill="#9ca3af" text-anchor="middle">GDDR6</text>
<rect x="140" y="270" width="45" height="30" rx="4" fill="#374151"/><text x="162" y="290" font-family="Arial" font-size="8" fill="#9ca3af" text-anchor="middle">GDDR6</text>
<rect x="195" y="270" width="45" height="30" rx="4" fill="#374151"/><text x="217" y="290" font-family="Arial" font-size="8" fill="#9ca3af" text-anchor="middle">GDDR6</text>
<rect x="250" y="270" width="45" height="30" rx="4" fill="#374151"/><text x="272" y="290" font-family="Arial" font-size="8" fill="#9ca3af" text-anchor="middle">GDDR6</text>

<!-- PCIe connector -->
<rect x="155" y="306" width="70" height="12" rx="3" fill="#d4af37"/>
<text x="190" y="332" font-family="Arial" font-size="9" fill="#d4af37" text-anchor="middle">PCIe 直通 WSL</text>

<!-- AI/ML Frameworks cards (right) -->
<text x="360" y="108" font-family="Microsoft YaHei,Arial" font-size="14" fill="#E95420" font-weight="bold">AI/ML 应用场景</text>

<rect x="350" y="118" width="245" height="58" rx="8" fill="#1a1033" stroke="#a855f7" stroke-width="1"/>
<circle cx="375" y="147" r="14" fill="#a855f7"/>
<polygon points="370,140 380,147 370,154 375,147" fill="#fff"/>
<text x="400" y="142" font-family="Microsoft YaHei,Arial" font-size="12" fill="#e2e8f0" font-weight="bold">本地大模型推理</text>
<text x="400" y="162" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">LLaMA、Qwen 微调与部署</text>

<rect x="610" y="118" width="245" height="58" rx="8" fill="#1a1033" stroke="#ec4899" stroke-width="1"/>
<circle cx="635" y="147" r="14" fill="#ec4899"/>
<rect x="628" y="139" width="14" height="16" rx="3" fill="#fff"/>
<text x="660" y="142" font-family="Microsoft YaHei,Arial" font-size="12" fill="#e2e8f0" font-weight="bold">AI 绘图生成</text>
<text x="660" y="162" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">Stable Diffusion、YOLO 目标检测</text>

<rect x="350" y="186" width="245" height="58" rx="8" fill="#1a1033" stroke="#06b6d4" stroke-width="1"/>
<circle cx="375" y="215" r="14" fill="#06b6d4"/>
<rect x="368" y="207" width="14" height="16" rx="3" fill="#fff"/>
<text x="400" y="210" font-family="Microsoft YaHei,Arial" font-size="12" fill="#e2e8f0" font-weight="bold">数据分析科学</text>
<text x="400" y="230" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">Jupyter、Pandas、Scikit-learn</text>

<rect x="610" y="186" width="245" height="58" rx="8" fill="#1a1033" stroke="#f97316" stroke-width="1"/>
<circle cx="635" y="215" r="14" fill="#f97316"/>
<polygon points="628,208 642,215 628,222 635,215" fill="#fff"/>
<text x="660" y="210" font-family="Microsoft YaHei,Arial" font-size="12" fill="#e2e8f0" font-weight="bold">游戏引擎开发</text>
<text x="660" y="230" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">Unity、Unreal Engine + CUDA 加速</text>

<!-- Framework logos bar -->
<text x="360" y="270" font-family="Microsoft YaHei,Arial" font-size="13" fill="#E95420" font-weight="bold">支持框架</text>
<rect x="350" y="280" width="125" height="38" rx="6" fill="#1e293b" stroke="#ef4444" stroke-width="1"/>
<text x="412" y="304" font-family="Arial,sans-serif" font-size="13" fill="#fca5a5" text-anchor="middle" font-weight="bold">PyTorch</text>

<rect x="485" y="280" width="125" height="38" rx="6" fill="#1e293b" stroke="#fbbf24" stroke-width="1"/>
<text x="547" y="304" font-family="Arial,sans-serif" font-size="13" fill="#fde68a" text-anchor="middle" font-weight="bold">TensorFlow</text>

<rect x="620" y="280" width="115" height="38" rx="6" fill="#1e293b" stroke="#3b82f6" stroke-width="1"/>
<text x="677" y="304" font-family="Arial,sans-serif" font-size="13" fill="#93c5fd" text-anchor="middle" font-weight="bold">ONNX</text>

<rect x="745" y="280" width="110" height="38" rx="6" fill="#1e293b" stroke="#10b981" stroke-width="1"/>
<text x="800" y="304" font-family="Arial,sans-serif" font-size="12" fill="#6ee7b7" text-anchor="middle" font-weight="bold">MLX</text>

<!-- Command hint -->
<rect x="50" y="340" width="800" height="52" rx="10" fill="rgba(233,84,32,0.07)"/>
<text x="70" y="362" font-family="Consolas,monospace" font-size="12" fill="#7ee787">nvidia-smi</text>
<text x="155" y="362" font-family="Microsoft YaHei,Arial" font-size="10" fill="#8b949e">查看 GPU 状态 |</text>
<text x="260" y="362" font-family="Consolas,monospace" font-size="12" fill="#ffa657">python -c "import torch; print(torch.cuda.is_available())"</text>
<text x="600" y="362" font-family="Microsoft YaHei,Arial" font-size="10" fill="#8b949e">验证 CUDA 可用</text>
<text x="70" y="383" font-family="Consolas,monospace" font-size="11" fill="#61afef">nvidia-container-cli list</text>
<text x="250" y="383" font-family="Microsoft YaHei,Arial" font-size="10" fill="#8b949e">Docker 容器中也可直接使用 GPU 资源</text>

<!-- Tag -->
<rect x="315" y="415" width="270" height="26" rx="13" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="433" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">GPU / CUDA / AI / 深度学习 / 本地大模型</text>
</svg>`;
save('19-gpu-ai-ml-wsl.svg', svg);
}

// ============================================================
// 20 - 备份与迁移
// ============================================================
{
  const svg = svgHeader() + `
${bgGradient('bg20', '#0f1923', '#152238')}
${badge('20')}

<!-- Title -->
<text x="450" y="50" font-family="Microsoft YaHei,Arial,sans-serif" font-size="27" fill="#fff" text-anchor="middle" font-weight="bold">WSL 备份与迁移：换电脑不丢环境的完整方案</text>
<text x="450" y="74" font-family="Microsoft YaHei,Arial,sans-serif" font-size="13" fill="#94a3b8" text-anchor="middle">导出 / 导入 / Dotfiles / Docker 打包全攻略</text>

<!-- Flow chart: Old PC -> Cloud -> New PC -->
<!-- Old PC box -->
<rect x="40" y="105" width="170" height="150" rx="10" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
<text x="125" y="128" font-family="Microsoft YaHei,Arial" font-size="13" fill="#60a5fa" text-anchor="middle" font-weight="bold">旧电脑</text>

<rect x="55" y="142" width="140" height="44" rx="6" fill="#0f172a"/>
<text x="68" y="160" font-family="Consolas,monospace" font-size="10" fill="#7ee787">$ wsl --export</text>
<text x="68" y="177" font-family="Consolas,monospace" font-size="9" fill="#8b949e">Ubuntu D:\\bak\\ubu.tar</text>

<rect x="55" y="196" width="140" height="44" rx="6" fill="#0f172a"/>
<text x="68" y="214" font-family="Consolas,monospace" font-size="10" fill="#ffa657">$ dotfiles backup</text>
<text x="68" y="231" font-family="Consolas,monospace" font-size="9" fill="#8b949e"># 配置文件同步</text>

<!-- Arrow to cloud -->
<path d="M220 180 L300 180" stroke="#E95420" stroke-width="3" stroke-dasharray="8,4" marker-end="url(#arr20a)"/>
<defs><marker id="arr20a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8z" fill="#E95420"/></marker></defs>
<text x="260" y="172" font-family="Arial" font-size="10" fill="#E95420">上传</text>

<!-- Cloud box -->
<rect x="310" y="115" width="170" height="130" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
<!-- Cloud shape inside -->
<ellipse cx="395" cy="165" rx="45" ry="25" fill="none" stroke="#10b981" stroke-width="1.5"/>
<circle cx="365" cy="168" r="18" fill="none" stroke="#10b981" stroke-width="1.5"/>
<circle cx="425" cy="168" r="18" fill="none" stroke="#10b981" stroke-width="1.5"/>
<text x="395" y="205" font-family="Microsoft YaHei,Arial" font-size="12" fill="#6ee7b7" text-anchor="middle" font-weight="bold">云存储</text>
<text x="395" y="225" font-family="Consolas,monospace" font-size="9" fill="#94a3b8" text-anchor="middle">GitHub/Gitee/网盘/NAS</text>
<text x="395" y="240" font-family="Consolas,monospace" font-size="9" fill="#94a3b8" text-anchor="middle">~500MB 压缩包</text>

<!-- Arrow from cloud -->
<path d="M490 180 L570 180" stroke="#E95420" stroke-width="3" stroke-dasharray="8,4" marker-end="url(#arr20b)"/>
<defs><marker id="arr20b" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8z" fill="#E95420"/></marker></defs>
<text x="530" y="172" font-family="Arial" font-size="10" fill="#E95420">下载</text>

<!-- New PC box -->
<rect x="580" y="105" width="170" height="150" rx="10" fill="#1e293b" stroke="#a855f7" stroke-width="1.5"/>
<text x="665" y="128" font-family="Microsoft YaHei,Arial" font-size="13" fill="#c084fc" text-anchor="middle" font-weight="bold">新电脑</text>

<rect x="595" y="142" width="140" height="44" rx="6" fill="#0f172a"/>
<text x="608" y="160" font-family="Consolas,monospace" font-size="10" fill="#7ee787">$ wsl --import</text>
<text x="608" y="177" font-family="Consolas,monospace" font-size="9" fill="#8b949e">Ubuntu D:\\wsl ubu.tar</text>

<rect x="595" y="196" width="140" height="44" rx="6" fill="#0f172a"/>
<text x="608" y="214" font-family="Consolas,monospace" font-size="10" fill="#7ee787">$ dotfiles restore</text>
<text x="608" y="231" font-family="Consolas,monospace" font-size="9" fill="#8b949e"># 一键恢复配置</text>

<!-- Three backup methods comparison -->
<text x="50" y="285" font-family="Microsoft YaHei,Arial" font-size="14" fill="#E95420" font-weight="bold">三种备份方案对比</text>

<rect x="40" y="298" width="268" height="85" rx="8" fill="#1e293b"/>
<rect x="52" y="308" width="80" height="22" rx="11" fill="#3b82f6"/>
<text x="92" y="324" font-family="Microsoft YaHei,Arial" font-size="11" fill="#fff" text-anchor="middle" font-weight="bold">wsl export/import</text>
<text x="54" y="348" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">完整系统镜像备份还原</text>
<text x="54" y="368" font-family="Microsoft YaHei,Arial" font-size="10" fill="#64748b">适合：整机迁移，保留所有环境</text>

<rect x="318" y="298" width="268" height="85" rx="8" fill="#1e293b"/>
<rect x="330" y="308" width="64" height="22" rx="11" fill="#10b981"/>
<text x="362" y="324" font-family="Microsoft YaHei,Arial" font-size="11" fill="#fff" text-anchor="middle" font-weight="bold">Dotfiles</text>
<text x="332" y="348" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">Git 同步配置文件 (.bashrc/.vim等)</text>
<text x="332" y="368" font-family="Microsoft YaHei,Arial" font-size="10" fill="#64748b">适合：轻量级，多机快速恢复</text>

<rect x="596" y="298" width="264" height="85" rx="8" fill="#1e293b"/>
<rect x="608" y="308" width="106" height="22" rx="11" fill="#f59e0b"/>
<text x="661" y="324" font-family="Microsoft YaHei,Arial" font-size="11" fill="#fff" text-anchor="middle" font-weight="bold">Docker Compose</text>
<text x="608" y="348" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">容器化环境打包，一键重建服务栈</text>
<text x="608" y="368" font-family="Microsoft YaHei,Arial" font-size="10" fill="#64748b">适合：微服务/数据库等复杂环境</text>

<!-- Tag -->
<rect x="310" y="405" width="280" height="26" rx="13" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="423" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">数据备份 / 环境迁移 / 换机不丢配置</text>
</svg>`;
save('20-backup-migration-wsl.svg', svg);
}

console.log('\nBatch 3 done: 18, 19, 20');
