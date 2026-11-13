// 商品模块 06：有田烧锦绘茶叶罐

import p06 from '@/assets/products/p06-caddy-900.jpg'

import type { Product } from '../types'

export const teaCaddy: Product = {
  id: 6,
  name: '有田烧锦绘茶叶罐',
  sub: '松鹊红梅 · 手绘',
  price: 520,
  unit: '高 11cm',
  tag: '手绘',
  category: 'teaware',
  image: p06,
  source: '馆藏 · 大英博物馆｜公有领域',
  specs: [
    { label: '窑口', value: '有田烧' },
    { label: '容量', value: '约 250g 散茶' },
    { label: '密封', value: '软木塞内盖' },
    { label: '附赠', value: '竹茶则一只' },
  ],
  story: [
    '罐身白釉如绢，上手绘松鹊与红梅，釉彩温润不刺目。软木内盖阻隔潮气，散茶存放半月不串味。',
    '存放于避光干燥处即可；开罐取茶后随手扣紧内盖。',
  ],
}
