// 商品模块 08：扁腹紫砂壶

import p08 from '@/assets/products/banner-teapot-1200.jpg'

import type { Product } from '../types'

export const flatTeapot: Product = {
  id: 8,
  name: '扁腹紫砂壶',
  sub: '原矿底槽清 · 光器',
  price: 998,
  unit: '容量 220ml',
  category: 'teaware',
  image: p08,
  tone: 'warm',
  source: '馆藏 · 克利夫兰艺术博物馆｜公有领域',
  specs: [
    { label: '泥料', value: '原矿底槽清' },
    { label: '出水', value: '短直流 · 聚温' },
    { label: '口盖', value: '严丝合缝 · 无声' },
    { label: '适茶', value: '熟普 · 黑茶' },
  ],
  story: [
    '扁腹壶身如柿饼，肩线利落，短直流。光器最见功力，口盖严丝合缝，轻轻晃动无声。',
    '壶小聚温，闷泡熟普尤其合适。用毕倒尽茶叶，热水冲净后阴干。',
  ],
}
