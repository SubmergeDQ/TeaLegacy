// ============================================================
// 商家端登录态（演示用模拟鉴权）
//
// 不接后端：账号密码写死，校验通过后把时间戳写进 sessionStorage，
// 关闭 App / 标签页即失效，符合"演示演示、不留真实凭据"的预期。
// ============================================================

import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

const SESSION_KEY = 'tea-legacy.admin.session.v1'

/** 演示账号（登录页会直接展示，方便演示时输入） */
export const DEMO_ACCOUNT = 'tea-admin'
export const DEMO_PASSWORD = '123456'

export function isAdminSessionActive(): boolean {
  return loadSession() !== null
}

function loadSession(): number | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { at?: unknown }
    return typeof parsed.at === 'number' ? parsed.at : null
  } catch {
    return null
  }
}

export const useAdminAuthStore = defineStore('adminAuth', () => {
  const since = ref<number | null>(loadSession())

  const logged = computed(() => since.value !== null)

  function login(account: string, password: string): boolean {
    if (account.trim() !== DEMO_ACCOUNT || password !== DEMO_PASSWORD) return false
    const at = Date.now()
    since.value = at
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ at }))
    } catch {
      // 隐私模式等场景只在内存里保留登录态
    }
    return true
  }

  function logout(): void {
    since.value = null
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch {
      // 忽略存储不可用
    }
  }

  return { since, logged, login, logout }
})
