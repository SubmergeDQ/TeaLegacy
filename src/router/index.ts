import { createRouter, createWebHashHistory } from 'vue-router'

import { merchantRoutes } from '@/merchant/router'
import { readStoredRole } from '@/stores/appRole'
import CraftSelectView from '@/views/CraftSelectView.vue'
import ShopView from '@/views/ShopView.vue'

// 一级 Tab 页（meta.tab 标记）与次级页（meta.depth: 2）。
// 次级页隐藏 TabBar、全屏展示；hash 模式便于 PakePlus 直接打包。
// 产品主线：先制茶（/craft），再把做好的茶带走（/shop）。
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    // 首次启动：没有身份时先进选择页；之后按已选身份进对应端
    {
      path: '/',
      redirect: () => {
        const role = readStoredRole()
        if (role === 'merchant') return '/admin/dashboard'
        return role === 'user' ? '/craft' : '/welcome'
      },
    },
    {
      path: '/welcome',
      name: 'welcome',
      component: () => import('@/views/WelcomeView.vue'),
      meta: { depth: 1, title: '选择身份' },
    },
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

export default router
