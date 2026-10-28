export default {
  plugins: {
    // 移动端适配（rem 方案）：以 375px 设计稿为基准，把 px 换算为 rem；
    // html 根字号 = 100vw/375*16 并封顶 20.48px（对应 480px 外壳），
    // 见 index.html。不同手机上整体等比缩放，桌面浏览器打开时锁定
    // 480px 居中预览；safe-area-inset-bottom 由 env() 原样保留。
    'postcss-pxtorem': {
      rootValue: 16,
      unitPrecision: 5,
      propList: ['*'],
      // 1px 细线不转换：高倍屏上保持物理 1px，符合方向的"真 1px 细线"语法
      minPixelValue: 2,
      mediaQuery: false,
      replace: true,
      exclude: /(node_modules)/,
    },
  },
}
