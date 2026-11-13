// ============================================================
// 商城商品汇总
//
// 新增一件商品：在 products/ 下建一个模块文件，
// 再到 products 数组里按展示顺序登记一行即可。
// ============================================================

import { citrusPuer } from './products/citrus-puer'
import { flatTeapot } from './products/flat-teapot'
import { oribeBowl } from './products/oribe-bowl'
import { plumTeapot } from './products/plum-teapot'
import { puerCake } from './products/puer-cake'
import { teaCaddy } from './products/tea-caddy'
import { teaPet } from './products/tea-pet'
import { temmokuBowl } from './products/temmoku-bowl'
import { tuoCha } from './products/tuo-cha'
import { zhuniTeapot } from './products/zhuni-teapot'
import type { Product } from './types'

export type { Product } from './types'
export { banner } from './banner'

/** 商城首页的陈列顺序 */
export const products: Product[] = [
  puerCake,
  temmokuBowl,
  plumTeapot,
  zhuniTeapot,
  oribeBowl,
  teaCaddy,
  teaPet,
  flatTeapot,
  citrusPuer,
  tuoCha,
]

export function getProduct(id: number): Product | undefined {
  return products.find((p) => p.id === id)
}
