/** 价格千分位：1880 → "1,880" */
export function formatPrice(value: number): string {
  return value.toLocaleString('en-US')
}
