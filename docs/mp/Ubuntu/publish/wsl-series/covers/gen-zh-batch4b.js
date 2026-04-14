const { svgHeader, bgGradient, badge, save } = require('./svg-base');

// ============================================================
// 23 - 替代方案横评 (fixed: no nested template literals)
// ============================================================
{
  const tableRowsData = [
    ['WSL 2', '#3fb950', '#3fb950', '#f0c000', 'VM级', '日常开发', '★★★★★', true],
    ['Hyper-V / VMware', '#58a6ff', '#f0c000', '#3fb950', '强隔离', '企业测试', '★★★★☆', false],
    ['VirtualBox', '#a371f7', '#3fb950', '#3fb950', '强隔离', '学习实验', '★★★☆☆', false],
    ['双系统 Dual Boot', '#3fb950', '#f85149', '#3fb950', 'OS级', '游戏/Linux', '★★★☆☆', false],
    ['GitHub Codespaces', '#a371f7', '#3fb950', '#f0c000', '容器级', '快速体验', '★★★★☆', false],
    ['Colima (macOS)', '#f85149', '#f0c000', '#f0c000', 'VM级', 'Mac 用户', '★★★☆☆', false],
    ['Gitpod 云IDE', '#a371f7', '#3fb950', '#f0c000', '容器级', 'PR 开发', '★★★★☆', false],
    ['Docker Desktop', '#3fb950', '#f0c000', '#3fb950', '容器级', '微服务', '★★★★☆', false]
  ];

  let tableHtml = '';
  tableRowsData.forEach((r, i) => {
    const bg = i % 2 === 0 ? '#161b22' : '#0d1117';
    const hl = r[7];
    const border = hl ? ' stroke="#E95420" stroke-width="1.5"' : '';
    const fw = hl ? ' font-weight="bold"' : '';
    const perfText = r[1] === '#3fb950' ? '近原生' : r[1] === '#f0c000' ? '中等' : '原生';
    const easeText = r[2] === '#3fb950' ? '简单' : r[2] === '#f0c000' ? '中等' : '困难';
    const nameColor = hl ? '#E95420' : '#c9d1d9';
    const starColor = hl ? '#E95420' : '#f0c000';
    const yBase = 130 + i * 38;
    const yTxt = 154 + i * 38;

    tableHtml += '<rect x="30" y="' + yBase + '" width="840" height="38" rx="0" fill="' + bg + '"' + border + '/>\n';
    tableHtml += '<text x="140" y="' + yTxt + '" font-family="Arial,sans-serif" font-size="12" fill="' + nameColor + '" text-anchor="middle"' + fw + '>' + r[0] + '</text>\n';
    tableHtml += '<text x="330" y="' + yTxt + '" font-family="Microsoft YaHei,Arial" font-size="11" fill="' + r[1] + '" text-anchor="middle">' + perfText + '</text>\n';
    tableHtml += '<text x="440" y="' + yTxt + '" font-family="Microsoft YaHei,Arial" font-size="11" fill="' + r[2] + '" text-anchor="middle">' + easeText + '</text>\n';
    tableHtml += '<text x="550" y="' + yTxt + '" font-family="Microsoft YaHei,Arial" font-size="11" fill="' + r[3] + '" text-anchor="middle">' + r[4] + '</text>\n';
    tableHtml += '<text x="670" y="' + yTxt + '" font-family="Microsoft YaHei,Arial" font-size="11" fill="#8b949e" text-anchor="middle">' + r[5] + '</text>\n';
    tableHtml += '<text x="800" y="' + yTxt + '" font-family="Arial" font-size="12" fill="' + starColor + '" text-anchor="middle">' + r[6] + '</text>\n';
  });

  const lastBg = tableRowsData.length % 2 === 0 ? '#0d1117' : '#161b22';

  let svg = svgHeader() + '\n';
  svg += bgGradient('bg23', '#111118', '#1c1c28') + '\n';
  svg += badge('23') + '\n';

  // Title
  svg += '<text x="450" y="48" font-family="Microsoft YaHei,Arial,sans-serif" font-size="26" fill="#fff" text-anchor="middle" font-weight="bold">除了 WSL 还有什么？8 种 Windows 上跑 Linux 方案横评</text>\n';
  svg += '<text x="450" y="72" font-family="Microsoft YaHei,Arial,sans-serif" font-size="13" fill="#8b949e" text-anchor="middle">虚拟机 / 双系统 / 云开发 / 容器 全面对比，帮你选最合适的</text>\n';

  // Table header
  svg += '<rect x="30" y="92" width="840" height="34" rx="6" fill="#21262d"/>\n';
  svg += '<text x="140" y="114" font-family="Microsoft YaHei,Arial" font-size="12" fill="#c9d1d9" text-anchor="middle" font-weight="bold">方案名称</text>\n';
  svg += '<text x="330" y="114" font-family="Microsoft YaHei,Arial" font-size="12" fill="#c9d1d9" text-anchor="middle" font-weight="bold">性能</text>\n';
  svg += '<text x="440" y="114" font-family="Microsoft YaHei,Arial" font-size="12" fill="#c9d1d9" text-anchor="middle" font-weight="bold">易用性</text>\n';
  svg += '<text x="550" y="114" font-family="Microsoft YaHei,Arial" font-size="12" fill="#c9d1d9" text-anchor="middle" font-weight="bold">隔离性</text>\n';
  svg += '<text x="670" y="114" font-family="Microsoft YaHei,Arial" font-size="12" fill="#c9d1d9" text-anchor="middle" font-weight="bold">适合场景</text>\n';
  svg += '<text x="800" y="114" font-family="Microsoft YaHei,Arial" font-size="12" fill="#c9d1d9" text-anchor="middle" font-weight="bold">推荐度</text>\n';

  // Table rows
  svg += tableHtml;

  // Last row bottom corners
  svg += '<rect x="30" y="434" width="840" height="38" rx="0 0 6 6" fill="' + lastBg + '"/>\n';

  // Recommendation
  svg += '<rect x="200" y="450" width="500" height="38" rx="19" fill="rgba(233,84,32,0.1)" stroke="#E95420" stroke-width="1"/>\n';
  svg += '<text x="450" y="474" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">结论：WSL 2 是性能、集成度和易用性的最佳平衡点 ★</text>\n';

  // Tag
  svg += '<rect x="340" y="490" width="220" height="26" rx="13" fill="rgba(233,84,32,0.15)"/>\n';
  svg += '<text x="450" y="508" font-family="Microsoft YaHei,Arial" font-size="12" fill="#E95420" text-anchor="middle" font-weight="bold">方案对比 / 选型指南 / 横评分析</text>\n';

  svg += '</svg>';
  save('23-alternatives-comparison.svg', svg);
}

console.log('Batch 4b done: 23');
