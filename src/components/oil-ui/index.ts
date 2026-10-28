// ============================================================
// Oil UI —— 本项目内置的 Vue 3 移动端组件库
//
// 说明：npm 上不存在名为 oil-ui 的 Vue 3 组件库（oil-ui、
// @oil-ui/vue 等包名均未注册），故按"内置组件库"的形式实现：
// 以插件方式 app.use(OilUI) 全局注册，主题令牌见
// src/styles/variables.scss（SCSS）与 base.scss（CSS 变量）。
// ============================================================

import type { App } from 'vue'

import OBadge from './OBadge.vue'
import OButton from './OButton.vue'
import ODialog from './ODialog.vue'
import OIcon from './OIcon.vue'
import ONavBar from './ONavBar.vue'
import OStepper from './OStepper.vue'
import OTabbar from './OTabbar.vue'
import OToastHost from './OToastHost.vue'

export { icons } from './icons'
export { showToast, hideToast, toastState } from './toast'
export type { ToastOptions, ToastAction } from './toast'

const components = [
  OBadge,
  OButton,
  ODialog,
  OIcon,
  ONavBar,
  OStepper,
  OTabbar,
  OToastHost,
]

export default {
  install(app: App) {
    for (const c of components) app.component(c.name ?? c.__name ?? '', c)
  },
}
