// 商品模块 09：新会小青柑

import citrusArt from '@/assets/craft/citrus.svg'

import type { Product } from '../types'

export const citrusPuer: Product = {
  id: 9,
  name: '新会小青柑',
  sub: '青柑壳 · 填入熟普',
  price: 268,
  unit: '12 颗 / 盒',
  tag: '生晒',
  category: 'tea',
  image: citrusArt,
  source: '示意茶样图 · 项目自绘线稿（非实物拍摄）',
  specs: [
    { label: '产区', value: '广东新会' },
    { label: '工艺', value: '挖果填茶 · 日晒三日' },
    { label: '冲泡', value: '一颗一泡 · 沸水' },
    { label: '存放', value: '避光 · 干燥' },
  ],
  story: [
    '青柑在果皮尚青时采下，挖去果肉，填入熟普，日晒三日。柑香先出，茶味随后，一颗正好一泡。',
    '果壳薄而油胞密，柑油遇沸水即散，故不宜久闷。第一泡醒茶十秒，第二泡起渐入佳境。',
  ],
}
