import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: '洪三金的博客',
  description: '洪三金的博客',
  base: '/blog/',
  srcDir: './src',
  cleanUrls: true,
  head: [['link', { rel: 'icon', href: '/blog/vitepress-logo-mini.svg' }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/avatar.png',
    nav: [
      { text: '首页', link: '/' },
      { text: '博客', link: '/vue/post' },
      { text: '大文件上传', link: 'https://github.com/redsanjin-1/bigfile' },
      { text: 'minivue', link: 'https://github.com/redsanjin-1/minivue' },
    ],
    sidebar: [
      {
        text: 'Vue',
        collapsed: false,
        items: [
          { text: '优质文章', link: '/vue/post' },
          { text: 'Vue2响应式原理', link: '/vue/Vue2响应式原理' },
          { text: 'Vue3响应式原理', link: '/vue/Vue3响应式原理' },
          { text: 'Vue3编译优化', link: '/vue/Vue3编译优化' },
          {
            text: '手写Vue3数据响应式原理',
            link: '/vue/手写Vue3数据响应式原理',
          },
          { text: 'Vue的diff算法', link: '/vue/Vue的diff算法' },
        ],
      },
      {
        text: 'React',
        collapsed: false,
        items: [
          { text: '优质文章', link: '/react/post' },
          {
            text: 'M1安装react-native环境问题',
            link: '/react/M1安装react-native环境问题',
          },
        ],
      },
      {
        text: 'javascript',
        collapsed: false,
        items: [{ text: 'js手写题', link: '/javascript/js手写题' }],
      },
      {
        text: '前端工程化',
        collapsed: false,
        items: [
          { text: '深入浅出webpack', link: '/前端工程化/深入浅出webpack' },
          { text: 'Docker简易入门', link: '/前端工程化/Docker简易入门' },
          { text: 'Nginx简易入门', link: '/前端工程化/Nginx简易入门' },
          {
            text: 'vite,+webpack优缺点对比',
            link: '/前端工程化/vite,+webpack优缺点对比',
          },
        ],
      },
      {
        text: 'node',
        collapsed: false,
        items: [
          { text: 'mac中使用nvm问题', link: '/node/mac中使用nvm问题' },
          {
            text: 'nvm,+nrm,+volta与corepack',
            link: '/node/nvm,+nrm,+volta与corepack',
          },
        ],
      },
      {
        text: '计算机基础',
        collapsed: false,
        items: [
          { text: '计算机网络', link: '/计算机基础/计算机网络' },
          { text: '一文读懂HTTP缓存', link: '/计算机基础/一文读懂HTTP缓存' },
          { text: 'HTTP协议发展历史', link: '/计算机基础/HTTP协议发展历史' },
        ],
      },
      {
        text: '阅读',
        collapsed: false,
        items: [
          {
            text: '认知觉醒:开启自我改变的原动力',
            link: '/阅读/认知觉醒:开启自我改变的原动力',
          },
          {
            text: '蛤蟆先生去看心理医生',
            link: '/阅读/蛤蟆先生去看心理医生',
          },
        ],
      },
      {
        text: '其他',
        collapsed: false,
        items: [
          { text: 'macos终端配置', link: '/其他/macos终端配置' },
          { text: 'ClashX+Pro科学上网', link: '/其他/ClashX+Pro科学上网' },
          {
            text: 'SwitchHosts管理本地hosts',
            link: '/其他/SwitchHosts管理本地hosts',
          },
        ],
      },
    ],
    socialLinks: [{ icon: 'github', link: 'https://github.com/redsanjin-1' }],
    outline: {
      level: [1, 6],
      label: '目录',
    },
    search: {
      provider: 'local',
    },
    footer: {
      message: '基于 MIT 许可发布',
      copyright: '版权所有 © 2019-${new Date().getFullYear()} 洪三金',
    },
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'medium',
      },
    },
    externalLinkIcon: true,
    editLink: {
      pattern: 'https://github.com/redsanjin-1/blog/blob/main/src/:path',
      text: '在 GitHub 上编辑此页',
    },
  },
})
