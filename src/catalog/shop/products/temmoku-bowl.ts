// 商品模块 02：曜变天目盏

import p04 from '@/assets/products/p04-temmoku-900.jpg'

import type { Product } from '../types'

export const temmokuBowl: Product = {
  id: 2,
  name: '曜变天目盏',
  sub: '建窑风格 · 油滴曜变',
  price: 1280,
  unit: '口径 12.2cm',
  tag: '手作',
  category: 'teaware',
  image: p04,
  source: '馆藏 · 藤田美术馆｜公有领域',
  specs: [
    { label: '年代', value: '宋代风格' },
    { label: '胎土', value: '含铁紫金土' },
    { label: '烧成', value: '1300°C 还原焰' },
    { label: '配件', value: '木盒 · 器物卡' },
  ],
  story: [
    '盏内釉面在强光下泛蓝紫虹彩，油滴成斑，如夜空星河。胎骨厚重，含铁量高，入手有沉稳的压手感。',
    '建盏讲究「一盏一茶」，养盏日久，釉面愈发温润。日常以清水冲淋即可，忌钢丝球与洗洁精。',
  ],
}
