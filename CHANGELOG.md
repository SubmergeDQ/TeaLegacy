# 变更记录

## 2026-11-16

### 仓库整理：按用户端 / 商家端拆分

- 根 README 精简为两端总览；用户端说明归档到 `docs/architecture/user-app.md`
- 新增文档体系：`docs/architecture/`、`docs/plans/`、`docs/DECISIONS.md`、`docs/design/`
- 预留 `src/merchant/` 商家端目录；移除仅含忽略配置的遗留 `.oil-ui/`

### 商家端方案定稿（方案 A）

- D-001 单应用 + 路由分区（`/admin/*` + `src/merchant/`）
- D-002 扩展内置 Oil UI（不引第三方 UI 库）
- D-003 图表自绘 SVG（0 依赖）
- D-004 单 APK 双身份

### 商家端 M0 骨架

- 路由表 `/admin/*` 全部懒加载；登录守卫（含 redirect 回跳）
- 登录页（本地校验 `tea-admin` / `123456`，sessionStorage 登录态）
- 概览 / 商品 / 订单 / 我的 4 个一级 Tab + 商品编辑 / 订单详情 2 个二级页（占位）
- `App.vue` 按 `meta.admin` 切换底部导航；图标 +chart/box/receipt/store
- 返回键按分区回退；用户端「普」印长按 800ms 快捷进商家端

### 身份选择与切换

- 每次启动进入 `/welcome` 选择用户端 / 商家端（sessionStorage，关闭应用后重新选择）
- 两端「设置」内可切换身份或重新选择（`RoleSwitcher`）
- 根路由按当前身份重定向；商家端「我的」页可用（身份切换 + 退出登录）

### 文档

- 新增 `docs/DEVELOPMENT.md`（新设备上手 / 目录地图 / P0 开发顺序 / 约定）
- 新增 `docs/architecture/merchant-app.md`（商家端开发文档）
- 新增 `docs/plans/00~04`（四个方案与对比）

## 2026-10-28 ~ 2026-11-15（用户端）

- v1.0.1：支持直接点击/按住图版推进制茶；GitHub Actions 打 APK
- 七款普洱互动制茶、茶事商城、购物车与模拟结算
