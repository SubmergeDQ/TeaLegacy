# 商家端（预留）

> **状态：仅目录，暂无实现。** 落地方案待定，见 [docs/plans/](../../docs/plans/)。

## 这里放什么

商家管理后台的**页面与业务代码**。方案定稿前不要在此写代码——目录如何组织依赖选定的方案（A/B/C/D），见 `docs/plans/00-方案对比.md`。

## 选定方案后怎么落地

1. 在 `docs/DECISIONS.md` 的 D-001 打勾，写下结论。
2. 按对应方案文档（`docs/plans/01`~`04`）执行迁移，本目录随之调整。
3. 业务实现严格按 [docs/architecture/merchant-app.md](../../docs/architecture/merchant-app.md) 的章节推进（页面规格 → 数据层 → 组件 → 手感）。

## 预留子目录

| 目录 | 用途 |
|---|---|
| `views/` | 页面（登录、概览看板、商品列表/编辑、订单列表/详情、店铺设置） |
| `components/` | 商家端专用组件（商品卡、订单卡、发货弹层等） |
| `stores/` | Pinia：登录态、商品覆盖层、订单状态机 |
| `router/` | 商家端路由表（全部懒加载） |

数据层与 Mock 数据按开发文档放在 `src/catalog/admin/`（若选方案 C 再迁入 `packages/data`）。

## P0 页面清单

| 页面 | 路由（暂定） | 优先级 |
|---|---|---|
| 商家登录 | `/admin/login` | P0 |
| 概览看板 | `/admin/dashboard` | P0 |
| 商品列表 | `/admin/products` | P0 |
| 商品编辑 | `/admin/products/:id` | P0 |
| 订单列表 | `/admin/orders` | P0 |
| 订单详情 | `/admin/orders/:no` | P0 |
| 店铺设置 | `/admin/shop` | P0 |

> 路由前缀 `/admin` 为暂定值，方案 D（多入口）下可能改为 `/merchant` 或独立入口。

## 禁止事项

- 不要把商家端代码直接写进 `src/views/`、`src/stores/` 等用户端顶层目录（方案定稿后统一迁移，避免二次搬动）。
- 不要反向依赖用户端 view；只允许依赖共享层（Oil UI、设计令牌、`catalog` 数据）。
