// ============================================================
// 上拉加载（IntersectionObserver + 骨架）
//
// 监听列表底部的 sentinel：进入视口就加载下一页，
// 每页 10 条；加载完由调用方的 hasMore 决定是否继续。
// ============================================================

import { onBeforeUnmount, ref, watch, type ComponentPublicInstance } from 'vue'

const ROOT_SELECTOR = '.app-body'

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

  async function trigger() {
    if (loading.value || !hasMore()) return
    loading.value = true
    try {
      await loadMore()
    } finally {
      loading.value = false
    }
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
        { root, rootMargin: '160px 0px' },
      )
      observer.observe(el)
    },
    { flush: 'post' },
  )

  onBeforeUnmount(disconnect)

  return { setSentinel, loading, trigger }
}
