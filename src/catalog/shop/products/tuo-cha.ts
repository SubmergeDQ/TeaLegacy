// 商品模块 10：勐海熟普沱茶

import tuoArt from '@/assets/craft/tuo.svg'

import type { Product } from '../types'

export const tuoCha: Product = {
  id: 10,
  name: '勐海熟普沱茶',
  sub: '碗臼形 · 陈香',
  price: 198,
  unit: '250g / 沱',
  tag: '手捏成型',
  category: 'tea',
  image: tuoArt,
  source: '示意茶样图 · 项目自绘线稿（非实物拍摄）',
  specs: [
    { label: '产区', value: '云南勐海' },
    { label: '工艺', value: '手工捏形 · 轻压定型' },
    { label: '汤色', value: '红浓明亮' },
    { label: '仓储', value: '昆明干仓' },
  ],
  story: [
    '散茶回潮增柔，按分量装入布袋，手工捏成上圆下凹的碗臼状，再轻压定型。沱形紧实，一沱正好一泡。',
    '撬茶时沿边缘下针。醒茶一次，陈香才出得来；配油腻饮食尤其合适。',
  ],
}
