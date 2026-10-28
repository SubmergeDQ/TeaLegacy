// 动效工具：加购飞入、徽标跳动（WAAPI）
// 手感来自方向卡："倒茶"——流淌、减速、无过冲。

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * 商品加购飞入：从触发元素掣出一枚商品小图，
 * 沿弧线落向购物车锚点，到达时回调 onArrive（徽标跳动）。
 * 用商品图而不是色点，视线能一直跟住"这件商品"。
 */
export function flyToCart(
  from: HTMLElement,
  to: HTMLElement,
  imageUrl?: string,
  onArrive?: () => void,
): void {
  const shell = document.getElementById('app')
  if (!shell || prefersReducedMotion()) {
    onArrive?.()
    return
  }
  const shellRect = shell.getBoundingClientRect()
  const a = from.getBoundingClientRect()
  const b = to.getBoundingClientRect()
  const startX = a.left + a.width / 2 - shellRect.left
  const startY = a.top + a.height / 2 - shellRect.top
  const dx = b.left + b.width / 2 - shellRect.left - startX
  const dy = b.top + b.height / 2 - shellRect.top - startY

  const dot = document.createElement('span')
  dot.className = 'fly-dot'
  if (imageUrl) dot.style.backgroundImage = `url("${imageUrl}")`
  dot.style.left = `${startX}px`
  dot.style.top = `${startY}px`
  shell.appendChild(dot)

  const anim = dot.animate(
    [
      { transform: 'translate(-50%, -50%) scale(1.6)', opacity: 0 },
      {
        transform: 'translate(-50%, -50%) scale(1.5)',
        opacity: 1,
        offset: 0.12,
      },
      {
        transform: `translate(calc(-50% + ${dx * 0.55}px), calc(-50% + ${dy * 0.5 - 52}px)) scale(1.1)`,
        opacity: 1,
        offset: 0.55,
      },
      {
        transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.4)`,
        opacity: 0.35,
      },
    ],
    { duration: 460, easing: 'cubic-bezier(0.32, 0.72, 0.35, 1)' },
  )
  anim.onfinish = () => {
    dot.remove()
    onArrive?.()
  }
}

/** 目标元素小幅跳动（徽标 / 图标到达反馈） */
export function bump(el: HTMLElement): void {
  if (prefersReducedMotion()) return
  el.animate(
    [{ transform: 'scale(1)' }, { transform: 'scale(1.18)' }, { transform: 'scale(1)' }],
    { duration: 240, easing: 'ease-out' },
  )
}

/** 模拟异步（结算请求等） */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}
