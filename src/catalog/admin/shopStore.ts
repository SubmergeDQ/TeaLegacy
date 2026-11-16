// ============================================================
// 店铺设置 store：名称 / 简介 / 营业状态 / 通知开关
// ============================================================

import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { ADMIN_STORAGE_KEYS, isShopProfile, readStore, writeStore } from './storage'
import type { ShopProfile } from './types'

export const DEFAULT_SHOP: ShopProfile = {
  name: '茶承茶铺',
  intro: '七道工序，做成七款普洱。山野气足，日常可饮可藏。',
  open: true,
  notifyNewOrder: true,
  notifyLowStock: true,
}

export const useAdminShopStore = defineStore('adminShop', () => {
  const profile = ref<ShopProfile>(
    readStore(ADMIN_STORAGE_KEYS.shop, () => ({ ...DEFAULT_SHOP }), isShopProfile),
  )

  function update(patch: Partial<ShopProfile>): void {
    profile.value = { ...profile.value, ...patch }
  }

  function reset(): void {
    profile.value = { ...DEFAULT_SHOP }
  }

  watch(profile, (v) => writeStore(ADMIN_STORAGE_KEYS.shop, v), { deep: true })

  return { profile, update, reset }
})
