// ============================================================
// 商家端时间工具（订单时间轴、趋势标签、列表时间）
// 全部按本地时区计算，演示数据锚定"今天"。
// ============================================================

export const MINUTE = 60 * 1000
export const HOUR = 60 * MINUTE
export const DAY = 24 * HOUR

export function startOfDay(ts: number): number {
  const d = new Date(ts)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

const pad = (n: number) => String(n).padStart(2, '0')

/** 2026-11-16 09:24 */
export function formatDateTime(ts: number): string {
  const d = new Date(ts)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 11-16 09:24（列表卡用，省掉年份） */
export function formatShortTime(ts: number): string {
  const d = new Date(ts)
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 今天 / 昨天 / 11-14 */
export function formatDayLabel(ts: number, now = Date.now()): string {
  const diff = Math.round((startOfDay(now) - startOfDay(ts)) / DAY)
  if (diff === 0) return '今天'
  if (diff === 1) return '昨天'
  const d = new Date(ts)
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/** 折线图横轴：11/16 */
export function formatAxisLabel(ts: number): string {
  const d = new Date(ts)
  return `${d.getMonth() + 1}/${d.getDate()}`
}
