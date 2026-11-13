// 商品模块 05：织部青瓷茶碗

import p05 from '@/assets/products/p05-oribe-bowl-328.jpg'

import type { Product } from '../types'

export const oribeBowl: Product = {
  id: 5,
  name: '织部青瓷茶碗',
  sub: '美浓烧 · 绿釉',
  price: 368,
  unit: '口径 12.8cm',
  category: 'teaware',
  image: p05,
  source: '馆藏 · 京都国立博物馆｜CC BY 4.0',
  specs: [
    { label: '样式', value: '织部 · 桃山风格' },
    { label: '釉色', value: '绿釉挂流' },
    { label: '器形', value: '深腹 · 双手捧持' },
    { label: '适茶', value: '抹茶 · 煎茶' },
  ],
  story: [
    '釉色如春水初生，深浅不一的绿从盏口流向盏底，每一只的流动纹路都不相同。器形敦厚，双手捧持有安稳感。',
    '日常茶席、点一碗抹茶皆宜。可入洗碗机，但手洗更能久保釉光。',
  ],
}
