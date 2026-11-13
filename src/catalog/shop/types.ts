// ============================================================
// 商城商品的类型
//
// 一件商品 = 一个数据模块（src/catalog/shop/products/*.ts），
// 列表页只按数组顺序陈列，详情页只读这一件自己的字段。
// ============================================================

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
