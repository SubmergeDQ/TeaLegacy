// ============================================================
// 商城商品汇总
//
// 只陈列与制茶工序对应的七款普洱：
// 生散、熟散、小青柑、龙珠、砖茶、茶饼、沱茶。
// 新增一件商品：在 products/ 下建一个模块文件，
// 再到 products 数组里按展示顺序登记一行即可。
// ============================================================

import { citrusPuer } from './products/citrus-puer'
import { longZhu } from './products/long-zhu'
import { puerCake } from './products/puer-cake'
import { rawLoose } from './products/raw-loose'
import { ripeLoose } from './products/ripe-loose'
import { tuoCha } from './products/tuo-cha'
import { zhuanCha } from './products/zhuan-cha'
import type { Product } from './types'

export type { Product } from './types'
export { banner } from './banner'

/** 商城首页的陈列顺序：与制茶页的七款茶一一对应 */
export const products: Product[] = [
  rawLoose,
  ripeLoose,
  citrusPuer,
  longZhu,
  zhuanCha,
  puerCake,
  tuoCha,
]

export function getProduct(id: number): Product | undefined {
  return products.find((p) => p.id === id)
}
