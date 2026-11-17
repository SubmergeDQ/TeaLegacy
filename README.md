# 茶承 TeaLegacy

> 以「普洱茶非遗文化」为主题的移动端演示项目：**一个仓库，两端**。
> 用户端（已完成）+ 商家管理后台（P0 已落地，方案 A）。

```
用户端：制茶互动 → 成茶票签 → 茶事商城 → 购物车结算   （Vue 3 H5 + Capacitor APK，已实现）
商家端：登录 → 概览看板 → 商品/订单/库存管理 → 店铺设置 （离线演示、手机优先，P0 已通）
```

## 仓库结构

```
TeaLegacy/
├─ src/                         应用源码
│  ├─ views/WelcomeView.vue     首次启动的身份选择页
│  ├─ stores/appRole.ts         当前身份（用户端 / 商家端，localStorage）
│  ├─ components/RoleSwitcher.vue 身份切换面板（两端设置共用）
│  ├─ catalog/admin/            ★ 商家端数据层（覆盖层 / Mock 订单 / 指标 / store）
│  ├─ composables/              下拉刷新、上拉加载
│  ├─ components/oil-ui/        Oil UI 组件（商家端增量：OTag/OSwitch/OSheet/图表等）
│  └─ merchant/                 ★ 商家端（方案 A：同一应用内的路由分区）
│     ├─ router/                路由表 /admin/*（全部懒加载）
│     ├─ shipment.ts            物流公司 / 预填运单号
│     ├─ components/            ShipSheet / BatchShipSheet 等商家端组件
│     └─ views/                 概览 / 商品 / 商品编辑 / 订单 / 详情 / 库存 / 我的
├─ docs/
│  ├─ README.md                 文档索引
│  ├─ DEVELOPMENT.md            开发指南（新设备上手 / 目录 / P0 顺序 / 约定）
│  ├─ architecture/
│  │  ├─ user-app.md            用户端架构说明（技术栈/目录/适配/路由/打包）
│  │  └─ merchant-app.md        商家端开发文档（页面规格/数据层/里程碑/验收）
│  ├─ plans/                    落地方案对比与 4 个方案细节（A 已选定）
│  ├─ DECISIONS.md              决策记录（D-001～D-004 已定稿）
│  └─ design/                   设计过程记录约定
├─ CHANGELOG.md                 变更记录（按日期）
├─ android/                     Capacitor 原生壳
├─ .github/workflows/           Android CI
└─ index.html / vite.config.ts / capacitor.config.ts
```

## 当前状态

| 部分 | 状态 | 说明 |
|---|---|---|
| 用户端 | ✅ 已实现 | 7 款普洱制茶互动 + 商城 + 购物车，可打 APK（v1.1.1） |
| 身份 | ✅ 已实现 | 首次启动选择用户端 / 商家端；两端设置里可随时切换 |
| 商家端 | ✅ P0 已落地 | 概览看板 / 商品列表与编辑 / 订单列表与详情（发货、取消、备注）/ 店铺设置；Mock 数据层 + C 端下单闭环 |
| 文档 | ✅ 已就绪 | 架构说明 + 开发文档 + 方案定稿 |

## 身份与入口

- **每次启动**：先进入身份选择页，选「用户端」或「商家端」；本次会话内有效（sessionStorage），关闭应用后下次重新选择。
- **随时切换**：用户端商城页右上角**设置 → 进入商家端 / 重新选择身份**；商家端「我的」页有同样的切换面板。
- **快捷入口**：商城页「普」印**长按 800ms** 直接进商家端（演示用）。
- **无密码登录**：选择「商家端」或切换身份后直接进入概览，不再输入账号密码。
- **直接访问**：`#/welcome`、`#/admin/dashboard`（Web / 调试）。

## 已定方案（2026-11-16）

| 编号 | 决策 | 结论 |
|---|---|---|
| D-001 | 落地方式 | **A 单应用 + 路由分区**（`/admin/*` + `src/merchant/`） |
| D-002 | UI 组件 | 扩展内置 Oil UI（不引第三方） |
| D-003 | 图表 | 自绘 SVG（折线/柱/环） |
| D-004 | 分发 | 单 APK 双身份（隐藏入口 + 无密码进入） |

方案对比与 B/C/D 的迁移路径保留在 [docs/plans/](./docs/plans/)，供后续复盘；决策记录见 [docs/DECISIONS.md](./docs/DECISIONS.md)。

## 快速开始

```bash
npm install
npm run dev        # http://localhost:5173   （商家端加 #/admin/dashboard）
npm run typecheck  # vue-tsc 类型检查
npm run build      # 类型检查 + 生产构建（dist/）
```

## 打包 APK

```bash
npm run build
npx cap sync android
cd android && ./gradlew assembleDebug
# 产物：android/app/build/outputs/apk/debug/app-debug.apk
```

环境要求：JDK 17–21（验证过 Temurin 21，JDK 24 不兼容 AGP）、Android SDK（compileSdk 36 / minSdk 24）、首次构建需联网下载 Gradle 依赖。

## 文档

- 开发指南（新设备先读）：[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)
- 用户端：[docs/architecture/user-app.md](./docs/architecture/user-app.md)
- 商家端：[docs/architecture/merchant-app.md](./docs/architecture/merchant-app.md)
- 方案：[docs/plans/](./docs/plans/)
- 决策：[docs/DECISIONS.md](./docs/DECISIONS.md)
- 变更记录：[CHANGELOG.md](./CHANGELOG.md)

## License

MIT，见 [LICENSE](./LICENSE)。
