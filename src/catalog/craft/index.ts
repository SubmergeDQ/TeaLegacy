// ============================================================
// 工序动画汇总
//
// 新增一款茶的工序动画：在 teas/ 下建一个模块文件，
// 再到 craftTeas 里登记一行即可，页面无需改动。
// ============================================================

import { longZhu } from './teas/long-zhu'
import { shengBing } from './teas/sheng-bing'
import { shengSan } from './teas/sheng-san'
import { shouTuo } from './teas/shou-tuo'
import { shuSan } from './teas/shu-san'
import { xiaoQingGan } from './teas/xiao-qing-gan'
import { zhuanCha } from './teas/zhuan-cha'
import type { CraftTea } from './types'

export * from './types'

/** 选茶页的展示顺序：与工序内容一致 */
export const craftTeas: CraftTea[] = [
  shengSan,
  shuSan,
  xiaoQingGan,
  longZhu,
  zhuanCha,
  shengBing,
  shouTuo,
]

export function getCraftTea(id: string): CraftTea | undefined {
  return craftTeas.find((t) => t.id === id)
}

/** 商城商品 → 是否有对应的工序动画（详情页据此提示"已看全工序"） */
export function getCraftByProduct(productId: number): CraftTea | undefined {
  return craftTeas.find((t) => t.productId === productId)
}
