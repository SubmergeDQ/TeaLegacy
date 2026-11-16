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
 * 批量发货时的预填运单号：前缀 + 日期 + 时分 + 序号，
 * 16 位字母数字，满足 8–20 位校验；同一分钟内按序号区分。
 */
export function makeTracking(prefix: string, index: number, now = Date.now()): string {
  const d = new Date(now)
  const pad = (n: number) => String(n).padStart(2, '0')
  const stamp = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}`
  return `${prefix}${stamp}${pad(index + 1)}`
}
