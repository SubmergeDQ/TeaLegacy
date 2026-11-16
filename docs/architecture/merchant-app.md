# 茶承 TeaLegacy 商家管理后台 · 开发文档

> 版本 v1.0 ｜ 2026-11-16
> 分析对象：[SubmergeDQ/TeaLegacy](https://github.com/SubmergeDQ/TeaLegacy) v1.0.1（`45db464`）
> 目标：在现有 C 端演示工程内，增量开发**手机优先、纯离线、Mock 数据**的商家管理后台

---

> **仓库状态**：用户端已实现；商家端方案已定（A 单应用路由分区），M0 骨架已落地（`src/merchant/`：登录 / 路由 / 4 个 Tab 占位）。
> 方案与决策见 [plans/00-方案对比.md](../plans/00-方案对比.md)、[DECISIONS.md](../DECISIONS.md)。
> **目录以方案 A 为准**：商家端页面落在 `src/merchant/views/*`，路由 `src/merchant/router/index.ts`，
> 数据层 `src/catalog/admin/*`（P0 阶段建）；本文 4.1–4.3 已按实际实现修订。

## 0. 结论速览

| 问题 | 答案 |
|---|---|
| 能不能做 | **能，而且成本很低**。现有工程是纯前端 SPA，后台只是再加一棵路由树 |
| 技术路线 | 同工程内新增 `/admin` 分支 + 独立布局 `AdminLayout`，复用 Oil UI 与设计令牌（**方案 A**） |
| 新增依赖 | **0 个运行时依赖**。组件扩展现有 Oil UI，图表自绘 SVG |
| P0 范围 | 登录 + 概览看板 + 商品列表/编辑 + 订单列表/详情 + 店铺设置，共 7 页 |
| 代码量 | 约 **2 500 行**（Vue/TS/SCSS） |
| 工期 | 熟手 **8.5 人日**；3 天可出"能演示"的裁剪版 |
| 体积影响 | 主包不变，后台独立懒加载 chunk ≈ **+80 KB（gzip 约 +25 KB）**；不新增字体 |
| 演示亮点 | 后台数字由 Mock 订单**聚合计算**（非写死）；C 端"模拟下单"能实时进入后台订单列表，形成闭环 |
| 最大风险 | 商品数据双写污染 C 端 → 用"只读源 + 覆盖层"彻底规避 |

---

## 1. 现状架构分析（代码级事实）

### 1.1 关键事实

| 维度 | 现状 | 对后台的影响 |
|---|---|---|
| 构建 | Vite 7 + `@vitejs/plugin-vue` 6，`npm run build` 前置 `vue-tsc --noEmit` | 新增代码必须过严格类型检查（`noUnusedLocals`、`verbatimModuleSyntax`） |
| 框架 | Vue 3.5 `<script setup>` + TS 5.8 strict | 沿用同一写法，无迁移成本 |
| 路由 | Vue Router 4 **hash 模式**；靠 `meta.tab`（一级页）与 `meta.depth`（层级）驱动外壳 | 后台可直接复用 `depth` 做转场与原生返回键 |
| 全局壳 | `src/App.vue`：滚动容器 `.app-body`、TabBar 显隐、页面转场、滚动位置记忆、KeepAlive | 需新增 3 处 `admin` 判断，其余不动 |
| 入口 | `src/main.ts` 注册 Pinia / Router / OilUI / 字体；Capacitor 返回键按 `meta.depth` 处理 | 返回键 fallback 需按"分区"改（见 4.2） |
| 组件库 | **Oil UI**：8 个组件（Button/Tabbar/NavBar/Badge/Stepper/Dialog/ToastHost/Icon），插件全局注册 | 后台缺的组件全部按同风格增量扩展，不引入第三方 UI |
| 设计令牌 | 双层：`variables.scss`（SCSS，注入每个 SFC）+ `base.scss`（`:root` CSS 变量） | 后台直接复用；只补 4 个语义色 |
| 数据层 | `src/catalog/**` 纯静态模块化数据，`products` 7 件、`craftTeas` 7 款，无写操作 | 后台需要"可写"，用覆盖层解决（见 4.5） |
| 状态 | Pinia setup store；`cart`/`craft` 落 localStorage，键带版本号 `.v1`，读取用 try/catch 防御 | 后台沿用同样的持久化与容错套路 |
| 适配 | postcss-pxtorem（375 基准）+ 安全区令牌 + `100dvh`；≥520px 收成手机样机 | 后台页面按 375 设计，同样自动适配 |
| 无障碍 | 44px 触控区、Esc 关闭、焦点管理、`prefers-reduced-motion` | 后台必须继承（表格行、开关、Sheet） |

### 1.2 实测体积基线（本地 `npm install && npm run build`）

```
dist 合计 6.4 MB（其中约 5.9 MB 是 Noto Serif SC 的 110 个 woff2 分片）
index.js      167.7 kB │ gzip 63.2 kB   ← 主包
index.css     118.4 kB │ gzip 40.5 kB
CraftMakeView  70.2 kB │ gzip 19.5 kB   ← 已用懒加载，可参考此模式
```

结论：主包还有余量，后台必须**路由级懒加载**，不得进主包。

### 1.3 可复用 / 需新建

| 可直接复用 | 需要新建 |
|---|---|
| `App.vue` 外壳、转场、滚动记忆 | `AdminLayout.vue`（后台独立外壳 + 底部 4 Tab） |
| `OTabbar` / `ONavBar` / `OBadge` / `OButton` / `ODialog` / `OToastHost` / `OIcon` / `OStepper` | 12 个后台组件 + 2 个组合式函数（列表/刷新） |
| 设计令牌、`utils/format.ts`、`utils/motion.ts`（`delay` 模拟接口） | 数据契约、Mock 订单生成器、指标聚合、4 个 Pinia store |
| `catalog/shop` 的 `products`（只读权威数据） | 商品覆盖层、库存流水、订单状态机 |
| localStorage 版本键 + 防御式读取范式 | 模拟登录与路由守卫 |

---

## 2. 方案对比与选型

| 维度 | **A. 同工程路由分支（推荐）** | B. pnpm monorepo 拆包 | C. 独立仓库 |
|---|---|---|---|
| 改动量 | 新增目录为主，改 `App.vue` 3 处、`router` 1 处 | 需重构工程结构、引入 workspace | 无，但主题会漂移 |
| 主题一致性 | 天然一致（同一套令牌） | 一致（抽 `@tealegacy/ui`） | 差，需手工同步 |
| 单 APK 双身份 | 支持，路由 + 登录即可 | 需两套构建产物 | 需两个 APK |
| 类型共享 | 直接 `@/` 引用 | 需建包与构建编排 | 复制粘贴 |
| 演示成本 | 最低 | 中 | 低但后续维护差 |
| 何时选它 | 后台 ≤ 15 页、单团队、以演示为目标 | 后台 > 15 页 / 需要真权限 / 运营要独立发版 | C 端与后台分属不同团队 |

**结论：选 A。** 但目录与 import 方式按 B 的边界来写（后台不反向依赖 C 端 view，只依赖 `catalog` 读取层与 `oil-ui`），将来抽包只搬目录、不改业务代码。

**触发迁移 B 的信号**（写进 README 备忘）：后台页面超过 15 个；需要真实登录态/权限；需要单独给运营出 APK 或 Web 部署。

---

## 3. 产品设计

### 3.1 角色与使用场景

单一角色「店主」，手机竖屏单手操作，核心动作只有 4 件：**看数 → 发货 → 改价/上下架 → 调库存**。因此信息架构不做 PC 后台的"左导航 + 多 Tab + 表格"，而是**底部 4 Tab + 二级全屏页**，与 C 端的手感保持一致。

### 3.2 信息架构

```
概览 ── 今日 KPI / 7 日趋势 / 待办 / 热销 Top5
 │
商品 ── 搜索·筛选 ──▶ 商品编辑（价格/库存/上下架/文案）
 │                     └▶ 库存调整（入库/出库，记流水）
订单 ── 状态分段 ──▶ 订单详情（商品行/金额/地址/时间轴）──▶ 发货
 │
我的 ── 店铺信息 / 营业状态 / 通知开关 / 演示数据 / 退出
```

### 3.3 页面清单

| 编号 | 页面 | 路由 | 优先级 | 说明 | 预估 |
|---|---|---|---|---|---|
| A1 | 商家登录 | `/admin/login` | P0 | 本地校验（账号 `tea-admin` / 密码 `123456`），登录态存 `sessionStorage` | 0.3d |
| A2 | 概览看板 | `/admin/dashboard` | P0 | 4 张 KPI 卡 + 7 日趋势折线 + 待发货待办 + 热销 Top5 | 1.2d |
| A3 | 商品列表 | `/admin/products` | P0 | 搜索、分类/状态筛选、上下架开关、库存角标、低库存预警 | 1.2d |
| A4 | 商品编辑 | `/admin/products/:id` | P0 | 价格/库存/单位/标签/上下架/specs 动态行/story 多段，带校验 | 1.5d |
| A5 | 订单列表 | `/admin/orders` | P0 | 状态分段（全部/待付款/待发货/已发货/已完成/已取消）、上拉加载 | 1.2d |
| A6 | 订单详情 | `/admin/orders/:no` | P0 | 商品行、金额明细、收货信息、状态时间轴、发货/备注/取消 | 1.3d |
| A7 | 店铺设置 | `/admin/shop` | P0 | 店铺名/简介/营业状态/通知开关/重置演示数据/版本 | 0.8d |
| A8 | 发货 | `/admin/orders/:no` + Sheet | P0 | 物流公司 + 运单号，写入时间轴 | 含 A6 |
| A9 | 库存总览 | `/admin/inventory` | P1 | 全部 SKU 库存、低库存排序、入库/出库快捷入口 | 0.8d |
| A10 | 数据详情 | `/admin/dashboard/detail` | P2 | 指标口径说明、分类占比环形图、导出 JSON | 0.8d |
| A11 | 评价/顾客 | `/admin/reviews` | P2 | Mock 评价列表、回复（仅本地） | 0.8d |
| A12 | 关于/演示说明 | `/admin/about` | P1 | 说明这是演示数据、如何重置、埋点入口 | 0.3d |

合计 P0 ≈ 7.5 人日（另留 1 人日联调/回归 = **8.5 人日**）。

### 3.4 关键流程

**① 看数 → 待办 → 发货（最高频）**

```
打开 App → 概览「待发货 3」→ 点击 → 订单页自动筛选 paid
→ 点单 → 底部「发货」→ Sheet 填运单号 → 状态变 shipped
→ 概览待发货 -1、今日销售额不变（口径：按下单日计）
```

**② 改价 → C 端即时生效（演示核心）**

```
商品列表 → 点某商品 → 改价格 268→238 → 保存
→ 返回列表（价格已变）→ 切到 C 端商城 → 详情页显示 238
```

**③ 库存预警**

```
库存调整 入库 +20 → 列表库存角标变绿
低于阈值 5 → 商品卡出现「库存不足」朱砂标签
```

### 3.5 与 C 端的联动矩阵

| 后台动作 | C 端表现 | 实现位置 |
|---|---|---|
| 改价 | 商城列表/详情价格同步 | 合并读取层 `getAdminProducts()` |
| 下架 | 商城列表隐藏、详情 404 回商城 | `ShopView` / `ProductView` 改读合并层 |
| 改库存 | 详情页显示"仅剩 N 件"（可选 P1） | 合并层 |
| 发货/取消订单 | C 端无订单页，不体现 | 仅后台 |
| **C 端模拟下单** | 后台订单列表新增一条「待付款」并角标提示 | `CartView` 结算成功时调用 `orderAdmin.createFromCart()`（P1，强烈建议做，闭环感极强） |

> 注意：C 端现有结算只弹「支付成功」并清空购物车，不落订单。P1 只需在 `CartView.vue` 的结算回调里加 3 行，即可让后台"活"起来。

### 3.6 线框（375 宽）

```
A2 概览                      A3 商品列表
┌──────────────────────┐    ┌──────────────────────┐
│ 茶承 · 商家   [承]    │    │ ‹ 商品管理      [+新建]│
│ ┌────────┐┌────────┐ │    │ [搜索商品名/标签   ]  │
│ │今日销售││订单数  │ │    │ 全部│生茶│熟茶│柑普   │
│ │¥1,268  ││ 6      │ │    │ ┌──────────────────┐ │
│ └────────┘└────────┘ │    │ │[图] 普洱生散茶   │ │
│ ┌────────┐┌────────┐ │    │ │ ¥268  库存 32 [开]│ │
│ │待发货 3││客单价  │ │    │ └──────────────────┘ │
│ └────────┘└────────┘ │    │ ┌──────────────────┐ │
│ 近 7 日成交趋势        │    │ │[图] 小青柑  ⚠库存4│ │
│   ╱╲__╱╲____╱        │    │ └──────────────────┘ │
│ ┌──────────────────┐ │    │     上拉加载更多      │
│ │待办 · 待发货 3  →│ │    └──────────────────────┘
│ └──────────────────┘ │
│ 热销 Top5             │    A6 订单详情
│ 1 生散茶 ×12          │    ┌──────────────────────┐
└──────────────────────┘    │ ‹ 订单 #20261116003   │
  概览 商品 订单 我的        │ 待发货               │
                            │ 生散茶 ×2   ¥536     │
A4 商品编辑                  │ 小青柑 ×1   ¥128     │
┌──────────────────────┐    │ 合计 ¥664            │
│ ‹ 编辑商品    [保存]  │    │ 收货 王先生 138…     │
│ 名称  [普洱生散茶 ]   │    │ 时间轴 ●已付款       │
│ 副题  [晒青毛茶…  ]   │    │        ○已发货       │
│ 价格  [268  ] 元      │    │ [发货] [更多操作]     │
│ 库存  [32   ] 件      │    └──────────────────────┘
│ 分类  [生茶 ▾]        │
│ 规格  + 添加一行       │
│ 简介  多行文本…        │
│ 状态  [上架 ●——]      │
│ ── 固定底部 ──        │
│ [取消]      [保存]    │
└──────────────────────┘
```

---

## 4. 技术设计

### 4.1 目录结构（方案 A 实际落地）

```
src/
├─ main.ts                      ~ 返回键 fallback 按 meta.section 区分两端
├─ App.vue                      ~ 按 meta.admin 切换底部 Tab（复用同一套外壳）
├─ router/
│  └─ index.ts                  ~ 追加 merchantRoutes、登录守卫
├─ merchant/                    ★ 商家端（M0 骨架已建）
│  ├─ router/index.ts           + 路由表（全部懒加载）
│  ├─ views/                    + 登录 / 概览 / 商品 / 商品编辑 / 订单 / 订单详情 / 我的
│  ├─ components/ComingSoon.vue + 占位卡（M0）
│  └─ stores/adminAuth.ts       + 模拟登录态（sessionStorage）
├─ components/oil-ui/           ~ 增量注册（见 4.4），icons.ts 已加 4 个导航图标
├─ catalog/admin/               + ★ 数据层（P0 阶段建：types / mock / metrics / 读取层）
├─ composables/                 + usePullRefresh / useInfiniteScroll（P0 阶段建）
└─ styles/                      ~ 新增 4 个语义色令牌（P0 阶段）
```

### 4.2 路由方案（已实现）

```ts
// src/merchant/router/index.ts（实际实现，摘要）
const base = { admin: true, section: 'admin' }

export const merchantRoutes: RouteRecordRaw[] = [
  { path: '/admin/login', name: 'admin-login',
    component: () => import('@/merchant/views/AdminLoginView.vue'),
    meta: { ...base, depth: 1, title: '商家登录' } },
  { path: '/admin', redirect: '/admin/dashboard', meta: { ...base, depth: 1 } },
  { path: '/admin/dashboard', ... meta: { tab: 'dashboard', depth: 1 } },
  { path: '/admin/products',  ... meta: { tab: 'products', depth: 1 } },
  { path: '/admin/products/:id',
    component: () => import('@/merchant/views/AdminProductEditView.vue'),
    meta: { ...base, depth: 2 } },
  { path: '/admin/orders',    ... meta: { tab: 'orders', depth: 1 } },
  { path: '/admin/orders/:no', meta: { ...base, depth: 2 } },
  { path: '/admin/shop',      ... meta: { tab: 'shop', depth: 1 } },
]
```

`src/router/index.ts` 里把 `...merchantRoutes` 插在兜底路由之前；`beforeEach` 做登录守卫（未登录跳 `/admin/login?redirect=…`，已登录访问登录页跳概览）。

**对现有代码的实际改动**：

| 位置 | 改动 |
|---|---|
| `App.vue` | 新增 `userTabs` / `merchantTabs`，`tabItems` 按 `meta.admin` 切换；`activeTab` setter 区分两端路径 |
| `router/index.ts` | 追加 `...merchantRoutes` + 登录守卫（约 20 行） |
| `main.ts` | 返回键 fallback 按 `meta.section` 回 `/admin/dashboard` 或 `/craft` |
| `views/ShopView.vue` | 品牌区「普」印改为按钮，长按 800ms 进 `/admin/login`（演示隐藏入口） |

> 原设计计划独立 `AdminLayout` + 自绘 TabBar；M0 实现改为**复用 `App.vue` 外壳**：商家端只是另一组一级 Tab（`meta.tab` 语义相同），转场、滚动记忆、Toast、返回键全部沿用，少一层嵌套滚动容器。将来商家端需要自己的顶栏或侧滑时再抽 `AdminLayout`。

### 4.3 外壳与导航（M0 实际）

- 底部导航复用 `OTabbar`：概览 `chart` / 商品 `box` / 订单 `receipt` / 我的 `store`（图标已加进 `icons.ts`）。
- 登录页无 `meta.tab`，不显示底部导航；二级页 `meta.depth: 2` 全屏 + 返回栏（占位页用 `ONavBar`）。
- 原生返回键：`meta.depth > 1` 回上一页，一级页退出；`/admin/*` 的 fallback 回 `/admin/dashboard`。
- 滚动位置与页面转场直接沿用 `App.vue` 现有逻辑，无需额外代码。

### 4.4 组件扩展清单（Oil UI Admin 增量）

| 组件 | 职责 | 关键接口 | 估算 |
|---|---|---|---|
| `OStatCard` | KPI 卡：标签、数值、环比、说明 | `label/value/delta/hint/tone` | 55 行 |
| `OTag` | 状态标签（在售/下架/待发货/缺货） | `tone: success\|warn\|danger\|neutral` | 40 行 |
| `OSwitch` | 上下架、通知开关 | `v-model`，44px 点击区，`role="switch"` | 60 行 |
| `OCell` | 设置项/信息行 | `label/value/arrow/click` | 45 行 |
| `OSearchBar` | 搜索输入（带清除） | `v-model`、`placeholder`、debounce | 65 行 |
| `OSegmented` | 状态分段筛选（可横滑） | `v-model/options`，墨绿滑块指示 | 70 行 |
| `OSheet` | 底部弹层（筛选、发货、出入库表单） | `v-model/title`，安全区底部内边距 | 110 行 |
| `OEmpty` | 空态线稿 + 文案 + 行动按钮 | `text/action` | 35 行 |
| `OTimeline` | 订单物流时间轴 | `items: {label, at, done}[]` | 60 行 |
| `OFormItem` | 表单行：标签 + 控件 + 错误文案 | `label/error/required` | 70 行 |
| `OChartLine` | 7 日趋势折线 + 面积渐变（SVG） | `points/labels/height` | 75 行 |
| `OChartBar` | 分类/日柱状（SVG） | `items` | 60 行 |
| `OChartDonut` | 分类占比环形（`stroke-dasharray`） | `items` | 70 行 |
| `usePullRefresh` | 下拉刷新（touch 手势 + 阻尼） | 返回 `{ pulling, progress, bind }` | 90 行 |
| `useInfiniteScroll` | 上拉加载（IntersectionObserver + 骨架） | 返回 `{ sentinel, loading, done }` | 70 行 |

> 全部沿用现有写法：`<script setup lang="ts">` + scoped SCSS + 设计令牌；`OIcon` 新增 `chart/box/receipt/store/search/edit/truck/stock/bell/warning` 共 10 个 24-viewBox 图标（1.5px 描边）。

### 4.5 数据层设计（核心）

#### 4.5.1 「只读源 + 覆盖层」合并读取

C 端的 `src/catalog/shop/products/*.ts` 是静态模块，**后台绝不能直接改它**（会污染 C 端、且刷新即丢）。做法：

```ts
// src/catalog/admin/index.ts
export interface AdminProduct extends Product {
  stock: number
  online: boolean
  featured: boolean
  lowStock: boolean
  base: Product          // 原始数据，用于"恢复默认"
}

export function getAdminProducts(): AdminProduct[] {
  const { overrides } = useAdminCatalogStore()
  return products.map((base) => {
    const o = overrides[base.id]
    return {
      ...base,
      ...(o ? { price: o.price, name: o.name, sub: o.sub } : {}),
      stock: o?.stock ?? 0,
      online: o?.online ?? true,
      featured: o?.featured ?? false,
      lowStock: (o?.stock ?? 0) <= LOW_STOCK_THRESHOLD,  // 5
      base,
    }
  })
}
export function getAdminProduct(id: number): AdminProduct | undefined
export function getVisibleProducts(): AdminProduct[]   // C 端改读这个：仅 online
```

- 读取层函数内部使用 store，必须在 `setup` / `computed` 中调用（Pinia 要求 active instance），文档与注释里写清。
- C 端 `ShopView.vue`、`ProductView.vue` 改为读 `getVisibleProducts()` / `getAdminProduct()`，**两行改动**即可实现联动。
- 首次运行若无覆盖数据，则用 `mock/orders.ts` 里生成的初始库存填充（32 / 18 / 6 …），其中刻意留 1–2 个低库存商品，让"预警"在演示第一屏就可见。

#### 4.5.2 数据契约

```ts
export type OrderStatus =
  | 'pending'   // 待付款
  | 'paid'      // 待发货
  | 'shipped'   // 已发货
  | 'done'      // 已完成
  | 'canceled'  // 已取消

export interface OrderItem {
  productId: number
  name: string      // 下单时快照，商品改名不影响历史单
  price: number     // 下单时快照
  qty: number
}

export interface Order {
  no: string                 // 20261116003
  at: number                 // 下单时间（ms）
  status: OrderStatus
  items: OrderItem[]
  goodsAmount: number        // 商品合计
  shippingFee: number        // 运费（满 199 免运费，演示规则）
  total: number
  buyer: { name: string; phone: string; address: string }
  remark?: string
  timeline: { at: number; label: string; done: boolean }[]
  tracking?: { company: string; no: string }
  source: 'mock' | 'cart'    // 区分演示数据 / C 端流入
}

export interface ProductOverride {
  price?: number
  name?: string
  sub?: string
  stock: number
  online: boolean
  featured: boolean
  updatedAt: number
}

export interface StockLog {
  id: string
  productId: number
  delta: number        // +入库 / -出库
  reason: 'restock' | 'sale' | 'manual'
  at: number
}

export interface ShopProfile {
  name: string
  intro: string
  open: boolean
  notifyNewOrder: boolean
  notifyLowStock: boolean
}

export interface KpiSummary {
  salesToday: number
  ordersToday: number
  avgTicket: number
  pendingShip: number
  deltaSales: number      // 相对昨日 %
}
export interface TrendPoint { date: string; sales: number; orders: number }
export interface TopProduct { productId: number; name: string; qty: number; amount: number }
```

#### 4.5.3 Mock 订单生成（确定性）

- 用固定种子 LCG（`seed = 20261116`）生成 **48 单**，时间锚定"今天"，覆盖 **过去 7 天**（今天保证 5–8 单，用于 KPI 非零）。
- 商品池取 `products`，每单 1–3 行，`qty` 1–3，价格取商品当前价；运费规则满 199 免运。
- 状态分布：`paid 30% / shipped 20% / done 35% / canceled 8% / pending 7%`，时间轴按状态补齐（下单 → 付款 → 发货 → 签收）。
- 买家姓名/手机号/地址用固定词表 + 种子索引组合（如「王先生 / 138****2043 / 云南省普洱市思茅区…」），**全部虚构**。
- 输出是**纯函数**：同一 seed 每次结果一致 → 刷新、重启、跨设备演示都稳定；首次启动写入 store，之后从 localStorage 读。

#### 4.5.4 指标聚合（全部由订单算出，不写死）

| 指标 | 口径 |
|---|---|
| 今日销售额 | `status ∈ {paid, shipped, done}` 且 `at` 为今天 → `sum(total)` |
| 今日订单数 | 今天创建的订单数（不含取消） |
| 客单价 | 今日销售额 ÷ 今日订单数（除零保护） |
| 待发货 | `status === 'paid'` 的订单数 |
| 7 日趋势 | 按日聚合销售额与单量（空日补 0） |
| 热销 Top5 | 近 7 天 `sum(qty)` 排序 |
| 分类占比 | 按 `base.category`（`tea` / `teaware`）聚合金额 |

`metrics.ts` 只导出纯函数（`computeKpi(orders, now)`、`computeTrend(...)`），**可脱离 UI 单测**，也是把"演示数字可信"的关键。

#### 4.5.5 持久化与迁移

| 键 | 内容 | 说明 |
|---|---|---|
| `tea-legacy.admin.overrides.v1` | `Record<number, ProductOverride>` | 后台改价/库存/上下架 |
| `tea-legacy.admin.orders.v1` | `Order[]` | Mock 初始单 + C 端流入单 |
| `tea-legacy.admin.stocklog.v1` | `StockLog[]`（保留最近 100 条） | 库存流水 |
| `tea-legacy.admin.shop.v1` | `ShopProfile` | 店铺设置 |
| `tea-legacy.admin.session.v1` | `{ at: number }`（sessionStorage） | 登录态 |

- 沿用现有范式：`load()` 里 `try/catch` + 字段校验 + 非法回退默认值。
- 提供 `resetAdminData()`（设置页 A7）一键清空以上 4 个键并重新生成 Mock，演示前可恢复初始状态。
- 键名带 `.v1`，未来升级写 `migrate()` 钩子，不破坏已存数据。

### 4.6 状态管理

| store | 状态 | 动作 |
|---|---|---|
| `useAdminAuthStore` | `logged`, `profile` | `login(pwd)`, `logout()` |
| `useAdminCatalogStore` | `overrides`, `stockLogs` | `setPrice`, `setStock(±)`, `toggleOnline`, `updateProduct`, `reset` |
| `useAdminOrdersStore` | `orders` | `ship(no, tracking)`, `cancel(no)`, `remark(no, text)`, `createFromCart(items)`, `reset` |
| （看板） | 无独立 store | `computed(() => computeKpi(ordersStore.orders, Date.now()))`，避免缓存不一致 |

> 不建 dashboard store：所有 KPI 从订单 `computed` 派生，天然保证"改单即变数"。

### 4.7 图表方案

| 方案 | 体积（实测/官方） | 优点 | 缺点 |
|---|---|---|---|
| **自绘 SVG（推荐 P0）** | **0** | 与项目线稿风格一致、可完全控色、SSR 无关、易做面积渐变 | tooltip 需自写（演示可省） |
| ECharts 6.1.0 | 全量 368 KB gzip；按需（core+Line+Grid）约 120–160 KB gzip | 交互完善、图表类型全 | 首屏压力大、主题需重配茶色系 |
| Chart.js 4.6.1 | 205 KB / **69.6 KB gzip** | 轻、Canvas 渲染、API 简单 | Canvas 与线稿风格略割裂 |

结论：P0 三个图（折线/柱/环）自绘，共约 205 行；若后续要下钻联动，再评估按需 ECharts，不要现在引。

**折线绘制要点**：`viewBox="0 0 320 140"`，`preserveAspectRatio="none"` 拉伸但线宽用 `vector-effect="non-scaling-stroke"` 保持 1.5px；面积用 `linearGradient`（墨绿 12% → 0）；数据点 `r=2.5`；空数据走 `OEmpty`。

### 4.8 视觉规范

**复用令牌**：`--o-paper` 宣纸底、`--o-ink` 墨绿（主色/选中）、`--o-primary` 茶褐（价格/主按钮）、`--o-line` 细线。

**新增 4 个语义色**（`variables.scss` + `base.scss` 各一处）：

```scss
$o-success: #3f6b4a;  // 在售 / 已完成 / 已发货
$o-warn:    #a87728;  // 库存偏低 / 待发货
$o-danger:  #a5463a;  // 缺货 / 已取消 / 删除
$o-info:    #4a6b73;  // 中性说明
```

**管理端排版差异**（与 C 端的"文化叙事"区分，后台要"效率"）：

| 项 | 规则 |
|---|---|
| 字体 | 数字/表格走 sans + `font-variant-numeric: tabular-nums`；标题才用衬线 |
| 字号 | 列表主文本 14px，辅助 12px，KPI 数值 24–28px 600 |
| 行高 | 列表行 ≥ 56px；设置项 52px |
| 圆角 | 卡片 16px、按钮 10px（沿用令牌） |
| 层级 | 不用阴影堆层次，用 1px 细线 + 底色差（沿用现有克制风格） |
| 图标 | 24 viewBox、1.5 描边、`currentColor` |
| 数量表达 | 「共 7 款」「3 单待处理」，不用「您有…」的客服口吻 |

### 4.9 移动端交互细节

1. **吸顶**：页面头（标题 + 搜索/筛选）`position: sticky; top: 0`，底色 `--o-paper`，底部 1px 细线。
2. **下拉刷新**：`usePullRefresh` 只监听 `scrollTop === 0` 时的 touchmove；阻尼 `dy * 0.45`，超过 64px 触发；触发后 `delay(600)` 重新计算（演示态）。
3. **上拉加载**：`IntersectionObserver` 监听底部 sentinel，每页 10 条，加载 400ms 骨架；加载完显示「已经到底了」。
4. **底部弹层**：筛选项、发货、出入库统一用 `OSheet`（从底部升起，遮罩可点关闭），比居中 `ODialog` 更易单手触达；`ODialog` 只用于危险操作二次确认。
5. **固定提交栏**：编辑页底部 `position: sticky; bottom: 0` + `padding-bottom: var(--o-safe-bottom)`，主按钮右、取消左。
6. **触控**：所有可点元素 ≥44×44（小图标用伪元素扩区，沿用现有手法）；列表项按下 `background` 加深 4%。
7. **表单键盘**：数字输入用 `inputmode="decimal"`；滚动容器在键盘弹出时用 `100dvh` 收缩，按钮不被顶飞。
8. **原生返回键**：已在 `main.ts` 按 `meta.depth` 处理，只需改 fallback 分区（见 4.2）。
9. **空态/错误**：列表空 → `OEmpty`（线稿 + "还没有订单" + 刷新按钮）；数据异常 → 降级为 0 并 Toast「演示数据已重置」。
10. **`prefers-reduced-motion`**：全局已有规则，新组件不得写死 `transition` 绕过。

### 4.10 打包与入口

**单 APK 双身份**（推荐演示用）：

- C 端入口：商城页右上角「承」印章 **长按 800ms** → `/admin/login`（隐藏入口，不破坏 C 端观感）；同时在商城页脚加一行小字「商家入口」，方便演示时直接找到。
- 登录页：账号 `tea-admin` / 密码 `123456`，校验通过写 `sessionStorage` 后跳概览；错误抖动提示。
- 可选环境变量：`VITE_ENTRY=admin` 时 `/` 重定向到 `/admin/login`，配合 `vite build --mode admin` 出"商家版"包（同一份代码，两个产物）。

构建命令不变：

```bash
npm run typecheck      # 类型检查（后台代码一并检查）
npm run build          # → dist/
npx cap sync android   # 同步进 WebView
```

Capacitor 配置无需改动；后台页面全部懒加载，C 端首屏无额外下载。

### 4.11 性能与体积预算

| 项 | 当前 | 目标 |
|---|---|---|
| 主包 JS | 167.7 KB (gzip 63.2) | 不变（后台不进主包） |
| 后台 chunk | — | ≤ 90 KB (gzip ≤ 28 KB) |
| CSS | 118.4 KB (gzip 40.5) | + ≤ 12 KB (gzip +4) |
| 新增依赖 | — | 0 |
| 首屏 | — | 后台首屏（登录后概览）≤ 1.2s（中端安卓） |
| 列表 | — | 48 单/7 商品全量渲染无卡顿；滚动 60fps |

手段：路由级懒加载 + 组件按需 + `content-visibility: auto`（长列表，可选）+ 不做图片资源（沿用 SVG）。

### 4.12 无障碍

- 开关用 `role="switch"` + `aria-checked`；筛选用 `role="tablist"`/`aria-selected`。
- `OSheet` 打开时焦点移入、Esc 关闭、关闭后焦点归还（复用 `ODialog` 的实现思路）。
- 所有图标按钮必须有 `aria-label`；价格数字读屏可读（不做图片化）。
- 危险操作（删除商品/取消订单）二次确认，确认按钮文案明确（「确认取消此订单」）。

---

## 5. 页面规格（P0）

### A1 商家登录
- 目标：拦住非演示路径，同时给出"演示账号"提示。
- 布局：品牌区（茶承 · 商家中心 / 衬线副标题）→ 账号 → 密码 → 主按钮 → 底部「演示账号：tea-admin / 123456」小字。
- 交互：空值校验、错误抖动 + Toast、成功跳 `redirect ?? /admin/dashboard`、登录中按钮 loading。
- 验收：错误密码不进入；登录后刷新页面仍在（sessionStorage）；返回键回 C 端商城而非退出 App。

### A2 概览看板
- 数据：`computeKpi(orders, now)` + `computeTrend` + `computeTop`。
- 分区：① 商家抬头（店铺名 + 营业状态 Tag）② 2×2 KPI 卡 ③ 7 日趋势折线（含日/金额切换，P1）④ 待办条（待发货 N → 订单页筛 paid）⑤ 热销 Top5 列表（点进商品编辑）。
- 状态：下拉刷新（重算）、空数据（极少）走默认 0。
- 验收：C 端模拟下单后角标与待发货数 +1；改价后"今日销售额"按快照价计算不受影响。

### A3 商品列表
- 数据：`getAdminProducts()`。
- 分区：sticky 头（标题 + 新建按钮）、搜索框、分类分段（全部/生茶/熟茶/柑普/器具）、商品卡列表（缩略图 56、名称、副题、价格、库存、`OTag`、`OSwitch`）。
- 交互：搜索 300ms debounce 本地过滤；开关切换即时 `showToast` + 持久化；点击卡进编辑；低库存卡左侧 3px 朱砂条。
- 空态：搜索无结果 → `OEmpty`「没有匹配的商品」+ 清空筛选。
- 验收：下架后 C 端商城不再出现；刷新后状态保持。

### A4 商品编辑
- 数据：`getAdminProduct(id)` + 覆盖层。
- 分区：基本信息（名称/副题/分类/单位）、价格与库存、规格动态行（`specs`，可增删）、简介多段（`story`，textarea 按行拆）、上架开关、底部固定「取消/保存」。
- 校验：价格 > 0 且 ≤ 99999；库存整数 ≥ 0；名称 2–20 字；错误内联在 `OFormItem` 下，不弹窗。
- 交互：保存 → 写覆盖层 → Toast「已保存」→ 返回列表；未保存离开时 `ODialog` 二次确认。
- 验收：改价保存后列表与 C 端详情同步；库存改 0 时自动置「缺货」并可选下架。

### A5 订单列表
- 数据：`orders` 按 `at` 倒序，状态筛选。
- 分区：sticky 头、`OSegmented`（全部 48 / 待付款 / 待发货 / 已发货 / 已完成 / 已取消）、订单卡（单号、时间、状态 Tag、前 2 行商品缩略 + "共 N 件"、金额、主操作按钮）。
- 交互：点击进详情；卡上直接「发货」（待发货态）打开 `ShipSheet`；上拉加载分页 10 条/页。
- 验收：筛选与分页组合正确；状态变更后卡片即时更新且列表不跳位。

### A6 订单详情
- 分区：单号与状态头、商品行（图/名/单价×数量/小计）、金额明细（商品合计/运费/实付）、收货信息（姓名/电话/地址 + 复制按钮）、备注、`OTimeline` 时间轴、底部操作栏（待发货 → 发货；已付款 → 取消/备注；已完成 → 无主操作）。
- 交互：发货 `ShipSheet` 填物流公司（圆通/中通/顺丰/EMS）+ 运单号（校验 8–20 位字母数字），成功后写 timeline 并 Toast。
- 验收：发货后列表状态同步；运单号可复制；时间轴顺序正确。

### A7 店铺设置
- 分组：店铺信息（名称/简介，编辑弹 `OSheet`）、营业状态（`OSwitch`，关闭后 C 端显示"休息中"角标，P1）、通知开关 ×2（仅本地开关 + Toast）、演示数据（重置 / 导出 JSON）、关于（版本 v1.0.1、技术栈、进入 C 端）、退出登录（二次确认 → 清 sessionStorage → 回登录页）。
- 验收：重置后订单回到 48 单初始态、商品价格恢复默认；退出后无法直达后台路由。

---

## 6. 开发计划

| 里程碑 | 内容 | 交付物 | 人日 |
|---|---|---|---|
| **M0 骨架** | 路由分支、AdminLayout、守卫、登录页、令牌补色 | 能进 `/admin` 看到空壳 + 4 Tab | 0.8 |
| **M1 数据层** | types、Mock 订单生成器、覆盖层、指标纯函数、3 个 store、持久化 | 控制台可跑通聚合数字；`metrics` 单测 | 1.2 |
| **M2 组件** | 12 组件 + 2 composable + 10 图标 | 组件在演示页可见、样式token化 | 1.6 |
| **M3 页面** | A2–A7 七个页面 | 完整可点流程 | 2.8 |
| **M4 手感与联调** | 下拉刷新/上拉加载/Sheet/骨架/空态/转场、返回键、C 端联动（含模拟下单） | 演示脚本跑通 | 1.2 |
| **M5 验收** | 截图证据、C 端 5 页回归、typecheck/build、文档更新 | 可交付 Demo + 文档 | 0.9 |

**合计 8.5 人日**（不含视觉设计；若沿用现有令牌，视觉增量 ≈ 0.5 人日）。

**3 天极限演示版**（若时间紧）：只做 A1 + A2（KPI + 待办，不做图表）+ A3 + A6（发货闭环）+ A7 的"重置数据"；组件只做 `OStatCard/OTag/OSwitch/OSheet/OTimeline` 5 个，列表不做分页（48 条全量）。可砍到 **2.5–3 人日**。

---

## 7. 验收清单

**功能**
- [ ] 未登录访问 `/admin/*` 跳登录，登录后可回原目标页
- [ ] 概览 4 个 KPI 与订单数据一致（抽样 3 单手工核对）
- [ ] 商品改价/改库存/上下架 → 刷新后仍生效，C 端同步
- [ ] 订单筛选 6 个状态计数与列表一致；分页无重复/无丢失
- [ ] 发货后状态、时间轴、待办数量三方一致
- [ ] 重置演示数据 → 回到初始 48 单
- [ ] 退出登录后直达后台路由被拦截

**数据**
- [ ] 同一 seed 生成订单可复现；今日订单数 > 0
- [ ] 非法 localStorage 内容不白屏（手工篡改为 `{}` / `"x"` 验证）
- [ ] 订单快照价：改价后历史订单金额不变

**交互**
- [ ] 下拉刷新、上拉加载、筛选组合在手机真机流畅
- [ ] Sheet 遮罩可关、Esc 可关、Android 返回键先关弹层
- [ ] 所有点击目标 ≥44px；开关有 `aria-checked`
- [ ] `prefers-reduced-motion` 下无动画卡顿

**工程**
- [ ] `npm run typecheck` 0 error；`npm run build` 成功
- [ ] 后台 chunk 独立懒加载，主包体积不变（≤ +2 KB）
- [ ] C 端 5 个页面回归：制茶选择/制作/商城/详情/购物车
- [ ] 后台 375/390/430 宽与 ≥520 桌面样机均正常

---

## 8. 风险与对策

| 风险 | 影响 | 对策 |
|---|---|---|
| 商品数据双写污染 C 端 | C 端价格错乱、刷新丢数据 | 只读源 + 覆盖层；禁止 import 后修改 `Product` 对象 |
| `App.vue` 全局改动波及 C 端 | 5 个页面回归失败 | 仅加 3 处 `admin` 判断；改完跑文末「回归清单」 |
| localStorage 版本升级 | 老数据引发运行时错误 | `.v1` 键 + 防御读取 + `resetAdminData` 兜底 |
| 同 APK 双角色混淆 | 演示时串端 | 登录态独立键、C 端不引用 order store；入口隐藏 |
| 图表自研超期 | 拖累 M2 | 先折线，柱/环降级为纯 CSS 条形 |
| 演示数据"像假数据" | 说服力不足 | 订单时间锚定今天、KPI 由聚合计算、含 1–2 个低库存与"今日新单" |
| 体积膨胀 | 首屏变慢 | 路由懒加载 + 不引第三方 UI/图表库 + 体积门禁 |
| 手机小屏表格难读 | 可用性差 | 一律卡片式列表，不做真表格；数字右对齐 |

---

## 9. 参考资料（均为 2026-11-16 联网核实）

**移动端组件库**（若最终不扩展 Oil UI 的备选）

| 库 | 版本 | 体积（min/gzip） | 说明 |
|---|---|---|---|
| [Vant 4](https://github.com/youzan/vant) | 4.10.2 | 251 KB / **81 KB**（全量） | Vue 3 移动端事实标准，按需引入，375 基准 |
| [NutUI 4](https://github.com/jdf2e/nutui) | 4.3.15-beta.1（latest 指向 beta） | 未测 | 京东风格，组件全，含业务组件 |
| [Varlet 3](https://github.com/varletjs/varlet) | 3.20.11（包名 `@varlet/ui`） | 未测 | Material 2/3 风格 |
| Arco Design Mobile | 无 Vue 版（只有 `mobile-react` 2.39.1） | — | 本项目不可用 |

**为什么不用 Vant**：能共存（peer 仅 `vue ^3`），但全量 81 KB gzip，按需也要额外引入一套 CSS 变量/图标/构建配置，与 Oil UI 并存的收益只有"少写几个组件"。本项目组件增量约 900 行、且风格必须与茶文化线稿一致 → **继续扩展 Oil UI**；Vant 只作为"交互范式"参考（其文档里列表、ActionSheet、PullRefresh 的交互细节最成熟）。

**后台模板架构参考**（学习目录与菜单/权限组织，PC 端为主）

| 仓库 | Stars | 许可 | 可借鉴 |
|---|---|---|---|
| [vue-pure-admin](https://github.com/pure-admin/vue-pure-admin) | 20.8k | MIT | 描述即"兼容移动端"；`layout` 按屏宽切 PC/移动容器，`router/remaining.ts` 常量路由 + 菜单转路由 |
| [vue-vben-admin](https://github.com/vbenjs/vue-vben-admin) | 33.6k | MIT | monorepo 分层、`access` 指令 + `meta.roles` 的按钮级权限抽象（本项目暂不需要） |
| [soybean-admin](https://github.com/soybeanjs/soybean-admin) | 15.3k | MIT | **最值得抄**：`enum` + 路由表（菜单即路由，天然可生成 TabBar）、`store` 按模块拆、`service` 请求层（换成 mock 即可） |
| [ant-design-pro](https://github.com/ant-design/ant-design-pro) | 39.0k | MIT | `config/routes` 集中式路由 + `access.ts`；Dashboard/列表/详情/表单的行业范式（React，只借信息架构） |
| [fantastic-admin/basic](https://github.com/fantastic-admin/basic) | 3.4k | MIT | 兼容 PC 与移动端的后台脚手架 |
| [vue3-vant-mobile](https://github.com/vue-zone/vue3-vant-mobile) | 2.1k | MIT | C 端 H5 模板，但 `layouts` + TabBar + keep-alive 缓存 + `stores` 模块化的页面组织可直接借 |

补充结论（调研所述）：GitHub 上 **没有 star 数可观、专注"移动端商家后台"的开源仓库**（搜索 `mobile admin vue`、`商家后台` 多为 0–30★ 练手项目）。因此：**架构抄 soybean-admin 的分层（router / enum / store / service→mock），交互范式抄 Vant 文档，组件继续用 Oil UI。**

**产品形态参考**（比仓库更有参考价值）：淘宝「千牛」、京东「京麦」、有赞「微商城 App」——共同点即本方案：**底部 4 Tab + 卡片列表 + 底部弹层操作 + 首页 KPI 看板**，不做 PC 式表格。移动端开源商家后台模板较少且质量参差，建议以产品形态为参照、架构以本工程为基准。

**图表库**：[ECharts 6.1.0](https://github.com/apache/echarts)、[Chart.js 4.6.1](https://github.com/chartjs/Chart.js)——P0 不引入。

---

## 附：改完必须回归的 C 端清单

| 页面 | 检查点 |
|---|---|
| `/craft` 选茶页 | TabBar 仍在、已制成标记、进入制作 |
| `/craft/:id` 制茶页 | 全屏无 TabBar、返回、原生返回键 |
| `/shop` 商城 | 商品数量、价格（合并层）、加购飞行动画 |
| `/shop/:id` 详情 | 价格、已制成提示、加购 |
| `/cart` 购物车 | 增减、删除撤销、结算（P1 会写订单） |
