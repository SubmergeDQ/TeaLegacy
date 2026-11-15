// 商品模块 11：普洱生散茶

import looseRawArt from '@/assets/craft/raw-loose.svg'

import type { Product } from '../types'

export const rawLoose: Product = {
  id: 11,
  name: '普洱生散茶',
  sub: '晒青毛茶 · 云南大叶种',
  price: 268,
  unit: '250g / 罐',
  tag: '日光晒青',
  category: 'tea',
  image: looseRawArt,
  source: '示意茶样图 · 项目自绘线稿（非实物拍摄）',
  specs: [
    { label: '产区', value: '云南澜沧' },
    { label: '工艺', value: '铁锅杀青 · 日光晒干' },
    { label: '条索', value: '紧结显毫' },
    { label: '仓储', value: '昆明干仓' },
  ],
  story: [
    '一芽二叶采下，薄摊萎凋，铁锅杀青，轻揉成条，最后借日光晒干。散茶不蒸不压，条索完整，取用也方便。',
    '新茶清冽，带山野气；存两三年后转出蜜香。日常用盖碗，沸水快出汤。',
  ],
}
