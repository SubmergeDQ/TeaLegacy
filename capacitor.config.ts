import type { CapacitorConfig } from '@capacitor/cli'

// 原生壳配置：把 Vite 产出的 dist/ 打进 WebView。
// appName 用英文，避免 Gradle 工程名出现中文；桌面上的名字在
// android/app/src/main/res/values/strings.xml 里改成「茶承」。
const config: CapacitorConfig = {
  appId: 'com.tealegacy.app',
  appName: 'TeaLegacy',
  webDir: 'dist',
  android: {
    backgroundColor: '#f6f2ea',
  },
  server: {
    androidScheme: 'https',
  },
  plugins: {
    SystemBars: {
      // 全站宣纸底，系统栏图标固定用深色；否则系统深色模式下会变成浅色图标
      style: 'LIGHT',
      // 页面已声明 viewport-fit=cover，提前告知，避免首帧安全区跳动
      initialViewportFitValueHint: 'cover',
    },
  },
}

export default config
