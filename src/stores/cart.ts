import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'

import { getProduct, type Product } from '@/mock/mockData'

export interface CartLine {
  id: number
  qty: number
}

const STORAGE_KEY = 'tea-legacy.cart.v1'

function load(): CartLine[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CartLine[]
    // 读回时过滤掉已不存在的商品与非法数量
    return parsed.filter((l) => getProduct(l.id) !== undefined && l.qty > 0)
  } catch {
    return []
  }
}

export const useCartStore = defineStore('cart', () => {
  const lines = ref<CartLine[]>(load())

  /** 带 Product 详情的购物车行（按加入顺序） */
  const detailed = computed(() =>
    lines.value
      .map((l) => ({ product: getProduct(l.id) as Product, qty: l.qty }))
      .filter((l) => l.product !== undefined),
  )
  const count = computed(() => lines.value.reduce((s, l) => s + l.qty, 0))
  const total = computed(() =>
    detailed.value.reduce((s, l) => s + l.product.price * l.qty, 0),
  )
  const isEmpty = computed(() => lines.value.length === 0)

  function add(product: Product, qty = 1) {
    const line = lines.value.find((l) => l.id === product.id)
    if (line) line.qty += qty
    else lines.value.push({ id: product.id, qty })
  }

  function setQty(id: number, qty: number) {
    const line = lines.value.find((l) => l.id === id)
    if (line) line.qty = Math.max(1, Math.min(99, qty))
  }

  function remove(id: number) {
    lines.value = lines.value.filter((l) => l.id !== id)
  }

  /** 撤销删除：按原数量放回 */
  function restore(product: Product, qty: number) {
    add(product, qty)
  }

  function clear() {
    lines.value = []
  }

  // 购物车持久化：刷新 / 重启后读回
  watch(
    lines,
    (v) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
      } catch {
        // 存储不可用（隐私模式等）时仅保留在内存
      }
    },
    { deep: true },
  )

  return { lines, detailed, count, total, isEmpty, add, setQty, remove, restore, clear }
})
