const fs = require('fs');
const path = require('path');

// Check specific files for title/subtitle areas
const dir = 'd:/projects/italks.github.io/docs/mp/Ubuntu/publish/wsl-series/covers/';
const files = ['06-wsl-gui-apps-guide.svg','10-git-workflow-wsl.svg','11-docker-desktop-wsl.svg','12-database-stack-wsl.svg','13-wsl-performance-truth.svg','14-wslconfig-tuning.svg','15-multi-distro-management.svg','16-wsl-systemd-services.svg','17-terminal-beautification.svg','18-usb-device-wsl.svg','19-gpu-ai-ml-wsl.svg','20-backup-migration-wsl.svg','21-wsl-troubleshooting-handbook.svg','22-devcontainer-guide.svg','23-alternatives-comparison.svg','24-wsl-project-showcase.svg','25-appendix-cheatsheet.svg'];

for (const f of files) {
  const fp = path.join(dir, f);
  const content = fs.readFileSync(fp, 'utf8');
  // Find ALL text content (not just long ones)
  const allTexts = content.match(/>([^<]+)</g) || [];
  
  console.log('\n======== ' + f + ' (' + allTexts.length + ' texts) ========');
  let count = 0;
  for (const m of allTexts) {
    const txt = m.slice(1, -1).trim();
    if (!txt || txt.length < 1) continue;
    // Show first 20 texts
    if (count < 30) {
      console.log('  [' + count + '] |' + txt.substring(0, 80) + (txt.length > 80 ? '...' : '') + '|');
    }
    count++;
  }
  if (count > 30) console.log('  ... and ' + (count - 30) + ' more');
}
