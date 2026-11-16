# 开发指南（新设备上手）

> 换一台设备 clone 下来即可继续开发。**先读三份**：本文件、[DECISIONS.md](./DECISIONS.md)、[architecture/merchant-app.md](./architecture/merchant-app.md)。

## 1. 环境要求

| 项 | 要求 | 说明 |
|---|---|---|
| Node.js | ≥ 20（验证过 v24） | Vite 7 要求 |
| npm | 10+ | 无需 pnpm |
| Git | 任意较新版本 | — |
| JDK | 17–21（可选） | 打 APK 用；JDK 24 与 AGP 8.13 不兼容 |
| Android SDK | compileSdk 36 / minSdk 24（可选） | 打 APK 用 |

**不需要后端、数据库或账号体系**；演示数据全在本机（Mock + localStorage）。

## 2. 克隆与启动

```bash
git clone https://github.com/SubmergeDQ/TeaLegacy.git
cd TeaLegacy
npm install
npm run dev        # http://localhost:5173
```

首次打开会进入身份选择页 `#/welcome`：

- 选「用户端」→ 制茶 / 商城
- 选「商家端」→ 登录页（账号 `tea-admin` / 密码 `123456`）

> Node 依赖请放在**正常文件系统**里安装。Android 的 `/sdcard`（FUSE）不支持 npm 需要的符号链接，会安装失败。

## 3. 常用脚本

| 命令 | 作用 |
|---|---|
| `npm run dev` | 开发服务（含商家端路由） |
| `npm run typecheck` | `vue-tsc` 严格类型检查（**提交前必跑**） |
| `npm run build` | 类型检查 + 生产构建到 `dist/` |
| `npm run preview` | 预览构建产物 |
| `npm run android:sync` | 构建 + `cap sync android` |
| `npm run android:apk` | 打 debug APK |

## 4. 目录地图

| 目录 | 归属 | 内容 |
|---|---|---|
| `src/views/`、`src/components/shop|craft/`、`src/stores/`、`src/router/` | 用户端 | 制茶、商城、购物车 |
| `src/components/oil-ui/`、`src/styles/`、`src/utils/`、`src/catalog/` | 共享 | 组件库、设计令牌、数据 |
| `src/stores/appRole.ts`、`src/components/RoleSwitcher.vue`、`src/views/WelcomeView.vue` | 共享 | 身份选择与切换 |
| `src/merchant/` | **商家端** | 路由 / 页面 / 商家端组件 / 登录态 |
| `src/catalog/admin/` | 商家端（待建） | 数据契约、Mock、指标、合并读取层 |
| `docs/` | 全部 | 架构、方案、决策、开发指南 |
| `android/` | 用户端壳 | Capacitor 原生工程 |

## 5. 身份与入口

| 场景 | 行为 |
|---|---|
| 每次启动 | 先到 `/welcome` 选身份；结果存 `sessionStorage`（关闭应用失效，下次重新选） |
| 用户端切换 | 商城页右上角齿轮 → 设置 → 身份面板 |
| 商家端切换 | 「我的」页 → 身份面板 |
| 快捷入口 | 商城页「普」印**长按 800ms** |
| 未登录 | 直达 `/admin/*` 会被守卫拦到登录页（带 redirect 回跳） |

## 6. 当前进度（2026-11-16）

- ✅ 用户端（制茶 + 商城 + 购物车，可打 APK v1.0.1）
- ✅ 仓库按两端整理、文档体系与方案定稿（方案 A）
- ✅ 商家端 M0 骨架：登录 / 守卫 / 4 个 Tab / 2 个二级页占位 / 返回键
- ✅ 首次启动身份选择 + 两端设置内切换
- ⏳ 商家端 P0 功能未开发（见下节顺序）

## 7. 继续开发的顺序（P0）

每步完成标准：`typecheck` + `build` 通过、用户端 5 页回归、文档同步。

1. **数据层** `src/catalog/admin/`：`types.ts` → `mock/orders.ts`（确定性 48 单）→ `metrics.ts`（KPI/趋势纯函数）→ `index.ts`（只读源 + 覆盖层合并读取）
2. **增量组件** `src/components/oil-ui/`：`OTag / OSwitch / OStatCard / OCell / OSearchBar / OSegmented / OSheet / OEmpty / OTimeline / OFormItem` + `charts/` 三个自绘 SVG 图 + `usePullRefresh / useInfiniteScroll`
3. **概览看板** `src/merchant/views/AdminDashboardView.vue`（KPI 四宫格 + 7 日折线 + 待办 + 热销 Top5）
4. **商品** `AdminProductsView.vue`（列表/筛选/上下架）+ `AdminProductEditView.vue`（价格/库存/文案/保存校验）
5. **订单** `AdminOrdersView.vue`（状态分段 + 分页）+ `AdminOrderDetailView.vue`（明细/时间轴/发货）
6. **店铺设置** 替换 `AdminShopView.vue` 里的「待开发」清单（资料/通知/演示数据重置）
7. **联动（P1，演示亮点）** `src/views/CartView.vue` 结算时调用后台订单 store，新增一条待付款订单

## 8. 代码约定

- 提交信息：`feat: / fix: / chore: / docs:` + 中文说明，一次提交只做一件事。
- **商家端边界**：可 import `@/components/oil-ui`、`@/styles`、`@/utils`、`@/catalog`、`@/stores/appRole`、`@/merchant/**`；**禁止反向 import 用户端 view / store**。
- 路由 `meta` 约定：`admin`（属商家端）、`tab`（一级 Tab key）、`depth`（1 一级 / 2 次级）、`title`。
- 数据写入只走覆盖层（`src/catalog/admin/`），**不要直接改** `src/catalog/shop/products/*`。
- 新增决策先写 [DECISIONS.md](./DECISIONS.md)，再改代码。
- 不提交 `node_modules/`、`dist/`、大图；设计截图放 `docs/design/`。

## 9. 常见问题

| 现象 | 处理 |
|---|---|
| 在 `/sdcard` 下 `npm install` 失败 | 换到内部存储（正常文件系统）再装 |
| `gradlew assembleDebug` 报 JDK 不兼容 | 用 JDK 17–21（Temurin 21 验证过） |
| 首屏字体很慢 / 想瘦身 | 字体是本地分片（约 110 个 woff2），属于预期；商家端页面未引入衬线字体 |
| 换设备后没有截图目录 | 截图不是仓库产物，需要本机装 Chromium（或设 `CHROME_PATH`） |
| 想重置演示数据 | P0 完成后在「我的 → 演示数据」；当前清 localStorage 即可 |

## 10. 文档索引

| 文档 | 用途 |
|---|---|
| [DECISIONS.md](./DECISIONS.md) | 已定方案与历史决策（先看这个） |
| [architecture/user-app.md](./architecture/user-app.md) | 用户端技术栈、目录、适配、打包 |
| [architecture/merchant-app.md](./architecture/merchant-app.md) | 商家端完整开发文档（页面/数据/组件/里程碑/验收） |
| [plans/00-方案对比.md](./plans/00-方案对比.md) | 四个落地方案与迁移路径（A 已选） |
| [README.md](./README.md) | 文档索引与约定 |
