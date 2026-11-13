// 商品模块 04：朱泥思亭壶

import p03 from '@/assets/products/p03-brown-teapot-900.jpg'

import type { Product } from '../types'

export const zhuniTeapot: Product = {
  id: 4,
  name: '朱泥思亭壶',
  sub: '潮州工夫茶器',
  price: 386,
  unit: '容量 120ml',
  category: 'teaware',
  image: p03,
  source: '馆藏 · Rijksmuseum｜公有领域',
  specs: [
    { label: '泥料', value: '朱泥' },
    { label: '烧成', value: '高温烧结 · 声脆' },
    { label: '出水', value: '单孔 · 聚香' },
    { label: '适茶', value: '单丛 · 乌龙' },
  ],
  story: [
    '思亭壶梨式身筒，胎薄而挺，朱泥红艳。小壶聚香，最适合三五好友围坐，一泡一斟，慢慢喝完一整个下午。',
    '高温烧结，轻叩声音清脆。初用温水浸润即可，无需开壶仪式。',
  ],
}
