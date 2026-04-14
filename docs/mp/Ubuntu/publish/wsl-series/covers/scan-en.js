const fs = require('fs');
const path = require('path');

const dir = 'd:/projects/italks.github.io/docs/mp/Ubuntu/publish/wsl-series/covers/';
const files = [
  '06-wsl-gui-apps-guide.svg',
  '10-git-workflow-wsl.svg',
  '11-docker-desktop-wsl.svg',
  '12-database-stack-wsl.svg',
  '13-wsl-performance-truth.svg',
  '14-wslconfig-tuning.svg',
  '15-multi-distro-management.svg',
  '16-wsl-systemd-services.svg',
  '17-terminal-beautification.svg',
  '18-usb-device-wsl.svg',
  '19-gpu-ai-ml-wsl.svg',
  '20-backup-migration-wsl.svg',
  '21-wsl-troubleshooting-handbook.svg',
  '22-devcontainer-guide.svg',
  '23-alternatives-comparison.svg',
  '24-wsl-project-showcase.svg',
  '25-appendix-cheatsheet.svg'
];

for (const f of files) {
  const fp = path.join(dir, f);
  const content = fs.readFileSync(fp, 'utf8');
  
  // Extract text content from SVG text elements
  const textMatches = content.match(/>([^<]{2,})</g) || [];
  const englishTexts = [];
  
  for (const m of textMatches) {
    const txt = m.slice(1, -1).trim();
    // Skip code-like: paths, commands, config, numbers only
    if (/^[\w\/\-\.\:\;\|\$\#\{\}\[\]\(\)\*\+\=\\`\"\'0-9\s\~\!\@]+$/.test(txt)) continue;
    if (txt.startsWith('/') || txt.startsWith('wsl ') || txt.startsWith('$') || txt.includes('\\')) continue;
    if (txt.match(/^[A-Z]{2,}$/) && txt.length < 6) continue; // abbreviations like CPU, GPU, API
    // Skip if already has Chinese
    if (/[\u4e00-\u9fa5]/.test(txt)) continue;
    // Skip very short
    if (txt.length < 3) continue;
    
    englishTexts.push(txt);
  }
  
  if (englishTexts.length > 0) {
    console.log('\n=== ' + f + ' ===');
    englishTexts.forEach(t => console.log('  -> |' + t + '|'));
  } else {
    console.log(f + ': OK (no English text found)');
  }
}
