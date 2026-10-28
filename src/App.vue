<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import OTabbar, { type TabItem } from '@/components/oil-ui/OTabbar.vue'
import OToastHost from '@/components/oil-ui/OToastHost.vue'
import { hideToast } from '@/components/oil-ui/toast'

const route = useRoute()
const router = useRouter()

const tabItems: TabItem[] = [
  { key: 'culture', icon: 'tea', label: '文化' },
  { key: 'shop', icon: 'jar', label: '商城' },
]

// 仅一级 Tab 页显示底部导航；购物车、详情为全屏次级页
const showTabbar = computed(() => route.meta.tab !== undefined)
const activeTab = computed({
  get: () => (route.meta.tab as string) ?? 'shop',
  set: (key) => router.push(key === 'shop' ? '/shop' : '/culture'),
})

// 页面转场与滚动记忆：进次级页从右滑入、返回反向、Tab 间淡换；
// 离开 Tab 页时记住滚动位置，次级页总是从顶部进入
const transitionName = ref('page-fade')
const bodyEl = ref<HTMLElement>()
const scrollMemory = new Map<string, number>()

router.beforeEach((to, from) => {
  // 跨页残留的提示会误导（"已加入购物车"出现在购物车里）
  hideToast()
  const depthTo = (to.meta.depth as number) ?? 1
  const depthFrom = (from.meta.depth as number) ?? 1
  transitionName.value =
    depthTo === depthFrom ? 'page-fade' : depthTo > depthFrom ? 'page-forward' : 'page-back'
  if (bodyEl.value) scrollMemory.set(from.fullPath, bodyEl.value.scrollTop)
})

watch(
  () => route.fullPath,
  async () => {
    await nextTick()
    if (!bodyEl.value) return
    bodyEl.value.scrollTop = route.meta.tab ? (scrollMemory.get(route.fullPath) ?? 0) : 0
  },
)
</script>

<template>
  <div class="app-shell">
    <main ref="bodyEl" class="app-body">
      <router-view v-slot="{ Component }">
        <transition :name="transitionName">
          <keep-alive include="ShopView,CultureView">
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
    </main>

    <OTabbar v-if="showTabbar" v-model="activeTab" :items="tabItems" />
    <OToastHost :top-offset="showTabbar ? '3.75rem' : '3.25rem'" />
  </div>
</template>

<style scoped lang="scss">
.app-shell {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--o-paper);
}

.app-body {
  position: relative;
  flex: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

// —— 页面转场（交叠式：离场页绝对定位，避免布局跳动）——
.page-forward-enter-active,
.page-back-enter-active {
  transition:
    transform 320ms var(--o-ease-flow),
    opacity 320ms var(--o-ease-flow);
}

.page-forward-leave-active,
.page-back-leave-active {
  position: absolute;
  inset: 0;
  transition:
    transform 240ms var(--o-ease-flow),
    opacity 240ms linear;
}

.page-forward-enter-from {
  transform: translateX(12%);
  opacity: 0;
}

.page-forward-leave-to {
  transform: translateX(-6%);
  opacity: 0;
}

.page-back-enter-from {
  transform: translateX(-8%);
  opacity: 0;
}

.page-back-leave-to {
  transform: translateX(12%);
  opacity: 0;
}

.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 180ms linear;
}

.page-fade-leave-active {
  position: absolute;
  inset: 0;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}
</style>
