// Oil UI 轻提示（函数式调用）
// 反馈出现在离开视线的结果上（如"已加入购物车"），
// 带撤销动作的提示停留更久。

import { reactive } from 'vue'

export interface ToastAction {
  text: string
  handler: () => void
}

export interface ToastOptions {
  text: string
  action?: ToastAction
  /** 毫秒；默认普通 3600，带动作 6000 */
  duration?: number
}

export const toastState = reactive<{
  visible: boolean
  text: string
  action: ToastAction | null
}>({ visible: false, text: '', action: null })

let timer: number | undefined

export function showToast(options: string | ToastOptions): void {
  const opts = typeof options === 'string' ? { text: options } : options
  toastState.text = opts.text
  toastState.action = opts.action ?? null
  toastState.visible = true
  window.clearTimeout(timer)
  timer = window.setTimeout(hideToast, opts.duration ?? (opts.action ? 5000 : 2600))
}

export function hideToast(): void {
  toastState.visible = false
  window.clearTimeout(timer)
}
