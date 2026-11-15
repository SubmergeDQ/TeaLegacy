// 商品模块 12：普洱熟散茶

import looseRipeArt from '@/assets/craft/ripe-loose.svg'

import type { Product } from '../types'

export const ripeLoose: Product = {
  id: 12,
  name: '普洱熟散茶',
  sub: '渥堆熟茶 · 勐海',
  price: 168,
  unit: '250g / 罐',
  tag: '渥堆发酵',
  category: 'tea',
  image: looseRipeArt,
  source: '示意茶样图 · 项目自绘线稿（非实物拍摄）',
  specs: [
    { label: '产区', value: '云南勐海' },
    { label: '工艺', value: '渥堆发酵 · 摊晾出堆' },
    { label: '汤色', value: '红浓明亮' },
    { label: '仓储', value: '昆明干仓' },
  ],
  story: [
    '晒青毛茶洒水堆集，翻堆散结，发酵到位后开沟摊晾。堆味散尽，温润香气才出来，再拣剔分级收存。',
    '散茶出味快，适合煮饮或大壶冲泡。第一泡醒茶，第二泡起渐入佳境。',
  ],
}
