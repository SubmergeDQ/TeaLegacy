// ============================================================
// 应用级身份：用户端 / 商家端
//
// 每次打开应用先进 /welcome 选择；本次会话内可在设置里切换。
// 选择结果写 sessionStorage —— 关闭应用即失效，下次启动重新选择；
// 两端的演示数据不受影响（各自 localStorage 键）。
// ============================================================

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const ROLE_KEY = 'tea-legacy.app.role.session.v1'

export type AppRole = 'user' | 'merchant'

export function readStoredRole(): AppRole | null {
  try {
    const raw = sessionStorage.getItem(ROLE_KEY)
    return raw === 'user' || raw === 'merchant' ? raw : null
  } catch {
    return null
  }
}

export const useAppRoleStore = defineStore('appRole', () => {
  const current = ref<AppRole | null>(readStoredRole())

  const isMerchant = computed(() => current.value === 'merchant')

  function choose(role: AppRole): void {
    current.value = role
    try {
      sessionStorage.setItem(ROLE_KEY, role)
    } catch {
      // 存储不可用时仅在内存中保留
    }
  }

  function clear(): void {
    current.value = null
    try {
      sessionStorage.removeItem(ROLE_KEY)
    } catch {
      // 忽略
    }
  }

  return { current, isMerchant, choose, clear }
})
