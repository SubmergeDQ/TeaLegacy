# 茶承 TeaLegacy

> 以「普洱茶非遗文化」为主题的移动端演示项目：**一个仓库，两端**。
> 用户端（已完成）+ 商家管理后台（预留，落地方案待选）。

```
用户端：制茶互动 → 成茶票签 → 茶事商城 → 购物车结算   （Vue 3 H5 + Capacitor APK，已实现）
商家端：登录 → 概览看板 → 商品/订单/库存管理 → 店铺设置 （离线演示、手机优先，待开发）
```

## 仓库结构

```
TeaLegacy/
├─ src/                     用户端全部源码（当前实现）
│  └─ merchant/             商家端预留目录（仅有说明，暂无代码）
├─ docs/
│  ├─ README.md             文档索引
│  ├─ architecture/
│  │  ├─ user-app.md        用户端架构说明（技术栈/目录/适配/路由/打包）
│  │  └─ merchant-app.md    商家端开发文档（页面规格/数据层/里程碑/验收）
│  ├─ plans/                ★ 商家端落地方案（4 选 1，待定）
│  │  ├─ 00-方案对比.md
│  │  ├─ 01-方案A-单应用路由分区.md
│  │  ├─ 02-方案B-单应用顶层分区.md
│  │  ├─ 03-方案C-pnpm-monorepo.md
│  │  └─ 04-方案D-Vite多入口.md
│  ├─ DECISIONS.md          决策记录（ADR，待填写）
│  └─ design/               设计过程记录约定
├─ android/                 Capacitor 原生壳（用户端）
├─ .github/workflows/       Android CI
└─ index.html / vite.config.ts / capacitor.config.ts
```

## 当前状态

| 部分 | 状态 | 说明 |
|---|---|---|
| 用户端 | ✅ 已实现 | 7 款普洱制茶互动 + 商城 + 购物车，可打 APK（v1.0.1） |
| 商家端 | ⏳ 预留 | 目录 `src/merchant/` 已建；方案未选，暂不写代码 |
| 文档 | ✅ 已就绪 | 架构说明 + 开发文档 + 4 个候选方案 |

## ⚠️ 待决策：商家端方案

商家端如何落地还没定，**请看 [docs/plans/00-方案对比.md](./docs/plans/00-方案对比.md)**，四个候选：

- **A 单应用 + 路由分区**（推荐，0.5 天落骨架）
- **B 单应用 + 顶层分区**（1.5 天）
- **C pnpm monorepo 双应用**（3.5–4 天）
- **D Vite 多入口双页面**（2 天）

选定后：在 [docs/DECISIONS.md](./docs/DECISIONS.md) 打勾并写结论，再按对应方案文档执行。
同期还需定：UI 组件（扩展 Oil UI / Vant 4）、图表（自绘 SVG / Chart.js / ECharts）、分发形态（单 APK 双身份 / 独立商家 APK / 纯 Web）。

## 快速开始

```bash
npm install
npm run dev        # http://localhost:5173
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
