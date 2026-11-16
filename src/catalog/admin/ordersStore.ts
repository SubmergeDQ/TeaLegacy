// ============================================================
// 订单 store：发货 / 取消 / 备注 / C 端模拟下单
// 演示数据持久化在 localStorage，重置时按同一种子重新生成。
// ============================================================

import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { generateMockOrders } from './mock/orders'
import { ADMIN_STORAGE_KEYS, isOrders, readStore, writeStore } from './storage'
import { FREE_SHIPPING_AT, SHIPPING_FEE, type Order } from './types'

export interface CartOrderLine {
  productId: number
  name: string
  price: number
  qty: number
}

function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

function nextOrderNo(orders: Order[], at: number): string {
  const d = new Date(at)
  const prefix = `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`
  const used = orders
    .filter((order) => order.no.startsWith(prefix))
    .map((order) => Number(order.no.slice(prefix.length)) || 0)
  const seq = (used.length > 0 ? Math.max(...used) : 0) + 1
  return `${prefix}${String(seq).padStart(3, '0')}`
}

/** 把时间轴上的一步标记为已完成（没有就补上） */
function markStep(order: Order, label: string, at: number): void {
  const step = order.timeline.find((item) => item.label === label)
  if (step) {
    step.at = at
    step.done = true
  } else {
    order.timeline.push({ at, label, done: true })
  }
}

export const useAdminOrdersStore = defineStore('adminOrders', () => {
  const orders = ref<Order[]>(
    readStore(ADMIN_STORAGE_KEYS.orders, () => generateMockOrders(), isOrders),
  )

  function find(no: string): Order | undefined {
    return orders.value.find((order) => order.no === no)
  }

  function ship(no: string, tracking: { company: string; no: string }): boolean {
    const order = find(no)
    if (!order || order.status !== 'paid') return false
    const at = Date.now()
    order.status = 'shipped'
    order.tracking = tracking
    markStep(order, '商家发货', at)
    if (!order.timeline.some((item) => item.label === '买家签收')) {
      order.timeline.push({ at: 0, label: '买家签收', done: false })
    }
    return true
  }

  function cancel(no: string): boolean {
    const order = find(no)
    if (!order || (order.status !== 'paid' && order.status !== 'pending')) return false
    order.status = 'canceled'
    order.timeline = order.timeline.filter((item) => item.done)
    markStep(order, '订单取消', Date.now())
    return true
  }

  function remark(no: string, text: string): void {
    const order = find(no)
    if (!order) return
    order.remark = text.trim() || undefined
  }

  /** C 端模拟下单：生成一张「待发货」订单，时间轴记下单与付款 */
  function createFromCart(lines: CartOrderLine[]): Order | null {
    if (lines.length === 0) return null
    const at = Date.now()
    const items = lines.map((line) => ({
      productId: line.productId,
      name: line.name,
      price: line.price,
      qty: line.qty,
    }))
    const goodsAmount = items.reduce((sum, item) => sum + item.price * item.qty, 0)
    const shippingFee = goodsAmount >= FREE_SHIPPING_AT ? 0 : SHIPPING_FEE
    const order: Order = {
      no: nextOrderNo(orders.value, at),
      at,
      status: 'paid',
      items,
      goodsAmount,
      shippingFee,
      total: goodsAmount + shippingFee,
      buyer: {
        name: '演示顾客',
        phone: '138****0000',
        address: '云南省普洱市思茅区茶源路 18 号',
      },
      timeline: [
        { at, label: '买家下单', done: true },
        { at: at + 1000, label: '买家付款', done: true },
        { at: 0, label: '商家发货', done: false },
      ],
      source: 'cart',
    }
    orders.value = [order, ...orders.value]
    return order
  }

  function reset(): void {
    orders.value = generateMockOrders()
  }

  watch(orders, (v) => writeStore(ADMIN_STORAGE_KEYS.orders, v), { deep: true })

  return { orders, find, ship, cancel, remark, createFromCart, reset }
})
