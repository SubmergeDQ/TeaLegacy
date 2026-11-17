// ============================================================
// 上拉加载（IntersectionObserver + 骨架）
//
// 监听列表底部的 sentinel：进入预加载区就加载下一页，
// 每页 10 条；加载完由调用方的 hasMore 决定是否继续。
// 快速滑动时 sentinel 可能一直停在视口内：追加完立刻复查并继续补页，
// 避免"停在骨架处，得再滑一下才加载"。
// ============================================================

import { nextTick, onBeforeUnmount, ref, watch, type ComponentPublicInstance } from 'vue'

const ROOT_SELECTOR = '.app-body'
// 提前一屏多开始预取，快速下滑时下一页已经在路上
const PRELOAD_PX = 480

export function useInfiniteScroll(
  loadMore: () => Promise<void> | void,
  hasMore: () => boolean,
) {
  const sentinel = ref<HTMLElement>()
  const loading = ref(false)
  let observer: IntersectionObserver | null = null

  /** 模板里用 :ref="setSentinel"，避免字符串 ref 与 TS 的未使用告警 */
  function setSentinel(el: Element | ComponentPublicInstance | null) {
    sentinel.value = el instanceof HTMLElement ? el : undefined
  }

  /** 追加内容后按真实位置复查：sentinel 仍接近可视区就继续补页 */
  function nearViewport(): boolean {
    const el = sentinel.value
    const root = document.querySelector<HTMLElement>(ROOT_SELECTOR)
    if (!el || !root) return false
    const rect = el.getBoundingClientRect()
    const rootRect = root.getBoundingClientRect()
    return rect.top <= rootRect.bottom + PRELOAD_PX && rect.bottom >= rootRect.top
  }

  async function trigger() {
    if (loading.value || !hasMore()) return
    loading.value = true
    try {
      await loadMore()
    } finally {
      loading.value = false
    }
    // 快速滑到底时 sentinel 可能还在预加载区：直接续上，不用再滑一下
    await nextTick()
    if (hasMore() && nearViewport()) void trigger()
  }

  function disconnect() {
    observer?.disconnect()
    observer = null
  }

  watch(
    sentinel,
    (el) => {
      disconnect()
      if (!el) return
      const root = document.querySelector<HTMLElement>(ROOT_SELECTOR)
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) void trigger()
        },
        { root, rootMargin: `${PRELOAD_PX}px 0px` },
      )
      observer.observe(el)
    },
    { flush: 'post' },
  )

  onBeforeUnmount(disconnect)

  return { setSentinel, loading, trigger }
}
