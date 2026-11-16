// ============================================================
// 商家端数据契约
//
// 只读源仍是 src/catalog/shop（C 端权威数据）；本目录只负责
// 「覆盖层 + 订单 + 指标」。任何写操作都不得改动 products 里的对象。
// 契约与口径见 docs/architecture/merchant-app.md 4.5。
// ============================================================

import type { Product } from '@/catalog/shop'

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'done' | 'canceled'

/** 状态文案（列表、详情、时间轴共用同一套说法） */
export const ORDER_STATUS_TEXT: Record<OrderStatus, string> = {
  pending: '待付款',
  paid: '待发货',
  shipped: '已发货',
  done: '已完成',
  canceled: '已取消',
}

export interface OrderItem {
  productId: number
  /** 下单时快照：改价、改名不影响历史单 */
  name: string
  price: number
  qty: number
}

export interface OrderTimelineItem {
  at: number
  label: string
  done: boolean
}

export interface Order {
  /** 20261116003：日期 + 当日序号 */
  no: string
  at: number
  status: OrderStatus
  items: OrderItem[]
  goodsAmount: number
  shippingFee: number
  total: number
  buyer: { name: string; phone: string; address: string }
  remark?: string
  timeline: OrderTimelineItem[]
  tracking?: { company: string; no: string }
  /** mock：内置演示单；cart：C 端模拟下单流入 */
  source: 'mock' | 'cart'
}

export interface ProductOverride {
  price?: number
  name?: string
  sub?: string
  unit?: string
  tag?: string
  specs?: { label: string; value: string }[]
  story?: string[]
  stock: number
  online: boolean
  featured: boolean
  updatedAt: number
}

/** 覆盖层合并后的商品：C 端与商家端读的都是这一份 */
export interface AdminProduct extends Product {
  stock: number
  online: boolean
  featured: boolean
  lowStock: boolean
  /** 只读源，用于"恢复默认价"之类的对照 */
  base: Product
}

export interface StockLog {
  id: string
  productId: number
  delta: number
  reason: 'restock' | 'sale' | 'manual'
  at: number
  /** 调整后的结存（老数据可能没有） */
  balance?: number
}

export interface ShopProfile {
  name: string
  intro: string
  open: boolean
  notifyNewOrder: boolean
  notifyLowStock: boolean
}

export interface KpiSummary {
  salesToday: number
  ordersToday: number
  avgTicket: number
  pendingShip: number
  /** 相对昨日销售额的变化（%），昨日为 0 时记 0 */
  deltaSales: number
}

export interface TrendPoint {
  date: string
  label: string
  sales: number
  orders: number
}

export interface TopProduct {
  productId: number
  name: string
  qty: number
  amount: number
}

/** 低库存阈值：≤ 5 件在列表上显示预警 */
export const LOW_STOCK_THRESHOLD = 5

/** 运费规则：满 199 免运，否则 10 元（演示规则） */
export const FREE_SHIPPING_AT = 199
export const SHIPPING_FEE = 10
