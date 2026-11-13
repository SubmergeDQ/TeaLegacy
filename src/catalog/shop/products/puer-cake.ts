// 商品模块 01：老班章古树生茶饼

import p01 from '@/assets/products/p01-puer-cake-900.jpg'

import type { Product } from '../types'

export const puerCake: Product = {
  id: 1,
  name: '老班章古树生茶饼',
  sub: '布朗山古树 · 头春',
  price: 1880,
  originalPrice: 2280,
  unit: '357g / 饼',
  tag: '非遗工艺',
  category: 'tea',
  image: p01,
  tone: 'warm',
  source: '包装照 · WikiTea｜CC BY-SA 4.0 · Ash Crow',
  specs: [
    { label: '年份', value: '2021 年春' },
    { label: '工艺', value: '石磨压制 · 手工棉纸' },
    { label: '树龄', value: '百年以上古树' },
    { label: '仓储', value: '昆明干仓' },
  ],
  story: [
    '茶青采自布朗山老班章村头春古树，条索肥壮、白毫显露。新茶气足劲烈，苦涩化得快，十余分钟后喉底回甘不断，是藏家公认的「班章味」。',
    '传统石磨压制成型，松紧适度，利于后期转化。棉纸手工包装，随饼附收藏茶票一张，可查批次与压饼日期。',
  ],
}
