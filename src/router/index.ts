import { createRouter, createWebHashHistory } from 'vue-router'

import CultureView from '@/views/CultureView.vue'
import ShopView from '@/views/ShopView.vue'

// 一级 Tab 页（meta.tab 标记）与次级页（meta.depth: 2）。
// 次级页隐藏 TabBar、全屏展示；hash 模式便于 PakePlus 直接打包。
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/shop' },
    {
      path: '/culture',
      name: 'culture',
      component: CultureView,
      meta: { tab: 'culture', depth: 1 },
    },
    {
      path: '/shop',
      name: 'shop',
      component: ShopView,
      meta: { tab: 'shop', depth: 1 },
    },
    {
      path: '/shop/:id',
      name: 'product',
      component: () => import('@/views/ProductView.vue'),
      meta: { depth: 2 },
    },
    {
      path: '/cart',
      name: 'cart',
      component: () => import('@/views/CartView.vue'),
      meta: { depth: 2 },
    },
    { path: '/:pathMatch(.*)*', redirect: '/shop' },
  ],
})

export default router
