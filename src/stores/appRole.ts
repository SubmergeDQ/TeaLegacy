// ============================================================
// 应用级身份：用户端 / 商家端
//
// 第一次打开应用时在 /welcome 选择；之后可在设置里切换。
// 选择结果写 localStorage，重启后直接进上次的身份；
// 两端的演示数据互不影响（各自 localStorage 键）。
// ============================================================

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const ROLE_KEY = 'tea-legacy.app.role.v1'

export type AppRole = 'user' | 'merchant'

export function readStoredRole(): AppRole | null {
  try {
    const raw = localStorage.getItem(ROLE_KEY)
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
      localStorage.setItem(ROLE_KEY, role)
    } catch {
      // 存储不可用时仅本次会话有效
    }
  }

  function clear(): void {
    current.value = null
    try {
      localStorage.removeItem(ROLE_KEY)
    } catch {
      // 忽略
    }
  }

  return { current, isMerchant, choose, clear }
})
