<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import OTabbar, { type TabItem } from '@/components/oil-ui/OTabbar.vue'
import OToastHost from '@/components/oil-ui/OToastHost.vue'
import { hideToast } from '@/components/oil-ui/toast'
import { useAppRoleStore } from '@/stores/appRole'

const route = useRoute()
const router = useRouter()
const role = useAppRoleStore()

// 身份跟随路由：隐藏入口、直接访问 /admin/* 或旧会话进来时，
// 「我的 / 设置」里的「当前身份」也显示正确的一端。
watch(
  () => route.meta.admin,
  (admin) => {
    if (admin === true) {
      if (role.current !== 'merchant') role.choose('merchant')
    } else if (route.path !== '/welcome' && role.current !== 'user') {
      role.choose('user')
    }
  },
  { immediate: true },
)

// 用户端与商家端各有一组一级 Tab，共用同一套外壳。
// 方案 A：商家端只是同一应用里的另一棵路由树（/admin/*）。
const userTabs: TabItem[] = [
  { key: 'craft', icon: 'tea', label: '制茶' },
  { key: 'shop', icon: 'jar', label: '商城' },
]

const merchantTabs: TabItem[] = [
  { key: 'dashboard', icon: 'chart', label: '概览' },
  { key: 'products', icon: 'box', label: '商品' },
  { key: 'orders', icon: 'receipt', label: '订单' },
  { key: 'shop', icon: 'store', label: '我的' },
]

const isAdmin = computed(() => route.meta.admin === true)
const tabItems = computed(() => (isAdmin.value ? merchantTabs : userTabs))

// 仅一级 Tab 页显示底部导航；购物车、详情、制作页为全屏次级页
const showTabbar = computed(() => route.meta.tab !== undefined)
// 部分页面页头更高，提示下移，避免盖住刚变化的关键数字
const toastOffset = computed(
  () =>
    (route.meta.toastTop as string | undefined) ?? (showTabbar.value ? '3.75rem' : '3.25rem'),
)
const activeTab = computed({
  get: () => (route.meta.tab as string) ?? (isAdmin.value ? 'dashboard' : 'craft'),
  set: (key) => {
    if (isAdmin.value) router.push(`/admin/${key}`)
    else router.push(key === 'shop' ? '/shop' : '/craft')
  },
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
    <main ref="bodyEl" class="app-body" :class="{ 'app-body--tab': showTabbar }">
      <router-view v-slot="{ Component }">
        <transition :name="transitionName">
          <keep-alive include="ShopView,CraftSelectView">
            <component :is="Component" />
          </keep-alive>
        </transition>
      </router-view>
    </main>

    <div v-if="showTabbar" class="app-tabbar">
      <OTabbar v-model="activeTab" :items="tabItems" />
    </div>
    <OToastHost :top-offset="toastOffset" />
  </div>
</template>

<style scoped lang="scss">
.app-shell {
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  // 顶部让出状态栏：整块壳统一处理，避免各页面各自补 env() 时漏掉一级页
  padding-top: var(--o-safe-top);
  background: var(--o-paper);
}

.app-body {
  position: relative;
  flex: 1;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}

// TabBar 用悬浮层而不是 flex 兄弟节点：进出二级页时外壳高度不变，
// 页面不会在转场瞬间被重新排版（那是主要的一下"顿"感）。
// 一级页用 padding-bottom 把内容让出来，视觉与原来一致。
.app-body--tab {
  padding-bottom: calc(3.25rem + var(--o-safe-bottom));
}

.app-tabbar {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
}

// —— 页面转场（交叠式：离场页绝对定位，避免布局跳动）——
// 只动 transform：整页 opacity 会多一层全屏合成，低端机容易掉帧。
// 进入页必须自带纸色底：否则滑动过程中会透出下面一张页面（一级页的背景）。
.page-forward-enter-active,
.page-back-enter-active {
  position: relative;
  z-index: 2;
  min-height: 100%;
  background: var(--o-paper);
  transition: transform 280ms var(--o-ease-flow);
  will-change: transform;
}

.page-forward-leave-active,
.page-back-leave-active {
  position: absolute;
  inset: 0;
  z-index: 1;
  transition: transform 200ms var(--o-ease-flow);
  will-change: transform;
}

.page-forward-enter-from {
  transform: translate3d(10%, 0, 0);
}

.page-forward-leave-to {
  transform: translate3d(-4%, 0, 0);
}

.page-back-enter-from {
  transform: translate3d(-6%, 0, 0);
}

.page-back-leave-to {
  transform: translate3d(10%, 0, 0);
}

// Tab 之间用「纸面淡入」而不是交叉淡化：
// 两个整页同时半透明会互相透出（文字重影、图片叠色）。
// 旧页立即隐藏，新页自带纸色底从纸面淡入，任一帧都不会有两页叠加。
.page-fade-enter-active {
  position: relative;
  z-index: 2;
  min-height: 100%;
  background: var(--o-paper);
  transition: opacity 140ms linear;
}

.page-fade-leave-active {
  display: none;
}

.page-fade-enter-from {
  opacity: 0;
}
</style>
