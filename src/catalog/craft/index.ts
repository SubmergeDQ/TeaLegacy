// ============================================================
// 互动产品汇总
//
// 新增一款互动产品：在 teas/ 下建一个模块文件，
// 再到 craftTeas 里登记一行即可，页面无需改动。
// ============================================================

import { shengBing } from './teas/sheng-bing'
import { shouTuo } from './teas/shou-tuo'
import { xiaoQingGan } from './teas/xiao-qing-gan'
import type { CraftTea } from './types'

export * from './types'

/** 选茶页的展示顺序 */
export const craftTeas: CraftTea[] = [shengBing, xiaoQingGan, shouTuo]

export function getCraftTea(id: string): CraftTea | undefined {
  return craftTeas.find((t) => t.id === id)
}

/** 商城商品 → 是否有对应的制茶体验（详情页据此提示"已亲手制成"） */
export function getCraftByProduct(productId: number): CraftTea | undefined {
  return craftTeas.find((t) => t.productId === productId)
}
