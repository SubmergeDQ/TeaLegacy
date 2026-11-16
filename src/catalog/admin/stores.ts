// ============================================================
// 商家端 stores 出口（按职责拆在三个文件里）
//
// catalogStore：商品覆盖层（C 端也会读）
// ordersStore：订单
// shopStore：店铺设置
// ============================================================

export { useAdminCatalogStore } from './catalogStore'
export type { ProductPatch } from './catalogStore'
export { useAdminOrdersStore } from './ordersStore'
export type { CartOrderLine } from './ordersStore'
export { DEFAULT_SHOP, useAdminShopStore } from './shopStore'
export { ADMIN_STORAGE_KEYS } from './storage'
