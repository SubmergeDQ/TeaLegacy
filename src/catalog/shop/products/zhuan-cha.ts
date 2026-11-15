// 商品模块 14：普洱砖茶

import brickArt from '@/assets/craft/brick.svg'

import type { Product } from '../types'

export const zhuanCha: Product = {
  id: 14,
  name: '普洱砖茶',
  sub: '方正紧压 · 利于仓储',
  price: 398,
  unit: '250g / 砖',
  tag: '模具压制',
  category: 'tea',
  image: brickArt,
  source: '示意茶样图 · 项目自绘线稿（非实物拍摄）',
  specs: [
    { label: '产区', value: '云南勐海' },
    { label: '工艺', value: '拼配回潮 · 入模压制' },
    { label: '规格', value: '250g / 砖' },
    { label: '仓储', value: '昆明干仓' },
  ],
  story: [
    '散茶按配方拼配，回潮增柔，定量填入方形模具，施压成砖。砖形方正，堆叠省地，也利于长期陈化。',
    '撬茶沿砖边下针，醒茶一次再冲。砖茶耐泡，煮饮也别有厚度。',
  ],
}
