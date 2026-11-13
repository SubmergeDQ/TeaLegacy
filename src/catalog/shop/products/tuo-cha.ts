// 商品模块 10：勐海熟普沱茶

import tuoArt from '@/assets/craft/tuo.svg'

import type { Product } from '../types'

export const tuoCha: Product = {
  id: 10,
  name: '勐海熟普沱茶',
  sub: '渥堆发酵 · 陈香',
  price: 198,
  unit: '250g / 沱',
  tag: '渥堆',
  category: 'tea',
  image: tuoArt,
  source: '示意茶样图 · 项目自绘占位（非实物拍摄）',
  specs: [
    { label: '产区', value: '云南勐海' },
    { label: '工艺', value: '渥堆四十天 · 翻堆七次' },
    { label: '汤色', value: '红浓明亮' },
    { label: '仓储', value: '昆明干仓' },
  ],
  story: [
    '潮水、成堆、盖布，微生物在茶里工作四十天，翻堆七次，堆温最高六十度。发酵到位，汤色才红浓。',
    '沱茶紧实，撬茶时沿边缘下针。醒茶一次，陈香才出得来；配油腻饮食尤其合适。',
  ],
}
