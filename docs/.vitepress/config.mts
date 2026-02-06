import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "运营平台",
  description: "自媒体运营平台",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: '微信公众号',
        items: [
          { text:"账号矩阵",link:"/mp/index"},
          { text: 'UbuntuNews', link: '/mp/Ubuntu/index' },
          {
            text: '移动APP开发',
            items: [
              { text: '定位分析', link: '/mp/APP/index' },
              { text: '文章：商城小程序开发成本', link: '/mp/APP/2026-01-19-mall-miniprogram-cost' },
              { text: '文章：小程序+企微私域', link: '/mp/APP/2026-01-20-miniprogram-private-traffic' }
            ]
          },
          { text: '以我眼光看世界', link: '/mp/Me/index' }
        ]
      },{
        text: '小红书',link: '/xiaohongshu',
      }
    ],

    sidebar: [
      {
        text: '微信公众号',
        items: [
          { text: '账号矩阵', link: '/mp/index' },
          {
            text: 'UbuntuNews',
            collapsed: false,
            items: [
              { text: '定位分析', link: '/mp/Ubuntu/index' },
              {
                text: '2026年2月',
                collapsed: true,
                items: [
                  { text: '04日: Ubuntu WSL镜像部署指南', link: '/mp/Ubuntu/publish/2026/02/2026-02-04-ubuntu-wsl-image-deployment-guide' },
                  { text: '04日: Ubuntu 26.04 vs 24.04 对比', link: '/mp/Ubuntu/publish/2026/02/2026-02-04-ubuntu-26-04-vs-24-04' },
                  { text: '03日: Ubuntu Wiki重构公告', link: '/mp/Ubuntu/publish/2026/02/2026-02-03-ubuntu-wiki-rebuild' },
                  { text: '02日: Snap vs Flatpak vs AppImage', link: '/mp/Ubuntu/publish/2026/02/2026-02-02-snap-flatpak-appimage' }
                ]
              },
              {
                text: '2026年1月',
                collapsed: true,
                items: [
                  { text: '28日: Ubuntu L2TP 搭建', link: '/mp/Ubuntu/publish/2026/01/2026-01-28-ubuntu-l2tp-server-tutorial' },
                  { text: '28日: Windows 迁移指南', link: '/mp/Ubuntu/publish/2026/01/2026-01-28-windows-to-domestic-linux-migration' },
                  { text: '27日: GNOME 50 新特性', link: '/mp/Ubuntu/publish/2026/01/2026-01-27-gnome-50-features' },
                  { text: '27日: 发行版大比拼', link: '/mp/Ubuntu/publish/2026/01/2026-01-27-distro-wars-2026' },
                  { text: '27日: Linux 安装指南', link: '/mp/Ubuntu/publish/2026/01/2026-01-27-linux-install-guide-2026' },
                  { text: '26日: Ubuntu 26.04 深度前瞻', link: '/mp/Ubuntu/publish/2026/01/2026-01-26-ubuntu-26-04-deep-dive' },
                  { text: '26日: 本地 RAG 隐私方案', link: '/mp/Ubuntu/publish/2026/01/2026-01-26-local-rag-ubuntu' },
                  { text: '25日: Linux vs AI OS 辩论', link: '/mp/Ubuntu/publish/2026/01/2026-01-25-linux-ai-os-debate' },
                  { text: '24日: AI 辅助编程实战', link: '/mp/Ubuntu/publish/2026/01/2026-01-24-ai-coding-local' },
                  { text: '24日: Qwen3 TTS 部署', link: '/mp/Ubuntu/publish/2026/01/2026-01-24-qwen3-tts-ubuntu-deploy' },
                  { text: '23日: DeepSeek 本地部署', link: '/mp/Ubuntu/publish/2026/01/2026-01-23-deepseek-local-deploy' },
                  { text: '23日: Linux 开源周报', link: '/mp/Ubuntu/publish/2026/01/weekly-digest/2026-01-23-linux-weekly-digest' },
                  { text: '21日: 壁纸大赛开启', link: '/mp/Ubuntu/publish/2026/01/2026-01-21-wallpaper-contest' },
                  { text: '19日: Ubuntu 26.04 预览', link: '/mp/Ubuntu/publish/2026/01/2026-01-19-ubuntu-26-04-preview' }
                ]
              }
            ]
          },
          { text: '移动APP开发', link: '/mp/APP/index' },
          {
            text: '以我眼光看世界',
            collapsed: false,
            items: [
              { text: '定位分析', link: '/mp/Me/index' },
              {
                text: '2026年1月',
                collapsed: true,
                items: [
                  { text: '24日: 读懂《太平年》', link: '/mp/Me/publish/2026/01/2026-01-24-peaceful-year-history' },
                  { text: '24日: 唐宋变革简史', link: '/mp/Me/publish/2026/01/2026-01-24-tang-song-history' }
                ]
              }
            ]
          }
        ]
      },
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
    ]
  }
})
