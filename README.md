# 茶承 TeaLegacy

> 以「普洱茶非遗文化」为主题的移动端演示项目：**一个仓库，两端**。
> 用户端（已完成）+ 商家管理后台（M0 骨架已落地，方案 A）。

```
用户端：制茶互动 → 成茶票签 → 茶事商城 → 购物车结算   （Vue 3 H5 + Capacitor APK，已实现）
商家端：登录 → 概览看板 → 商品/订单/库存管理 → 店铺设置 （离线演示、手机优先，骨架已通）
```

## 仓库结构

```
TeaLegacy/
├─ src/                         应用源码
│  ├─ views/WelcomeView.vue     首次启动的身份选择页
│  ├─ stores/appRole.ts         当前身份（用户端 / 商家端，localStorage）
│  ├─ components/RoleSwitcher.vue 身份切换面板（两端设置共用）
│  └─ merchant/                 ★ 商家端（方案 A：同一应用内的路由分区）
│     ├─ router/                路由表 /admin/*（全部懒加载）
│     ├─ stores/adminAuth.ts    模拟登录态
│     ├─ components/            ComingSoon 等商家端组件
│     └─ views/                 登录 + 6 个页面（4 个一级 Tab + 2 个二级页）
├─ docs/
│  ├─ README.md                 文档索引
│  ├─ architecture/
│  │  ├─ user-app.md            用户端架构说明（技术栈/目录/适配/路由/打包）
│  │  └─ merchant-app.md        商家端开发文档（页面规格/数据层/里程碑/验收）
│  ├─ plans/                    落地方案对比与 4 个方案细节（A 已选定）
│  ├─ DECISIONS.md              决策记录（D-001～D-004 已定稿）
│  └─ design/                   设计过程记录约定
├─ android/                     Capacitor 原生壳
├─ .github/workflows/           Android CI
└─ index.html / vite.config.ts / capacitor.config.ts
```

## 当前状态

| 部分 | 状态 | 说明 |
|---|---|---|
| 用户端 | ✅ 已实现 | 7 款普洱制茶互动 + 商城 + 购物车，可打 APK（v1.0.1） |
| 身份 | ✅ 已实现 | 首次启动选择用户端 / 商家端；两端设置里可随时切换 |
| 商家端 | 🧱 M0 骨架 | 登录 / 守卫 / 4 个 Tab / 2 个二级页占位 / 返回键 / 隐藏入口 |
| 文档 | ✅ 已就绪 | 架构说明 + 开发文档 + 方案定稿 |

## 身份与入口

- **首次启动**：进入身份选择页，选「用户端」或「商家端」；选择结果存 localStorage，下次启动直接进上次的身份。
- **随时切换**：用户端商城页右上角**齿轮 → 设置 → 进入商家端 / 重新选择身份**；商家端「我的」页有同样的切换面板。
- **快捷入口**：商城页「普」印**长按 800ms** 直接进商家端（演示用）。
- **商家端登录**：`tea-admin` / `123456`（登录页有「填入演示账号」按钮）；登录态存 sessionStorage，关闭应用即失效。
- **直接访问**：`#/welcome`、`#/admin/login`（Web / 调试）。

## 已定方案（2026-11-16）

| 编号 | 决策 | 结论 |
|---|---|---|
| D-001 | 落地方式 | **A 单应用 + 路由分区**（`/admin/*` + `src/merchant/`） |
| D-002 | UI 组件 | 扩展内置 Oil UI（不引第三方） |
| D-003 | 图表 | 自绘 SVG（折线/柱/环） |
| D-004 | 分发 | 单 APK 双身份（隐藏入口 + 模拟登录） |

方案对比与 B/C/D 的迁移路径保留在 [docs/plans/](./docs/plans/)，供后续复盘；决策记录见 [docs/DECISIONS.md](./docs/DECISIONS.md)。

## 快速开始

```bash
npm install
npm run dev        # http://localhost:5173   （商家端加 #/admin/login）
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

- 用户端：[docs/architecture/user-app.md](./docs/architecture/user-app.md)
- 商家端：[docs/architecture/merchant-app.md](./docs/architecture/merchant-app.md)
- 方案：[docs/plans/](./docs/plans/)
- 决策：[docs/DECISIONS.md](./docs/DECISIONS.md)

## License

MIT，见 [LICENSE](./LICENSE)。
