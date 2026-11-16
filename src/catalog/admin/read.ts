// ============================================================
// C 端只读入口
//
// 只依赖商品覆盖层，不引入订单 / Mock 生成器；
// 用户端首屏因此不会背上商家端的数据与页面代码。
// ============================================================

import { useAdminCatalogStore } from './catalogStore'
import type { AdminProduct } from './types'

export type { AdminProduct } from './types'
export { LOW_STOCK_THRESHOLD } from './types'

export function getVisibleProducts(): AdminProduct[] {
  return useAdminCatalogStore().items.filter((product) => product.online)
}

export function getAdminProduct(id: number): AdminProduct | undefined {
  return useAdminCatalogStore().items.find((product) => product.id === id)
}
