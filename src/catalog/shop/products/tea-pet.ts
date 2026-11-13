// 商品模块 07：白瓷茶宠 · 笠帽弥勒

import p07 from '@/assets/products/p07-tea-pet-900.jpg'

import type { Product } from '../types'

export const teaPet: Product = {
  id: 7,
  name: '白瓷茶宠 · 笠帽弥勒',
  sub: '德化猪油白',
  price: 168,
  unit: '高 8.5cm',
  category: 'teaware',
  image: p07,
  source: '馆藏 · 大都会艺术博物馆｜公有领域',
  specs: [
    { label: '窑口', value: '德化' },
    { label: '胎质', value: '高白瓷 · 猪油白' },
    { label: '寓意', value: '知足常乐' },
    { label: '养护', value: '茶汤浇淋 · 棉布轻拭' },
  ],
  story: [
    '德化猪油白，温润如脂。笠帽弥勒憨态可掬，摆在茶席一角，淋茶汤滋养，日久生光。',
    '茶宠宜「养」不宜「洗」，以茶汤浇淋、棉布轻拭即可。',
  ],
}
