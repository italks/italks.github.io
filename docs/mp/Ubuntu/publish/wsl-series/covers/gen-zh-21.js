const { svgHeader, bgGradient, badge, save } = require('./svg-base');

// ============================================================
// 21 - 故障排查
// ============================================================
{
  const svg = svgHeader() + `
${bgGradient('bg21', '#1a0a0a', '#2a1515')}
${badge('21')}

<text x="450" y="50" font-family="Microsoft YaHei,Arial,sans-serif" font-size="27" fill="#fff" text-anchor="middle" font-weight="bold">WSL 十大常见问题排查手册（附解决方案）</text>
<text x="450" y="74" font-family="Microsoft YaHei,Arial,sans-serif" font-size="13" fill="#9ca3af" text-anchor="middle">网络不通 / 权限报错 / 内存溢出 / 启动失败 一网打尽</text>

<!-- Warning triangle -->
<g transform="translate(60, 100)">
  <polygon points="50,10 95,90 5,90" fill="none" stroke="#f59e0b" stroke-width="4"/>
  <text x="50" y="72" font-family="Arial" font-size="36" fill="#f59e0b" text-anchor="middle" font-weight="bold">!</text>
</g>

<!-- Problem cards row 1 -->
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

<!-- Debug tip -->
<rect x="40" y="395" width="820" height="48" rx="10" fill="rgba(233,84,32,0.07)" stroke="#E95420" stroke-width="1"/>
<text x="60" y="417" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" font-weight="bold">通用调试命令</text>
<text x="170" y="417" font-family="Consolas,monospace" font-size="11" fill="#c9d1d9">wsl --status | dmesg | journalctl -xe</text>
<text x="60" y="436" font-family="Microsoft YaHei,Arial" font-size="10" fill="#94a3b8">每篇文章都附带详细步骤和截图，从定位问题到彻底解决，手把手教你排查！</text>

<rect x="320" y="458" width="260" height="26" rx="13" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="476" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">故障排查 / 问题解决 / FAQ 手册</text>
</svg>`;
save('21-wsl-troubleshooting-handbook.svg', svg);
}
console.log('21 done');
