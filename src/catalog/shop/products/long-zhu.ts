// 商品模块 13：普洱龙珠

import beadArt from '@/assets/craft/bead.svg'

import type { Product } from '../types'

export const longZhu: Product = {
  id: 13,
  name: '普洱龙珠',
  sub: '手工搓珠 · 一泡一颗',
  price: 228,
  unit: '36 颗 / 罐',
  tag: '手工搓制',
  category: 'tea',
  image: beadArt,
  source: '示意茶样图 · 项目自绘线稿（非实物拍摄）',
  specs: [
    { label: '产区', value: '云南普洱' },
    { label: '工艺', value: '回潮搓珠 · 阴干' },
    { label: '规格', value: '约 7g / 颗' },
    { label: '存放', value: '避光 · 干燥' },
  ],
  story: [
    '毛茶拣去梗片，回潮软润，掌间轻揉旋搓成珠。一颗一泡，条索不碎，出汤也匀。',
    '珠形紧实，前两泡出味稍慢，第三泡起渐入佳境。出门带几颗，不必带茶刀。',
  ],
}
