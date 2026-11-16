import { createRouter, createWebHashHistory } from 'vue-router'

import { useAdminAuthStore } from '@/merchant/stores/adminAuth'
import { merchantRoutes } from '@/merchant/router'
import CraftSelectView from '@/views/CraftSelectView.vue'
import ShopView from '@/views/ShopView.vue'

// 一级 Tab 页（meta.tab 标记）与次级页（meta.depth: 2）。
// 次级页隐藏 TabBar、全屏展示；hash 模式便于 PakePlus 直接打包。
// 产品主线：先制茶（/craft），再把做好的茶带走（/shop）。
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', redirect: '/craft' },
    {
      path: '/craft',
      name: 'craft',
      component: CraftSelectView,
      meta: { tab: 'craft', depth: 1 },
    },
    {
      path: '/craft/:id',
      name: 'craft-make',
      component: () => import('@/views/CraftMakeView.vue'),
      meta: { depth: 2 },
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
    // 商家端（方案 A：同一应用内的路由分区），全部懒加载
    ...merchantRoutes,
    { path: '/:pathMatch(.*)*', redirect: '/craft' },
  ],
})

// 商家端登录守卫：未登录只能停在 /admin/login；
// 已登录访问登录页则直接进概览。
router.beforeEach((to) => {
  if (to.meta.admin !== true) return
  const auth = useAdminAuthStore()
  if (to.name !== 'admin-login' && !auth.logged) {
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'admin-login' && auth.logged) {
    return { name: 'admin-dashboard' }
  }
  return
})

export default router
