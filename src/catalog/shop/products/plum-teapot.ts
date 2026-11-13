// 商品模块 03：梅桩紫砂壶

import p02 from '@/assets/products/p02-plum-teapot-900.jpg'

import type { Product } from '../types'

export const plumTeapot: Product = {
  id: 3,
  name: '梅桩紫砂壶',
  sub: '宜兴 · 全手工捏塑',
  price: 2680,
  unit: '容量 280ml',
  tag: '全手工',
  category: 'teaware',
  image: p02,
  source: '馆藏 · Wikimedia Commons｜公有领域',
  specs: [
    { label: '泥料', value: '黄龙山原矿紫泥' },
    { label: '成型', value: '全手工捏塑' },
    { label: '出水', value: '七寸不散 · 断水利落' },
    { label: '适茶', value: '普洱 · 乌龙' },
  ],
  story: [
    '以梅干为身、梅枝为流把，疤结纹理皆以手工捏塑，无一重复。出水七寸不散，断水利落，盖子起合顺畅。',
    '新壶开壶后以茶汤淋养，久用生「包浆」，光可鉴人。适合冲泡普洱、乌龙等高香茶。',
  ],
}
