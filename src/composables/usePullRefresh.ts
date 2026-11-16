// ============================================================
// 下拉刷新（触屏手势 + 阻尼）
//
// 页面挂在 App.vue 的滚动容器 .app-body 里，所以监听那个元素：
// 只有滚到顶部才接管，位移乘 0.45 做阻尼，超过阈值触发刷新。
// 返回值交给页面画"下拉刷新"指示器。
// ============================================================

import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const ROOT_SELECTOR = '.app-body'

export function usePullRefresh(
  onRefresh: () => void | Promise<void>,
  threshold = 64,
) {
  const distance = ref(0)
  const refreshing = ref(false)

  let el: HTMLElement | null = null
  let startY = 0
  let tracking = false

  function onTouchStart(event: TouchEvent) {
    if (refreshing.value || !el) return
    const touch = event.touches[0]
    if (!touch) return
    tracking = el.scrollTop <= 0
    startY = touch.clientY
  }

  function onTouchMove(event: TouchEvent) {
    if (!tracking || refreshing.value) return
    const touch = event.touches[0]
    if (!touch) return
    const dy = touch.clientY - startY
    if (dy <= 0) {
      distance.value = 0
      return
    }
    // 阻尼：手指走 2 倍，指示器走 1 倍左右
    distance.value = Math.min(96, dy * 0.45)
    if (distance.value > 4) event.preventDefault()
  }

  async function onTouchEnd() {
    if (!tracking) return
    tracking = false
    if (distance.value >= threshold && !refreshing.value) {
      refreshing.value = true
      distance.value = threshold * 0.6
      try {
        await onRefresh()
      } finally {
        refreshing.value = false
        distance.value = 0
      }
      return
    }
    distance.value = 0
  }

  function bind() {
    el = document.querySelector<HTMLElement>(ROOT_SELECTOR)
    if (!el) return
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove', onTouchMove, { passive: false })
    el.addEventListener('touchend', onTouchEnd)
    el.addEventListener('touchcancel', onTouchEnd)
  }

  function unbind() {
    if (!el) return
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchmove', onTouchMove)
    el.removeEventListener('touchend', onTouchEnd)
    el.removeEventListener('touchcancel', onTouchEnd)
    el = null
  }

  onMounted(bind)
  onBeforeUnmount(unbind)

  return {
    distance,
    refreshing,
    active: computed(() => distance.value > 0 || refreshing.value),
    progress: computed(() => Math.min(1, distance.value / threshold)),
    label: computed(() => {
      if (refreshing.value) return '正在刷新…'
      return distance.value >= threshold ? '松开刷新' : '下拉刷新'
    }),
  }
}
