// ============================================================
// 演示订单生成器（确定性 Mock）
//
// 固定种子 LCG + 时间锚定"今天"：同一 seed 每次结果一致，
// 刷新、重启、换设备演示都稳定。数据全是虚构的。
// 生成结果由 store 持久化，之后从 localStorage 读回。
// ============================================================

import { products } from '@/catalog/shop'
import { DAY, HOUR, MINUTE, startOfDay } from '../time'
import {
  FREE_SHIPPING_AT,
  SHIPPING_FEE,
  type Order,
  type OrderItem,
  type OrderStatus,
  type OrderTimelineItem,
} from '../types'

const SEED = 20261116

/**
 * 每天的状态配比：索引 0 是今天，往后是昨天、前天……
 * 合计 48 单：待发货 14、已发货 10、已完成 20、已取消 3、待付款 1。
 */
const STATUS_PLAN: OrderStatus[][] = [
  ['paid', 'paid', 'pending', 'shipped', 'done', 'canceled'],
  ['paid', 'paid', 'shipped', 'shipped', 'done', 'done', 'done'],
  ['paid', 'paid', 'shipped', 'shipped', 'done', 'done', 'done', 'canceled'],
  ['paid', 'paid', 'shipped', 'done', 'done', 'done', 'canceled'],
  ['paid', 'paid', 'shipped', 'shipped', 'done', 'done', 'done'],
  ['paid', 'paid', 'shipped', 'done', 'done', 'done', 'done'],
  ['paid', 'paid', 'shipped', 'done', 'done', 'done'],
]

const BUYERS = [
  { name: '王先生', phone: '138****2043' },
  { name: '李女士', phone: '139****6712' },
  { name: '陈先生', phone: '137****5580' },
  { name: '赵女士', phone: '186****3391' },
  { name: '周先生', phone: '135****8824' },
  { name: '吴女士', phone: '158****4107' },
]

const ADDRESSES = [
  '云南省普洱市思茅区茶源路 18 号 3 栋 502',
  '云南省昆明市五华区翠湖东路 27 号 1 单元 801',
  '广东省广州市天河区天河北路 66 号 6 楼',
  '浙江省杭州市西湖区文三路 128 号 2 幢 403',
  '四川省成都市青羊区宽窄巷子东街 9 号',
  '北京市朝阳区朝阳路 5 号院 12 号楼 1902',
]

const COMPANIES = [
  { name: '圆通速递', prefix: 'YT' },
  { name: '中通快递', prefix: 'ZT' },
  { name: '顺丰速运', prefix: 'SF' },
  { name: 'EMS', prefix: 'EA' },
]

const REMARKS = ['请用礼盒包装', '周末再送货，平时家里没人', '不要放广告单页', '送人，麻烦包稳一点']

/** 固定种子线性同余：结果与调用顺序严格相关，保证可复现 */
function createRandom(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0
    return state / 4294967296
  }
}

function pick<T>(rand: () => number, list: T[]): T {
  return list[Math.floor(rand() * list.length)]
}

function between(rand: () => number, min: number, max: number): number {
  return min + Math.floor(rand() * (max - min + 1))
}

const pad2 = (n: number) => String(n).padStart(2, '0')

function orderNo(at: number, seq: number): string {
  const d = new Date(at)
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}${String(seq).padStart(3, '0')}`
}

/** 今天：往回取一小段时间；过去几天：9:00–21:00 之间 */
function orderTime(rand: () => number, dayStart: number, now?: number): number {
  if (now === undefined) {
    return dayStart + between(rand, 9 * 60, 21 * 60) * MINUTE + between(rand, 0, 59) * MINUTE
  }
  const elapsed = Math.max(1, Math.floor((now - dayStart) / MINUTE))
  const back = Math.min(elapsed - 1, between(rand, 12, 600))
  return Math.max(dayStart, now - back * MINUTE)
}

function buildOrder(
  rand: () => number,
  at: number,
  status: OrderStatus,
  seq: number,
): Order {
  const itemCount = between(rand, 1, 3)
  const pool = products.map((p) => p.id)
  const items: OrderItem[] = []

  for (let i = 0; i < itemCount && pool.length > 0; i += 1) {
    const id = pool.splice(Math.floor(rand() * pool.length), 1)[0]
    const product = products.find((p) => p.id === id)
    if (!product) continue
    items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      qty: between(rand, 1, 3),
    })
  }

  const goodsAmount = items.reduce((sum, it) => sum + it.price * it.qty, 0)
  const shippingFee = goodsAmount >= FREE_SHIPPING_AT ? 0 : SHIPPING_FEE
  const timeline: OrderTimelineItem[] = [{ at, label: '买家下单', done: true }]
  let tracking: Order['tracking']

  if (status === 'paid' || status === 'shipped' || status === 'done') {
    timeline.push({ at: at + 2 * MINUTE, label: '买家付款', done: true })
  }

  if (status === 'shipped' || status === 'done') {
    const company = pick(rand, COMPANIES)
    const shipAt = at + between(rand, 8, 20) * HOUR
    tracking = {
      company: company.name,
      no: `${company.prefix}${String(between(rand, 1000000000, 1999999999))}`,
    }
    timeline.push({ at: shipAt, label: '商家发货', done: true })
    if (status === 'done') {
      timeline.push({ at: shipAt + between(rand, 20, 60) * HOUR, label: '买家签收', done: true })
    } else {
      timeline.push({ at: 0, label: '买家签收', done: false })
    }
  }

  if (status === 'paid') timeline.push({ at: 0, label: '商家发货', done: false })
  if (status === 'pending') timeline.push({ at: 0, label: '等待买家付款', done: false })
  if (status === 'canceled') timeline.push({ at: at + 10 * MINUTE, label: '订单取消', done: true })

  const buyer = pick(rand, BUYERS)
  const remark = rand() < 0.22 ? pick(rand, REMARKS) : undefined

  return {
    no: orderNo(at, seq),
    at,
    status,
    items,
    goodsAmount,
    shippingFee,
    total: goodsAmount + shippingFee,
    buyer: { name: buyer.name, phone: buyer.phone, address: pick(rand, ADDRESSES) },
    remark,
    timeline,
    tracking,
    source: 'mock',
  }
}

/** 生成 48 张演示订单（近 7 天，今天 6 单），按时间倒序 */
export function generateMockOrders(now = Date.now()): Order[] {
  const rand = createRandom(SEED)
  const orders: Order[] = []

  STATUS_PLAN.forEach((statuses, offset) => {
    const dayStart = startOfDay(now - offset * DAY)
    const times = statuses
      .map(() => orderTime(rand, dayStart, offset === 0 ? now : undefined))
      .sort((a, b) => a - b)

    times.forEach((at, index) => {
      orders.push(buildOrder(rand, at, statuses[index], index + 1))
    })
  })

  return orders.sort((a, b) => b.at - a.at)
}
