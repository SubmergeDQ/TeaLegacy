# 方案 C：pnpm monorepo（apps + packages）

> 状态：候选（工程化最规范，成本最高）｜一次性工期 3.5–4 天
> 一句话：拆成两个可独立构建、独立发版的应用，共享包版本化。

## 目标结构

```
TeaLegacy/
├─ pnpm-workspace.yaml
├─ package.json                 # 根：脚本编排（dev:store / dev:merchant / build:all）
├─ apps/
│  ├─ store/                    # 用户端（现 src/ 全量迁入）
│  │  ├─ src/  index.html  vite.config.ts  capacitor.config.ts
│  │  └─ android/
│  └─ merchant/                 # 商家端（新）
│     ├─ src/  index.html  vite.config.ts  capacitor.config.ts
│     └─ android/               # 独立原生壳（可选）
├─ packages/
│  ├─ ui/                       # Oil UI（含 icons / toast）
│  ├─ data/                     # catalog + types + mock + 合并读取层
│  ├─ tokens/                   # SCSS / CSS 设计令牌
│  └─ config/                   # 共享 vite / ts / postcss 配置（可选）
├─ docs/  .github/workflows/
```

## 迁移步骤

1. 引入 pnpm，建 `pnpm-workspace.yaml` 与根脚本
2. 建 `packages/{ui,data,tokens}`：把现有 `oil-ui / catalog / styles` 抽成包，导出 `@tealegacy/ui`、`@tealegacy/data`、`@tealegacy/tokens`
3. `git mv` 现有应用 → `apps/store`，改 `vite.config.ts` 别名指向 workspace 包
4. 新建 `apps/merchant`（独立 vite + 路由 + 空壳 + 自己的 `index.html`）
5. 字体与静态资源：`@fontsource` 依赖只放 `apps/store`，商家端不引衬线字体（用 sans，省约 5.9 MB）
6. CI：`.github/workflows/android.yml` 改 matrix（store / merchant 两个 job）
7. 双包构建验证 + 用户端回归 + 文档路径更新

## 构建与分发

```bash
pnpm -F @tealegacy/store build
pnpm -F @tealegacy/merchant build
```

- 两个 APK：`appId` 分别为 `com.tealegacy.app` / `com.tealegacy.merchant`
- 或商家端只做 Web 部署（给运营用浏览器打开）
- 共享包改动后两端同步生效

## 优点 / 代价

**优点**：彻底隔离；可独立发版、独立加人；共享层可版本化；商家端可以完全不带衬线字体与制茶场景代码。
**代价**：工程复杂度最高；Capacitor 原生壳、字体、CI 都要维护两份；演示与回归成本翻倍；对当前单人演示项目偏重。

## 何时该选

- 商家端要独立上架应用商店，或长期给运营独立更新
- 团队从 1 人变多人、需要并行开发
- 商家端页面数超过 15 个、体积需要严格控制

## 验收

- [ ] 两个应用可独立 `dev` / `build`
- [ ] 共享包改动后两端同步生效
- [ ] CI 能分别产出两个 APK
- [ ] 用户端功能与演示体验无变化

## 风险

`android/` 原生工程搬迁容易漏改（`settings.gradle`、`strings.xml`、图标、签名）；建议先只拆 Web，原生壳迁移单独一阶段验证。
