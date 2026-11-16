// ============================================================
// 商品覆盖层 store
//
// 只读源 src/catalog/shop 不动；改价、改名、库存、上下架全部写在
// 覆盖层，并通过 mergeAll 合并出 C 端与商家端共用的商品列表。
// ============================================================

import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { INITIAL_STOCK } from './initial'
import { mergeAll } from './merge'
import {
  ADMIN_STORAGE_KEYS,
  isOverrides,
  isStockLogs,
  MAX_STOCK,
  MAX_STOCK_LOG,
  readStore,
  writeStore,
} from './storage'
import type { ProductOverride, StockLog } from './types'

export interface ProductPatch {
  name?: string
  sub?: string
  unit?: string
  tag?: string
  specs?: { label: string; value: string }[]
  story?: string[]
  price?: number
  stock?: number
  online?: boolean
}

export const useAdminCatalogStore = defineStore('adminCatalog', () => {
  const overrides = ref<Record<number, ProductOverride>>(
    readStore(ADMIN_STORAGE_KEYS.overrides, () => ({}), isOverrides),
  )
  const stockLogs = ref<StockLog[]>(
    readStore(ADMIN_STORAGE_KEYS.stockLog, () => [], isStockLogs),
  )

  /** C 端与商家端共用的合并结果 */
  const items = computed(() => mergeAll(overrides.value))
  const lowStockCount = computed(() => items.value.filter((p) => p.lowStock && p.online).length)

  function patchOverride(id: number, patch: ProductPatch): void {
    const prev = overrides.value[id]
    const next: ProductOverride = {
      ...prev,
      stock: patch.stock ?? prev?.stock ?? INITIAL_STOCK[id] ?? 0,
      online: patch.online ?? prev?.online ?? true,
      featured: prev?.featured ?? false,
      updatedAt: Date.now(),
    }
    if (patch.price !== undefined) next.price = patch.price
    if (patch.name !== undefined) next.name = patch.name
    if (patch.sub !== undefined) next.sub = patch.sub
    if (patch.unit !== undefined) next.unit = patch.unit
    if (patch.tag !== undefined) next.tag = patch.tag
    if (patch.specs !== undefined) next.specs = patch.specs
    if (patch.story !== undefined) next.story = patch.story
    overrides.value = { ...overrides.value, [id]: next }
  }

  function logStock(
    id: number,
    delta: number,
    reason: StockLog['reason'],
    balance?: number,
  ): void {
    if (delta === 0) return
    const log: StockLog = {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      productId: id,
      delta,
      reason,
      at: Date.now(),
      balance,
    }
    stockLogs.value = [log, ...stockLogs.value].slice(0, MAX_STOCK_LOG)
  }

  /** 保存商品编辑页的一次提交 */
  function updateProduct(
    id: number,
    patch: ProductPatch,
    reason: StockLog['reason'] = 'manual',
  ): void {
    const before = items.value.find((p) => p.id === id)
    patchOverride(id, patch)
    if (before && patch.stock !== undefined && patch.stock !== before.stock) {
      logStock(id, patch.stock - before.stock, reason, patch.stock)
    }
  }

  function setOnline(id: number, online: boolean): void {
    patchOverride(id, { online })
  }

  function setPrice(id: number, price: number): void {
    patchOverride(id, { price })
  }

  /** 入库 / 出库：库存不为负，同时记一条流水 */
  function adjustStock(id: number, delta: number, reason: StockLog['reason'] = 'restock'): number {
    const current = items.value.find((p) => p.id === id)
    const from = current?.stock ?? INITIAL_STOCK[id] ?? 0
    const next = Math.min(MAX_STOCK, Math.max(0, Math.round(from + delta)))
    patchOverride(id, { stock: next })
    logStock(id, next - from, reason, next)
    return next
  }

  /** 恢复这件商品的出厂状态（价格、文案、库存、上下架） */
  function restoreProduct(id: number): void {
    const next = { ...overrides.value }
    delete next[id]
    overrides.value = next
  }

  function reset(): void {
    overrides.value = {}
    stockLogs.value = []
  }

  watch(overrides, (v) => writeStore(ADMIN_STORAGE_KEYS.overrides, v), { deep: true })
  watch(stockLogs, (v) => writeStore(ADMIN_STORAGE_KEYS.stockLog, v), { deep: true })

  return {
    overrides,
    stockLogs,
    items,
    lowStockCount,
    updateProduct,
    setOnline,
    setPrice,
    adjustStock,
    restoreProduct,
    reset,
  }
})
