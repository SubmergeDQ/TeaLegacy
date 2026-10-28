// ============================================================
// Mock 数据：店内茶品
//
// 商品图为博物馆开放馆藏图像，仅作演示占位；每件商品带
// source 字段说明图源，界面上在详情页"器物出处"处展示。
// 许可见 src/assets/products/SOURCES.md。
// ============================================================

import p01 from '@/assets/products/p01-puer-cake-900.jpg'
import p02 from '@/assets/products/p02-plum-teapot-900.jpg'
import p03 from '@/assets/products/p03-brown-teapot-900.jpg'
import p04 from '@/assets/products/p04-temmoku-900.jpg'
import p05 from '@/assets/products/p05-oribe-bowl-328.jpg'
import p06 from '@/assets/products/p06-caddy-900.jpg'
import p07 from '@/assets/products/p07-tea-pet-900.jpg'
import p08 from '@/assets/products/banner-teapot-1200.jpg'

import banner from '@/assets/products/banner-teapot-1200.jpg'
export { banner }

export interface Product {
  id: number
  name: string
  sub: string
  price: number
  originalPrice?: number
  unit: string
  tag?: string
  category: 'tea' | 'teaware'
  image: string
  /** 器物图出处（详情页展示） */
  source: string
  /** 图片需要降饱和融入茶色调（现代包装照等） */
  tone?: 'warm'
  specs: { label: string; value: string }[]
  story: string[]
}

export const products: Product[] = [
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
  {
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
  },
]

export function getProduct(id: number): Product | undefined {
  return products.find((p) => p.id === id)
}
