import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // 每个 SFC 的 <style lang="scss"> 自动拿到 Oil UI 主题变量
        additionalData: `@use "@/styles/variables" as *;\n`,
      },
    },
  },
  server: {
    host: true,
    port: 5173,
  },
})
