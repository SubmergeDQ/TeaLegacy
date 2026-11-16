// ============================================================
// 指标聚合：全部由订单算出，不写死数字
//
// 只导出纯函数（可绕开 UI 单测）；口径见
// docs/architecture/merchant-app.md 4.5.4。
// ============================================================

import { DAY, formatAxisLabel, startOfDay } from './time'
import type { KpiSummary, Order, OrderStatus, TopProduct, TrendPoint } from './types'

/** 计入销售额的状态：待付款、已取消不计 */
const SOLD: OrderStatus[] = ['paid', 'shipped', 'done']

function isSold(order: Order): boolean {
  return SOLD.includes(order.status)
}

function inRange(at: number, from: number, to: number): boolean {
  return at >= from && at < to
}

export function computeKpi(orders: Order[], now = Date.now()): KpiSummary {
  const todayStart = startOfDay(now)
  const tomorrowStart = todayStart + DAY
  const yesterdayStart = todayStart - DAY

  let salesToday = 0
  let ordersToday = 0
  let salesYesterday = 0

  // 环比取"昨日同一时段"：上午刚开门时不至于被昨天的全天销售额压成负值
  const elapsed = now - todayStart

  for (const order of orders) {
    if (inRange(order.at, todayStart, tomorrowStart)) {
      if (isSold(order)) salesToday += order.total
      if (order.status !== 'canceled') ordersToday += 1
    } else if (inRange(order.at, yesterdayStart, yesterdayStart + elapsed) && isSold(order)) {
      salesYesterday += order.total
    }
  }

  return {
    salesToday,
    ordersToday,
    avgTicket: ordersToday > 0 ? Math.round(salesToday / ordersToday) : 0,
    pendingShip: orders.filter((o) => o.status === 'paid').length,
    deltaSales:
      salesYesterday > 0
        ? Math.round(((salesToday - salesYesterday) / salesYesterday) * 100)
        : 0,
  }
}

/** 近 N 日趋势（含今天，空日补 0），从早到晚 */
export function computeTrend(orders: Order[], now = Date.now(), days = 7): TrendPoint[] {
  const todayStart = startOfDay(now)
  const points: TrendPoint[] = []

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const dayStart = todayStart - offset * DAY
    const dayEnd = dayStart + DAY
    let sales = 0
    let count = 0
    for (const order of orders) {
      if (!inRange(order.at, dayStart, dayEnd)) continue
      if (order.status !== 'canceled') count += 1
      if (isSold(order)) sales += order.total
    }
    const date = new Date(dayStart)
    points.push({
      date: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      label: formatAxisLabel(dayStart),
      sales,
      orders: count,
    })
  }

  return points
}

/** 近 N 日热销：按件数排序（同件数按金额） */
export function computeTop(
  orders: Order[],
  now = Date.now(),
  days = 7,
  limit = 5,
): TopProduct[] {
  const from = startOfDay(now) - (days - 1) * DAY
  const map = new Map<number, TopProduct>()

  for (const order of orders) {
    if (order.at < from || !isSold(order)) continue
    for (const item of order.items) {
      const entry = map.get(item.productId) ?? {
        productId: item.productId,
        name: item.name,
        qty: 0,
        amount: 0,
      }
      entry.name = item.name
      entry.qty += item.qty
      entry.amount += item.price * item.qty
      map.set(item.productId, entry)
    }
  }

  return [...map.values()]
    .sort((a, b) => b.qty - a.qty || b.amount - a.amount)
    .slice(0, limit)
}

/** 状态分段上的计数（全部 = 订单总数） */
export function countByStatus(orders: Order[]): Record<OrderStatus | 'all', number> {
  const counts: Record<OrderStatus | 'all', number> = {
    all: orders.length,
    pending: 0,
    paid: 0,
    shipped: 0,
    done: 0,
    canceled: 0,
  }
  for (const order of orders) counts[order.status] += 1
  return counts
}
