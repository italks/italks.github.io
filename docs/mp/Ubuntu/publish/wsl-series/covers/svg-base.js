const fs = require('fs');
const path = require('path');

const dir = 'd:/projects/italks.github.io/docs/mp/Ubuntu/publish/wsl-series/covers/';

// Common SVG header
function svgHeader() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 500" width="900" height="500">`;
}

// Common background
function bgGradient(id, c1, c2) {
  return `<defs><linearGradient id="${id}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${c1}"/><stop offset="100%" stop-color="${c2}"/></linearGradient></defs><rect width="900" height="500" fill="url(#${id})" rx="12"/>`;
}

// Badge (top-right corner)
function badge(num) {
  return `<rect x="820" y="16" width="64" height="26" rx="13" fill="#E95420"/><text x="852" y="34" font-family="Arial,sans-serif" font-size="14" fill="#fff" text-anchor="middle" font-weight="bold">#${num}</text>`;
}

// Title and subtitle
function titleSub(title, sub, y = 60) {
  return `
  <text x="450" y="${y}" font-family="Microsoft YaHei,Arial,sans-serif" font-size="32" fill="#FFFFFF" text-anchor="middle" font-weight="bold">${title}</text>
  <text x="450" y="${y+28}" font-family="Microsoft YaHei,Arial,sans-serif" font-size="15" fill="#a0aec0" text-anchor="middle">${sub}</text>`;
}

// Code block style
function codeBlock(x, y, w, h, lines) {
  let content = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#282c34"/>`;
  content += `<text x="${x+12}" y="${y+22}" font-family="Consolas,monospace" font-size="11" fill="#61afef">$ ${lines[0]}</text>`;
  for (let i = 1; i < lines.length; i++) {
    content += `\n<text x="${x+12}" y="${y+22+i*18}" font-family="Consolas,monospace" font-size="11" fill="#98c379">$ ${lines[i]}</text>`;
  }
  return content;
}

// Feature card
function card(x, y, num, titleText, desc) {
  const colors = ['#e74c3c','#3498db','#2ecc71','#f39c12'];
  const c = colors[(num-1)%4];
  return `
  <rect x="${x}" y="${y}" width="155" height="72" rx="6" fill="#1e2433"/>
  <circle cx="${x+18}" cy="${y+20}" r="10" fill="${c}"/>
  <text x="${x+18}" y="${y+24}" font-family="Arial" font-size="11" fill="#fff" text-anchor="middle" font-weight="bold">${num}</text>
  <text x="${x+36}" y="${y+23}" font-family="Microsoft YaHei,Arial" font-size="12" fill="#e2e8f0" font-weight="bold">${titleText}</text>
  <text x="${x+10}" y="${y+45}" font-family="Microsoft YaHei,Arial" font-size="10" fill="#8899aa">${desc}</text>`;
}

function save(name, content) {
  fs.writeFileSync(path.join(dir, name), content);
  console.log('Generated: ' + name);
}

module.exports = { svgHeader, bgGradient, badge, titleSub, codeBlock, card, save, dir };
