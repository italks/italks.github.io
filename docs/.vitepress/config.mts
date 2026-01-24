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
              { text: '文章：Ubuntu 26.04 前瞻', link: '/mp/Ubuntu/2026-01-19-ubuntu-26-04-preview' }
            ]
          },
          { text: '移动APP开发', link: '/mp/APP/index' },
          {
            text: '以我眼光看世界',
            collapsed: false,
            items: [
              { text: '定位分析', link: '/mp/Me/index' },
              { text: '文章：读懂《太平年》', link: '/mp/Me/2026-01-24-peaceful-year-history' }
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
