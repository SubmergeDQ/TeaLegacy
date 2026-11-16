// ============================================================
// 商家端路由（方案 A：单应用 + 路由分区）
//
// 全部懒加载，不进用户端首屏；meta 约定见
// docs/architecture/merchant-app.md 4.2：
//   admin   标记属于商家端（外壳据此切换导航与返回键）
//   tab     一级 Tab 页（显示底部导航），值为 Tab key
//   depth   1 一级页 / 2 次级页（决定转场方向与返回键行为）
//   title   页面标题（后续可用于导航栏与文档）
// ============================================================

import type { RouteRecordRaw } from 'vue-router'

const base = { admin: true, section: 'admin' }

export const merchantRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/login',
    name: 'admin-login',
    component: () => import('@/merchant/views/AdminLoginView.vue'),
    meta: { ...base, depth: 1, title: '商家登录' },
  },
  {
    path: '/admin',
    redirect: '/admin/dashboard',
    meta: { ...base, depth: 1 },
  },
  {
    path: '/admin/dashboard',
    name: 'admin-dashboard',
    component: () => import('@/merchant/views/AdminDashboardView.vue'),
    meta: { ...base, tab: 'dashboard', depth: 1, title: '概览' },
  },
  {
    path: '/admin/products',
    name: 'admin-products',
    component: () => import('@/merchant/views/AdminProductsView.vue'),
    meta: { ...base, tab: 'products', depth: 1, title: '商品' },
  },
  {
    path: '/admin/products/:id',
    name: 'admin-product-edit',
    component: () => import('@/merchant/views/AdminProductEditView.vue'),
    meta: { ...base, depth: 2, title: '编辑商品' },
  },
  {
    path: '/admin/orders',
    name: 'admin-orders',
    component: () => import('@/merchant/views/AdminOrdersView.vue'),
    meta: { ...base, tab: 'orders', depth: 1, title: '订单' },
  },
  {
    path: '/admin/orders/:no',
    name: 'admin-order-detail',
    component: () => import('@/merchant/views/AdminOrderDetailView.vue'),
    meta: { ...base, depth: 2, title: '订单详情' },
  },
  {
    path: '/admin/shop',
    name: 'admin-shop',
    component: () => import('@/merchant/views/AdminShopView.vue'),
    meta: { ...base, tab: 'shop', depth: 1, title: '我的' },
  },
]
