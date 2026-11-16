# 商家端（Merchant）

> **状态：M0 骨架已落地（2026-11-16）。** 方案已定：A 单应用 + 路由分区，见 [docs/DECISIONS.md](../../docs/DECISIONS.md)。
> 页面内容按 [docs/architecture/merchant-app.md](../../docs/architecture/merchant-app.md) 逐页替换占位。

## 怎么进

| 方式 | 说明 |
|---|---|
| 首次启动 | 身份选择页 `/welcome` → 选「商家端」（选择结果存 localStorage，下次直接进） |
| 设置切换 | 用户端商城页齿轮 → 设置 → 进入商家端；商家端「我的」页可切回用户端 |
| 快捷入口 | 用户端商城页「普」印**长按 800ms** |
| 直接访问 | `#/welcome`、`#/admin/login`（Web / 调试） |
| 演示账号 | `tea-admin` / `123456`（登录页有「填入演示账号」按钮） |

登录态存 `sessionStorage`（键 `tea-legacy.admin.session.v1`），关闭应用即失效。

## 现有文件（M0）

```
src/merchant/
├─ router/index.ts            路由表：/admin/* 全部懒加载，meta: admin/tab/depth/title
├─ stores/adminAuth.ts        模拟登录态（本地校验，sessionStorage）
├─ components/ComingSoon.vue  M0 占位卡（标题 + 待办清单 + 说明）
└─ views/
   ├─ AdminLoginView.vue      登录页（已实现，含错误提示与 loading）
   ├─ AdminDashboardView.vue  概览（占位）
   ├─ AdminProductsView.vue   商品列表（占位）
   ├─ AdminProductEditView.vue 编辑商品（占位，depth 2）
   ├─ AdminOrdersView.vue     订单列表（占位）
   ├─ AdminOrderDetailView.vue 订单详情（占位，depth 2）
   └─ AdminShopView.vue       我的 / 店铺设置（占位）
```

## 与用户端的边界

- **允许**：依赖 `@/components/oil-ui`、`@/styles`、`@/utils`、`@/catalog`（只读数据）。
- **禁止**：反向 import 用户端 view / store；商家端数据写入统一走 `src/catalog/admin/`（覆盖层）。
- 外壳复用 `App.vue`：`tabItems` 按 `route.meta.admin` 切换；商家端一级页必须有 `meta.tab`，二级页 `meta.depth: 2`。

## 下一步（P0，按依赖顺序）

1. 数据层：`src/catalog/admin/`（types → 确定性 Mock 订单 → 指标纯函数 → 覆盖层与合并读取层）
2. 增量组件：`OTag/OSwitch/OStatCard/OSheet/OTimeline/OChartLine|Bar|Donut` 等
3. 页面：概览看板 → 商品列表/编辑 → 订单列表/详情 → 店铺设置
4. 与用户端联动：C 端模拟下单写入后台订单（P1，闭环演示关键）
5. 验收：见 [merchant-app.md](../../docs/architecture/merchant-app.md) 第 7 节
