// ============================================================
// 商家端数据层出口
//
// 页面只从这里取数据：
//   - 商家端读 getAdminProducts / getAdminProduct
//   - C 端读 getVisibleProducts / getAdminProduct（下架即隐藏）
// 读取函数内部用 store，需在 setup / computed 中调用（Pinia 要求）。
// ============================================================

import {
  ADMIN_STORAGE_KEYS,
  useAdminCatalogStore,
  useAdminOrdersStore,
  useAdminShopStore,
} from './stores'

export { ADMIN_STORAGE_KEYS, DEFAULT_SHOP } from './stores'
export type { CartOrderLine, ProductPatch } from './stores'
export { useAdminCatalogStore, useAdminOrdersStore, useAdminShopStore } from './stores'
export { computeKpi, computeTop, computeTrend, countByStatus } from './metrics'
export {
  ORDER_STATUS_TEXT,
  type AdminProduct,
  type KpiSummary,
  type Order,
  type OrderItem,
  type OrderStatus,
  type ShopProfile,
  type StockLog,
  type TopProduct,
  type TrendPoint,
} from './types'
export { LOW_STOCK_THRESHOLD } from './types'
export { formatAxisLabel, formatDateTime, formatDayLabel, formatShortTime } from './time'

/** 商家端商品列表（含库存与上下架状态） */
export function getAdminProducts() {
  return useAdminCatalogStore().items
}

export { getAdminProduct, getVisibleProducts } from './read'

function clearStorage(): void {
  for (const key of Object.values(ADMIN_STORAGE_KEYS)) {
    try {
      localStorage.removeItem(key)
    } catch {
      // 存储不可用时忽略
    }
  }
}

/** 一键恢复演示数据：订单回到 48 单、商品回到默认价与初始库存 */
export function resetAdminData(): void {
  clearStorage()
  useAdminCatalogStore().reset()
  useAdminOrdersStore().reset()
  useAdminShopStore().reset()
}

/** 导出演示数据（JSON 下载用） */
export function exportAdminSnapshot(): Record<string, unknown> {
  return {
    exportedAt: new Date().toISOString(),
    shop: useAdminShopStore().profile,
    overrides: useAdminCatalogStore().overrides,
    stockLogs: useAdminCatalogStore().stockLogs,
    orders: useAdminOrdersStore().orders,
  }
}
