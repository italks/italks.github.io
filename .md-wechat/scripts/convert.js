#!/usr/bin/env node
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname, basename, extname } from 'path';
import { fileURLToPath } from 'url';
import { marked } from 'marked';
import hljs from 'highlight.js';
import juice from 'juice';

const __dirname = dirname(fileURLToPath(import.meta.url));

// CSS样式模板
const BASE_CSS = `
body {
  font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  padding: 20px;
  max-width: 100%;
  box-sizing: border-box;
}

h1, h2, h3, h4, h5, h6 {
  margin-top: 25px;
  margin-bottom: 15px;
  font-weight: bold;
  line-height: 1.4;
}

h1 { font-size: 24px; text-align: center; }
h2 { font-size: 20px; border-bottom: 2px solid #2B579A; padding-bottom: 10px; }
h3 { font-size: 18px; }
h4 { font-size: 16px; }

p {
  margin: 15px 0;
  word-wrap: break-word;
}

a {
  color: #2B579A;
  text-decoration: none;
}

strong, b {
  font-weight: bold;
  color: #333;
}

em, i {
  font-style: italic;
}

blockquote {
  margin: 15px 0;
  padding: 10px 15px;
  background-color: #f5f5f5;
  border-left: 4px solid #2B579A;
  color: #666;
}

ul, ol {
  margin: 15px 0;
  padding-left: 25px;
}

li {
  margin: 5px 0;
}

table {
  margin: 15px 0;
  border-collapse: collapse;
  width: 100%;
}

th, td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

th {
  background-color: #f5f5f5;
  font-weight: bold;
}

tr:nth-child(even) {
  background-color: #fafafa;
}

code {
  padding: 2px 6px;
  background-color: #f5f5f5;
  border-radius: 3px;
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: 14px;
  color: #d14;
}

pre {
  margin: 15px 0;
  padding: 15px;
  background-color: #282c34;
  border-radius: 6px;
  overflow-x: auto;
  position: relative;
}

pre code {
  padding: 0;
  background: none;
  color: #abb2bf;
  font-size: 14px;
  line-height: 1.6;
  display: block;
}

/* Mac风格代码块装饰 */
pre::before {
  content: "";
  position: absolute;
  top: 12px;
  left: 12px;
  width: 12px;
  height: 12px;
  background-color: #ff5f56;
  border-radius: 50%;
  box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f;
}

pre code::before {
  content: "";
  display: block;
  height: 20px;
}

hr {
  margin: 20px 0;
  border: none;
  border-top: 1px solid #eee;
}

img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 10px 0;
  display: block;
}

/* 删除线 */
del {
  text-decoration: line-through;
  color: #999;
}

/* 高亮 */
mark {
  background-color: #fff3cd;
  padding: 2px 4px;
  border-radius: 2px;
}
`;

// 代码高亮配置
marked.setOptions({
  highlight: function(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (err) {}
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true
});

// 处理表格
const renderer = new marked.Renderer();
renderer.table = function(header, body) {
  return `<table><thead>${header}</thead><tbody>${body}</tbody></table>`;
};

// 主转换函数
async function convertMarkdown(inputFile, options = {}) {
  const inputPath = resolve(inputFile);
  const configPath = options.config || resolve(__dirname, '../md-config.json');
  
  // 读取Markdown文件
  if (!existsSync(inputPath)) {
    console.error(`错误: 文件 ${inputPath} 不存在`);
    process.exit(1);
  }
  
  const markdown = readFileSync(inputPath, 'utf-8');
  
  // 移除YAML front matter
  const content = markdown.replace(/^---[\s\S]*?---\n?/, '');
  
  // 转换Markdown为HTML
  const html = await marked.parse(content, { renderer });
  
  // 包装完整HTML
  const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>微信文章</title>
  <style>${BASE_CSS}</style>
</head>
<body>
${html}
</body>
</html>`;
  
  // 内联CSS
  const inlinedHtml = juice(fullHtml, {
    preserveMediaQueries: true,
    inlinePseudoElements: true
  });
  
  // 输出文件
  const outputDir = dirname(inputPath);
  const baseName = basename(inputPath, extname(inputPath));
  const outputPath = options.output || resolve(outputDir, `${baseName}-wechat.html`);
  
  writeFileSync(outputPath, inlinedHtml, 'utf-8');
  
  console.log(`✅ 转换完成！`);
  console.log(`📄 输出文件: ${outputPath}`);
  console.log(`\n📋 使用方法:`);
  console.log(`1. 用浏览器打开生成的HTML文件`);
  console.log(`2. 全选复制 (Ctrl+A, Ctrl+C)`);
  console.log(`3. 粘贴到微信公众号编辑器`);
}

// 命令行参数解析
const args = process.argv.slice(2);
const inputFile = args[0];

if (!inputFile) {
  console.log(`
使用方法: node convert.js <markdown文件> [选项]

选项:
  -o, --output <path>   输出HTML文件路径
  -c, --config <path>   配置文件路径
  -h, --help            显示帮助信息

示例:
  node convert.js article.md
  node convert.js article.md -o output.html
  `);
  process.exit(0);
}

const options = {};
for (let i = 1; i < args.length; i++) {
  if (args[i] === '-o' || args[i] === '--output') {
    options.output = args[++i];
  } else if (args[i] === '-c' || args[i] === '--config') {
    options.config = args[++i];
  }
}

// 执行转换
convertMarkdown(inputFile, options).catch(err => {
  console.error('转换失败:', err);
  process.exit(1);
});
