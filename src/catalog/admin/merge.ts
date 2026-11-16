// ============================================================
// 只读源 + 覆盖层 → 合并读取
//
// C 端与商家端读到的是同一份 AdminProduct：
// 价格、名称、副题取覆盖值，库存 / 上下架取覆盖值或初始值。
// 绝不修改 src/catalog/shop 里的 Product 对象。
// ============================================================

import { products, type Product } from '@/catalog/shop'

import { INITIAL_STOCK } from './initial'
import { LOW_STOCK_THRESHOLD, type AdminProduct, type ProductOverride } from './types'

export function mergeProduct(base: Product, override?: ProductOverride): AdminProduct {
  const stock = override?.stock ?? INITIAL_STOCK[base.id] ?? 0
  return {
    ...base,
    ...(override?.price !== undefined ? { price: override.price } : {}),
    ...(override?.name ? { name: override.name } : {}),
    ...(override?.sub ? { sub: override.sub } : {}),
    ...(override?.unit ? { unit: override.unit } : {}),
    ...(override?.tag ? { tag: override.tag } : {}),
    ...(override?.specs && override.specs.length > 0 ? { specs: override.specs } : {}),
    ...(override?.story && override.story.length > 0 ? { story: override.story } : {}),
    stock,
    online: override?.online ?? true,
    featured: override?.featured ?? false,
    lowStock: stock <= LOW_STOCK_THRESHOLD,
    base,
  }
}

export function mergeAll(overrides: Record<number, ProductOverride>): AdminProduct[] {
  return products.map((base) => mergeProduct(base, overrides[base.id]))
}

export function initialStockOf(id: number): number {
  return INITIAL_STOCK[id] ?? 0
}
