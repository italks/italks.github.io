const { svgHeader, bgGradient, badge, save } = require('./svg-base');

// ============================================================
// 25 - 附录速查表
// ============================================================
{
  const svg = svgHeader() + `
${bgGradient('bg25', '#0d1117', '#161b22')}
${badge('25')}

<text x="450" y="46" font-family="Microsoft YaHei,Arial,sans-serif" font-size="26" fill="#fff" text-anchor="middle" font-weight="bold">附录：WSL 常用命令速查表 + 配置模板大全</text>
<text x="450" y="68" font-family="Microsoft YaHei,Arial,sans-serif" font-size="12" fill="#8b949e" text-anchor="middle">收藏这一张就够了！核心命令、路径参考、配置模板一站式查询</text>

<!-- Column 1: Essential Commands -->
<rect x="25" y="82" width="280" height="215" rx="8" fill="#161b22"/>
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
<rect x="315" y="82" width="270" height="215" rx="8" fill="#161b22"/>
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
<rect x="595" y="82" width="280" height="215" rx="8" fill="#161b22"/>
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

<rect x="330" y="438" width="240" height="26" rx="13" fill="rgba(233,84,32,0.15)"/>
<text x="450" y="456" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">速查表 / 配置模板 / 快速参考</text>
</svg>`;
save('25-appendix-cheatsheet.svg', svg);
}
console.log('25 done');
