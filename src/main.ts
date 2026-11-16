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
import { ADMIN_STORAGE_KEYS } from './catalog/admin/storage'
import './styles/base.scss'

// 每次冷启动都重置演示数据：只删覆盖层键，store 首次创建时自动回落到默认值，
// 不会把 Mock/订单模块带进主包。
for (const key of Object.values(ADMIN_STORAGE_KEYS)) {
  try {
    localStorage.removeItem(key)
  } catch {
    // 隐私模式等存储不可用时忽略
  }
}

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
