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
            '/Android/':sidebarAndroid(),
            '/Vue/':sidebarVue(),
            '/ML/':sidebarML(),
            // '/Ubuntu/':sidebarUbuntu(),
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

function sidebarAndroid() {
    return [
        {
            text:'Flutter',
            collapsed: false,
            items:[
                {text:'Android原生项目引入Flutter',link:'/Android/Flutter/Android原生项目引入Flutter'}
            ]
        },{
            text:'Kotlin',
            collapsed:false,
            items:[]
        },{
            text:'Jetpack',
            collapsed:false,
            items:[]
        },{
            text:'Android开发板',
            collapsed:false,
            items:[]
        }
    ]
}

function sidebarVue() {
    return [
        {
            text:'Vue2',
            collapsed:false,
            items:[]
        },{
            text:'Vue3',
            collapsed:false,
            items:[]
        }
    ]
}

function sidebarML(){
    return[
        {
            text:'Google ML Kit',
            collapsed:false,
            items:[]
        },
        {
            text:'MediaPipe',
            collapsed:false,
            items:[]
        },
        {
            text:'NCNN/TNN',
            collapsed:false,
            items:[]
        }
    ]
}
// function sidebarUbuntu(){
//     return [
//         {

//         }
//     ]
// }