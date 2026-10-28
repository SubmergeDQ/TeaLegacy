import { createApp } from 'vue'
import { createPinia } from 'pinia'

// 衬线中文字体本地托管（fontsource 分片，unicode-range 按需下载），
// 打包进 App 后可离线使用
import '@fontsource-variable/noto-serif-sc'

import App from './App.vue'
import router from './router'
import OilUI from './components/oil-ui'
import './styles/base.scss'

createApp(App).use(createPinia()).use(router).use(OilUI).mount('#app')
