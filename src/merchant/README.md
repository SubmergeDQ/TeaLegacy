# 商家端（Merchant）

> **状态：P0 已落地（2026-11-16）。** 方案 A 单应用 + 路由分区，见 [docs/DECISIONS.md](../../docs/DECISIONS.md)。
> 页面与数据口径按 [docs/architecture/merchant-app.md](../../docs/architecture/merchant-app.md) 实现。

## 怎么进

| 方式 | 说明 |
|---|---|
| 每次启动 | 身份选择页 `/welcome` → 选「商家端」（存 sessionStorage，关闭应用后需重新选） |
| 设置切换 | 用户端商城页齿轮 → 设置 → 进入商家端；商家端「我的」页可切回用户端 |
| 快捷入口 | 用户端商城页「普」印**长按 800ms** |
| 直接访问 | `#/welcome`、`#/admin/login`（Web / 调试） |
| 演示账号 | `tea-admin` / `123456`（登录页有「填入演示账号」按钮） |

登录态存 `sessionStorage`（键 `tea-legacy.admin.session.v1`），关闭应用即失效；登录成功会把本次会话身份置为商家端。

## 已实现（P0）

| 页面 | 能力 |
|---|---|
| 概览 `/admin/dashboard` | 4 张 KPI（今日销售额/订单/待发货/客单价）、近 7 日折线（含单日最高）、待发货直达、待办汇总（待付款/库存不足）、热销 Top5、下拉刷新 |
| 商品 `/admin/products` | 搜索（300ms 防抖）、状态分段（全部/在售/已下架/库存不足）、行内上下架、点价格就地改价（Enter 保存 / Esc 取消）、低库存朱砂条 |
| 商品编辑 `/admin/products/:id` | 名称/副题/单位/标签、价格与库存校验、规格动态行、简介多段、上架开关、库存流水、未保存离开确认 |
| 订单 `/admin/orders` | 6 段状态筛选（3×2 均分）、每页 10 条上拉加载与骨架、卡上直接发货、多选批量发货、已发货卡直出物流 |
| 订单详情 `/admin/orders/:no` | 商品行与金额、收货信息复制、物流、备注编辑、时间轴、发货/取消 |
| 库存总览 `/admin/inventory` | 在售/低库存汇总、低库存优先排序、行内入库/出库（弹层填数量）、最近流水 |
| 我的 `/admin/shop` | 店铺资料与营业状态、库存管理入口、通知开关、重置/导出演示数据、身份切换、退出登录 |

数据全部由 `src/catalog/admin/` 提供：只读源 + 覆盖层（改价/库存/上下架即时同步 C 端）、确定性 Mock 48 单、指标纯函数、三个 Pinia store。

## 目录

```
src/
├─ catalog/admin/               数据层
│  ├─ types.ts                  数据契约与口径常量
│  ├─ initial.ts                初始库存
│  ├─ mock/orders.ts            确定性 Mock 订单（种子 20261116）
│  ├─ metrics.ts                KPI / 趋势 / 热销（纯函数）
│  ├─ merge.ts                  只读源 + 覆盖层合并
│  ├─ storage.ts                localStorage 键与防御式读写
│  ├─ catalogStore.ts           商品覆盖层 store
│  ├─ ordersStore.ts            订单 store（发货/取消/备注/C 端流入）
│  ├─ shopStore.ts              店铺设置 store
│  ├─ read.ts                   C 端只读入口（不含订单与 Mock）
│  └─ index.ts                  商家端出口
├─ composables/                 usePullRefresh / useInfiniteScroll
├─ components/oil-ui/           OTag/OSwitch/OStatCard/OCell/OSearchBar/OSegmented/
│                               OSheet/OEmpty/OTimeline/OFormItem + charts/OChartLine
└─ merchant/
   ├─ router/index.ts           /admin/* 全部懒加载
   ├─ stores/adminAuth.ts       模拟登录态
   ├─ shipment.ts               物流公司、上次选择、预填运单号
   ├─ components/ShipSheet.vue  发货弹层（列表与详情共用）
   ├─ components/BatchShipSheet.vue 批量发货弹层
   └─ views/                    登录 + 7 个页面
```

## 与用户端的边界

- **允许**：商家端依赖 `@/components/oil-ui`、`@/styles`、`@/utils`、`@/catalog`（只读数据）。
- **禁止**：反向 import 用户端 view / store；商家端数据写入统一走 `src/catalog/admin/`（覆盖层）。
- C 端商城/详情改读 `@/catalog/admin/read`（改价、下架即时生效）；结算时写后台订单（状态 `paid`，待发货 +1），与「支付成功」和概览验收口径一致。

## 持久化键

| 键 | 内容 |
|---|---|
| `tea-legacy.admin.overrides.v1` | 商品覆盖层 |
| `tea-legacy.admin.orders.v1` | 订单（Mock 初始 + C 端流入） |
| `tea-legacy.admin.stocklog.v1` | 库存流水（保留 100 条） |
| `tea-legacy.admin.shop.v1` | 店铺设置 |
| `tea-legacy.admin.session.v1` | 登录态（sessionStorage） |

「我的 → 重置演示数据」会清空以上四个 localStorage 键并重新生成 48 单。

## 下一步（未做）

1. P1 页面：关于/演示说明（A12）
2. P2 页面：数据详情（分类占比环形图，A10）、评价/顾客（A11）
3. 订单卡与商品卡的行内快捷操作（改价、库存 ±），减少进出二级页
4. 验收补齐：真机手势手感、C 端 5 页回归、APK 打包
