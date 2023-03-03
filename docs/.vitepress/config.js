export default {
    lang: 'zh-CN',
    title: 'The World Through My Eyes',
    description: 'Share Develop/Life',
    base: '/',
    cleanUrls: true,
    lastUpdated: true,

    head: [['meta', { name: 'theme-color', content: '#6495ED' }]],
    markdown: {
        headers: {
            level: [0, 0]
        }
    },

    themeConfig: {
        nav: nav(),
        sidebar: {

        },
        socialLinks: [
            { icon: 'github', link: 'https://github.com/italks/italks.github.io' }
        ],
        // algolia: {
        //     appId: '8J64VVRP8K',
        //     apiKey: 'a18e2f4cc5665f6602c5631fd868adfd',
        //     indexName: 'vitepress'
        // },
        footer: {
            message: 'Released under the Creative Commons license.',
            copyright: 'Copyright © 2023-present italks'
        },
    }
}
function nav() {
    return [
        { text: 'Android', link: '/Android/',activeMatch:'/Android/' },
        { text: 'Vue', link: '/Vue/',activeMatch:'/Vue/' },
        { text: 'ML', link: '/ML/',activeMatch:'/ML/' },
        { text: 'Ubuntu', link: '/Ubuntu/',activeMatch:'/Android/' },
    ]
}

function sidebarGuide() {
    return [

    ]
}

function sidebarConfig() {
    return [

    ]
}