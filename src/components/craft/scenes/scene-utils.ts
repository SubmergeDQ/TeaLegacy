// ============================================================
// 工序场景的共用小工具：所有变化都由 progress 推出来，
// 场景因此可以暂停、跳步、定格核对。
// ============================================================

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

export const easeInOut = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

/** 把总进度映射成某个元素自己的 0–1 窗口 */
export function window01(t: number, start: number, end: number): number {
  if (end <= start) return t >= end ? 1 : 0
  return clamp01((t - start) / (end - start))
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

/** 两点之间带抬升的弧线插值：叶片离枝、茶珠落席都用它 */
export function arcPoint(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  t: number,
  lift = 26,
): { x: number; y: number } {
  return {
    x: lerp(ax, bx, t),
    y: lerp(ay, by, t) - Math.sin(Math.PI * t) * lift,
  }
}

export function rad(deg: number): number {
  return (deg * Math.PI) / 180
}
