import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { App as NativeApp } from '@capacitor/app'
import { Capacitor } from '@capacitor/core'

// 衬线中文字体本地托管（fontsource 分片，unicode-range 按需下载），
// 打包进 App 后可离线使用
import '@fontsource-variable/noto-serif-sc'

import App from './App.vue'
import router from './router'
import OilUI from './components/oil-ui'
import './styles/base.scss'

createApp(App).use(createPinia()).use(router).use(OilUI).mount('#app')

// 原生壳里接管系统返回键：次级页回上一页，一级 Tab 页才退出应用。
// 不看 WebView 的 canGoBack —— hash 路由下它并不可靠。
if (Capacitor.isNativePlatform()) {
  void NativeApp.addListener('backButton', () => {
    const current = router.currentRoute.value
    const depth = (current.meta.depth as number) ?? 1
    if (depth > 1) {
      const fallback = current.meta.section === 'admin' ? '/admin/dashboard' : '/craft'
      if (window.history.length > 1) window.history.back()
      else void router.replace(fallback)
    } else {
      void NativeApp.exitApp()
    }
  })
}
