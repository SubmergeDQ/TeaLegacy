// ============================================================
// 发货相关的小工具：物流公司、上次选择、演示运单号
// 单笔发货与批量发货共用，避免两处各写一套。
// ============================================================

export interface Carrier {
  name: string
  prefix: string
}

export const CARRIERS: Carrier[] = [
  { name: '圆通速递', prefix: 'YT' },
  { name: '中通快递', prefix: 'ZT' },
  { name: '顺丰速运', prefix: 'SF' },
  { name: 'EMS', prefix: 'EA' },
]

const CARRIER_KEY = 'tea-legacy.admin.shipcarrier.v1'

export function carrierPrefix(name: string): string {
  return CARRIERS.find((item) => item.name === name)?.prefix ?? CARRIERS[0].prefix
}

/** 记住上次使用的物流公司：连续发货时少做一次选择 */
export function loadCarrierName(): string {
  try {
    const saved = localStorage.getItem(CARRIER_KEY)
    return saved && CARRIERS.some((item) => item.name === saved) ? saved : CARRIERS[0].name
  } catch {
    return CARRIERS[0].name
  }
}

export function saveCarrierName(name: string): void {
  try {
    localStorage.setItem(CARRIER_KEY, name)
  } catch {
    // 存储不可用时只在本次会话生效
  }
}

/**
 * 演示运单号：字母前缀 + 12 位随机数字（16 位，满足 8–20 位校验）。
 * 每次打开发货弹层都不同，演示时不会看到一串重复的单号。
 */
export function makeTracking(prefix: string): string {
  const digits = Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('')
  return `${prefix}${digits}`
}
