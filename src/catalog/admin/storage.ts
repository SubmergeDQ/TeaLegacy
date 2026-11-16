// ============================================================
// 商家端持久化：键名、防御式读写、字段守卫
// 与 UI 无关，单独一层便于测试与复用。
// ============================================================

import type { Order, OrderStatus, ProductOverride, ShopProfile, StockLog } from './types'

export const ADMIN_STORAGE_KEYS = {
  overrides: 'tea-legacy.admin.overrides.v1',
  orders: 'tea-legacy.admin.orders.v1',
  stockLog: 'tea-legacy.admin.stocklog.v1',
  shop: 'tea-legacy.admin.shop.v1',
} as const

export function readStore<T>(
  key: string,
  fallback: () => T,
  guard: (value: unknown) => value is T,
): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback()
    const parsed: unknown = JSON.parse(raw)
    return guard(parsed) ? parsed : fallback()
  } catch {
    return fallback()
  }
}

export function writeStore(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // 隐私模式等场景只在内存里保留
  }
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

const STATUS_SET = new Set<OrderStatus>(['pending', 'paid', 'shipped', 'done', 'canceled'])

export function isOverrides(value: unknown): value is Record<number, ProductOverride> {
  if (!isObject(value)) return false
  return Object.values(value).every(
    (item) =>
      isObject(item) &&
      typeof item.stock === 'number' &&
      typeof item.online === 'boolean' &&
      typeof item.featured === 'boolean',
  )
}

function isOrder(value: unknown): value is Order {
  return (
    isObject(value) &&
    typeof value.no === 'string' &&
    typeof value.at === 'number' &&
    typeof value.status === 'string' &&
    STATUS_SET.has(value.status as OrderStatus) &&
    Array.isArray(value.items) &&
    isObject(value.buyer) &&
    Array.isArray(value.timeline)
  )
}

export function isOrders(value: unknown): value is Order[] {
  return Array.isArray(value) && value.every(isOrder)
}

export function isStockLogs(value: unknown): value is StockLog[] {
  return (
    Array.isArray(value) &&
    value.every(
      (log) =>
        isObject(log) &&
        typeof log.id === 'string' &&
        typeof log.productId === 'number' &&
        typeof log.delta === 'number',
    )
  )
}

export function isShopProfile(value: unknown): value is ShopProfile {
  return (
    isObject(value) &&
    typeof value.name === 'string' &&
    typeof value.intro === 'string' &&
    typeof value.open === 'boolean' &&
    typeof value.notifyNewOrder === 'boolean' &&
    typeof value.notifyLowStock === 'boolean'
  )
}

export const MAX_STOCK_LOG = 100
export const MAX_STOCK = 9999
